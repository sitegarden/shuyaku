// games/sunvader.js

import { submitScore, showRanking } from "../ranking.js";

const gameContainer = document.getElementById("gameContainer");

gameContainer.innerHTML = `
  <div class="sunvader-wrap">
    <div class="sunvader-status">
      <div class="sunvader-status-card">
        <span class="sunvader-label">SCORE</span>
        <strong id="sunvaderScore">0</strong>
      </div>

      <div class="sunvader-status-card">
        <span class="sunvader-label">SPEED</span>
        <strong id="sunvaderSpeed">1.0</strong>
      </div>
    </div>

    <p id="sunvaderMessage" class="sunvader-message">
      左右を長押しして、太陽を集めよう
    </p>

    <div id="sunvaderField" class="sunvader-field">
      <div id="sunvaderPlayer" class="sunvader-player">
        <span class="sunvader-player-core"></span>
      </div>

      <div id="sunvaderInvincibleText" class="sunvader-invincible-text hidden">
        INVINCIBLE
      </div>

      <button id="sunvaderLeftControl" class="sunvader-control sunvader-control-left" aria-label="左へ移動"></button>
      <button id="sunvaderRightControl" class="sunvader-control sunvader-control-right" aria-label="右へ移動"></button>
    </div>

    <div class="sunvader-help">
      <div class="sunvader-help-item">
        <span class="sun sun-small sun-100"></span>
        <span>100</span>
      </div>

      <div class="sunvader-help-item">
        <span class="sun sun-small sun-300"></span>
        <span>300</span>
      </div>

      <div class="sunvader-help-item">
        <span class="sun sun-small sun-500"></span>
        <span>500</span>
      </div>

      <div class="sunvader-help-item">
        <span class="sun sun-small sun-rainbow"></span>
        <span>3秒無敵</span>
      </div>

      <div class="sunvader-help-item">
        <span class="monster monster-small"></span>
        <span>当たると終了</span>
      </div>
    </div>

    <button id="sunvaderStartBtn" class="sunvader-start-btn">スタート</button>
  </div>
`;

const scoreEl = document.getElementById("sunvaderScore");
const speedEl = document.getElementById("sunvaderSpeed");
const messageEl = document.getElementById("sunvaderMessage");
const fieldEl = document.getElementById("sunvaderField");
const playerEl = document.getElementById("sunvaderPlayer");
const startBtn = document.getElementById("sunvaderStartBtn");
const leftControl = document.getElementById("sunvaderLeftControl");
const rightControl = document.getElementById("sunvaderRightControl");
const invincibleText = document.getElementById("sunvaderInvincibleText");

let score = 0;
let speedLevel = 1;
let playing = false;
let playerX = 50;
let moveDirection = 0;
let lastTime = 0;
let spawnTimer = 0;
let animationId = null;
let objects = [];
let invincibleUntil = 0;

const PLAYER_WIDTH = 44;
const PLAYER_HEIGHT = 44;
const OBJECT_SIZE = 38;

function startGame() {
  stopLoop();

  score = 0;
  speedLevel = 1;
  playing = true;
  playerX = 50;
  moveDirection = 0;
  lastTime = performance.now();
  spawnTimer = 0;
  objects = [];
  invincibleUntil = 0;

  fieldEl.querySelectorAll(".sunvader-object").forEach(object => {
    object.remove();
  });

  scoreEl.textContent = score;
  speedEl.textContent = speedLevel.toFixed(1);
  messageEl.textContent = "太陽を集めろ。モンスターは避けろ。";
  startBtn.textContent = "プレイ中";
  startBtn.disabled = true;
  playerEl.classList.remove("invincible");
  invincibleText.classList.add("hidden");

  updatePlayerPosition();

  animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
  if (!playing) {
    return;
  }

  playing = false;
  moveDirection = 0;
  stopLoop();

  messageEl.textContent = `ゲーム終了！スコアは ${score}`;
  startBtn.textContent = "もう一度";
  startBtn.disabled = false;
  playerEl.classList.remove("invincible");
  invincibleText.classList.add("hidden");

  submitScore("sunvader", score).then(() => {
    showRanking("sunvader", "week");
  });
}

function stopLoop() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

function gameLoop(now) {
  if (!playing) {
    return;
  }

  const delta = Math.min((now - lastTime) / 1000, 0.04);
  lastTime = now;

  updatePlayer(delta);
  updateInvincible(now);
  updateSpawning(delta);
  updateObjects(delta);
  checkCollisions();

  animationId = requestAnimationFrame(gameLoop);
}

function updatePlayer(delta) {
  const moveSpeed = 64;
  playerX += moveDirection * moveSpeed * delta;

  if (playerX < 7) {
    playerX = 7;
  }

  if (playerX > 93) {
    playerX = 93;
  }

  updatePlayerPosition();
}

function updatePlayerPosition() {
  playerEl.style.left = `${playerX}%`;
}

function updateInvincible(now) {
  const isInvincible = now < invincibleUntil;

  playerEl.classList.toggle("invincible", isInvincible);
  invincibleText.classList.toggle("hidden", !isInvincible);
}

