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

const story = [
  {
    speaker: "ナレーション",
    focus: "",
    text: "夜のカフェ。\n月が見える窓際の席に、三人は集まっていた。"
  },
  {
    speaker: "モッチ",
    focus: "mocchi",
    text: "こんばんは。モッチです。月です。"
  },
  {
    speaker: "コーヒー",
    focus: "coffee",
    text: "自己紹介の二文目がもう防御姿勢なんだよな。"
  },
  {
    speaker: "タピオカミルクティー",
    focus: "tapioca",
    text: "でも大事だよ！\n前にお客さんが言ってたもん。"
  },
  {
    speaker: "タピオカミルクティー",
    focus: "tapioca",
    text: "『あの、そら豆みたいな子かわいいですね』って。"
  },
  {
    speaker: "モッチ",
    focus: "mocchi",
    text: "そら豆じゃないよ！？\n空にいるけど、そら豆じゃないよ！？"
  },

  {
    choice: true,
    text: "モッチがぷるぷる震えている。どうする？",
    options: [
      {
        text: "全力で『月です』とフォローする",
        point: 2,
        nextSpeaker: "あなた",
        nextFocus: "mocchi",
        next: "モッチは月です！\n夜空担当です！\n豆売り場担当ではありません！"
      },
      {
        text: "そら豆もかわいいよねと言う",
        point: -1,
        nextSpeaker: "あなた",
        nextFocus: "mocchi",
        next: "そら豆もかわいいし……悪くないんじゃない？"
      },
      {
        text: "いっそ『月豆』として売り出す",
        point: 3,
        nextSpeaker: "あなた",
        nextFocus: "coffee",
        next: "新商品名、月豆モッチ。\n夜空から産地直送。"
      }
    ]
  },

  {
    speaker: "コーヒー",
    focus: "coffee",
    text: "待て。\n最後のやつ、若干売れそうなのが腹立つ。"
  },
  {
    speaker: "モッチ",
    focus: "mocchi",
    text: "売らないで！？\n僕は商品棚じゃなくて夜空に並びたい！"
  },
  {
    speaker: "タピオカミルクティー",
    focus: "tapioca",
    text: "でも、モッチって名前もちもちしてそうだよね。"
  },
  {
    speaker: "モッチ",
    focus: "mocchi",
    text: "そこは合ってるけど！\nもちもちの月だけど！"
  },
  {
    speaker: "コーヒー",
    focus: "coffee",
    text: "月なのか餅なのか豆なのか、ジャンルが渋滞してる。"
  },
  {
    speaker: "タピオカミルクティー",
    focus: "tapioca",
    text: "私はタピオカミルクティー！\nタピオカは入ってるし、ミルクティーでもあるよ！"
  },
  {
    speaker: "コーヒー",
    focus: "coffee",
    text: "私はコーヒー。\n説明が一番短い。勝ち。"
  },
  {
    speaker: "モッチ",
    focus: "mocchi",
    text: "いいなあ……名前と見た目が一致してて……。"
  },

  {
    choice: true,
    text: "ここでコーヒーが、なぜかメモ帳を取り出した。",
    options: [
      {
        text: "モッチの正式プロフィールを作る",
        point: 2,
        nextSpeaker: "コーヒー",
        nextFocus: "coffee",
        next: "名前：モッチ。\n種族：月。\n注意：そら豆ではない。\n特技：間違えられる。"
      },
      {
        text: "そら豆疑惑を検証する",
        point: -1,
        nextSpeaker: "コーヒー",
        nextFocus: "coffee",
        next: "まず形状。\n曲線。黄色い。かわいい。\n……そら豆では？"
      },
      {
        text: "『そら豆禁止』の看板を作る",
        point: 3,
        nextSpeaker: "タピオカミルクティー",
        nextFocus: "tapioca",
        next: "カフェ入口に貼ろう！\n『当店の月を豆扱いしないでください』って！"
      }
    ]
  },

  {
    speaker: "モッチ",
    focus: "mocchi",
    text: "看板の圧が強い！\nでもちょっと助かる！"
  },
  {
    speaker: "タピオカミルクティー",
    focus: "tapioca",
    text: "じゃあ私も書く！\n『タピオカは黒い真珠です』"
  },
  {
    speaker: "コーヒー",
    focus: "coffee",
    text: "じゃあ私は？"
  },
  {
    speaker: "モッチ",
    focus: "mocchi",
    text: "『苦い大人』？"
  },
  {
    speaker: "コーヒー",
    focus: "coffee",
    text: "急に渋いキャッチコピーつけるな。"
  },
  {
    speaker: "タピオカミルクティー",
    focus: "tapioca",
    text: "でもコーヒーさん、ちょっと大人っぽいよね。"
  },
  {
    speaker: "コーヒー",
    focus: "coffee",
    text: "ふっ。\nまあ、深みがあるからな。"
  },
  {
    speaker: "モッチ",
    focus: "mocchi",
    text: "僕にも深みあるよ。\n夜空のロマンとか。"
  },
  {
    speaker: "コーヒー",
    focus: "coffee",
    text: "でも第一印象そら豆。"
  },
  {
    speaker: "モッチ",
    focus: "mocchi",
    text: "戻さないで！？"
  },

  {
    choice: true,
    text: "タピオカミルクティーが何かを思いついた顔をしている。",
    options: [
      {
        text: "嫌な予感がするから止める",
        point: 2,
        nextSpeaker: "あなた",
        nextFocus: "tapioca",
        next: "その顔はだいたい事件の始まりだから、一回深呼吸しよう。"
      },
      {
        text: "面白そうだから続けさせる",
        point: 3,
        nextSpeaker: "あなた",
        nextFocus: "tapioca",
        next: "よし、やろう。\nカフェは多少荒れた方が記憶に残る。"
      },
      {
        text: "コーヒーに責任者を任せる",
        point: 1,
        nextSpeaker: "あなた",
        nextFocus: "coffee",
        next: "コーヒー、止め役よろしく。"
      }
    ]
  },

  {
    speaker: "タピオカミルクティー",
    focus: "tapioca",
    text: "じゃーん！\n新メニュー考えました！"
  },
  {
    speaker: "モッチ",
    focus: "mocchi",
    text: "新メニュー？"
  },
  {
    speaker: "タピオカミルクティー",
    focus: "tapioca",
    text: "『月夜のそら豆ラテ』！"
  },
  {
    speaker: "モッチ",
    focus: "mocchi",
    text: "僕を混ぜないでええええ！！"
  },
  {
    speaker: "コーヒー",
    focus: "coffee",
    text: "商品名としては妙に完成度が高いのがまた嫌だな。"
  },
  {
    speaker: "タピオカミルクティー",
    focus: "tapioca",
    text: "じゃあ『モッチの月見ミルクティー』は？"
  },
  {
    speaker: "モッチ",
    focus: "mocchi",
    text: "それならちょっとかわいい。"
  },
  {
    speaker: "コーヒー",
    focus: "coffee",
    text: "ちょろいな、月。"
  },
  {
    speaker: "モッチ",
    focus: "mocchi",
    text: "月って呼ばれると安心する……。"
  },
  {
    speaker: "ナレーション",
    focus: "",
    text: "こうしてカフェには、新しい注意書きが増えた。"
  },
  {
    speaker: "ナレーション",
    focus: "",
    text: "『モッチは月です。そら豆ではありません。たぶん食べられません。』"
  },
  {
    speaker: "モッチ",
    focus: "mocchi",
    text: "たぶんって何！？"
  }
];

