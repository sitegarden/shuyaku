const app = document.getElementById("app");

const SAVE_KEY = "shuyakuQuestGuestSave";

const stageStories = {
  1: [
    {
      speaker: "???",
      text: "この世界では、誰もが何かの「役」を持って生きている。"
    },
    {
      speaker: "村人",
      text: "勇者は北へ。魔法使いは塔へ。商人は市場へ。"
    },
    {
      speaker: "村人",
      text: "君？ 君は……えっと、誰だっけ。"
    },
    {
      speaker: "主人公",
      text: "知らねぇよ。俺だってまだ決まってない。"
    },
    {
      speaker: "ナビにゃん",
      text: "役がない？いいじゃん。逆に自由ってことだろ。"
    },
    {
      speaker: "主人公",
      text: "選ばれるのを待つくらいなら、こっちから主役になってやる。"
    },
    {
      speaker: "SYSTEM",
      text: "第1ステージ：モブ草原"
    }
  ]
};

let storyIndex = 0;


/*
  タイル説明

  G = 草原
  R = 道
  W = 森・壁
  E = 敵
  N = NPC
  A = 門
*/

const mapData = [
  ["W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W"],
  ["W", "G", "G", "R", "R", "R", "G", "E", "R", "A", "W"],
  ["W", "G", "W", "R", "W", "R", "W", "G", "W", "R", "W"],
  ["W", "N", "R", "R", "G", "R", "G", "G", "W", "R", "W"],
  ["W", "G", "W", "G", "W", "R", "W", "E", "W", "R", "W"],
  ["W", "R", "R", "E", "R", "R", "G", "G", "G", "R", "W"],
  ["W", "R", "W", "G", "W", "G", "W", "G", "W", "G", "W"],
  ["W", "R", "G", "G", "G", "G", "R", "R", "R", "G", "W"],
  ["W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W"]
];

const enemies = [
  {
    name: "スライム・モブ",
    hp: 18,
    attack: 5,
    exp: 8,
    type: "normal",
    message: "ぷるぷる……モブでも生きてる。"
  },
  {
    name: "ため息コウモリ",
    hp: 24,
    attack: 7,
    exp: 12,
    type: "normal",
    message: "はぁ……やる気あるの？"
  },
  {
    name: "決めつけキノコ",
    hp: 28,
    attack: 8,
    exp: 16,
    type: "normal",
    message: "君、主人公タイプじゃないよね。"
  }
];

const boss = {
  name: "門番ゴーレム",
  hp: 60,
  attack: 11,
  exp: 50,
  type: "boss",
  message: "役なしは、この先へ進めない。"
};

let player = loadSave() || {
  name: "名無しの主役",
  level: 1,
  exp: 0,
  hp: 40,
  maxHp: 40,
  sp: 12,
  maxSp: 12,
  x: 1,
  y: 7,
  clearedTrial: false,
  seenStories: [],
  restUsed: false,
  skills: ["ツッコミ"]
};

player.seenStories ??= [];
player.sp ??= 12;
player.maxSp ??= 12;
player.restUsed ??= false;

let currentEnemy = null;
let lastLog = "モブ草原に来た。ここから、役なしの物語が始まる。";

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("click", (e) => {
  const action = e.target.dataset.action;

  if (action === "start") startGame();
  if (action === "story") startStageStory(1);
  if (action === "nextStory") nextStory();
  if (action === "skipStory") skipStory();

  if (action === "rest") rest();
  if (action === "attack") playerAttack();
  if (action === "skill") useSkill();
  if (action === "run") showMap("逃げた。まあ戦略的撤退ってやつ。");
  if (action === "reset") resetSave();

  const tile = e.target.closest("[data-tile-x]");
  if (tile) {
    const x = Number(tile.dataset.tileX);
    const y = Number(tile.dataset.tileY);
    handleTileTap(x, y);
  }
});

function startGame() {
  if (!player.seenStories.includes(1)) {
    startStageStory(1);
    return;
  }

  showMap();
}

function startStageStory(stageNumber) {
  storyIndex = 0;
  showStory(stageNumber);
}

