// ...existing code...
/**
 * Save external http(s) assets to assets/external and rewrite references in files.
 * Usage:
 *   cd d:\xxx
 *   node save-external-assets.js
 *
 * Notes:
 * - Requires Node.js v18+ (global fetch). Nếu phiên bản thấp hơn, nâng cấp Node hoặc cài `node-fetch`.
 * - Script sửa trực tiếp các file (.html, .css, .js). Sao lưu/commit trước khi chạy.
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = process.cwd(); // run from d:\xxx
const OUT_BASE = path.join(ROOT, 'assets', 'external');

const FILE_EXTS = ['.html', '.htm', '.css', '.js'];

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

async function walk(dir) {
  const list = [];
  for (const name of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (path.basename(full) === 'node_modules' || path.basename(full) === '.git') continue;
      list.push(...await walk(full));
    } else if (name.isFile()) {
      if (FILE_EXTS.includes(path.extname(name.name).toLowerCase())) list.push(full);
    }
  }
  return list;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function downloadToFile(url, outPath) {
  // Use global fetch (Node 18+). If not available, throw.
  if (typeof fetch !== 'function') {
    throw new Error('fetch not available. Use Node.js v18+ or install node-fetch.');
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buffer = await res.arrayBuffer();
  await ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, Buffer.from(buffer));
}

function sanitizeSegment(s) {
  return s.replace(/[^a-zA-Z0-9._-]/g, '_');
}

(async () => {
  try {
    console.log('Scanning files...');
    const files = await walk(ROOT);

    const urlRegex = /\bhttps?:\/\/[^\s"'<>]+/ig;
    const downloads = new Map(); // url -> savedAbsolutePath
    const errors = [];

    // First pass: collect all URLs from files under pages (prioritize pages) but we will also replace in ALL files later
    const allFiles = files; // contains pages and others
    const foundUrls = new Set();

    for (const file of allFiles) {
      const content = await fs.readFile(file, 'utf8');
      let m;
      while ((m = urlRegex.exec(content)) !== null) {
        const u = m[0].replace(/[),;]$/, ''); // trim trailing punctuation if any
        // skip data: URIs
        if (u.startsWith('data:')) continue;
        foundUrls.add(u);
      }
    }

    console.log(`Found ${foundUrls.size} unique http(s) urls.`);

    // Download each URL once, save under assets/external/<hostname>/<path...>
    let count = 0;
    for (const urlString of foundUrls) {
      try {
        const urlObj = new URL(urlString);
        // build local path: assets/external/<host>/<path>
        const hostDir = sanitizeSegment(urlObj.hostname);
        // use pathname + search to preserve filename when possible
        let pathname = urlObj.pathname;
        if (!path.extname(pathname)) {
          // no extension -> try to guess from content-type later; for now add index
          pathname = pathname.endsWith('/') ? pathname + 'index' : pathname + '_file';
        }
        const fullPathSegments = pathname.split('/').filter(Boolean).map(s => sanitizeSegment(s));
        const filename = fullPathSegments.length ? fullPathSegments[fullPathSegments.length - 1] : 'file';
        const subdirs = fullPathSegments.slice(0, -1).join(path.sep);
        const outDir = subdirs ? path.join(OUT_BASE, hostDir, subdirs) : path.join(OUT_BASE, hostDir);
        const outExt = path.extname(filename) || ''; // may be empty
        // if filename has query params encoded into it, add sanitized search
        const searchSuffix = urlObj.search ? sanitizeSegment(urlObj.search) : '';
        const outFilename = (searchSuffix ? (filename + '_' + searchSuffix) : filename);
        const outPath = path.join(outDir, outFilename);

        // Avoid duplicate downloads where the same url maps to same file path
        if (downloads.has(urlString)) continue;

        // Download
        process.stdout.write(`Downloading ${urlString} ... `);
        try {
          await downloadToFile(urlString, outPath);
          downloads.set(urlString, outPath);
          console.log('saved ->', toPosix(path.relative(ROOT, outPath)));
          count++;
        } catch (err) {
          console.log('failed');
          errors.push({ url: urlString, error: err.message });
        }
      } catch (err) {
        errors.push({ url: urlString, error: 'Invalid URL' });
      }
    }

    console.log(`Downloaded ${count} files. Rewriting references in ${allFiles.length} files...`);

    // Second pass: replace references in all files
    for (const file of allFiles) {
      let content = await fs.readFile(file, 'utf8');
      let replaced = false;

      for (const [urlString, savedAbs] of downloads.entries()) {
        // compute relative path from file to savedAbs
        const rel = path.relative(path.dirname(file), savedAbs);
        const relPosix = toPosix(rel);
        const pattern = new RegExp(escapeRegExp(urlString), 'g');
        if (pattern.test(content)) {
          content = content.replace(pattern, relPosix);
          replaced = true;
        }
      }

      if (replaced) {
        await fs.writeFile(file, content, 'utf8');
        console.log('Updated', toPosix(path.relative(ROOT, file)));
      }
    }

    console.log('Done.');
    if (errors.length) {
      console.log('Some downloads failed (see summary):');
      errors.forEach(e => console.log('-', e.url, '=>', e.error));
    }
    console.log('Saved assets under:', toPosix(path.relative(ROOT, OUT_BASE)));
    console.log('Remember to review changes and commit or revert if needed.');
  } catch (err) {
    console.error('Error:', err);
  }
})();