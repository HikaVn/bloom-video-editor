const statusLog = [];
const redoLog = [];
const routineStorageKey = "bloom.video-editor.routines";
let routines = [];
const phones = document.querySelectorAll(".phone[data-view]");
const viewButtons = document.querySelectorAll(".view-switcher [data-view-target]");
const editorStatus = document.querySelector(".editor-caption");
const historyList = document.querySelector(".history-list");
const historyCount = document.querySelector(".history-count");
const routineForm = document.querySelector(".routine-form");
const routineName = document.querySelector(".routine-name");
const routineSave = document.querySelector(".routine-save");
const routineList = document.querySelector(".routine-list");
const routineCount = document.querySelector(".routine-count");

function switchView(viewName) {
  phones.forEach((phone) => {
    const isActive = phone.dataset.view === viewName;
    phone.classList.toggle("active", isActive);
    phone.setAttribute("aria-hidden", String(!isActive));
  });

  viewButtons.forEach((button) => {
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

document.querySelectorAll("[data-view-target]").forEach((button) => {
  button.addEventListener("click", () => {
    switchView(button.dataset.viewTarget);
  });
});

document.querySelectorAll(".tool-item, .editor-tool, .catalog-tab, .nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    const label = button.innerText.trim().replace(/\s+/g, " ");
    if (label) {
      pushAction(`${label}を選んだよ`);
    }
  });
});

document.querySelector(".create-card").addEventListener("click", () => {
  pushAction("新しいプロジェクトを作る準備ができたよ");
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

routineForm.addEventListener("submit", (event) => {
  event.preventDefault();
  storeCurrentRoutine();
});

loadRoutines();
renderHistory();
renderRoutines();
switchView("home");
