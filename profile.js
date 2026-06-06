// profile.js

import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const profileArea = document.getElementById("profileArea");
const nicknameInput = document.getElementById("nicknameInput");
const avatarPreview = document.getElementById("avatarPreview");
const saveProfileBtn = document.getElementById("saveProfileBtn");

let currentType = "cat";
let currentColor = "pink";

function updateAvatarPreview() {
  avatarPreview.className = `avatar ${currentType} ${currentColor}`;
}

document.querySelectorAll(".avatarTypeBtn").forEach(button => {
  button.onclick = () => {
    currentType = button.dataset.type;
    updateAvatarPreview();

    document.querySelectorAll(".avatarTypeBtn").forEach(btn => {
      btn.classList.remove("selected");
    });

    button.classList.add("selected");
  };
});

document.querySelectorAll(".colorBtn").forEach(button => {
  button.onclick = () => {
    currentColor = button.dataset.color;
    updateAvatarPreview();

    document.querySelectorAll(".colorBtn").forEach(btn => {
      btn.classList.remove("selected");
    });

    button.classList.add("selected");
  };
});

onAuthStateChanged(auth, async user => {
  if (!user) {
    profileArea.classList.add("hidden");
    return;
  }

  profileArea.classList.remove("hidden");

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();

    nicknameInput.value = data.displayName || user.displayName || "";
    currentType = data.iconType || "cat";
    currentColor = data.iconColor || "pink";
  } else {
    nicknameInput.value = user.displayName || "";
    currentType = "cat";
    currentColor = "pink";
  }

  updateAvatarPreview();
  updateSelectedButtons();
});

saveProfileBtn.onclick = async () => {
  const user = auth.currentUser;

  if (!user) {
    alert("ログインしてから保存してね");
    return;
  }

  const displayName = nicknameInput.value.trim();

  if (!displayName) {
    alert("ニックネームを入れてね");
    return;
  }

  if (displayName.length > 16) {
    alert("ニックネームは16文字以内にしてね");
    return;
  }

  try {
    await updateProfile(user, {
      displayName
    });

    await setDoc(doc(db, "users", user.uid), {
      displayName,
      iconType: currentType,
      iconColor: currentColor,
      updatedAt: serverTimestamp()
    }, { merge: true });

    alert("プロフィールを保存したよ");
  } catch (error) {
    console.error(error);
    alert(`プロフィール保存エラー: ${error.message}`);
  }
};

function updateSelectedButtons() {
  document.querySelectorAll(".avatarTypeBtn").forEach(button => {
    button.classList.toggle("selected", button.dataset.type === currentType);
  });

  document.querySelectorAll(".colorBtn").forEach(button => {
    button.classList.toggle("selected", button.dataset.color === currentColor);
  });
}
