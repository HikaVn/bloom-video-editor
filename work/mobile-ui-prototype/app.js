const statusLog = [];
const redoLog = [];
const routineStorageKey = "bloom.video-editor.routines";
const filterPreviewClasses = ["preview-warm", "preview-lavender", "preview-beige"];
const photoStylePresets = {
  natural: { brightness: 0, saturate: 0, sepia: 0, hue: 0, blur: 0 },
  clear: { brightness: 6, saturate: -4, sepia: 0, hue: -8, blur: 0 },
  soft: { brightness: 5, saturate: 2, sepia: 4, hue: 4, blur: 0.18 },
  film: { brightness: -5, saturate: -12, sepia: 13, hue: -6, blur: 0 },
};
let routines = [];
let exportTimer = null;
let activeEditorMode = "video";
let activePhotoStyle = "natural";
let activePhotoFilter = "none";
let mediaObjectUrl = null;

const phones = document.querySelectorAll(".phone[data-view]");
const viewTargetButtons = document.querySelectorAll("[data-view-target]");
const editorStatus = document.querySelector(".editor-caption");
const editorPhoto = document.querySelector(".editor-photo");
const historyList = document.querySelector(".history-list");
const historyCount = document.querySelector(".history-count");
const routineForm = document.querySelector(".routine-form");
const routineName = document.querySelector(".routine-name");
const routineSave = document.querySelector(".routine-save");
const routineList = document.querySelector(".routine-list");
const routineCount = document.querySelector(".routine-count");
const exportSheet = document.querySelector("[data-export-sheet]");
const exportButton = document.querySelector(".js-export");
const exportClose = document.querySelector(".sheet-close");
const exportStart = document.querySelector(".export-start");
const exportOptions = document.querySelectorAll(".export-option");
const catalogTabs = document.querySelectorAll(".catalog-tab");
const catalogSections = document.querySelectorAll("[data-catalog-section]");
const selectableCards = document.querySelectorAll(".filter-card, .stamp-card, .title-card, .grade-card");
const projectCards = document.querySelectorAll(".project-card");
const templateItems = document.querySelectorAll(".template-item");
const createCards = document.querySelectorAll(".create-card");
const modeTabs = document.querySelectorAll(".mode-tab");
const videoPanels = document.querySelectorAll("[data-video-panel]");
const photoPanel = document.querySelector(".photo-adjust-panel");
const photoSliders = document.querySelectorAll(".photo-slider");
const photoStyleButtons = document.querySelectorAll(".style-chip");
const photoActionButtons = document.querySelectorAll("[data-photo-action]");
const beforeAfterButton = document.querySelector(".js-before-after");
const dashboardKicker = document.querySelector(".dashboard-kicker");
const scriptTitle = document.querySelector(".script-title");
const dashboardMetrics = document.querySelectorAll(".dashboard-grid span");
const mediaInput = document.querySelector(".media-input");
const previewImage = document.querySelector(".preview-image");
const previewVideo = document.querySelector(".preview-video");
const importButtons = document.querySelectorAll("[data-import-media]");
const savePhotoButton = document.querySelector(".save-photo");

function normalizeLabel(text) {
  return text.trim().replace(/\s+/g, " ");
}

function getActionLabel(element) {
  return element.dataset.actionLabel || normalizeLabel(element.innerText);
}

function switchView(viewName) {
  phones.forEach((phone) => {
    const isActive = phone.dataset.view === viewName;
    phone.classList.toggle("active", isActive);
    phone.setAttribute("aria-hidden", String(!isActive));
  });

  viewTargetButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.viewTarget === viewName);
  });
}

function pushAction(label) {
  statusLog.push(label);
  redoLog.length = 0;
  editorStatus.textContent = label;
  renderHistory();
}

function setStatus(label) {
  editorStatus.textContent = label;
}

