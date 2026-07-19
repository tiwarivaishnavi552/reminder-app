import sharp from "sharp";
import { mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
mkdirSync(publicDir, { recursive: true });

function svg(size) {
  const fontSize = Math.round(size * 0.5);
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#ea580c" />
      <text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="${fontSize}"
        font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="central">S</text>
    </svg>
  `);
}

for (const size of [192, 512]) {
  await sharp(svg(size)).png().toFile(join(publicDir, `icon-${size}.png`));
  console.log(`Wrote public/icon-${size}.png`);
}
