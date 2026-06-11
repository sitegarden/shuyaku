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
  const numericScore = Number(score || 0);

  if (!gameId || Number.isNaN(numericScore)) {
    return;
  }

  const player = await getPlayerData();

  const periods = [
    getPeriodKey(gameId, "week"),
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
    ? Number(scoreSnap.data().score || 0)
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

export async function showRanking(gameId, period = "week") {
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
          まだランキングがありません。<br>
          最初の主役になろう。
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

          <span class="ranking-score">${Number(data.score || 0)}</span>
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

  if (!guestId) {
    guestId = `guest_${crypto.randomUUID()}`;
    localStorage.setItem("shuyakuGuestId", guestId);
  }

  return {
    uid: guestId,
    name: "ゲスト",
    iconPath: "/favicon.png",
    title: "guest"
  };
}

/* =========================
   period
========================= */

function getPeriodKey(gameId, period) {
  if (period === "all") {
    return `${gameId}_all`;
  }

  if (period === "month") {
    return `${gameId}_${getMonthKey()}`;
  }

  return `${gameId}_${getWeekKey()}`;
}

function getMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function getWeekKey() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), 0, 1);
  const pastDays = Math.floor((now - firstDay) / 86400000);
  const week = Math.ceil((pastDays + firstDay.getDay() + 1) / 7);

  return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
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
