import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { markAnalyticsTest } from './analytics-test-context.mjs';
const server = await createServer({ server: { host: '127.0.0.1', port: 5185, strictPort: true }, define: { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify(''), 'import.meta.env.VITE_REOWN_PROJECT_ID': JSON.stringify('00000000000000000000000000000000') } });
let browser;
const day = offset => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
try {
  await server.listen();
  browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
  for (const roundTrip of [false, true]) {
    const context = await browser.newContext({ viewport: { width: roundTrip ? 390 : 1280, height: 900 } });
    await markAnalyticsTest(context, { fixture: true });
    const requests = [], errors = [];
    await context.route('**/*', route => new URL(route.request().url()).origin === 'http://127.0.0.1:5185' ? route.continue() : route.abort());
    await context.route('**/api/**', async route => {
      let payload = {};
      if (new URL(route.request().url()).pathname === '/api/flights/search') {
        const body = route.request().postDataJSON(); requests.push(body);
        assert.equal(body.origin, 'AYT'); assert.equal(body.destination, 'UFA'); assert.equal(body.cabinClass, 'ECONOMY'); assert.equal(body.adults, 1);
        if (body.departure === day(8)) {
          if (roundTrip) assert.equal(body.returnDate, day(15));
          const segments = [{ originCode: 'AYT', destinationCode: 'UFA', direction: 'OUTBOUND', departureTime: `${day(8)}T10:00:00`, arrivalTime: `${day(8)}T16:00:00`, carrier: { marketingName: 'Fixture Air', marketingCode: 'XX' }, flight: { marketingNumber: '123' } }];
          if (roundTrip) segments.push({ ...segments[0], originCode: 'UFA', destinationCode: 'AYT', direction: 'INBOUND', departureTime: `${day(15)}T10:00:00`, arrivalTime: `${day(15)}T12:00:00` });
          payload = { data: [null, { journeys: [{ segments, cheapestOffer: { offerId: 'fixture-bookable-offer', pricing: { display: { total: 200, currency: 'USD' } } } }] }] };
        } else payload = { data: [{ journeys: [] }] };
      }
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(payload) });
    });
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:5185/flights?lang=tr&origin=AYT&destination=UFA&departure=${day(7)}&oneWay=${roundTrip ? '0' : '1'}${roundTrip ? `&returnDate=${day(14)}` : ''}&auto=1`);
    await page.getByRole('button', { name: 'Yakın tarihleri ara', exact: true }).waitFor();
    assert.equal(requests.length, 1, 'economy recovery must be opt-in');
    await page.getByRole('button', { name: 'Yakın tarihleri ara', exact: true }).click();
    await page.locator('.flightCard').waitFor();
    assert.equal(await page.locator('.flightCard').count(), 1);
    await page.getByText('Yakın tarihlerde seçenekler bulundu.', { exact: false }).waitFor();
    assert.ok(await page.locator('.flightNewDates').innerText());
    assert.equal(await page.locator('input[type=date]').first().inputValue(), day(8));
    assert.equal(errors.length, 0, errors.join('\n'));
    await context.close();
  }
  console.log('Economy empty → opt-in nearby search → priced card and explicit new dates passed for one-way/round-trip, desktop/mobile. All requests intercepted.');
} finally { await browser?.close(); await server.close(); }
