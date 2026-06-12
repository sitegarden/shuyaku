// battle/battle.js

export const MAX_HP = 4000;
export const MAX_SP = 99;

export const SKILLS = {
  attack: {
    id: "attack",
    command: "攻撃",
    name: "攻撃",
    cost: 0,
    icon: "/assets/skills/attack.png",
    description: "400ダメージを与える。1SPたまる。"
  },

  defense: {
    id: "defense",
    command: "防御",
    name: "防御",
    cost: 0,
    icon: "/assets/skills/defense.png",
    description: "受けるダメージを半分にする。止める効果も半分にする。1SPたまる。"
  },

  rest: {
    id: "rest",
    command: "休憩",
    name: "休憩",
    cost: 0,
    icon: "/assets/skills/rest.png",
    description: "何もしない。3SPたまる。"
  },

  clear: {
    id: "clear",
    command: "透明",
    name: "透明",
    cost: 2,
    icon: "/assets/skills/clear.png",
    description: "ダメージと止める効果を無効にする。2SP消費する。"
  },

  heal: {
    id: "heal",
    command: "回復",
    name: "回復",
    cost: 4,
    icon: "/assets/skills/heal.png",
    description: "800HP回復する。4SP消費する。"
  },

  counter: {
    id: "counter",
    command: "カウンター",
    name: "カウンター",
    cost: 5,
    icon: "/assets/skills/counter.png",
    description: "受けるはずだった攻撃ダメージを無効化し、その半分を全員に返す。5SP消費する。"
  },

  kill: {
    id: "kill",
    command: "必殺",
    name: "必殺",
    cost: 6,
    icon: "/assets/skills/kill.png",
    description: "1200ダメージを与える。6SP消費する。"
  },

  stop: {
    id: "stop",
    command: "止める",
    name: "止める",
    cost: 6,
    icon: "/assets/skills/stop.png",
    description: "相手を2ターン動けなくする。6SP消費する。"
  },

  absorb: {
    id: "absorb",
    command: "吸収",
    name: "吸収",
    cost: 5,
    icon: "/assets/skills/absorb.png",
    description: "受けるはずだった攻撃ダメージの半分を回復に変える。5SP消費する。"
  },

  bigheal: {
    id: "bigheal",
    command: "全回復",
    name: "全回復",
    cost: 8,
    icon: "/assets/skills/bigheal.png",
    description: "HPを全回復する。8SP消費する。"
  },

  bigkill: {
    id: "bigkill",
    command: "超必殺",
    name: "超必殺",
    cost: 10,
    icon: "/assets/skills/bigkill.png",
    description: "2800ダメージを与える。10SP消費する。"
  },

  stealsp: {
    id: "stealsp",
    command: "SP回収",
    name: "SP回収",
    cost: 3,
    icon: "/assets/skills/stealsp.png",
    description: "他の参加者の現在SPの半分を奪う。3SP消費する。"
  }
};

const COMMAND_ALIASES = {
  "攻撃": "attack",
  "防御": "defense",
  "休憩": "rest",
  "透明": "clear",
  "回復": "heal",
  "カウンター": "counter",
  "必殺": "kill",
  "止める": "stop",
  "吸収": "absorb",
  "全回復": "bigheal",
  "超必殺": "bigkill",
  "SP奪う": "stealsp",
  "SP回収": "stealsp",
  "動けない": "unable",

  attack: "attack",
  defense: "defense",
  rest: "rest",
  clear: "clear",
  heal: "heal",
  counter: "counter",
  kill: "kill",
  stop: "stop",
  absorb: "absorb",
  bigheal: "bigheal",
  bigkill: "bigkill",
  stealsp: "stealsp"
};

export function getSkill(skillIdOrCommand) {
  const id = normalizeSkillId(skillIdOrCommand);
  return SKILLS[id] || null;
}

export function getSkillList() {
  return Object.values(SKILLS);
}

export function getCommandDescription(skillIdOrCommand) {
  const skill = getSkill(skillIdOrCommand);
  return skill?.description || "";
}

