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
    text: "サイボーグ学校。\nそこは、人間と機械の境界に立つ生徒たちが通う、少し変わった学校。"
  },
  {
    speaker: "ナレーション",
    text: "その中でもトップクラスの成績を持つ少女がいた。"
  },
  {
    speaker: "ナレーション",
    text: "名前は、サキ。\n無口で、表情を表に出さない少女。"
  },
  {
    speaker: "サキ",
    text: "……任務確認。放課後の校内巡回。異常があれば報告。"
  },
  {
    speaker: "ナレーション",
    text: "今日のサキは、放課後の校内を見回る任務を任されていた。"
  },
  {
    speaker: "サキ",
    text: "問題なし。廊下、静か。教室、無人。窓、施錠済み。"
  },
  {
    speaker: "ナレーション",
    text: "その時、誰もいないはずの教室から、小さな物音がした。"
  },
  {
    choice: true,
    text: "サキは教室の前で足を止めた。どうする？",
    options: [
      {
        text: "静かに中を確認する",
        cool: 2,
        trust: 1,
        nextSpeaker: "サキ",
        next: "……確認する。大きな音は立てない。"
      },
      {
        text: "すぐ先生に報告する",
        cool: 1,
        trust: 2,
        nextSpeaker: "サキ",
        next: "単独判断は危険。報告を優先する。"
      },
      {
        text: "堂々と扉を開ける",
        cool: -1,
        trust: 0,
        nextSpeaker: "サキ",
        next: "……正面突破。効率はいい。たぶん。"
      }
    ]
  },
  {
    speaker: "ナレーション",
    text: "教室の中にいたのは、不審者ではなかった。"
  },
  {
    speaker: "ナレーション",
    text: "机の下で震えている、迷子の小さな整備ロボだった。"
  },
  {
    speaker: "サキ",
    text: "対象確認。小型ロボット。損傷あり。敵意なし。"
  },
  {
    speaker: "整備ロボ",
    text: "ピ……ピピ……。"
  },
  {
    speaker: "サキ",
    text: "……怖がっている？"
  },
  {
    choice: true,
    text: "整備ロボはサキを見て、さらに机の奥へ隠れてしまった。",
    options: [
      {
        text: "武器をしまって、目線を合わせる",
        cool: 2,
        trust: 3,
        nextSpeaker: "サキ",
        next: "……怖がらせた。接近方法を変更する。"
      },
      {
        text: "命令口調で出てくるように言う",
        cool: 1,
        trust: -1,
        nextSpeaker: "サキ",
        next: "出てきて。危害は加えない。……たぶん伝わっていない。"
      },
      {
        text: "何も言わず、少し離れて待つ",
        cool: 3,
        trust: 2,
        nextSpeaker: "サキ",
        next: "距離を取る。対象が落ち着くまで待機。"
      }
    ]
  },
  {
    speaker: "ナレーション",
    text: "しばらくすると、整備ロボは少しだけ机の下から顔を出した。"
  },
  {
    speaker: "サキ",
    text: "大丈夫。私は、敵ではない。"
  },
  {
    speaker: "ナレーション",
    text: "サキの声は平坦だった。\nでも、その場にいる誰よりも慎重だった。"
  },
  {
    speaker: "整備ロボ",
    text: "ピ……。"
  },
  {
    speaker: "サキ",
    text: "……ついてくる？"
  },
  {
    speaker: "ナレーション",
    text: "整備ロボは、サキの足元までゆっくり近づいてきた。"
  },
  {
    choice: true,
    text: "整備ロボを保健整備室まで連れていくことになった。",
    options: [
      {
        text: "安全なルートを選んで遠回りする",
        cool: 3,
        trust: 2,
        nextSpeaker: "サキ",
        next: "遠回りでも安全を優先する。任務成功率が上がる。"
      },
      {
        text: "近道を使って早く向かう",
        cool: 1,
        trust: 0,
        nextSpeaker: "サキ",
        next: "最短ルートを選択。……対象が転ばないよう注意する。"
      },
      {
        text: "整備ロボの歩幅に合わせる",
        cool: 2,
        trust: 3,
        nextSpeaker: "サキ",
        next: "速度を落とす。対象の不安を減らす。"
      }
    ]
  },
  {
    speaker: "ナレーション",
    text: "廊下の夕日が、サキの紫色の制服を照らしていた。"
  },
  {
    speaker: "サキ",
    text: "任務は、対象を運ぶだけではない。"
  },
  {
    speaker: "サキ",
    text: "対象が安心して到着すること。それも、任務。"
  },
  {
    speaker: "ナレーション",
    text: "その言葉は、誰に教わったものでもなかった。"
  },
  {
    speaker: "ナレーション",
    text: "サキ自身が、放課後の静けさの中で見つけた答えだった。"
  },
  {
    choice: true,
    text: "整備室の前。整備ロボはサキの袖を小さく引いた。",
    options: [
      {
        text: "また困ったら呼んで、と伝える",
        cool: 1,
        trust: 3,
        nextSpeaker: "サキ",
        next: "……また困ったら呼んで。聞こえたら、行く。"
      },
      {
        text: "任務完了、とだけ言う",
        cool: 2,
        trust: 0,
        nextSpeaker: "サキ",
        next: "任務完了。……以上。"
      },
      {
        text: "小さく手を振る",
        cool: 1,
        trust: 2,
        nextSpeaker: "サキ",
        next: "……こういう時は、手を振る。たぶん。"
      }
    ]
  },
  {
    speaker: "ナレーション",
    text: "整備ロボは、嬉しそうに電子音を鳴らした。"
  },
  {
    speaker: "サキ",
    text: "……表情は、よく分からない。"
  },
  {
    speaker: "サキ",
    text: "でも、嬉しい音は分かる。"
  },
  {
    speaker: "ナレーション",
    text: "サキは少しだけ目を伏せた。\nそれは笑顔ではなかったけれど、どこか柔らかかった。"
  }
];

