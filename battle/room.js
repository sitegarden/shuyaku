// battle/room.js

import { auth, db } from "../js/firebase.js";

import {
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
  rtdb,
  ref,
  set,
  update,
  get,
  onValue,
  off,
  remove,
  serverTimestamp,
  onDisconnect
} from "./firebase.js";

import {
  MAX_HP,
  createInitialBattlePlayer,
  getAlivePlayers,
  canUseSkill,
  resolveTurn
} from "./battle.js";

const MAX_PLAYERS = 4;
const MIN_PLAYERS = 2;

const GUEST_NAME_KEY = "shuyaku_battle_guest_name";

let currentRoomId = "";
let currentRoom = null;
let roomRefCache = null;

export function getCurrentRoomId() {
  return currentRoomId;
}

export function getCurrentRoom() {
  return currentRoom;
}

export function getMyUid() {
  return auth.currentUser?.uid || "";
}

export function isLoggedInUser() {
  return !!auth.currentUser && !auth.currentUser.isAnonymous;
}

export function isAnonymousUser() {
  return !!auth.currentUser && auth.currentUser.isAnonymous;
}

export function isHost(room = currentRoom) {
  const uid = getMyUid();

  if (!room || !uid) return false;

  return room.hostUid === uid;
}

export function isPlayer(room = currentRoom, uid = getMyUid()) {
  if (!room || !uid) return false;

  return !!room.players?.[uid];
}

export function isWatcher(room = currentRoom, uid = getMyUid()) {
  if (!room || !uid) return false;

  return !!room.watchers?.[uid];
}

export function normalizeRoomId(roomId) {
  return String(roomId || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 12);
}

export function createGuestName(inputName = "") {
  const typedName = String(inputName || "").trim();

  if (typedName) {
    const safeName = typedName.slice(0, 16);
    localStorage.setItem(GUEST_NAME_KEY, safeName);
    return safeName;
  }

  const savedName = localStorage.getItem(GUEST_NAME_KEY);

  if (savedName) {
    return savedName;
  }

  const words = [
    "ゲストねこ",
    "ゲストうさぎ",
    "ゲストスター",
    "ゲストビート",
    "ゲストソーダ",
    "ゲストもち",
    "ゲストドット",
    "ゲストペンギン",
    "ゲストプリン",
    "ゲストメロン"
  ];

  const word = words[Math.floor(Math.random() * words.length)];
  const number = Math.floor(1000 + Math.random() * 9000);
  const name = `${word}${number}`;

  localStorage.setItem(GUEST_NAME_KEY, name);

  return name;
}

export async function createRoom(createMode = "player") {
  const user = auth.currentUser;

  if (!user || user.isAnonymous) {
    throw new Error("部屋作成にはGoogleログインが必要です。");
  }

  const roomId = await createUniqueRoomId();
  const profile = await getUserProfile({
    user,
    guestName: ""
  });

  const room = {
    roomId,
    status: "waiting",
    phase: "waiting",
    hostUid: user.uid,
    hostMode: createMode === "watcher" ? "watcher" : "player",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    turn: 1,
    players: {},
    watchers: {},
    commands: {},
    log: [
      `${profile.name}が部屋を作成しました。`
    ],
    logs: {
      first: {
        id: "first",
        text: `${profile.name}が部屋を作成しました。`,
        createdAt: Date.now()
      }
    }
  };

  if (createMode === "watcher") {
    room.watchers[user.uid] = createWatcherData({
      profile,
      isHostUser: true
    });
  } else {
    room.players[user.uid] = createInitialBattlePlayer(
      createPlayerData({
        profile,
        isHostUser: true
      })
    );
  }

  await set(ref(rtdb, `rooms/${roomId}`), room);

  currentRoomId = roomId;
  currentRoom = room;

  setupDisconnect(roomId, user.uid);

  return room;
}

