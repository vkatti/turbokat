import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const faDir = path.join(path.dirname(require.resolve('@fortawesome/fontawesome-free/package.json')), 'svgs/brands');
const lucideDir = path.join(path.dirname(require.resolve('lucide-static/package.json')), 'icons');
const cache = new Map();

/** Inline SVG icon. Brand icons come from Font Awesome, UI icons from Lucide. */
export function icon(name, { size = 18, label } = {}) {
  const key = `${name}:${size}`;
  if (!cache.has(key)) {
    const fa = path.join(faDir, `${name}.svg`);
    let svg = fs.existsSync(fa) ? fs.readFileSync(fa, 'utf8') : fs.readFileSync(path.join(lucideDir, `${name}.svg`), 'utf8');
    svg = svg
      .replace(/<!--[\s\S]*?-->/g, '')
      // only touch the root <svg> tag; inner shapes (e.g. <rect width>) must keep their attributes
      .replace(/<svg[^>]*>/, (tag) => tag.replace(/\s(class|width|height)="[^"]*"/g, ''))
      .replace('<svg', `<svg class="icon" width="${size}" height="${size}"${fs.existsSync(fa) ? ' fill="currentColor"' : ''}`)
      .replace(/\s+/g, ' ')
      .trim();
    cache.set(key, svg);
  }
  const svg = cache.get(key);
  return label ? svg.replace('<svg', `<svg role="img" aria-label="${label}"`) : svg.replace('<svg', '<svg aria-hidden="true"');
}
