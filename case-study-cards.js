// Simple scroll-reveal for case study cards.
(() => {
  const cards = document.querySelectorAll('.case-study-card');
  if (!cards.length) return;

  if (!('IntersectionObserver' in window)) {
    cards.forEach(card => card.classList.add('cs-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('cs-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach(card => observer.observe(card));
})();
