// Small, framework-free enhancements. Every feature checks for its elements first.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;

  // ------------------------------------------------ theme toggle
  const setTheme = (t) => {
    root.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (e) {}
    const frame = $('.utterances-frame');
    if (frame) frame.contentWindow.postMessage({ type: 'set-theme', theme: t === 'dark' ? 'github-dark' : 'github-light' }, 'https://utteranc.es');
    document.dispatchEvent(new CustomEvent('themechange', { detail: t }));
  };
  $('.theme-toggle')?.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  // ------------------------------------------------ mobile menu
  const menuBtn = $('.menu-toggle');
  const nav = $('#site-nav');
  menuBtn?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav?.classList.contains('open')) { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.focus(); }
  });

  // ------------------------------------------------ old Quarto category links: /#category=R
  if (location.pathname === '/' && location.hash.startsWith('#category=')) location.replace('/blog/' + location.hash);

  // ------------------------------------------------ copy buttons
  const flash = (btn, text) => {
    const old = btn.textContent;
    btn.classList.add('copied');
    if (text) btn.textContent = text;
    setTimeout(() => { btn.classList.remove('copied'); if (text) btn.textContent = old; }, 1600);
  };
  $$('.copy-btn').forEach((btn) => btn.addEventListener('click', async () => {
    const code = btn.closest('.code-block').querySelector('pre').innerText;
    try { await navigator.clipboard.writeText(code); flash(btn, 'Copied!'); } catch (e) { flash(btn, 'Press Ctrl+C'); }
  }));
  $$('.copy-link').forEach((btn) => btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(btn.dataset.url); flash(btn); } catch (e) {}
  }));

  // ------------------------------------------------ tabs (::: tabs with ### headings)
  $$('.prose .tabs').forEach((box, n) => {
    const heads = $$(':scope > h3', box);
    if (!heads.length) return;
    const navEl = document.createElement('div');
    navEl.className = 'tabs-nav';
    navEl.setAttribute('role', 'tablist');
    const panels = heads.map((h, i) => {
      const panel = document.createElement('div');
      panel.className = 'tabs-panel';
      panel.id = `tab-${n}-${i}`;
      panel.setAttribute('role', 'tabpanel');
      let el = h.nextElementSibling;
      while (el && el.tagName !== 'H3') { const nx = el.nextElementSibling; panel.appendChild(el); el = nx; }
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-controls', panel.id);
      b.textContent = h.textContent.replace(/#\s*$/, '').trim();
      b.addEventListener('click', () => select(i));
      navEl.appendChild(b);
      return panel;
    });
    const select = (i) => panels.forEach((p, j) => { p.hidden = i !== j; navEl.children[j].setAttribute('aria-selected', i === j); });
    box.prepend(navEl);
    panels.forEach((p) => box.appendChild(p));
    box.classList.add('ready');
    select(0);
  });

  // ------------------------------------------------ table-of-contents scrollspy
  const tocLinks = $$('.toc a');
  if (tocLinks.length) {
    const pairs = tocLinks.map((a) => [document.getElementById(decodeURIComponent(a.hash.slice(1))), a]).filter(([h]) => h);
    let ticking = false;
    const update = () => {
      ticking = false;
      const line = window.innerHeight * 0.3;
      let current = null;
      for (const [h, a] of pairs) if (h.getBoundingClientRect().top < line) current = a;
      tocLinks.forEach((a) => a.classList.toggle('active', a === current));
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  // ------------------------------------------------ blog: search + category filter
  const grid = $('#post-grid');
  if (grid) {
    const cards = $$('.card', grid);
    const input = $('#post-search');
    const chips = $$('.chip');
    const count = $('#result-count');
    const empty = $('#no-results');
    let fullText = null;
    let category = '';

    const apply = () => {
      const q = input.value.trim().toLowerCase();
      const words = q.split(/\s+/).filter(Boolean);
      let shown = 0;
      cards.forEach((c) => {
        const inCat = !category || c.dataset.categories.split('|').includes(category);
        const hay = c.dataset.text + ' ' + (fullText?.get(c.dataset.slug) || '');
        const match = words.every((w) => hay.includes(w));
        c.hidden = !(inCat && match);
        if (!c.hidden) shown++;
      });
      chips.forEach((b) => b.setAttribute('aria-pressed', b.dataset.category === category));
      empty.hidden = shown > 0;
      count.textContent = q || category ? `${shown} of ${cards.length} posts` : '';
    };
    const setCategory = (c, push = true) => {
      category = c;
      if (push) history.replaceState(null, '', c ? `#category=${encodeURIComponent(c)}` : location.pathname);
      apply();
    };
    const fromHash = () => {
      const m = location.hash.match(/^#category=(.+)$/);
      setCategory(m ? decodeURIComponent(m[1]) : '', false);
    };
    chips.forEach((b) => b.addEventListener('click', () => setCategory(b.dataset.category === category ? '' : b.dataset.category)));
    input.addEventListener('input', apply);
    input.addEventListener('focus', () => {
      if (fullText) return;
      fullText = new Map();
      fetch('/search.json').then((r) => r.json()).then((rows) => { rows.forEach((r) => fullText.set(r.slug, r.text)); apply(); }).catch(() => {});
    }, { once: true });
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== input && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); }
    });
    window.addEventListener('hashchange', fromHash);
    fromHash();
  }

  // ------------------------------------------------ comments (utterances), loaded when scrolled near
  const comments = $('#comments');
  if (comments) {
    const load = () => {
      const s = document.createElement('script');
      s.src = 'https://utteranc.es/client.js';
      s.async = true;
      s.crossOrigin = 'anonymous';
      s.setAttribute('repo', comments.dataset.repo);
      s.setAttribute('issue-term', comments.dataset.issueTerm);
      s.setAttribute('label', comments.dataset.label);
      s.setAttribute('theme', root.dataset.theme === 'dark' ? 'github-dark' : 'github-light');
      $('.comments-slot', comments).appendChild(s);
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { io.disconnect(); load(); } }, { rootMargin: '400px' });
      io.observe(comments);
    } else load();
  }
})();
