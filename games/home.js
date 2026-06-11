// home.js

import { GAMES } from "./games.js";
import { showRanking } from "./ranking.js";

const gameList = document.getElementById("gameList");
const gameContainer = document.getElementById("gameContainer");

const headerTitle = document.getElementById("headerTitle");
const headerSubtitle = document.getElementById("headerSubtitle");
const headerBackBtn = document.getElementById("headerBackBtn");
const headerActionBtn = document.getElementById("headerActionBtn");

const tabGamesBtn = document.getElementById("tabGamesBtn");
const tabRankingBtn = document.getElementById("tabRankingBtn");

const rankingPeriodButtons = document.querySelectorAll(".tabs button");

const screens = {
  home: document.getElementById("homeScreen"),
  ranking: document.getElementById("rankingScreen"),
  game: document.getElementById("gameScreen")
};

let currentGame = null;
let currentPeriod = "week";

renderGameList();
setupTabs();
setupRankingPeriodButtons();
showScreen("home");

/* =========================
   game list
========================= */

function renderGameList() {
  if (!gameList) {
    console.error("gameList が見つからない");
    return;
  }

  gameList.innerHTML = "";

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
}

/* =========================
   screens
========================= */

async function startGame(game) {
  currentGame = game;

  if (gameContainer) {
    gameContainer.innerHTML = "";
  }

  showScreen("game");

  try {
    const gameModule = await import(`${game.script}?v=${Date.now()}`);

    if (gameModule?.initGame) {
      gameModule.initGame();
    }
  } catch (error) {
    console.error(error);

    if (gameContainer) {
      gameContainer.innerHTML = `
        <div class="game-error">
          <h2>ゲームを読み込めませんでした</h2>
          <p>${escapeHtml(error.message)}</p>
        </div>
      `;
    }
  }
}

function showScreen(screenName) {
  Object.values(screens).forEach((screen) => {
    if (!screen) return;
    screen.classList.remove("active");
  });

  if (screens[screenName]) {
    screens[screenName].classList.add("active");
  }

  document.body.classList.toggle("is-home-screen", screenName === "home");
  document.body.classList.toggle("is-ranking-screen", screenName === "ranking");
  document.body.classList.toggle("is-game-screen", screenName === "game");

  updateTabs(screenName);
  updateHeader(screenName);
}

function updateTabs(screenName) {
  if (tabGamesBtn) {
    tabGamesBtn.classList.toggle("active", screenName === "home");
  }

  if (tabRankingBtn) {
    tabRankingBtn.classList.toggle("active", screenName === "ranking");
  }
}

function updateHeader(screenName) {
  if (screenName === "home") {
    setHeader({
      title: "ランキング系ミニゲーム",
      subtitle: "好きなゲームを選んで、スコアを競え。",
      showBack: false,
      actionText: ""
    });
  }

  if (screenName === "ranking") {
    setHeader({
      title: "ランキング",
      subtitle: currentGame
        ? `${currentGame.title} のスコアランキング`
        : "ゲームごとのスコアランキングを確認できます。",
      showBack: false,
      actionText: ""
    });
  }

  if (screenName === "game") {
    setHeader({
      title: currentGame?.title || "ゲーム",
      subtitle: "ベストスコアを狙え。",
      showBack: true,
      actionText: "ランキング",
      onBack: () => {
        showScreen("home");
      },
      onAction: async () => {
        await openRanking();
      }
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
    headerActionBtn.textContent = actionText;
    headerActionBtn.onclick = onAction;
  }
}

/* =========================
   tabs
========================= */

function setupTabs() {
  if (tabGamesBtn) {
    tabGamesBtn.addEventListener("click", () => {
      showScreen("home");
    });
  }

  if (tabRankingBtn) {
    tabRankingBtn.addEventListener("click", async () => {
      await openRanking();
    });
  }
}

async function openRanking() {
  if (!currentGame) {
    currentGame = GAMES[0] || null;
  }

  showScreen("ranking");

  if (currentGame) {
    await showRanking(currentGame.id, currentPeriod);
  }
}

/* =========================
   ranking periods
========================= */

function setupRankingPeriodButtons() {
  rankingPeriodButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      currentPeriod = button.dataset.period || "week";

      rankingPeriodButtons.forEach((btn) => {
        btn.classList.remove("active");
      });

      button.classList.add("active");

      if (!currentGame) {
        currentGame = GAMES[0] || null;
      }

      if (currentGame) {
        await showRanking(currentGame.id, currentPeriod);
      }
    });
  });

  const defaultButton = document.querySelector(`.tabs button[data-period="${currentPeriod}"]`);

  if (defaultButton) {
    defaultButton.classList.add("active");
  }
}

/* =========================
   utility
========================= */

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