export async function joinRoom(roomId, guestName = "") {
  const safeRoomId = normalizeRoomId(roomId);

  if (!safeRoomId) {
    throw new Error("部屋IDを入力してください。");
  }

  const user = await ensureBattleUser();
  const room = await fetchRoom(safeRoomId);

  if (!room) {
    throw new Error("部屋が見つかりません。");
  }

  if (room.status !== "waiting") {
    throw new Error("この部屋は現在参加できません。");
  }

  const players = room.players || {};
  const playerCount = Object.keys(players).length;

  if (!players[user.uid] && playerCount >= MAX_PLAYERS) {
    throw new Error("この部屋は満員です。");
  }

  const profile = await getUserProfile({
    user,
    guestName
  });

  const playerData = createInitialBattlePlayer(
    createPlayerData({
      profile,
      isHostUser: room.hostUid === user.uid
    })
  );

  const updates = {};

  updates[`rooms/${safeRoomId}/players/${user.uid}`] = playerData;
  updates[`rooms/${safeRoomId}/watchers/${user.uid}`] = null;
  updates[`rooms/${safeRoomId}/updatedAt`] = serverTimestamp();

  await update(ref(rtdb), updates);

  currentRoomId = safeRoomId;

  setupDisconnect(safeRoomId, user.uid);

  return {
    roomId: safeRoomId,
    player: playerData
  };
}

export async function watchRoom(roomId, guestName = "") {
  const safeRoomId = normalizeRoomId(roomId);

  if (!safeRoomId) {
    throw new Error("部屋IDを入力してください。");
  }

  const user = await ensureBattleUser();
  const room = await fetchRoom(safeRoomId);

  if (!room) {
    throw new Error("部屋が見つかりません。");
  }

  if (room.status === "closed") {
    throw new Error("この部屋は終了しています。");
  }

  const profile = await getUserProfile({
    user,
    guestName
  });

  const watcherData = createWatcherData({
    profile,
    isHostUser: room.hostUid === user.uid
  });

  const updates = {};

  updates[`rooms/${safeRoomId}/watchers/${user.uid}`] = watcherData;
  updates[`rooms/${safeRoomId}/players/${user.uid}`] = null;
  updates[`rooms/${safeRoomId}/updatedAt`] = serverTimestamp();

  await update(ref(rtdb), updates);

  currentRoomId = safeRoomId;

  setupDisconnect(safeRoomId, user.uid);

  return {
    roomId: safeRoomId,
    watcher: watcherData
  };
}

export async function leaveRoom(roomId = currentRoomId) {
  const safeRoomId = normalizeRoomId(roomId);
  const uid = getMyUid();

  if (!safeRoomId || !uid) {
    return;
  }

  const room = await fetchRoom(safeRoomId);

  if (!room) {
    clearCurrentRoom();
    return;
  }

  if (room.hostUid === uid) {
    await remove(ref(rtdb, `rooms/${safeRoomId}`));
    clearCurrentRoom();
    return;
  }

  const updates = {};

  updates[`rooms/${safeRoomId}/players/${uid}`] = null;
  updates[`rooms/${safeRoomId}/watchers/${uid}`] = null;
  updates[`rooms/${safeRoomId}/updatedAt`] = serverTimestamp();

  await update(ref(rtdb), updates);

  clearCurrentRoom();
}

export async function startBattle(roomId = currentRoomId) {
  const safeRoomId = normalizeRoomId(roomId);
  const uid = getMyUid();

  if (!safeRoomId || !uid) {
    throw new Error("部屋情報がありません。");
  }

  const room = await fetchRoom(safeRoomId);

  if (!room) {
    throw new Error("部屋が見つかりません。");
  }

  if (room.hostUid !== uid) {
    throw new Error("バトル開始は部屋主だけができます。");
  }

  if (auth.currentUser?.isAnonymous) {
    throw new Error("バトル開始にはGoogleログインが必要です。");
  }

  const players = room.players || {};
  const playerEntries = Object.entries(players);

  if (playerEntries.length < MIN_PLAYERS) {
    throw new Error("バトル開始には2人以上のプレイヤーが必要です。");
  }

  const initializedPlayers = {};

  playerEntries.forEach(([playerId, player]) => {
    initializedPlayers[playerId] = createInitialBattlePlayer(player);
  });

  const nextRoom = {
    ...room,
    status: "battle",
    phase: "selecting",
    turn: 1,
    players: initializedPlayers,
    commands: {},
    updatedAt: serverTimestamp(),
    log: [
      ...getLogLines(room),
      "バトル開始！コマンドを選んでください。"
    ],
    logs: makeLogs([
      ...getLogLines(room),
      "バトル開始！コマンドを選んでください。"
    ])
  };

  await set(ref(rtdb, `rooms/${safeRoomId}`), nextRoom);

  return nextRoom;
}

