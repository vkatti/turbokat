// Loaded only on posts that contain a ```mermaid block.
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.esm.min.mjs';

const blocks = [...document.querySelectorAll('pre.mermaid')];
blocks.forEach((b) => (b.dataset.src = b.textContent));

async function draw() {
  const dark = document.documentElement.dataset.theme === 'dark';
  mermaid.initialize({ startOnLoad: false, theme: dark ? 'dark' : 'neutral', fontFamily: 'Inter, system-ui, sans-serif' });
  blocks.forEach((b) => { b.removeAttribute('data-processed'); b.innerHTML = ''; b.textContent = b.dataset.src; });
  await mermaid.run({ nodes: blocks });
}
draw();
document.addEventListener('themechange', draw);
