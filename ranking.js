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

function getGuestId() {
  let guestId = localStorage.getItem("guestId");

  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem("guestId", guestId);
  }

  return guestId;
}

function getGuestName() {
  let guestName = localStorage.getItem("guestName");

  if (!guestName) {
    guestName = prompt("今週ランキングに載せる名前を入力してね");

    if (!guestName) {
      return null;
    }

    guestName = guestName.trim();

    if (!guestName) {
      return null;
    }

    if (guestName.length > 12) {
      guestName = guestName.slice(0, 12);
    }

    localStorage.setItem("guestName", guestName);
  }

  return guestName;
}

export async function submitScore(gameId, score) {
  const user = auth.currentUser;

  console.log("スコア送信チェック", {
    gameId,
    score,
    user
  });

  try {
    const weekKey = getWeekKey();
    const monthKey = getMonthKey();

    if (!user) {
      const guestName = getGuestName();

      if (!guestName) {
        alert("ランキング登録をキャンセルしました");
        return;
      }

      const guestId = getGuestId();
      const playerId = `guest_${guestId}`;
      const name = guestName;
      const iconType = "round";
      const iconColor = "cream";
      const title = "GUEST";
      const isGuest = true;

      await addDoc(collection(db, "scores"), {
        playerId,
        name,
        iconType,
        iconColor,
        title,
        isGuest,
        gameId,
        score,
        weekKey,
        monthKey,
        createdAt: serverTimestamp()
      });

      await updateBestScore(
        gameId,
        playerId,
        name,
        iconType,
        iconColor,
        title,
        isGuest,
        score,
        "week",
        weekKey
      );

      alert("今週ランキングに登録しました");
      return;
    }

    const profile = await getUserProfile(user.uid);

    const playerId = user.uid;
    const name = profile.displayName || user.displayName || "名無し";
    const iconType = profile.iconType || "cat";
    const iconColor = profile.iconColor || "pink";
    const title = profile.selectedTitle || "PLAYER";
    const isGuest = false;

    await addDoc(collection(db, "scores"), {
      playerId,
      name,
      iconType,
      iconColor,
      title,
      isGuest,
      gameId,
      score,
      weekKey,
      monthKey,
      createdAt: serverTimestamp()
    });

    await updateBestScore(
      gameId,
      playerId,
      name,
      iconType,
      iconColor,
      title,
      isGuest,
      score,
      "week",
      weekKey
    );

    await updateBestScore(
      gameId,
      playerId,
      name,
      iconType,
      iconColor,
      title,
      isGuest,
      score,
      "month",
      monthKey
    );

    await updateBestScore(
      gameId,
      playerId,
      name,
      iconType,
      iconColor,
      title,
      isGuest,
      score,
      "all",
      "all"
    );

    console.log("ランキング保存完了");
  } catch (error) {
    console.error("ランキング保存エラー:", error);
    alert(`ランキング保存エラー: ${error.message}`);
  }
}

async function getUserProfile(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    return {};
  }

  return snap.data();
}

async function updateBestScore(
  gameId,
  playerId,
  name,
  iconType,
  iconColor,
  title,
  isGuest,
  score,
  period,
  periodKey
) {
  const boardId = `${gameId}_${period}_${periodKey}`;
  const entryRef = doc(db, "leaderboards", boardId, "entries", playerId);

  console.log("ベスト更新チェック", {
    boardId,
    playerId,
    score,
    period,
    periodKey,
    title,
    isGuest
  });

  const snap = await getDoc(entryRef);

  if (snap.exists()) {
    const oldScore = snap.data().score;

    if (oldScore >= score) {
      console.log("既存スコアの方が高いので更新しません", {
        oldScore,
        score
      });

      return;
    }
  }

  await setDoc(entryRef, {
    playerId,
    name,
    iconType,
    iconColor,
    title,
    isGuest,
    gameId,
    score,
    period,
    periodKey,
    updatedAt: serverTimestamp()
  });

  console.log("ベスト更新完了", {
    boardId,
    playerId,
    score
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

  console.log("ランキング取得", {
    gameId,
    period,
    periodKey,
    boardId
  });

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

export async function showRanking(gameId, period = "week") {
  const rankingArea = document.getElementById("rankingArea");

  const ranking = await getRanking(gameId, period);

  if (ranking.length === 0) {
    rankingArea.innerHTML = "<p>まだランキングはありません</p>";
    return;
  }

  rankingArea.innerHTML = ranking.map(item => `
    <div class="ranking-item">
      <span>${item.rank}位</span>

      <span class="ranking-user">
        ${createAvatarHtml(item.iconType || "cat", item.iconColor || "pink")}
        <span class="ranking-name">${escapeHtml(item.name)}</span>
        <span class="title-badge ${getTitleClass(item.title || "PLAYER")}">${escapeHtml(item.title || "PLAYER")}</span>
      </span>

      <span>${item.score}</span>
    </div>
  `).join("");
}

function createAvatarHtml(type, color) {
  return `
    <span class="avatar ranking-avatar ${escapeHtml(type)} ${escapeHtml(color)}">
      <span class="ear left"></span>
      <span class="ear right"></span>
      <span class="face">
        <span class="eye left"></span>
        <span class="eye right"></span>
        <span class="mouth"></span>
      </span>
    </span>
  `;
}

function getTitleClass(title) {
  if (title === "GUEST") {
    return "guest-title";
  }

  if (title === "PLAYER") {
    return "player-title";
  }

  if (title === "WEEK TOP 1") {
    return "top-title";
  }

  if (title === "WEEK TOP 10") {
    return "top10-title";
  }

  return "normal-title";
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}