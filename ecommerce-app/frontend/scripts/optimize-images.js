// scripts/optimize-images.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_DIR = path.join(__dirname, '..', 'public', 'assets');
const OUT_BASE = path.join(INPUT_DIR, 'optimized'); // public/assets/optimized
const SIZES = [400, 800, 1200]; // sizes to generate
const VALID_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.avif']);

function walk(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const full = path.join(dir, it.name);
    if (it.isDirectory()) {
      if (it.name === 'optimized') continue; // skip previously generated
      files.push(...walk(full));
    } else {
      const ext = path.extname(it.name).toLowerCase();
      if (VALID_EXT.has(ext)) files.push(full);
    }
  }
  return files;
}

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

(async () => {
  const files = walk(INPUT_DIR);
  console.log(`Found ${files.length} image(s). Processing...`);

  for (const file of files) {
    try {
      const rel = path.relative(INPUT_DIR, file);  // e.g. gallery/img01.jpg
      const parsed = path.parse(rel);              // {dir, name, ext}
      const destDir = path.join(OUT_BASE, parsed.dir);
      await ensureDir(destDir);

      // small blurred placeholder
      const placeholderPath = path.join(destDir, `${parsed.name}-small.jpg`);
      await sharp(file)
        .resize({ width: 32 })
        .blur(1)
        .jpeg({ quality: 40 })
        .toFile(placeholderPath);

      // responsive webp tiles
      for (const w of SIZES) {
        const outPath = path.join(destDir, `${parsed.name}-${w}.webp`);
        await sharp(file).resize({ width: w }).webp({ quality: 80 }).toFile(outPath);
      }

      console.log(`Processed: ${rel}`);
    } catch (err) {
      console.error('Error processing', file, err);
    }
  }

  console.log('Done. Output under public/assets/optimized');
})();
