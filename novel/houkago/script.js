const characters = {
  alpha: {
    name: "アルファ",
    img: "./img/alpha.png",
    desc: "明るく強気なムードメーカー。笑顔で距離を詰めてくるタイプ。",
    route: [
      {
        speaker: "アルファ",
        text: "お、来た来た！ 遅いぞー。……まあ、待ってたけどね。"
      },
      {
        speaker: "アルファ",
        text: "今日は一緒に帰る？ それとも、私を置いて帰る勇気ある？"
      },
      {
        choice: true,
        options: [
          {
            text: "一緒に帰ろう",
            point: 2,
            next: "アルファはにっと笑って、少し得意げにあなたの隣へ並んだ。"
          },
          {
            text: "今日は用事がある",
            point: -1,
            next: "アルファは一瞬だけ黙ったあと、わざと明るく笑った。"
          }
        ]
      },
      {
        speaker: "アルファ",
        text: "ふーん。あんたってさ、意外とちゃんと人のこと見てるよね。"
      },
      {
        choice: true,
        options: [
          {
            text: "アルファのことは気になるから",
            point: 2,
            next: "アルファの頬が少し赤くなる。さっきまでの余裕が少しだけ崩れた。"
          },
          {
            text: "まあ、なんとなく",
            point: 0,
            next: "アルファは肩をすくめた。けれど、どこか嬉しそうだった。"
          }
        ]
      }
    ]
  },

  beta: {
    name: "ベータ",
    img: "./img/beta.png",
    desc: "無口で冷静。だけど放っておけない優しさがある。",
    route: [
      {
        speaker: "ベータ",
        text: "……君か。用がないなら、別にここにいなくてもいい。"
      },
      {
        speaker: "ベータ",
        text: "いや。追い払ってるわけじゃない。ただ、無理に付き合う必要はないって話。"
      },
      {
        choice: true,
        options: [
          {
            text: "ベータと話したかった",
            point: 2,
            next: "ベータは少し目を伏せた。予想外の言葉だったらしい。"
          },
          {
            text: "じゃあ帰る",
            point: -1,
            next: "ベータは何か言いかけて、結局そのまま黙った。"
          }
        ]
      },
      {
        speaker: "ベータ",
        text: "……変わってるな、君は。俺みたいなのに自分から近づくなんて。"
      },
      {
        choice: true,
        options: [
          {
            text: "近づきたいと思ったから",
            point: 2,
            next: "ベータの表情がほんの少しだけ柔らかくなった。"
          },
          {
            text: "怖くはないよ",
            point: 1,
            next: "ベータは小さく息を吐いた。安心したようにも見えた。"
          }
        ]
      }
    ]
  },

  gamma: {
    name: "ガンマ",
    img: "./img/gamma.png",
    desc: "小さくて不安げ。でも芯は強い、守りたくなる子。",
    route: [
      {
        speaker: "ガンマ",
        text: "あ、あの……私に何か用ですか……？"
      },
      {
        speaker: "ガンマ",
        text: "すみません。人と話すの、ちょっと緊張しちゃって。"
      },
      {
        choice: true,
        options: [
          {
            text: "ゆっくりでいいよ",
            point: 2,
            next: "ガンマはほっとしたように、ぎゅっと手を握った。"
          },
          {
            text: "緊張しなくていいのに",
            point: 0,
            next: "ガンマは困ったように笑った。悪気は伝わっていないらしい。"
          }
        ]
      },
      {
        speaker: "ガンマ",
        text: "あなたといると、少しだけ落ち着きます。……少しだけ、ですけど。"
      },
      {
        choice: true,
        options: [
          {
            text: "それだけでも嬉しい",
            point: 2,
            next: "ガンマは小さくうなずいた。目元が少しだけ明るくなる。"
          },
          {
            text: "もっと慣れてほしいな",
            point: 1,
            next: "ガンマは照れたように視線をそらした。"
          }
        ]
      }
    ]
  },

  delta: {
    name: "デルタ",
    img: "./img/delta.png",
    desc: "癒し系の男の子。猫のぬいぐるみと一緒にいる。",
    route: [
      {
        speaker: "デルタ",
        text: "こんにちは。今日はこの子も一緒なんだ。かわいいでしょ？"
      },
      {
        speaker: "デルタ",
        text: "この子、名前はまだ決めてないんだ。君なら何てつける？"
      },
      {
        choice: true,
        options: [
          {
            text: "もちねこ",
            point: 2,
            next: "デルタはぱっと笑った。ぬいぐるみを嬉しそうに抱きしめる。"
          },
          {
            text: "ねこ",
            point: 0,
            next: "デルタはくすっと笑った。シンプルすぎると思ったらしい。"
          }
        ]
      },
      {
        speaker: "デルタ",
        text: "君って、なんだか安心するね。話してると、時間がゆっくりになる感じ。"
      },
      {
        choice: true,
        options: [
          {
            text: "デルタも安心する",
            point: 2,
            next: "デルタは照れたように笑って、ぬいぐるみで少し顔を隠した。"
          },
          {
            text: "眠くなってきた",
            point: 1,
            next: "デルタは声を出して笑った。"
          }
        ]
      }
    ]
  },

  epsilon: {
    name: "イプシロン",
    img: "./img/epsilon.png",
    desc: "可愛くてあざとい。自分の見せ方をよく分かっている。",
    route: [
      {
        speaker: "イプシロン",
        text: "やっと来た。待ってたんだよ？ もちろん、偶然じゃなくて。"
      },
      {
        speaker: "イプシロン",
        text: "ねえ、今日の私どう？ ちゃんと可愛い？"
      },
      {
        choice: true,
        options: [
          {
            text: "かなり可愛い",
            point: 2,
            next: "イプシロンは満足そうに笑った。分かっていて聞いた顔だ。"
          },
          {
            text: "いつも通り",
            point: 0,
            next: "イプシロンはむっとした。どうやら正解ではなかったらしい。"
          }
        ]
      },
      {
        speaker: "イプシロン",
        text: "ふふ。君って、褒める時だけちょっと素直だよね。そこ、嫌いじゃないよ。"
      },
      {
        choice: true,
        options: [
          {
            text: "もっと褒めてもいい？",
            point: 2,
            next: "イプシロンは一瞬だけ固まって、それから嬉しそうに笑った。"
          },
          {
            text: "調子に乗るからやめとく",
            point: 1,
            next: "イプシロンは頬をふくらませた。でも、楽しそうだった。"
          }
        ]
      }
    ]
  },

  zeta: {
    name: "ゼータ",
    img: "./img/zeta.png",
    desc: "大人びた雰囲気の謎多き人物。静かに距離を測ってくる。",
    route: [
      {
        speaker: "ゼータ",
        text: "……君は、ずいぶん真っ直ぐこちらを見るんだな。"
      },
      {
        speaker: "ゼータ",
        text: "怖くないのか？ 私は、あまり親しみやすい方ではないと思うが。"
      },
      {
        choice: true,
        options: [
          {
            text: "怖くない",
            point: 2,
            next: "ゼータは少しだけ目を細めた。興味を持たれたらしい。"
          },
          {
            text: "少し怖い",
            point: 1,
            next: "ゼータは静かに笑った。正直な答えは嫌いではないようだ。"
          }
        ]
      },
      {
        speaker: "ゼータ",
        text: "君は不思議だ。警戒するべきなのに、なぜか追い払う気になれない。"
      },
      {
        choice: true,
        options: [
          {
            text: "じゃあ、もう少し一緒にいて",
            point: 2,
            next: "ゼータは返事をしなかった。ただ、隣の席を少し空けた。"
          },
          {
            text: "追い払わないでくれるんだ",
            point: 1,
            next: "ゼータは目を伏せた。肯定も否定もしなかった。"
          }
        ]
      }
    ]
  }
};