let sceneIndex = 0;
let cool = 0;
let trust = 0;
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

const coolPoint = document.getElementById("coolPoint");
const trustPoint = document.getElementById("trustPoint");
const sakiImg = document.getElementById("sakiImg");

function showScreen(screen) {
  document.querySelectorAll(".screen").forEach((item) => {
    item.classList.remove("active");
  });

  screen.classList.add("active");
}

function updateStatus() {
  coolPoint.textContent = `冷静度 ${cool}`;
  trustPoint.textContent = `信頼度 ${trust}`;
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

function renderScene() {
  const scene = story[sceneIndex];

  choices.innerHTML = "";
  nextBtn.style.display = "inline-flex";
  sakiImg.classList.add("active");

  if (!scene) {
    renderEnding();
    return;
  }

  if (scene.choice) {
    speakerName.textContent = "選択肢";
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

        cool += option.cool;
        trust += option.trust;
        updateStatus();

        speakerName.textContent = option.nextSpeaker;
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
  setText(scene.text);
}

function renderEnding() {
  endingMode = true;
  choices.innerHTML = "";

  if (trust >= 9) {
    speakerName.textContent = "TRUST END";
    setText(
      "整備ロボは、サキの姿を見つけると嬉しそうに音を鳴らすようになった。\n\nサキは相変わらず無口で、表情もほとんど変わらない。\nでも、放課後の巡回ルートには、いつの間にか整備室前が追加されていた。\n\n任務ではない。\nたぶん、会いに行っている。"
    );
  } else if (cool >= 8) {
    speakerName.textContent = "COOL END";
    setText(
      "サキは任務を完璧に終えた。\n記録、報告、状況判断。すべて問題なし。\n\nけれど報告書の最後に、いつもなら書かない一文が追加されていた。\n\n『対象は安心していた。よかった。』"
    );
  } else {
    speakerName.textContent = "NORMAL END";
    setText(
      "任務は無事に終わった。\nサキはいつも通り、静かに廊下を歩いていく。\n\n表情は変わらない。\nでも、夕日の中で少しだけ足取りが軽かった。"
    );
  }

  nextBtn.textContent = "タイトルへ";
}

function startGame() {
  sceneIndex = 0;
  cool = 0;
  trust = 0;
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