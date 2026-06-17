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
    text: "放課後の研究室。\n普通なら静かなはずの部屋から、なぜか怪しい音がしていた。"
  },
  {
    speaker: "サラ",
    focus: "sara",
    text: "……帰りたい。"
  },
  {
    speaker: "サク",
    focus: "saku",
    text: "待ちたまえサラ！\n今まさに歴史的な実験が始まるところだ！"
  },
  {
    speaker: "サラ",
    focus: "sara",
    text: "その言い方で安全だったこと、一回もない。"
  },
  {
    speaker: "サク",
    focus: "saku",
    text: "今回は違う。\n今日の研究テーマは、怪人化エネルギーの安定化だ。"
  },
  {
    speaker: "サラ",
    focus: "sara",
    text: "もう単語が全部いや。"
  },
  {
    speaker: "ナレーション",
    focus: "",
    text: "机の上には、紫色に光る謎のサンプルが置かれていた。"
  },
  {
    choice: true,
    text: "サラはサンプルをじっと見た。どうする？",
    options: [
      {
        text: "距離を取って観察する",
        research: 1,
        anxiety: 0,
        nextSpeaker: "サラ",
        nextFocus: "sara",
        next: "まず離れる。話はそれから。"
      },
      {
        text: "サクに任せる",
        research: 2,
        anxiety: 2,
        nextSpeaker: "サク",
        nextFocus: "saku",
        next: "ふふふ、任された！\nこの天才に不可能はない！"
      },
      {
        text: "実験を中止させる",
        research: 0,
        anxiety: -1,
        nextSpeaker: "サラ",
        nextFocus: "sara",
        next: "今日は帰る。命があるうちに。"
      }
    ]
  },
  {
    speaker: "サク",
    focus: "saku",
    text: "サンプルは微弱な反応を示している。\nおそらく、感情に反応するタイプだ。"
  },
  {
    speaker: "サラ",
    focus: "sara",
    text: "感情に反応する謎物質を学校に持ってこないで。"
  },
  {
    speaker: "サク",
    focus: "saku",
    text: "安心したまえ。\n危険度は、私の計算では約40パーセントだ。"
  },
  {
    speaker: "サラ",
    focus: "sara",
    text: "高い。普通に高い。"
  },
  {
    choice: true,
    text: "サンプルが急に光り始めた。",
    options: [
      {
        text: "安全装置を探す",
        research: 1,
        anxiety: 0,
        nextSpeaker: "サラ",
        nextFocus: "sara",
        next: "止める方法、止める方法……！\nなんでラベルが全部サク語なの。"
      },
      {
        text: "データを取る",
        research: 3,
        anxiety: 2,
        nextSpeaker: "サク",
        nextFocus: "saku",
        next: "素晴らしい反応だ！\nサラ、今の波形を見たか！？"
      },
      {
        text: "サクの白衣をつかんで下がる",
        research: 1,
        anxiety: -1,
        nextSpeaker: "サラ",
        nextFocus: "sara",
        next: "危ないから下がって。\n……あんたが一番危ないんだから。"
      }
    ]
  },
  {
    speaker: "サク",
    focus: "saku",
    text: "サラ。今、私を心配したのかい？"
  },
  {
    speaker: "サラ",
    focus: "sara",
    text: "してない。研究室が爆発したら困るだけ。"
  },
  {
    speaker: "サク",
    focus: "saku",
    text: "なるほど。\nつまり、私が無事でなければ研究室も困る。"
  },
  {
    speaker: "サラ",
    focus: "sara",
    text: "都合よく変換しないで。"
  },
  {
    speaker: "ナレーション",
    focus: "",
    text: "サンプルはさらに強く光り、机の上で小さく跳ね始めた。"
  },
  {
    choice: true,
    text: "実験は明らかに危ない方向へ進んでいる。",
    options: [
      {
        text: "冷静に手順書を読む",
        research: 2,
        anxiety: 0,
        nextSpeaker: "サラ",
        nextFocus: "sara",
        next: "えっと……『光ったら褒める』？\nなにこの手順書。"
      },
      {
        text: "サンプルを褒める",
        research: 2,
        anxiety: 1,
        nextSpeaker: "サク",
        nextFocus: "saku",
        next: "いいぞ、サンプル！\nその発光、実に美しい！"
      },
      {
        text: "水をかける",
        research: -1,
        anxiety: 3,
        nextSpeaker: "サラ",
        nextFocus: "sara",
        next: "もう水！\nこういうのはだいたい水で……あ、だめそう。"
      }
    ]
  },
  {
    speaker: "ナレーション",
    focus: "",
    text: "サンプルはぷるぷる震えたあと、ふわっと宙に浮いた。"
  },
  {
    speaker: "サク",
    focus: "saku",
    text: "成功だ！\n生命反応に近いエネルギーが発生している！"
  },
  {
    speaker: "サラ",
    focus: "sara",
    text: "成功の定義、怖すぎ。"
  },
  {
    choice: true,
    text: "最後の調整をする必要があるらしい。",
    options: [
      {
        text: "サクと一緒に調整する",
        research: 3,
        anxiety: 0,
        nextSpeaker: "サラ",
        nextFocus: "sara",
        next: "……一人でやらせるよりは、見てた方がマシ。"
      },
      {
        text: "サクに任せて見守る",
        research: 2,
        anxiety: 2,
        nextSpeaker: "サク",
        nextFocus: "saku",
        next: "任せたまえ！\n天才の手元をよく見ておくといい！"
      },
      {
        text: "ブレーカーを落とす",
        research: -1,
        anxiety: -2,
        nextSpeaker: "サラ",
        nextFocus: "sara",
        next: "はい終了。\n今日の研究は閉店です。"
      }
    ]
  },
  {
    speaker: "ナレーション",
    focus: "",
    text: "サンプルは最後に強く光り、研究室を白く染めた。"
  }
];

