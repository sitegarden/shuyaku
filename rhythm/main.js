// rhythm/main.js

import { SONGS, getSongById, getDifficulty } from "./songs.js";
import { getChart } from "./charts.js";
import {
  saveScore,
  getRanking,
  getPeriodLabel,
  getRoleLabel
} from "./score.js";

/* =========================
   DOM
========================= */

const rhythmHeaderTitle = document.getElementById("rhythmHeaderTitle");
const rhythmHeaderLead = document.getElementById("rhythmHeaderLead");

const rhythmBackBtn = document.getElementById("rhythmBackBtn");
const rhythmRankingBtn = document.getElementById("rhythmRankingBtn");

const tabSongsBtn = document.getElementById("tabSongsBtn");
const tabRankingBtn = document.getElementById("tabRankingBtn");

const songScreen = document.getElementById("songScreen");
const difficultyScreen = document.getElementById("difficultyScreen");
const rankingScreen = document.getElementById("rankingScreen");
const playScreen = document.getElementById("playScreen");
const resultScreen = document.getElementById("resultScreen");

const songList = document.getElementById("songList");
const difficultyList = document.getElementById("difficultyList");

const selectedSongTitle = document.getElementById("selectedSongTitle");
const selectedSongInfo = document.getElementById("selectedSongInfo");

const rankingSongTabs = document.getElementById("rankingSongTabs");
const rankingDifficultyTabs = document.getElementById("rankingDifficultyTabs");
const rankingPeriodButtons = document.querySelectorAll(".ranking-period-tabs button");
const rankingArea = document.getElementById("rankingArea");

const playBackBtn = document.getElementById("playBackBtn");
const laneArea = document.getElementById("laneArea");
const laneButtons = document.querySelectorAll(".lane-button");

const scoreText = document.getElementById("scoreText");
const comboText = document.getElementById("comboText");
const judgeText = document.getElementById("judgeText");
const startPlayBtn = document.getElementById("startPlayBtn");

const resultSongName = document.getElementById("resultSongName");
const resultScore = document.getElementById("resultScore");
const resultMaxCombo = document.getElementById("resultMaxCombo");
const resultPerfect = document.getElementById("resultPerfect");
const resultGood = document.getElementById("resultGood");
const resultMiss = document.getElementById("resultMiss");
const resultMessage = document.getElementById("resultMessage");

const retryBtn = document.getElementById("retryBtn");
const resultRankingBtn = document.getElementById("resultRankingBtn");
const backToSongsBtn = document.getElementById("backToSongsBtn");

/* =========================
   state
========================= */

let selectedSongId = SONGS[0]?.id || "";
let selectedDifficultyId = SONGS[0]?.difficulties?.[0]?.id || "easy";

let rankingSongId = selectedSongId;
let rankingDifficultyId = selectedDifficultyId;
let rankingPeriod = "month";

let audio = null;
let notes = [];

let isPlaying = false;
let isReady = false;
let isFinishing = false;

let animationId = null;
let finishTimerId = null;

let playStartedAt = 0;
let pausedAt = 0;

let score = 0;
let combo = 0;
let maxCombo = 0;

let perfectCount = 0;
let greatCount = 0;
let goodCount = 0;
let badCount = 0;
let missCount = 0;

let achievedComboBonuses = [];

/* =========================
   settings
========================= */

const DIFFICULTY_SPEEDS = {
  easy: 280,
  normal: 390,
  hard: 520,
  expert: 670,
  hell: 760
};

const JUDGE_WINDOWS = {
  PERFECT: 0.045,
  GREAT: 0.085,
  GOOD: 0.13,
  BAD: 0.17
};

const SCORE_TABLE = {
  PERFECT: 1000,
  GREAT: 700,
  GOOD: 400,
  BAD: 100,
  MISS: 0
};

const COMBO_BONUSES = [
  { combo: 50, bonus: 5000 },
  { combo: 100, bonus: 12000 },
  { combo: 200, bonus: 30000 },
  { combo: 300, bonus: 50000 }
];

const KEY_TO_LANE = {
  d: 0,
  f: 1,
  j: 2,
  k: 3
};

/* =========================
   init
========================= */

init();

