// ranking.js

import { db, auth } from "./firebase.js";

import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

function getWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;

  d.setUTCDate(d.getUTCDate() + 4 - day);

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function getMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export async function submitScore(gameId, score) {
  const user = auth.currentUser;

  if (!user) {
    console.log("ゲストなのでランキング保存なし");
    return;
  }

  const playerId = user.uid;
  const name = user.displayName || "名無し";

  const weekKey = getWeekKey();
  const monthKey = getMonthKey();

  await addDoc(collection(db, "scores"), {
    playerId,
    name,
    gameId,
    score,
    weekKey,
    monthKey,
    createdAt: serverTimestamp()
  });

  await updateBestScore(gameId, playerId, name, score, "week", weekKey);
  await updateBestScore(gameId, playerId, name, score, "month", monthKey);
  await updateBestScore(gameId, playerId, name, score, "all", "all");
}

async function updateBestScore(gameId, playerId, name, score, period, periodKey) {
  const boardId = `${gameId}_${period}_${periodKey}`;
  const entryRef = doc(db, "leaderboards", boardId, "entries", playerId);

  const snap = await getDoc(entryRef);

  if (snap.exists()) {
    const oldScore = snap.data().score;

    if (oldScore >= score) {
      return;
    }
  }

  await setDoc(entryRef, {
    playerId,
    name,
    gameId,
    score,
    period,
    periodKey,
    updatedAt: serverTimestamp()
  });
}

export async function getRanking(gameId, period) {
  let periodKey = "all";

  if (period === "week") {
    periodKey = getWeekKey();
  }

  if (period === "month") {
    periodKey = getMonthKey();
  }

  const boardId = `${gameId}_${period}_${periodKey}`;

  const q = query(
    collection(db, "leaderboards", boardId, "entries"),
    orderBy("score", "desc"),
    limit(20)
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc, index) => ({
    rank: index + 1,
    id: doc.id,
    ...doc.data()
  }));
}

export async function showRanking(period = "week") {
  const rankingArea = document.getElementById("rankingArea");

  const ranking = await getRanking("2048", period);

  if (ranking.length === 0) {
    rankingArea.innerHTML = "<p>まだランキングはありません</p>";
    return;
  }

  rankingArea.innerHTML = ranking.map(item => `
    <div class="ranking-item">
      <span>${item.rank}位</span>
      <span>${item.name}</span>
      <span>${item.score}</span>
    </div>
  `).join("");
}

document.querySelectorAll(".tabs button").forEach(button => {
  button.onclick = () => {
    showRanking(button.dataset.period);
  };
});

showRanking("week");
