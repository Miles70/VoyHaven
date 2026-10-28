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
  for (const [width, legacy] of [[390, false], [390, true], [1280, false]]) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: width === 390, hasTouch: width === 390 });
    await markAnalyticsTest(context, { fixture: true });
    if (legacy) await context.addInitScript(() => { Intl.DisplayNames = undefined; Array.prototype.at = undefined; });
    await context.route('**/*', route => new URL(route.request().url()).origin === 'http://127.0.0.1:5186' ? route.continue() : route.abort());
    let searches = 0;
    await context.route('**/api/**', async route => {
      if (new URL(route.request().url()).pathname !== '/api/flights/search') return route.fulfill({ json: { data: [] } });
      searches++;
      const body = route.request().postDataJSON();
      assert.equal(body.origin, 'AYT'); assert.equal(body.destination, 'IST');
      await route.fulfill({ json: { data: [{ journeys: [{ segments: [{ originCode: 'AYT', originName: 'Antalya International Airport', destinationCode: 'IST', destinationName: 'Istanbul International Airport', departureTime: `${day}T10:00:00`, arrivalTime: `${day}T11:30:00`, carrier: { marketingName: 'Fixture Air', operatingName: 'Operating Air' }, duration: { minutes: 90 } }], cheapestOffer: { offerId: 'fixture-android', baggage: { included: [{ bagType: 'cabin', pieces: 1, weightKg: 8, description: 'Carry-on bag' }, { bagType: 'checked', pieces: 0, weightKg: 15, description: 'Checked bag' }, null], paid: [{ bagType: 'checked', weightKg: 5, pricing: { display: { amount: 20, currency: 'USD' } } }] }, fare: { seatsRemaining: 4 }, terms: { refundable: false, changeable: true, summary: [{ message: 'Refundable with penalty' }, { message: 'Refund fee: from 1100 USD' }, { message: 'Changes allowed with penalty' }, { message: 'Change fee: from 950 TRY' }] }, pricing: { display: { currency: 'USD', total: 100 } } } }] }] } });
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
    await page.getByText('Kabin bagajı: 1 adet · 8 kg', { exact: true }).waitFor();
    await page.getByText('Uçak altı bagajı: 15 kg', { exact: true }).waitFor();
    assert.doesNotMatch(await page.locator('.flightBaggageSummary').innerText(), /Carry-on bag|0 adet/);
    await page.locator('.flightCardDetails > summary').click();
    await page.getByText('Uçuş süresi: 1:30', { exact: true }).waitFor();
    await page.getByText('Uçuşu gerçekleştiren: Operating Air', { exact: true }).waitFor();
    const conditions = await page.locator('.flightOfferDetails').innerText();
    assert.match(conditions, /Ceza ücreti uygulanarak iade edilebilir/);
    assert.match(conditions, /İade cezası: Başlangıç tutarı 1100 USD/);
    assert.match(conditions, /Değişiklik ücreti: Başlangıç tutarı 950 TRY/);
    assert.doesNotMatch(conditions, /Refundable|Refund fee|Changes allowed|Change fee/);
    assert.doesNotMatch(await page.locator('.flightCard').innerText(), /International Airport/);
    await page.locator('.flightPaidBaggage > summary').click();
    assert.match(await page.locator('.flightPaidBaggage').innerText(), /5 kg/);
    assert.equal(searches, 1);
    assert.deepEqual(errors, []);
    await page.locator('.flightCard').screenshot({ path: `/tmp/voyhaven-baggage-${width}.png` });
    await context.close();
  }
  console.log('Mobile AYT–IST search survives translated button text and missing Android APIs; cards render without page errors. Fixture requests only.');
} finally { await browser?.close(); await server.close(); }
