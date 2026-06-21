// auth.js

import { auth, db } from "./firebase.js";
import { getGuestName, saveGuestName } from "./guest.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const ICON_LIST = [
  "/img/icons/icon01.png",
  "/img/icons/icon02.png",
  "/img/icons/icon03.png",
  "/img/icons/icon04.png"
];

const provider = new GoogleAuthProvider();

const accountLink = document.getElementById("accountLink");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const saveProfileBtn = document.getElementById("saveProfileBtn");

const guestArea = document.getElementById("guestArea");
const userArea = document.getElementById("userArea");

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userIcon = document.getElementById("userIcon");

const displayNameInput = document.getElementById("displayNameInput");
const iconOptions = document.getElementById("iconOptions");
const accountMessage = document.getElementById("accountMessage");

const guestNameSettingInput = document.getElementById("guestNameSettingInput");
const saveGuestNameBtn = document.getElementById("saveGuestNameBtn");
const guestNameMessage = document.getElementById("guestNameMessage");

let currentUser = null;
let currentUserData = null;
let selectedIconPath = ICON_LIST[0];

if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      await createUserDataIfNeeded(result.user);
    } catch (error) {
      console.error(error);
      alert(`Googleログインエラー: ${error.message}`);
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
      alert(`ログアウトエラー: ${error.message}`);
    }
  });
}

if (saveProfileBtn) {
  saveProfileBtn.addEventListener("click", async () => {
    await saveProfile();
  });
}

if (saveGuestNameBtn) {
  saveGuestNameBtn.addEventListener("click", () => {
    saveGuestNameSetting();
  });
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;

    await createUserDataIfNeeded(user);
    currentUserData = await getUserData(user.uid);

    showLoggedIn(user, currentUserData);
  } else {
    currentUser = null;
    currentUserData = null;

    showLoggedOut();
  }
});

async function createUserDataIfNeeded(user) {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    return;
  }

  await setDoc(userRef, {
    uid: user.uid,
    displayName: user.displayName || "名無しプレイヤー",
    email: user.email || "",
    photoURL: user.photoURL || "",
    iconPath: ICON_LIST[0],
    title: "player",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

async function getUserData(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    return null;
  }

  return snap.data();
}

async function saveProfile() {
  if (!currentUser) return;

  const displayName = displayNameInput?.value.trim();

  if (!displayName) {
    showAccountMessage("表示名を入力してね。", "error");
    return;
  }

  if (displayName.length > 16) {
    showAccountMessage("表示名は16文字以内にしてね。", "error");
    return;
  }

  try {
    const userRef = doc(db, "users", currentUser.uid);

    await updateDoc(userRef, {
      displayName,
      iconPath: selectedIconPath,
      updatedAt: serverTimestamp()
    });

    currentUserData = await getUserData(currentUser.uid);

    showLoggedIn(currentUser, currentUserData);
    showAccountMessage("保存したよ。", "success");
  } catch (error) {
    console.error(error);
    showAccountMessage(`保存エラー: ${error.message}`, "error");
  }
}

function saveGuestNameSetting() {
  const guestName = guestNameSettingInput?.value || "";

  if (!saveGuestName(guestName)) {
    showGuestNameMessage("ゲスト名を1文字以上入力してね。", "error");
    return;
  }

  if (guestNameSettingInput) {
    guestNameSettingInput.value = getGuestName();
  }

  showGuestNameMessage("ゲスト名を保存したよ。", "success");
}

function showGuestNameMessage(message, type) {
  if (!guestNameMessage) return;

  guestNameMessage.textContent = message;
  guestNameMessage.className = "account-message";

  if (type) {
    guestNameMessage.classList.add(type);
  }
}

function showLoggedIn(user, userData) {
  const displayName =
    userData?.displayName ||
    user.displayName ||
    "名無しプレイヤー";

  const iconPath =
    userData?.iconPath ||
    ICON_LIST[0];

  selectedIconPath = iconPath;

  if (accountLink) {
    accountLink.textContent = "my page";
    accountLink.href = "/account/";
  }

  if (guestArea) {
    guestArea.classList.add("hidden");
  }

  if (userArea) {
    userArea.classList.remove("hidden");
  }

  if (userName) {
    userName.textContent = displayName;
  }

  if (userEmail) {
    userEmail.textContent = user.email || "";
  }

  if (displayNameInput) {
    displayNameInput.value = displayName;
  }

  renderUserIcon(iconPath);
  renderIconOptions(iconPath);
}

function showLoggedOut() {
  if (accountLink) {
    accountLink.textContent = "login";
    accountLink.href = "/account/";
  }

  if (guestArea) {
    guestArea.classList.remove("hidden");
  }

  if (userArea) {
    userArea.classList.add("hidden");
  }

  if (userName) {
    userName.textContent = "---";
  }

  if (userEmail) {
    userEmail.textContent = "";
  }

  if (userIcon) {
    userIcon.textContent = "?";
  }

  if (displayNameInput) {
    displayNameInput.value = "";
  }

  if (iconOptions) {
    iconOptions.innerHTML = "";
  }

  showAccountMessage("", "");
}

function renderUserIcon(iconPath) {
  if (!userIcon) return;

  userIcon.innerHTML = `
    <img src="${iconPath}" alt="ユーザーアイコン">
  `;
}

function renderIconOptions(activeIconPath) {
  if (!iconOptions) return;

  iconOptions.innerHTML = "";

  ICON_LIST.forEach((iconPath) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "icon-option-btn";

    if (iconPath === activeIconPath) {
      button.classList.add("selected");
    }

    button.innerHTML = `
      <img src="${iconPath}" alt="">
    `;

    button.addEventListener("click", () => {
      selectedIconPath = iconPath;

      const buttons = iconOptions.querySelectorAll(".icon-option-btn");
      buttons.forEach((btn) => btn.classList.remove("selected"));

      button.classList.add("selected");
      renderUserIcon(iconPath);
    });

    iconOptions.appendChild(button);
  });
}

function showAccountMessage(message, type) {
  if (!accountMessage) return;

  accountMessage.textContent = message;
  accountMessage.className = "account-message";

  if (type) {
    accountMessage.classList.add(type);
  }
}
