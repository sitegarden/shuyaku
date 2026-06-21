// battle/main.js

import {
  createRoom,
  joinRoom,
  watchRoom,
  leaveRoom,
  startBattle,
  submitCommand,
  rematchRoom,
  observeRoom,
  getCurrentRoomId,
  getMyUid,
  isHost,
  isPlayer,
  isWatcher,
  normalizeRoomId
} from "./room.js";

import { getGuestName } from "../js/guest.js";

import {
  MAX_HP,
  getSkillList,
  getSkill,
  canUseSkill
} from "./battle.js";

const screens = {
  lobby: document.getElementById("lobbyScreen"),
  waiting: document.getElementById("waitingScreen"),
  battle: document.getElementById("battleScreen"),
  result: document.getElementById("resultScreen")
};

const battleHeaderTitle = document.getElementById("battleHeaderTitle");
const battleHeaderLead = document.getElementById("battleHeaderLead");

const battleBackBtn = document.getElementById("battleBackBtn");
const leaveRoomBtn = document.getElementById("leaveRoomBtn");

const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomInput = document.getElementById("joinRoomInput");
const guestNameInput = document.getElementById("guestNameInput");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const watchRoomBtn = document.getElementById("watchRoomBtn");

const roomIdText = document.getElementById("roomIdText");
const copyRoomIdBtn = document.getElementById("copyRoomIdBtn");
const roomStatusText = document.getElementById("roomStatusText");
const waitingPlayers = document.getElementById("waitingPlayers");
const watcherList = document.getElementById("watcherList");
const startBattleBtn = document.getElementById("startBattleBtn");
const waitingLeaveBtn = document.getElementById("waitingLeaveBtn");

const battleRoomIdText = document.getElementById("battleRoomIdText");
const turnText = document.getElementById("turnText");
const battleMessage = document.getElementById("battleMessage");
const playersArea = document.getElementById("playersArea");
const commandStatusText = document.getElementById("commandStatusText");
const commandList = document.getElementById("commandList");
const battleLog = document.getElementById("battleLog");

const resultText = document.getElementById("resultText");
const resultPlayers = document.getElementById("resultPlayers");
const rematchBtn = document.getElementById("rematchBtn");
const resultLeaveBtn = document.getElementById("resultLeaveBtn");

const commandModal = document.getElementById("commandModal");
const commandModalBg = document.getElementById("commandModalBg");
const closeCommandModalBtn = document.getElementById("closeCommandModalBtn");
const modalSkillIcon = document.getElementById("modalSkillIcon");
const modalSkillName = document.getElementById("modalSkillName");
const modalSkillDescription = document.getElementById("modalSkillDescription");
const targetSelectArea = document.getElementById("targetSelectArea");
const confirmCommandBtn = document.getElementById("confirmCommandBtn");
const cancelCommandBtn = document.getElementById("cancelCommandBtn");

let latestRoom = null;
let selectedSkillId = "";
let selectedTargetUid = "";

setupEvents();
restoreGuestName();
restoreRoomFromUrl();

