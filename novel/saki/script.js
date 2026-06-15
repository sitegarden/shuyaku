let lastTouchEndTime = 0;

document.addEventListener(
  "touchend",
  (event) => {
    const now = Date.now();

    if (now - lastTouchEndTime <= 320) {
      event.preventDefault();
    }

    lastTouchEndTime = now;
  },
  { passive: false }
);

document.addEventListener(
  "dblclick",
  (event) => {
    event.preventDefault();
  },
  { passive: false }
);

const SAVE_KEY = "sakiMissionLogCleared";

const missions = [
  {
    id: "terminal",
    no: "MISSION 01",
    title: "教室のバグ端末",
    place: "普通教室",
    enemyName: "バグ端末",
    enemyMaxHp: 95,
    enemyAttack: 16,
    enemyType: "bug",
    reward: "任務ログ01",
    desc: "放課後の教室で、勝手に起動した端末を停止せよ。",
    intro: [
      "放課後の教室。",
      "誰もいないはずの場所で、端末だけが青白く点滅していた。",
      "サキは無言で端末へ近づく。",
      "任務開始。対象、バグ端末。"
    ],
    log: {
      type: "MISSION LOG",
      title: "任務ログ01：静かな教室",
      text: "対象は暴走端末。サキは冷静に処理した。報告書の最後に『教室は静かな方がいい』とだけ追記されていた。"
    }
  },
  {
    id: "drone",
    no: "MISSION 02",
    title: "廊下の暴走ドローン",
    place: "西棟廊下",
    enemyName: "暴走ドローン",
    enemyMaxHp: 120,
    enemyAttack: 21,
    enemyType: "speed",
    reward: "敵データ01",
    desc: "廊下を飛び回るドローンを撃墜、または停止せよ。",
    intro: [
      "夕日の差し込む廊下。",
      "小型ドローンが警告音を鳴らしながら、不規則に飛び回っている。",
      "サキは銃を構える。",
      "表情に変化はない。けれど、狙いは正確だった。"
    ],
    log: {
      type: "ENEMY DATA",
      title: "敵データ01：暴走ドローン",
      text: "高速移動する小型機械。解析後に攻撃すると命中率が上がる。サキ曰く『動きがうるさい』。"
    }
  },
  {
    id: "guard",
    no: "MISSION 03",
    title: "資料室の警備ロボ",
    place: "資料室",
    enemyName: "警備ロボ",
    enemyMaxHp: 160,
    enemyAttack: 27,
    enemyType: "armor",
    reward: "サキログ01",
    desc: "古い資料室で誤作動した警備ロボを無力化せよ。",
    intro: [
      "資料室の奥。",
      "古い警備ロボが、侵入者判定を誤っている。",
      "サキは一歩だけ前に出た。",
      "任務は単純。けれど、油断はできない。"
    ],
    log: {
      type: "SAKI LOG",
      title: "サキログ01：表情記録",
      text: "状態：少し安心。本人コメント：異常なし。備考：任務完了後、サキはほんの少しだけ目を伏せた。"
    }
  }
];

