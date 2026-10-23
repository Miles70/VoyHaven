import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { startSeoTestServer } from './seo-test-server.mjs';
import { markAnalyticsTest } from './analytics-test-context.mjs';
const server = await startSeoTestServer(); let browser;
try {
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH });
  const context = await browser.newContext();
  await markAnalyticsTest(context, { fixture: true });
  await context.addInitScript(() => {
    localStorage.setItem('voyhaven_admin_session_v2', JSON.stringify({ token: 'local-fixture-only', expiresAt: new Date(Date.now() + 3600000).toISOString() }));
  });
  await context.route('**/*', route => new URL(route.request().url()).origin === server.base ? route.continue() : route.abort());
  const row = suffix => ({ batchId: suffix, visitorId: `visitor-${suffix}`, createdAt: '2026-10-20T00:00:00Z', counts: { analytics: 1, bookings: 0 } });
  await context.route('**/api/**', route => {
    const url = new URL(route.request().url()); let payload = {};
    if (url.pathname === '/api/admin/session') payload = { admin: { email: 'fixture@example.test' } };
    else if (url.pathname === '/api/admin/settings') payload = { settings: { marginPercent: 15 } };
    else if (url.pathname === '/api/admin/data-reset') payload = { cutoff: new Date().toISOString(), analytics: 0, bookings: [], operational: {}, batches: [row('first-reset')], batchesCursor: 'a'.repeat(24) };
    else if (url.pathname === '/api/admin/data-reset/history') payload = { items: [row('older-reset')], nextCursor: null };
    else if (url.pathname === '/api/admin/data-reset/visitors') payload = { items: [row(url.searchParams.has('cursor') ? 'older-visitor' : 'first-visitor')], nextCursor: url.searchParams.has('cursor') ? null : 'b'.repeat(24) };
    else if (url.pathname === '/api/admin/analytics/v2') payload = { totals: {}, visitors: [], trend: [], confirmed: [], from: '2026-10-20', to: '2026-10-20' };
    return route.fulfill({ json: payload });
  });
  const page = await context.newPage(), errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${server.base}/admin/settings`);
  await page.getByRole('button', { name: 'Önceki sıfırlamaları göster' }).click();
  await page.getByRole('button', { name: 'Bu sıfırlamayı geri al' }).nth(1).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Bu sıfırlamayı geri al' }).count(), 2);
  assert.equal(await page.getByRole('button', { name: 'Önceki sıfırlamaları göster' }).count(), 0);
  await page.goto(`${server.base}/admin/analytics`);
  await page.locator('summary').filter({ hasText: 'Silinen ziyaretçiler' }).click();
  await page.getByRole('button', { name: 'Önceki silmeleri göster' }).click();
  await page.getByRole('button', { name: /Ziyaretçi .* geri al/ }).nth(1).waitFor();
  assert.equal(await page.getByRole('button', { name: /Ziyaretçi .* geri al/ }).count(), 2);
  assert.equal(await page.getByRole('button', { name: 'Önceki silmeleri göster' }).count(), 0);
  assert.deepEqual(errors, []);
  await context.close();

  const queueContext = await browser.newContext();
  await markAnalyticsTest(queueContext, { fixture: true });
  await queueContext.addInitScript(() => sessionStorage.setItem('voyhaven_analytics_queue_v1', JSON.stringify([
    { schemaVersion: 2, eventId: 'unverifiable-admin', contextKind: 'admin', type: 'page_view' },
    { schemaVersion: 2, eventId: 'later-visitor', type: 'page_view' },
  ])));
  await queueContext.route('**/*', route => new URL(route.request().url()).origin === server.base ? route.continue() : route.abort());
  const sent = [];
  await queueContext.route('**/api/**', route => {
    if (new URL(route.request().url()).pathname === '/api/visits/events') sent.push(route.request().postDataJSON().eventId);
    return route.fulfill({ json: { data: [], hotels: [] } });
  });
  const queuePage = await queueContext.newPage(); await queuePage.goto(server.base);
  await queuePage.waitForFunction(() => JSON.parse(sessionStorage.getItem('voyhaven_analytics_queue_v1') || '[]').length === 0);
  assert.ok(sent.includes('later-visitor')); assert.ok(!sent.includes('unverifiable-admin'));
  await queueContext.close();
  console.log('Archive history pagination and analytics queue recovery passed with intercepted local APIs.');
} finally { await browser?.close(); await server.close(); }
