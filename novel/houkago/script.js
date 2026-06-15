// iPhoneなどで連続タップした時のダブルタップ拡大を防ぐ
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

const SAVE_KEY = "houkagoNovelClearedCharacters";
const TRUE_END_KEY = "houkagoNovelTrueEndSeen";

const characters = {
  alpha: {
    name: "アルファ",
    img: "./img/alpha.png",
    desc: "明るく強気なムードメーカー。笑顔で距離を詰めてくるタイプ。",
    tags: ["強気", "距離近い", "王道"],
    routeName: "アルファルート：笑顔の裏側",
    route: [
      { speaker: "ナレーション", text: "放課後。誰もいない教室に、一冊のノートが置かれていた。" },
      { speaker: "ナレーション", text: "ページを開くと、最初に飛び出してきたのは、赤い髪の少女だった。" },
      { speaker: "アルファ", text: "お、来た来た！ 遅いぞー。……まあ、待ってたけどね。" },
      { speaker: "あなた", text: "待ってた？ 僕を？" },
      { speaker: "アルファ", text: "そ。だって、ここに来たってことは、私の物語を見に来たんでしょ？" },

      {
        choice: true,
        text: "アルファがこちらをのぞき込んでくる。",
        options: [
          { text: "一緒に帰ろうって言いに来た", point: 2, next: "アルファはにっと笑って、少し得意げにあなたの隣へ並んだ。" },
          { text: "たまたま来ただけ", point: -1, next: "アルファは一瞬だけ黙ったあと、わざと明るく笑った。" },
          { text: "アルファが気になった", point: 3, next: "アルファの頬が、ほんの少しだけ赤くなる。" }
        ]
      },

      { speaker: "アルファ", text: "ふーん。あんたってさ、意外とちゃんと人のこと見てるよね。" },
      { speaker: "アルファ", text: "私、明るいってよく言われるけどさ。ずっと明るいわけじゃないんだよ。" },
      { speaker: "アルファ", text: "本当はさ、置いていかれるのがちょっと苦手。" },
      { speaker: "アルファ", text: "だから先に笑って、先に喋って、先に距離詰めちゃう。変でしょ？" },

      {
        choice: true,
        text: "少しだけ弱さを見せたアルファに、なんて返す？",
        options: [
          { text: "無理して笑わなくてもいい", point: 3, next: "アルファは目を丸くしたあと、照れたように視線をそらした。" },
          { text: "でも笑顔の方が似合うよ", point: 1, next: "アルファは笑った。けれど、その笑顔は少しだけ寂しそうだった。" },
          { text: "そういうところも好きかも", point: 2, next: "アルファは勢いよく振り向いた。完全に不意打ちだったらしい。" }
        ]
      },

      { speaker: "アルファ", text: "……あんた、ずるいね。そういうこと普通に言うんだ。" },
      { speaker: "あなた", text: "普通じゃない？" },
      { speaker: "アルファ", text: "普通じゃない。少なくとも、私には効く。" },

      {
        choice: true,
        text: "アルファは少しだけ真面目な顔で、手を差し出した。",
        options: [
          { text: "その手を取る", point: 3, next: "アルファは安心したように笑った。さっきまでの強気な笑顔とは少し違っていた。" },
          { text: "からかうように見つめる", point: 1, next: "アルファはむっとした顔をしたが、手は引っ込めなかった。" },
          { text: "少し迷う", point: 0, next: "アルファは小さく笑った。待つのは苦手だけど、今日は待ってくれるらしい。" }
        ]
      },

      { speaker: "アルファ", text: "じゃあ今日は、特別に私の隣、予約済みにしてあげる。" },
      { speaker: "あなた", text: "予約制なんだ。" },
      { speaker: "アルファ", text: "当たり前でしょ。人気者だからね、私。" },
      { speaker: "ナレーション", text: "そう言って笑うアルファの横顔は、最初に会った時より少しだけ素直に見えた。" }
    ]
  },

  beta: {
    name: "ベータ",
    img: "./img/beta.png",
    desc: "無口で冷静。だけど放っておけない優しさがある。",
    tags: ["クール", "不器用", "静か"],
    routeName: "ベータルート：沈黙の温度",
    route: [
      { speaker: "ナレーション", text: "図書室の奥。窓際の席に、青い髪の少年が一人で座っていた。" },
      { speaker: "ベータ", text: "……君か。用がないなら、別にここにいなくてもいい。" },
      { speaker: "あなた", text: "いきなり帰れってこと？" },
      { speaker: "ベータ", text: "違う。ただ、無理に付き合う必要はないって話。" },

      {
        choice: true,
        text: "ベータは視線をそらしたまま、ページをめくる。",
        options: [
          { text: "ベータと話したかった", point: 3, next: "ベータは少し目を伏せた。予想外の言葉だったらしい。" },
          { text: "じゃあ帰る", point: -1, next: "ベータは何か言いかけて、結局そのまま黙った。" },
          { text: "隣、座ってもいい？", point: 2, next: "ベータは返事をしなかった。ただ、椅子を少しだけ引いた。" }
        ]
      },

      { speaker: "ベータ", text: "……変わってるな、君は。俺みたいなのに自分から近づくなんて。" },
      { speaker: "あなた", text: "ベータは、自分で思ってるほど冷たくないよ。" },
      { speaker: "ベータ", text: "買いかぶりすぎだ。" },
      { speaker: "あなた", text: "でも、追い払わないじゃん。" },
      { speaker: "ベータ", text: "……追い払う理由がないだけだ。" },

      {
        choice: true,
        text: "ベータの声は静かだけど、拒絶ではなかった。",
        options: [
          { text: "じゃあ、ちゃんと知りたい", point: 3, next: "ベータの表情がほんの少しだけ柔らかくなった。" },
          { text: "怖くはないよ", point: 2, next: "ベータは小さく息を吐いた。安心したようにも見えた。" },
          { text: "無理には聞かない", point: 2, next: "ベータは驚いたようにこちらを見た。距離を守られたことが嬉しかったらしい。" }
        ]
      },

      { speaker: "ベータ", text: "俺は、言葉を選ぶのが得意じゃない。" },
      { speaker: "ベータ", text: "だから黙る。黙っていれば、少なくとも誰かを傷つけることは少ない。" },
      { speaker: "あなた", text: "でも、黙ってると伝わらないこともあるよ。" },
      { speaker: "ベータ", text: "……分かってる。" },

      {
        choice: true,
        text: "ベータは本を閉じて、初めて正面からこちらを見た。",
        options: [
          { text: "今の言葉、ちゃんと伝わったよ", point: 3, next: "ベータは目を細めた。安心したような、困ったような顔だった。" },
          { text: "無理に喋らなくていい", point: 2, next: "ベータは小さくうなずいた。少しだけ肩の力が抜けたようだった。" },
          { text: "もっと話してほしい", point: 1, next: "ベータは困ったように視線を落とした。でも、嫌ではなさそうだった。" }
        ]
      },

      { speaker: "ベータ", text: "……君といると、静かなのにうるさくない。" },
      { speaker: "あなた", text: "それ、褒めてる？" },
      { speaker: "ベータ", text: "たぶん。" },
      { speaker: "ナレーション", text: "短い返事。けれど、その言葉は不思議と温かかった。" }
    ]
  },

  gamma: {
    name: "ガンマ",
    img: "./img/gamma.png",
    desc: "小さくて不安げ。でも芯は強い、守りたくなる子。",
    tags: ["ピュア", "内気", "守りたい"],
    routeName: "ガンマルート：小さな勇気",
    route: [
      { speaker: "ナレーション", text: "中庭のベンチ。黄色い髪の少女が、両手をぎゅっと握って座っていた。" },
      { speaker: "ガンマ", text: "あ、あの……私に何か用ですか……？" },
      { speaker: "あなた", text: "驚かせた？ ごめん。" },
      { speaker: "ガンマ", text: "い、いえ。私が勝手にびっくりしただけです。" },

      {
        choice: true,
        text: "ガンマは不安そうにこちらを見ている。",
        options: [
          { text: "ゆっくりでいいよ", point: 3, next: "ガンマはほっとしたように、ぎゅっと手を握った。" },
          { text: "緊張しなくていいのに", point: 0, next: "ガンマは困ったように笑った。悪気は伝わっていないらしい。" },
          { text: "隣に座っても大丈夫？", point: 2, next: "ガンマは小さくうなずいて、少しだけ端に寄った。" }
        ]
      },

      { speaker: "ガンマ", text: "私、誰かと話すのが苦手で……変なこと言っちゃったらどうしようって思うんです。" },
      { speaker: "あなた", text: "変なこと言ってもいいよ。僕も言うし。" },
      { speaker: "ガンマ", text: "ふふっ……それは、ちょっと安心します。" },
      { speaker: "ガンマ", text: "本当は、私ももっと普通に話したいんです。" },
      { speaker: "ガンマ", text: "でも、言葉が出る前に、怖い気持ちの方が先に来ちゃって。" },

      {
        choice: true,
        text: "少し笑ったガンマに、もう一言かけるなら？",
        options: [
          { text: "その笑顔、かわいいね", point: 2, next: "ガンマは真っ赤になって、両手で顔を隠した。" },
          { text: "焦らなくていい。ここにいるよ", point: 3, next: "ガンマはゆっくり顔を上げた。目元が少しだけ明るくなる。" },
          { text: "また話したい", point: 2, next: "ガンマは驚いたあと、小さく何度もうなずいた。" }
        ]
      },

      { speaker: "ガンマ", text: "あなたといると、少しだけ落ち着きます。……少しだけ、ですけど。" },
      { speaker: "あなた", text: "少しでも嬉しい。" },

      {
        choice: true,
        text: "ガンマは勇気を出すように、こちらを見上げた。",
        options: [
          { text: "明日もここで話そう", point: 3, next: "ガンマの表情がぱっと明るくなった。小さな約束ができた。" },
          { text: "無理しなくていいよ", point: 2, next: "ガンマは安心したように胸元で手を握った。" },
          { text: "僕から話しかけに行くよ", point: 2, next: "ガンマは照れたようにうつむいた。けれど、嬉しそうだった。" }
        ]
      },

      { speaker: "ガンマ", text: "……じゃあ、また明日も、ここに来てもいいですか？" },
      { speaker: "ナレーション", text: "小さな声。でもそれは、ガンマが自分で踏み出した一歩だった。" }
    ]
  },

  delta: {
    name: "デルタ",
    img: "./img/delta.png",
    desc: "癒し系の男の子。猫のぬいぐるみと一緒にいる。",
    tags: ["癒し", "猫", "ほのぼの"],
    routeName: "デルタルート：もちねこと放課後",
    route: [
      { speaker: "ナレーション", text: "教室の隅から、ふわふわした白い何かがこちらを見ていた。" },
      { speaker: "デルタ", text: "こんにちは。今日はこの子も一緒なんだ。かわいいでしょ？" },
      { speaker: "あなた", text: "その子、猫？" },
      { speaker: "デルタ", text: "たぶん猫。本人はまだ名乗ってくれないけどね。" },

      {
        choice: true,
        text: "デルタはぬいぐるみをこちらに差し出した。",
        options: [
          { text: "もちねこって呼ぼう", point: 3, next: "デルタはぱっと笑った。ぬいぐるみを嬉しそうに抱きしめる。" },
          { text: "ねこ", point: 0, next: "デルタはくすっと笑った。シンプルすぎると思ったらしい。" },
          { text: "主役ねこ", point: 2, next: "デルタは目を輝かせた。どうやら気に入ったらしい。" }
        ]
      },

      { speaker: "デルタ", text: "君って、なんだか安心するね。話してると、時間がゆっくりになる感じ。" },
      { speaker: "あなた", text: "デルタも安心するよ。" },
      { speaker: "デルタ", text: "ほんと？ それなら、この子も喜んでる。" },
      { speaker: "あなた", text: "その子、喋るの？" },
      { speaker: "デルタ", text: "喋らないよ。でも、だいたい分かる。" },

      {
        choice: true,
        text: "ぬいぐるみの顔が、なぜか誇らしげに見える。",
        options: [
          { text: "デルタも、この子もかわいい", point: 2, next: "デルタは照れたように笑って、ぬいぐるみで少し顔を隠した。" },
          { text: "眠くなってきた", point: 1, next: "デルタは声を出して笑った。" },
          { text: "また一緒にのんびりしたい", point: 3, next: "デルタは嬉しそうに、ぬいぐるみの手を小さく振らせた。" }
        ]
      },

      { speaker: "デルタ", text: "僕、急かされるのが少し苦手なんだ。" },
      { speaker: "デルタ", text: "でも君は、隣にいるだけでいいって感じがする。" },
      { speaker: "あなた", text: "じゃあ、急がず帰ろうか。" },

      {
        choice: true,
        text: "デルタはぬいぐるみを抱え直して、にこっと笑った。",
        options: [
          { text: "三人で帰ろう", point: 3, next: "デルタは嬉しそうにうなずいた。ぬいぐるみも少し誇らしげだ。" },
          { text: "寄り道しよう", point: 2, next: "デルタは目を輝かせた。のんびりした寄り道が始まりそうだ。" },
          { text: "また明日ね", point: 1, next: "デルタは少し寂しそうにしたけれど、ちゃんと笑って手を振った。" }
        ]
      },

      { speaker: "デルタ", text: "じゃあ、次は三人で帰ろう。僕と、君と、この子。" },
      { speaker: "あなた", text: "人数に入るんだ。" },
      { speaker: "デルタ", text: "もちろん。大事な友達だからね。" },
      { speaker: "ナレーション", text: "放課後の空気は、いつもより少しだけやわらかかった。" }
    ]
  },

  epsilon: {
    name: "イプシロン",
    img: "./img/epsilon.png",
    desc: "可愛くてあざとい。自分の見せ方をよく分かっている。",
    tags: ["あざとい", "可愛い", "小悪魔"],
    routeName: "イプシロンルート：かわいいは武器",
    route: [
      { speaker: "ナレーション", text: "廊下の窓辺。オレンジ色の髪の少女が、こちらに気づいて微笑んだ。" },
      { speaker: "イプシロン", text: "やっと来た。待ってたんだよ？ もちろん、偶然じゃなくて。" },
      { speaker: "あなた", text: "待ち伏せ？" },
      { speaker: "イプシロン", text: "言い方。運命って言って？" },

      {
        choice: true,
        text: "イプシロンは少し首をかしげて見せる。",
        options: [
          { text: "今日もかなり可愛い", point: 3, next: "イプシロンは満足そうに笑った。分かっていて聞いた顔だ。" },
          { text: "いつも通り", point: 0, next: "イプシロンはむっとした。どうやら正解ではなかったらしい。" },
          { text: "運命なら仕方ない", point: 2, next: "イプシロンは楽しそうに笑った。ノリの良さは高評価らしい。" }
        ]
      },

      { speaker: "イプシロン", text: "ふふ。君って、褒める時だけちょっと素直だよね。そこ、嫌いじゃないよ。" },
      { speaker: "あなた", text: "褒められ慣れてそう。" },
      { speaker: "イプシロン", text: "慣れてるよ。でも、君から言われるのは別。" },
      { speaker: "あなた", text: "別なんだ。" },
      { speaker: "イプシロン", text: "別。だって君、たまに本気で見てくるから。" },

      {
        choice: true,
        text: "イプシロンが、じっとこちらを見つめてくる。",
        options: [
          { text: "もっと褒めてもいい？", point: 3, next: "イプシロンは一瞬だけ固まって、それから嬉しそうに笑った。" },
          { text: "調子に乗るからやめとく", point: 1, next: "イプシロンは頬をふくらませた。でも、楽しそうだった。" },
          { text: "可愛いだけじゃないところも見たい", point: 3, next: "イプシロンの表情から、少しだけ作った笑顔が消えた。" }
        ]
      },

      { speaker: "イプシロン", text: "私ね、可愛いって言われるのは好き。" },
      { speaker: "イプシロン", text: "でも、可愛いだけで終わられるのは、ちょっと嫌。" },
      { speaker: "あなた", text: "じゃあ、ちゃんと見るよ。" },

      {
        choice: true,
        text: "イプシロンは、いたずらっぽく笑った。",
        options: [
          { text: "本気のイプシロンが見たい", point: 3, next: "イプシロンは一瞬だけ黙って、それから小さく笑った。" },
          { text: "可愛いも本気もどっちも好き", point: 2, next: "イプシロンは照れ隠しみたいに髪を揺らした。" },
          { text: "小悪魔だな", point: 1, next: "イプシロンは満足げに笑った。否定する気はないらしい。" }
        ]
      },

      { speaker: "イプシロン", text: "……君、たまに危ないこと言うよね。" },
      { speaker: "あなた", text: "危ない？" },
      { speaker: "イプシロン", text: "私が本気にしたらどうするの、ってこと。" },
      { speaker: "ナレーション", text: "からかうような声。でも、その目はいつもより少しだけ真剣だった。" }
    ]
  },

  zeta: {
    name: "ゼータ",
    img: "./img/zeta.png",
    desc: "大人びた雰囲気の謎多き人物。静かに距離を測ってくる。",
    tags: ["謎", "大人びた", "高難度"],
    routeName: "ゼータルート：名もなきページ",
    route: [
      { speaker: "ナレーション", text: "古い資料室。夕日の届かない場所に、紫の髪の人物が立っていた。" },
      { speaker: "ゼータ", text: "……君は、ずいぶん真っ直ぐこちらを見るんだな。" },
      { speaker: "あなた", text: "見ちゃダメだった？" },
      { speaker: "ゼータ", text: "ダメではない。ただ、怖くないのかと思っただけだ。" },

      {
        choice: true,
        text: "ゼータの声は低く、静かだった。",
        options: [
          { text: "怖くない", point: 2, next: "ゼータは少しだけ目を細めた。興味を持たれたらしい。" },
          { text: "少し怖い", point: 2, next: "ゼータは静かに笑った。正直な答えは嫌いではないようだ。" },
          { text: "むしろ気になる", point: 3, next: "ゼータはしばらく黙った。予想より踏み込まれたらしい。" }
        ]
      },

      { speaker: "ゼータ", text: "私は、あまり親しみやすい方ではない。誰かと並んで歩くことにも慣れていない。" },
      { speaker: "あなた", text: "それでも、追い払わないんだね。" },
      { speaker: "ゼータ", text: "……君は不思議だ。警戒するべきなのに、なぜか追い払う気になれない。" },
      { speaker: "ゼータ", text: "このノートに名を持つ者は、誰かに読まれなければ存在できない。" },
      { speaker: "あなた", text: "じゃあ僕は、ゼータを見つけた人？" },
      { speaker: "ゼータ", text: "そうとも言える。あるいは、巻き込まれた者とも言える。" },

      {
        choice: true,
        text: "ゼータは窓の外を見たまま、あなたの返事を待っている。",
        options: [
          { text: "じゃあ、もう少し一緒にいて", point: 3, next: "ゼータは返事をしなかった。ただ、隣の席を少し空けた。" },
          { text: "無理に話さなくていい", point: 2, next: "ゼータは静かに目を伏せた。距離を急がない言葉に安心したようだった。" },
          { text: "いつか名前の意味を教えて", point: 3, next: "ゼータの目が、ほんの一瞬だけ揺れた。" }
        ]
      },

      { speaker: "ゼータ", text: "名を知るということは、物語に踏み込むということだ。" },
      { speaker: "あなた", text: "じゃあ、踏み込んでもいい？" },
      { speaker: "ゼータ", text: "……今はまだ、半歩だけだ。" },

      {
        choice: true,
        text: "ゼータはノートの最後のページに触れた。",
        options: [
          { text: "半歩でも進みたい", point: 3, next: "ゼータはわずかに目を伏せた。その表情は、拒絶ではなかった。" },
          { text: "待つよ", point: 2, next: "ゼータは静かにうなずいた。待つという言葉は、彼にとって優しいものだった。" },
          { text: "秘密が多いな", point: 1, next: "ゼータは薄く笑った。否定はしなかった。" }
        ]
      },

      { speaker: "ゼータ", text: "半歩。その距離が、今の私に許せる最大だ。" },
      { speaker: "ナレーション", text: "けれど、その半歩は、ゼータにとって大きな許可なのだと分かった。" }
    ]
  }
};