const actions = [
  {
    id: "attack",
    name: "攻撃",
    desc: "SP+1 / 安定ダメージ",
    run: () => {
      const baseDamage = state.analyzed ? 42 : 24;
      const damage = getDamageByEnemyType(baseDamage);

      state.enemy.hp -= damage;
      state.analyzed = false;
      state.sakiSp = Math.min(state.sakiMaxSp, state.sakiSp + 1);

      animateSaki("attack");

      return `サキは正確に攻撃した。\n${state.enemy.name}に${damage}ダメージ。\nSPが1上がった。`;
    }
  },
  {
    id: "guard",
    name: "防御",
    desc: "SP+1 / 次の被ダメージ半減",
    run: () => {
      state.guarding = true;
      state.sakiSp = Math.min(state.sakiMaxSp, state.sakiSp + 1);

      return "サキは防御姿勢を取った。\n次の攻撃のダメージを軽減する。\nSPが1上がった。";
    }
  },
  {
    id: "analyze",
    name: "解析",
    desc: "SP+1 / 次の攻撃強化",
    run: () => {
      state.analyzed = true;
      state.sakiSp = Math.min(state.sakiMaxSp, state.sakiSp + 1);

      if (state.enemy.type === "bug") {
        return `サキは${state.enemy.name}のエラー周期を解析した。\n次の攻撃が大きく強化される。\nSPが1上がった。`;
      }

      if (state.enemy.type === "speed") {
        return `サキは${state.enemy.name}の飛行パターンを解析した。\n次の攻撃が当たりやすくなる。\nSPが1上がった。`;
      }

      return `サキは${state.enemy.name}の装甲の薄い箇所を解析した。\n次の攻撃が強化される。\nSPが1上がった。`;
    }
  },
  {
    id: "evade",
    name: "回避",
    desc: "成功すると無傷",
    run: () => {
      let rate = 0.48;

      if (state.enemy.type === "speed") {
        rate = 0.38;
      }

      if (state.analyzed) {
        rate += 0.18;
      }

      const success = Math.random() < rate;

      state.evading = success;
      state.analyzed = false;

      if (success) {
        return "サキは敵の攻撃軌道を読んだ。\n次の攻撃を回避できそうだ。";
      }

      return "サキは回避を試みた。\nしかし敵の動きが不規則だ。";
    }
  },
  {
    id: "special",
    name: "精密射撃",
    desc: "SP3消費 / 大ダメージ",
    run: () => {
      if (state.sakiSp < 3) {
        return "SPが足りない。\n精密射撃は使えない。";
      }

      state.sakiSp -= 3;

      let damage = 58;

      if (state.analyzed) {
        damage = 78;
      }

      if (state.enemy.type === "armor" && !state.analyzed) {
        damage = 42;
      }

      state.enemy.hp -= damage;
      state.analyzed = false;

      animateSaki("attack");

      return `サキは呼吸を止め、精密射撃を放った。\n${state.enemy.name}に${damage}ダメージ。`;
    }
  }
];

let state = null;
let phase = "idle";
let textQueue = [];
let isTyping = false;
let typeTimer = null;
let fullText = "";
let pendingEnemyTurn = false;

const titleScreen = document.getElementById("titleScreen");
const missionScreen = document.getElementById("missionScreen");
const battleScreen = document.getElementById("battleScreen");
const collectionScreen = document.getElementById("collectionScreen");

const startBtn = document.getElementById("startBtn");
const collectionBtn = document.getElementById("collectionBtn");
const missionToTitleBtn = document.getElementById("missionToTitleBtn");
const missionToCollectionBtn = document.getElementById("missionToCollectionBtn");
const collectionToTitleBtn = document.getElementById("collectionToTitleBtn");
const collectionToMissionBtn = document.getElementById("collectionToMissionBtn");

const missionGrid = document.getElementById("missionGrid");
const logGrid = document.getElementById("logGrid");

const enemyName = document.getElementById("enemyName");
const enemyHpBar = document.getElementById("enemyHpBar");
const enemyHpText = document.getElementById("enemyHpText");
const sakiHpBar = document.getElementById("sakiHpBar");
const sakiHpText = document.getElementById("sakiHpText");

const speakerName = document.getElementById("speakerName");
const missionTitle = document.getElementById("missionTitle");
const messageText = document.getElementById("messageText");
const battleChoices = document.getElementById("battleChoices");
const giveUpBtn = document.getElementById("giveUpBtn");
const nextBtn = document.getElementById("nextBtn");
const sakiImg = document.getElementById("sakiImg");

function showScreen(screen) {
  document.querySelectorAll(".screen").forEach((item) => {
    item.classList.remove("active");
  });

  screen.classList.add("active");
}

function getCleared() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCleared(id) {
  const cleared = getCleared();

  if (!cleared.includes(id)) {
    cleared.push(id);
    localStorage.setItem(SAVE_KEY, JSON.stringify(cleared));
  }
}