function setupEvents() {
  createRoomBtn?.addEventListener("click", async () => {
    await runWithLoading(createRoomBtn, "作成中...", async () => {
      const createMode = getCreateMode();
      const room = await createRoom(createMode);

      startObserve(room.roomId);
      setRoomUrl(room.roomId);
    });
  });

  joinRoomBtn?.addEventListener("click", async () => {
    await runWithLoading(joinRoomBtn, "参加中...", async () => {
      const roomId = normalizeRoomId(joinRoomInput?.value);
      const guestName = guestNameInput?.value || "";

      const result = await joinRoom(roomId, guestName);

      startObserve(result.roomId);
      setRoomUrl(result.roomId);
    });
  });

  watchRoomBtn?.addEventListener("click", async () => {
    await runWithLoading(watchRoomBtn, "観戦中...", async () => {
      const roomId = normalizeRoomId(joinRoomInput?.value);
      const guestName = guestNameInput?.value || "";

      const result = await watchRoom(roomId, guestName);

      startObserve(result.roomId);
      setRoomUrl(result.roomId);
    });
  });

  copyRoomIdBtn?.addEventListener("click", async () => {
    const roomId = getCurrentRoomId();

    if (!roomId) return;

    try {
      await navigator.clipboard.writeText(roomId);
      showMessage("部屋IDをコピーしました。");
    } catch {
      showMessage(`部屋ID：${roomId}`);
    }
  });

  startBattleBtn?.addEventListener("click", async () => {
    await runWithLoading(startBattleBtn, "開始中...", async () => {
      await startBattle(getCurrentRoomId());
    });
  });

  waitingLeaveBtn?.addEventListener("click", leaveCurrentRoom);
  leaveRoomBtn?.addEventListener("click", leaveCurrentRoom);
  resultLeaveBtn?.addEventListener("click", leaveCurrentRoom);

  battleBackBtn?.addEventListener("click", () => {
    showScreen("lobby");
    clearRoomUrl();
  });

  rematchBtn?.addEventListener("click", async () => {
    await runWithLoading(rematchBtn, "準備中...", async () => {
      await rematchRoom(getCurrentRoomId());
    });
  });

  closeCommandModalBtn?.addEventListener("click", closeCommandModal);
  commandModalBg?.addEventListener("click", closeCommandModal);
  cancelCommandBtn?.addEventListener("click", closeCommandModal);

  confirmCommandBtn?.addEventListener("click", async () => {
    if (!selectedSkillId) {
      closeCommandModal();
      return;
    }

    await runWithLoading(confirmCommandBtn, "送信中...", async () => {
      await submitCommand(getCurrentRoomId(), selectedSkillId, selectedTargetUid || getMyUid());
      closeCommandModal();
    });
  });

  joinRoomInput?.addEventListener("input", () => {
    joinRoomInput.value = normalizeRoomId(joinRoomInput.value);
  });
}

function getCreateMode() {
  const checked = document.querySelector('input[name="createMode"]:checked');
  return checked?.value || "player";
}

function startObserve(roomId) {
  observeRoom(roomId, (room) => {
    latestRoom = room;

    if (!room) {
      showMessage("部屋がなくなりました。");
      latestRoom = null;
      clearRoomUrl();
      showLobby();
      return;
    }

    renderRoom(room);
  });
}

function renderRoom(room) {
  if (!room) {
    showLobby();
    return;
  }

  if (room.status === "waiting") {
    renderWaiting(room);
    return;
  }

  if (room.status === "battle") {
    renderBattle(room);
    return;
  }

  if (room.status === "result") {
    renderResult(room);
    return;
  }

  showLobby();
}

function renderWaiting(room) {
  showScreen("waiting");

  setHeaderText(
    "待機室",
    "人数がそろったら、部屋主がバトルを開始できます。"
  );

  roomIdText.textContent = room.roomId || "------";
  roomStatusText.textContent = createWaitingStatusText(room);

  renderWaitingPlayers(room);
  renderWatchers(room);
  renderWaitingButtons(room);
}

