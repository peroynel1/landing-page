import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

/** Dev-only marketing ops dashboard. Not included in the Pages production build. */
export default defineConfig({
  plugins: [tailwindcss()],
  root,
  publicDir: false,
  server: {
    open: '/ops/',
    port: 5174,
  },
  build: {
    // Guard: never produce a deployable ops bundle via this config for Pages.
    outDir: 'dist-ops-do-not-deploy',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(root, 'ops/index.html'),
    },
  },
});