function init() {
  renderSongs();
  renderRankingControls();
  setupEvents();

  showScreen("songs");
  updateHeader("songs");
}

/* =========================
   render
========================= */

function renderSongs() {
  if (!songList) return;

  songList.innerHTML = "";

  SONGS.forEach((song) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "song-card";

    const difficulties = song.difficulties
      .map((difficulty) => difficulty.label)
      .join(" / ");

    button.innerHTML = `
      <strong>${escapeHtml(song.title)}</strong>
      <span>${escapeHtml(song.description || "")}</span>
      <div class="song-meta">
        <small>${escapeHtml(song.artist || "UNKNOWN")}</small>
        <small>BPM ${escapeHtml(String(song.bpm || "-"))}</small>
        <small>${escapeHtml(difficulties)}</small>
      </div>
    `;

    button.addEventListener("click", () => {
      selectSong(song.id);
    });

    songList.appendChild(button);
  });
}

function renderDifficulties(song) {
  if (!difficultyList || !song) return;

  difficultyList.innerHTML = "";

  selectedSongTitle.textContent = song.title;
  selectedSongInfo.textContent = `${song.artist} / BPM ${song.bpm}`;

  song.difficulties.forEach((difficulty) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "difficulty-card";

    button.innerHTML = `
      <div>
        <strong>${escapeHtml(difficulty.label)}</strong>
        <span>${escapeHtml(difficulty.description || "")}</span>
      </div>
      <div class="difficulty-badge">Lv.${escapeHtml(String(difficulty.level || "-"))}</div>
    `;

    button.addEventListener("click", () => {
      startDifficulty(song.id, difficulty.id);
    });

    difficultyList.appendChild(button);
  });
}

function renderRankingControls() {
  renderRankingSongTabs();
  renderRankingDifficultyTabs();
  setupRankingPeriodButtons();
}

function renderRankingSongTabs() {
  if (!rankingSongTabs) return;

  rankingSongTabs.innerHTML = "";

  SONGS.forEach((song) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ranking-song-tab";

    if (song.id === rankingSongId) {
      button.classList.add("active");
    }

    button.textContent = song.title;

    button.addEventListener("click", () => {
      rankingSongId = song.id;

      const firstDifficulty = song.difficulties?.[0];

      if (firstDifficulty) {
        rankingDifficultyId = firstDifficulty.id;
      }

      renderRankingSongTabs();
      renderRankingDifficultyTabs();
      setupRankingPeriodButtons();
      loadAndRenderRanking();
    });

    rankingSongTabs.appendChild(button);
  });
}

function renderRankingDifficultyTabs() {
  if (!rankingDifficultyTabs) return;

  const song = getSongById(rankingSongId);

  rankingDifficultyTabs.innerHTML = "";

  if (!song) return;

  song.difficulties.forEach((difficulty) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ranking-difficulty-tab";

    if (difficulty.id === rankingDifficultyId) {
      button.classList.add("active");
    }

    button.textContent = difficulty.label;

    button.addEventListener("click", () => {
      rankingDifficultyId = difficulty.id;

      renderRankingDifficultyTabs();
      loadAndRenderRanking();
    });

    rankingDifficultyTabs.appendChild(button);
  });
}

function setupRankingPeriodButtons() {
  rankingPeriodButtons.forEach((button) => {
    const period = button.dataset.period || "month";

    button.classList.toggle("active", period === rankingPeriod);

    button.onclick = () => {
      rankingPeriod = period;

      setupRankingPeriodButtons();
      loadAndRenderRanking();
    };
  });
}

