// ranking.js

import { auth, db } from "../js/firebase.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* =========================
   score submit
========================= */

export async function submitScore(gameId, score) {
  const numericScore = toSafeScore(score);

  if (!gameId || Number.isNaN(numericScore)) {
    return;
  }

  const player = await getPlayerData();

  const periods = [
    getPeriodKey(gameId, "month"),
    getPeriodKey(gameId, "all")
  ];

  await Promise.all(
    periods.map((periodKey) => {
      return saveBestScore(periodKey, player, numericScore);
    })
  );
}

async function saveBestScore(periodKey, player, score) {
  const scoreRef = doc(db, "rankings", periodKey, "scores", player.uid);
  const scoreSnap = await getDoc(scoreRef);

  const oldScore = scoreSnap.exists()
  ? toSafeScore(scoreSnap.data().score)
  : 0;

  if (score <= oldScore) {
    return;
  }

  await setDoc(scoreRef, {
    uid: player.uid,
    name: player.name,
    iconPath: player.iconPath,
    title: player.title,
    score,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

/* =========================
   ranking display
========================= */

export async function showRanking(gameId, period = "month") {
  const rankingArea = document.getElementById("rankingArea");

  if (!rankingArea) {
    return;
  }

  if (!gameId) {
    rankingArea.innerHTML = `
      <div class="ranking-empty">
        ゲームが選択されていません。
      </div>
    `;
    return;
  }

  const periodKey = getPeriodKey(gameId, period);

  rankingArea.innerHTML = `
    <div class="ranking-loading">
      ランキング読み込み中...
    </div>
  `;

  try {
    const scoresRef = collection(db, "rankings", periodKey, "scores");
    const rankingQuery = query(scoresRef, orderBy("score", "desc"), limit(30));
    const rankingSnap = await getDocs(rankingQuery);

    if (rankingSnap.empty) {
      rankingArea.innerHTML = `
        <div class="ranking-empty">
          ${getEmptyMessage(period)}
        </div>
      `;
      return;
    }

    const items = [];

    rankingSnap.forEach((docSnap, index) => {
      const data = docSnap.data();

      items.push(`
        <div class="ranking-item">
          <span class="ranking-rank">${index + 1}</span>

          <div class="ranking-player">
            <img
              src="${escapeHtml(data.iconPath || "/favicon.png")}"
              alt=""
              class="ranking-icon"
            >

            <div class="ranking-player-text">
              <strong>${escapeHtml(data.name || "名無しのプレイヤー")}</strong>
              <small>${escapeHtml(data.title || "player")}</small>
            </div>
          </div>

          <span class="ranking-score">${toSafeScore(data.score)}</span>
        </div>
      `);
    });

    rankingArea.innerHTML = items.join("");
  } catch (error) {
    console.error(error);

    rankingArea.innerHTML = `
      <div class="ranking-empty">
        ランキングを読み込めませんでした。<br>
        ${escapeHtml(error.message)}
      </div>
    `;
  }
}

function getEmptyMessage(period) {
  if (period === "lastMonth") {
    return "先月のランキングはまだありません。";
  }

  if (period === "all") {
    return "まだ全期間ランキングがありません。<br>最初の主役になろう。";
  }

  return "今月のランキングはまだありません。<br>最初の主役になろう。";
}

/* =========================
   player
========================= */

async function getPlayerData() {
  const user = auth.currentUser;

  if (!user) {
    return getGuestPlayer();
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return {
      uid: user.uid,
      name: user.displayName || "プレイヤー",
      iconPath: user.photoURL || "/favicon.png",
      title: "player"
    };
  }

  const data = userSnap.data();

  return {
    uid: user.uid,
    name: data.displayName || user.displayName || "プレイヤー",
    iconPath: data.iconPath || user.photoURL || "/favicon.png",
    title: data.title || "player"
  };
}

function getGuestPlayer() {
  let guestId = localStorage.getItem("shuyakuGuestId");
  let guestName = localStorage.getItem("shuyakuGuestName");

  if (!guestId) {
    guestId = `guest_${crypto.randomUUID()}`;
    localStorage.setItem("shuyakuGuestId", guestId);
  }

  if (!guestName) {
    guestName = createGuestName();
    localStorage.setItem("shuyakuGuestName", guestName);
  }

  return {
    uid: guestId,
    name: guestName,
    iconPath: "/favicon.png",
    title: "guest"
  };
}

function createGuestName() {
  const animals = [
    "うさぎ",
    "ねこ",
    "きつね",
    "くらげ",
    "ぺんぎん",
    "ひよこ",
    "こぐま",
    "りす",
    "いるか",
    "たぬき",
    "はむすたー",
    "ことり"
  ];

  const words = [
    "ビート",
    "ジャンプ",
    "スター",
    "メロディ",
    "ドリーム",
    "ポップ",
    "スパーク",
    "キャンディ",
    "ピクセル",
    "リズム",
    "ミラクル",
    "ダッシュ"
  ];

  const animal = animals[Math.floor(Math.random() * animals.length)];
  const word = words[Math.floor(Math.random() * words.length)];
  const number = String(Math.floor(Math.random() * 10000)).padStart(4, "0");

  return `${animal}${word}${number}`;
}

/* =========================
   period
========================= */

function getPeriodKey(gameId, period) {
  if (period === "all") {
    return `${gameId}_all`;
  }

  if (period === "lastMonth") {
    return `${gameId}_${getMonthKey(-1)}`;
  }

  return `${gameId}_${getMonthKey(0)}`;
}

function getMonthKey(offset = 0) {
  const now = new Date();

  const target = new Date(
    now.getFullYear(),
    now.getMonth() + offset,
    1
  );

  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
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


function toSafeScore(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const cleaned = String(value ?? "0").replaceAll(",", "");
  const number = Number(cleaned);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return number;
}