export async function submitCommand(roomId, skillId, targetUid = "") {
  const safeRoomId = normalizeRoomId(roomId);
  const uid = getMyUid();

  if (!safeRoomId || !uid) {
    throw new Error("ログイン情報がありません。");
  }

  const room = await fetchRoom(safeRoomId);

  if (!room) {
    throw new Error("部屋が見つかりません。");
  }

  if (room.status !== "battle") {
    throw new Error("現在はコマンドを選択できません。");
  }

  const player = room.players?.[uid];

  if (!player) {
    throw new Error("観戦者はコマンドを選択できません。");
  }

  if (player.down || player.alive === false || Number(player.hp) <= 0) {
    throw new Error("倒れているためコマンドを選択できません。");
  }

  if (!canUseSkill(player, skillId)) {
    throw new Error("SPが足りません。");
  }

  const commandData = {
    playerId: uid,
    skillId,
    targetUid: targetUid || uid,
    createdAt: serverTimestamp()
  };

  await set(ref(rtdb, `rooms/${safeRoomId}/commands/${uid}`), commandData);

  await tryResolveTurn(safeRoomId);

  return commandData;
}

export async function tryResolveTurn(roomId = currentRoomId) {
  const safeRoomId = normalizeRoomId(roomId);
  const uid = getMyUid();

  if (!safeRoomId || !uid) return null;

  const room = await fetchRoom(safeRoomId);

  if (!room) return null;
  if (room.status !== "battle") return null;
  if (room.hostUid !== uid) return null;

  const players = room.players || {};
  const commands = room.commands || {};
  const alivePlayers = getAlivePlayers(players);

  if (alivePlayers.length <= 1) {
    const resolvedRoom = resolveTurn(room);
    await set(ref(rtdb, `rooms/${safeRoomId}`), resolvedRoom);
    return resolvedRoom;
  }

  const allSelected = alivePlayers.every((player) => {
    return !!commands[player.uid];
  });

  if (!allSelected) {
    return null;
  }

  const resolvedRoom = resolveTurn(room);

  await set(ref(rtdb, `rooms/${safeRoomId}`), resolvedRoom);

  return resolvedRoom;
}

export async function rematchRoom(roomId = currentRoomId) {
  const safeRoomId = normalizeRoomId(roomId);
  const uid = getMyUid();

  if (!safeRoomId || !uid) {
    throw new Error("部屋情報がありません。");
  }

  const room = await fetchRoom(safeRoomId);

  if (!room) {
    throw new Error("部屋が見つかりません。");
  }

  if (room.hostUid !== uid) {
    throw new Error("もう一度始める操作は部屋主だけができます。");
  }

  const players = {};
  const oldPlayers = room.players || {};

  Object.keys(oldPlayers).forEach((playerId) => {
    const player = oldPlayers[playerId];

    players[playerId] = {
      ...player,
      hp: MAX_HP,
      sp: 0,
      stop: 0,
      down: false,
      alive: true,
      ready: false,
      command: "",
      skillId: ""
    };
  });

  const nextRoom = {
    ...room,
    status: "waiting",
    phase: "waiting",
    turn: 1,
    players,
    commands: {},
    result: null,
    updatedAt: serverTimestamp(),
    log: [
      "もう一度バトルできます。"
    ],
    logs: makeLogs([
      "もう一度バトルできます。"
    ])
  };

  await set(ref(rtdb, `rooms/${safeRoomId}`), nextRoom);

  return nextRoom;
}

export function observeRoom(roomId, callback) {
  const safeRoomId = normalizeRoomId(roomId);

  if (!safeRoomId) {
    throw new Error("部屋IDがありません。");
  }

  stopObservingRoom();

  currentRoomId = safeRoomId;
  roomRefCache = ref(rtdb, `rooms/${safeRoomId}`);

  onValue(roomRefCache, async (snapshot) => {
    currentRoom = snapshot.val();

    if (!currentRoom) {
      callback(null);
      return;
    }

    callback(currentRoom);

    if (currentRoom.status === "battle" && isHost(currentRoom)) {
      await tryResolveTurn(safeRoomId);
    }
  });

  return () => {
    stopObservingRoom();
  };
}