async function loadAndRenderRanking() {
  if (!rankingArea) return;

  const song = getSongById(rankingSongId);
  const difficulty = getDifficulty(song, rankingDifficultyId);

  rankingArea.innerHTML = `
    <div class="ranking-loading">
      ランキング読み込み中...
    </div>
  `;

  try {
    const ranking = await getRanking({
      songId: rankingSongId,
      difficultyId: rankingDifficultyId,
      period: rankingPeriod,
      max: 20
    });

    if (!ranking.length) {
      rankingArea.innerHTML = `
        <div class="ranking-empty">
          ${escapeHtml(song?.title || "この曲")} / ${escapeHtml(difficulty?.label || "")} / ${escapeHtml(getPeriodLabel(rankingPeriod))}<br>
          まだスコアがありません。
        </div>
      `;
      return;
    }

    let rank = 1;

    rankingArea.innerHTML = ranking.map((item) => {
      const roleLabel = item.roleLabel || getRoleLabel(item.role);

      const html = `
        <div class="ranking-item">
          <div class="ranking-rank">${rank}</div>

          <div class="ranking-player">
            <img
              class="ranking-icon"
              src="${escapeAttribute(item.iconPath || "/favicon.png")}"
              alt=""
            >

            <div class="ranking-player-text">
              <strong>${escapeHtml(item.name || "ななし")}</strong>
              <small>${escapeHtml(item.title || roleLabel || "プレイヤー")}</small>
            </div>
          </div>

          <div class="ranking-score">${escapeHtml(String(item.score || 0))}</div>
        </div>
      `;

      rank += 1;

      return html;
    }).join("");
  } catch (error) {
    console.error(error);

    rankingArea.innerHTML = `
      <div class="ranking-empty">
        ランキングの読み込みに失敗しました。
      </div>
    `;
  }
}

/* =========================
   screen
========================= */

function showScreen(screenName) {
  const screens = {
    songs: songScreen,
    difficulty: difficultyScreen,
    ranking: rankingScreen,
    play: playScreen,
    result: resultScreen
  };

  Object.keys(screens).forEach((key) => {
    screens[key]?.classList.toggle("active", key === screenName);
  });

  tabSongsBtn?.classList.toggle(
    "active",
    screenName === "songs" || screenName === "difficulty"
  );

  tabRankingBtn?.classList.toggle("active", screenName === "ranking");

  document.body.classList.toggle("is-play-screen", screenName === "play");

  const shouldShowBack = screenName !== "songs" && screenName !== "play";
  const shouldShowRanking = screenName !== "ranking" && screenName !== "play";

  rhythmBackBtn?.classList.toggle("hidden", !shouldShowBack);
  rhythmRankingBtn?.classList.toggle("hidden", !shouldShowRanking);
}

function updateHeader(mode) {
  if (!rhythmHeaderTitle || !rhythmHeaderLead) return;

  if (mode === "ranking") {
    rhythmHeaderTitle.innerHTML = "スコアで、<br>主役になろう。";
    rhythmHeaderLead.textContent = "曲と難易度ごとのランキングをチェックできます。";
    return;
  }

  if (mode === "difficulty") {
    const song = getSongById(selectedSongId);

    rhythmHeaderTitle.innerHTML = "難易度を、<br>選ぼう。";
    rhythmHeaderLead.textContent = song
      ? `${song.title} をどの難しさで遊ぶ？`
      : "遊ぶ難易度を選んでください。";
    return;
  }

  if (mode === "result") {
    rhythmHeaderTitle.innerHTML = "リザルト、<br>出ました。";
    rhythmHeaderLead.textContent = "おつかれさま。ランキングにも挑戦しよう。";
    return;
  }

  rhythmHeaderTitle.innerHTML = "音に合わせて、<br>主役になろう。";
  rhythmHeaderLead.textContent = "曲を選んで、タイミングよくタップ。ハイスコアを狙おう。";
}

/* =========================
   select
========================= */

function selectSong(songId) {
  const song = getSongById(songId);

  if (!song) return;

  selectedSongId = song.id;
  selectedDifficultyId = song.difficulties?.[0]?.id || "easy";

  renderDifficulties(song);

  showScreen("difficulty");
  updateHeader("difficulty");
  scrollToTop();
}

function startDifficulty(songId, difficultyId) {
  const song = getSongById(songId);
  const difficulty = getDifficulty(song, difficultyId);

  if (!song || !difficulty) return;

  selectedSongId = song.id;
  selectedDifficultyId = difficulty.id;

  prepareGame();

  showScreen("play");
  updateHeader("play");
}

/* =========================
   game setup
========================= */

