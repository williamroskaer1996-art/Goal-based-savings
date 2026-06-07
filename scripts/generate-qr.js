const QRCode    = require('qrcode');
const puppeteer = require('puppeteer');
const fs        = require('fs');
const path      = require('path');

const URL  = 'https://williamroskaer1996-art.github.io/Goal-based-savings/login/';
const OUT  = path.join(__dirname, '../public/triodos-qr.jpg');
const SIZE = 1200; // high-res for print

const BG = '#F3EDE4'; // Birch Skin
const FG = '#004B32'; // Grounded Green

async function main() {
  const qr       = await QRCode.create(URL, { errorCorrectionLevel: 'M' });
  const modules  = qr.modules;
  const N        = modules.size;
  const MARGIN   = 60;
  const cellSize = (SIZE - MARGIN * 2) / N;
  const RADIUS   = cellSize * 0.38;

  let squares = '';
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (!modules.get(r, c)) continue;
      const x = MARGIN + c * cellSize;
      const y = MARGIN + r * cellSize;
      const w = cellSize * 0.88;
      squares += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${w.toFixed(1)}" rx="${RADIUS.toFixed(1)}" ry="${RADIUS.toFixed(1)}"/>`;
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" rx="48" fill="${BG}"/>
  <g fill="${FG}">${squares}</g>
</svg>`;

  // Render SVG → JPEG via Puppeteer
  const browser = await puppeteer.launch();
  const page    = await browser.newPage();
  await page.setViewport({ width: SIZE, height: SIZE, deviceScaleFactor: 1 });
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;background:#fff">
    <img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="${SIZE}" height="${SIZE}"/>
  </body></html>`);
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: OUT, type: 'jpeg', quality: 95,
    clip: { x: 0, y: 0, width: SIZE, height: SIZE } });
  await browser.close();

  console.log(`QR saved → ${OUT}  (${SIZE}×${SIZE}px, ${N}×${N} modules)`);
}

main().catch(console.error);