function renderWaitingPlayers(room) {
  const players = Object.values(room.players || {});

  if (!waitingPlayers) return;

  if (players.length === 0) {
    waitingPlayers.innerHTML = `
      <div class="empty-card">
        まだプレイヤーはいません。
      </div>
    `;
    return;
  }

  waitingPlayers.innerHTML = players.map((player) => {
    return `
      <div class="waiting-player-card">
        <img
          src="${escapeAttr(player.iconPath || "/favicon.png")}"
          alt=""
          class="player-icon"
        >

        <div class="player-info">
          <div class="player-name-row">
            <span class="player-name">${escapeHtml(getPlayerName(player))}</span>
            ${player.isHost ? `<span class="host-badge">HOST</span>` : ""}
          </div>

          <div class="player-sub">
            ${player.isGuest ? "ゲスト参加" : "ログイン参加"}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function renderWatchers(room) {
  const watchers = Object.values(room.watchers || {});

  if (!watcherList) return;

  if (watchers.length === 0) {
    watcherList.innerHTML = `
      <span class="watcher-chip muted">観戦者なし</span>
    `;
    return;
  }

  watcherList.innerHTML = watchers.map((watcher) => {
    return `
      <span class="watcher-chip">
        ${escapeHtml(getPlayerName(watcher))}
        ${watcher.isHost ? " / HOST" : ""}
      </span>
    `;
  }).join("");
}

function renderWaitingButtons(room) {
  const players = Object.values(room.players || {});
  const host = isHost(room);

  startBattleBtn.disabled = !host || players.length < 2;

  if (!host) {
    startBattleBtn.textContent = "部屋主が開始できます";
  } else if (players.length < 2) {
    startBattleBtn.textContent = "2人以上で開始";
  } else {
    startBattleBtn.textContent = "バトル開始";
  }
}

function createWaitingStatusText(room) {
  const players = Object.values(room.players || {});
  const watchers = Object.values(room.watchers || {});

  if (isWatcher(room) && !isPlayer(room)) {
    return `観戦中です。現在プレイヤー${players.length}人、観戦者${watchers.length}人。`;
  }

  return `現在プレイヤー${players.length}人、観戦者${watchers.length}人。`;
}

function renderBattle(room) {
  showScreen("battle");

  setHeaderText(
    "バトル中",
    "全員がコマンドを選ぶとターンが進みます。"
  );

  battleRoomIdText.textContent = room.roomId || "------";
  turnText.textContent = `TURN ${room.turn || 1}`;

  renderBattleMessage(room);
  renderBattlePlayers(room);
  renderCommandPanel(room);
  renderBattleLog(room);
}

function renderBattleMessage(room) {
  const uid = getMyUid();
  const myPlayer = room.players?.[uid];
  const myCommand = room.commands?.[uid];

  if (!isPlayer(room)) {
    battleMessage.textContent = "観戦中です。プレイヤーの行動を見守りましょう。";
    return;
  }

  if (!myPlayer || myPlayer.down || myPlayer.alive === false || Number(myPlayer.hp) <= 0) {
    battleMessage.textContent = "あなたは倒れています。結果を見守りましょう。";
    return;
  }

  if (Number(myPlayer.stop || 0) > 0) {
    battleMessage.textContent = "止められているため、このターンは動けません。休憩を送るとターンが進みます。";
    return;
  }

  if (myCommand) {
    battleMessage.textContent = "コマンド選択済み。他のプレイヤーを待っています。";
    return;
  }

  battleMessage.textContent = "コマンドを選んでください。";
}

function renderBattlePlayers(room) {
  const players = Object.values(room.players || {});

  if (!playersArea) return;

  playersArea.innerHTML = players.map((player) => {
    const hp = Number(player.hp || 0);
    const sp = Number(player.sp || 0);
    const hpPercent = Math.max(0, Math.min(100, (hp / MAX_HP) * 100));
    const spPercent = Math.max(0, Math.min(100, (sp / 10) * 100));
    const isMe = player.uid === getMyUid();
    const isSubmitted = !!room.commands?.[player.uid];

    return `
      <div class="battle-player-card ${player.down || player.alive === false ? "down" : ""} ${isMe ? "me" : ""}">
        <div class="battle-player-head">
          <img
            src="${escapeAttr(player.iconPath || "/favicon.png")}"
            alt=""
            class="player-icon"
          >

          <div>
            <div class="player-name-row">
              <span class="player-name">${escapeHtml(getPlayerName(player))}</span>
              ${player.isHost ? `<span class="host-badge">HOST</span>` : ""}
              ${isMe ? `<span class="host-badge">YOU</span>` : ""}
            </div>

            <div class="player-sub">
              ${createPlayerStatusText(player, isSubmitted)}
            </div>
          </div>
        </div>

        <div class="status-bars">
          <div class="status-row">
            <span>HP</span>
            <div class="status-bar">
              <div class="status-bar-fill hp-fill" style="width: ${hpPercent}%"></div>
            </div>
            <strong>${hp}</strong>
          </div>

          <div class="status-row">
            <span>SP</span>
            <div class="status-bar">
              <div class="status-bar-fill sp-fill" style="width: ${spPercent}%"></div>
            </div>
            <strong>${sp}</strong>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function createPlayerStatusText(player, isSubmitted) {
  if (player.down || player.alive === false || Number(player.hp) <= 0) {
    return "DOWN";
  }

  if (Number(player.stop || 0) > 0) {
    return `停止中：残り${Number(player.stop)}ターン`;
  }

  if (isSubmitted) {
    return "コマンド選択済み";
  }

  return "コマンド待ち";
}

function renderCommandPanel(room) {
  const uid = getMyUid();
  const myPlayer = room.players?.[uid];

  if (!isPlayer(room)) {
    commandStatusText.textContent = "観戦中";
    commandList.innerHTML = `
      <div class="empty-card">
        観戦者はコマンドを選択できません。
      </div>
    `;
    return;
  }

  if (!myPlayer || myPlayer.down || myPlayer.alive === false || Number(myPlayer.hp) <= 0) {
    commandStatusText.textContent = "戦闘不能";
    commandList.innerHTML = `
      <div class="empty-card">
        倒れているためコマンドを選択できません。
      </div>
    `;
    return;
  }

  if (room.commands?.[uid]) {
    commandStatusText.textContent = "選択済み";
    commandList.innerHTML = `
      <div class="empty-card">
        コマンド選択済みです。他のプレイヤーを待ちましょう。
      </div>
    `;
    return;
  }

  commandStatusText.textContent = `現在SP：${Number(myPlayer.sp || 0)}`;

  const skills = getSkillList();

  commandList.innerHTML = skills.map((skill) => {
    const usable = canUseSkill(myPlayer, skill.id);

    return `
      <button
        type="button"
        class="command-btn ${usable ? "" : "disabled"}"
        data-skill-id="${escapeAttr(skill.id)}"
        ${usable ? "" : "disabled"}
      >
        <img src="${escapeAttr(skill.icon)}" alt="" class="command-icon">

        <span class="command-name">${escapeHtml(skill.name)}</span>

        <span class="command-cost">
          ${skill.cost === 0 ? "SPなし" : `${skill.cost}SP`}
        </span>
      </button>
    `;
  }).join("");

  commandList.querySelectorAll(".command-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const skillId = button.dataset.skillId;
      openCommandModal(skillId);
    });
  });
}