let currentCharacter = null;
let currentRoute = [];
let sceneIndex = 0;
let love = 0;

const titleScreen = document.getElementById("titleScreen");
const selectScreen = document.getElementById("selectScreen");
const novelScreen = document.getElementById("novelScreen");

const startBtn = document.getElementById("startBtn");
const characterGrid = document.getElementById("characterGrid");

const characterImage = document.getElementById("characterImage");
const speakerName = document.getElementById("speakerName");
const lovePoint = document.getElementById("lovePoint");
const messageText = document.getElementById("messageText");
const choices = document.getElementById("choices");
const nextBtn = document.getElementById("nextBtn");

function showScreen(screen) {
  document.querySelectorAll(".screen").forEach((item) => {
    item.classList.remove("active");
  });

  screen.classList.add("active");
}

function renderCharacterSelect() {
  characterGrid.innerHTML = "";

  Object.entries(characters).forEach(([id, character]) => {
    const card = document.createElement("button");
    card.className = "character-card";
    card.type = "button";

    card.innerHTML = `
      <img src="${character.img}" alt="${character.name}" />
      <div class="character-card-body">
        <h3>${character.name}</h3>
        <p>${character.desc}</p>
      </div>
    `;

    card.addEventListener("click", () => {
      startRoute(id);
    });

    characterGrid.appendChild(card);
  });
}

