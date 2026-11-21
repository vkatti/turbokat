// Static site build: content/*.md -> dist/*.html. Run `npm run build`.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import sharp from 'sharp';
import site from './site.config.js';
import { createMarkdown, escapeHtml } from './lib/markdown.js';
import * as T from './lib/templates.js';

const require = createRequire(import.meta.url);
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const CACHE = path.join(ROOT, '.cache');
const POSTS = path.join(ROOT, 'content/posts');
const version = Date.now().toString(36);
const started = performance.now();

sharp.cache(false);
const md = await createMarkdown();

// ------------------------------------------------------------ helpers
const write = (rel, content) => {
  const file = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};
const page = (rel, opts) => write(rel, T.layout(site, { version, ...opts }));
const pkgFile = (pkg, file) => path.join(path.dirname(require.resolve(`${pkg}/package.json`)), file);

/** Resize an image once and keep it in .cache so rebuilds stay fast. */
async function derived(src, name, fn) {
  const stat = fs.statSync(src);
  const out = path.join(CACHE, `${name}`);
  if (!fs.existsSync(out) || fs.statSync(out).mtimeMs < stat.mtimeMs) {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const buf = fs.readFileSync(src);
    // Animated GIF/WebP: the first frame is often blank, so take one ~60% of the way in.
    const { pages = 1 } = await sharp(buf).metadata();
    const img = pages > 1 ? sharp(buf, { page: Math.floor(pages * 0.6) }) : sharp(buf);
    await fn(img).toFile(out);
  }
  return out;
}

const plainText = (s) =>
  s.replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[#>*_`~|-]/g, ' ').replace(/\s+/g, ' ').trim();

// ------------------------------------------------------------ clean + static
fs.rmSync(DIST, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'public'), DIST, { recursive: true });
fs.mkdirSync(path.join(DIST, 'fonts'), { recursive: true });
for (const [pkg, file] of [
  ['@fontsource-variable/inter', 'inter-latin-wght-normal.woff2'],
  ['@fontsource-variable/jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2'],
]) fs.copyFileSync(pkgFile(pkg, `files/${file}`), path.join(DIST, 'fonts', file));
fs.cpSync(pkgFile('katex', 'dist/katex.min.css'), path.join(DIST, 'vendor/katex/katex.min.css'));
fs.cpSync(pkgFile('katex', 'dist/fonts'), path.join(DIST, 'vendor/katex/fonts'), { recursive: true });