function prepareGame() {
  resetGameState();
  clearNotes();

  const song = getSongById(selectedSongId);

  if (!song) {
    showJudge("NO SONG");
    return;
  }

  const chartRows = getChart(selectedSongId, selectedDifficultyId);

  notes = parseChartRows({
    rows: chartRows,
    bpm: song.bpm,
    offset: song.offset || 0
  });

  audio = new Audio(song.audio);
  audio.preload = "auto";

  audio.addEventListener("ended", () => {
    finishGame();
  });

  updateStatusTexts();

  startPlayBtn.textContent = "スタート";
  isReady = true;
}

function resetGameState() {
  stopGameLoop();
  stopMusic();

  isPlaying = false;
  isReady = false;
  isFinishing = false;

  playStartedAt = 0;
  pausedAt = 0;

  score = 0;
  combo = 0;
  maxCombo = 0;

  perfectCount = 0;
  greatCount = 0;
  goodCount = 0;
  badCount = 0;
  missCount = 0;

  achievedComboBonuses = [];

  updateStatusTexts();
}

function parseChartRows({ rows, bpm, offset = 0 }) {
  const stepTime = getSixteenthTime(bpm);
  const parsedNotes = [];

  rows.forEach((row, stepIndex) => {
    const time = stepIndex * stepTime + offset;
    const cells = String(row || "0000").split("");
    const noteCount = cells.filter((cell) => cell === "1").length;
    const isChord = noteCount >= 2;

    cells.forEach((cell, lane) => {
      if (cell !== "1") return;

      parsedNotes.push({
        time,
        lane,
        isChord,
        hit: false,
        missed: false,
        element: null
      });
    });
  });

  return parsedNotes;
}

function getSixteenthTime(bpm) {
  const quarter = 60 / bpm;

  return quarter / 4;
}

/* =========================
   play
========================= */

async function startGame() {
  if (!isReady || isPlaying) return;

  const song = getSongById(selectedSongId);

  if (!song || !audio) {
    showJudge("NO AUDIO");
    return;
  }

  try {
    isPlaying = true;
    isFinishing = false;

    showJudge("READY");

    audio.currentTime = 0;
    await audio.play();

    playStartedAt = performance.now() - audio.currentTime * 1000;

    startPlayBtn.textContent = "プレイ中";
    startPlayBtn.disabled = true;

    startGameLoop();
  } catch (error) {
    console.error(error);

    isPlaying = false;
    startPlayBtn.disabled = false;
    startPlayBtn.textContent = "スタート";

    showJudge("音が出せません");

    alert("音が再生できませんでした。スマホの場合はマナーモードを解除して、もう一度スタートしてみてください。");
  }
}

function startGameLoop() {
  stopGameLoop();

  const loop = () => {
    if (!isPlaying) return;

    const currentTime = getCurrentTime();

    updateNotes(currentTime);
    checkMisses(currentTime);

    animationId = requestAnimationFrame(loop);
  };

  animationId = requestAnimationFrame(loop);
}

function stopGameLoop() {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  animationId = null;

  if (finishTimerId) {
    clearTimeout(finishTimerId);
  }

  finishTimerId = null;
}

function stopMusic() {
  if (!audio) return;

  audio.pause();
  audio.currentTime = 0;
}

function getCurrentTime() {
  if (!isPlaying) {
    return pausedAt;
  }

  if (audio && Number.isFinite(audio.currentTime)) {
    return audio.currentTime;
  }

  return Math.max(0, (performance.now() - playStartedAt) / 1000);
}

/* =========================
   notes
========================= */

function updateNotes(currentTime) {
  const hitY = getHitY();
  const speed = getNoteSpeed();

  notes.forEach((note) => {
    if (note.hit || note.missed) return;

    const y = hitY - (note.time - currentTime) * speed;

    if (y < -80) {
      return;
    }

    if (!note.element) {
      createNoteElement(note);
    }

    note.element.style.top = `${y}px`;
  });
}

function createNoteElement(note) {
  const noteElement = document.createElement("div");

  noteElement.className = `note lane-${note.lane}`;

  if (note.isChord) {
    noteElement.classList.add("chord-note");
  }

  laneArea.appendChild(noteElement);
  note.element = noteElement;
}

function clearNotes() {
  document.querySelectorAll(".note").forEach((note) => {
    note.remove();
  });
}

