// home.js

import { GAMES } from "./games.js";
import { showRanking } from "./ranking.js";

const gameList = document.getElementById("gameList");
const gameContainer = document.getElementById("gameContainer");

const headerBackBtn = document.getElementById("headerBackBtn");
const headerActionBtn = document.getElementById("headerActionBtn");
const headerTitle = document.getElementById("headerTitle");
const headerSubtitle = document.getElementById("headerSubtitle");

const tabGamesBtn = document.getElementById("tabGamesBtn");
const tabRankingBtn = document.getElementById("tabRankingBtn");

const screens = {
  home: document.getElementById("homeScreen"),
  game: document.getElementById("gameScreen"),
  ranking: document.getElementById("rankingScreen")
};

let currentGameId = null;
let currentGameTitle = "";
let currentPeriod = "week";

GAMES.forEach((game) => {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "game-card";

  card.innerHTML = `
    <strong>${game.title}</strong>
    <span>${game.description}</span>
  `;

  card.addEventListener("click", () => {
    startGame(game);
  });

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
  Object.values(screens).forEach((screen) => {
    if (!screen) return;
    screen.classList.remove("active");
  });

  if (screens[name]) {
    screens[name].classList.add("active");
  }

  document.body.classList.toggle("is-home-screen", name === "home");
  document.body.classList.toggle("is-game-screen", name === "game");
  document.body.classList.toggle("is-ranking-screen", name === "ranking");

  if (name === "home") {
    setActiveTab("games");

    setHeader({
      title: "ランキング系ミニゲーム",
      subtitle: "好きなゲームを選んで、スコアを競え。",
      showBack: false,
      actionText: ""
    });
  }

  if (name === "game") {
    setActiveTab("");

    setHeader({
      title: currentGameTitle || "ゲーム",
      subtitle: "スコアを狙え",
      showBack: true,
      actionText: "ランキング",
      onBack: () => showScreen("home"),
      onAction: async () => {
        if (!currentGameId) return;

        showScreen("ranking");
        await showRanking(currentGameId, currentPeriod);
      }
    });
  }

  if (name === "ranking") {
    setActiveTab("ranking");

    setHeader({
      title: "ランキング",
      subtitle: currentGameTitle || "全体ランキング",
      showBack: false,
      actionText: ""
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
  if (headerTitle) {
    headerTitle.textContent = title;
  }

  if (headerSubtitle) {
    headerSubtitle.textContent = subtitle;
  }

  if (headerBackBtn) {
    headerBackBtn.classList.toggle("hidden", !showBack);
    headerBackBtn.onclick = onBack;
  }

  if (headerActionBtn) {
    headerActionBtn.classList.toggle("hidden", !actionText);
    headerActionBtn.textContent = actionText || "";
    headerActionBtn.onclick = onAction;
  }
}

function setActiveTab(tabName) {
  tabGamesBtn?.classList.toggle("active", tabName === "games");
  tabRankingBtn?.classList.toggle("active", tabName === "ranking");
}

async function openRankingTab() {
  const defaultGame = GAMES[0];

  if (!currentGameId && defaultGame) {
    currentGameId = defaultGame.id;
    currentGameTitle = defaultGame.title;
  }

  showScreen("ranking");

  if (currentGameId) {
    await showRanking(currentGameId, currentPeriod);
  }
}

if (tabGamesBtn) {
  tabGamesBtn.addEventListener("click", () => {
    showScreen("home");
  });
}

if (tabRankingBtn) {
  tabRankingBtn.addEventListener("click", async () => {
    await openRankingTab();
  });
}

document.querySelectorAll(".tabs button").forEach((button) => {
  button.addEventListener("click", async () => {
    currentPeriod = button.dataset.period || "week";

    if (!currentGameId) {
      const defaultGame = GAMES[0];

      if (!defaultGame) return;

      currentGameId = defaultGame.id;
      currentGameTitle = defaultGame.title;
    }

    await showRanking(currentGameId, currentPeriod);
  });
});

showScreen("home");