// games.js

export const GAMES = [
  {
    id: "2048",
    title: "2048",
    description: "数字を合体させて高得点を目指すパズル",
    script: "./game2048.js"
  },
  {
    id: "taprush",
    title: "Tap Rush",
    description: "30秒以内に高得点マスを連打する反射ゲーム",
    script: "./taprush.js"
  },
  {
    id: "sunvader",
    title: "sunvader",
    description: "太陽を集めてモンスターを避けるランゲーム",
    script: "./sunvader.js"
  },
  {
    id: "memorychain",
    title: "Memory Chain",
    description: "光った順番を覚えてタッチする記憶ゲーム",
    script: "./memorychain.js"
  }
];