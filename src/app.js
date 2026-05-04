const year = document.querySelector("#year");
const revealItems = document.querySelectorAll(".reveal");
const productCards = document.querySelectorAll(".product-card");

if (year) {
  year.textContent = new Date().getFullYear().toString();
}

if (revealItems.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
    },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

if (productCards.length > 0) {
  const setActiveProduct = (card) => {
    productCards.forEach((item) => item.classList.remove("is-active"));
    card.classList.add("is-active");
  };

  productCards.forEach((card, index) => {
    if (index === 0) {
      card.classList.add("is-active");
    }

    card.addEventListener("click", () => setActiveProduct(card));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActiveProduct(card);
      }
    });
  });
}
