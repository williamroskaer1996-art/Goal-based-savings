import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import path from 'path';

const BASE = 'http://localhost:3001';
const OUT  = path.resolve('./scripts/screens');
const W = 390, H = 844;

const GOALS = [
  { id:'goal-1', name:'Solar panels',   iconKey:'home',    transition:'energy',    partnershipId:'solarnl', balance:1000, targetAmount:8000,  parentAccountId:'savings-1', purpose:'Become energy independent at home' },
  { id:'goal-2', name:'Gazelle e-bike', iconKey:'bike',    transition:'resources', partnershipId:'gazelle', balance:500,  targetAmount:2500,  parentAccountId:'savings-1', purpose:'Get around sustainably without a car' },
  { id:'goal-3', name:'Veggie garden',  iconKey:'garden',  transition:'food',      balance:300,  targetAmount:600,   parentAccountId:'savings-1', purpose:'Grow my own vegetables' },
  { id:'goal-4', name:'Emergency fund', iconKey:'safety',  transition:'society',   balance:800,  targetAmount:2000,  parentAccountId:'savings-1', purpose:'Build financial resilience' },
  { id:'goal-5', name:'Yoga retreat',   iconKey:'health',  transition:'wellbeing', balance:200,  targetAmount:800,   parentAccountId:'savings-1', purpose:'Rest and recharge' },
];

// Same goals but with Solar panels completed (for voucher screenshot)
const GOALS_COMPLETED = GOALS.map(g =>
  g.id === 'goal-1'
    ? { ...g, balance: 8000, completedAt: '2026-04-01T10:00:00.000Z' }
    : g
);

async function seed(page, goals = GOALS) {
  await page.evaluate((g) => {
    sessionStorage.setItem('triodos_auth', '1');
    sessionStorage.setItem('triodos_goals', JSON.stringify(g));
    sessionStorage.setItem('triodos_data_version', 'v4');
  }, goals);
}

async function go(page, url) {
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
}

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file });
  console.log(`✓ ${name}`);
  return file;
}

(async () => {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  const page = await ctx.newPage();

  // ── 01 Login (no auth needed — but navigating here clears auth) ─────────
  await go(page, '/login');
  await shot(page, '01-login');
  // Re-seed auth AFTER login screenshot (login page clears triodos_auth on mount)
  await seed(page);

  // ── 02 Home ─────────────────────────────────────────────────────────────
  await go(page, '/home');
  await shot(page, '02-home');

  // ── 03 Account detail ───────────────────────────────────────────────────
  await go(page, '/accounts/savings-1');
  await shot(page, '03-account-detail');

  // ── 04 Goals bubble view ─────────────────────────────────────────────────
  await go(page, '/goals');
  await page.waitForTimeout(800); // let blobs settle
  await shot(page, '04-goals');

  // Helper: find blob centre by innerText, dispatch pointer events to open sheet
  async function tapBlob(text) {

    const coords = await page.evaluate((txt) => {
      const el = [...document.querySelectorAll('div')].find(
        e => window.getComputedStyle(e).position === 'absolute' && e.innerText?.includes(txt)
      );
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, text);

    if (!coords) { console.warn(`  ! Could not find blob: ${text}`); return; }

    // Dispatch pointer events that React will pick up
    await page.evaluate(({ x, y }) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return;
      const opts = { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true };
      el.dispatchEvent(new PointerEvent('pointerdown', opts));
      el.dispatchEvent(new PointerEvent('pointerup',   opts));
    }, coords);
    await page.waitForTimeout(700);
  }

  // ── 05 Goal detail sheet — Solar panels (active + partnership) ───────────
  await go(page, '/goals');
  await page.waitForTimeout(1000);
  await tapBlob('Solar panels');
  await shot(page, '05-goal-detail-solar-panels');

  // ── 06 Goal detail sheet — Veggie garden (active, no partnership) ────────
  await go(page, '/goals');
  await page.waitForTimeout(1000);
  await tapBlob('Veggie garden');
  await shot(page, '06-goal-detail-veggie-garden');

  // ── 07 Goal detail sheet — Solar panels COMPLETED + voucher ─────────────
  await seed(page, GOALS_COMPLETED);
  await go(page, '/goals');
  await page.waitForTimeout(1000);
  await tapBlob('Solar panels');
  await shot(page, '07-goal-detail-voucher-solar');

  // ── 08 Set goal form — empty ─────────────────────────────────────────────
  await seed(page);
  await go(page, '/accounts/savings-1/goal');
  await shot(page, '08-set-goal-empty');

  // ── 09 Set goal form — with partnership pre-selected ────────────────────
  await go(page, `/accounts/savings-1/goal?partnershipId=solarnl`);
  await page.waitForTimeout(400);
  await shot(page, '09-set-goal-with-partnership');

  // ── 10 Partnerships list ─────────────────────────────────────────────────
  await go(page, '/partnerships');
  await shot(page, '10-partnerships');

  // ── Wrapped slides ───────────────────────────────────────────────────────
  await seed(page);
  await go(page, '/wrapped');
  await page.waitForTimeout(800);
  await shot(page, '11-wrapped-welcome');

  // Click right side of screen to advance through slides
  async function nextSlide() {
    await page.mouse.click(W * 0.75, H * 0.5);
    await page.waitForTimeout(500);
  }

  await nextSlide();
  await shot(page, '12-wrapped-goals-count');

  await nextSlide();
  await shot(page, '13-wrapped-saved');

  await nextSlide();
  await shot(page, '14-wrapped-transition-energy');

  await nextSlide();
  await shot(page, '15-wrapped-transition-resources');

  await nextSlide();
  await shot(page, '16-wrapped-transition-food');

  await nextSlide();
  await shot(page, '17-wrapped-transition-society');

  await nextSlide();
  await shot(page, '18-wrapped-transition-wellbeing');

  await nextSlide();
  await shot(page, '19-wrapped-partnerships');

  await nextSlide();
  await shot(page, '20-wrapped-outro');

  await browser.close();
  console.log('\nAll screens captured!');
})();