function showStory(stageNumber) {
  const story = stageStories[stageNumber];
  const scene = story[storyIndex];

  app.innerHTML = `
    <section class="story-screen">
      <div class="story-bg">
        <div class="story-card">
          <div class="story-label">STORY</div>
          <h1>SHUYAKU QUEST</h1>

          <div class="story-box">
            <p class="story-speaker">${scene.speaker}</p>
            <p class="story-text">${scene.text}</p>
          </div>

          <div class="story-progress">
            ${storyIndex + 1} / ${story.length}
          </div>

          <div class="story-menu">
            <button data-action="skipStory">スキップ</button>
            <button data-action="nextStory">
              ${storyIndex >= story.length - 1 ? "冒険へ" : "次へ"}
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function nextStory() {
  const stageNumber = 1;
  const story = stageStories[stageNumber];

  storyIndex++;

  if (storyIndex >= story.length) {
    finishStory(stageNumber);
    return;
  }

  showStory(stageNumber);
}

function skipStory() {
  finishStory(1);
}

function finishStory(stageNumber) {
  if (!player.seenStories.includes(stageNumber)) {
    player.seenStories.push(stageNumber);
  }

  saveGame();
  showMap("第1ステージ：モブ草原。役なしの物語が、ここから始まる。");
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") movePlayer("up");
  if (e.key === "ArrowDown") movePlayer("down");
  if (e.key === "ArrowLeft") movePlayer("left");
  if (e.key === "ArrowRight") movePlayer("right");
});

document.addEventListener("touchstart", (e) => {
  const map = e.target.closest(".tile-map");
  if (!map) return;

  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener("touchend", (e) => {
  const map = e.target.closest(".tile-map");
  if (!map) return;

  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;

  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;

  const absX = Math.abs(diffX);
  const absY = Math.abs(diffY);

  if (Math.max(absX, absY) < 34) return;

  if (absX > absY) {
    movePlayer(diffX > 0 ? "right" : "left");
  } else {
    movePlayer(diffY > 0 ? "down" : "up");
  }
}, { passive: true });

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
          <div class="enemy-box">
            <div class="clear-symbol"></div>
          </div>
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

          <div class="tile-map" aria-label="モブ草原のマップ">
            ${renderMap()}
          </div>
        </section>

        <aside class="side-panel">
          <h2>ステータス</h2>
          ${statusHtml()}

          <div class="hint-box">
            スマホ：隣のマスをタップ、またはマップ上でスワイプ。<br>
            PC：矢印キーで移動。
          </div>

          <div class="legend">
            <div class="legend-row"><span class="legend-chip grass"></span>草原・道：歩ける</div>
            <div class="legend-row"><span class="legend-chip wall"></span>森：通れない</div>
            <div class="legend-row"><span class="legend-chip enemy"></span>敵：戦闘</div>
            <div class="legend-row"><span class="legend-chip npc"></span>NPC：会話</div>
            <div class="legend-row"><span class="legend-chip gate"></span>門：ボス</div>
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

const app = document.getElementById("app");

const SAVE_KEY = "shuyakuQuestGuestSave";

const stageStories = {
  1: [
    {
      speaker: "???",
      text: "この世界では、誰もが何かの「役」を持って生きている。"
    },
    {
      speaker: "村人",
      text: "勇者は北へ。魔法使いは塔へ。商人は市場へ。"
    },
    {
      speaker: "村人",
      text: "君？ 君は……えっと、誰だっけ。"
    },
    {
      speaker: "主人公",
      text: "知らねぇよ。俺だってまだ決まってない。"
    },
    {
      speaker: "ナビにゃん",
      text: "役がない？いいじゃん。逆に自由ってことだろ。"
    },
    {
      speaker: "主人公",
      text: "選ばれるのを待つくらいなら、こっちから主役になってやる。"
    },
    {
      speaker: "SYSTEM",
      text: "第1ステージ：モブ草原"
    }
  ]
};

let storyIndex = 0;


/*
  タイル説明

  G = 草原
  R = 道
  W = 森・壁
  E = 敵
  N = NPC
  A = 門
*/

const mapData = [
  ["W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W"],
  ["W", "G", "G", "R", "R", "R", "G", "E", "R", "A", "W"],
  ["W", "G", "W", "R", "W", "R", "W", "G", "W", "R", "W"],
  ["W", "N", "R", "R", "G", "R", "G", "G", "W", "R", "W"],
  ["W", "G", "W", "G", "W", "R", "W", "E", "W", "R", "W"],
  ["W", "R", "R", "E", "R", "R", "G", "G", "G", "R", "W"],
  ["W", "R", "W", "G", "W", "G", "W", "G", "W", "G", "W"],
  ["W", "R", "G", "G", "G", "G", "R", "R", "R", "G", "W"],
  ["W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W"]
];

const enemies = [
  {
    name: "スライム・モブ",
    hp: 18,
    attack: 5,
    exp: 8,
    type: "normal",
    message: "ぷるぷる……モブでも生きてる。"
  },
  {
    name: "ため息コウモリ",
    hp: 24,
    attack: 7,
    exp: 12,
    type: "normal",
    message: "はぁ……やる気あるの？"
  },
  {
    name: "決めつけキノコ",
    hp: 28,
    attack: 8,
    exp: 16,
    type: "normal",
    message: "君、主人公タイプじゃないよね。"
  }
];

const boss = {
  name: "門番ゴーレム",
  hp: 60,
  attack: 11,
  exp: 50,
  type: "boss",
  message: "役なしは、この先へ進めない。"
};

let player = loadSave() || {
  name: "名無しの主役",
  level: 1,
  exp: 0,
  hp: 40,
  maxHp: 40,
  sp: 12,
  maxSp: 12,
  x: 1,
  y: 7,
  clearedTrial: false,
  seenStories: [],
  restUsed: false,
  skills: ["ツッコミ"]
};

player.seenStories ??= [];
player.sp ??= 12;
player.maxSp ??= 12;
player.restUsed ??= false;

let currentEnemy = null;
let lastLog = "モブ草原に来た。ここから、役なしの物語が始まる。";

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("click", (e) => {
  const action = e.target.dataset.action;

  if (action === "start") startGame();
  if (action === "story") startStageStory(1);
  if (action === "nextStory") nextStory();
  if (action === "skipStory") skipStory();

  if (action === "rest") rest();
  if (action === "attack") playerAttack();
  if (action === "skill") useSkill();
  if (action === "run") showMap("逃げた。まあ戦略的撤退ってやつ。");
  if (action === "reset") resetSave();

  const tile = e.target.closest("[data-tile-x]");
  if (tile) {
    const x = Number(tile.dataset.tileX);
    const y = Number(tile.dataset.tileY);
    handleTileTap(x, y);
  }
});

function startGame() {
  if (!player.seenStories.includes(1)) {
    startStageStory(1);
    return;
  }

  showMap();
}

function startStageStory(stageNumber) {
  storyIndex = 0;
  showStory(stageNumber);
}

function showStory(stageNumber) {
  const story = stageStories[stageNumber];
  const scene = story[storyIndex];

  app.innerHTML = `
    <section class="story-screen">
      <div class="story-bg">
        <div class="story-card">
          <div class="story-label">STORY</div>
          <h1>SHUYAKU QUEST</h1>

          <div class="story-box">
            <p class="story-speaker">${scene.speaker}</p>
            <p class="story-text">${scene.text}</p>
          </div>

          <div class="story-progress">
            ${storyIndex + 1} / ${story.length}
          </div>

          <div class="story-menu">
            <button data-action="skipStory">スキップ</button>
            <button data-action="nextStory">
              ${storyIndex >= story.length - 1 ? "冒険へ" : "次へ"}
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function nextStory() {
  const stageNumber = 1;
  const story = stageStories[stageNumber];

  storyIndex++;

  if (storyIndex >= story.length) {
    finishStory(stageNumber);
    return;
  }

  showStory(stageNumber);
}

function skipStory() {
  finishStory(1);
}

function finishStory(stageNumber) {
  if (!player.seenStories.includes(stageNumber)) {
    player.seenStories.push(stageNumber);
  }

  saveGame();
  showMap("第1ステージ：モブ草原。役なしの物語が、ここから始まる。");
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") movePlayer("up");
  if (e.key === "ArrowDown") movePlayer("down");
  if (e.key === "ArrowLeft") movePlayer("left");
  if (e.key === "ArrowRight") movePlayer("right");
});

