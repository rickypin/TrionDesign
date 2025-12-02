import { chromium } from 'playwright';

const serverUrl = 'http://127.0.0.1:4173/';

const browser = await chromium.launch();
const page = await browser.newPage();

page.on('console', msg => {
  console.log('[browser console]', msg.type(), msg.text());
});

page.on('pageerror', err => {
  console.log('[page error]', err.message);
  console.log(err.stack);
});

await page.goto(serverUrl, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

// Click to expand Network Correlation panel first to reveal tabs if collapsed
await page.click('button[aria-label="View Details"]');
await page.waitForTimeout(500);

await page.click('button:has-text("Traffic")');
await page.waitForTimeout(1000);

await browser.close();
