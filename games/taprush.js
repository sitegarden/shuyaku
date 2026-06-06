// games/taprush.js

import { submitScore, showRanking } from "../ranking.js";

const gameContainer = document.getElementById("gameContainer");

gameContainer.innerHTML = `
  <div class="taprush-wrap">
    <div class="taprush-status">
      <div class="taprush-status-card">
        <span class="taprush-label">TIME</span>
        <strong id="taprushTime">25</strong>
      </div>

      <div class="taprush-status-card">
        <span class="taprush-label">SCORE</span>
        <strong id="taprushScore">0</strong>
      </div>
    </div>

    <p id="taprushMessage" class="taprush-message">
      高得点マスを狙ってタップ！
    </p>

    <div id="taprushBoard" class="taprush-board">
      <button class="taprush-cell" data-index="0"></button>
      <button class="taprush-cell" data-index="1"></button>
      <button class="taprush-cell" data-index="2"></button>
      <button class="taprush-cell" data-index="3"></button>
      <button class="taprush-cell" data-index="4"></button>
      <button class="taprush-cell" data-index="5"></button>
      <button class="taprush-cell" data-index="6"></button>
      <button class="taprush-cell" data-index="7"></button>
      <button class="taprush-cell" data-index="8"></button>
    </div>

    <button id="taprushStartBtn" class="taprush-start-btn">スタート</button>
  </div>
`;

const timeEl = document.getElementById("taprushTime");
const scoreEl = document.getElementById("taprushScore");
const messageEl = document.getElementById("taprushMessage");
const boardEl = document.getElementById("taprushBoard");
const startBtn = document.getElementById("taprushStartBtn");
const cells = document.querySelectorAll(".taprush-cell");

let timer = 25;
let score = 0;
let values = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let playing = false;
let timerId = null;

const CELL_TYPES = [
  {
    type: "super",
    text: "🌸",
    value: 5,
    label: "+5"
  },
  {
    type: "good",
    text: "💮",
    value: 3,
    label: "+3"
  },
  {
    type: "normal",
    text: "⭕️",
    value: 1,
    label: "+1"
  },
  {
    type: "bad",
    text: "❌",
    value: -1,
    label: "-1"
  }
];

function startGame() {
  timer = 25;
  score = 0;
  playing = true;

  timeEl.textContent = timer;
  scoreEl.textContent = score;
  messageEl.textContent = "スタート！高得点マスを狙え";
  startBtn.textContent = "プレイ中";
  startBtn.disabled = true;

  updateBoard();

  if (timerId) {
    clearInterval(timerId);
  }

  timerId = setInterval(() => {
    timer -= 1;
    timeEl.textContent = timer;

    if (timer <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  playing = false;

  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  clearBoard();

  messageEl.textContent = `終了！スコアは ${score}`;
  startBtn.textContent = "もう一度";
  startBtn.disabled = false;

  submitScore("taprush", score).then(() => {
    showRanking("taprush", "week");
  });
}

function updateBoard() {
  cells.forEach((cell, index) => {
    const cellData = getRandomCellData();

    values[index] = cellData.value;

    cell.className = `taprush-cell ${cellData.type}`;
    cell.innerHTML = `
      <span class="taprush-symbol">${cellData.text}</span>
      <span class="taprush-point">${cellData.label}</span>
    `;
  });
}

function clearBoard() {
  cells.forEach((cell, index) => {
    values[index] = 0;
    cell.className = "taprush-cell";
    cell.innerHTML = "";
  });
}

function getRandomCellData() {
  const point = Math.floor(Math.random() * 20);

  if (point < 1) {
    return CELL_TYPES[0];
  }

  if (point < 4) {
    return CELL_TYPES[1];
  }

  if (point < 10) {
    return CELL_TYPES[3];
  }

  return CELL_TYPES[2];
}

cells.forEach(cell => {
  cell.onclick = () => {
    if (!playing) {
      return;
    }

    const index = Number(cell.dataset.index);
    const value = values[index];

    score += value;

    if (score < 0) {
      score = 0;
    }

    scoreEl.textContent = score;

    cell.classList.add("hit");

    setTimeout(() => {
      cell.classList.remove("hit");
      updateBoard();
    }, 80);
  };
});

startBtn.onclick = () => {
  startGame();
};
