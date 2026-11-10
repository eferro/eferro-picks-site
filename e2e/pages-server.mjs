// Minimal static server that mimics GitHub Pages for the production build:
// - serves dist/ under the /eferro-picks-site/ base path
// - a directory serves its index.html
// - unknown paths get dist/404.html with status 404, which is how deep
//   links such as /eferro-picks-site/talk/<id> reach the SPA on Pages.
// Usage: node e2e/pages-server.mjs [port]   (run `make build` first)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const BASE = '/eferro-picks-site/';
const DIST = resolve('dist');
const PORT = Number(process.argv[2] ?? 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.txt': 'text/plain',
};

async function resolveFile(urlPath) {
  if (!urlPath.startsWith(BASE)) return null;
  const relative = normalize(decodeURIComponent(urlPath.slice(BASE.length)));
  if (relative.startsWith('..')) return null;
  let file = join(DIST, relative);
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    await stat(file);
    return file;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const urlPath = new URL(req.url ?? '/', 'http://localhost').pathname;
  const file = await resolveFile(urlPath);
  const target = file ?? join(DIST, '404.html');
  try {
    const body = await readFile(target);
    res.writeHead(file ? 200 : 404, { 'Content-Type': TYPES[extname(target)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(500).end('dist/ not found: run `make build` first');
  }
}).listen(PORT, () => {
  console.log(`GitHub Pages-like server on http://localhost:${PORT}${BASE}`);
});