document.addEventListener("touchstart", (e) => {
  const map = e.target.closest(".tile-map");
  if (!map) return;

  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener("touchend", (e) => {
  const map = e.target.closest(".tile-map");
  if (!map) return;

  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;

  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;

  const absX = Math.abs(diffX);
  const absY = Math.abs(diffY);

  if (Math.max(absX, absY) < 34) return;

  if (absX > absY) {
    movePlayer(diffX > 0 ? "right" : "left");
  } else {
    movePlayer(diffY > 0 ? "down" : "up");
  }
}, { passive: true });

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
          <div class="enemy-box">
            <div class="clear-symbol"></div>
          </div>
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

          <div class="tile-map" aria-label="モブ草原のマップ">
            ${renderMap()}
          </div>
        </section>

        <aside class="side-panel">
          <h2>ステータス</h2>
          ${statusHtml()}

          <div class="hint-box">
            スマホ：隣のマスをタップ、またはマップ上でスワイプ。<br>
            PC：矢印キーで移動。
          </div>

          <div class="legend">
            <div class="legend-row"><span class="legend-chip grass"></span>草原・道：歩ける</div>
            <div class="legend-row"><span class="legend-chip wall"></span>森：通れない</div>
            <div class="legend-row"><span class="legend-chip enemy"></span>敵：戦闘</div>
            <div class="legend-row"><span class="legend-chip npc"></span>NPC：会話</div>
            <div class="legend-row"><span class="legend-chip gate"></span>門：ボス</div>
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
          const type = getTileClass(tile);

          return `
            <button
              class="tile ${type}"
              type="button"
              data-tile-x="${x}"
              data-tile-y="${y}"
              aria-label="${getTileName(tile)}"
            >
              ${isPlayer ? `<span class="player-piece"></span>` : ""}
            </button>
          `;
        })
        .join("");
    })
    .join("");
}