const trueEndRoute = [
  { speaker: "ナレーション", text: "六つの物語を読み終えた時、ノートの最後のページが淡く光った。" },
  { speaker: "ナレーション", text: "そこには、今までなかったはずの文字が浮かび上がっている。" },
  { speaker: "ノート", text: "『すべての主役が、あなたを待っています。』" },
  { speaker: "アルファ", text: "遅いぞー。全員に会いに行くなんて、なかなか忙しい人だね。" },
  { speaker: "ベータ", text: "……でも、ちゃんと戻ってきた。" },
  { speaker: "ガンマ", text: "あの、また会えて……嬉しいです。" },
  { speaker: "デルタ", text: "もちねこも喜んでるよ。たぶんすごく。" },
  { speaker: "イプシロン", text: "ふふ。これだけ会いに来たなら、もう運命ってことでいいよね？" },
  { speaker: "ゼータ", text: "君は、ただの読者ではなくなったようだ。" },
  { speaker: "あなた", text: "じゃあ僕は何になったの？" },
  { speaker: "ゼータ", text: "この物語をつなぐ者。ページとページの間にいる、もう一人の主役だ。" },
  { speaker: "ナレーション", text: "ノートが閉じる。\nけれど物語は終わらない。" },
  { speaker: "ナレーション", text: "次のページには、まだ見ぬ誰かの名前が書かれるのを待っている。" },
  { speaker: "TRUE END", text: "放課後の主役たち\n\n全員攻略、おめでとう。\nあなたの選んだ言葉が、六人の物語をつなぎました。" }
];