function updateSpawning(delta) {
  const spawnInterval = Math.max(0.36, 0.86 - speedLevel * 0.05);

  spawnTimer += delta;

  if (spawnTimer >= spawnInterval) {
    spawnTimer = 0;
    spawnObject();
  }
}

function spawnObject() {
  const random = Math.random();

  let type = "sun100";
  let value = 100;

  if (random < 0.1) {
    type = "rainbow";
    value = 0;
  } else if (random < 0.24) {
    type = "sun500";
    value = 500;
  } else if (random < 0.46) {
    type = "sun300";
    value = 300;
  } else if (random < 0.76) {
    type = "sun100";
    value = 100;
  } else {
    type = "monster";
    value = 0;
  }

  const objectEl = document.createElement("div");
  objectEl.className = `sunvader-object ${type}`;

  if (type === "monster") {
    objectEl.innerHTML = `
      <span class="monster">
        <span class="monster-eye left"></span>
        <span class="monster-eye right"></span>
        <span class="monster-mouth"></span>
      </span>
    `;
  } else if (type === "rainbow") {
    objectEl.innerHTML = `
      <span class="sun sun-rainbow"></span>
    `;
  } else if (type === "sun500") {
    objectEl.innerHTML = `
      <span class="sun sun-500"></span>
    `;
  } else if (type === "sun300") {
    objectEl.innerHTML = `
      <span class="sun sun-300"></span>
    `;
  } else {
    objectEl.innerHTML = `
      <span class="sun sun-100"></span>
    `;
  }

  const x = 8 + Math.random() * 84;

  const object = {
    el: objectEl,
    type,
    value,
    x,
    y: -8,
    caught: false
  };

  objectEl.style.left = `${x}%`;
  objectEl.style.top = `${object.y}%`;

  fieldEl.appendChild(objectEl);
  objects.push(object);
}

function updateObjects(delta) {
  const fallSpeed = 24 + speedLevel * 7;

  objects.forEach(object => {
    object.y += fallSpeed * delta;
    object.el.style.top = `${object.y}%`;
  });

  objects = objects.filter(object => {
    if (object.y > 110) {
      object.el.remove();
      return false;
    }

    return true;
  });
}

function checkCollisions() {
  const playerRect = playerEl.getBoundingClientRect();

  objects.forEach(object => {
    if (object.caught) {
      return;
    }

    const objectRect = object.el.getBoundingClientRect();

    if (!isHit(playerRect, objectRect)) {
      return;
    }

    object.caught = true;

    if (object.type === "monster") {
      if (performance.now() < invincibleUntil) {
        removeObject(object);
        return;
      }

      endGame();
      return;
    }

    if (object.type === "rainbow") {
      invincibleUntil = performance.now() + 3000;
      messageEl.textContent = "3秒間無敵！";
      removeObject(object);
      return;
    }

    score += object.value;
    scoreEl.textContent = score;

    speedLevel += 0.08;
    speedEl.textContent = speedLevel.toFixed(1);

    messageEl.textContent = `${object.value}ポイント獲得！`;
    removeObject(object);
  });

  objects = objects.filter(object => !object.caught);
}

function removeObject(object) {
  object.el.remove();
}

function isHit(rectA, rectB) {
  const padding = 8;

  return !(
    rectA.right - padding < rectB.left + padding ||
    rectA.left + padding > rectB.right - padding ||
    rectA.bottom - padding < rectB.top + padding ||
    rectA.top + padding > rectB.bottom - padding
  );
}

function startMove(direction) {
  if (!playing) {
    return;
  }

  moveDirection = direction;
}

function stopMove(direction) {
  if (moveDirection === direction) {
    moveDirection = 0;
  }
}

leftControl.addEventListener("pointerdown", event => {
  event.preventDefault();
  startMove(-1);
});

rightControl.addEventListener("pointerdown", event => {
  event.preventDefault();
  startMove(1);
});

leftControl.addEventListener("pointerup", event => {
  event.preventDefault();
  stopMove(-1);
});

rightControl.addEventListener("pointerup", event => {
  event.preventDefault();
  stopMove(1);
});

leftControl.addEventListener("pointercancel", () => {
  stopMove(-1);
});

rightControl.addEventListener("pointercancel", () => {
  stopMove(1);
});

leftControl.addEventListener("pointerleave", () => {
  stopMove(-1);
});

rightControl.addEventListener("pointerleave", () => {
  stopMove(1);
});

document.addEventListener("keydown", event => {
  if (!playing) {
    return;
  }

  if (event.key === "ArrowLeft") {
    moveDirection = -1;
  }

  if (event.key === "ArrowRight") {
    moveDirection = 1;
  }
});

document.addEventListener("keyup", event => {
  if (event.key === "ArrowLeft" && moveDirection === -1) {
    moveDirection = 0;
  }

  if (event.key === "ArrowRight" && moveDirection === 1) {
    moveDirection = 0;
  }
});

startBtn.onclick = () => {
  startGame();
};
