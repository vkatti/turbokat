import { escapeHtml as e } from './markdown.js';
import { icon } from './icons.js';

const year = new Date().getFullYear();
const abs = (site, p) => (/^https?:/.test(p) ? p : site.url + p);
const ext = (link) => (link.external ? ' target="_blank" rel="noopener"' : '');

// ----------------------------------------------------------------- layout
export function layout(site, page) {
  const { title, description, path, image, type = 'website', body, head = '', scripts = '', bodyClass = '' } = page;
  const fullTitle = title ? `${title} · ${site.title}` : `${site.title} · Data, code and the messy bits in between`;
  const ogImage = abs(site, image || '/images/og-default.png');
  const url = abs(site, path);
  const navLinks = site.nav
    .map((l) => `<a href="${l.href}"${ext(l)}${path.startsWith(l.href) && !l.external ? ' aria-current="page"' : ''}>${e(l.text)}${l.external ? icon('arrow-up-right', { size: 14 }) : ''}</a>`)
    .join('');

  return `<!doctype html>
<html lang="${site.language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(fullTitle)}</title>
<meta name="description" content="${e(description || site.description)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0b0b0f" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${e(title || site.title)}">
<meta property="og:description" content="${e(description || site.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImage}">
<meta property="og:site_name" content="${e(site.title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="${site.twitter}">
<meta name="twitter:creator" content="${site.twitter}">
<link rel="icon" href="/images/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/images/favicon.png">
<link rel="alternate" type="application/rss+xml" title="${e(site.title)}" href="/index.xml">
<link rel="preload" href="/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/site.css?v=${page.version}">
<script>(function(){var t;try{t=localStorage.getItem('theme')}catch(e){}if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t})()</script>
${head}
</head>
<body class="${bodyClass}">
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="/" aria-label="${e(site.title)}, home">
      <img src="/images/logo.png" alt="" width="28" height="28">
      <span>${e(site.title)}</span>
    </a>
    <nav class="site-nav" id="site-nav" aria-label="Main">
      ${navLinks}
    </nav>
    <div class="header-actions">
      <button class="icon-btn theme-toggle" type="button" aria-label="Toggle dark mode">${icon('sun')}${icon('moon')}</button>
      <button class="icon-btn menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav">${icon('menu')}</button>
    </div>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="container footer-inner">
    <div>
      <a class="brand" href="/"><img src="/images/logo.png" alt="" width="24" height="24"><span>${e(site.title)}</span></a>
      <p class="muted small">© ${year} ${e(site.author)}. Words licensed <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.</p>
    </div>
    <div class="footer-links">
      ${site.social.map((s) => `<a class="icon-btn" href="${s.href}" target="_blank" rel="noopener${s.rel ? ' ' + s.rel : ''}" title="${e(s.name)}">${icon(s.icon, { label: s.name })}</a>`).join('')}
      <a class="icon-btn" href="/index.xml" title="RSS feed">${icon('rss', { label: 'RSS feed' })}</a>
    </div>
  </div>
</footer>
<script src="/js/site.js?v=${page.version}" defer></script>
${scripts}
</body>
</html>
`;
}

