import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../src/app.js';
import { accommodationTypeIds, attachAccommodationTypes, normalizeAccommodationType } from '../../shared/accommodationTypes.js';
import copy from '../../src/i18n/accommodationTranslations.js';
import discovery from '../../src/i18n/discoveryTranslations.js';
import { supportedLanguages } from '../../shared/languages.js';
import { defaultHotelFilters, filterHotelResults } from '../../src/services/hotelDiscovery.js';

test('All languages have complete, distinct type labels and price sorting labels', () => {
  for (const lang of supportedLanguages) {
    assert.ok(copy[lang]?.label && copy[lang]?.all, lang);
    const names = accommodationTypeIds.map(id => copy[lang].types[id]);
    assert.ok(names.every(name => typeof name === 'string' && name.trim()), lang);
    assert.equal(new Set(names).size, names.length, lang);
    assert.ok(discovery[lang].priceAsc && discovery[lang].priceDesc, lang);
  }
  for (const value of ['204x', '219,201', '-1', 'abc', '999']) assert.equal(normalizeAccommodationType(value), '');
});
test('Type labels use catalog IDs and never infer from names', () => {
  const result = attachAccommodationTypes([{hotelId:'a',name:'Not an apartment',hotelTypeId:204},{hotelId:'b',name:'Villa Unknown'}],{data:[{id:'a',hotelTypeId:219}]});
  assert.equal(result[0].hotelTypeId, 219);
  assert.equal(result[1].hotelTypeId, undefined);
});
test('Price sorting is numeric, handles missing prices, and does not mutate results', () => {
  const hotels = [100,9,null,35].map((amount,i) => ({hotelId:String(i),offer:{suggestedSellingPrice:{amount,currency:'USD'}}}));
  assert.deepEqual(filterHotelResults(hotels,{...defaultHotelFilters,sort:'priceAsc'}).map(h => h.hotelId), ['1','3','0','2']);
  assert.deepEqual(filterHotelResults(hotels,{...defaultHotelFilters,sort:'priceDesc'}).map(h => h.hotelId), ['0','3','1','2']);
  assert.deepEqual(hotels.map(h => h.hotelId), ['0','1','2','3']);
});
test('API forwards validated property types for city, nearby and paginated searches', async () => {
  const realFetch=globalThis.fetch, oldKey=process.env.NUITEE_API_KEY;
  process.env.NUITEE_API_KEY='sand_accommodation_fixture';
  const calls=[];
  globalThis.fetch=async (input,options) => {
    const url=new URL(input);
    if(url.hostname!=='api.liteapi.travel') return realFetch(input,options);
    calls.push(url);
    return Response.json({hotelIds:['a'],total:40,data:[{id:'a',hotelTypeId:Number(url.searchParams.get('hotelTypeIds'))}]});
  };
  const server=createApp().listen(0);await once(server,'listening');
  const base=`http://127.0.0.1:${server.address().port}/api/hotels`;
  try {
    for(const id of accommodationTypeIds) {
      const res=await realFetch(`${base}?countryCode=TR&cityName=Antalya&hotelTypeIds=${id}&offset=20`);
      assert.equal(res.status,200);
      assert.equal((await res.json()).location.hotelTypeIds,String(id));
      assert.equal(calls.at(-1).searchParams.get('hotelTypeIds'),String(id));
      assert.equal(calls.at(-1).searchParams.get('offset'),'20');
    }
    assert.equal((await realFetch(`${base}?latitude=36.9&longitude=30.7&hotelTypeIds=219`)).status,200);
    assert.equal(calls.at(-1).searchParams.get('hotelTypeIds'),'219');
    assert.equal(calls.at(-1).searchParams.get('latitude'),'36.9');
    await realFetch(`${base}?countryCode=TR&cityName=Antalya`);
    assert.equal(calls.at(-1).searchParams.has('hotelTypeIds'),false);
    const count=calls.length;
    assert.equal((await realFetch(`${base}?countryCode=TR&hotelTypeIds=999`)).status,400);
    assert.equal(calls.length,count);
  } finally {
    await new Promise(resolve=>server.close(resolve));globalThis.fetch=realFetch;
    if(oldKey===undefined) delete process.env.NUITEE_API_KEY;else process.env.NUITEE_API_KEY=oldKey;
  }
});
