import { auth, db } from "../../js/firebase.js";
import { getGuestId, getGuestName } from "../../js/guest.js";

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

const EVENT_DATE_KEY = "2026-06-29";
const EVENT_RANKING_COLLECTION = "eventRankings";

/* =========================
   score submit
========================= */

export async function submitScore(gameId, score) {
  const numericScore = toSafeScore(score);

  if (!gameId || !Number.isFinite(numericScore)) {
    return;
  }

  const player = await getPlayerData();

  await Promise.all([
    saveBestScore(
      getPeriodKey(gameId, "eventDay"),
      player,
      numericScore
    ),
    saveBestScore(
      getPeriodKey(gameId, "all"),
      player,
      numericScore
    )
  ]);
}

async function saveBestScore(periodKey, player, score) {
  const scoreRef = doc(
    db,
    EVENT_RANKING_COLLECTION,
    periodKey,
    "scores",
    player.uid
  );

  const scoreSnap = await getDoc(scoreRef);

  const oldScore = scoreSnap.exists()
    ? toSafeScore(scoreSnap.data().score)
    : 0;

  if (score <= oldScore) {
    return;
  }

  await setDoc(
    scoreRef,
    {
      uid: player.uid,
      name: player.name,
      iconPath: player.iconPath,
      title: player.title,
      role: player.role,
      score,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

/* =========================
   ranking display
========================= */

export async function showRanking(gameId, period = "eventDay") {
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
    const scoresRef = collection(
      db,
      EVENT_RANKING_COLLECTION,
      periodKey,
      "scores"
    );

    const rankingQuery = query(
      scoresRef,
      orderBy("score", "desc"),
      limit(30)
    );

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
    let rank = 1;

    rankingSnap.forEach((docSnap) => {
      const data = docSnap.data();

      items.push(`
        <div class="ranking-item">
          <span class="ranking-rank">${rank}</span>

          <div class="ranking-player">
            <img
              src="${escapeHtml(data.iconPath || "/favicon.png")}"
              alt=""
              class="ranking-icon"
            >

            <div class="ranking-player-text">
              <strong>${escapeHtml(data.name || "名無しのプレイヤー")}</strong>
              <small>
                ${escapeHtml(getRoleLabel(data.role || "guest"))}
              </small>
            </div>
          </div>

          <span class="ranking-score">
            ${toSafeScore(data.score)}
          </span>
        </div>
      `);

      rank += 1;
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

  if (!user || user.isAnonymous) {
    return getGuestPlayer();
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return {
      uid: user.uid,
      name: user.displayName || "プレイヤー",
      iconPath: user.photoURL || "/favicon.png",
      title: "player",
      role: "player"
    };
  }

  const data = userSnap.data();

  return {
    uid: user.uid,
    name: data.displayName || user.displayName || "プレイヤー",
    iconPath: data.iconPath || user.photoURL || "/favicon.png",
    title: data.title || "player",
    role: data.role || "player"
  };
}

function getGuestPlayer() {
  let guestName = getGuestName();

  if (!guestName) {
    guestName = createGuestName();
    localStorage.setItem("shuyakuGuestName", guestName);
  }

  return {
    uid: getGuestId(),
    name: guestName,
    iconPath: "/favicon.png",
    title: "guest",
    role: "guest"
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
    "りす"
  ];

  const words = [
    "スター",
    "ビート",
    "ジャンプ",
    "ポップ",
    "ドリーム",
    "ピクセル"
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

  return `${gameId}_${EVENT_DATE_KEY}`;
}

function getEmptyMessage(period) {
  if (period === "all") {
    return "まだ全期間ランキングはありません。<br>最初の主役になろう。";
  }

  return "6月29日のランキングはまだありません。<br>最初の主役になろう。";
}

/* =========================
   utility
========================= */

function getRoleLabel(role) {
  const labels = {
    developer: "開発者",
    admin: "管理者",
    player: "プレイヤー",
    guest: "ゲスト"
  };

  return labels[role] || "プレイヤー";
}

function toSafeScore(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.floor(value);
  }

  const number = Number(String(value ?? "0").replaceAll(",", ""));

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.floor(number);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
