// rhythm/score.js

import { auth, db } from "../js/firebase.js";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const DEFAULT_ICON = "/favicon.png";
const GUEST_STORAGE_KEY = "shuyaku_rhythm_guest_player";

const ROLE_LABELS = {
  developer: "開発者",
  admin: "管理者",
  player: "プレイヤー",
  guest: "ゲスト"
};

export async function saveScore({ songId, difficultyId, score }) {
  const safeSongId = normalizeId(songId);
  const safeDifficultyId = normalizeId(difficultyId);
  const safeScore = toSafeScore(score);

  if (!safeSongId || !safeDifficultyId) {
    return {
      ok: false,
      reason: "曲または難易度が不明です。"
    };
  }

  if (!Number.isFinite(safeScore)) {
    return {
      ok: false,
      reason: "スコアが不正です。"
    };
  }

  const player = await getPlayerData();

  const periodKeys = [
    getPeriodKey({
      songId: safeSongId,
      difficultyId: safeDifficultyId,
      period: "month"
    })
  ];

  // 全期間ランキングはログインユーザーだけ
  if (player.role !== "guest") {
    periodKeys.push(
      getPeriodKey({
        songId: safeSongId,
        difficultyId: safeDifficultyId,
        period: "all"
      })
    );
  }

  await Promise.all(
    periodKeys.map((periodKey) => {
      return saveBestScore({
        periodKey,
        player,
        score: safeScore
      });
    })
  );

  return {
    ok: true,
    player,
    score: safeScore
  };
}

export async function getRanking({
  songId,
  difficultyId,
  period = "month",
  max = 20
}) {
  const safeSongId = normalizeId(songId);
  const safeDifficultyId = normalizeId(difficultyId);
  const safePeriod = normalizePeriod(period);

  if (!safeSongId || !safeDifficultyId) {
    return [];
  }

  const periodKey = getPeriodKey({
    songId: safeSongId,
    difficultyId: safeDifficultyId,
    period: safePeriod
  });

  const rankingRef = collection(db, "rankings", periodKey, "scores");

  const rankingQuery = query(
    rankingRef,
    orderBy("score", "desc"),
    limit(Math.max(max, 30))
  );

  const snapshot = await getDocs(rankingQuery);

  const ranking = [];

  snapshot.forEach((scoreDoc) => {
    const data = scoreDoc.data();

    // 念のため、全期間ではゲストを表示しない
    if (safePeriod === "all" && data.role === "guest") {
      return;
    }

    ranking.push({
      id: scoreDoc.id,
      uid: data.uid || scoreDoc.id,
      name: data.name || "ななし",
      iconPath: data.iconPath || DEFAULT_ICON,
      title: data.title || "",
      role: data.role || "player",
      roleLabel: getRoleLabel(data.role || "player"),
      score: toSafeScore(data.score),
      updatedAt: data.updatedAt || null
    });
  });

  return ranking
    .filter((item) => Number.isFinite(item.score))
    .slice(0, max);
}

export function getPeriodKey({ songId, difficultyId, period = "month" }) {
  const safeSongId = normalizeId(songId);
  const safeDifficultyId = normalizeId(difficultyId);
  const safePeriod = normalizePeriod(period);

  if (safePeriod === "all") {
    return `rhythm_${safeSongId}_${safeDifficultyId}_all`;
  }

  if (safePeriod === "lastMonth") {
    return `rhythm_${safeSongId}_${safeDifficultyId}_${getMonthKey(-1)}`;
  }

  return `rhythm_${safeSongId}_${safeDifficultyId}_${getMonthKey(0)}`;
}

export function getPeriodLabel(period) {
  const safePeriod = normalizePeriod(period);

  if (safePeriod === "lastMonth") {
    return "先月";
  }

  if (safePeriod === "all") {
    return "全期間";
  }

  return "今月";
}

export function getRoleLabel(role) {
  return ROLE_LABELS[role] || ROLE_LABELS.player;
}

async function saveBestScore({ periodKey, player, score }) {
  const scoreRef = doc(db, "rankings", periodKey, "scores", player.uid);
  const currentSnapshot = await getDoc(scoreRef);

  if (currentSnapshot.exists()) {
    const currentData = currentSnapshot.data();
    const currentScore = toSafeScore(currentData.score);

    if (Number.isFinite(currentScore) && currentScore >= score) {
      return;
    }
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

async function getPlayerData() {
  const user = auth.currentUser;

  if (!user) {
    return getGuestPlayer();
  }

  const userRef = doc(db, "users", user.uid);
  const userSnapshot = await getDoc(userRef);

  const data = userSnapshot.exists() ? userSnapshot.data() : {};

  const role = normalizeRole(data.role || "player");

  return {
    uid: user.uid,
    name:
      data.name ||
      data.displayName ||
      user.displayName ||
      "プレイヤー",
    iconPath:
      data.iconPath ||
      data.photoURL ||
      user.photoURL ||
      DEFAULT_ICON,
    title:
      data.title ||
      role,
    role
  };
}

function getGuestPlayer() {
  const savedGuest = loadGuestPlayer();

  if (savedGuest) {
    return savedGuest;
  }

  const guest = createGuestPlayer();
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guest));

  return guest;
}

function loadGuestPlayer() {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const data = JSON.parse(raw);

    if (!data || !data.uid || !data.name) {
      return null;
    }

    return {
      uid: String(data.uid),
      name: String(data.name),
      iconPath: data.iconPath || DEFAULT_ICON,
      title: "guest",
      role: "guest"
    };
  } catch (error) {
    return null;
  }
}

function createGuestPlayer() {
  const adjectives = [
    "ぴこぴこ",
    "きらきら",
    "ふわふわ",
    "もちもち",
    "まったり",
    "スター",
    "ミラクル",
    "リズム",
    "ジャンプ",
    "ドット"
  ];

  const nouns = [
    "うさぎ",
    "ねこ",
    "ペンギン",
    "スター",
    "ビート",
    "メロディ",
    "ピクセル",
    "キャンディ",
    "ソーダ",
    "プレイヤー"
  ];

  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  const adjective = pickRandom(adjectives);
  const noun = pickRandom(nouns);

  return {
    uid: `guest_${crypto.randomUUID()}`,
    name: `${adjective}${noun}${randomNumber}`,
    iconPath: DEFAULT_ICON,
    title: "guest",
    role: "guest"
  };
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getMonthKey(offset = 0) {
  const date = new Date();

  date.setMonth(date.getMonth() + offset);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function normalizeId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
}

function normalizePeriod(period) {
  const value = String(period || "").trim();

  if (value === "lastMonth") {
    return "lastMonth";
  }

  if (value === "all") {
    return "all";
  }

  return "month";
}

function normalizeRole(role) {
  const value = String(role || "").trim().toLowerCase();

  if (value === "developer") return "developer";
  if (value === "admin") return "admin";
  if (value === "guest") return "guest";

  return "player";
}

function toSafeScore(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.floor(number));
}
