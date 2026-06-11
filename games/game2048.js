// games/game2048.js

import { submitScore } from "./ranking.js";

const gameContainer = document.getElementById("gameContainer");

gameContainer.innerHTML = `
  <div class="score-box">
    <p>Score: <span id="score">0</span></p>
    <p>Best: <span id="bestScore">0</span></p>
  </div>

  <div id="board"></div>

  <button id="restartBtn" class="game-action-btn">もう一度</button>
`;

const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("bestScore");
const restartBtn = document.getElementById("restartBtn");

let board = [];
let score = 0;
let bestScore = Number(localStorage.getItem("best2048") || 0);
let gameEnded = false;

bestScoreEl.textContent = bestScore;

function startGame() {
  board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];

  score = 0;
  gameEnded = false;

  addRandomTile();
  addRandomTile();
  render();
}

function render() {
  boardEl.innerHTML = "";

  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const value = board[y][x];

      const cell = document.createElement("div");
      cell.className = "cell";

      if (value) {
        cell.textContent = value;
        cell.dataset.value = value;
      }

      boardEl.appendChild(cell);
    }
  }

  scoreEl.textContent = score;

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("best2048", bestScore);
    bestScoreEl.textContent = bestScore;
  }
}

function addRandomTile() {
  const empty = [];

  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      if (board[y][x] === 0) {
        empty.push({ x, y });
      }
    }
  }

  if (empty.length === 0) return;

  const spot = empty[Math.floor(Math.random() * empty.length)];
  board[spot.y][spot.x] = Math.random() < 0.9 ? 2 : 4;
}

function slide(row) {
  let arr = row.filter((num) => num !== 0);

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      score += arr[i];
      arr[i + 1] = 0;
    }
  }

  arr = arr.filter((num) => num !== 0);

  while (arr.length < 4) {
    arr.push(0);
  }

  return arr;
}

function moveLeft() {
  let moved = false;

  for (let y = 0; y < 4; y++) {
    const oldRow = [...board[y]];
    board[y] = slide(board[y]);

    if (oldRow.join() !== board[y].join()) {
      moved = true;
    }
  }

  return moved;
}

function moveRight() {
  let moved = false;

  for (let y = 0; y < 4; y++) {
    const oldRow = [...board[y]];
    const reversed = [...board[y]].reverse();

    board[y] = slide(reversed).reverse();

    if (oldRow.join() !== board[y].join()) {
      moved = true;
    }
  }

  return moved;
}

function moveUp() {
  let moved = false;

  for (let x = 0; x < 4; x++) {
    const oldCol = [
      board[0][x],
      board[1][x],
      board[2][x],
      board[3][x]
    ];

    const newCol = slide([...oldCol]);

    for (let y = 0; y < 4; y++) {
      board[y][x] = newCol[y];
    }

    if (oldCol.join() !== newCol.join()) {
      moved = true;
    }
  }

  return moved;
}

function moveDown() {
  let moved = false;

  for (let x = 0; x < 4; x++) {
    const oldCol = [
      board[0][x],
      board[1][x],
      board[2][x],
      board[3][x]
    ];

    const reversed = [...oldCol].reverse();
    const newCol = slide(reversed).reverse();

    for (let y = 0; y < 4; y++) {
      board[y][x] = newCol[y];
    }

    if (oldCol.join() !== newCol.join()) {
      moved = true;
    }
  }

  return moved;
}

function canMove() {
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      if (board[y][x] === 0) {
        return true;
      }

      if (x < 3 && board[y][x] === board[y][x + 1]) {
        return true;
      }

      if (y < 3 && board[y][x] === board[y + 1][x]) {
        return true;
      }
    }
  }

  return false;
}

async function endGame() {
  if (gameEnded) return;

  gameEnded = true;

  try {
    await submitScore("2048", score);
  } catch (error) {
    console.error("スコア保存に失敗しました", error);
  }

  alert(`ゲーム終了！スコア: ${score}`);
}

function handleMove(direction) {
  if (gameEnded) return;

  let moved = false;

  if (direction === "left") moved = moveLeft();
  if (direction === "right") moved = moveRight();
  if (direction === "up") moved = moveUp();
  if (direction === "down") moved = moveDown();

  if (moved) {
    addRandomTile();
    render();

    if (!canMove()) {
      endGame();
    }
  }
}

document.onkeydown = (event) => {
  if (event.key === "ArrowLeft") handleMove("left");
  if (event.key === "ArrowRight") handleMove("right");
  if (event.key === "ArrowUp") handleMove("up");
  if (event.key === "ArrowDown") handleMove("down");
};

let touchStartX = 0;
let touchStartY = 0;

boardEl.addEventListener("touchstart", (event) => {
  const touch = event.touches[0];

  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: true });

boardEl.addEventListener("touchmove", (event) => {
  event.preventDefault();
}, { passive: false });

boardEl.addEventListener("touchend", (event) => {
  const touch = event.changedTouches[0];

  const diffX = touch.clientX - touchStartX;
  const diffY = touch.clientY - touchStartY;

  const absX = Math.abs(diffX);
  const absY = Math.abs(diffY);

  if (Math.max(absX, absY) < 30) {
    return;
  }

  if (absX > absY) {
    if (diffX > 0) {
      handleMove("right");
    } else {
      handleMove("left");
    }
  } else {
    if (diffY > 0) {
      handleMove("down");
    } else {
      handleMove("up");
    }
  }
});

restartBtn.onclick = () => {
  startGame();
};

startGame();
