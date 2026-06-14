const app = document.getElementById("app");

const SAVE_KEY = "shuyakuQuestGuestSave";

const mapData = [
  ["🌳", "🌳", "🌳", "🌳", "🌳", "🌳", "🌳", "🌳", "🌳"],
  ["🌳", "🌱", "🌱", "🌱", "👾", "🌱", "🌱", "🚪", "🌳"],
  ["🌳", "🌱", "🌳", "🌱", "🌳", "🌱", "🌳", "🌱", "🌳"],
  ["🌳", "🐱", "🌱", "🌱", "🌱", "🌱", "👾", "🌱", "🌳"],
  ["🌳", "🌱", "🌳", "🌱", "🌳", "🌱", "🌳", "🌱", "🌳"],
  ["🌳", "🌱", "🌱", "👾", "🌱", "🌱", "🌱", "🌱", "🌳"],
  ["🌳", "🌳", "🌳", "🌳", "🌳", "🌳", "🌳", "🌳", "🌳"]
];

const enemies = [
  {
    icon: "🟢",
    name: "スライム・モブ",
    hp: 18,
    attack: 5,
    exp: 8,
    message: "ぷるぷる……モブでも生きてる。"
  },
  {
    icon: "🦇",
    name: "ため息コウモリ",
    hp: 24,
    attack: 7,
    exp: 12,
    message: "はぁ……やる気あるの？"
  },
  {
    icon: "🍄",
    name: "決めつけキノコ",
    hp: 28,
    attack: 8,
    exp: 16,
    message: "君、主人公タイプじゃないよね。"
  }
];

const boss = {
  icon: "🗿",
  name: "門番ゴーレム",
  hp: 60,
  attack: 11,
  exp: 50,
  message: "役なしは、この先へ進めない。"
};

let player = loadSave() || {
  name: "名無しの主役",
  level: 1,
  exp: 0,
  hp: 40,
  maxHp: 40,
  x: 1,
  y: 5,
  clearedTrial: false,
  skills: ["ツッコミ"]
};

let currentEnemy = null;
let lastLog = "モブ草原に来た。ここから、役なしの物語が始まる。";

document.addEventListener("click", (e) => {
  const action = e.target.dataset.action;
  if (!action) return;

  if (action === "start") showMap();
  if (action === "move") movePlayer(e.target.dataset.dir);
  if (action === "rest") rest();
  if (action === "attack") playerAttack();
  if (action === "skill") useSkill();
  if (action === "run") showMap("逃げた。まあ戦略的撤退ってやつ。");
  if (action === "reset") resetSave();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") movePlayer("up");
  if (e.key === "ArrowDown") movePlayer("down");
  if (e.key === "ArrowLeft") movePlayer("left");
  if (e.key === "ArrowRight") movePlayer("right");
});

showTitle();

function showTitle() {
  app.innerHTML = `
    <section class="game-shell">
      <div class="game-header">
        <h1 class="game-title">SHUYAKU QUEST</h1>
        <p class="game-subtitle">主役になれなかった世界で、君は物語を奪いに行く。</p>
      </div>

      <div class="game-body">
        <section class="map-panel">
          <div class="enemy-box">✨</div>
        </section>

        <aside class="side-panel">
          <h2>冒険の記録</h2>
          <p>ゲストは体験版として第1ステージまで遊べます。</p>

          ${
            player.clearedTrial
              ? `<p><strong>体験版クリア済み。</strong><br>ログインすると先へ進めます。</p>`
              : ""
          }

          <div class="menu">
            <button data-action="start">はじめる</button>
            <button data-action="reset">データ削除</button>
          </div>
        </aside>
      </div>

      <div class="log-panel">
        「選ばれないなら、こっちから主役になればいい。」
      </div>
    </section>
  `;
}

function showMap(log = lastLog) {
  lastLog = log;
  saveGame();

  app.innerHTML = `
    <section class="game-shell">
      <div class="game-header">
        <h1 class="game-title">モブ草原</h1>
        <p class="game-subtitle">第1ステージ：役なしが最初に通る草原</p>
      </div>

      <div class="game-body">
        <section class="map-panel">
          <div class="map-title">
            <h2>フィールド</h2>
            <span class="badge">体験版</span>
          </div>

          <div class="tile-map">
            ${renderMap()}
          </div>
        </section>

        <aside class="side-panel">
          <h2>ステータス</h2>
          ${statusHtml()}

          <div class="controls">
            <button data-action="move" data-dir="up">↑</button>
            <button data-action="move" data-dir="left">←</button>
            <button data-action="move" data-dir="down">↓</button>
            <button data-action="move" data-dir="right">→</button>
          </div>

          <div class="menu">
            <button data-action="rest">休む</button>
          </div>
        </aside>
      </div>

      <div class="log-panel">${log}</div>
    </section>
  `;
}

