import sharp from "sharp";
import fs from "fs";

// OG editorial 1200x630 — composición tipográfica (sin IA), datos del evento.
const W = 1200;
const H = 630;
const output = "public/sobre-og.png";

const bg = "#FAF8F5";
const ink = "#0D0D0D";
const gold = "#B8975A";
const gray = "#6B6B6B";

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <rect x="34" y="34" width="${W - 68}" height="${H - 68}" fill="none" stroke="${gold}" stroke-width="1.5" opacity="0.7"/>

  <text x="${W / 2}" y="150" text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif" font-size="26" letter-spacing="10"
    fill="${gold}">UNA CELEBRACION SORPRESA</text>

  <text x="${W / 2}" y="272" text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="96" letter-spacing="6"
    fill="${ink}">JAVIER ZAMUDIO</text>

  <line x1="${W / 2 - 90}" y1="322" x2="${W / 2 - 30}" y2="322" stroke="${gold}" stroke-width="1.5"/>
  <text x="${W / 2}" y="336" text-anchor="middle"
    font-family="Georgia, serif" font-style="italic" font-size="60" fill="${gold}">60</text>
  <line x1="${W / 2 + 30}" y1="322" x2="${W / 2 + 90}" y2="322" stroke="${gold}" stroke-width="1.5"/>

  <text x="${W / 2}" y="430" text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="52" letter-spacing="4"
    fill="${ink}">3 DE OCTUBRE 2026</text>

  <text x="${W / 2}" y="492" text-anchor="middle"
    font-family="Georgia, serif" font-style="italic" font-size="34" fill="${gray}">El Paso, Texas</text>

  <text x="${W / 2}" y="566" text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif" font-size="20" letter-spacing="6"
    fill="${gray}">@ELYSIUM.INVITACIONES</text>
</svg>`;

await sharp(Buffer.from(svg)).png({ quality: 92, compressionLevel: 9 }).toFile(output);
const outMeta = await sharp(output).metadata();
const outSize = fs.statSync(output).size;
console.log(`Output: ${outMeta.width}x${outMeta.height} (${(outSize / 1024).toFixed(1)}KB) -> ${output}`);