function startRoute(id) {
  currentCharacter = characters[id];
  currentRoute = currentCharacter.route;
  sceneIndex = 0;
  love = 0;

  characterImage.src = currentCharacter.img;
  characterImage.alt = currentCharacter.name;

  updateLove();
  showScreen(novelScreen);
  renderScene();
}

function updateLove() {
  lovePoint.textContent = `好感度 ${love}`;
}

function renderScene() {
  const scene = currentRoute[sceneIndex];

  choices.innerHTML = "";
  nextBtn.style.display = "inline-flex";

  if (!scene) {
    renderEnding();
    return;
  }

  if (scene.choice) {
    speakerName.textContent = currentCharacter.name;
    messageText.textContent = "どう答える？";
    nextBtn.style.display = "none";

    scene.options.forEach((option) => {
      const button = document.createElement("button");
      button.className = "choice-btn";
      button.type = "button";
      button.textContent = option.text;

      button.addEventListener("click", () => {
        love += option.point;
        updateLove();

        speakerName.textContent = "あなた";
        messageText.textContent = option.next;
        choices.innerHTML = "";
        nextBtn.style.display = "inline-flex";
        sceneIndex++;
      });

      choices.appendChild(button);
    });

    return;
  }

  speakerName.textContent = scene.speaker;
  messageText.textContent = scene.text;
}

function renderEnding() {
  choices.innerHTML = "";

  if (love >= 6) {
    speakerName.textContent = currentCharacter.name;
    messageText.textContent = `${currentCharacter.name}は、あなたの隣で少しだけ照れたように笑った。今日の放課後は、特別な記憶になった。`;
  } else if (love >= 3) {
    speakerName.textContent = currentCharacter.name;
    messageText.textContent = `${currentCharacter.name}との距離は、前より少し近づいた気がする。また話せる日が楽しみだ。`;
  } else {
    speakerName.textContent = currentCharacter.name;
    messageText.textContent = `${currentCharacter.name}とは、まだ少し距離がある。でも物語は始まったばかりだ。`;
  }

  nextBtn.textContent = "キャラ選択へ戻る";
  nextBtn.onclick = () => {
    nextBtn.textContent = "次へ";
    nextBtn.onclick = nextScene;
    showScreen(selectScreen);
  };
}

function nextScene() {
  sceneIndex++;
  renderScene();
}

startBtn.addEventListener("click", () => {
  renderCharacterSelect();
  showScreen(selectScreen);
});

nextBtn.addEventListener("click", nextScene);