let sceneIndex = 0;
let gagPoint = 0;
let isTyping = false;
let typeTimer = null;
let fullText = "";
let endingMode = false;

const titleScreen = document.getElementById("titleScreen");
const novelScreen = document.getElementById("novelScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const nextBtn = document.getElementById("nextBtn");

const speakerName = document.getElementById("speakerName");
const messageText = document.getElementById("messageText");
const choices = document.getElementById("choices");
const gagPointText = document.getElementById("gagPoint");

const characters = {
  mocchi: document.getElementById("mocchiImg"),
  coffee: document.getElementById("coffeeImg"),
  tapioca: document.getElementById("tapiocaImg")
};

function showScreen(screen) {
  document.querySelectorAll(".screen").forEach((item) => {
    item.classList.remove("active");
  });

  screen.classList.add("active");
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
  }, 28);
}

function finishTyping() {
  clearInterval(typeTimer);
  messageText.textContent = fullText;
  isTyping = false;
}

function updateGagPoint() {
  gagPointText.textContent = `ツッコミ度 ${gagPoint}`;
}

function focusCharacter(focus) {
  Object.entries(characters).forEach(([key, img]) => {
    img.classList.remove("speaking", "dim");

    if (!focus) return;

    if (key === focus) {
      img.classList.add("speaking");
    } else {
      img.classList.add("dim");
    }
  });
}

