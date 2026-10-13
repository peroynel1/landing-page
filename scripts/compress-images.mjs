/**
 * Compress landing images to display-sized WebP.
 * Keeps original PNGs for blog embeds / fallbacks.
 *
 *   npm run images:compress
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(root, 'public')

async function toWebp(srcRel, destRel, { width, height, fit = 'cover', quality = 78 } = {}) {
  const src = path.join(publicDir, srcRel)
  const dest = path.join(publicDir, destRel)
  if (!fs.existsSync(src)) {
    console.warn(`skip missing ${srcRel}`)
    return
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  let pipeline = sharp(src)
  if (width || height) {
    pipeline = pipeline.resize({
      width,
      height,
      fit,
      withoutEnlargement: true,
    })
  }
  await pipeline.webp({ quality, effort: 6 }).toFile(dest)
  const before = fs.statSync(src).size
  const after = fs.statSync(dest).size
  console.log(
    `${srcRel} → ${destRel}: ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB`,
  )
}

const demoThumbs = [
  'brew-scale.png',
  'filters.png',
  'hand-grinder-black.png',
  'hand-grinder-silver.png',
  'pour-over-kit.png',
  'starter-kit.png',
  'tamper.png',
]

for (const file of demoThumbs) {
  const base = file.replace(/\.png$/i, '')
  await toWebp(`demo/images/${file}`, `demo/images/${base}.webp`, {
    width: 128,
    height: 128,
    fit: 'cover',
    quality: 80,
  })
}

await toWebp('demo/images/jordan-mets-avatar.png', 'demo/images/jordan-mets-avatar.webp', {
  width: 96,
  height: 96,
  fit: 'cover',
  quality: 82,
})

// Hero background — wide but much smaller bytes
await toWebp('images/hero-dark.png', 'images/hero-dark.webp', {
  width: 1600,
  fit: 'inside',
  quality: 75,
})

// LCP phone screenshot — ~338 CSS px × 1.75 DPR ≈ 592; encode at 720w
await toWebp('screenshots/home.png', 'screenshots/home.webp', {
  width: 720,
  fit: 'inside',
  quality: 78,
})

console.log('done')