let sceneIndex = 0;
let research = 0;
let anxiety = 0;
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

const researchPoint = document.getElementById("researchPoint");
const anxietyPoint = document.getElementById("anxietyPoint");

const characters = {
  sara: document.getElementById("saraImg"),
  saku: document.getElementById("sakuImg")
};

function showScreen(screen) {
  document.querySelectorAll(".screen").forEach((item) => {
    item.classList.remove("active");
  });

  screen.classList.add("active");
}

function updateStatus() {
  researchPoint.textContent = `研究度 ${research}`;
  anxietyPoint.textContent = `不安度 ${anxiety}`;
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

        research += option.research;
        anxiety += option.anxiety;
        updateStatus();

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

  if (research >= 8 && anxiety <= 5) {
    speakerName.textContent = "GOOD END";
    setText(
      "実験は、奇跡的に成功した。\n\nサンプルは小さな光の粒になり、研究ノートの上で静かに消えた。\n\nサクは満足そうに笑い、サラは深いため息をつく。\n\n『……次は、もっと安全な研究にして』\n\nサクはうなずいた。\nたぶん、半分くらいは聞いている。"
    );
  } else if (anxiety >= 7) {
    speakerName.textContent = "CHAOS END";
    setText(
      "次の瞬間、研究室に謎の煙が広がった。\n\nサンプルは小さな怪人のような姿になり、机の上を走り回る。\n\nサラは無言でサクを見た。\nサクは親指を立てた。\n\n『成功だ！』\n\n『失敗だよ』"
    );
  } else if (research <= 3) {
    speakerName.textContent = "SARAH END";
    setText(
      "サラは静かにブレーカーを落とした。\n\n研究室は暗くなり、サンプルの光も消える。\n\nサクは残念そうだったが、サラは少しだけ安心した。\n\n今日はもう帰る。\n命があるうちに。"
    );
  } else {
    speakerName.textContent = "PARTNER END";
    setText(
      "実験は成功とも失敗とも言えない結果に終わった。\n\nけれどサラとサクは、最後まで一緒にサンプルを見届けた。\n\nサラは相変わらず不安そうで、サクは相変わらず楽しそう。\n\nでも、ふたりで書いた研究ノートのページは、少しだけ特別だった。"
    );
  }

  nextBtn.textContent = "タイトルへ";
}

function startGame() {
  sceneIndex = 0;
  research = 0;
  anxiety = 0;
  endingMode = false;
  nextBtn.textContent = "次へ";
  updateStatus();
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
