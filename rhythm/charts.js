// rhythm/charts.js

/*
  譜面の書き方

  ・ = 休符
  ○ / 〇 = 単押し
  ◎ = 同時押し

  1文字 = 16分音符
  1行 = 1小節

  このファイルでは EXPERT 用の譜面だけを書く。
  EASY / NORMAL / HARD は EXPERT から自動生成する。

  EASY   = 8ステップごとに残す + 単押し化
  NORMAL = 4ステップごとに残す + 単押し化
  HARD   = 2ステップごとに残す
  EXPERT = 元譜面そのまま
*/

const EXPERT_PATTERNS = {
  kimiToBokuNoMelody: [
    "・・・・・・・・・・・・・・・・",
    "○・・・・・・・○・・・・・・・",
    "〇・・・・・○・・・・・○・・・",
    "○・・・・・・・○・・・・・・・",

    "〇・・・・・○・・・・・○・・・",
    "○・・・・・・・○・・・・・・・",
    "〇・・・・・○・・・・・○・・・",
    "◎・・・・・・・・・・・・・・・",

    "○・・・○・○・○・〇〇・〇〇・",
    "○○○・○・○・○○○・○・○・",
    "○・・・○・○・○・〇〇・〇〇・",
    "○○○・○・○・○○○・○・○・",

    "○・〇〇・〇〇・○・・・○・○・",
    "○○○・○・○・○○○・○・○・",
    "○・〇〇・〇〇・○・・・○・○・",
    "○○○・○・○・○○○・○・○・",

    "〇・・・○○・○○・○・○・・・",
    "〇・・・○○・○○・○・○・・・",
    "○○○・○○○・○・・・・・・・",
    "○○○・○○○・○・○・○・・・",

    "〇・・・○○・○○・○○○・・・",
    "〇・・・○○・○○・○○○・・・",
    "○○○・○○○・○・○・○・・・",
    "○○○・○○○・○・○○○○○○",

    "○・○・○○○・○・○○○○○・",
    "○・○・○○○・○・○○○○○・",
    "○・・・○・・・○・○○・○○○",
    "○○○○○・○○○○○・○・○・",

    "○・○・○○○・○・○○○○○・",
    "○・○・○○○・○・○○○○○・",
    "○・・・○・・・○・○○・○○○",
    "◎・・・・・・・・・・・・・・・"
  ],

  miracleJumpBeat: [
    "・・・・・・・・・・・・・・・・",
    "○・・・・・・・○・・・・・・・",
    "・・・・○・・・・・・・○・・・",
    "○・・・・・・・○・・・○・・・",

    "○・・・○・・・○・・・○・・・",
    "・・○・・・○・・・○・・・○・",
    "○・・・○・・・○・○・○・・・",
    "・・○・○・・・○・・・○・・・",

    "○・・・○・・・○・・・○・・・",
    "・・・・○・・・○・・・○・・・",
    "○・・・○・・・○・○・○・・・",
    "・・○・○・・・○・・・○・○・",

    "○・○・・・○・・・○・○・・・",
    "・・○・○・・・○・○・・・○・",
    "○・○・・・○・○・・・○・○・",
    "・・○・○・○・・・○・○・○・",

    "○・○・○・・・○・○・○・・・",
    "・・○・○・○・・・○・○・○・",
    "○・○・○・○・・・○・○・○・",
    "・・○・○・○・○・○・○・○・",

    "○・○・○・○・○・○・○・○・",
    "○・・・○・○・○・・・○・○・",
    "○・○・○・○・○・○・○・○・",
    "○・・・○・○・○・○・○・○・",

    "○・○・○・○・○・○・○・○・",
    "○・・・○・○・○・・・○・○・",
    "○・○・○○・・○・○・○○・・",
    "○・○・○・○・○○○・○・・・",

    "○・・・・・・・○・・・・・・・",
    "・・・・○・・・・・・・○・・・",
    "○・・・○・・・○・・・○・・・",
    "・・○・・・○・・・○・・・○・",

    "○・・・○・○・・・○・○・・・",
    "・・○・○・・・○・・・○・○・",
    "○・・・○・○・・・○・○・・・",
    "・・○・○・・・○・○・○・・・",

    "○・○・○・○・○・○・○・○・",
    "○・・・○・○・○・・・○・○・",
    "○・○・○○・・○・○・○○・・",
    "◎・・・・・・・・・・・・・・・"
  ],

  taphell: [
    "・・・・・・・・・・・・・・・・",
    "○・・・○・・・○・・・○・・・",
    "・・○・○・・・○・○・・・○・",
    "○・・・○・○・・・○・○・・・",

    "○・○・・・○・○・・・○・○・",
    "・・○・○・○・・・○・○・○・",
    "○・○・○・・・○・○・○・・・",
    "・・○・○・○・○・・・○・○・",

    "○・○・○・○・○・○・○・○・",
    "○・・・○・○・○・・・○・○・",
    "○・○・○・○・○・○・○・○・",
    "○・○・○○・・○・○・○○・・",

    "○・○・○・○・○・○・○・○・",
    "◎・・・○・・・◎・・・○・・・",
    "○・○・○○・・○・○・○○・・",
    "○・・・◎・・・○・・・◎・・・",

    "○○・○・○○・○・○○・○・○・",
    "○・○○・○・○○・○・○○・○・",
    "○○・○・○○・○・○○・○・○・",
    "○・○・○○○・○・○・○○○・",

    "○・○・○・○・○・○・○・○・",
    "○○・○・○○・○・○○・○・○・",
    "○・○○・○・○○・○・○○・○・",
    "○・○・○○・・◎・・・○○・・",

    "○・・・○・○・・・○・○・・・",
    "・・○・○・・・○・・・○・○・",
    "○・・・○・○・・・○・○・・・",
    "・・○・○・○・・・○・○・○・",

    "○・○・○・○・○・○・○・○・",
    "○○・○・○○・○・○○・○・○・",
    "○・○○・○・○○・○・○○・○・",
    "○・○・○○○・○・○・○○○・",

    "○・○・○○・・○・○・○○・・",
    "◎・・・○・○・◎・・・○・○・",
    "○○・○・○○・○・○○・○・○・",
    "○・○・◎・・・○・○・◎・・・",

    "○○○・○・・・○○○・○・・・",
    "○・○・○○・・○・○・○○・・",
    "○○○・○・・・○○○・○・・・",
    "○・○○・○・○○・○・○○・○・",

    "○・○・○・○・○・○・○・○・",
    "○○・○・○○・○・○○・○・○・",
    "○・○○・○・○○・○・○○・○・",
    "○・○・○○○・○・○・○○○・",

    "○・○・○・○・○・○・○・○・",
    "◎・・・・・・・・・・・・・・・"
  ]
};

