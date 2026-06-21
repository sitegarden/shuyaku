const EVENT_PASSWORD = "UDONTABETAI";
const EVENT_ACCESS_KEY = "shuyakuEventAccess";

const form = document.getElementById("eventEnterForm");
const passwordInput = document.getElementById("eventPasswordInput");
const message = document.getElementById("eventEnterMessage");
const submitBtn = form?.querySelector('button[type="submit"]');

if (sessionStorage.getItem(EVENT_ACCESS_KEY) === "granted") {
  location.replace("../score/");
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  const enteredPassword = String(passwordInput?.value || "").trim();

  if (!enteredPassword) {
    showMessage("合言葉を入力してね。", "error");
    return;
  }

  if (enteredPassword !== EVENT_PASSWORD) {
    showMessage("合言葉が違うみたい。スタッフに確認してね。", "error");

    if (passwordInput) {
      passwordInput.focus();
      passwordInput.select();
    }

    return;
  }

  sessionStorage.setItem(EVENT_ACCESS_KEY, "granted");

  showMessage("参加を確認したよ。ゲーム一覧へ進みます。", "success");

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "入場中...";
  }

  setTimeout(() => {
    location.href = "../score/";
  }, 350);
});

function showMessage(text, type = "") {
  if (!message) return;

  message.textContent = text;
  message.className = "event-enter-message";

  if (type) {
    message.classList.add(type);
  }
}