// ------------------------------------------------------------ posts
const posts = [];
for (const slug of fs.readdirSync(POSTS)) {
  const dir = path.join(POSTS, slug);
  const file = path.join(dir, 'index.md');
  if (!fs.existsSync(file)) continue;
  const { data, content } = matter(fs.readFileSync(file, 'utf8'));
  if (data.draft) continue;
  const url = `/posts/${slug}/`;
  const rendered = md.render(content, { base: url });
  const date = new Date(`${data.date}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error(`${slug}: bad date "${data.date}" (use YYYY-MM-DD)`);
  const text = plainText(content);

  // copy assets (everything except the markdown)
  for (const f of fs.readdirSync(dir, { recursive: true }).map(String)) {
    const from = path.join(dir, f);
    if (f === 'index.md' || fs.statSync(from).isDirectory()) continue;
    fs.mkdirSync(path.join(DIST, url, path.dirname(f)), { recursive: true });
    fs.copyFileSync(from, path.join(DIST, url, f));
  }

  // card thumbnail (first frame, 720px) + social preview image (1200px jpg)
  let thumb = null, og = null;
  if (data.image && !/^https?:/.test(data.image)) {
    const src = path.join(dir, data.image);
    const t = await derived(src, `${slug}/thumb.webp`, (s) => s.resize({ width: 720, withoutEnlargement: true }).webp({ quality: 78 }));
    const o = await derived(src, `${slug}/og.jpg`, (s) => s.resize({ width: 1200, withoutEnlargement: true }).flatten({ background: '#ffffff' }).jpeg({ quality: 82 }));
    fs.copyFileSync(t, path.join(DIST, url, '_thumb.webp'));
    fs.copyFileSync(o, path.join(DIST, url, '_og.jpg'));
    thumb = `${url}_thumb.webp`;
    og = `${url}_og.jpg`;
  }

  posts.push({
    slug, url, date, text,
    title: data.title,
    subtitle: data.subtitle || '',
    description: data.description || '',
    descriptionHtml: data.description ? md.renderInline(data.description) : '',
    dateISO: date.toISOString().slice(0, 10),
    categories: data.categories || [],
    scripts: data.scripts || [],
    readingTime: Math.max(1, Math.round(text.split(' ').length / 220)),
    thumb, og,
    ...rendered,
  });
}
posts.sort((a, b) => b.date - a.date);

const catCounts = new Map();
posts.forEach((p) => p.categories.forEach((c) => catCounts.set(c, (catCounts.get(c) || 0) + 1)));
const categories = [...catCounts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

posts.forEach((post, i) => {
  const head = [
    `<meta property="article:published_time" content="${post.dateISO}">`,
    post.hasMath ? '<link rel="stylesheet" href="/vendor/katex/katex.min.css">' : '',
    ...post.scripts.map((s) => `<script src="${s}"></script>`),
  ].join('\n');
  const scripts = post.hasMermaid ? '<script type="module" src="/js/mermaid.js"></script>' : '';
  page(`${post.url}index.html`, {
    title: post.title,
    description: post.description || post.subtitle,
    path: post.url,
    image: post.og,
    type: 'article',
    head, scripts,
    bodyClass: 'page-post',
    body: T.postPage(site, { post, prev: posts[i + 1], next: posts[i - 1] }),
  });
});

// ------------------------------------------------------------ pages
const profileSrc = path.join(ROOT, 'public/images/profile.webp');
fs.copyFileSync(await derived(profileSrc, 'profile-sm.webp', (s) => s.resize({ width: 96 }).webp({ quality: 80 })), path.join(DIST, 'images/profile-sm.webp'));

page('index.html', { path: '/', bodyClass: 'page-home', body: T.homePage(site, { posts, categories, profile: '/images/profile.webp' }) });
page('blog/index.html', { title: 'Blog', description: 'All posts by Vishal Katti on R, Python, Excel and data.', path: '/blog/', bodyClass: 'page-blog', body: T.blogPage(site, { posts, categories }) });

const aboutSrc = matter(fs.readFileSync(path.join(ROOT, 'content/about.md'), 'utf8'));
const about = { data: aboutSrc.data, ...md.render(aboutSrc.content) };
page('about/index.html', { title: 'About', description: aboutSrc.data.description, path: '/about/', image: '/images/profile.webp', bodyClass: 'page-about', body: T.aboutPage(site, { about, profile: '/images/profile.webp' }) });
page('404.html', { title: 'Page not found', path: '/404.html', body: T.notFoundPage() });

// ------------------------------------------------------------ search index, feed, sitemap
write('search.json', JSON.stringify(posts.map((p) => ({ slug: p.slug, text: p.text.toLowerCase() }))));

const absolutize = (html) => html.replace(/(src|href)="\/(?!\/)/g, `$1="${site.url}/`);
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
<title>${escapeHtml(site.title)}</title>
<link>${site.url}/</link>
<atom:link href="${site.url}/index.xml" rel="self" type="application/rss+xml"/>
<description>${escapeHtml(site.description)}</description>
<language>${site.language}</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${posts.map((p) => `<item>
  <title>${escapeHtml(p.title)}</title>
  <dc:creator>${escapeHtml(site.author)}</dc:creator>
  <link>${site.url}${p.url}</link>
  <guid>${site.url}${p.url}</guid>
  <pubDate>${p.date.toUTCString()}</pubDate>
  ${p.categories.map((c) => `<category>${escapeHtml(c)}</category>`).join('')}
  <description><![CDATA[${absolutize(p.html).replace(/]]>/g, ']]]]><![CDATA[>')}]]></description>
  ${p.og ? `<media:content url="${site.url}${p.og}" medium="image" type="image/jpeg"/>` : ''}
</item>`).join('\n')}
</channel>
</rss>
`;
write('index.xml', rss);

const urls = ['/', '/blog/', '/about/', ...posts.map((p) => p.url)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${site.url}${u}</loc></url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);

console.log(`Built ${posts.length} posts + 4 pages into dist/ in ${Math.round(performance.now() - started)} ms`);