let currentCharacter = null;
let currentCharacterId = null;
let currentRoute = [];
let sceneIndex = 0;
let love = 0;
let endingMode = false;
let trueEndMode = false;

let isTyping = false;
let typeTimer = null;
let fullText = "";
const TYPE_SPEED = 28;

const titleScreen = document.getElementById("titleScreen");
const howToScreen = document.getElementById("howToScreen");
const selectScreen = document.getElementById("selectScreen");
const novelScreen = document.getElementById("novelScreen");

const startBtn = document.getElementById("startBtn");
const howToBtn = document.getElementById("howToBtn");
const characterGrid = document.getElementById("characterGrid");

const routeTitle = document.getElementById("routeTitle");
const characterImage = document.getElementById("characterImage");
const speakerName = document.getElementById("speakerName");
const lovePoint = document.getElementById("lovePoint");
const messageText = document.getElementById("messageText");
const choices = document.getElementById("choices");
const nextBtn = document.getElementById("nextBtn");
const backSelectBtn = document.getElementById("backSelectBtn");

function getClearedCharacters() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveClearedCharacter(id) {
  const cleared = getClearedCharacters();

  if (!cleared.includes(id)) {
    cleared.push(id);
    localStorage.setItem(SAVE_KEY, JSON.stringify(cleared));
  }
}

