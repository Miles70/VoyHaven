import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { startSeoTestServer } from './seo-test-server.mjs';
import { markAnalyticsTest } from './analytics-test-context.mjs';
import translations from '../src/i18n/flightInfoTranslations.js';
import { supportedLanguages } from '../shared/languages.js';
assert.deepEqual(Object.keys(translations).sort(), [...supportedLanguages].sort());
for (const row of Object.values(translations)) {
  assert.equal(row.length, 9);
  assert.ok(row.slice(3).every(text => text.split('|').length === 2));
}
const server = await startSeoTestServer();
let browser;
try {
  browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
  for (const [width, lang] of [[390, 'tr'], [1280, 'tr'], [390, 'ar']]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    await markAnalyticsTest(context, { fixture: true });
    await context.route('**/*', route => new URL(route.request().url()).origin === server.base ? route.continue() : route.abort());
    await context.route('**/api/**', route => route.fulfill({ json: { data: [], hotels: [] } }));
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${server.base}/flights?lang=${lang}`);
    const cards = page.locator('.flightInspirationCard');
    await cards.first().waitFor();
    assert.equal(await cards.count(), 6);
    const url = page.url();
    for (let index = 0; index < 6; index++) {
      await cards.nth(index).click();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor();
      assert.equal(await dialog.locator('h2').innerText(), translations[lang][index + 3].split('|')[0]);
      assert.equal(page.url(), url);
      assert.equal(await page.evaluate(() => globalThis.document.body.style.overflow), 'hidden');
      const bounds = await dialog.boundingBox();
      assert.ok(bounds.width <= 620 && bounds.width < width);
      assert.ok(bounds.height <= 675 && bounds.x >= 0);
      if (index % 2) await dialog.locator('.flightInfoDialogTop button').click();
      else await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      assert.ok(await cards.nth(index).evaluate(node => globalThis.document.activeElement === node));
      await page.waitForFunction(() => globalThis.document.body.style.overflow !== 'hidden');
    }
    assert.equal(await page.evaluate(() => globalThis.document.documentElement.scrollWidth > globalThis.innerWidth), false);
    assert.deepEqual(errors, []);
    if (width === 1280) {
      await cards.first().click();
      await page.screenshot({ path: '/tmp/voyhaven-flight-info-desktop.png' });
    }
    console.log(`Six info cards, compact dialogs, close/Escape, focus return and preserved URL passed: ${width}px ${lang}`);
    await context.close();
  }
} finally { await browser?.close(); await server.close(); }
