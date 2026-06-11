const siteHeader = document.getElementById("siteHeader");
const siteFooter = document.getElementById("siteFooter");

if (siteHeader) {
  siteHeader.innerHTML = `
    <header class="site-header">
      <a href="/" class="site-logo">
        shuyaku<span>.me</span>
      </a>

      <nav class="site-nav">
        <a href="/games/">games</a>
        <a href="/rhythm/">rhythm</a>
        <a href="/battle/">battle</a>
        <a href="/party/">party</a>
      </nav>

      <div class="site-account">
        <a href="/account/" class="account-link" id="accountLink">login</a>
      </div>
    </header>
  `;
}

if (siteFooter) {
  siteFooter.innerHTML = `
    <footer class="site-footer">
      <p>© shuyaku.me</p>
    </footer>
  `;
}
