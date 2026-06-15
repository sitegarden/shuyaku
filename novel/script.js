document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("a[href^='#']");

  buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const targetId = button.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });
});
