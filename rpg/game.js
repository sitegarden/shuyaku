const app = document.getElementById("app");

const SAVE_KEY = "shuyakuQuestGuestSave";

const enemies = [
  {
    name: "スライム・モブ",
    hp: 18,
    attack: 5,
    exp: 8,
    message: "ぷるぷる……モブでも生きてる。"
  },
  {
    name: "ため息コウモリ",
    hp: 24,
    attack: 7,
    exp: 12,
    message: "はぁ……やる気あるの？"
  },
  {
    name: "決めつけキノコ",
    hp: 28,
    attack: 8,
    exp: 16,
    message: "君、主人公タイプじゃないよね。"
  }
];

const boss = {
  name: "門番ゴーレム",
  hp: 55,
  attack: 10,
  exp: 50,
  message: "役なしは、この先へ進めない。"
};

let player = loadSave() || {
  name: "名無しの主役",
  level: 1,
  exp: 0,
  hp: 40,
  maxHp: 40,
  stage: 1,
  clearedTrial: false,
  skills: ["ツッコミ"]
};

let currentEnemy = null;

document.addEventListener("click", (e) => {
  const action = e.target.dataset.action;
  if (!action) return;

  if (action === "start") showField();
  if (action === "walk") randomEncounter();
  if (action === "rest") rest();
  if (action === "status") showStatus();
  if (action === "attack") playerAttack();
  if (action === "skill") useSkill();
  if (action === "boss") startBoss();
  if (action === "reset") resetSave();
});

showTitle();

function showTitle() {
  app.innerHTML = `
    <section class="card">
      <h1>SHUYAKU QUEST</h1>
      <p>主役になれなかった世界で、君は物語を奪いに行く。</p>

      ${
        player.clearedTrial
          ? `<p><strong>体験版クリア済み。</strong><br>ログインすると、この先の物語へ進めます。</p>`
          : ""
      }

      <div class="menu">
        <button data-action="start">冒険を始める</button>
        <button data-action="reset">データを消す</button>
      </div>
    </section>
  `;
}

function showField(log = "モブ草原に立っている。風が少しだけ優しい。") {
  saveGame();

  app.innerHTML = `
    <section class="card">
      <h1>モブ草原</h1>
      <p>ここは、まだ誰にも選ばれていない者が最初に通る草原。</p>

      ${statusHtml()}

      <div class="menu">
        <button data-action="walk">進む</button>
        <button data-action="rest">休む</button>
        <button data-action="status">ステータス</button>
        <button data-action="boss">門へ向かう</button>
      </div>

      <div class="log">${log}</div>
    </section>
  `;
}

function statusHtml() {
  return `
    <div class="status">
      <div>名前：${player.name}</div>
      <div>Lv：${player.level}</div>
      <div>HP：${player.hp} / ${player.maxHp}</div>
      <div>EXP：${player.exp}</div>
      <div>スキル：${player.skills.join("、")}</div>
    </div>
  `;
}

function randomEncounter() {
  const enemy = structuredClone(enemies[Math.floor(Math.random() * enemies.length)]);
  currentEnemy = enemy;
  showBattle(`${enemy.name} が現れた！<br>${enemy.message}`);
}

function startBoss() {
  currentEnemy = structuredClone(boss);
  showBattle(`${boss.name} が立ちはだかった！<br>${boss.message}`);
}

function showBattle(log = "") {
  app.innerHTML = `
    <section class="card">
      <h1>戦闘</h1>

      ${statusHtml()}

      <p class="enemy">${currentEnemy.name}</p>
      <p>敵HP：${currentEnemy.hp}</p>

      <div class="menu">
        <button data-action="attack">たたかう</button>
        <button data-action="skill">スキル</button>
      </div>

      <div class="log">${log}</div>
    </section>
  `;
}

function playerAttack() {
  const damage = Math.floor(Math.random() * 7) + 8;
  currentEnemy.hp -= damage;

  if (currentEnemy.hp <= 0) {
    winBattle(`${player.name} の攻撃！ ${damage}ダメージ！`);
    return;
  }

  enemyTurn(`${player.name} の攻撃！ ${damage}ダメージ！`);
}

function useSkill() {
  let damage = Math.floor(Math.random() * 10) + 12;
  let text = `${player.name} はツッコミを放った！<br>「うるせぇ、勝手に決めるな！」<br>${damage}ダメージ！`;

  if (currentEnemy.name === "門番ゴーレム" && currentEnemy.hp < 30) {
    damage = 28;
    text = `${player.name} は主役宣言を放った！<br>「選ばれてから動くやつが主役なわけねぇだろ」<br>${damage}ダメージ！`;
  }

  currentEnemy.hp -= damage;

  if (currentEnemy.hp <= 0) {
    winBattle(text);
    return;
  }

  enemyTurn(text);
}

function enemyTurn(beforeText) {
  const damage = Math.floor(Math.random() * currentEnemy.attack) + 3;
  player.hp -= damage;

  if (player.hp <= 0) {
    player.hp = 1;
    saveGame();
    showField(`${beforeText}<br><br>${currentEnemy.name} の攻撃！ ${damage}ダメージ！<br>危なかったので草原の入口まで戻された。`);
    return;
  }

  showBattle(`${beforeText}<br><br>${currentEnemy.name} の攻撃！ ${damage}ダメージ！`);
}

function winBattle(beforeText) {
  player.exp += currentEnemy.exp;

  let log = `${beforeText}<br><br>${currentEnemy.name} を倒した！<br>${currentEnemy.exp}EXPを手に入れた。`;

  if (player.exp >= player.level * 30) {
    player.level++;
    player.maxHp += 8;
    player.hp = player.maxHp;
    log += `<br><br>レベルアップ！ Lv${player.level} になった。`;
  }

  if (currentEnemy.name === "門番ゴーレム") {
    player.clearedTrial = true;
    saveGame();

    app.innerHTML = `
      <section class="card">
        <h1>体験版クリア</h1>
        <p>門番ゴーレムを倒した。</p>
        <p>ナビにゃん「お前、役なしじゃないな。まだ名前のない主役だ」</p>
        <p><strong>ここから先はログインすると進めます。</strong></p>

        <div class="menu">
          <a class="button" href="/login.html">ログインする</a>
          <button data-action="start">草原に戻る</button>
        </div>
      </section>
    `;
    return;
  }

  saveGame();
  showField(log);
}

function rest() {
  player.hp = player.maxHp;
  saveGame();
  showField("少し休んだ。HPが全回復した。");
}

function showStatus() {
  showField("ステータスを確認した。まあまあ主役っぽくなってきた。");
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(player));
}

function loadSave() {
  const data = localStorage.getItem(SAVE_KEY);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function resetSave() {
  localStorage.removeItem(SAVE_KEY);
  location.reload();
}
