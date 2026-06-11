// rhythm/songs.js

export const SONGS = [
  {
    id: "kimiToBokuNoMelody",
    chartId: "kimiToBokuNoMelody",
    title: "君と僕のメロディ",
    artist: "Lane feat. 結月ゆかり 初音ミク",
    audio: "./assets/kimi-to-boku-no-melody.mp3",
    bpm: 150,
    offset: 0,
    description: "やさしく明るい、最初に遊びやすいリズム曲。",
    difficulties: [
      {
        id: "easy",
        label: "EASY",
        level: 2,
        speed: 300,
        description: "ゆっくり確認しながら遊べる"
      },
      {
        id: "normal",
        label: "NORMAL",
        level: 4,
        speed: 420,
        description: "ほどよくリズムに乗れる"
      },
      {
        id: "hard",
        label: "HARD",
        level: 6,
        speed: 560,
        description: "連打と左右移動が増える"
      },
      {
        id: "expert",
        label: "EXPERT",
        level: 8,
        speed: 760,
        description: "元譜面そのままの本気モード"
      }
    ]
  },
  {
    id: "miracleJumpBeat",
    chartId: "miracleJumpBeat",
    title: "ミラクル☆ジャンプビート",
    artist: "ZERO",
    audio: "./assets/miracle-jump-beat.mp3",
    bpm: 165,
    offset: 0,
    description: "明るくジャンプする、テンポのいい曲。",
    difficulties: [
      {
        id: "easy",
        label: "EASY",
        level: 3,
        speed: 300,
        description: "基本のタップ練習向け"
      },
      {
        id: "normal",
        label: "NORMAL",
        level: 5,
        speed: 420,
        description: "少し忙しいリズム"
      },
      {
        id: "hard",
        label: "HARD",
        level: 7,
        speed: 560,
        description: "テンポ速めの本番"
      },
      {
        id: "expert",
        label: "EXPERT",
        level: 9,
        speed: 760,
        description: "元譜面そのままの本気モード"
      }
    ]
  },
  {
    id: "tapHell",
    chartId: "tapHell",
    title: "あなたはこの曲で地獄を見ることになる",
    artist: "ZERO",
    audio: "./assets/tap-hell.mp3",
    bpm: 170,
    offset: 0,
    description: "名前の通り、かなり忙しい高難易度曲。",
    difficulties: [
      {
        id: "easy",
        label: "EASY",
        level: 4,
        speed: 320,
        description: "地獄の入口"
      },
      {
        id: "normal",
        label: "NORMAL",
        level: 6,
        speed: 440,
        description: "まだ人間向け"
      },
      {
        id: "hard",
        label: "HARD",
        level: 8,
        speed: 600,
        description: "かなり忙しい"
      },
      {
        id: "expert",
        label: "EXPERT",
        level: 10,
        speed: 760,
        description: "元譜面そのままの地獄"
      }
    ]
  }
];

export function getSongById(songId) {
  return SONGS.find((song) => song.id === songId) || null;
}

export function getDifficulty(song, difficultyId) {
  if (!song) return null;

  return song.difficulties.find((difficulty) => {
    return difficulty.id === difficultyId;
  }) || null;
}
