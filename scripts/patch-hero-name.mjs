/**
 * Replace baked-in "Jordan Mets" with "Ryan Clark".
 * Clears the full name band to solid bg (no ghost AA), then draws DM Sans text.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fontB64 = fs.readFileSync(path.join(root, 'public/images/_fonts/DMSans-Bold.ttf')).toString('base64');

async function clearBand(inputPath, band, bg) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let y = band.top; y < band.top + band.height && y < height; y++) {
    for (let x = band.left; x < band.left + band.width && x < width; x++) {
      const i = (y * width + x) * channels;
      data[i] = bg[0];
      data[i + 1] = bg[1];
      data[i + 2] = bg[2];
      if (channels > 3) data[i + 3] = 255;
    }
  }
  return sharp(data, { raw: { width, height, channels } }).png().toBuffer();
}

async function textOverlay({ width, height, textX, textY, fontSize, letterSpacing }) {
  const scale = 3;
  const svg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width * scale}" height="${height * scale}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style type="text/css">
      @font-face {
        font-family: 'DMSansEmbed';
        src: url('data:font/ttf;base64,${fontB64}') format('truetype');
        font-weight: 700;
      }
    </style>
  </defs>
  <text x="${textX * scale}" y="${textY * scale}"
    font-family="DMSansEmbed, sans-serif"
    font-size="${fontSize * scale}"
    font-weight="700"
    letter-spacing="${letterSpacing * scale}"
    fill="#f2f1ec">Ryan Clark</text>
</svg>`);
  return sharp(svg).resize(width, height, { kernel: 'lanczos3' }).png().toBuffer();
}

async function patch({ origRel, outRel, band, bg, textX, textY, fontSize, letterSpacing, cropRel, crop }) {
  const orig = path.join(root, origRel);
  const meta = await sharp(orig).metadata();
  const cleaned = await clearBand(orig, band, bg);
  const overlay = await textOverlay({
    width: meta.width,
    height: meta.height,
    textX,
    textY,
    fontSize,
    letterSpacing,
  });
  const buf = await sharp(cleaned).composite([{ input: overlay, top: 0, left: 0 }]).png().toBuffer();
  fs.writeFileSync(path.join(root, outRel), buf);
  if (crop && cropRel) {
    await sharp(buf).extract(crop).png().toFile(path.join(root, cropRel));
  }
  console.log('patched', outRel);
}

await patch({
  origRel: 'public/images/hero-dark.orig.png',
  outRel: 'public/images/hero-dark.png',
  // Clear name row only; leave GOOD AFTERNOON (~above 166) alone.
  // Baseline raised slightly so "y" descender in Ryan stays in band.
  band: { left: 825, top: 166, width: 130, height: 22 },
  bg: [0, 0, 0],
  textX: 831,
  textY: 181,
  fontSize: 15.5,
  letterSpacing: -0.2,
  cropRel: 'public/images/_name-crop.png',
  crop: { left: 780, top: 125, width: 220, height: 75 },
});

if (fs.existsSync(path.join(root, 'public/screenshots/home.orig.png'))) {
  await patch({
    origRel: 'public/screenshots/home.orig.png',
    outRel: 'public/screenshots/home.png',
    band: { left: 28, top: 140, width: 460, height: 40 },
    bg: [30, 28, 25],
    textX: 36,
    textY: 172,
    fontSize: 38,
    letterSpacing: -0.5,
    cropRel: 'public/screenshots/_home-name.png',
    crop: { left: 0, top: 100, width: 480, height: 100 },
  });
}
