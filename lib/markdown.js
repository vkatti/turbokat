import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import attrs from 'markdown-it-attrs';
import container from 'markdown-it-container';
import footnote from 'markdown-it-footnote';
import katex from '@vscode/markdown-it-katex';
import { createHighlighter } from 'shiki';

const LANGS = ['r', 'python', 'sql', 'bash', 'powershell', 'javascript', 'json', 'yaml', 'html', 'css', 'vb', 'markdown'];
const LANG_LABEL = { r: 'R', python: 'Python', sql: 'SQL', bash: 'Bash', powershell: 'PowerShell', javascript: 'JavaScript', json: 'JSON', yaml: 'YAML', html: 'HTML', css: 'CSS', vb: 'VBA', markdown: 'Markdown' };
const OUTPUT_LABEL = { output: 'Output', 'output-stderr': 'Message', 'output-warning': 'Warning', 'output-error': 'Error' };
const CALLOUTS = { NOTE: 'Note', TIP: 'Tip', IMPORTANT: 'Important', WARNING: 'Warning', CAUTION: 'Caution' };

export const escapeHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const slugify = (s) =>
  String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-');

const isRelative = (url) => url && !/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(url);

/** Create a renderer. Call `render(markdown, { base })` per document. */
export async function createMarkdown() {
  const highlighter = await createHighlighter({ themes: ['github-light', 'github-dark'], langs: LANGS });

  const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
  md.use(attrs, { allowedAttributes: ['id', 'class', 'width'] });
  md.use(anchor, {
    slugify,
    level: [2, 3, 4],
    permalink: anchor.permalink.linkInsideHeader({ symbol: '#', placement: 'after', class: 'heading-anchor', ariaHidden: true }),
  });
  md.use(footnote);
  md.use(katex.default ?? katex, { throwOnError: false });
  md.use(container, 'tabs', { render: (t, i) => (t[i].nesting === 1 ? '<div class="tabs">\n' : '</div>\n') });

  // ---- code fences: highlighted code, attached output blocks, mermaid ----
  md.renderer.rules.fence = (tokens, idx, _opts, env) => {
    const t = tokens[idx];
    const lang = t.info.trim().split(/\s+/)[0].toLowerCase();
    const code = t.content.replace(/\n$/, '');
    if (lang === 'mermaid') {
      env.hasMermaid = true;
      return `<pre class="mermaid">${escapeHtml(code)}</pre>\n`;
    }
    if (OUTPUT_LABEL[lang]) {
      return `<div class="code-output ${lang}"><span class="code-output-label">${OUTPUT_LABEL[lang]}</span><pre><code>${escapeHtml(code)}</code></pre></div>\n`;
    }
    const known = LANGS.includes(lang);
    const html = highlighter.codeToHtml(code, {
      lang: known ? lang : 'text',
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    });
    const label = LANG_LABEL[lang] || (lang ? lang.toUpperCase() : 'Code');
    return `<div class="code-block" data-lang="${escapeHtml(lang || 'text')}"><div class="code-head"><span>${escapeHtml(label)}</span><button class="copy-btn" type="button" aria-label="Copy code">Copy</button></div>${html}</div>\n`;
  };

  // ---- tables scroll horizontally on small screens ----
  md.renderer.rules.table_open = () => '<div class="table-wrap"><table>\n';
  md.renderer.rules.table_close = () => '</table></div>\n';

  // ---- relative links/images resolve against the post folder ----
  const rebase = (url, env) => (env.base && isRelative(url) ? env.base + url : url);
  const defaultLink = md.renderer.rules.link_open || ((t, i, o, e, s) => s.renderToken(t, i, o));
  md.renderer.rules.link_open = (tokens, idx, opts, env, self) => {
    const t = tokens[idx];
    t.attrSet('href', rebase(t.attrGet('href'), env));
    return defaultLink(tokens, idx, opts, env, self);
  };
  md.renderer.rules.image = (tokens, idx, _opts, env) => {
    const t = tokens[idx];
    const src = rebase(t.attrGet('src'), env);
    const alt = escapeHtml(t.content);
    const width = t.attrGet('width');
    const style = width ? ` style="width:${escapeHtml(/^\d+$/.test(width) ? width + 'px' : width)}"` : '';
    return `<img src="${escapeHtml(src)}" alt="${alt}" loading="lazy" decoding="async"${style}>`;
  };

  // ---- core rules: figures + GitHub-style callouts ----
  md.core.ruler.push('figures', (state) => {
    const tk = state.tokens;
    for (let i = 0; i < tk.length - 2; i++) {
      if (tk[i].type !== 'paragraph_open' || tk[i + 2].type !== 'paragraph_close') continue;
      const kids = (tk[i + 1].children || []).filter((c) => !(c.type === 'text' && !c.content.trim()) && c.type !== 'softbreak');
      if (kids.length !== 1 || kids[0].type !== 'image') continue;
      const img = kids[0];
      const id = img.attrGet('id');
      if (id) img.attrs = img.attrs.filter(([k]) => k !== 'id');
      const num = id && state.env.figures?.[id];
      const caption = img.content ? `<figcaption>${num ? `<strong>Figure ${num}:</strong> ` : ''}${md.renderInline(img.content)}</figcaption>` : '';
      const html = `<figure${id ? ` id="${escapeHtml(id)}"` : ''}>${md.renderer.rules.image([img], 0, md.options, state.env, md.renderer)}${caption}</figure>\n`;
      const block = new state.Token('html_block', '', 0);
      block.content = html;
      tk.splice(i, 3, block);
    }
  });

  md.core.ruler.push('callouts', (state) => {
    const tk = state.tokens;
    for (let i = 0; i < tk.length - 2; i++) {
      if (tk[i].type !== 'blockquote_open' || tk[i + 1].type !== 'paragraph_open') continue;
      const inline = tk[i + 2];
      const first = inline.children?.[0];
      const m = first?.type === 'text' && first.content.match(/^\[!(\w+)\]\s*/);
      if (!m || !CALLOUTS[m[1].toUpperCase()]) continue;
      const type = m[1].toUpperCase();
      // `> [!TIP] Custom title` -> custom title; bare `> [!TIP]` -> default label
      const custom = first.content.slice(m[0].length).trim();
      const cut = inline.children[1]?.type === 'softbreak' ? 2 : 1;
      inline.children.splice(0, cut);
      tk[i].attrJoin('class', `callout callout-${type.toLowerCase()}`);
      const title = new state.Token('html_block', '', 0);
      title.content = `<p class="callout-title${custom ? ' custom' : ''}">${custom ? escapeHtml(custom) : CALLOUTS[type]}</p>\n`;
      tk.splice(i + 1, 0, title);
    }
  });

  /** Render a document. Returns { html, toc, hasMermaid, hasMath }. */
  function render(src, { base = '' } = {}) {
    // Number figures in order of appearance, then turn @fig-x into links.
    const figures = {};
    let n = 0;
    for (const m of src.matchAll(/\{#(fig-[\w-]+)/g)) if (!figures[m[1]]) figures[m[1]] = ++n;
    src = src.replace(/(^|[\s(])@(fig-[\w-]+)/g, (all, pre, id) => (figures[id] ? `${pre}[Figure ${figures[id]}](#${id})` : all));

    const env = { base, figures, hasMermaid: false };
    const tokens = md.parse(src, env);

    const toc = [];
    let tabsDepth = 0;
    tokens.forEach((t, i) => {
      if (t.type === 'container_tabs_open') tabsDepth++;
      if (t.type === 'container_tabs_close') tabsDepth--;
      if (t.type === 'heading_open' && !tabsDepth && (t.tag === 'h2' || t.tag === 'h3')) {
        const text = tokens[i + 1].children.filter((c) => c.type === 'text' || c.type === 'code_inline').map((c) => c.content).join('').trim();
        toc.push({ level: Number(t.tag[1]), id: t.attrGet('id'), text });
      }
    });
    const html = md.renderer.render(tokens, md.options, env);
    return { html, toc, hasMermaid: env.hasMermaid, hasMath: /class="katex/.test(html) };
  }

  return { render, renderInline: (s) => md.renderInline(s) };
}
