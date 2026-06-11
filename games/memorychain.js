// games/memorychain.js

import { submitScore } from "./ranking.js";

const gameContainer = document.getElementById("gameContainer");

gameContainer.innerHTML = `
  <div class="memory-wrap">
    <div class="memory-status">
      <div class="memory-status-card">
        <span class="memory-label">LEVEL</span>
        <strong id="memoryLevel">0</strong>
      </div>

      <div class="memory-status-card">
        <span class="memory-label">BEST</span>
        <strong id="memoryBest">0</strong>
      </div>
    </div>

    <p id="memoryMessage" class="memory-message">
      光った順番を覚えて、同じ順番でタッチ！
    </p>

    <div id="memoryBoard" class="memory-board">
      <button class="memory-cell" data-index="0"></button>
      <button class="memory-cell" data-index="1"></button>
      <button class="memory-cell" data-index="2"></button>
      <button class="memory-cell" data-index="3"></button>
      <button class="memory-cell" data-index="4"></button>
      <button class="memory-cell" data-index="5"></button>
      <button class="memory-cell" data-index="6"></button>
      <button class="memory-cell" data-index="7"></button>
      <button class="memory-cell" data-index="8"></button>
    </div>

    <button id="memoryStartBtn" class="memory-start-btn">スタート</button>
  </div>
`;

const levelEl = document.getElementById("memoryLevel");
const bestEl = document.getElementById("memoryBest");
const messageEl = document.getElementById("memoryMessage");
const startBtn = document.getElementById("memoryStartBtn");
const cells = document.querySelectorAll(".memory-cell");

let sequence = [];
let userIndex = 0;
let level = 0;
let acceptingInput = false;
let showingSequence = false;
let gameStarted = false;

let best = Number(localStorage.getItem("bestMemoryChain") || 0);
bestEl.textContent = best;

const MAX_LEVEL = 25;

function startGame() {
  sequence = [];
  userIndex = 0;
  level = 0;
  acceptingInput = false;
  showingSequence = false;
  gameStarted = true;

  levelEl.textContent = level;
  messageEl.textContent = "覚えてね";
  startBtn.disabled = true;
  startBtn.textContent = "プレイ中";

  clearCells();

  nextLevel();
}

function nextLevel() {
  if (level >= MAX_LEVEL) {
    completeGame();
    return;
  }

  acceptingInput = false;
  showingSequence = true;
  userIndex = 0;

  sequence.push(getRandomCellIndex());
  level = sequence.length;
  levelEl.textContent = level;

  messageEl.textContent = "覚えてね";

  setTimeout(() => {
    showSequence();
  }, 500);
}

async function showSequence() {
  clearCells();

  for (let i = 0; i < sequence.length; i++) {
    const index = sequence[i];

    await wait(260);
    flashCell(index);
    await wait(420);
    clearCells();
  }

  showingSequence = false;
  acceptingInput = true;
  userIndex = 0;
  messageEl.textContent = "同じ順番でタッチ！";
}

function flashCell(index) {
  const cell = cells[index];

  if (!cell) return;

  cell.classList.add("active");
}

function clearCells() {
  cells.forEach((cell) => {
    cell.classList.remove("active");
    cell.classList.remove("correct");
    cell.classList.remove("wrong");
  });
}

function getRandomCellIndex() {
  return Math.floor(Math.random() * cells.length);
}

function handleCellTap(cell) {
  if (!gameStarted || showingSequence || !acceptingInput) {
    return;
  }

  const index = Number(cell.dataset.index);
  const correctIndex = sequence[userIndex];

  if (index !== correctIndex) {
    missCell(cell);
    endGame();
    return;
  }

  cell.classList.add("correct");

  setTimeout(() => {
    cell.classList.remove("correct");
  }, 130);

  userIndex += 1;

  if (userIndex >= sequence.length) {
    acceptingInput = false;
    messageEl.textContent = "成功！次のレベルへ";

    setTimeout(() => {
      nextLevel();
    }, 650);
  }
}

function missCell(cell) {
  cell.classList.add("wrong");
  messageEl.textContent = "ミス！ゲーム終了";
}

async function endGame() {
  acceptingInput = false;
  showingSequence = false;
  gameStarted = false;

  const finalLevel = Math.max(0, level - 1);

  if (finalLevel > best) {
    best = finalLevel;
    localStorage.setItem("bestMemoryChain", best);
    bestEl.textContent = best;
  }

  levelEl.textContent = finalLevel;
  messageEl.textContent = `ゲーム終了！到達レベル：${finalLevel}`;

  startBtn.disabled = false;
  startBtn.textContent = "もう一度";

  try {
    await submitScore("memorychain", finalLevel);
    messageEl.textContent = `ゲーム終了！到達レベル：${finalLevel} / ランキングに保存しました`;
  } catch (error) {
    console.error("スコア保存に失敗しました", error);
    messageEl.textContent = `ゲーム終了！到達レベル：${finalLevel} / 保存に失敗しました`;
  }
}

async function completeGame() {
  acceptingInput = false;
  showingSequence = false;
  gameStarted = false;

  const finalLevel = MAX_LEVEL;

  if (finalLevel > best) {
    best = finalLevel;
    localStorage.setItem("bestMemoryChain", best);
    bestEl.textContent = best;
  }

  levelEl.textContent = finalLevel;
  messageEl.textContent = `完全クリア！到達レベル：${finalLevel}`;

  startBtn.disabled = false;
  startBtn.textContent = "もう一度";

  try {
    await submitScore("memorychain", finalLevel);
    messageEl.textContent = `完全クリア！到達レベル：${finalLevel} / ランキングに保存しました`;
  } catch (error) {
    console.error("スコア保存に失敗しました", error);
    messageEl.textContent = `完全クリア！到達レベル：${finalLevel} / 保存に失敗しました`;
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

cells.forEach((cell) => {
  cell.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    handleCellTap(cell);
  });
});

startBtn.onclick = () => {
  startGame();
};