function checkMisses(currentTime) {
  notes.forEach((note) => {
    if (note.hit || note.missed) return;

    const diff = currentTime - note.time;

    if (diff > JUDGE_WINDOWS.BAD) {
      missNote(note);
    }
  });

  const allDone = notes.every((note) => note.hit || note.missed);

  if (allDone && isPlaying && !isFinishing) {
    isFinishing = true;

    finishTimerId = setTimeout(() => {
      finishGame();
    }, 700);
  }
}

function missNote(note) {
  note.missed = true;
  missCount += 1;

  if (note.element) {
    note.element.classList.add("miss");
    setTimeout(() => {
      note.element?.remove();
    }, 120);
  }

  combo = 0;

  showJudge("MISS");
  updateStatusTexts();
}

/* =========================
   hit
========================= */

function hitLane(lane) {
  if (!isPlaying) return;

  flashLane(lane);

  const currentTime = getCurrentTime();

  const target = findTargetNote(lane, currentTime);

  if (!target) {
    showTapEffect(lane);
    return;
  }

  const result = judge(target.time - currentTime);

  if (!result) {
    showTapEffect(lane);
    return;
  }

  target.hit = true;

  if (target.element) {
    target.element.classList.add("hit");
    setTimeout(() => {
      target.element?.remove();
    }, 100);
  }

  countJudge(result);
  addScore(result);

  if (result === "BAD") {
    combo = 0;
  } else {
    combo += 1;

    if (combo > maxCombo) {
      maxCombo = combo;
    }

    checkComboBonus();
  }

  showJudge(result);
  updateStatusTexts();
}

function findTargetNote(lane, currentTime) {
  const candidates = notes
    .filter((note) => {
      return (
        !note.hit &&
        !note.missed &&
        note.lane === lane &&
        Math.abs(note.time - currentTime) <= JUDGE_WINDOWS.BAD
      );
    })
    .sort((a, b) => {
      return Math.abs(a.time - currentTime) - Math.abs(b.time - currentTime);
    });

  return candidates[0] || null;
}

function judge(diff) {
  const abs = Math.abs(diff);

  if (abs <= JUDGE_WINDOWS.PERFECT) return "PERFECT";
  if (abs <= JUDGE_WINDOWS.GREAT) return "GREAT";
  if (abs <= JUDGE_WINDOWS.GOOD) return "GOOD";
  if (abs <= JUDGE_WINDOWS.BAD) return "BAD";

  return null;
}

function countJudge(result) {
  if (result === "PERFECT") perfectCount += 1;
  if (result === "GREAT") greatCount += 1;
  if (result === "GOOD") goodCount += 1;
  if (result === "BAD") badCount += 1;
}

function addScore(result) {
  score += SCORE_TABLE[result] || 0;
}

function checkComboBonus() {
  COMBO_BONUSES.forEach((item) => {
    const already = achievedComboBonuses.includes(item.combo);

    if (combo >= item.combo && !already) {
      achievedComboBonuses.push(item.combo);
      score += item.bonus;
      showJudge(`${item.combo} COMBO BONUS!`);
    }
  });
}

/* =========================
   effects
========================= */

function flashLane(lane) {
  const button = document.querySelector(`.lane-button[data-lane="${lane}"]`);

  if (!button) return;

  button.classList.add("active");

  setTimeout(() => {
    button.classList.remove("active");
  }, 90);
}

function showTapEffect(lane) {
  const effect = document.createElement("div");

  effect.className = "tap-effect";
  effect.style.position = "absolute";
  effect.style.left = `${12.5 + lane * 25}%`;
  effect.style.bottom = "110px";
  effect.style.width = "34px";
  effect.style.height = "34px";
  effect.style.border = "3px solid #30283a";
  effect.style.borderRadius = "50%";
  effect.style.background = "rgba(255, 243, 191, 0.75)";
  effect.style.transform = "translateX(-50%)";
  effect.style.pointerEvents = "none";
  effect.style.zIndex = "5";

  laneArea.appendChild(effect);

  setTimeout(() => {
    effect.remove();
  }, 140);
}

function showJudge(text) {
  judgeText.textContent = text;
}