export function stopObservingRoom() {
  if (roomRefCache) {
    off(roomRefCache);
  }

  roomRefCache = null;
}

async function ensureBattleUser() {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  const result = await signInAnonymously(auth);

  return result.user;
}

async function getUserProfile({ user, guestName }) {
  if (user.isAnonymous) {
    const name = createGuestName(guestName);

    return {
      uid: user.uid,
      name,
      iconPath: "/favicon.png",
      role: "guest",
      isGuest: true
    };
  }

  let userData = null;

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      userData = userSnap.data();
    }
  } catch (error) {
    console.warn("ユーザーデータの取得に失敗しました。", error);
  }

  return {
    uid: user.uid,
    name:
      userData?.name ||
      userData?.displayName ||
      user.displayName ||
      "プレイヤー",
    iconPath:
      userData?.iconPath ||
      userData?.photoURL ||
      user.photoURL ||
      "/favicon.png",
    role:
      userData?.role ||
      userData?.title ||
      "player",
    title:
      userData?.title ||
      "",
    isGuest: false
  };
}

function createPlayerData({ profile, isHostUser }) {
  return {
    uid: profile.uid,
    name: profile.name,
    names: profile.name,
    iconPath: profile.iconPath || "/favicon.png",
    role: profile.role || "player",
    title: profile.title || "",
    isHost: !!isHostUser,
    isGuest: !!profile.isGuest,
    joined: true,
    hp: MAX_HP,
    sp: 0,
    stop: 0,
    down: false,
    alive: true,
    ready: false,
    command: "",
    skillId: ""
  };
}

function createWatcherData({ profile, isHostUser }) {
  return {
    uid: profile.uid,
    name: profile.name,
    names: profile.name,
    iconPath: profile.iconPath || "/favicon.png",
    role: profile.role || "watcher",
    title: profile.title || "",
    isHost: !!isHostUser,
    isGuest: !!profile.isGuest,
    joined: true
  };
}

async function createUniqueRoomId() {
  for (let i = 0; i < 20; i++) {
    const roomId = generateRoomId();
    const snapshot = await get(ref(rtdb, `rooms/${roomId}`));

    if (!snapshot.exists()) {
      return roomId;
    }
  }

  throw new Error("部屋IDの作成に失敗しました。もう一度試してください。");
}

function generateRoomId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let roomId = "";

  for (let i = 0; i < 6; i++) {
    roomId += chars[Math.floor(Math.random() * chars.length)];
  }

  return roomId;
}

async function fetchRoom(roomId) {
  const safeRoomId = normalizeRoomId(roomId);
  const snapshot = await get(ref(rtdb, `rooms/${safeRoomId}`));

  return snapshot.val();
}

function setupDisconnect(roomId, uid) {
  if (!roomId || !uid) return;

  const playerRef = ref(rtdb, `rooms/${roomId}/players/${uid}`);
  const watcherRef = ref(rtdb, `rooms/${roomId}/watchers/${uid}`);

  onDisconnect(playerRef).remove();
  onDisconnect(watcherRef).remove();
}

function clearCurrentRoom() {
  stopObservingRoom();

  currentRoomId = "";
  currentRoom = null;
}

function getLogLines(room) {
  if (Array.isArray(room?.log)) {
    return room.log.slice(-60);
  }

  if (Array.isArray(room?.logs)) {
    return room.logs.map((item) => {
      return typeof item === "string" ? item : item.text;
    }).filter(Boolean).slice(-60);
  }

  if (room?.logs && typeof room.logs === "object") {
    return Object.values(room.logs).map((item) => {
      return typeof item === "string" ? item : item.text;
    }).filter(Boolean).slice(-60);
  }

  return [];
}

function makeLogs(lines) {
  const limitedLines = lines.slice(-60);
  const logs = {};

  limitedLines.forEach((text, index) => {
    const id = `log_${Date.now()}_${index}`;

    logs[id] = {
      id,
      text,
      createdAt: Date.now() + index
    };
  });

  return logs;
}