function renderScene() {
  const scene = story[sceneIndex];

  choices.innerHTML = "";
  nextBtn.style.display = "inline-flex";

  if (!scene) {
    renderEnding();
    return;
  }

  if (scene.choice) {
    speakerName.textContent = "選択肢";
    focusCharacter("");
    setText(scene.text);
    nextBtn.style.display = "none";

    scene.options.forEach((option) => {
      const button = document.createElement("button");
      button.className = "choice-btn";
      button.type = "button";
      button.textContent = option.text;

      button.addEventListener("click", () => {
        if (isTyping) {
          finishTyping();
          return;
        }

        gagPoint += option.point;
        updateGagPoint();

        speakerName.textContent = option.nextSpeaker;
        focusCharacter(option.nextFocus);
        setText(option.next);

        choices.innerHTML = "";
        nextBtn.style.display = "inline-flex";
        sceneIndex++;
      });

      choices.appendChild(button);
    });

    return;
  }

  speakerName.textContent = scene.speaker;
  focusCharacter(scene.focus);
  setText(scene.text);
}

function renderEnding() {
  endingMode = true;
  choices.innerHTML = "";
  focusCharacter("");

  if (gagPoint >= 8) {
    speakerName.textContent = "ツッコミEND";
    setText(
      "三人の会話は最後まで勢いだけで走り抜けた。\n\nモッチはそら豆ではない。\nタピオカは黒い真珠。\nコーヒーは苦い大人。\n\nそしてあなたは、このカフェで一番まともなツッコミ役になった。"
    );
  } else if (gagPoint >= 4) {
    speakerName.textContent = "ほのぼのEND";
    setText(
      "なんだかんだで、三人は仲良く夜のカフェで過ごした。\n\nモッチがそら豆に間違えられる日は、まだ終わらない。\nでも、ちゃんと月だと分かってくれる友達もいる。"
    );
  } else {
    speakerName.textContent = "そら豆END";
    setText(
      "翌日、カフェの新メニューにこう書かれていた。\n\n『そら豆みたいな月のおすすめセット』\n\nモッチは泣いた。\nでもちょっと売れた。"
    );
  }

  nextBtn.textContent = "タイトルへ";
}

function startGame() {
  sceneIndex = 0;
  gagPoint = 0;
  endingMode = false;
  nextBtn.textContent = "次へ";
  updateGagPoint();
  showScreen(novelScreen);
  renderScene();
}

function nextScene() {
  if (isTyping) {
    finishTyping();
    return;
  }

  if (endingMode) {
    showScreen(titleScreen);
    return;
  }

  sceneIndex++;
  renderScene();
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
nextBtn.addEventListener("click", nextScene);
