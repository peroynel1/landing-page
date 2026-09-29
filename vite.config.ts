import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

function htmlInputsFromDir(dir: string, prefix: string): Record<string, string> {
  const abs = path.resolve(dir);
  if (!fs.existsSync(abs)) return {};
  const inputs: Record<string, string> = {};
  for (const name of fs.readdirSync(abs)) {
    if (!name.endsWith('.html')) continue;
    const key = name === 'index.html' ? prefix : `${prefix}-${name.replace(/\.html$/, '')}`;
    inputs[key] = path.join(abs, name);
  }
  return inputs;
}

export default defineConfig({
  base: '/',
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve('index.html'),
        privacy: path.resolve('privacy.html'),
        terms: path.resolve('terms.html'),
        order: path.resolve('order.html'),
        ...htmlInputsFromDir('blog', 'blog'),
        ...htmlInputsFromDir('resources', 'resources'),
      },
    },
  },
});