function getTileClass(tile) {
  if (tile === "W") return "wall";
  if (tile === "R") return "road";
  if (tile === "E") return "enemy";
  if (tile === "N") return "npc";
  if (tile === "A") return "gate";
  return "grass";
}

function getTileName(tile) {
  if (tile === "W") return "森";
  if (tile === "R") return "道";
  if (tile === "E") return "敵";
  if (tile === "N") return "NPC";
  if (tile === "A") return "門";
  return "草原";
}

function statusHtml() {
  return `
    <div class="status">
      <div class="status-row"><span>名前</span><strong>${player.name}</strong></div>
      <div class="status-row"><span>Lv</span><strong>${player.level}</strong></div>
      <div class="status-row"><span>HP</span><strong>${player.hp} / ${player.maxHp}</strong></div>
      <div class="status-row"><span>SP</span><strong>${player.sp} / ${player.maxSp}</strong></div>
      <div class="status-row"><span>EXP</span><strong>${player.exp}</strong></div>
      <div class="status-row"><span>休憩</span><strong>${player.restUsed ? "使用済み" : "使用可能"}</strong></div>
      <div class="status-row"><span>スキル</span><strong>${player.skills.join("、")}</strong></div>
    </div>
  `;
}

function handleTileTap(x, y) {
  const dx = x - player.x;
  const dy = y - player.y;

  if (Math.abs(dx) + Math.abs(dy) !== 1) {
    showMap("隣のマスをタップすると移動できる。焦るな、主役。");
    return;
  }

  if (dx === 1) movePlayer("right");
  if (dx === -1) movePlayer("left");
  if (dy === 1) movePlayer("down");
  if (dy === -1) movePlayer("up");
}

