// event.js

const touchItems = document.querySelectorAll(
  ".event-main-btn, .event-sub-btn, .event-game-card"
);

touchItems.forEach((item) => {
  item.addEventListener("touchstart", () => {
    item.classList.add("is-touching");
  });

  item.addEventListener("touchend", () => {
    item.classList.remove("is-touching");
  });

  item.addEventListener("touchcancel", () => {
    item.classList.remove("is-touching");
  });
});