function setDashboardLabels(modeName) {
  dashboardKicker.textContent = modeName === "photo" ? "Photo Edit" : "Preview";
  scriptTitle.textContent = modeName === "photo" ? "Bloom photo" : "Good day";
  editorStatus.textContent = modeName === "photo" ? "写真をきれいに調整できます" : "読み込んだ素材をここで確認";

  const labels = modeName === "photo"
    ? ["明るさ", "美肌", "比率"]
    : ["Beauty", "比較", "BGM"];
  const captions = modeName === "photo"
    ? ["light", "smooth", "crop"]
    : ["natural", "before", "audio"];

  dashboardMetrics.forEach((metric, index) => {
    metric.innerHTML = `<b>${labels[index]}</b>${captions[index]}`;
  });
}

function setEditorMode(modeName) {
  activeEditorMode = modeName;
  const isPhotoMode = modeName === "photo";

  modeTabs.forEach((tab) => {
    const isActive = tab.dataset.editorMode === modeName;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  videoPanels.forEach((panel) => {
    panel.hidden = isPhotoMode;
  });
  photoPanel.hidden = !isPhotoMode;
  editorPhoto.classList.toggle("photo-mode", isPhotoMode);
  editorPhoto.classList.remove("photo-original");
  setDashboardLabels(modeName);
  updatePhotoFilter();
}

function updatePhotoFilter() {
  const values = [...photoSliders].reduce((result, slider) => {
    result[slider.dataset.filter] = Number(slider.value);
    return result;
  }, {});
  const preset = photoStylePresets[activePhotoStyle] || photoStylePresets.natural;
  const brightness = 1 + ((values.brightness || 0) + preset.brightness) / 100;
  const saturate = 1 + ((values.clarity || 0) + preset.saturate) / 100;
  const sepia = Math.max(0, ((values.warmth || 0) + preset.sepia) / 100);
  const hue = (values.warmth || 0) * 0.6 + preset.hue;
  const blur = Math.max(0, ((values.smooth || 0) / 120) + preset.blur);
  activePhotoFilter = [
    `brightness(${brightness.toFixed(2)})`,
    `saturate(${saturate.toFixed(2)})`,
    `sepia(${sepia.toFixed(2)})`,
    `hue-rotate(${hue.toFixed(1)}deg)`,
    `blur(${blur.toFixed(2)}px)`,
  ].join(" ");

  editorPhoto.style.setProperty("--photo-brightness", brightness.toFixed(2));
  editorPhoto.style.setProperty("--photo-saturate", saturate.toFixed(2));
  editorPhoto.style.setProperty("--photo-sepia", sepia.toFixed(2));
  editorPhoto.style.setProperty("--photo-hue", `${hue.toFixed(1)}deg`);
  editorPhoto.style.setProperty("--photo-blur", `${blur.toFixed(2)}px`);
}

function revokeMediaUrl() {
  if (mediaObjectUrl) {
    URL.revokeObjectURL(mediaObjectUrl);
    mediaObjectUrl = null;
  }
}

function openMediaPicker(mediaType) {
  const targetType = mediaType === "current" ? activeEditorMode : mediaType;
  mediaInput.dataset.mediaType = targetType;
  mediaInput.accept = targetType === "video" ? "image/*,video/*" : "image/*";
  mediaInput.value = "";
  mediaInput.click();
}

function showImagePreview(file) {
  revokeMediaUrl();
  mediaObjectUrl = URL.createObjectURL(file);
  previewImage.src = mediaObjectUrl;
  previewImage.hidden = false;
  previewVideo.hidden = true;
  previewVideo.removeAttribute("src");
  previewVideo.load();
  editorPhoto.classList.add("has-media");
  editorPhoto.classList.remove("has-video", "photo-original");
  savePhotoButton.disabled = false;
  setEditorMode("photo");
  setStatus(`${file.name}を読み込みました`);
}

function showVideoPreview(file) {
  revokeMediaUrl();
  mediaObjectUrl = URL.createObjectURL(file);
  previewVideo.src = mediaObjectUrl;
  previewVideo.hidden = false;
  previewImage.hidden = true;
  previewImage.removeAttribute("src");
  editorPhoto.classList.add("has-media", "has-video");
  editorPhoto.classList.remove("photo-original");
  savePhotoButton.disabled = true;
  setEditorMode("video");
  setStatus(`${file.name}を読み込みました`);
}

function handleMediaFile(file) {
  if (!file) {
    return;
  }

  if (file.type.startsWith("image/")) {
    showImagePreview(file);
    pushAction("写真を読み込みました");
    return;
  }

  if (file.type.startsWith("video/")) {
    showVideoPreview(file);
    pushAction("動画を読み込みました");
    return;
  }

  setStatus("写真または動画ファイルを選んでください");
}

function saveEditedPhoto() {
  if (previewImage.hidden || !previewImage.complete || !previewImage.naturalWidth) {
    setStatus("先に写真を選んでください");
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = previewImage.naturalWidth;
  canvas.height = previewImage.naturalHeight;
  const context = canvas.getContext("2d");
  context.filter = editorPhoto.classList.contains("photo-original") ? "none" : activePhotoFilter;
  context.drawImage(previewImage, 0, 0, canvas.width, canvas.height);

  const link = document.createElement("a");
  link.download = `bloom-photo-${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  pushAction("編集した写真を保存しました");
}

function renderHistory() {
  historyList.replaceChildren();
  historyCount.textContent = `${statusLog.length}件`;
  routineSave.disabled = statusLog.length === 0;

  if (!statusLog.length) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty";
    emptyItem.textContent = "まだ操作はありません";
    historyList.append(emptyItem);
    return;
  }

  statusLog.slice(-3).reverse().forEach((label) => {
    const item = document.createElement("li");
    item.textContent = label;
    historyList.append(item);
  });
}

function loadRoutines() {
  try {
    const storedRoutines = JSON.parse(localStorage.getItem(routineStorageKey) || "[]");
    if (Array.isArray(storedRoutines)) {
      routines = storedRoutines
        .filter((routine) => {
          return routine && typeof routine.name === "string" && Array.isArray(routine.actions);
        })
        .map((routine) => ({
          ...routine,
          actions: routine.actions.filter((action) => typeof action === "string"),
        }))
        .filter((routine) => routine.actions.length)
        .slice(0, 5);
    }
  } catch {
    routines = [];
  }
}

function saveRoutines() {
  try {
    localStorage.setItem(routineStorageKey, JSON.stringify(routines));
    return true;
  } catch {
    setStatus("保存できなかったよ。ブラウザの保存設定を見てね");
    return false;
  }
}

function makeRoutineName() {
  const typedName = routineName.value.trim();
  if (typedName) {
    return typedName;
  }

  const sequenceNumber = routines.length + 1;
  return `わたしのルーチン ${sequenceNumber}`;
}

function summarizeActions(actions) {
  return actions.slice(0, 2).join(" / ");
}

function renderRoutines() {
  routineList.replaceChildren();
  routineCount.textContent = `${routines.length}件`;

  if (!routines.length) {
    const emptyItem = document.createElement("div");
    emptyItem.className = "routine-empty";
    emptyItem.textContent = "保存したルーチンがここに並びます";
    routineList.append(emptyItem);
    return;
  }

  routines.forEach((routine) => {
    const routineButton = document.createElement("button");
    const routineText = document.createElement("span");
    const routineTitle = document.createElement("strong");
    const routineMeta = document.createElement("span");
    const routineIcon = document.createElement("em");

    routineButton.className = "routine-card";
    routineButton.type = "button";
    routineTitle.textContent = routine.name;
    routineMeta.textContent = `${routine.actions.length}手順・${summarizeActions(routine.actions)}`;
    routineIcon.textContent = "↻";

    routineText.append(routineTitle, routineMeta);
    routineButton.append(routineText, routineIcon);
    routineButton.addEventListener("click", () => applyRoutine(routine));
    routineList.append(routineButton);
  });
}

function storeCurrentRoutine() {
  if (!statusLog.length) {
    setStatus("まず操作をしてから覚えられるよ");
    return;
  }

  const routine = {
    id: `${Date.now()}`,
    name: makeRoutineName(),
    actions: [...statusLog],
    createdAt: new Date().toISOString(),
  };

  const previousRoutines = [...routines];
  routines.unshift(routine);
  routines = routines.slice(0, 5);
  if (!saveRoutines()) {
    routines = previousRoutines;
    renderRoutines();
    return;
  }
  renderRoutines();
  routineForm.reset();
  setStatus(`「${routine.name}」として覚えたよ`);
}

function applyRoutine(routine) {
  const appliedActions = routine.actions.map((action) => `「${routine.name}」から ${action}`);
  statusLog.push(...appliedActions);
  redoLog.length = 0;
  setStatus(`「${routine.name}」をもう一度かけたよ`);
  renderHistory();
}

function activateCatalogTab(tab) {
  const targetName = tab.dataset.catalogTarget;
  const targetSection = [...catalogSections].find((section) => section.dataset.catalogSection === targetName);

  catalogTabs.forEach((item) => {
    item.classList.toggle("active", item === tab);
  });

  if (targetSection) {
    targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  pushAction(`${getActionLabel(tab)}を開いたよ`);
}

function makeSelectable(element) {
  if (element.tagName !== "BUTTON") {
    element.setAttribute("role", "button");
    element.setAttribute("tabindex", "0");
  }
}

function triggerKeyboardClick(element, event) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }
  event.preventDefault();
  element.click();
}

function updateFilterSelection(card) {
  document.querySelectorAll(".filter-card").forEach((item) => {
    item.classList.toggle("active", item === card);
    item.querySelector(".check")?.remove();
  });

  const check = document.createElement("span");
  check.className = "check";
  check.textContent = "✓";
  card.querySelector(".filter-img")?.append(check);

  editorPhoto.classList.remove(...filterPreviewClasses);
  if (card.dataset.filter && card.dataset.filter !== "pink") {
    editorPhoto.classList.add(`preview-${card.dataset.filter}`);
  }
}

function selectCard(card) {
  const label = getActionLabel(card);
  const sameGroupCards = card.parentElement.querySelectorAll(".filter-card, .stamp-card, .title-card, .grade-card");

  sameGroupCards.forEach((item) => {
    item.classList.toggle("active", item === card);
  });

  if (card.classList.contains("filter-card")) {
    updateFilterSelection(card);
    pushAction(`${label}を選んだよ`);
    return;
  }

  pushAction(`${label}を選んだよ`);
}

function openExportSheet() {
  exportSheet.hidden = false;
  exportStart.disabled = false;
  exportStart.textContent = "書き出しを開始";
  setStatus("書き出し設定を開いたよ");
  exportOptions[0]?.focus();
}

function closeExportSheet() {
  exportSheet.hidden = true;
  clearTimeout(exportTimer);
}

function selectExportQuality(option) {
  exportOptions.forEach((item) => {
    item.classList.toggle("active", item === option);
  });
  setStatus(`${option.dataset.quality}で書き出し準備中`);
}

function startExport() {
  const quality = document.querySelector(".export-option.active")?.dataset.quality || "1080p";
  exportStart.disabled = true;
  exportStart.textContent = "書き出し中...";

  clearTimeout(exportTimer);
  exportTimer = setTimeout(() => {
    exportStart.textContent = "保存しました";
    pushAction(`${quality} MP4を書き出したよ`);
  }, 650);
}

viewTargetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.startMode) {
      setEditorMode(button.dataset.startMode);
    }
    switchView(button.dataset.viewTarget);
  });
});

modeTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setEditorMode(tab.dataset.editorMode);
    pushAction(`${getActionLabel(tab)}編集に切り替えたよ`);
  });
});

document.querySelectorAll(".tool-item, .editor-tool, .see-all, .menu-icon, .help-btn, .add-clip").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.startMode) {
      setEditorMode(button.dataset.startMode);
      if (button.classList.contains("tool-item") && !button.dataset.viewTarget) {
        switchView("editor");
      }
    }
    if (button.dataset.photoAction && activeEditorMode !== "photo") {
      setEditorMode("photo");
    }
    const label = getActionLabel(button);
    if (label) {
      pushAction(`${label}を選んだよ`);
    }
  });
});

importButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openMediaPicker(button.dataset.importMedia);
  });
});

mediaInput.addEventListener("change", () => {
  handleMediaFile(mediaInput.files[0]);
});

savePhotoButton.addEventListener("click", saveEditedPhoto);

createCards.forEach((card) => {
  card.addEventListener("click", () => {
    pushAction(`${getActionLabel(card)}を始める準備ができたよ`);
  });
});

projectCards.forEach((card) => {
  makeSelectable(card);
  card.addEventListener("click", () => {
    switchView("editor");
    pushAction(`${card.querySelector("strong").textContent}を開いたよ`);
  });
  card.addEventListener("keydown", (event) => triggerKeyboardClick(card, event));
});

templateItems.forEach((item) => {
  makeSelectable(item);
  item.addEventListener("click", () => {
    if (item.dataset.startMode) {
      setEditorMode(item.dataset.startMode);
    }
    switchView("editor");
    pushAction(`${getActionLabel(item)}を開いたよ`);
  });
  item.addEventListener("keydown", (event) => triggerKeyboardClick(item, event));
});

photoActionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("editor-tool")) {
      return;
    }
    button.parentElement.querySelectorAll("[data-photo-action]").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    setEditorMode("photo");
    pushAction(`${button.dataset.photoAction}を調整したよ`);
  });
});

photoSliders.forEach((slider) => {
  slider.addEventListener("input", () => {
    updatePhotoFilter();
    setStatus("写真の見え方を調整中");
  });
  slider.addEventListener("change", () => {
    pushAction(`${slider.closest("label").querySelector("span").textContent}を調整したよ`);
  });
});

photoStyleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activePhotoStyle = button.dataset.photoStyle;
    photoStyleButtons.forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    setEditorMode("photo");
    pushAction(`${getActionLabel(button)}スタイルを選んだよ`);
  });
});

beforeAfterButton.addEventListener("click", () => {
  editorPhoto.classList.toggle("photo-original");
  setStatus(editorPhoto.classList.contains("photo-original") ? "補正前を表示中" : "補正後を表示中");
});

catalogTabs.forEach((tab) => {
  tab.addEventListener("click", () => activateCatalogTab(tab));
});

selectableCards.forEach((card) => {
  makeSelectable(card);
  card.addEventListener("click", () => selectCard(card));
  card.addEventListener("keydown", (event) => triggerKeyboardClick(card, event));
});

document.querySelector(".search").addEventListener("click", () => {
  setStatus("テンプレートや素材を検索できるよ");
});

document.querySelector(".js-play").addEventListener("click", () => {
  pushAction("プレビュー再生中");
});

document.querySelector(".js-undo").addEventListener("click", () => {
  const last = statusLog.pop();
  if (!last) {
    setStatus("これ以上、ひとつもどせないよ");
    return;
  }
  redoLog.push(last);
  setStatus("ひとつ前にもどしたよ");
  renderHistory();
});

document.querySelector(".js-redo").addEventListener("click", () => {
  const next = redoLog.pop();
  if (!next) {
    setStatus("今はやり直せるものがないよ");
    return;
  }
  statusLog.push(next);
  setStatus("もう一度やり直したよ");
  renderHistory();
});

exportButton.addEventListener("click", openExportSheet);
exportClose.addEventListener("click", closeExportSheet);
exportSheet.addEventListener("click", (event) => {
  if (event.target === exportSheet) {
    closeExportSheet();
  }
});
exportOptions.forEach((option) => {
  option.addEventListener("click", () => selectExportQuality(option));
});
exportStart.addEventListener("click", startExport);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !exportSheet.hidden) {
    closeExportSheet();
  }
});

routineForm.addEventListener("submit", (event) => {
  event.preventDefault();
  storeCurrentRoutine();
});

loadRoutines();
renderHistory();
renderRoutines();
setEditorMode("video");
switchView("home");
