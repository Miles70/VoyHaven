import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { markAnalyticsTest } from './analytics-test-context.mjs';
const server = await createServer({ server: { host: '127.0.0.1', port: 5186, strictPort: true }, define: { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify(''), 'import.meta.env.VITE_REOWN_PROJECT_ID': JSON.stringify('00000000000000000000000000000000') } });
let browser;
const day = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
try {
  await server.listen();
  browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {}) });
  for (const legacy of [false, true]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await markAnalyticsTest(context, { fixture: true });
    if (legacy) await context.addInitScript(() => { Intl.DisplayNames = undefined; Array.prototype.at = undefined; });
    await context.route('**/*', route => new URL(route.request().url()).origin === 'http://127.0.0.1:5186' ? route.continue() : route.abort());
    let searches = 0;
    await context.route('**/api/**', async route => {
      if (new URL(route.request().url()).pathname !== '/api/flights/search') return route.fulfill({ json: { data: [] } });
      searches++;
      const body = route.request().postDataJSON();
      assert.equal(body.origin, 'AYT'); assert.equal(body.destination, 'IST');
      await route.fulfill({ json: { data: [{ journeys: [{ segments: [{ originCode: 'AYT', destinationCode: 'IST', departureTime: `${day}T10:00:00`, arrivalTime: `${day}T11:30:00`, carrier: { marketingName: 'Fixture Air' } }], cheapestOffer: { offerId: 'fixture-android', pricing: { display: { currency: 'USD', total: 100 } } } }] }] } });
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:5186/flights?lang=tr&origin=AYT&destination=IST&departure=${day}&oneWay=1`);
    const button = page.locator('button.flightSearchButton[type=submit]');
    await button.waitFor();
    assert.equal(await page.locator('#root').getAttribute('translate'), 'no');
    // Mimic a translator detaching React's original text node and wrapping it.
    await button.locator('span').evaluate(span => {
      const translated = span.ownerDocument.createElement('font');
      translated.textContent = 'Translated search';
      span.replaceChildren(translated);
    });
    await button.click();
    await page.locator('.flightCard').waitFor();
    assert.match(await page.locator('.flightCard').innerText(), /IST/);
    assert.equal(searches, 1);
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log('Mobile AYT–IST search survives translated button text and missing Android APIs; cards render without page errors. Fixture requests only.');
} finally { await browser?.close(); await server.close(); }
