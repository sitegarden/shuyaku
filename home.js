// home.js

import { GAMES } from "./games.js";
import { showRanking } from "./ranking.js";

const gameList = document.getElementById("gameList");
const gameSelect = document.getElementById("gameSelect");
const gameArea = document.getElementById("gameArea");
const gameTitle = document.getElementById("gameTitle");
const gameContainer = document.getElementById("gameContainer");
const backBtn = document.getElementById("backBtn");
const rankingSection = document.getElementById("rankingSection");

let currentGameId = null;

GAMES.forEach(game => {
  const card = document.createElement("button");
  card.className = "game-card";

  card.innerHTML = `
    <strong>${game.title}</strong>
    <span>${game.description}</span>
  `;

  card.onclick = () => {
    startGame(game);
  };

  gameList.appendChild(card);
});

let currentGameTitle = "";

async function startGame(game) {
  currentGameId = game.id;

  gameTitle.textContent = game.title;
  gameContainer.innerHTML = "";

  showScreen("game");

  await import(game.script);
}

backBtn.onclick = () => {
  location.reload();
};

document.querySelectorAll(".tabs button").forEach(button => {
  button.onclick = () => {
    if (!currentGameId) return;
    showRanking(currentGameId, button.dataset.period);
  };
});

const screens = {
  home: document.getElementById("homeScreen"),
  game: document.getElementById("gameScreen"),
  ranking: document.getElementById("rankingScreen"),
  profile: document.getElementById("profileScreen")
};

function showScreen(name) {
  Object.values(screens).forEach(screen => {
    screen.classList.remove("active");
  });

  screens[name].classList.add("active");

  if (name === "home") {
    setHeader({
      title: currentGameTitle || "ゲーム"
      subtitle: "好きなゲームを選んでスコアを競え",
      showBack: false,
      actionText: ""
    });
  }

  if (name === "game") {
    setHeader({
      title: gameTitle.textContent || "ゲーム",
      subtitle: "スコアを狙え",
      showBack: true,
      actionText: "ランキング",
      onBack: () => showScreen("home"),
      onAction: async () => {
        if (!currentGameId) return;
        showScreen("ranking");
        await showRanking(currentGameId, "week");
      }
    });
  }

  if (name === "ranking") {
    setHeader({
      title: "ランキング",
      subtitle: gameTitle.textContent || "",
      showBack: true,
      actionText: "",
      onBack: () => showScreen("game")
    });
  }

  if (name === "profile") {
    setHeader({
      title: "プロフィール",
      subtitle: "名前とアイコンを設定",
      showBack: true,
      actionText: "",
      onBack: () => showScreen("home")
    });
  }
}
document.getElementById("backHomeBtn").onclick = () => {
  showScreen("home");
};

document.getElementById("openRankingBtn").onclick = async () => {
  if (!currentGameId) return;

  showScreen("ranking");
  await showRanking(currentGameId, "week");
};

document.getElementById("backGameBtn").onclick = () => {
  showScreen("game");
};

document.getElementById("navHomeBtn").onclick = () => {
  showScreen("home");
};

document.getElementById("navProfileBtn").onclick = () => {
  showScreen("profile");
};

document.getElementById("backHomeFromProfileBtn").onclick = () => {
  showScreen("home");
};

const headerBackBtn = document.getElementById("headerBackBtn");
const headerActionBtn = document.getElementById("headerActionBtn");
const headerTitle = document.getElementById("headerTitle");
const headerSubtitle = document.getElementById("headerSubtitle");

function setHeader({
  title,
  subtitle = "",
  showBack = false,
  actionText = "",
  onBack = null,
  onAction = null
}) {
  headerTitle.textContent = title;
  headerSubtitle.textContent = subtitle;

  headerBackBtn.classList.toggle("hidden", !showBack);
  headerActionBtn.classList.toggle("hidden", !actionText);

  headerActionBtn.textContent = actionText || "";

  headerBackBtn.onclick = onBack;
  headerActionBtn.onclick = onAction;
}
