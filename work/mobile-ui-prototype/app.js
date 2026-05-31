const statusLog = [];
const redoLog = [];
const phones = document.querySelectorAll(".phone[data-view]");
const viewButtons = document.querySelectorAll(".view-switcher [data-view-target]");
const editorStatus = document.querySelector(".editor-caption");
const historyList = document.querySelector(".history-list");
const historyCount = document.querySelector(".history-count");

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

renderHistory();
switchView("home");
