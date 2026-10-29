import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { startSeoTestServer } from './seo-test-server.mjs';
import { markAnalyticsTest } from './analytics-test-context.mjs';
import { languages, copy } from '../seo/copy.js';
const server = await startSeoTestServer();
let browser;
try {
 browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
 await mkdir('test-results/seo', { recursive: true });
 for (const lang of languages) {
  const context = await browser.newContext({ javaScriptEnabled: false });
  await markAnalyticsTest(context, { fixture: true });
  await context.route('**/*', route => new URL(route.request().url()).origin === server.base ? route.continue() : route.abort());
  await context.route('**/api/**', route => route.abort());
  const page = await context.newPage();
  for (const suffix of ['', '/hotels', '/flights', '/hotels/antalya', '/travel/hotels/lp55de7', '/flights/ayt-fra']) {
   const response = await page.goto(`${server.base}/${lang}${suffix}`);
   assert.equal(response.status(), 200);
   assert.ok((await page.locator('h1').textContent()).trim());
   assert.equal(await page.locator('html').getAttribute('lang'), lang);
   assert.equal(await page.locator('link[rel=canonical]').count(), 1);
   assert.equal(await page.locator('link[rel=alternate][hreflang]').count(), languages.length + 1);
  }
  await context.close();
 }
 for (const width of [320, 390, 1280]) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  await markAnalyticsTest(context, { fixture: true });
  await context.route('**/*', route => new URL(route.request().url()).origin === server.base ? route.continue() : route.abort());
  await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: [], hotels: [] }) }));
  await context.route('https://static.cupid.travel/**', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#19c6d8"/></svg>' }));
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${server.base}/tr/travel/hotels/lp55de7`);
  await page.getByRole('button', { name: copy.tr.theme }).click();
  await page.locator('.seoDark').waitFor();
  const overflowing = await page.evaluate(() => [...globalThis.document.querySelectorAll('body *')].filter(node => node.getBoundingClientRect().right > globalThis.innerWidth + 1).map(node => ({ tag: node.tagName, className: node.className, width: node.getBoundingClientRect().width })).slice(0, 12));
  assert.equal(await page.evaluate(() => globalThis.document.documentElement.scrollWidth > globalThis.innerWidth), false, JSON.stringify(overflowing));
  await page.screenshot({ path: `test-results/seo/hotel-${width}.png`, fullPage: true });
  await page.locator('.seoLanguages a[lang=ar]').click();
  assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
  assert.ok((await page.locator('h1').textContent()).includes('Megasaray'));
  const rtlOverflow = await page.evaluate(() => ({ width: globalThis.document.documentElement.scrollWidth, viewport: globalThis.innerWidth, elements: [...globalThis.document.querySelectorAll('body *')].filter(node => {
   const bounds = node.getBoundingClientRect();
   return bounds.left < -1 || bounds.right > globalThis.innerWidth + 1;
  }).map(node => ({ tag: node.tagName, className: node.getAttribute('class'), left: node.getBoundingClientRect().left, right: node.getBoundingClientRect().right })).slice(0, 12) }));
  await page.screenshot({ path: `test-results/seo/hotel-ar-${width}.png`, fullPage: true });
  assert.ok(rtlOverflow.width <= rtlOverflow.viewport, JSON.stringify(rtlOverflow));
  await page.goto(`${server.base}/tr/flights/ayt-fra`);
  await page.locator('.seoCta').click();
  await page.locator('.flightSearchForm').waitFor();
  assert.equal(await page.locator('html').getAttribute('lang'), 'tr');
  assert.equal(await page.locator('meta[name=robots]').getAttribute('content'), 'noindex, follow');
  assert.ok((await page.locator('.flightSearchForm').innerText()).includes(copy.tr.flightCta));
  const airportValues = await page.locator('.flightSearchForm input[role=combobox]').evaluateAll(nodes => nodes.map(node => node.value));
  assert.ok(airportValues.some(value => value.includes('Antalya')));
  assert.ok(airportValues.some(value => value.includes('Frankfurt')));
  // The live SPA updates query language without losing dates or airport state.
  await page.locator('.languageButton').click();
  await page.getByRole('option', { name: /العربية/ }).click();
  await page.waitForURL('**/flights?**lang=ar**');
  await page.waitForFunction(() => globalThis.document.documentElement.dir === 'rtl' && globalThis.document.documentElement.lang === 'ar');
  assert.equal(new URL(page.url()).searchParams.get('origin'), 'AYT');
  assert.equal(new URL(page.url()).searchParams.get('destination'), 'FRA');
  assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
  await page.locator('.travelCategoryControl > button').click();
  assert.equal(await page.locator('.travelCategoryDropdown a[href="/hotels?lang=ar"]').count(), 1);
  assert.equal(await page.locator('.travelCategoryDropdown a[href="/flights?lang=ar"]').count(), 1);
  await page.locator('.travelCategoryDropdown a[href="/flights?lang=ar"]').click();
  await page.waitForURL('**/flights?lang=ar');
  await page.locator('.flightSearchForm').waitFor();
  await page.reload();
  await page.locator('.flightSearchForm').waitFor();
  assert.equal(await page.locator('.seoSite').count(), 0);
  await page.locator('.customerHeaderAuthButton').focus();
  // The existing mobile UI intentionally hides this desktop hover preview.
  await page.locator('.customerLoginPreview').waitFor({ state: width > 620 ? 'visible' : 'hidden' });
  assert.equal(await page.evaluate(() => globalThis.document.documentElement.scrollWidth > globalThis.innerWidth), false, `Arabic login preview overflow at ${width}px`);
  await page.locator('.languageButton').click();
  await page.getByRole('option', { name: /Türkçe/ }).click();
  await page.waitForURL('**/flights?**lang=tr**');
  await page.waitForFunction(() => globalThis.document.documentElement.dir === 'ltr' && globalThis.document.documentElement.lang === 'tr');
  assert.equal(await page.locator('link[rel=canonical]').count(), 1);
  assert.equal(await page.locator('meta[name=robots]').getAttribute('content'), 'noindex, follow');
  // Switching language must retain the flight selected in router history state.
  await page.evaluate(() => {
   const result = { total: 123.45, currency: 'EUR', offer: { offerId: 'fixture' }, segments: [{ originCode: 'AYT', destinationCode: 'FRA', departureTime: '2099-10-01T10:00:00', direction: 'OUTBOUND' }] };
   globalThis.history.pushState({ usr: { result, passengers: { adults: 1, children: 1, infants: 1 } }, key: 'locale-fixture', idx: 2 }, '', '/flights/checkout?lang=tr');
  });
  await page.reload();
  await page.locator('.accountForm').waitFor();
  await page.locator('.languageButton').click();
  await page.getByRole('option', { name: /日本語/ }).click();
  await page.waitForURL('**/flights/checkout?lang=ja');
  await page.waitForFunction(() => globalThis.document.documentElement.lang === 'ja');
  assert.equal(await page.locator('.accountForm').count(), 1);
  assert.ok((await page.locator('h1').innerText()).includes('AYT'));
  assert.ok(!(await page.locator('.accountForm').innerText()).match(/Yetişkin|Çocuk|Bebek|Belgedeki|İletişim/));
  assert.equal(await page.locator('html').getAttribute('lang'), 'ja');
  const response = await page.goto(`${server.base}/tr/hotels/does-not-exist`);
  assert.equal(response.status(), 404);
  assert.equal(response.headers()['x-robots-tag'], 'noindex, follow');
  assert.deepEqual(errors, []);
  await context.close();
 }
 console.log(`SEO browser tests: ${languages.length} languages without JavaScript, hydration, 320/390/1280px, RTL, theme, equivalent language links, route-to-search prefill and HTTP 404 passed.`);
} finally { if (browser) await browser.close(); await server.close(); }
