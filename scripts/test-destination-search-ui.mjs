import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { startSeoTestServer } from './seo-test-server.mjs';
import { markAnalyticsTest } from './analytics-test-context.mjs';

const destinations = [['Patong Beach', 'TH'], ['Dubai', 'AE'], ['Las Vegas', 'US'], ['Rio de Janeiro', 'BR'], ['Barcelona', 'ES'], ['Siem Reap', 'KH']];
const hotels = destinations.map(([city, country], i) => ({ id: `destination-${i}`, name: `${city} fixture hotel`, city, country, stars: 5, main_photo: '/brand/voyhaven-angel-v-v4.png' }));
const server = await startSeoTestServer();
let browser;
try {
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH, args: ['--no-sandbox', '--disable-gpu', '--disable-software-rasterizer', '--no-zygote', '--single-process'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await markAnalyticsTest(context, { fixture: true });
  await context.route('**/*', route => new URL(route.request().url()).origin === server.base ? route.continue() : route.abort());
  const catalogCalls = [], rateCalls = [];
  const searchCalls = () => catalogCalls.filter(url => destinations.some(([city]) => (url.searchParams.get("cityName") || url.searchParams.get("destination")) === city));
  await context.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    let payload = { data: [], hotels: [] };
    if (url.pathname === '/api/hotels/showcase-index') payload = { hotels: hotels.map(hotel => ({ hotelId: hotel.id, cityName: hotel.city, countryCode: hotel.country, mainPhoto: hotel.main_photo })) };
    if (url.pathname === '/api/hotels') {
      catalogCalls.push(url);
      const city = url.searchParams.get('cityName') || url.searchParams.get('destination');
      const hotel = hotels.find(hotel => hotel.city === city);
      const offset = Number(url.searchParams.get('offset'));
      // A resolved catalog scope is required for discovery links. Manual new text
      // uses destination resolution instead; a stale country must not survive it.
      const valid = hotel && (url.searchParams.get('countryCode') === hotel.country || url.searchParams.get('destination') === city);
      payload = { data: valid ? [{ ...hotel, id: `${hotel.id}-${offset}`, hotelTypeId: 204 }] : [], hotelIds: valid ? [`${hotel.id}-${offset}`] : [], total: valid ? 3 : 0, location: valid ? { countryCode: hotel.country, cityName: hotel.city } : {} };
    }
    if (url.pathname === '/api/hotels/rates') {
      const body = route.request().postDataJSON(); rateCalls.push(body);
      const data = body.hotelIds.flatMap(id => {
        const hotel = hotels.find(hotel => id === hotel.id || id.startsWith(`${hotel.id}-`));
        if (!hotel || /^destination-\d+-0$/.test(id)) return [];
        return [{ hotelId: id, roomTypes: [{ offerId: `offer-${id}`, suggestedSellingPrice: { amount: 99, currency: 'USD' }, rates: [] }] }];
      });
      payload = { data, hotels: data.map(rate => ({ ...hotels.find(hotel => rate.hotelId.startsWith(hotel.id)), id: rate.hotelId })) };
    }
    await route.fulfill({ json: payload });
  });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  for (const [city, country] of destinations) {
    await page.goto(`${server.base}/?lang=tr`);
    const card = page.locator('.travelDestinationCard').filter({ hasText: city });
    await card.waitFor();
    const href = new URL(await card.getAttribute('href'), server.base);
    assert.equal(href.searchParams.get('countryCode'), country);
    await card.click();
    await page.waitForURL(url => url.pathname === '/hotels');
    await page.locator('.travelHotelResults .travelHotelCard').first().waitFor();
    assert.equal(searchCalls().at(-1).searchParams.get('cityName'), city);
    assert.equal(searchCalls().at(-1).searchParams.get('countryCode'), country);
    assert.equal(searchCalls().at(-1).searchParams.get('offset'), '1', 'skip an unavailable first page');
    assert.equal(await page.locator('.travelHotelResults .travelHotelCard').count(), 1);
  }
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${server.base}/hotels?cityName=Patong%20Beach&countryCode=TH&auto=1&lang=tr`);
    await page.locator('.travelHotelResults .travelHotelCard').first().waitFor();
    const dates = page.locator('.travelResultDestination input[type=date]');
    await dates.nth(1).fill('2099-06-03');
    await dates.nth(0).fill('2099-06-01');
    await page.locator('.travelResultDestination button').click();
    await page.locator('.travelHotelResults .travelHotelCard').first().waitFor();
    assert.equal(searchCalls().at(-1).searchParams.get('cityName'), 'Patong Beach');
    assert.equal(searchCalls().at(-1).searchParams.get('countryCode'), 'TH');
    assert.equal(rateCalls.at(-1).checkin, '2099-06-01');
    assert.equal(rateCalls.at(-1).checkout, '2099-06-03');
    await page.locator('.travelLoadMoreButton').click();
    await page.waitForFunction(() => globalThis.document.querySelectorAll('.travelHotelResults .travelHotelCard').length === 2);
    assert.equal(searchCalls().at(-1).searchParams.get('offset'), '2');
    assert.equal(searchCalls().at(-1).searchParams.get('countryCode'), 'TH');
    await page.locator('.travelResultDestination input[type=search]').fill('Barcelona');
    await page.locator('.travelResultDestination button').click();
    await page.locator('.travelHotelResults .travelHotelCard').first().waitFor();
    assert.equal(searchCalls().at(-1).searchParams.get('destination'), 'Barcelona');
    assert.equal(searchCalls().at(-1).searchParams.has('countryCode'), false);
    assert.equal(await page.evaluate(() => globalThis.document.documentElement.scrollWidth <= globalThis.innerWidth), true);
  }
  assert.deepEqual(errors, []);
  console.log('PASS: six discovery destinations, exact country/city, mobile + desktop date changes, unavailable-page skipping, load more, switching country, no runtime errors.');
} finally { await browser?.close(); await server.close(); }