function openCommandModal(skillId) {
  const skill = getSkill(skillId);

  if (!skill) return;

  selectedSkillId = skill.id;
  selectedTargetUid = getMyUid();

  modalSkillIcon.src = skill.icon || "/favicon.png";
  modalSkillName.textContent = skill.name;
  modalSkillDescription.textContent = skill.description;

  targetSelectArea.innerHTML = `
    <div class="target-note">
      このゲームは全員同時にコマンドを選びます。対象選択はありません。
    </div>
  `;

  commandModal.classList.remove("hidden");
  commandModal.setAttribute("aria-hidden", "false");
}

function closeCommandModal() {
  selectedSkillId = "";
  selectedTargetUid = "";

  commandModal.classList.add("hidden");
  commandModal.setAttribute("aria-hidden", "true");
}

function renderBattleLog(room) {
  const lines = getLogLines(room);

  if (!battleLog) return;

  if (lines.length === 0) {
    battleLog.innerHTML = `
      <div class="log-line">まだログはありません。</div>
    `;
    return;
  }

  battleLog.innerHTML = lines.slice(-12).reverse().map((text) => {
    return `
      <div class="log-line">
        ${escapeHtml(text)}
      </div>
    `;
  }).join("");
}

function renderResult(room) {
  showScreen("result");

  setHeaderText(
    "バトル結果",
    "勝敗が決まりました。"
  );

  resultText.textContent = room.result?.text || "バトル終了！";

  const players = Object.values(room.players || {});

  resultPlayers.innerHTML = players.map((player) => {
    const hp = Number(player.hp || 0);
    const isWinner = room.result?.winnerUid && room.result.winnerUid === player.uid;

    return `
      <div class="waiting-player-card ${isWinner ? "winner" : ""}">
        <img
          src="${escapeAttr(player.iconPath || "/favicon.png")}"
          alt=""
          class="player-icon"
        >

        <div class="player-info">
          <div class="player-name-row">
            <span class="player-name">${escapeHtml(getPlayerName(player))}</span>
            ${isWinner ? `<span class="host-badge">WIN</span>` : ""}
          </div>

          <div class="player-sub">
            HP ${hp} / SP ${Number(player.sp || 0)}
          </div>
        </div>
      </div>
    `;
  }).join("");

  const host = isHost(room);
  rematchBtn.disabled = !host;
  rematchBtn.textContent = host ? "もう一度" : "部屋主が再戦できます";
}