function renderMissions() {
  const cleared = getCleared();

  missionGrid.innerHTML = "";

  missions.forEach((mission) => {
    const done = cleared.includes(mission.id);

    const card = document.createElement("article");
    card.className = "mission-card";

    card.innerHTML = `
      <div>
        <p class="mission-no">${mission.no}</p>
        <h3>${mission.title}</h3>
        <p>${mission.desc}</p>
        <div class="mission-tags">
          <span>${mission.place}</span>
          <span>${mission.enemyName}</span>
          <span>${done ? "CLEAR" : "未クリア"}</span>
        </div>
      </div>
      <button class="main-btn">${done ? "再挑戦" : "開始"}</button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      startMission(mission.id);
    });

    missionGrid.appendChild(card);
  });
}

function renderCollection() {
  const cleared = getCleared();

  logGrid.innerHTML = "";

  missions.forEach((mission) => {
    const unlocked = cleared.includes(mission.id);

    const card = document.createElement("article");
    card.className = `log-card ${unlocked ? "unlocked" : "locked"}`;

    card.innerHTML = `
      <p class="log-type">${unlocked ? mission.log.type : "LOCKED"}</p>
      <h3>${unlocked ? mission.log.title : "未解放ログ"}</h3>
      <p>${unlocked ? mission.log.text : "任務をクリアすると、このログが解放されます。"}</p>
      <span class="log-status">${unlocked ? "解放済み" : "未解放"}</span>
    `;

    logGrid.appendChild(card);
  });
}

function startMission(id) {
  const mission = missions.find((item) => item.id === id);

  state = {
    mission,
    sakiHp: 100,
    sakiMaxHp: 100,
    sakiSp: 0,
    sakiMaxSp: 5,
    enemy: {
      name: mission.enemyName,
      hp: mission.enemyMaxHp,
      maxHp: mission.enemyMaxHp,
      attack: mission.enemyAttack,
      type: mission.enemyType,
      charge: 0
    },
    guarding: false,
    analyzed: false,
    evading: false,
    finished: false,
    turn: 1
  };

  phase = "intro";
  textQueue = [...mission.intro];
  pendingEnemyTurn = false;

  enemyName.textContent = state.enemy.name;
  missionTitle.textContent = mission.title;
  battleChoices.innerHTML = "";
  nextBtn.textContent = "次へ";

  showScreen(battleScreen);
  updateHp();
  showNextQueueText();
}

function getDamageByEnemyType(baseDamage) {
  let damage = baseDamage;

  if (state.enemy.type === "bug" && state.analyzed) {
    damage += 10;
  }

  if (state.enemy.type === "armor" && !state.analyzed) {
    damage = Math.ceil(damage * 0.7);
  }

  if (state.enemy.type === "speed" && !state.analyzed) {
    const hit = Math.random() < 0.78;

    if (!hit) {
      damage = 0;
    }
  }

  return damage;
}

function updateHp() {
  const enemyRate = Math.max(0, state.enemy.hp) / state.enemy.maxHp;
  const sakiRate = Math.max(0, state.sakiHp) / state.sakiMaxHp;

  enemyHpBar.style.width = `${enemyRate * 100}%`;
  sakiHpBar.style.width = `${sakiRate * 100}%`;

  enemyHpText.textContent = `HP ${Math.max(0, state.enemy.hp)} / ${state.enemy.maxHp}`;
  sakiHpText.textContent = `HP ${Math.max(0, state.sakiHp)} / ${state.sakiMaxHp}　SP ${state.sakiSp} / ${state.sakiMaxSp}`;
}

function setText(text) {
  clearInterval(typeTimer);

  fullText = text;
  messageText.textContent = "";
  isTyping = true;

  let index = 0;

  typeTimer = setInterval(() => {
    messageText.textContent += fullText.charAt(index);
    index++;

    if (index >= fullText.length) {
      finishTyping();
    }
  }, 26);
}

function finishTyping() {
  clearInterval(typeTimer);
  messageText.textContent = fullText;
  isTyping = false;
}

function showNextQueueText() {
  battleChoices.innerHTML = "";

  if (textQueue.length > 0) {
    speakerName.textContent = phase === "intro" ? "SYSTEM" : "サキ";
    setText(textQueue.shift());
    return;
  }

  if (phase === "intro") {
    phase = "battle";
    speakerName.textContent = "SYSTEM";
    setText("戦闘開始。\n行動を選択してください。");
    renderActionChoices();
    return;
  }

  if (phase === "win") {
    saveCleared(state.mission.id);

    speakerName.textContent = "MISSION CLEAR";
    setText(`${state.mission.title}をクリアしました。\n${state.mission.reward}を入手。`);

    state.finished = true;
    nextBtn.textContent = "任務選択へ";
    return;
  }

  if (phase === "lose") {
    speakerName.textContent = "MISSION FAILED";
    setText("サキは一時撤退した。\n任務は失敗。体勢を立て直して再挑戦しよう。");

    state.finished = true;
    nextBtn.textContent = "任務選択へ";
  }
}

function renderActionChoices() {
  if (state.finished) return;

  battleChoices.innerHTML = "";

  actions.forEach((action) => {
    const button = document.createElement("button");

    button.className = "choice-btn";
    button.type = "button";

    if (action.id === "special" && state.sakiSp < 3) {
      button.style.opacity = "0.55";
    }

    button.innerHTML = `${action.name}<br><small>${action.desc}</small>`;

    button.addEventListener("click", () => {
      if (isTyping) {
        finishTyping();
        return;
      }

      playerTurn(action);
    });

    battleChoices.appendChild(button);
  });
}

function playerTurn(action) {
  battleChoices.innerHTML = "";

  const beforeEnemyHp = state.enemy.hp;
  const playerText = action.run();

  updateHp();

  if (action.id === "special" && state.sakiSp < 3 && beforeEnemyHp === state.enemy.hp) {
    speakerName.textContent = "SYSTEM";
    setText(playerText);
    renderActionChoices();
    return;
  }

  if (state.enemy.hp <= 0) {
    phase = "win";
    pendingEnemyTurn = false;

    textQueue = [
      playerText,
      `${state.enemy.name}は停止した。`,
      "サキは銃を下ろし、静かに任務完了を記録した。"
    ];

    showNextQueueText();
    return;
  }

  pendingEnemyTurn = true;

  speakerName.textContent = "サキ";
  setText(playerText);
}

function enemyTurn() {
  const enemyText = createEnemyAttackText();

  if (state.sakiHp <= 0) {
    phase = "lose";

    textQueue = [
      enemyText,
      "サキの行動継続が困難になった。"
    ];

    showNextQueueText();
    return;
  }

  speakerName.textContent = state.enemy.name;
  setText(enemyText);
}

function createEnemyAttackText() {
  if (state.evading) {
    state.evading = false;
    state.turn++;

    return `${state.enemy.name}の攻撃。\nサキは攻撃を回避した。`;
  }

  let damage = state.enemy.attack;
  let extraText = "";

  if (state.enemy.type === "bug") {
    if (Math.random() < 0.32) {
      damage += 10;
      extraText = "\nエラー電流が暴走し、攻撃が強化された。";
    }
  }

  if (state.enemy.type === "speed") {
    const doubleAttack = Math.random() < 0.35;

    if (doubleAttack) {
      damage += Math.ceil(state.enemy.attack * 0.55);
      extraText = "\n高速移動からの連続攻撃。";
    }
  }

  if (state.enemy.type === "armor") {
    state.enemy.charge++;

    if (state.enemy.charge >= 3) {
      damage += 20;
      state.enemy.charge = 0;
      extraText = "\n警備ロボは溜めた出力を一気に放った。";
    } else {
      extraText = `\n警備ロボの出力が上がっている。(${state.enemy.charge}/3)`;
    }
  }

  if (state.guarding) {
    damage = Math.ceil(damage / 2);
    state.guarding = false;
    extraText += "\n防御によりダメージを軽減した。";
  }

  state.sakiHp -= damage;
  state.turn++;

  animateSaki("hit");
  updateHp();

  return `${state.enemy.name}の攻撃。\nサキは${damage}ダメージを受けた。${extraText}`;
}

function animateSaki(className) {
  sakiImg.classList.remove("hit", "attack");
  void sakiImg.offsetWidth;
  sakiImg.classList.add(className);
}

function nextStep() {
  if (isTyping) {
    finishTyping();
    return;
  }

  if (state?.finished) {
    renderMissions();
    showScreen(missionScreen);
    return;
  }

  if (pendingEnemyTurn) {
    pendingEnemyTurn = false;
    enemyTurn();
    return;
  }

  if (phase === "battle" && battleChoices.innerHTML === "") {
    speakerName.textContent = "サキ";
    setText("サキは体勢を立て直した。\n次の行動を選択してください。");
    renderActionChoices();
    return;
  }

  if (textQueue.length > 0 || phase !== "battle") {
    showNextQueueText();
    return;
  }

  if (phase === "battle") {
    renderActionChoices();
  }
}

startBtn.addEventListener("click", () => {
  renderMissions();
  showScreen(missionScreen);
});

collectionBtn.addEventListener("click", () => {
  renderCollection();
  showScreen(collectionScreen);
});

missionToTitleBtn.addEventListener("click", () => {
  showScreen(titleScreen);
});

missionToCollectionBtn.addEventListener("click", () => {
  renderCollection();
  showScreen(collectionScreen);
});

collectionToTitleBtn.addEventListener("click", () => {
  showScreen(titleScreen);
});

collectionToMissionBtn.addEventListener("click", () => {
  renderMissions();
  showScreen(missionScreen);
});

giveUpBtn.addEventListener("click", () => {
  renderMissions();
  showScreen(missionScreen);
});

nextBtn.addEventListener("click", nextStep);