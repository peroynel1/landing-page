import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

function collectHtmlInputs(): Record<string, string> {
  const inputs: Record<string, string> = {};
  const skip = new Set(['node_modules', 'dist', 'public', '.git']);
  function walk(dir: string) {
    for (const name of fs.readdirSync(dir)) {
      if (skip.has(name)) continue;
      const full = path.join(dir, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else if (name.endsWith('.html')) {
        const rel = path.relative(process.cwd(), full).replace(/\\/g, '/');
        const key =
          rel
            .replace(/\.html$/, '')
            .replace(/\/index$/, '')
            .replace(/\//g, '-') || 'main';
        inputs[key] = full;
      }
    }
  }
  walk(process.cwd());
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