import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { markAnalyticsTest } from './analytics-test-context.mjs';
import aboutTranslations from '../src/i18n/aboutTranslations.js';

const server = await createServer({ server: { host: '127.0.0.1', port: 5180, strictPort: true }, define: { 'import.meta.env.VITE_REOWN_PROJECT_ID': JSON.stringify('00000000000000000000000000000000'), 'import.meta.env.VITE_SUPPORT_EMAIL': JSON.stringify('support@voyhaven.com'), 'import.meta.env.VITE_API_BASE_URL': JSON.stringify('') } });
let browser;
try {
  await server.listen();
  browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
  await mkdir('test-results/about', { recursive: true });
  for (const width of [320, 390, 1280]) {
    for (const [language, copy] of Object.entries(aboutTranslations)) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      await markAnalyticsTest(context, { fixture: true });
      await context.addInitScript(language => globalThis.localStorage.setItem('language', language), language);
      await context.route('**/*', route => new URL(route.request().url()).origin === 'http://127.0.0.1:5180' ? route.continue() : route.abort());
      await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: [], hotels: [] }) }));
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`http://127.0.0.1:5180/about?lang=${language}`);
      await page.locator('.aboutPage').waitFor();
      assert.equal(await page.locator('h1').count(), 1);
      const headline = await page.locator('h1').textContent();
      assert.ok(headline.includes(copy.title) && headline.includes(copy.accent));
      assert.equal(await page.title(), `${copy.seoTitle} | VoyHaven`);
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), 'https://voyhaven.com/about');
      assert.equal(await page.locator('meta[name=description]').getAttribute('content'), copy.seoDescription);
      assert.equal(await page.locator('.aboutPage').getAttribute('dir'), language === 'ar' ? 'rtl' : 'ltr');
      assert.equal(await page.locator('.aboutValue').count(), 3);
      assert.equal(await page.locator('.aboutSteps li').count(), 3);
      assert.equal(await page.locator('.aboutButtonPrimary').getAttribute('href'), `/hotels?lang=${language}`);
      assert.equal(await page.locator('.aboutButtonSecondary').getAttribute('href'), `/flights?lang=${language}`);
      assert.equal(await page.locator('.aboutSupportLink').getAttribute('href'), `/support?lang=${language}`);
      assert.ok(!/beta|travel-first|rotavoy/i.test(await page.locator('.aboutPage').innerText()));
      assert.equal(await page.locator('.aboutHeroVisual img').evaluate(node => node.complete && node.naturalWidth > 0), true);
      const overflow = await page.evaluate(() => [...globalThis.document.querySelectorAll('.aboutPage *')].filter(node => { const rect = node.getBoundingClientRect(); return rect.right > globalThis.innerWidth + 1 || rect.left < -1; }).map(node => node.className));
      assert.deepEqual(overflow, [], `${language}, ${width}px: overflowing elements`);
      assert.deepEqual(errors, [], `${language}, ${width}px: browser exceptions`);
      if (['tr', 'ar'].includes(language)) await page.screenshot({ path: `test-results/about/${language}-${width}.png`, fullPage: true });
      await context.close();
    }
    console.log(`About page passed at ${width}px in ${Object.keys(aboutTranslations).length} languages: copy, layout, RTL, metadata, working destinations and no browser exceptions.`);
  }
} finally { if (browser) await browser.close(); await server.close(); }
