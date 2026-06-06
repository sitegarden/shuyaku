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
