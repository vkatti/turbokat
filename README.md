# vishalkatti.com

Personal website and blog. Plain Markdown in, plain HTML out. A ~200-line Node
build script, one stylesheet, a little vanilla JS. No framework.

## Run it locally

```bash
npm install
npm run dev      # builds, serves http://localhost:4200, rebuilds on every save
npm run build    # one-off build into dist/
```

Netlify runs `npm run build` and publishes `dist/` (see `netlify.toml`).

## Write a new post

Create `content/posts/<slug>/index.md`. The folder name becomes the URL
(`/posts/<slug>/`). Put images and downloads next to it and link them relatively.

```markdown
---
title: My new post
subtitle: Optional one-liner under the title
description: One or two sentences. Shown as the TL;DR and in link previews.
date: 2026-11-21            # always YYYY-MM-DD
image: cover.png            # card thumbnail + social preview (auto-resized)
categories: [R, Excel]
draft: true                 # optional: hide until ready
---

Your post starts here.
```

### What you can use in a post

| Want | Write |
|---|---|
| Code | <code>```r</code> / <code>```python</code> / <code>```sql</code> … |
| Code output (attaches under the code) | <code>```output</code>, <code>```output-warning</code>, <code>```output-error</code> |
| Figure with caption | `![Caption text](images/pic.png)` (an image on its own line) |
| Numbered figure + reference | `![Caption](pic.png){#fig-sales}` then `see @fig-sales` → “see Figure 1” |
| Image width | `![Caption](pic.png){width="60%"}` |
| Callout | `> [!TIP]` / `> [!NOTE]` / `> [!WARNING]` / `> [!CAUTION]`, optional title after it |
| Tabs | `::: tabs` … `### Tab one` … `### Tab two` … `:::` |
| Maths | `$inline$` and `$$ display $$` (KaTeX, rendered at build time) |
| Diagrams | <code>```mermaid</code> |
| Footnotes | `text[^1]` … `[^1]: The note.` |
| Raw HTML / widgets | Just paste the HTML. Extra JS per post goes in `scripts:` front matter. |

### Posts with R or Python code

The site doesn't run code. Run it in RStudio/Jupyter and paste the results into
<code>```output</code> blocks, or write the post as `.qmd` and export it with
Quarto (`format: gfm`) to get Markdown with the results already filled in.

## Where things live

```
content/posts/*/index.md   blog posts (+ their images and downloads)
content/about.md           About page text, work + education timeline
site.config.js             title, nav links, socials, CV link
lib/templates.js           page layouts (home, blog, post, about, 404)
lib/markdown.js            Markdown features listed above
public/css/site.css        the whole design (colour tokens at the top)
public/js/site.js          dark mode, menu, search/filter, copy buttons, TOC
public/_redirects          old URLs → new URLs (Netlify)
```