async function leaveCurrentRoom() {
  const ok = confirm("部屋を出ますか？\n部屋主が出ると部屋は削除されます。");

  if (!ok) return;

  await leaveRoom(getCurrentRoomId());

  latestRoom = null;
  clearRoomUrl();
  showLobby();
}

function showLobby() {
  showScreen("lobby");

  setHeaderText(
    "コマンドを選んで、\n主役になろう。",
    "部屋を作って、友達とリアルタイムバトル。攻撃・防御・回復・必殺を使い分けよう。"
  );

  if (joinRoomInput) {
    joinRoomInput.value = "";
  }

  leaveRoomBtn?.classList.add("hidden");
  battleBackBtn?.classList.add("hidden");
}

function showScreen(screenName) {
  Object.values(screens).forEach((screen) => {
    screen?.classList.remove("active");
  });

  screens[screenName]?.classList.add("active");

  const inRoom = screenName !== "lobby";

  leaveRoomBtn?.classList.toggle("hidden", !inRoom);
  battleBackBtn?.classList.toggle("hidden", inRoom);
}

function setHeaderText(title, lead) {
  if (battleHeaderTitle) {
    battleHeaderTitle.innerHTML = escapeHtml(title).replace(/\n/g, "<br>");
  }

  if (battleHeaderLead) {
    battleHeaderLead.textContent = lead;
  }
}

async function runWithLoading(button, loadingText, callback) {
  if (!button) {
    try {
      await callback();
    } catch (error) {
      showError(error);
    }

    return;
  }

  const oldText = button.textContent;

  try {
    button.disabled = true;
    button.textContent = loadingText;

    await callback();
  } catch (error) {
    showError(error);
  } finally {
    button.disabled = false;
    button.textContent = oldText;
  }
}

function showError(error) {
  console.error(error);

  const message = error?.message || "エラーが発生しました。";

  alert(message);
}

function showMessage(message) {
  alert(message);
}

function restoreGuestName() {
  if (!guestNameInput) return;

  const guestName = getGuestName();

  if (guestName) {
    guestNameInput.value = guestName;
  }
}

function restoreRoomFromUrl() {
  const params = new URLSearchParams(location.search);
  const roomId = normalizeRoomId(params.get("room"));

  if (!roomId) return;

  if (joinRoomInput) {
    joinRoomInput.value = roomId;
  }
}

function setRoomUrl(roomId) {
  const safeRoomId = normalizeRoomId(roomId);

  if (!safeRoomId) return;

  const url = new URL(location.href);

  url.searchParams.set("room", safeRoomId);

  history.replaceState(null, "", url.toString());
}

function clearRoomUrl() {
  const url = new URL(location.href);

  url.searchParams.delete("room");

  history.replaceState(null, "", url.toString());
}

function getLogLines(room) {
  if (Array.isArray(room?.log)) {
    return room.log.filter(Boolean);
  }

  if (Array.isArray(room?.logs)) {
    return room.logs.map((item) => {
      return typeof item === "string" ? item : item.text;
    }).filter(Boolean);
  }

  if (room?.logs && typeof room.logs === "object") {
    return Object.values(room.logs)
      .sort((a, b) => {
        return Number(a.createdAt || 0) - Number(b.createdAt || 0);
      })
      .map((item) => {
        return typeof item === "string" ? item : item.text;
      })
      .filter(Boolean);
  }

  return [];
}

function getPlayerName(player) {
  return player?.name || player?.names || "ななし";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}
