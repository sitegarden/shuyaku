function getGuestPlayer() {
  let guestId = localStorage.getItem("shuyakuGuestId");
  let guestName = localStorage.getItem("shuyakuGuestName");

  if (!guestId) {
    guestId = `guest_${crypto.randomUUID()}`;
    localStorage.setItem("shuyakuGuestId", guestId);
  }

  if (!guestName) {
    guestName = createGuestName();
    localStorage.setItem("shuyakuGuestName", guestName);
  }

  return {
    uid: guestId,
    name: guestName,
    iconPath: "/favicon.png",
    title: "guest"
  };
}

function createGuestName() {
  const animals = [
    "うさぎ",
    "ねこ",
    "きつね",
    "くらげ",
    "ぺんぎん",
    "ひよこ",
    "こぐま",
    "りす",
    "いるか",
    "たぬき",
    "はむすたー",
    "ことり"
  ];

  const words = [
    "ビート",
    "ジャンプ",
    "スター",
    "メロディ",
    "ドリーム",
    "ポップ",
    "スパーク",
    "キャンディ",
    "ピクセル",
    "リズム",
    "ミラクル",
    "ダッシュ"
  ];

  const animal = animals[Math.floor(Math.random() * animals.length)];
  const word = words[Math.floor(Math.random() * words.length)];
  const number = String(Math.floor(Math.random() * 10000)).padStart(4, "0");

  return `${animal}${word}${number}`;
}
