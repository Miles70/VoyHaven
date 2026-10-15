import { addedLanguages } from "../../shared/languages.js";
import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../src/app.js';
import { normalizeHotelReviews, mappedHotelRoom } from '../../shared/hotelContent.js';

test('review content preserves low scores and criticism, omits invalid dates and internal fields', () => {
  const rows = normalizeHotelReviews({ data: [{ name: '<b>Guest</b>', averageScore: 0, date: '2026-02-30', cons: '<p>Noisy room</p>', privateData: 'secret' }, { averageScore: 99, pros: 'Nice view' }] });
  assert.equal(rows[0].score, 0); assert.equal(rows[0].cons, 'Noisy room'); assert.equal(rows[0].date, '');
  assert.equal(rows[1].score, null); assert.ok(!JSON.stringify(rows).includes('secret'));
});

test('room mapping requires an exact provider ID rather than similar room names', () => {
  const rooms = [{ id: 42, roomName: 'Suite' }, { id: 43, roomName: 'Suite' }];
  assert.equal(mappedHotelRoom({ mappedRoomId: '42' }, rooms), rooms[0]);
  assert.equal(mappedHotelRoom({ name: 'Suite' }, rooms), null);
  assert.equal(mappedHotelRoom({ mappedRoomId: 99 }, rooms), null);
});

test('review API bounds results, separates language caches and validates IDs; important information uses source text', async () => {
  const realFetch = globalThis.fetch, previousKey = process.env.NUITEE_API_KEY;
  process.env.NUITEE_API_KEY = 'sand_test';
  const calls = [];
  globalThis.fetch = async (input, options) => {
    const url = new URL(input);
    if (url.hostname !== 'api.liteapi.travel') return realFetch(input, options);
    calls.push(url);
    if (url.pathname.endsWith('/reviews')) return Response.json({ data: Array.from({ length: 7 }, (_, index) => ({ name: 'Guest', pros: `Review ${index}`, averageScore: index, date: '2026-10-12' })) });
    if (url.pathname.endsWith('/hotel')) return Response.json({ data: { hotelImportantInformation: '<p>Photo ID is required at check-in.</p>' } });
    throw new Error(`Unexpected path ${url.pathname}`);
  };
  const server = createApp().listen(0); await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/hotels/lp-content-test`;
  try {
    const first = await realFetch(`${base}/reviews?language=tr`); assert.equal(first.status, 200);
    const body = await first.json(); assert.equal(body.reviews.length, 6); assert.equal(body.nextOffset, 6);
    assert.equal(calls[0].searchParams.get('language'), 'tr'); assert.equal(calls[0].searchParams.get('limit'), '7');
    await realFetch(`${base}/reviews?language=tr`); assert.equal(calls.length, 1);
    await realFetch(`${base}/reviews?language=de`); assert.equal(calls.length, 2);
    await realFetch(`${base}/reviews?language=tr&offset=6`); assert.equal(calls.at(-1).searchParams.get('offset'), '6');
    for (const language of addedLanguages) {
      const before = calls.length;
      const response = await realFetch(`${base}/reviews?language=${language}`);
      assert.equal(response.status, 200, language);
      assert.equal((await response.json()).language, language);
      assert.equal(calls.at(-1).searchParams.get('language'), language);
      assert.equal(calls.length, before + 1, `${language} uses its own cache`);
      await realFetch(`${base}/reviews?language=${language}`);
      assert.equal(calls.length, before + 1, `${language} reuses its cache`);
    }
    assert.equal((await realFetch(`${base}/reviews?language=xx`)).status, 400);
    const info = await (await realFetch(`${base}/information?language=en`)).json(); assert.equal(info.information, 'Photo ID is required at check-in.');
  } finally { await new Promise(resolve => server.close(resolve)); globalThis.fetch = realFetch; if (previousKey === undefined) delete process.env.NUITEE_API_KEY; else process.env.NUITEE_API_KEY = previousKey; }
});