// ----------------------------------------------------------------- pieces
const fmtDate = (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

const tags = (cats, linked = true) =>
  `<ul class="tags">${cats.map((c) => `<li>${linked ? `<a class="tag" href="/blog/#category=${encodeURIComponent(c)}">${e(c)}</a>` : `<span class="tag">${e(c)}</span>`}</li>`).join('')}</ul>`;

export function postCard(p, { headingLevel = 3 } = {}) {
  const h = `h${headingLevel}`;
  return `<article class="card" data-categories="${e(p.categories.join('|'))}" data-slug="${p.slug}" data-text="${e([p.title, p.subtitle, p.description, ...p.categories].join(' ').toLowerCase())}">
  <a class="card-media" href="${p.url}" tabindex="-1" aria-hidden="true">${p.thumb ? `<img src="${p.thumb}" alt="" loading="lazy" decoding="async">` : ''}</a>
  <div class="card-body">
    <p class="meta"><time datetime="${p.dateISO}">${fmtDate(p.date)}</time><span aria-hidden="true">·</span><span>${p.readingTime} min read</span></p>
    <${h} class="card-title"><a href="${p.url}">${e(p.title)}</a></${h}>
    ${p.subtitle ? `<p class="card-sub">${e(p.subtitle)}</p>` : ''}
    ${tags(p.categories, false)}
  </div>
</article>`;
}

// ----------------------------------------------------------------- pages
export function homePage(site, { posts, categories, profile }) {
  const latest = posts.slice(0, 3);
  return `
<section class="hero">
  <div class="container hero-inner">
    <div class="hero-copy">
      <p class="eyebrow">Hi, I'm Vishal 👋</p>
      <h1>I write about data, code and the messy bits in between.</h1>
      <p class="lead">R, Python, Excel and the occasional rant about date formats. I've spent over 15 years working with data, from business analysis to data science, and this is where I write down what I learn along the way.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="/blog/">Read the blog ${icon('arrow-right', { size: 16 })}</a>
        <a class="btn btn-ghost" href="/about/">About me</a>
      </div>
    </div>
    <div class="hero-art" aria-hidden="true">
      <div class="hero-photo"><img src="${profile}" alt="" width="320" height="320"></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head">
      <h2>Latest writing</h2>
      <a class="link-arrow" href="/blog/">All ${posts.length} posts ${icon('arrow-right', { size: 16 })}</a>
    </div>
    <div class="card-grid">${latest.map((p) => postCard(p)).join('\n')}</div>
  </div>
</section>

<section class="section section-soft">
  <div class="container">
    <div class="section-head"><h2>What I write about</h2></div>
    <ul class="topic-cloud">
      ${categories.slice(0, 12).map(([c, n]) => `<li><a class="tag tag-lg" href="/blog/#category=${encodeURIComponent(c)}">${e(c)}<span class="count">${n}</span></a></li>`).join('')}
      ${categories.length > 12 ? `<li><a class="tag tag-lg" href="/blog/">+${categories.length - 12} more</a></li>` : ''}
    </ul>
  </div>
</section>`;
}

export function blogPage(site, { posts, categories }) {
  return `
<section class="page-head">
  <div class="container">
    <h1>Blog</h1>
    <p class="lead">Tutorials, deep dives and opinions on R, Python, Excel and working with data.</p>
    <div class="blog-tools">
      <label class="search">
        ${icon('search', { size: 18 })}
        <span class="sr-only">Search posts</span>
        <input id="post-search" type="search" placeholder="Search posts…" autocomplete="off">
        <kbd>/</kbd>
      </label>
      <div class="chips" role="group" aria-label="Filter by category">
        <button class="chip" type="button" data-category="" aria-pressed="true">All <span class="count">${posts.length}</span></button>
        ${categories.map(([c, n]) => `<button class="chip" type="button" data-category="${e(c)}" aria-pressed="false">${e(c)} <span class="count">${n}</span></button>`).join('')}
      </div>
    </div>
  </div>
</section>
<section class="section section-tight">
  <div class="container">
    <p class="muted small" id="result-count" aria-live="polite"></p>
    <div class="card-grid" id="post-grid">${posts.map((p) => postCard(p, { headingLevel: 2 })).join('\n')}</div>
    <p class="empty" id="no-results" hidden>No posts match that. Try another word or category.</p>
  </div>
</section>`;
}

export function postPage(site, { post, prev, next }) {
  const shareUrl = encodeURIComponent(site.url + post.url);
  const shareText = encodeURIComponent(post.title);
  const share = [
    ['X', 'x-twitter', `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}&via=${site.twitter.slice(1)}`],
    ['LinkedIn', 'linkedin', `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`],
    ['Reddit', 'reddit', `https://www.reddit.com/submit?url=${shareUrl}&title=${shareText}`],
    ['Facebook', 'facebook', `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`],
    ['Email', 'mail', `mailto:?subject=${shareText}&body=${shareUrl}`],
  ];
  const y = post.date.getUTCFullYear();
  const bibKey = `katti${y}`;
  const toc = post.toc.length > 1
    ? `<nav class="toc" aria-label="On this page"><p class="toc-title">On this page</p><ul>${post.toc.map((h) => `<li class="lvl-${h.level}"><a href="#${h.id}">${e(h.text)}</a></li>`).join('')}</ul></nav>`
    : '';

  return `
<article class="post">
  <header class="post-header">
    <div class="container narrow">
      <a class="back-link" href="/blog/">${icon('arrow-right', { size: 14 })}All posts</a>
      ${tags(post.categories)}
      <h1>${e(post.title)}</h1>
      ${post.subtitle ? `<p class="post-sub">${e(post.subtitle)}</p>` : ''}
      <div class="post-meta">
        <img src="/images/profile-sm.webp" alt="" width="36" height="36">
        <span><strong>${e(site.author)}</strong><br><time datetime="${post.dateISO}">${fmtDate(post.date)}</time> · ${post.readingTime} min read</span>
      </div>
    </div>
  </header>
  <div class="container post-layout${toc ? '' : ' no-toc'}">
    <aside class="post-aside">${toc}</aside>
    <div class="post-main">
      ${post.description ? `<div class="abstract"><p class="abstract-label">TL;DR</p><p>${post.descriptionHtml}</p></div>` : ''}
      <div class="prose">
${post.html}
      </div>
      <footer class="post-footer">
        <div class="share">
          <span class="share-label">Share</span>
          ${share.map(([n, ic, href]) => `<a class="icon-btn" href="${href}" target="_blank" rel="noopener" title="Share on ${n}">${icon(ic, { label: `Share on ${n}` })}</a>`).join('')}
          <button class="icon-btn copy-link" type="button" title="Copy link" data-url="${site.url}${post.url}">${icon('link', { label: 'Copy link' })}</button>
        </div>
        <details class="citation">
          <summary>Reuse &amp; citation</summary>
          <p>Text and figures are licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Please cite this work as:</p>
          <p class="cite-text">Katti, Vishal. ${y}. “${e(post.title)}.” ${fmtDate(post.date)}. <a href="${site.url}${post.url}">${site.url}${post.url}</a>.</p>
          <pre><code>@online{${bibKey},
  author = {Katti, Vishal},
  title = {${e(post.title)}},
  date = {${post.dateISO}},
  url = {${site.url}${post.url}},
  langid = {en}
}</code></pre>
        </details>
        <nav class="post-nav" aria-label="More posts">
          ${prev ? `<a class="post-nav-link" href="${prev.url}"><span class="muted small">← Older</span><span>${e(prev.title)}</span></a>` : '<span></span>'}
          ${next ? `<a class="post-nav-link next" href="${next.url}"><span class="muted small">Newer →</span><span>${e(next.title)}</span></a>` : '<span></span>'}
        </nav>
        ${site.comments ? `<section class="comments" id="comments" data-repo="${site.comments.repo}" data-issue-term="${site.comments.issueTerm}" data-label="${e(site.comments.label)}"><h2>Comments</h2><div class="comments-slot"></div></section>` : ''}
      </footer>
    </div>
  </div>
</article>`;
}

export function aboutPage(site, { about, profile }) {
  const timeline = (items) =>
    `<ol class="timeline">${items
      .map((it) => `<li><div class="tl-org"><h3>${e(it.org)}</h3><p class="muted small">${e(it.place)}</p></div><ul class="tl-roles">${it.roles
        .map((r) => `<li><span class="tl-role">${e(r.title)}</span><span class="tl-when">${e(r.when)}</span></li>`)
        .join('')}</ul></li>`)
      .join('')}</ol>`;
  return `
<section class="about-hero">
  <div class="container about-inner">
    <div class="about-photo"><img src="${profile}" alt="Vishal Katti" width="280" height="280"></div>
    <div>
      <p class="eyebrow">About</p>
      <h1>${e(site.author)}</h1>
      <div class="prose lead-prose">${about.html}</div>
      <div class="hero-actions">
        <a class="btn btn-primary" href="${site.cv}" target="_blank" rel="noopener">${icon('file-text', { size: 16 })}Download CV</a>
      </div>
      <div class="social-row">
        ${site.social.map((s) => `<a class="icon-btn" href="${s.href}" target="_blank" rel="noopener${s.rel ? ' ' + s.rel : ''}" title="${e(s.name)}">${icon(s.icon, { label: s.name })}</a>`).join('')}
      </div>
    </div>
  </div>
</section>
<section class="section">
  <div class="container about-grid">
    <div><h2>Work</h2>${timeline(about.data.work)}</div>
    <div><h2>Education</h2>${timeline(about.data.education)}</div>
  </div>
</section>`;
}

export function notFoundPage() {
  return `
<section class="page-head center">
  <div class="container narrow">
    <p class="eyebrow">404</p>
    <h1>This page wandered off.</h1>
    <p class="lead">The link may be old, or the post may have moved. Try the blog, or head home.</p>
    <div class="hero-actions center">
      <a class="btn btn-primary" href="/blog/">Browse the blog</a>
      <a class="btn btn-ghost" href="/">Go home</a>
    </div>
  </div>
</section>`;
}
