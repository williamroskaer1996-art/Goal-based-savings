const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3001';
const OUT  = path.join(__dirname, '../screenshots');

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

const SAMPLE_GOALS = [
  {
    id: 'goal-solar',
    name: 'Solar panels',
    description: 'Become energy independent at home',
    purpose: 'Become energy independent at home',
    targetAmount: 8000,
    balance: 3200,
    iconKey: 'home',
    horizon: 3,
    goalType: 'saving',
    accountId: 'savings-1',
    transition: 'energy',
  },
  {
    id: 'goal-travel',
    name: 'Japan trip',
    description: 'Family holiday in Japan 2026',
    purpose: 'Family holiday in Japan 2026',
    targetAmount: 4500,
    balance: 1800,
    iconKey: 'travel',
    horizon: 2,
    goalType: 'saving',
    accountId: 'savings-1',
    transition: 'wellbeing',
  },
];

async function seed(page) {
  await page.evaluate((goals) => {
    sessionStorage.setItem('triodos_auth', '1');
    sessionStorage.setItem('triodos_goals', JSON.stringify(goals));
    sessionStorage.setItem('triodos_data_version', 'v9');
  }, SAMPLE_GOALS);
}

async function shot(page, name) {
  await page.waitForTimeout(600);
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`✓ ${name}`);
  return file;
}

(async () => {
  const browser = await chromium.launch();
  const ctx     = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page    = await ctx.newPage();

  // ── 01 Login (Face ID) ─────────────────────────────────────────
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(400);
  await shot(page, '01-login');

  // ── 02 Login with PIN pad ──────────────────────────────────────
  await page.click('button:has-text("Use PIN instead")');
  await page.waitForTimeout(300);
  await shot(page, '02-login-pin');

  // ── 03 Home ────────────────────────────────────────────────────
  await page.goto(`${BASE}/home`);
  await seed(page);
  await page.reload();
  await page.waitForTimeout(600);
  await shot(page, '03-home');

  // ── 04 Account detail — savings ───────────────────────────────
  await page.goto(`${BASE}/accounts/savings-1`);
  await seed(page);
  await page.reload();
  await page.waitForTimeout(600);
  await shot(page, '04-account-savings');

  // ── 05 Account detail — checking ─────────────────────────────
  await page.goto(`${BASE}/accounts/checking-1`);
  await seed(page);
  await page.reload();
  await page.waitForTimeout(600);
  await shot(page, '05-account-checking');

  // ── 06 Set savings goal ────────────────────────────────────────
  await page.goto(`${BASE}/accounts/savings-1/goal`);
  await seed(page);
  await page.reload();
  await page.waitForTimeout(600);
  await shot(page, '06-set-goal');

  // ── 07 Goals overview ─────────────────────────────────────────
  await page.goto(`${BASE}/goals`);
  await seed(page);
  await page.reload();
  await page.waitForTimeout(1200);
  await shot(page, '07-goals');

  // ── 08 Fund projection ────────────────────────────────────────
  await page.goto(`${BASE}/accounts/savings-1/goal/fund?goalId=goal-solar`);
  await seed(page);
  await page.reload();
  await page.waitForTimeout(800);
  await shot(page, '08-fund-projection');

  // ── 09 Wrapped ────────────────────────────────────────────────
  await page.goto(`${BASE}/wrapped`);
  await seed(page);
  await page.reload();
  await page.waitForTimeout(600);
  await shot(page, '09-wrapped');

  await browser.close();
  console.log('\nAll screenshots saved to', OUT);
})();
