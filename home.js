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

  gameSelect.classList.add("hidden");
  gameArea.classList.remove("hidden");
  rankingSection.classList.remove("hidden");

  gameTitle.textContent = game.title;
  gameContainer.innerHTML = "";

  await import(game.script);

  await showRanking(currentGameId, "week");
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
