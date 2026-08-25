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

// Position highlight on load
window.addEventListener('load', () => {
  const activeBtn = document.querySelector('.tab-btn.active');
  if (activeBtn) moveHighlight(activeBtn);
});

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
    lastY = y;
  }
  window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
})();

