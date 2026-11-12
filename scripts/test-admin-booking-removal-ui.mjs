import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { markAnalyticsTest } from './analytics-test-context.mjs';

const server = await createServer({ server: { host: '127.0.0.1', port: 5183, strictPort: true }, define: { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify('') } });
let browser;
try {
  await server.listen();
  browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
  await mkdir('test-results/admin-bookings', { recursive: true });
  for (const [width, dark] of [[390, true], [1440, false]]) {
    const context = await browser.newContext({ viewport: { width, height: 950 } });
    await markAnalyticsTest(context, { fixture: true });
    await context.addInitScript(dark => {
      localStorage.setItem('voyhaven_admin_session_v2', JSON.stringify({ token: 'fixture-admin-token', expiresAt: new Date(Date.now() + 60000).toISOString() }));
      localStorage.setItem('voyhaven_admin_theme', dark ? 'dark' : 'light');
    }, dark);
    const booking = { clientReference: 'TRV-DEMO-PAID', status: 'confirmed', paymentStatus: 'paid', total: 25, currency: 'USD', holder: { firstName: 'Demo', lastName: 'Guest', email: 'demo@example.test' }, stay: { hotelName: 'Demo Hotel' }, guests: [], payment: {} };
    let deleted = false, writes = 0, failOnce = true;
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url());
      if (url.origin !== 'http://127.0.0.1:5183') return route.abort();
      if (!url.pathname.startsWith('/api/')) return route.continue();
      let body = {}, status = 200;
      if (url.pathname === '/api/admin/session') body = { admin: { identity: 'Fixture admin' } };
      else if (url.pathname === '/api/admin/bookings' && request.method() === 'GET') body = { items: deleted ? [] : [booking], total: deleted ? 0 : 1, limit: 25, page: 1 };
      else if (url.pathname === '/api/admin/bookings/TRV-DEMO-PAID' && request.method() === 'GET') body = { booking, note: '' };
      else if (request.method() === 'DELETE') {
        assert.equal(request.postDataJSON().confirmation, booking.clientReference);
        if (failOnce) { failOnce = false; status = 409; body = { message: 'Rezervasyon işlemi sürüyor.' }; }
        else { deleted = true; writes++; body = { ok: true, clientReference: booking.clientReference, batchId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' }; }
      } else if (url.pathname.endsWith('/restore')) { deleted = false; body = { ok: true }; }
      return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('http://127.0.0.1:5183/admin/bookings');
    const remove = page.getByRole('button', { name: 'TRV-DEMO-PAID kaydını sil', exact: true });
    await remove.click();
    await page.getByRole('button', { name: 'Vazgeç', exact: true }).click();
    assert.equal(writes, 0);
    await page.getByRole('button', { name: 'Detay', exact: true }).click();
    await page.getByRole('button', { name: 'Kaydı sil', exact: true }).click();
    await page.getByRole('button', { name: 'Evet, kaydı sil', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Rezervasyon işlemi sürüyor.' }).waitFor();
    assert.equal(writes, 0);
    await page.getByRole('button', { name: 'Evet, kaydı sil', exact: true }).click();
    await page.getByText('Rezervasyon kaydı silindi.', { exact: true }).waitFor();
    assert.equal(writes, 1);
    await page.getByRole('button', { name: 'Silmeyi geri al', exact: true }).click();
    await page.getByText('Rezervasyon kaydı geri alındı.', { exact: true }).waitFor();
    await remove.waitFor();
    assert.deepEqual(errors, []);
    await page.screenshot({ path: `test-results/admin-bookings/booking-removal-${width}.png`, fullPage: true });
    await context.close();
  }
  console.log('Admin booking removal: mobile/dark and desktop/light cancellation, detail entry, server conflict, delete, refresh and undo passed.');
} finally { if (browser) await browser.close(); await server.close(); }
