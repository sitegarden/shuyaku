// auth.js

import { auth, db } from "./firebase.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const displayNameInput = document.getElementById("displayNameInput");

const registerBtn = document.getElementById("registerBtn");
const emailLoginBtn = document.getElementById("emailLoginBtn");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const userName = document.getElementById("userName");
const authForm = document.getElementById("authForm");

const provider = new GoogleAuthProvider();

registerBtn.onclick = async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const displayName = displayNameInput.value.trim();

  if (!email || !password || !displayName) {
    alert("メール・パスワード・表示名を入れてくれ");
    return;
  }

  const result = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(result.user, {
    displayName
  });

  await saveUserData(result.user.uid, {
    displayName,
    email
  });

  alert("登録できた");
};

emailLoginBtn.onclick = async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("メールとパスワードを入れてくれ");
    return;
  }

  await signInWithEmailAndPassword(auth, email, password);
};

googleLoginBtn.onclick = async () => {
  const result = await signInWithPopup(auth, provider);

  const user = result.user;

  await saveUserData(user.uid, {
    displayName: user.displayName || "名無し",
    email: user.email || ""
  });
};

logoutBtn.onclick = async () => {
  await signOut(auth);
};

onAuthStateChanged(auth, user => {
  if (user) {
    authForm.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    userName.textContent = `${user.displayName || "名無し"} でログイン中`;
  } else {
    authForm.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    userName.textContent = "ゲストプレイ中";
  }
});

async function saveUserData(uid, data) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    return;
  }

  await setDoc(userRef, {
    displayName: data.displayName,
    email: data.email,
    createdAt: serverTimestamp()
  });
}