export const CHARTS = buildCharts(EXPERT_PATTERNS);

export function getChart(songId, difficultyId) {
  const normalizedSongId = normalizeSongId(songId);
  const normalizedDifficultyId = normalizeDifficultyId(difficultyId);

  return CHARTS?.[normalizedSongId]?.[normalizedDifficultyId] || [];
}

export function getExpertPattern(songId) {
  const normalizedSongId = normalizeSongId(songId);

  return EXPERT_PATTERNS[normalizedSongId] || [];
}

function buildCharts(patterns) {
  const charts = {};

  Object.keys(patterns).forEach((songId) => {
    const expertPattern = patterns[songId];
    const expertChart = patternToExpertChart(expertPattern);

    charts[songId] = {
      easy: reduceChartByStep(expertChart, 8, { singleOnly: true }),
      normal: reduceChartByStep(expertChart, 4, { singleOnly: true }),
      hard: reduceChartByStep(expertChart, 2),
      expert: expertChart
    };
  });

  return charts;
}

function patternToExpertChart(pattern) {
  const singleRows = [
    "1000",
    "0100",
    "0010",
    "0001"
  ];

  const chordRows = [
    "1001",
    "0110",
    "1100",
    "0011",
    "1010",
    "0101"
  ];

  const result = [];

  let lastSingleLane = null;
  let singleCount = 0;
  let chordCount = 0;

  pattern.forEach((line) => {
    Array.from(line).forEach((char) => {
      if (isSingleNote(char)) {
        const lane = getLaneExcept(lastSingleLane, singleCount);

        result.push(singleRows[lane]);

        lastSingleLane = lane;
        singleCount += 1;
        return;
      }

      if (isChordNote(char)) {
        const chord = chordRows[chordCount % chordRows.length];

        result.push(chord);

        chordCount += 1;
        lastSingleLane = null;
        return;
      }

      result.push("0000");
    });
  });

  return result;
}

function reduceChartByStep(chart, step, options = {}) {
  return chart.map((row, index) => {
    if (index % step !== 0) {
      return "0000";
    }

    if (options.singleOnly) {
      return singleNoteOnly(row);
    }

    return row;
  });
}

function singleNoteOnly(row) {
  const chars = row.split("");
  const firstIndex = chars.findIndex((char) => char === "1");

  if (firstIndex === -1) {
    return "0000";
  }

  return chars.map((_, index) => {
    return index === firstIndex ? "1" : "0";
  }).join("");
}

function getLaneExcept(excludeLane, count) {
  const lanePattern = [
    0,
    1,
    2,
    3,
    1,
    3,
    0,
    2
  ];

  for (let i = 0; i < lanePattern.length; i++) {
    const lane = lanePattern[(count + i) % lanePattern.length];

    if (lane !== excludeLane) {
      return lane;
    }
  }

  return 0;
}

function isSingleNote(char) {
  return char === "○" || char === "〇" || char === "o" || char === "O";
}

function isChordNote(char) {
  return char === "◎" || char === "◉";
}

function normalizeSongId(songId) {
  return String(songId || "").trim();
}

function normalizeDifficultyId(difficultyId) {
  return String(difficultyId || "")
    .trim()
    .toLowerCase();
}