function movePlayer(dir) {
  let nextX = player.x;
  let nextY = player.y;

  if (dir === "up") nextY--;
  if (dir === "down") nextY++;
  if (dir === "left") nextX--;
  if (dir === "right") nextX++;

  const nextTile = mapData[nextY]?.[nextX];

  if (!nextTile || nextTile === "W") {
    showMap("森が深くて進めない。木、普通に強い。");
    return;
  }

  player.x = nextX;
  player.y = nextY;

  if (nextTile === "N") {
    showMap("ナビにゃん「役がない？いいじゃん。自由ってことだろ」");
    return;
  }

  if (nextTile === "E") {
    randomEncounter();
    return;
  }

  if (nextTile === "A") {
    startBoss();
    return;
  }

  const random = Math.random();

  if (random < 0.12) {
    randomEncounter();
    return;
  }

  if (nextTile === "R") {
    showMap("道を進んだ。足取りがちょっと主役っぽい。");
    return;
  }

  showMap("草原を進んだ。風が少しだけ背中を押している。");
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
          <div class="enemy-box">
            <div class="enemy-symbol ${currentEnemy.type === "boss" ? "boss" : ""}"></div>
          </div>
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
  const isBossFinisher =
    currentEnemy.name === "門番ゴーレム" && currentEnemy.hp < 35;

  const skillName = isBossFinisher ? "主役宣言" : "ツッコミ";
  const spCost = isBossFinisher ? 8 : 4;

  if (player.sp < spCost) {
    showBattle(`SPが足りない！<br>${skillName}にはSPが${spCost}必要だ。`);
    return;
  }

  player.sp -= spCost;

  let damage = Math.floor(Math.random() * 10) + 12;
  let text = `${player.name} はツッコミを放った！<br>「うるせぇ、勝手に決めるな！」<br>SPを${spCost}消費。${damage}ダメージ！`;

  if (isBossFinisher) {
    damage = 30;
    text = `${player.name} は主役宣言を放った！<br>「選ばれてから動くやつが主役なわけねぇだろ」<br>SPを${spCost}消費。${damage}ダメージ！`;
  }

  currentEnemy.hp -= damage;
  saveGame();

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
    player.y = 7;
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
  player.maxSp += 3;
  player.hp = player.maxHp;
  player.sp = player.maxSp;
  log += `<br><br>レベルアップ！ Lv${player.level} になった。HPとSPが上がった。`;
}

  if (currentEnemy.name === "門番ゴーレム") {
    player.clearedTrial = true;
    player.restUsed = false;
    saveGame();

    app.innerHTML = `
      <section class="game-shell">
        <div class="game-header">
          <h1 class="game-title">CLEAR</h1>
          <p class="game-subtitle">体験版クリア</p>
        </div>

        <div class="game-body">
          <section class="map-panel battle-card">
            <div class="enemy-box">
              <div class="clear-symbol"></div>
            </div>
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
  if (player.restUsed) {
    showMap("もうこのステージでは休めない。甘えすぎるな、主役。");
    return;
  }

  player.hp = player.maxHp;
  player.sp = player.maxSp;
  player.restUsed = true;

  saveGame();

  showMap("草原で少し休んだ。HPとSPが全回復した。<br>休憩はこのステージであと使えない。");
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


function renderMap() {
  return mapData
    .map((row, y) => {
      return row
        .map((tile, x) => {
          const isPlayer = player.x === x && player.y === y;
          const type = getTileClass(tile);

          return `
            <button
              class="tile ${type} ${isPlayer ? "has-player" : ""}"
              type="button"
              data-tile-x="${x}"
              data-tile-y="${y}"
              aria-label="${getTileName(tile)}"
            >
              ${isPlayer ? `<span class="player-piece"></span>` : ""}
            </button>
          `;
        })
        .join("");
    })
    .join("");
}

function getTileClass(tile) {
  if (tile === "W") return "wall";
  if (tile === "R") return "road";
  if (tile === "E") return "enemy";
  if (tile === "N") return "npc";
  if (tile === "A") return "gate";
  return "grass";
}

function getTileName(tile) {
  if (tile === "W") return "森";
  if (tile === "R") return "道";
  if (tile === "E") return "敵";
  if (tile === "N") return "NPC";
  if (tile === "A") return "門";
  return "草原";
}

function statusHtml() {
  return `
    <div class="status">
      <div class="status-row"><span>名前</span><strong>${player.name}</strong></div>
      <div class="status-row"><span>Lv</span><strong>${player.level}</strong></div>
      <div class="status-row"><span>HP</span><strong>${player.hp} / ${player.maxHp}</strong></div>
      <div class="status-row"><span>SP</span><strong>${player.sp} / ${player.maxSp}</strong></div>
      <div class="status-row"><span>EXP</span><strong>${player.exp}</strong></div>
      <div class="status-row"><span>休憩</span><strong>${player.restUsed ? "使用済み" : "使用可能"}</strong></div>
      <div class="status-row"><span>スキル</span><strong>${player.skills.join("、")}</strong></div>
    </div>
  `;
}

function handleTileTap(x, y) {
  const dx = x - player.x;
  const dy = y - player.y;

  if (Math.abs(dx) + Math.abs(dy) !== 1) {
    showMap("隣のマスをタップすると移動できる。焦るな、主役。");
    return;
  }

  if (dx === 1) movePlayer("right");
  if (dx === -1) movePlayer("left");
  if (dy === 1) movePlayer("down");
  if (dy === -1) movePlayer("up");
}

function movePlayer(dir) {
  let nextX = player.x;
  let nextY = player.y;

  if (dir === "up") nextY--;
  if (dir === "down") nextY++;
  if (dir === "left") nextX--;
  if (dir === "right") nextX++;

  const nextTile = mapData[nextY]?.[nextX];

  if (!nextTile || nextTile === "W") {
    showMap("森が深くて進めない。木、普通に強い。");
    return;
  }

  player.x = nextX;
  player.y = nextY;

  if (nextTile === "N") {
    showMap("ナビにゃん「役がない？いいじゃん。自由ってことだろ」");
    return;
  }

  if (nextTile === "E") {
    randomEncounter();
    return;
  }

  if (nextTile === "A") {
    startBoss();
    return;
  }

  const random = Math.random();

  if (random < 0.12) {
    randomEncounter();
    return;
  }

  if (nextTile === "R") {
    showMap("道を進んだ。足取りがちょっと主役っぽい。");
    return;
  }

  showMap("草原を進んだ。風が少しだけ背中を押している。");
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
          <div class="enemy-box">
            <div class="enemy-symbol ${currentEnemy.type === "boss" ? "boss" : ""}"></div>
          </div>
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
  const isBossFinisher =
    currentEnemy.name === "門番ゴーレム" && currentEnemy.hp < 35;

  const skillName = isBossFinisher ? "主役宣言" : "ツッコミ";
  const spCost = isBossFinisher ? 8 : 4;

  if (player.sp < spCost) {
    showBattle(`SPが足りない！<br>${skillName}にはSPが${spCost}必要だ。`);
    return;
  }

  player.sp -= spCost;

  let damage = Math.floor(Math.random() * 10) + 12;
  let text = `${player.name} はツッコミを放った！<br>「うるせぇ、勝手に決めるな！」<br>SPを${spCost}消費。${damage}ダメージ！`;

  if (isBossFinisher) {
    damage = 30;
    text = `${player.name} は主役宣言を放った！<br>「選ばれてから動くやつが主役なわけねぇだろ」<br>SPを${spCost}消費。${damage}ダメージ！`;
  }

  currentEnemy.hp -= damage;
  saveGame();

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
    player.y = 7;
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
  player.maxSp += 3;
  player.hp = player.maxHp;
  player.sp = player.maxSp;
  log += `<br><br>レベルアップ！ Lv${player.level} になった。HPとSPが上がった。`;
}

  if (currentEnemy.name === "門番ゴーレム") {
    player.clearedTrial = true;
    player.restUsed = false;
    saveGame();

    app.innerHTML = `
      <section class="game-shell">
        <div class="game-header">
          <h1 class="game-title">CLEAR</h1>
          <p class="game-subtitle">体験版クリア</p>
        </div>

        <div class="game-body">
          <section class="map-panel battle-card">
            <div class="enemy-box">
              <div class="clear-symbol"></div>
            </div>
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
  if (player.restUsed) {
    showMap("もうこのステージでは休めない。甘えすぎるな、主役。");
    return;
  }

  player.hp = player.maxHp;
  player.sp = player.maxSp;
  player.restUsed = true;

  saveGame();

  showMap("草原で少し休んだ。HPとSPが全回復した。<br>休憩はこのステージであと使えない。");
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
