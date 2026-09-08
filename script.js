const panels = {
  projects: 'tab-projects',
  about: 'tab-about',
  resume: 'tab-resume',
};

function moveHighlight(btn) {
  const nav = document.getElementById('siteNav');
  const pill = document.getElementById('navHighlight');
  if (!pill || !nav) return;
  const navRect = nav.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();
  pill.style.left = (btnRect.left - navRect.left) + 'px';
  pill.style.width = btnRect.width + 'px';
  pill.classList.remove('pop');
  void pill.offsetWidth;
  pill.classList.add('pop');
}

function switchTab(btn) {
  window.scrollTo({ top: 0, behavior: 'auto' });
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  moveHighlight(btn);
  const key = btn.dataset.tab;
  Object.values(panels).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  document.querySelectorAll('[id^="tab-case-"]').forEach(el => el.classList.remove('active'));
  const target = panels[key];
  if (target) document.getElementById(target).classList.add('active');
}

function switchTabByName(name) {
  const btn = document.querySelector(`[data-tab="${name}"]`);
  if (btn) switchTab(btn);
}

function openCase(slug) {
  window.scrollTo({ top: 0, behavior: 'auto' });
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const caseEl = document.getElementById('tab-case-' + slug);
  if (caseEl) caseEl.classList.add('active');
  requestAnimationFrame(updateCaseToc);
}

// Sticky TOC scrollspy for case study pages
function updateCaseToc() {
  const panel = document.querySelector('.panel.active[id^="tab-case-"]');
  if (!panel) return;
  const toc = panel.querySelectorAll('.case-toc-link');
  const sections = panel.querySelectorAll('.case-section[id]');
  if (!toc.length || !sections.length) return;
  const threshold = 140;
  let currentId = sections[0].id;
  sections.forEach(sec => {
    if (sec.getBoundingClientRect().top - threshold <= 0) currentId = sec.id;
  });
  toc.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
  });
}
window.addEventListener('scroll', () => requestAnimationFrame(updateCaseToc), { passive: true });

// TOC links: scroll to the target section within the currently active case panel
document.addEventListener('click', (e) => {
  const link = e.target.closest('.case-toc-link');
  if (!link) return;
  const panel = link.closest('.panel');
  if (!panel) return;
  const id = link.getAttribute('href').slice(1);
  const target = panel.querySelector('#' + id);
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Position highlight on load
window.addEventListener('load', () => {
  const activeBtn = document.querySelector('.tab-btn.active');
  if (activeBtn) moveHighlight(activeBtn);
});

// Feedback carousel dots + slow autoplay
(() => {
  const carousel = document.querySelector('.feedback-carousel');
  const grid = document.getElementById('feedback-grid');
  const prevBtn = document.getElementById('feedbackPrev');
  const nextBtn = document.getElementById('feedbackNext');
  if (!carousel || !grid) return;
  const cards = Array.from(grid.children);
  let originalWidth = 0;
  let cloned = false;

  // Append a duplicate of the card set right after the originals, so autoplay
  // can wrap scrollLeft back by exactly originalWidth for a seamless infinite loop
  // (the clone lines up pixel-for-pixel with the originals, so the jump is invisible).
  function cloneForLoop() {
    if (cloned) return;
    const w = grid.scrollWidth;
    if (w <= 0) return;
    originalWidth = w;
    cards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.removeAttribute('id');
      grid.appendChild(clone);
    });
    cloned = true;
  }

  new ResizeObserver(cloneForLoop).observe(carousel);
  cloneForLoop();

  // Slow infinite-loop autoplay: keeps scrolling forward through the cloned
  // set, then wraps scrollLeft back by exactly one set-width once it's fully
  // past the originals — an instant, invisible jump since the clone is identical.
  // Scroll-snap fights sub-pixel autoplay increments, so it stays disabled.
  const SPEED = 0.3;
  let paused = false;
  let resumeTimer = null;
  carousel.style.scrollSnapType = 'none';

  function step() {
    if (!paused && cloned) {
      carousel.scrollLeft += SPEED;
      if (carousel.scrollLeft >= originalWidth) carousel.scrollLeft -= originalWidth;
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  function pauseAutoplay() { paused = true; }
  function resumeAutoplay() { paused = false; }
  function scheduleResume() {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(resumeAutoplay, 1500);
  }

  carousel.addEventListener('mouseenter', pauseAutoplay);
  carousel.addEventListener('mouseleave', () => { clearTimeout(resumeTimer); resumeAutoplay(); });

  function scrollByCard(dir) {
    if (!cards.length) return;
    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(grid).gap) || 0;
    let left = carousel.scrollLeft + dir * (cardWidth + gap);
    if (left < 0) left += originalWidth;
    if (left >= originalWidth) left -= originalWidth;
    pauseAutoplay();
    carousel.scrollTo({ left, behavior: 'smooth' });
    scheduleResume();
  }
  if (prevBtn) prevBtn.addEventListener('click', () => scrollByCard(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => scrollByCard(1));
})();

// Sticky header: show near the top or when scrolling up, hide when scrolling down
(() => {
  const header = document.getElementById('siteHeader');
  if (!header) return;
  let lastY = window.scrollY;
  header.classList.add('header-visible');
  function onScroll() {
    const y = window.scrollY;
    if (y <= 8 || y < lastY) {
      header.classList.add('header-visible');
    } else if (y > lastY) {
      header.classList.remove('header-visible');
    }
    header.classList.toggle('scrolled', y > 8);
    lastY = y;
  }
  window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
})();

// Lightbox: click a case study image to expand it full-screen
(() => {
  const overlay = document.createElement('div');
  overlay.className = 'img-lightbox';
  overlay.innerHTML = '<img alt="">';
  document.body.appendChild(overlay);
  const lightboxImg = overlay.querySelector('img');

  function closeLightbox() { overlay.classList.remove('open'); }

  document.addEventListener('click', (e) => {
    const img = e.target.closest('.case-img img, .case-hero-image img');
    if (img) {
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt || '';
      overlay.classList.add('open');
      return;
    }
    if (overlay.classList.contains('open')) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
})();

