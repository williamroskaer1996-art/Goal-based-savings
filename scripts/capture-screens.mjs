/**
 * Triodos Goal Advisor — Screen capture (Puppeteer)
 * Saves every app screen as JPEG to public/screens/
 * Run: node scripts/capture-screens.mjs
 */
import puppeteer from '/Users/williamroskaer/Desktop/triodos-goal-advisor/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir  = dirname(fileURLToPath(import.meta.url));
const OUT    = join(__dir, '..', 'public', 'screens');
mkdirSync(OUT, { recursive: true });

const BASE = 'http://127.0.0.1:3001';
const W = 390, H = 844;

// Goals stored as a plain JSON array; version tracked separately
const SAMPLE_GOALS_ARRAY = JSON.stringify([
  { id:'g1', name:'Solar panels',  iconKey:'home',   targetAmount:5000, balance:1800,
    parentAccountId:'savings-1', goalType:'saving',   transition:'energy',    timeHorizonMonths:24 },
  { id:'g2', name:'Veggie garden', iconKey:'garden', targetAmount:800,  balance:320,
    parentAccountId:'savings-1', goalType:'saving',   transition:'food',      timeHorizonMonths:12 },
  { id:'g3', name:'E-bike',        iconKey:'bike',   targetAmount:2500, balance:500,
    parentAccountId:'savings-1', goalType:'saving',   transition:'resources', timeHorizonMonths:18 },
]);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox','--disable-setuid-sandbox','--disable-web-security'],
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });

// Navigate to /login first to establish the origin (and let React clear auth),
// then immediately re-set auth+goals via evaluate before any protected page sees them.
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' });
await sleep(800); // let the login useEffect run (it removes triodos_auth)

async function seedAndGo(url) {
  // Set correct keys: auth='1', goals=plain array, version='v6'
  await page.evaluate((goalsJson) => {
    sessionStorage.setItem('triodos_auth', '1');
    sessionStorage.setItem('triodos_goals', goalsJson);
    sessionStorage.setItem('triodos_data_version', 'v6');
  }, SAMPLE_GOALS_ARRAY);
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle0', timeout: 20000 });
  await sleep(600);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function save(name) {
  const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
  writeFileSync(join(OUT, `${name}.jpg`), buf);
  console.log(`✓  ${name}.jpg`);
  return buf;
}

// ── 01 Login — idle ────────────────────────────────────────────────────────────
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' });
await sleep(500);
await save('01-login');

// ── 02 Login — PIN pad visible ─────────────────────────────────────────────────
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' });
await sleep(400);
const allBtns = await page.$$('button');
for (const btn of allBtns) {
  const t = await page.evaluate(el => el.textContent.trim(), btn);
  if (t === 'Use PIN instead') { await btn.click(); break; }
}
await sleep(500);
await save('02-login-pin');

// ── 03 Home ─────────────────────────────────────────────────────────────────────
await seedAndGo('/home');
await save('03-home');

// ── 04 Account detail — savings ────────────────────────────────────────────────
await seedAndGo('/accounts/savings-1');
await save('04-account-detail');

// ── 05 Account detail — checking ───────────────────────────────────────────────
await seedAndGo('/accounts/checking-1');
await save('05-account-detail-checking');

// ── 06 Goals list ───────────────────────────────────────────────────────────────
await seedAndGo('/goals');
await sleep(800); // let blobs/cards render
await save('06-goals');

// ── 07 Goal form — empty ────────────────────────────────────────────────────────
await seedAndGo('/accounts/savings-1/goal');
await save('07-goal-form-empty');

// ── 08 Goal form — name filled + transition chip ────────────────────────────────
await seedAndGo('/accounts/savings-1/goal');
const nameInput = await page.$('input[placeholder="E.g. Solar panels"]');
if (nameInput) {
  await nameInput.click({ clickCount: 3 });
  await nameInput.type('Solar panels', { delay: 25 });
}
await sleep(600);
await save('08-goal-form-filled');

// ── 09 Goal form — Investment + fund recommendation ─────────────────────────────
await seedAndGo('/accounts/savings-1/goal');
const nameInput2 = await page.$('input[placeholder="E.g. Solar panels"]');
if (nameInput2) {
  await nameInput2.click({ clickCount: 3 });
  await nameInput2.type('Solar panels', { delay: 25 });
}
// Slide to 10 years
await page.evaluate(() => {
  const s = document.querySelector('input[type="range"]');
  if (!s) return;
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(s, '10');
  s.dispatchEvent(new Event('input', { bubbles: true }));
});
// Click Investment tab
const btns2 = await page.$$('button');
for (const btn of btns2) {
  const t = await page.evaluate(el => el.textContent.trim(), btn);
  if (t === 'Investment') { await btn.click(); break; }
}
await sleep(2800); // wait for AI / keyword fund recommendation
await save('09-goal-form-investment');

// ── 10 Goal form — Transition modal open ────────────────────────────────────────
await seedAndGo('/accounts/savings-1/goal');
const nameInput3 = await page.$('input[placeholder="E.g. Solar panels"]');
if (nameInput3) {
  await nameInput3.click({ clickCount: 3 });
  await nameInput3.type('Solar panels', { delay: 25 });
}
await sleep(600);
const chipBtns = await page.$$('button');
for (const btn of chipBtns) {
  const t = await page.evaluate(el => el.textContent, btn);
  if (t && t.includes('transition')) { await btn.click(); break; }
}
await sleep(500);
await save('10-goal-form-modal');

await browser.close();

console.log(`\n✅  All 10 screens saved to public/screens/`);
