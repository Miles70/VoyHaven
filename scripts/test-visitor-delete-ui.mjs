import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { markAnalyticsTest } from './analytics-test-context.mjs';
const server = await createServer({ server: { host: '127.0.0.1', port: 5183, strictPort: true }, define: { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify('') } });
let browser;
try {
  await server.listen(); browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
  for (const width of [390, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    await markAnalyticsTest(context, { fixture: true });
    await context.addInitScript(() => localStorage.setItem('voyhaven_admin_session_v2', JSON.stringify({ token: 'fixture-admin', expiresAt: new Date(Date.now() + 3600000).toISOString() })));
    let deleted = false, deletes = 0, restores = 0;
    const visitorId = 'fixture-visitor-12345', batchId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    await context.route('**/*', route => new URL(route.request().url()).origin === 'http://127.0.0.1:5183' ? route.continue() : route.abort());
    await context.route('**/api/**', async route => {
      const url = new URL(route.request().url()); let data = {};
      if (url.pathname === '/api/admin/session') data = { admin: { displayName: 'Fixture admin' } };
      if (url.pathname === '/api/admin/analytics/v2') data = { totals: { visitors: deleted ? 0 : 1, sessions: deleted ? 0 : 1, events: deleted ? 0 : 2 }, visitors: deleted ? [] : [{ _id: visitorId, country: 'Türkiye', city: 'Antalya', events: 2, sessionCount: 1, trafficTypes: ['visitor'], lastSeen: new Date().toISOString() }], generatedAt: new Date().toISOString() };
      if (url.pathname === '/api/admin/data-reset/visitors') data = { items: deleted ? [{ batchId, visitorId, counts: { analytics: 2 }, createdAt: new Date().toISOString() }] : [] };
      if (url.pathname === `/api/admin/data-reset/visitors/${visitorId}`) { assert.equal(route.request().method(), 'POST'); deleted = true; deletes++; data = { batchId, visitorId, count: 2 }; }
      if (url.pathname === `/api/admin/data-reset/${batchId}/restore`) { deleted = false; restores++; data = { ok: true }; }
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
    });
    const page = await context.newPage(); await page.goto('http://127.0.0.1:5183/admin/analytics?lang=tr');
    await page.getByRole('button', { name: 'Ziyaretçi or-12345 kaydını sil', exact: true }).click();
    await page.getByRole('button', { name: 'Vazgeç', exact: true }).click(); assert.equal(deletes, 0);
    await page.getByRole('button', { name: 'Ziyaretçi or-12345 kaydını sil', exact: true }).click();
    await page.getByRole('button', { name: 'Evet, ziyaretçiyi sil', exact: true }).click();
    await page.getByText('Ziyaretçi silindi;', { exact: false }).waitFor(); assert.equal(deletes, 1);
    await page.getByText('Bu filtrelerde ziyaretçi yok.', { exact: false }).waitFor();
    await page.locator('summary').filter({ hasText: 'Silinen ziyaretçiler' }).click();
    await page.getByRole('button', { name: 'Ziyaretçi or-12345 geri al', exact: true }).click();
    await page.getByRole('button', { name: 'Ziyaretçi or-12345 kaydını sil', exact: true }).waitFor(); assert.equal(restores, 1);
    await context.close();
  }
  console.log('Visitor delete/cancel/restore flows passed on mobile and desktop; production requests intercepted.');
} finally { await browser?.close(); await server.close(); }
