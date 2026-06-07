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
const titleSelect = document.getElementById("titleSelect");

let currentIconCategory = "animal";
let currentIconId = "cat";
let currentType = "cat";
let currentColor = "pink";
let currentMbti = "estp";

function updateAvatarPreview() {
  if (currentIconCategory === "mbti") {
    avatarPreview.className = "";
    avatarPreview.innerHTML = `
      <img
        class="mbti-avatar-img"
        src="./assets/icons/mbti/${currentMbti}.png"
        alt="${currentMbti.toUpperCase()} icon"
      >
    `;

    return;
  }

  avatarPreview.className = `avatar ${currentType} ${currentColor}`;
  avatarPreview.innerHTML = `
    <span class="ear left"></span>
    <span class="ear right"></span>
    <span class="face">
      <span class="eye left"></span>
      <span class="eye right"></span>
      <span class="mouth"></span>
    </span>
  `;
}

document.querySelectorAll(".avatarTypeBtn").forEach(button => {
  button.onclick = () => {
    currentIconCategory = "animal";
    currentType = button.dataset.type;
    currentIconId = currentType;

    updateAvatarPreview();
    updateSelectedButtons();
  };
});

document.querySelectorAll(".colorBtn").forEach(button => {
  button.onclick = () => {
    currentIconCategory = "animal";
    currentColor = button.dataset.color;
    currentIconId = currentType;

    updateAvatarPreview();
    updateSelectedButtons();
  };
});

document.querySelectorAll(".mbtiIconBtn").forEach(button => {
  button.onclick = () => {
    currentIconCategory = "mbti";
    currentMbti = button.dataset.mbti;
    currentIconId = currentMbti;

    updateAvatarPreview();
    updateSelectedButtons();
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

    currentIconCategory = data.iconCategory || "animal";

    if (currentIconCategory === "mbti") {
      currentMbti = data.iconId || data.mbtiType || "estp";
      currentIconId = currentMbti;
      currentType = data.iconType || "cat";
      currentColor = data.iconColor || "pink";
    } else {
      currentType = data.iconType || data.iconId || "cat";
      currentColor = data.iconColor || "pink";
      currentIconId = currentType;
      currentMbti = data.mbtiType || "estp";
    }
  } else {
    nicknameInput.value = user.displayName || "";
    currentIconCategory = "animal";
    currentType = "cat";
    currentColor = "pink";
    currentIconId = "cat";
    currentMbti = "estp";
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

    const saveData = {
      displayName,
      iconCategory: currentIconCategory,
      iconId: currentIconId,
      iconType: currentType,
      iconColor: currentColor,
      mbtiType: currentMbti,
      selectedTitle: "PLAYER",
      unlockedTitles: ["PLAYER"],
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, "users", user.uid), saveData, { merge: true });

    alert("プロフィールを保存したよ");
  } catch (error) {
    console.error(error);
    alert(`プロフィール保存エラー: ${error.message}`);
  }
};

function updateSelectedButtons() {
  document.querySelectorAll(".avatarTypeBtn").forEach(button => {
    const isSelected =
      currentIconCategory === "animal" &&
      button.dataset.type === currentType;

    button.classList.toggle("selected", isSelected);
  });

  document.querySelectorAll(".colorBtn").forEach(button => {
    const isSelected =
      currentIconCategory === "animal" &&
      button.dataset.color === currentColor;

    button.classList.toggle("selected", isSelected);
  });

  document.querySelectorAll(".mbtiIconBtn").forEach(button => {
    const isSelected =
      currentIconCategory === "mbti" &&
      button.dataset.mbti === currentMbti;

    button.classList.toggle("selected", isSelected);
  });
}
