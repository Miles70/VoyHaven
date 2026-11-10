import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../src/app.js';

test('global search resolves countries and cities and preserves pagination boundaries', async () => {
  const realFetch = globalThis.fetch;
  const previousKey = process.env.NUITEE_API_KEY;
  process.env.NUITEE_API_KEY = 'sand_test';
  const upstream = [];
  globalThis.fetch = async (input, options) => {
    const url = new URL(input);
    if (url.hostname !== 'api.liteapi.travel') return realFetch(input, options);
    upstream.push(url);
    if (url.pathname.endsWith('/countries')) return Response.json({ data: [{ code: 'TR', name: 'Turkey' }, { code: 'DE', name: 'Germany' }, { code: 'TH', name: 'Thailand' }] });
    if (url.pathname.endsWith('/places')) {
      if (url.searchParams.get('textQuery') === 'NotARealDestination') return Response.json({ data: [] });
      return Response.json({ data: [{ placeId: 'dubai-place', displayName: 'Dubai' }] });
    }
    if (url.pathname.endsWith('/places/dubai-place')) return Response.json({ data: { addressComponents: [{ longText: 'Dubai', types: ['locality'] }, { shortText: 'AE', types: ['country'] }] } });
    if (url.pathname.endsWith('/hotels')) return Response.json({ data: [{ id: 'hotel-1' }], hotelIds: ['hotel-1'], total: 50 });
    throw new Error(`Unexpected upstream path ${url.pathname}`);
  };
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/hotels`;
  try {
    for (const [name, code] of [['Almanya', 'DE'], ['Tayland', 'TH'], ['Türkiye', 'TR']]) {
      const response = await realFetch(`${base}?destination=${encodeURIComponent(name)}`);
      assert.equal(response.status, 200);
      assert.deepEqual((await response.json()).location, { countryCode: code });
      const query = upstream.at(-1).searchParams;
      assert.equal(query.get('countryCode'), code);
      assert.equal(query.has('cityName'), false);
    }
    const city = await realFetch(`${base}?destination=Dubai`);
    assert.deepEqual((await city.json()).location, { countryCode: 'AE', cityName: 'Dubai' });
    assert.equal(upstream.at(-1).searchParams.get('cityName'), 'Dubai');
    assert.equal(upstream.at(-1).searchParams.get('countryCode'), 'AE');
    const more = await realFetch(`${base}?placeId=dubai-place&offset=20&limit=20`);
    assert.equal(more.status, 200);
    assert.equal(upstream.at(-1).searchParams.get('offset'), '20');
    assert.equal(upstream.at(-1).searchParams.get('placeId'), 'dubai-place');
    const before = upstream.filter((url) => url.pathname.endsWith('/hotels')).length;
    const missing = await realFetch(`${base}?destination=NotARealDestination`);
    assert.equal(missing.status, 400);
    assert.equal(upstream.filter((url) => url.pathname.endsWith('/hotels')).length, before);
    const nearby = await realFetch(`${base}?latitude=36.9&longitude=30.7&radius=25000`);
    assert.equal(nearby.status, 200);
    assert.equal(nearby.headers.get('cache-control'), 'private, no-store');
    assert.deepEqual((await nearby.json()).location, { latitude: 36.9, longitude: 30.7, radius: 25000 });
    assert.equal(upstream.at(-1).searchParams.get('latitude'), '36.9');
    assert.equal(upstream.at(-1).searchParams.get('longitude'), '30.7');
    assert.equal(upstream.at(-1).searchParams.get('radius'), '25000');
    assert.equal(upstream.at(-1).searchParams.has('countryCode'), false);
    const equator = await realFetch(`${base}?latitude=0&longitude=0`);
    assert.equal(equator.status, 200);
    for (const query of ['latitude=91&longitude=0', 'latitude=0&longitude=-181', 'latitude=&longitude=0', 'latitude=36.9', 'latitude=NaN&longitude=0']) {
      const invalid = await realFetch(`${base}?${query}`);
      assert.equal(invalid.status, 400);
    }
    const legacy = await realFetch(`${base}?countryCode=TR&cityName=Antalya`);
    assert.equal(legacy.status, 200);
    assert.equal(upstream.at(-1).searchParams.get('cityName'), 'Antalya');
  } finally {
    globalThis.fetch = realFetch;
    if (previousKey === undefined) delete process.env.NUITEE_API_KEY;
    else process.env.NUITEE_API_KEY = previousKey;
    await new Promise((resolve) => server.close(resolve));
  }
});

test('catalog city names win over map aliases, with canonical/place fallbacks and stable pagination', async () => {
  const realFetch = globalThis.fetch;
  const previousKey = process.env.NUITEE_API_KEY;
  process.env.NUITEE_API_KEY = 'sand_test';
  const queries = [];
  globalThis.fetch = async (input, options) => {
    const url = new URL(input);
    if (url.hostname !== 'api.liteapi.travel') return realFetch(input, options);
    if (url.pathname.endsWith('/countries')) return Response.json({ data: [{ code: 'TH', name: 'Thailand' }] });
    if (url.pathname.endsWith('/places')) return Response.json({ data: [{ placeId: url.searchParams.get('textQuery'), displayName: url.searchParams.get('textQuery') }] });
    if (url.pathname.includes('/places/')) {
      const name = decodeURIComponent(url.pathname.split('/').at(-1));
      const city = name === 'Patong Beach' ? 'Pa Tong' : name === 'Localized City' ? 'Catalog City' : 'Unknown Map City';
      return Response.json({ data: { addressComponents: [{ longText: city, types: ['locality'] }, { shortText: 'TH', types: ['country'] }] } });
    }
    if (url.pathname.endsWith('/hotels')) {
      queries.push(url);
      const found = ['Patong Beach', 'Catalog City'].includes(url.searchParams.get('cityName')) || url.searchParams.has('placeId');
      return Response.json({ data: found ? [{ id: 'catalog-hotel', city: url.searchParams.get('cityName') }] : [], hotelIds: found ? ['catalog-hotel'] : [], total: found ? 443 : 0 });
    }
    throw Error(`Unexpected upstream ${url.pathname}`);
  };
  const server = createApp().listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/hotels`;
  try {
    const beach = await realFetch(`${base}?destination=Patong%20Beach&limit=20&hotelTypeIds=204`);
    assert.equal(beach.status, 200);
    assert.deepEqual((await beach.json()).location, { countryCode: 'TH', cityName: 'Patong Beach', hotelTypeIds: '204' });
    assert.equal(queries.at(-1).searchParams.get('cityName'), 'Patong Beach');
    assert.equal(queries.at(-1).searchParams.get('hotelTypeIds'), '204');
    const before = queries.length;
    await realFetch(`${base}?destination=Patong%20Beach&limit=20&offset=20&hotelTypeIds=219`);
    assert.equal(queries.length, before + 1, 'cached verified scope must not be re-resolved on later pages');
    assert.equal(queries.at(-1).searchParams.get('cityName'), 'Patong Beach');
    assert.equal(queries.at(-1).searchParams.get('offset'), '20');
    assert.equal(queries.at(-1).searchParams.get('hotelTypeIds'), '219');
    const localized = await realFetch(`${base}?destination=Localized%20City`);
    assert.deepEqual((await localized.json()).location, { countryCode: 'TH', cityName: 'Catalog City' });
    const place = await realFetch(`${base}?destination=Uncatalogued%20District`);
    assert.deepEqual((await place.json()).location, { placeId: 'Uncatalogued District' });
    assert.equal(queries.at(-1).searchParams.get('placeId'), 'Uncatalogued District');
    assert.equal(queries.at(-1).searchParams.has('countryCode'), false, 'do not silently broaden to the whole country');
  } finally {
    globalThis.fetch = realFetch;
    if (previousKey === undefined) delete process.env.NUITEE_API_KEY;
    else process.env.NUITEE_API_KEY = previousKey;
    await new Promise(resolve => server.close(resolve));
  }
});
