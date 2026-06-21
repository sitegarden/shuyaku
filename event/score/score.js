import { showRanking } from "../../games/ranking.js";
import { initStarGame } from "./star.js";

const EVENT_ACCESS_KEY = "shuyakuEventAccess";

const screens = {
  home: document.getElementById("scoreHomeScreen"),
  game: document.getElementById("scoreGameScreen"),
  ranking: document.getElementById("scoreRankingScreen")
};

const gameCards = document.querySelectorAll(".event-score-game-card");

const backToScoreHomeBtn = document.getElementById("backToScoreHomeBtn");
const openRankingBtn = document.getElementById("openRankingBtn");
const gameRankingBtn = document.getElementById("gameRankingBtn");
const backFromRankingBtn = document.getElementById("backFromRankingBtn");

const currentGameLabel = document.getElementById("currentGameLabel");
const currentGameTitle = document.getElementById("currentGameTitle");
const gameContainer = document.getElementById("gameContainer");

const rankingGameTabs = document.querySelectorAll(".score-ranking-tab");
const rankingPeriodButtons = document.querySelectorAll(".score-ranking-period");

const GAMES = {
  star: {
    id: "event_star",
    label: "star catch",
    title: "星キャッチ"
  },

  reaction: {
    id: "event_reaction",
    label: "reaction game",
    title: "反射神経ゲーム"
  },

  dodge: {
    id: "event_dodge",
    label: "dodge game",
    title: "障害物よけゲーム"
  }
};

let currentGameKey = "star";
let currentPeriod = "month";
let previousScreen = "home";
let cleanupCurrentGame = null;

checkEventAccess();
setupEvents();
showScreen("home");

function checkEventAccess() {
  const hasAccess = sessionStorage.getItem(EVENT_ACCESS_KEY) === "granted";

  if (!hasAccess) {
    location.replace("../enter/");
  }
}

function setupEvents() {
  gameCards.forEach((card) => {
    card.addEventListener("click", () => {
      const gameKey = card.dataset.gameId;

      if (!GAMES[gameKey]) {
        return;
      }

      openGame(gameKey);
    });
  });

  backToScoreHomeBtn?.addEventListener("click", () => {
    clearGameContainer();
    showScreen("home");
  });

  openRankingBtn?.addEventListener("click", async () => {
    previousScreen = "home";
    await openRanking();
  });

  gameRankingBtn?.addEventListener("click", async () => {
    previousScreen = "game";
    await openRanking();
  });

  backFromRankingBtn?.addEventListener("click", () => {
    showScreen(previousScreen);
  });

  rankingGameTabs.forEach((button) => {
    button.addEventListener("click", async () => {
      const gameKey = button.dataset.rankingGame;

      if (!GAMES[gameKey]) {
        return;
      }

      currentGameKey = gameKey;
      updateRankingGameTabs();

      await renderRanking();
    });
  });

  rankingPeriodButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      currentPeriod = button.dataset.period || "month";
      updateRankingPeriodButtons();

      await renderRanking();
    });
  });
}

function showScreen(screenName) {
  Object.entries(screens).forEach(([name, screen]) => {
    screen?.classList.toggle("active", name === screenName);
  });
}

function openGame(gameKey) {
  const game = GAMES[gameKey];

  if (!game) {
    return;
  }

  currentGameKey = gameKey;

  if (currentGameLabel) {
    currentGameLabel.textContent = game.label;
  }

  if (currentGameTitle) {
    currentGameTitle.textContent = game.title;
  }

  showScreen("game");

  renderGamePlaceholder(game);
}

function openGame(gameKey) {
  const game = GAMES[gameKey];

  if (!game) {
    return;
  }

  currentGameKey = gameKey;

  if (currentGameLabel) {
    currentGameLabel.textContent = game.label;
  }

  if (currentGameTitle) {
    currentGameTitle.textContent = game.title;
  }

  clearGameContainer();
  showScreen("game");

  if (gameKey === "star") {
    cleanupCurrentGame = initStarGame(gameContainer);
    return;
  }

  renderGamePlaceholder(game);
}

function renderGamePlaceholder(game) {
  if (!gameContainer) {
    return;
  }

  gameContainer.innerHTML = `
    <div class="score-game-placeholder">
      <div class="score-game-placeholder-icon">🎮</div>
      <p>${escapeHtml(game.label)}</p>
      <h2>${escapeHtml(game.title)}</h2>
      <span>
        このゲームはこれから作るぜ。
      </span>
    </div>
  `;
}

async function openRanking() {
  updateRankingGameTabs();
  updateRankingPeriodButtons();

  showScreen("ranking");

  await renderRanking();
}

async function renderRanking() {
  const game = GAMES[currentGameKey];

  if (!game) {
    return;
  }

  await showRanking(game.id, currentPeriod);
}

function updateRankingGameTabs() {
  rankingGameTabs.forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.rankingGame === currentGameKey
    );
  });
}

function updateRankingPeriodButtons() {
  rankingPeriodButtons.forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.period === currentPeriod
    );
  });
}

function clearGameContainer() {
  if (typeof cleanupCurrentGame === "function") {
    cleanupCurrentGame();
  }

  cleanupCurrentGame = null;

  if (gameContainer) {
    gameContainer.innerHTML = "";
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
