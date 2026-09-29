/**
 * Compress marketing screenshots and hero for faster LCP / scroll.
 * Rewrites files in place under public/screenshots and public/images/hero-dark.png.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function compressFile(rel, opts) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    console.warn('skip missing', rel);
    return;
  }
  const before = fs.statSync(full).size;
  const buf = await sharp(full)
    .rotate()
    .resize({
      width: opts.width,
      height: opts.height,
      fit: opts.fit || 'inside',
      withoutEnlargement: true,
    })
    .png({ compressionLevel: 9, palette: opts.palette !== false, quality: opts.quality ?? 80 })
    .toBuffer();
  const after = buf.length;
  if (after >= before) {
    console.log(`${rel}: kept original (${(before / 1024).toFixed(0)}KB; compress was ${(after / 1024).toFixed(0)}KB)`);
    return;
  }
  fs.writeFileSync(full, buf);
  console.log(
    `${rel}: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB (${Math.round((1 - after / before) * 100)}% smaller)`,
  );
}

await compressFile('public/images/hero-dark.png', { width: 1600, height: 900, palette: false, quality: 85 });

const shots = fs.readdirSync(path.join(root, 'public/screenshots')).filter((f) => f.endsWith('.png'));
for (const name of shots) {
  // Phone UI shots are tall; cap long edge so files stay light on mobile.
  await compressFile(`public/screenshots/${name}`, {
    width: 900,
    height: 1800,
    palette: false,
    quality: 80,
  });
}

console.log('Image compression done.');