export function canUseSkill(player, skillIdOrCommand) {
  const skill = getSkill(skillIdOrCommand);

  if (!skill) return false;
  if (!player) return false;
  if (isDown(player)) return false;

  return toNumber(player.sp) >= skill.cost;
}

export function createInitialBattlePlayer(player) {
  return {
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
}

export function getAlivePlayers(players = {}) {
  return Object.values(players).filter((player) => {
    return isJoined(player) && !isDown(player);
  });
}

export function getWinner(players = {}) {
  const alive = [];

  Object.keys(players || {}).forEach((playerId) => {
    const player = players[playerId];

    if (!isJoined(player)) return;
    if (isDown(player)) return;

    alive.push(playerId);
  });

  if (alive.length === 1) {
    return alive[0];
  }

  if (alive.length === 0) {
    return "draw";
  }

  return null;
}

export function isBattleFinished(players = {}) {
  return getWinner(players) !== null;
}

export function resolveTurn(room) {
  const players = clone(room.players || {});
  const commands = room.commands || {};
  const turn = toNumber(room.turn) || 1;

  const log = [];

  let totalAttack = 0;
  let totalStopPower = 0;

  const counterDamage = {};
  const spStealUsers = [];

  normalizePlayers(players);

  Object.keys(players).forEach((playerId) => {
    const player = players[playerId];

    if (!isJoined(player)) return;

    player.myatk = 0;
    player.mystp = 0;
    player.dmgatk = 0;
    player.dmgstp = 0;

    if (isDown(player)) return;

    const command = getPlayerCommand({
      player,
      playerId,
      commands
    });

    player.command = command;

    log.push(`${getPlayerName(player)}の${getCommandName(command)}！`);

    const skillId = normalizeSkillId(command);

    if (skillId === "attack") {
      player.myatk = 400;
      totalAttack += 400;
      return;
    }

    if (skillId === "kill") {
      player.myatk = 1200;
      totalAttack += 1200;
      return;
    }

    if (skillId === "bigkill") {
      player.myatk = 2800;
      totalAttack += 2800;
      return;
    }

    if (skillId === "stop") {
      player.mystp = 2;
      totalStopPower = 2;
      return;
    }

    if (skillId === "stealsp") {
      spStealUsers.push(playerId);
    }
  });

  Object.keys(players).forEach((playerId) => {
    const player = players[playerId];

    if (!isJoined(player)) return;
    if (isDown(player)) return;

    const skillId = normalizeSkillId(player.command);

    player.dmgatk = Math.max(0, totalAttack - toNumber(player.myatk));
    player.dmgstp = Math.max(0, totalStopPower - toNumber(player.mystp));

    if (!canResolveCommand(player, skillId)) {
      applyUnableOrRest({
        player,
        skillId,
        log
      });
      return;
    }

    if (skillId === "attack") {
      player.hp -= player.dmgatk;
      player.stop = player.dmgstp;
      player.sp += 1;
    } else if (skillId === "defense") {
      player.hp -= Math.floor(player.dmgatk / 2);
      player.stop = Math.floor(player.dmgstp / 2);
      player.sp += 1;
    } else if (skillId === "rest") {
      player.hp -= player.dmgatk;
      player.stop = player.dmgstp;
      player.sp += 3;
    } else if (skillId === "clear") {
      player.sp -= 2;
      // 透明はダメージも止める効果も受けない
    } else if (skillId === "heal") {
      player.hp += 800;
      player.hp = Math.min(player.hp, MAX_HP);
      player.hp -= player.dmgatk;
      player.stop = player.dmgstp;
      player.sp -= 4;
    } else if (skillId === "counter") {
      const incoming = player.dmgatk;

      player.stop = player.dmgstp;
      player.sp -= 5;

      counterDamage[playerId] = Math.floor(incoming / 2);
    } else if (skillId === "absorb") {
      const incoming = player.dmgatk;
      const heal = Math.floor(incoming / 2);

      player.hp += heal;
      player.hp = Math.min(player.hp, MAX_HP);
      player.stop = player.dmgstp;
      player.sp -= 5;
    } else if (skillId === "kill") {
      player.hp -= player.dmgatk;
      player.stop = player.dmgstp;
      player.sp -= 6;
    } else if (skillId === "stop") {
      player.hp -= player.dmgatk;
      player.sp -= 6;
    } else if (skillId === "bigheal") {
      player.hp = MAX_HP;
      player.hp -= player.dmgatk;
      player.stop = player.dmgstp;
      player.sp -= 8;
    } else if (skillId === "bigkill") {
      player.hp -= player.dmgatk;
      player.stop = player.dmgstp;
      player.sp -= 10;
    } else if (skillId === "stealsp") {
      player.hp -= player.dmgatk;
      player.stop = player.dmgstp;
      player.sp -= 3;
    } else if (skillId === "unable") {
      player.hp -= player.dmgatk;
      player.sp += 1;

      if (toNumber(player.stop) > 0) {
        player.stop -= 1;
      }
    } else {
      player.hp -= player.dmgatk;
      player.stop = player.dmgstp;
      player.sp += 3;
    }

    normalizePlayerStatus(player);
    player.command = "";
    player.skillId = "";
  });

  applyCounterDamage({
    players,
    counterDamage,
    log
  });

  applySpSteal({
    players,
    spStealUsers,
    log
  });

  normalizePlayers(players);

  const winner = getWinner(players);

  const appendedLogs = [
    ...getRoomLogs(room),
    ...log
  ];

  if (winner === "draw") {
    return {
      ...room,
      players,
      commands: {},
      phase: "end",
      status: "result",
      result: {
        winnerUid: null,
        winnerName: null,
        text: "ひきわけ"
      },
      log: [
        ...appendedLogs,
        "ひきわけ"
      ],
      logs: makeLogs([
        ...appendedLogs,
        "ひきわけ"
      ])
    };
  }

  if (winner) {
    const winnerPlayer = players[winner];
    const winnerName = getPlayerName(winnerPlayer);

    return {
      ...room,
      players,
      commands: {},
      phase: "end",
      status: "result",
      result: {
        winnerUid: winnerPlayer.uid || winner,
        winnerName,
        text: `${winnerName}の勝ち！`
      },
      log: [
        ...appendedLogs,
        `${winnerName}の勝ち！`
      ],
      logs: makeLogs([
        ...appendedLogs,
        `${winnerName}の勝ち！`
      ])
    };
  }

  return {
    ...room,
    players,
    commands: {},
    phase: "selecting",
    status: "battle",
    turn: turn + 1,
    log: [
      ...appendedLogs,
      `${turn}ターン目終了。次のコマンドを選んでください`
    ],
    logs: makeLogs([
      ...appendedLogs,
      `${turn}ターン目終了。次のコマンドを選んでください`
    ])
  };
}

function getPlayerCommand({ player, playerId, commands }) {
  if (toNumber(player.stop) > 0) {
    return "動けない";
  }

  const commandData = commands[playerId] || commands[player.uid] || null;

  if (typeof commandData === "string") {
    return commandData;
  }

  if (commandData?.skillId) {
    return commandData.skillId;
  }

  if (commandData?.command) {
    return commandData.command;
  }

  if (player.skillId) {
    return player.skillId;
  }

  if (player.command) {
    return player.command;
  }

  return "休憩";
}

function canResolveCommand(player, skillId) {
  if (skillId === "unable") {
    return true;
  }

  const skill = SKILLS[skillId];

  if (!skill) {
    return true;
  }

  return toNumber(player.sp) >= skill.cost;
}

function applyUnableOrRest({ player, skillId, log }) {
  const skill = SKILLS[skillId];

  if (skill) {
    log.push(`${getPlayerName(player)}はSPが足りなかったため休憩した。`);
  }

  player.hp -= player.dmgatk;
  player.stop = player.dmgstp;
  player.sp += 3;

  normalizePlayerStatus(player);
  player.command = "";
  player.skillId = "";
}

function applyCounterDamage({ players, counterDamage, log }) {
  Object.keys(counterDamage).forEach((counterUserId) => {
    const damage = toNumber(counterDamage[counterUserId]);

    if (damage <= 0) return;

    const counterUser = players[counterUserId];

    if (!counterUser || !isJoined(counterUser)) return;

    Object.keys(players).forEach((playerId) => {
      const player = players[playerId];

      if (!isJoined(player)) return;
      if (isDown(player)) return;
      if (String(playerId) === String(counterUserId)) return;

      player.hp -= damage;
      normalizePlayerStatus(player);
    });

    log.push(`${getPlayerName(counterUser)}のカウンター！全員に${damage}ダメージ！`);
  });
}

function applySpSteal({ players, spStealUsers, log }) {
  spStealUsers.forEach((userId) => {
    const user = players[userId];

    if (!user || !isJoined(user) || isDown(user)) return;

    let stolenTotal = 0;

    Object.keys(players).forEach((targetId) => {
      if (String(targetId) === String(userId)) return;

      const target = players[targetId];

      if (!isJoined(target)) return;
      if (isDown(target)) return;

      const amount = Math.floor(toNumber(target.sp) / 2);

      if (amount <= 0) return;

      target.sp -= amount;
      stolenTotal += amount;

      normalizePlayerStatus(target);
    });

    user.sp += stolenTotal;
    normalizePlayerStatus(user);

    log.push(`${getPlayerName(user)}はSPを${stolenTotal}回収した！`);
  });
}

function normalizePlayers(players) {
  Object.keys(players || {}).forEach((playerId) => {
    const player = players[playerId];

    if (!player) return;

    if (!player.uid) {
      player.uid = playerId;
    }

    if (!player.name && player.names) {
      player.name = player.names;
    }

    if (!player.names && player.name) {
      player.names = player.name;
    }

    if (!player.iconPath) {
      player.iconPath = "/favicon.png";
    }

    if (player.joined === undefined) {
      player.joined = true;
    }

    normalizePlayerStatus(player);
  });
}

function normalizePlayerStatus(player) {
  player.hp = clamp(toNumber(player.hp), 0, MAX_HP);
  player.sp = clamp(toNumber(player.sp), 0, MAX_SP);
  player.stop = Math.max(0, Math.floor(toNumber(player.stop)));

  if (player.hp <= 0) {
    player.hp = 0;
    player.down = true;
    player.alive = false;
  } else {
    player.down = player.down === true ? true : false;
    player.alive = !player.down;
  }

  if (player.sp < 0) {
    player.sp = 0;
  }
}

function getCommandName(skillIdOrCommand) {
  const skill = getSkill(skillIdOrCommand);

  if (skill) {
    return skill.name;
  }

  if (skillIdOrCommand === "unable") {
    return "動けない";
  }

  return String(skillIdOrCommand || "休憩");
}

function normalizeSkillId(value) {
  const key = String(value || "").trim();

  return COMMAND_ALIASES[key] || key;
}

function isJoined(player) {
  return !!player && player.joined !== false;
}

function isDown(player) {
  if (!player) return true;
  if (player.down === true) return true;
  if (player.alive === false) return true;
  if (toNumber(player.hp) <= 0) return true;

  return false;
}

function getPlayerName(player) {
  return player?.name || player?.names || "ななし";
}

function getRoomLogs(room) {
  if (Array.isArray(room.log)) {
    return room.log;
  }

  if (Array.isArray(room.logs)) {
    return room.logs.map((item) => {
      return typeof item === "string" ? item : item.text;
    }).filter(Boolean);
  }

  if (room.logs && typeof room.logs === "object") {
    return Object.values(room.logs).map((item) => {
      return typeof item === "string" ? item : item.text;
    }).filter(Boolean);
  }

  return [];
}

function makeLogs(lines) {
  return lines.slice(-60).map((text, index) => {
    return {
      id: `log_${Date.now()}_${index}`,
      text,
      createdAt: Date.now() + index
    };
  });
}

function toNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return number;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value || {}));
}
