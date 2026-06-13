const siteHeader = document.getElementById("siteHeader");
const siteFooter = document.getElementById("siteFooter");

if (siteHeader) {
  siteHeader.innerHTML = `
    <header class="site-header">
      <div class="site-header-top">
        <a href="/" class="site-logo">
          shuyaku<span>.me</span>
        </a>

        <button type="button" class="menu-toggle" id="menuToggle" aria-label="メニューを開く">
          ☰
        </button>
      </div>

      <div class="site-menu" id="siteMenu">
        <nav class="site-nav">
          <a href="/games/">games</a>
          <a href="/rhythm/">rhythm</a>
          <a href="/battle/">battle</a>
          <a href="/party/">party</a>
        </nav>

        <div class="site-account">
          <a href="/account/" class="account-link" id="accountLink">login</a>
        </div>
      </div>
    </header>
  `;

  const menuToggle = document.getElementById("menuToggle");
  const siteMenu = document.getElementById("siteMenu");

  if (menuToggle && siteMenu) {
    menuToggle.addEventListener("click", () => {
      siteMenu.classList.toggle("open");
      menuToggle.textContent = siteMenu.classList.contains("open") ? "×" : "☰";
    });
  }
}

if (siteFooter) {
  siteFooter.innerHTML = `
    <footer class="site-footer">
      <div class="site-footer-inner">

        <div class="footer-brand">
          <a href="/" class="footer-logo">
            shuyaku<span>.me</span>
          </a>

          <p>
            ちょっと主役になれるゲームサイト。
          </p>
        </div>

        <nav class="footer-nav" aria-label="フッターナビゲーション">
          <a href="/">home</a>
          <a href="/games/">games</a>
          <a href="/rhythm/">rhythm</a>
          <a href="/battle/">battle</a>
          <a href="/party/">party</a>
          <a
  href="YOUR_GOOGLE_FORM_URL"
  target="_blank"
  rel="noopener noreferrer"
>
  feedback
</a>
          <a href="/terms/">terms</a>
          <a href="/privacy/">privacy</a>
        </nav>

        <div class="footer-credit">
          <p>Created by Lane</p>
          <p>Presented by ゆるおり</p>
        </div>

      </div>

      <p class="footer-copy">
        © 2026 shuyaku.me
      </p>
    </footer>
  `;
}