function updateStatusTexts() {
  scoreText.textContent = String(score);
  comboText.textContent = String(combo);
}

/* =========================
   finish / result
========================= */

async function finishGame() {
  if (!isPlaying && !isFinishing) return;

  isPlaying = false;
  isFinishing = false;
  isReady = false;

  stopGameLoop();

  if (audio) {
    audio.pause();
  }

  startPlayBtn.disabled = false;
  startPlayBtn.textContent = "スタート";

  clearNotes();
  await showResult();
}

async function showResult() {
  const song = getSongById(selectedSongId);
  const difficulty = getDifficulty(song, selectedDifficultyId);

  resultSongName.textContent = `${song?.title || "---"} / ${difficulty?.label || ""}`;
  resultScore.textContent = String(score);
  resultMaxCombo.textContent = String(maxCombo);
  resultPerfect.textContent = String(perfectCount);
  resultGood.textContent = String(greatCount + goodCount + badCount);
  resultMiss.textContent = String(missCount);

  resultMessage.textContent = "スコア保存中...";

  showScreen("result");
  updateHeader("result");
  scrollToTop();

  try {
    const result = await saveScore({
      songId: selectedSongId,
      difficultyId: selectedDifficultyId,
      score
    });

    if (result.ok) {
      resultMessage.textContent = "スコアを保存しました！";
    } else {
      resultMessage.textContent = result.reason || "スコアを保存できませんでした。";
    }
  } catch (error) {
    console.error(error);
    resultMessage.textContent = "スコア保存に失敗しました。";
  }
}

/* =========================
   events
========================= */

function setupEvents() {
  tabSongsBtn?.addEventListener("click", () => {
    if (isPlaying) return;

    showScreen("songs");
    updateHeader("songs");
    scrollToTop();
  });

  tabRankingBtn?.addEventListener("click", () => {
    if (isPlaying) return;

    openRanking();
  });

  rhythmBackBtn?.addEventListener("click", () => {
    if (isPlaying) return;

    showScreen("songs");
    updateHeader("songs");
    scrollToTop();
  });

  rhythmRankingBtn?.addEventListener("click", () => {
    if (isPlaying) return;

    openRanking();
  });

  playBackBtn?.addEventListener("click", () => {
    confirmBackFromPlay();
  });

  startPlayBtn?.addEventListener("click", () => {
    startGame();
  });

  laneButtons.forEach((button) => {
    const lane = Number(button.dataset.lane);

    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      hitLane(lane);
    });
  });

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if (!Object.prototype.hasOwnProperty.call(KEY_TO_LANE, key)) {
      return;
    }

    event.preventDefault();
    hitLane(KEY_TO_LANE[key]);
  });

  retryBtn?.addEventListener("click", () => {
    prepareGame();
    showScreen("play");
    updateHeader("play");
  });

  resultRankingBtn?.addEventListener("click", () => {
    rankingSongId = selectedSongId;
    rankingDifficultyId = selectedDifficultyId;
    rankingPeriod = "month";

    renderRankingControls();
    openRanking();
  });

  backToSongsBtn?.addEventListener("click", () => {
    showScreen("songs");
    updateHeader("songs");
    scrollToTop();
  });

  window.addEventListener("pagehide", () => {
    stopGameLoop();
    stopMusic();
  });
}

function openRanking() {
  showScreen("ranking");
  updateHeader("ranking");
  renderRankingControls();
  loadAndRenderRanking();
  scrollToTop();
}

function confirmBackFromPlay() {
  if (isPlaying) {
    const ok = confirm("プレイ中の曲を終了して戻りますか？");

    if (!ok) return;
  }

  resetGameState();
  clearNotes();

  showScreen("songs");
  updateHeader("songs");
  scrollToTop();
}

/* =========================
   helpers
========================= */

function getHitY() {
  return laneArea.clientHeight - 92;
}

function getNoteSpeed() {
  const song = getSongById(selectedSongId);
  const difficulty = getDifficulty(song, selectedDifficultyId);

  if (difficulty?.speed) {
    return difficulty.speed;
  }

  return DIFFICULTY_SPEEDS[selectedDifficultyId] || DIFFICULTY_SPEEDS.normal;
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
