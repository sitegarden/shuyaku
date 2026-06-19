// event.js

const gameCards = document.querySelectorAll(".event-game-card");

gameCards.forEach((card) => {
  card.addEventListener("touchstart", () => {
    card.classList.add("is-touching");
  });

  card.addEventListener("touchend", () => {
    card.classList.remove("is-touching");
  });

  card.addEventListener("touchcancel", () => {
    card.classList.remove("is-touching");
  });
});
