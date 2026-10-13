import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { markAnalyticsTest } from './analytics-test-context.mjs';

const server = await createServer({ server: { host: '127.0.0.1', port: 5175, strictPort: true }, define: { 'import.meta.env.VITE_REOWN_PROJECT_ID': JSON.stringify('00000000000000000000000000000000'), 'import.meta.env.VITE_API_BASE_URL': JSON.stringify('') } });
let browser;
try {
  await server.listen();
  browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
  for (const width of [390, 1280]) {
    for (const reducedMotion of ['no-preference', 'reduce']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, permissions: ['geolocation'], geolocation: { latitude: 36.9, longitude: 30.7 }, reducedMotion });
      await markAnalyticsTest(context, { fixture: true });
      await context.addInitScript(() => {
        globalThis.localStorage.setItem('language', 'tr');
        globalThis.nearbyScrollCalls = [];
        const original = globalThis.Element.prototype.scrollIntoView;
        globalThis.Element.prototype.scrollIntoView = function(options) {
          if (this.classList.contains('travelHotelResults')) globalThis.nearbyScrollCalls.push(options);
          return original.call(this, options);
        };
      });
      await context.route('**/*', route => new URL(route.request().url()).origin === 'http://127.0.0.1:5175' ? route.continue() : route.abort());
      let releaseRates;
      const ratesGate = new Promise(resolve => { releaseRates = resolve; });
      let empty = false;
      await context.route('**/api/**', async route => {
        const url = new URL(route.request().url());
        let payload = { data: [], hotels: [] };
        if (url.pathname === '/api/hotels' && url.searchParams.has('latitude')) {
          payload = { hotelIds: empty ? [] : ['nearby-fixture'], total: 1, location: { latitude: 36.9, longitude: 30.7, radius: 10000 } };
        } else if (url.pathname === '/api/hotels/rates') {
          await ratesGate;
          payload = { data: [{ hotelId: 'nearby-fixture', roomTypes: [{ offerId: 'nearby-offer', suggestedSellingPrice: { amount: 100, currency: 'USD' }, rates: [] }] }], hotels: [{ id: 'nearby-fixture', name: 'Nearby fixture hotel', stars: 5, latitude: 36.91, longitude: 30.71 }] };
        }
        await route.fulfill({ contentType: 'application/json', body: JSON.stringify(payload) });
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://127.0.0.1:5175/');
      await page.locator('.travelNearbyButton').click();
      await page.waitForFunction(() => globalThis.document.querySelector('.travelNearbyButton')?.disabled);
      assert.equal(await page.evaluate(() => globalThis.nearbyScrollCalls.length), 0);
      releaseRates();
      await page.locator('.travelHotelResults').waitFor();
      await page.waitForFunction(() => globalThis.nearbyScrollCalls.length === 1);
      await page.waitForFunction(() => {
        const top = globalThis.document.querySelector('.travelHotelResults').getBoundingClientRect().top;
        return top >= 0 && top <= 110;
      });
      assert.equal(await page.evaluate(() => globalThis.nearbyScrollCalls[0].behavior), reducedMotion === 'reduce' ? 'instant' : 'smooth');
      await page.evaluate(() => globalThis.window.scrollTo({ top: 0, behavior: 'instant' }));
      empty = true;
      await page.locator('.travelNearbyButton').click();
      await page.locator('.travelSearchMessage--error').waitFor();
      assert.equal(await page.evaluate(() => globalThis.nearbyScrollCalls.length), 1);
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`Nearby scroll passed: ${width}px, ${reducedMotion}, waits for rates, aligns below header, no scroll on empty results.`);
    }
  }
} finally {
  if (browser) await browser.close();
  await server.close();
}
