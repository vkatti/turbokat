// Dev server: builds, serves dist/ on http://localhost:4200, rebuilds on change.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT) || 4200;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.txt': 'text/plain', '.ico': 'image/x-icon',
};

const build = () => spawnSync(process.execPath, [path.join(ROOT, 'build.js')], { stdio: 'inherit' });
build();

let timer;
for (const dir of ['content', 'public', 'lib']) {
  fs.watch(path.join(ROOT, dir), { recursive: true }, () => { clearTimeout(timer); timer = setTimeout(build, 150); });
}
fs.watch(path.join(ROOT, 'site.config.js'), () => { clearTimeout(timer); timer = setTimeout(build, 150); });

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = path.join(DIST, p);
  if (!file.startsWith(DIST)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!p.endsWith('/')) { res.writeHead(301, { Location: p + '/' }).end(); return; }
    file = path.join(file, 'index.html');
  }
  if (!fs.existsSync(file)) {
    res.writeHead(404, { 'Content-Type': TYPES['.html'] });
    fs.createReadStream(path.join(DIST, '404.html')).pipe(res);
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`\n  Serving http://localhost:${PORT}  (Ctrl+C to stop)\n`));