function renderMap() {
  return mapData
    .map((row, y) => {
      return row
        .map((tile, x) => {
          const isPlayer = player.x === x && player.y === y;
          const type = getTileType(tile);

          return `
            <div class="tile ${type} ${isPlayer ? "player" : ""}">
              ${isPlayer ? "🙂" : tile}
            </div>
          `;
        })
        .join("");
    })
    .join("");
}

function getTileType(tile) {
  if (tile === "🌳") return "wall";
  if (tile === "🚪") return "gate";
  return "";
}

function statusHtml() {
  return `
    <div class="status">
      <div class="status-row"><span>名前</span><strong>${player.name}</strong></div>
      <div class="status-row"><span>Lv</span><strong>${player.level}</strong></div>
      <div class="status-row"><span>HP</span><strong>${player.hp} / ${player.maxHp}</strong></div>
      <div class="status-row"><span>EXP</span><strong>${player.exp}</strong></div>
      <div class="status-row"><span>スキル</span><strong>${player.skills.join("、")}</strong></div>
    </div>
  `;
}

function movePlayer(dir) {
  let nextX = player.x;
  let nextY = player.y;

  if (dir === "up") nextY--;
  if (dir === "down") nextY++;
  if (dir === "left") nextX--;
  if (dir === "right") nextX++;

  const nextTile = mapData[nextY]?.[nextX];

  if (!nextTile || nextTile === "🌳") {
    showMap("木が邪魔で進めない。森、地味に強い。");
    return;
  }

  player.x = nextX;
  player.y = nextY;

  if (nextTile === "🐱") {
    showMap("ナビにゃん「役がない？いいじゃん。自由ってことだろ」");
    return;
  }

  if (nextTile === "👾") {
    randomEncounter();
    return;
  }

  if (nextTile === "🚪") {
    startBoss();
    return;
  }

  const random = Math.random();

  if (random < 0.16) {
    randomEncounter();
    return;
  }

  showMap("草を踏みしめて進んだ。ちょっと冒険者っぽい。");
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
    <section class="game-shell">
      <div class="game-header">
        <h1 class="game-title">BATTLE</h1>
        <p class="game-subtitle">戦え。主役の座は勝手に取りに行け。</p>
      </div>

      <div class="game-body">
        <section class="map-panel battle-card">
          <div class="enemy-box">${currentEnemy.icon}</div>
          <p class="enemy-name">${currentEnemy.name}</p>
          <p>敵HP：${currentEnemy.hp}</p>
        </section>

        <aside class="side-panel">
          <h2>コマンド</h2>
          ${statusHtml()}

          <div class="menu">
            <button data-action="attack">たたかう</button>
            <button data-action="skill">ツッコミ</button>
            <button data-action="run">にげる</button>
          </div>
        </aside>
      </div>

      <div class="log-panel">${log}</div>
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

  if (currentEnemy.name === "門番ゴーレム" && currentEnemy.hp < 35) {
    damage = 30;
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
    player.x = 1;
    player.y = 5;
    saveGame();
    showMap(`${beforeText}<br><br>${currentEnemy.name} の攻撃！ ${damage}ダメージ！<br>倒れかけたので草原の入口まで戻された。`);
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
      <section class="game-shell">
        <div class="game-header">
          <h1 class="game-title">CLEAR</h1>
          <p class="game-subtitle">体験版クリア</p>
        </div>

        <div class="game-body">
          <section class="map-panel battle-card">
            <div class="enemy-box">🏆</div>
            <h2>門の先へ</h2>
            <p>ナビにゃん「お前、役なしじゃないな。まだ名前のない主役だ」</p>
          </section>

          <aside class="side-panel">
            <h2>続きについて</h2>
            <p>ここから先はログインすると進めます。</p>

            <div class="menu">
              <a class="button" href="/login.html">ログインする</a>
              <button data-action="start">草原に戻る</button>
            </div>
          </aside>
        </div>

        <div class="log-panel">
          第1ステージをクリアした。物語はまだ始まったばかりだ。
        </div>
      </section>
    `;
    return;
  }

  saveGame();
  showMap(log);
}

function rest() {
  player.hp = player.maxHp;
  saveGame();
  showMap("草むらで少し休んだ。HPが全回復した。");
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
