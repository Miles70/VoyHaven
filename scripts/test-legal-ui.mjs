import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { markAnalyticsTest } from './analytics-test-context.mjs';
import legalTranslations from '../src/i18n/legalTranslations.js';
import footerTranslations from '../src/i18n/footerTranslations.js';

const server = await createServer({ server: { host: '127.0.0.1', port: 5181, strictPort: true }, define: { 'import.meta.env.VITE_REOWN_PROJECT_ID': JSON.stringify('00000000000000000000000000000000'), 'import.meta.env.VITE_SUPPORT_EMAIL': JSON.stringify('support@voyhaven.com'), 'import.meta.env.VITE_API_BASE_URL': JSON.stringify('') } });
// Match the standalone beta label; Scandinavian payment words such as betalning are valid copy.
let browser;
try {
  await server.listen();
  browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
  await mkdir('test-results/legal', { recursive: true });
  for (const width of [320, 1280]) {
    for (const [language, copy] of Object.entries(legalTranslations)) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      await markAnalyticsTest(context, { fixture: true });
      await context.addInitScript(language => globalThis.localStorage.setItem('language', language), language);
      await context.route('**/*', route => new URL(route.request().url()).origin === 'http://127.0.0.1:5181' ? route.continue() : route.abort());
      await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: [], hotels: [] }) }));
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      for (const policy of ['privacy', 'terms', 'refund']) {
        await page.goto(`http://127.0.0.1:5181/${policy}?lang=${language}`);
        await page.locator('.legalPage').waitFor();
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.locator('h1').textContent(), copy[policy].title);
        assert.equal(await page.title(), `${copy[policy].title} | VoyHaven`);
        assert.equal(await page.locator('meta[name=description]').getAttribute('content'), copy[policy].intro);
        assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), `https://voyhaven.com/${policy}${language === 'en' ? '' : `?lang=${language}`}`);
        assert.equal(await page.locator('.legalPage').getAttribute('dir'), language === 'ar' ? 'rtl' : 'ltr');
        assert.equal(await page.locator('.legalSection').count(), 6);
        assert.equal(await page.locator('.legalEmail').getAttribute('href'), 'mailto:support@voyhaven.com');
        assert.equal(await page.locator('.legalSupport').getAttribute('href'), `/account?tab=support&lang=${language}`);
        assert.equal(await page.locator('.legalTabs [aria-current=page]').getAttribute('href'), `/${policy}?lang=${language}`);
        const footerLegal = page.locator('.footerColumn').filter({ has: page.getByRole('heading', { name: footerTranslations[language].legal, exact: true }) });
        assert.equal(await footerLegal.locator('a').count(), 3);
        for (const key of ['privacy', 'terms', 'refund']) assert.equal(await footerLegal.getByRole('link', { name: footerTranslations[language][key], exact: true }).getAttribute('href'), `/${key}?lang=${language}`);
        assert.ok(!/\bbeta\b|rotavoy/i.test(await page.locator('.legalPage').innerText()));
        await page.locator('.legalSidebar a').last().click();
        assert.equal(new URL(page.url()).hash, `#${policy}-6`);
        await page.waitForFunction(id => { const top = globalThis.document.getElementById(id).getBoundingClientRect().top; return top >= 0 && top < 450; }, `${policy}-6`);
        const sectionTop = await page.locator('.legalSection').last().evaluate(node => node.getBoundingClientRect().top);
        assert.ok(sectionTop >= 0 && sectionTop < 450, `${language} ${policy}: contents navigation`);
        const overflow = await page.evaluate(() => [...globalThis.document.querySelectorAll('.legalPage *')].filter(node => { const rect = node.getBoundingClientRect(); return rect.right > globalThis.innerWidth + 1 || rect.left < -1; }).map(node => node.className));
        assert.deepEqual(overflow, [], `${language} ${policy} ${width}px: overflow`);
        assert.deepEqual(errors, [], `${language} ${policy}: browser exceptions`);
        if (['tr', 'ar'].includes(language)) { await page.evaluate(() => globalThis.scrollTo(0, 0)); await page.screenshot({ path: `test-results/legal/${language}-${policy}-${width}.png`, fullPage: true }); }
      }
      // Verify actual footer navigation preserves the selected language.
      await page.locator('footer').getByRole('link', { name: footerTranslations[language].privacy, exact: true }).click();
      await page.locator('h1').filter({ hasText: copy.privacy.title }).waitFor();
      assert.equal(new URL(page.url()).searchParams.get('lang'), language);
      await context.close();
    }
    console.log(`Legal pages passed at ${width}px in ${Object.keys(legalTranslations).length} languages: footer navigation, contents anchors, RTL, metadata, support links and layout.`);
  }
} finally { if (browser) await browser.close(); await server.close(); }