function isAllGoodCleared() {
  const cleared = getClearedCharacters();
  return Object.keys(characters).every((id) => cleared.includes(id));
}

function isTrueEndSeen() {
  return localStorage.getItem(TRUE_END_KEY) === "true";
}

function saveTrueEndSeen() {
  localStorage.setItem(TRUE_END_KEY, "true");
}

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
  }, TYPE_SPEED);
}

function finishTyping() {
  clearInterval(typeTimer);
  messageText.textContent = fullText;
  isTyping = false;
}

function renderCharacterSelect() {
  const cleared = getClearedCharacters();

  characterGrid.innerHTML = "";

  Object.entries(characters).forEach(([id, character]) => {
    const isCleared = cleared.includes(id);

    const card = document.createElement("button");
    card.className = `character-card ${isCleared ? "cleared" : ""}`;
    card.type = "button";

    card.innerHTML = `
      <img src="${character.img}" alt="${character.name}" />
      <div class="character-card-body">
        <h3>${character.name} ${isCleared ? "✓" : ""}</h3>
        <p>${character.desc}</p>
        <div class="character-tags">
          ${character.tags.map((tag) => `<span>${tag}</span>`).join("")}
          ${isCleared ? "<span>GOOD済み</span>" : ""}
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      startRoute(id);
    });

    characterGrid.appendChild(card);
  });

  if (isAllGoodCleared()) {
    const trueCard = document.createElement("button");
    trueCard.className = "character-card cleared";
    trueCard.type = "button";

    trueCard.innerHTML = `
      <div style="height: 300px; display: grid; place-items: center; background: radial-gradient(circle, rgba(255,211,106,.36), transparent 58%), rgba(255,255,255,.08);">
        <div style="font-size: 4rem;">✦</div>
      </div>
      <div class="character-card-body">
        <h3>全員攻略エンド ${isTrueEndSeen() ? "✓" : ""}</h3>
        <p>六つの物語を読み終えたあなたにだけ開く、最後のページ。</p>
        <div class="character-tags">
          <span>TRUE END</span>
          <span>解放済み</span>
        </div>
      </div>
    `;

    trueCard.addEventListener("click", startTrueEnd);
    characterGrid.appendChild(trueCard);
  }
}

function startRoute(id) {
  currentCharacter = characters[id];
  currentCharacterId = id;
  currentRoute = currentCharacter.route;
  sceneIndex = 0;
  love = 0;
  endingMode = false;
  trueEndMode = false;

  routeTitle.textContent = currentCharacter.routeName;
  characterImage.src = currentCharacter.img;
  characterImage.alt = currentCharacter.name;
  characterImage.style.display = "block";
  lovePoint.style.display = "inline";
  nextBtn.textContent = "次へ";

  updateLove();
  showScreen(novelScreen);
  renderScene();
}

function startTrueEnd() {
  currentCharacter = {
    name: "TRUE END",
    img: ""
  };

  currentCharacterId = null;
  currentRoute = trueEndRoute;
  sceneIndex = 0;
  love = 0;
  endingMode = false;
  trueEndMode = true;

  routeTitle.textContent = "TRUE END：すべての主役たち";
  characterImage.style.display = "none";
  lovePoint.style.display = "none";
  nextBtn.textContent = "次へ";

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
    if (trueEndMode) {
      renderTrueEndFinish();
    } else {
      renderEnding();
    }
    return;
  }

  if (scene.choice) {
    speakerName.textContent = currentCharacter.name;
    setText(scene.text || "どう答える？");
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

        love += option.point;
        updateLove();

        speakerName.textContent = "あなた";
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

  if (love >= 7) {
    saveClearedCharacter(currentCharacterId);

    speakerName.textContent = "GOOD END";
    setText(`${currentCharacter.name}は、あなたの隣で少しだけ照れたように笑った。

今日の放課後は、ただの帰り道ではなくなった。
また明日も会いたい。
そう思える、特別な記憶になった。

【${currentCharacter.name} GOOD CLEAR】`);

  } else if (love >= 4) {
    speakerName.textContent = "NORMAL END";
    setText(`${currentCharacter.name}との距離は、前より少し近づいた気がする。

まだ知らないことは多い。
でも、次に会った時は今日より自然に話せる気がした。`);

  } else {
    speakerName.textContent = "DISTANCE END";
    setText(`${currentCharacter.name}とは、まだ少し距離がある。

けれど物語は始まったばかり。
次の放課後には、違う言葉を選べるかもしれない。`);
  }

  nextBtn.textContent = isAllGoodCleared() ? "最後のページへ" : "キャラ選択へ戻る";
}

function renderTrueEndFinish() {
  endingMode = true;
  saveTrueEndSeen();

  speakerName.textContent = "SYSTEM";
  setText("TRUE ENDを見ました。\n物語は、次のOCが来る日を待っています。");
  nextBtn.textContent = "キャラ選択へ戻る";
}

function nextScene() {
  if (isTyping) {
    finishTyping();
    return;
  }

  if (endingMode) {
    if (!trueEndMode && isAllGoodCleared() && !isTrueEndSeen()) {
      startTrueEnd();
      return;
    }

    endingMode = false;
    trueEndMode = false;
    nextBtn.textContent = "次へ";
    lovePoint.style.display = "inline";
    renderCharacterSelect();
    showScreen(selectScreen);
    return;
  }

  sceneIndex++;
  renderScene();
}

startBtn.addEventListener("click", () => {
  renderCharacterSelect();
  showScreen(selectScreen);
});

howToBtn.addEventListener("click", () => {
  showScreen(howToScreen);
});

document.querySelector("[data-back-select]").addEventListener("click", () => {
  renderCharacterSelect();
  showScreen(selectScreen);
});

backSelectBtn.addEventListener("click", () => {
  clearInterval(typeTimer);
  nextBtn.textContent = "次へ";
  endingMode = false;
  trueEndMode = false;
  lovePoint.style.display = "inline";
  renderCharacterSelect();
  showScreen(selectScreen);
});

nextBtn.addEventListener("click", nextScene);
