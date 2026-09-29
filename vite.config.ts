import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

/**
 * MPA inputs: repo-root HTML (index, 404) plus every folder index.html under
 * blog/resources/privacy/terms/order. Skip sibling redirect HTML files so
 * keys do not collide with directory indexes.
 */
function collectHtmlInputs(): Record<string, string> {
  const inputs: Record<string, string> = {};
  const skipDirs = new Set(['node_modules', 'dist', 'public', '.git', 'content', 'scripts', 'src']);
  const root = process.cwd();

  for (const name of fs.readdirSync(root)) {
    if (!name.endsWith('.html')) continue;
    const full = path.join(root, name);
    if (!fs.statSync(full).isFile()) continue;
    const key = name === 'index.html' ? 'main' : name.replace(/\.html$/, '');
    inputs[key] = full;
  }

  function walk(dir: string) {
    for (const name of fs.readdirSync(dir)) {
      if (skipDirs.has(name)) continue;
      const full = path.join(dir, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) {
        walk(full);
        continue;
      }
      if (name !== 'index.html') continue;
      const rel = path.relative(root, full).replace(/\\/g, '/');
      const key = rel.replace(/\/index\.html$/, '').replace(/\//g, '-') || 'main';
      inputs[key] = full;
    }
  }

  for (const top of ['blog', 'resources', 'privacy', 'terms', 'order']) {
    const dir = path.join(root, top);
    if (fs.existsSync(dir)) walk(dir);
  }

  return inputs;
}

export default defineConfig({
  base: '/',
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: collectHtmlInputs(),
    },
  },
});
