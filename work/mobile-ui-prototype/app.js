const statusLog = [];
const redoLog = [];
const routineStorageKey = "bloom.video-editor.routines";
const filterPreviewClasses = ["preview-warm", "preview-lavender", "preview-beige"];
let routines = [];
let exportTimer = null;

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
    pushAction(`${label}をプレビューにかけたよ`);
    return;
  }

  pushAction(`${label}を追加したよ`);
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
    switchView(button.dataset.viewTarget);
  });
});

document.querySelectorAll(".tool-item, .editor-tool, .see-all, .menu-icon, .help-btn, .add-clip").forEach((button) => {
  button.addEventListener("click", () => {
    const label = getActionLabel(button);
    if (label) {
      pushAction(`${label}を選んだよ`);
    }
  });
});

document.querySelector(".create-card").addEventListener("click", () => {
  pushAction("新しいプロジェクトを作る準備ができたよ");
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
    switchView("editor");
    pushAction(`${getActionLabel(item)}テンプレートを使う準備ができたよ`);
  });
  item.addEventListener("keydown", (event) => triggerKeyboardClick(item, event));
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
  setStatus("素材を検索できるよ");
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
switchView("home");
