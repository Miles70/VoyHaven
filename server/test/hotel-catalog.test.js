import assert from 'node:assert/strict';
import test from 'node:test';
import { once } from 'node:events';
import { createApp } from '../src/app.js';

test('hotel name catalog searches globally without dates/rates, validates and paginates', async () => {
  const realFetch = globalThis.fetch, oldKey = process.env.NUITEE_API_KEY;
  process.env.NUITEE_API_KEY = 'sand_catalog_fixture';
  const calls = []; let fail = false;
  globalThis.fetch = async (input, options) => {
    const url = new URL(input);
    if (url.hostname !== 'api.liteapi.travel') return realFetch(input, options);
    calls.push(url);
    if (fail) return new Response(JSON.stringify({ error: { message: 'Unavailable' } }), { status: 503 });
    return new Response(JSON.stringify({ data: Array.from({ length: 21 }, (_, i) => ({ id: `lp${i}`, name: `Hotel ${i}`, city: 'Tokyo', country: 'JP', privateField: 'hidden' })) }));
  };
  const server = createApp().listen(0); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/api/hotels/catalog-search`;
  try {
    for (const query of ['', '?q=ab', '?q=Hotel&offset=-1', '?q=Hotel&offset=1.5']) assert.equal((await realFetch(base + query)).status, 400);
    assert.equal(calls.length, 0);
    const response = await realFetch(base + '?q=Hotel&offset=20&countryCode=TR&checkin=2026-12-01');
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.data.length, 20); assert.equal(body.hasMore, true); assert.equal(body.nextOffset, 40);
    assert.equal(body.data[0].privateField, undefined);
    assert.equal(calls[0].pathname, '/v3.0/data/hotels');
    assert.deepEqual(Object.fromEntries(calls[0].searchParams), { hotelName: 'Hotel', lastUpdatedAt: '1970-01-01T00:00:00Z', offset: '20', limit: '21' });
    fail = true; assert.ok((await realFetch(base + '?q=Hotel')).status >= 500);
  } finally {
    await new Promise(resolve => server.close(resolve)); globalThis.fetch = realFetch;
    if (oldKey === undefined) delete process.env.NUITEE_API_KEY; else process.env.NUITEE_API_KEY = oldKey;
  }
});
