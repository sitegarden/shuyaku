// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDz6g17mjCrESYQ_znto0kTC5UQiaKNwfs",
  authDomain: "battle-ranking.firebaseapp.com",
  projectId: "battle-ranking",
  storageBucket: "battle-ranking.firebasestorage.app",
  messagingSenderId: "975298375195",
  appId: "1:975298375195:web:5af145cfb12c5d29dfd2be"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
