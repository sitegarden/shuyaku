// home.js

import { GAMES } from "./games.js";
import { showRanking } from "./ranking.js";

const gameList = document.getElementById("gameList");
const gameContainer = document.getElementById("gameContainer");

const headerBackBtn = document.getElementById("headerBackBtn");
const headerActionBtn = document.getElementById("headerActionBtn");
const headerTitle = document.getElementById("headerTitle");
const headerSubtitle = document.getElementById("headerSubtitle");

const navHomeBtn = document.getElementById("navHomeBtn");
const navProfileBtn = document.getElementById("navProfileBtn");

const screens = {
  home: document.getElementById("homeScreen"),
  game: document.getElementById("gameScreen"),
  ranking: document.getElementById("rankingScreen"),
  profile: document.getElementById("profileScreen")
};

let currentGameId = null;
let currentGameTitle = "";

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

async function startGame(game) {
  currentGameId = game.id;
  currentGameTitle = game.title;

  gameContainer.innerHTML = "";

  showScreen("game");

  await import(game.script);
}

function showScreen(name) {
  Object.values(screens).forEach(screen => {
    screen.classList.remove("active");
  });

  screens[name].classList.add("active");

  if (name === "home") {
    setHeader({
      title: "Mini Game Arena",
      subtitle: "好きなゲームを選んでスコアを競え",
      showBack: false,
      actionText: ""
    });
  }

  if (name === "game") {
    setHeader({
      title: currentGameTitle || "ゲーム",
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
      subtitle: currentGameTitle || "",
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

document.querySelectorAll(".tabs button").forEach(button => {
  button.onclick = () => {
    if (!currentGameId) return;
    showRanking(currentGameId, button.dataset.period);
  };
});

navHomeBtn.onclick = () => {
  showScreen("home");
};

navProfileBtn.onclick = () => {
  showScreen("profile");
};

showScreen("home");
