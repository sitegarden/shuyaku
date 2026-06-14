import { auth } from "/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const adminApp = document.getElementById("adminApp");

const ADMIN_UIDS = [
  "XR2TdWisrKXvJqz8EGqttOhJwLG3"
];

onAuthStateChanged(auth, (user) => {
  if (!user) {
    adminApp.innerHTML = `
      <section class="card">
        <h1>ログインが必要です</h1>
        <p>ここは管理人専用の制作室です。</p>
        <a class="button" href="/login.html">ログインする</a>
      </section>
    `;
    return;
  }

  if (!ADMIN_UIDS.includes(user.uid)) {
    adminApp.innerHTML = `
      <section class="card">
        <h1>入室できません</h1>
        <p>ここから先は管理人だけが入れます。</p>
        <a class="button" href="/">トップへ戻る</a>
      </section>
    `;
    return;
  }

  showAdminRoom(user);
});

function showAdminRoom(user) {
  adminApp.innerHTML = `
    <section class="card">
      <h1>SHUYAKU QUEST 制作室</h1>
      <p>管理人ログイン確認済み。</p>
      <p>UID：${user.uid}</p>

      <div class="menu">
        <button>ストーリー編集</button>
        <button>敵データ編集</button>
        <button>マップ編集</button>
        <button>テストプレイ</button>
      </div>

      <div class="log">
        まずはここに管理機能を増やしていく。
      </div>
    </section>
  `;
}
