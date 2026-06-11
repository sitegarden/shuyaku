// auth.js

import { auth, db } from "./firebase.js";

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
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const provider = new GoogleAuthProvider();

const accountLink = document.getElementById("accountLink");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const guestArea = document.getElementById("guestArea");
const userArea = document.getElementById("userArea");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userIcon = document.getElementById("userIcon");

if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      await saveUserData(result.user);
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

onAuthStateChanged(auth, async (user) => {
  if (user) {
    await saveUserData(user);
    showLoggedIn(user);
  } else {
    showLoggedOut();
  }
});

async function saveUserData(user) {
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
    iconType: "cat",
    iconColor: "pink",
    title: "player",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

function showLoggedIn(user) {
  const name = user.displayName || "名無しプレイヤー";

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
    userName.textContent = name;
  }

  if (userEmail) {
    userEmail.textContent = user.email || "";
  }

  if (userIcon) {
    if (user.photoURL) {
      userIcon.innerHTML = `<img src="${user.photoURL}" alt="">`;
    } else {
      userIcon.textContent = name.slice(0, 1);
    }
  }
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
}
