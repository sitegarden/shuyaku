// battle/firebase.js

import { app } from "../js/firebase.js";

import {
  getDatabase,
  ref,
  set,
  update,
  get,
  onValue,
  off,
  remove,
  serverTimestamp,
  onDisconnect
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

export const rtdb = getDatabase(app);

export {
  ref,
  set,
  update,
  get,
  onValue,
  off,
  remove,
  serverTimestamp,
  onDisconnect
};
