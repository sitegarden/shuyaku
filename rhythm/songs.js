// rhythm/songs.js

export const SONGS = [
  {
    id: "piko",
    title: "ぴこぴこスターライン",
    artist: "ZERO",
    audio: "./audio/piko-piko-starline.mp3",
    bpm: 128,
    duration: 49,
    description: "かわいく跳ねる、最初に遊びやすいリズム曲。",
    difficulties: [
      {
        id: "easy",
        label: "EASY",
        level: 2,
        speed: 280,
        description: "ゆっくり確認しながら遊べる"
      },
      {
        id: "normal",
        label: "NORMAL",
        level: 4,
        speed: 390,
        description: "ほどよくリズムに乗れる"
      },
      {
        id: "hard",
        label: "HARD",
        level: 6,
        speed: 520,
        description: "連打と左右移動が増える"
      },
      {
        id: "expert",
        label: "EXPERT",
        level: 8,
        speed: 650,
        description: "元譜面そのままの本気モード"
      }
    ]
  },
  {
    id: "miracle",
    title: "Miracle Jump Beat",
    artist: "ZERO",
    audio: "./audio/miracle-jump-beat.mp3",
    bpm: 150,
    duration: 55,
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
        speed: 430,
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
        speed: 700,
        description: "元譜面そのままの本気モード"
      }
    ]
  },
  {
    id: "taphell",
    title: "あなたはこの曲で地獄を見ることになる",
    artist: "ZERO",
    audio: "./audio/tap-hell.mp3",
    bpm: 180,
    duration: 60,
    description: "名前の通り、かなり忙しい高難易度曲。",
    difficulties: [
      {
        id: "easy",
        label: "EASY",
        level: 4,
        speed: 330,
        description: "地獄の入口"
      },
      {
        id: "normal",
        label: "NORMAL",
        level: 6,
        speed: 470,
        description: "まだ人間向け"
      },
      {
        id: "hard",
        label: "HARD",
        level: 8,
        speed: 620,
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
