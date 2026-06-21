import { submitScore } from "../../games/ranking.js";

const GAME_ID = "event_star";
const GAME_TIME = 30_000;
const PLAYER_WIDTH = 64;
const STAR_SIZE = 34;

export function initStarGame(container) {
  if (!container) {
    return () => {};
  }

  let score = 0;
  let isPlaying = false;
  let animationId = null;
  let lastTime = 0;
  let startedAt = 0;
  let spawnTimer = 0;
  let playerX = 50;
  let moveLeft = false;
  let moveRight = false;
  let stars = [];
  let isDestroyed = false;

  container.innerHTML = `
    <div class="star-game">
      <div class="star-game-top">
        <div class="star-game-score-box">
          <span>SCORE</span>
          <strong id="starScoreText">0</strong>
        </div>

        <div class="star-game-time-box">
          <span>TIME</span>
          <strong id="starTimeText">30</strong>
        </div>
      </div>

      <div id="starGameField" class="star-game-field">
        <div id="starGameMessage" class="star-game-message">
          <strong>星をたくさん集めよう！</strong>
          <span>左右に動いて、落ちてくる星をキャッチ</span>

          <button type="button" id="startStarGameBtn" class="star-start-btn">
            スタート
          </button>
        </div>

        <div id="starPlayer" class="star-player" aria-label="プレイヤー">
          🛸
        </div>
      </div>

      <div class="star-game-controls">
        <button type="button" id="starLeftBtn" class="star-control-btn">
          ←
        </button>

        <p>
          左右のボタンか、画面をタップして動かせるよ
        </p>

        <button type="button" id="starRightBtn" class="star-control-btn">
          →
        </button>
      </div>
    </div>
  `;

  const field = container.querySelector("#starGameField");
  const player = container.querySelector("#starPlayer");
  const scoreText = container.querySelector("#starScoreText");
  const timeText = container.querySelector("#starTimeText");
  const message = container.querySelector("#starGameMessage");
  const startBtn = container.querySelector("#startStarGameBtn");
  const leftBtn = container.querySelector("#starLeftBtn");
  const rightBtn = container.querySelector("#starRightBtn");

  const setPlayerPosition = () => {
    if (!field || !player) return;

    const fieldWidth = field.clientWidth;
    const maxX = Math.max(0, fieldWidth - PLAYER_WIDTH);
    const x = (maxX * playerX) / 100;

    player.style.left = `${x}px`;
  };

  const updateScore = () => {
    if (scoreText) {
      scoreText.textContent = String(score);
    }
  };

  const updateTime = () => {
    if (!timeText) return;

    const passed = Date.now() - startedAt;
    const remain = Math.max(0, GAME_TIME - passed);
    timeText.textContent = String(Math.ceil(remain / 1000));
  };

  const createStar = () => {
    if (!field) return;

    const fieldWidth = field.clientWidth;
    const maxX = Math.max(0, fieldWidth - STAR_SIZE);
    const x = Math.random() * maxX;

    const element = document.createElement("div");
    element.className = "falling-star";
    element.textContent = "⭐";
    element.style.left = `${x}px`;
    element.style.top = `${-STAR_SIZE}px`;

    field.appendChild(element);

    stars.push({
      element,
      x,
      y: -STAR_SIZE,
      speed: 150 + Math.random() * 120
    });
  };

  const removeStar = (star) => {
    star.element?.remove();
  };

  const clearStars = () => {
    stars.forEach(removeStar);
    stars = [];
  };

  const endGame = async () => {
    if (!isPlaying) return;

    isPlaying = false;

    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    clearStars();

    if (message) {
      message.classList.remove("hidden");
      message.innerHTML = `
        <strong>結果：${score}点！</strong>
        <span>ベストスコアを更新できたかな？</span>

        <button type="button" id="restartStarGameBtn" class="star-start-btn">
          もう一度遊ぶ
        </button>
      `;

      const restartBtn = message.querySelector("#restartStarGameBtn");
      restartBtn?.addEventListener("click", startGame);
    }

   try {
  const { submitScore } = await import("../../games/ranking.js");
  await submitScore(GAME_ID, score);
} catch (error) {
  console.error("スコア保存に失敗しました。", error);
}
  };

  const update = (timestamp) => {
    if (!isPlaying || isDestroyed) return;

    const delta = Math.min(40, timestamp - lastTime || 0);
    lastTime = timestamp;

    if (moveLeft) {
      playerX -= (delta / 16) * 1.8;
    }

    if (moveRight) {
      playerX += (delta / 16) * 1.8;
    }

    playerX = Math.max(0, Math.min(100, playerX));
    setPlayerPosition();

    spawnTimer += delta;

    if (spawnTimer >= 520) {
      createStar();
      spawnTimer = 0;
    }

    const fieldHeight = field?.clientHeight || 0;
    const fieldWidth = field?.clientWidth || 0;
    const playerLeft = ((Math.max(0, fieldWidth - PLAYER_WIDTH) * playerX) / 100);
    const playerTop = Math.max(0, fieldHeight - 84);

    stars = stars.filter((star) => {
      star.y += star.speed * (delta / 1000);
      star.element.style.top = `${star.y}px`;

      const starBottom = star.y + STAR_SIZE;
      const starRight = star.x + STAR_SIZE;
      const playerRight = playerLeft + PLAYER_WIDTH;
      const playerBottom = playerTop + 58;

      const caught =
        starRight > playerLeft &&
        star.x < playerRight &&
        starBottom > playerTop &&
        star.y < playerBottom;

      if (caught) {
        score += 10;
        updateScore();
        removeStar(star);
        return false;
      }

      if (star.y > fieldHeight + STAR_SIZE) {
        removeStar(star);
        return false;
      }

      return true;
    });

    updateTime();

    if (Date.now() - startedAt >= GAME_TIME) {
      endGame();
      return;
    }

    animationId = requestAnimationFrame(update);
  };

  function startGame() {
    if (isPlaying) return;

    score = 0;
    playerX = 50;
    spawnTimer = 0;
    lastTime = 0;
    startedAt = Date.now();
    isPlaying = true;

    clearStars();
    updateScore();
    updateTime();
    setPlayerPosition();

    if (message) {
      message.classList.add("hidden");
    }

    animationId = requestAnimationFrame(update);
  }

  const movePlayerToPointer = (clientX) => {
    if (!field || !isPlaying) return;

    const rect = field.getBoundingClientRect();
    const localX = clientX - rect.left - PLAYER_WIDTH / 2;
    const maxX = Math.max(1, rect.width - PLAYER_WIDTH);

    playerX = Math.max(0, Math.min(100, (localX / maxX) * 100));
    setPlayerPosition();
  };

  const onKeyDown = (event) => {
    if (!isPlaying) return;

    if (event.key === "ArrowLeft") {
      moveLeft = true;
      event.preventDefault();
    }

    if (event.key === "ArrowRight") {
      moveRight = true;
      event.preventDefault();
    }
  };

  const onKeyUp = (event) => {
    if (event.key === "ArrowLeft") {
      moveLeft = false;
    }

    if (event.key === "ArrowRight") {
      moveRight = false;
    }
  };

  const startMoveLeft = () => {
    moveLeft = true;
  };

  const stopMoveLeft = () => {
    moveLeft = false;
  };

  const startMoveRight = () => {
    moveRight = true;
  };

  const stopMoveRight = () => {
    moveRight = false;
  };

  startBtn?.addEventListener("click", startGame);

  field?.addEventListener("pointerdown", (event) => {
    movePlayerToPointer(event.clientX);
  });

  field?.addEventListener("pointermove", (event) => {
    if (event.buttons === 1) {
      movePlayerToPointer(event.clientX);
    }
  });

  leftBtn?.addEventListener("pointerdown", startMoveLeft);
  leftBtn?.addEventListener("pointerup", stopMoveLeft);
  leftBtn?.addEventListener("pointerleave", stopMoveLeft);
  leftBtn?.addEventListener("pointercancel", stopMoveLeft);

  rightBtn?.addEventListener("pointerdown", startMoveRight);
  rightBtn?.addEventListener("pointerup", stopMoveRight);
  rightBtn?.addEventListener("pointerleave", stopMoveRight);
  rightBtn?.addEventListener("pointercancel", stopMoveRight);

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("resize", setPlayerPosition);

  setPlayerPosition();

  return () => {
    isDestroyed = true;
    isPlaying = false;

    if (animationId) {
      cancelAnimationFrame(animationId);
    }

    clearStars();

    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("resize", setPlayerPosition);
  };
}
