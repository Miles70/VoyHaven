import test from 'node:test';
import assert from 'node:assert/strict';
import { findAvailableHotelPage } from '../src/services/availableHotelPage.js';
for (const hotelTypeIds of ['213', '216', '203']) test(`skip unavailable pages while preserving type ${hotelTypeIds}`, async () => {
  const calls=[];
  const result=await findAvailableHotelPage({
    location:{countryCode:'TR',cityName:'Antalya',hotelTypeIds},
    listCatalog:async query => {calls.push(query);return {hotelIds:[`hotel-${query.offset}`],total:3,data:[]};},
    readRates:async ids => ({data:ids[0]==='hotel-2'?[{hotelId:ids[0]}]:[]}),
    hasOffers:rates => rates.data.length > 0,
  });
  assert.deepEqual(calls.map(call=>call.offset),[0,1,2]);
  assert.ok(calls.every(call=>call.hotelTypeIds===hotelTypeIds && call.cityName==='Antalya'));
  assert.equal(result.rates.data[0].hotelId,'hotel-2');
  assert.equal(result.nextOffset,3);
  assert.equal(result.hasMore,false);
});
test('bound empty scans and preserve the next offset for load more', async () => {
  const result=await findAvailableHotelPage({location:{},offset:10,maxPages:2,listCatalog:async ()=>({hotelIds:['a'],total:100}),readRates:async()=>({data:[]}),hasOffers:()=>false});
  assert.equal(result.nextOffset,12);assert.equal(result.hasMore,true);
});
test('empty catalog does not request rates',async()=>{
 const result=await findAvailableHotelPage({location:{},listCatalog:async()=>({hotelIds:'',total:0}),readRates:()=>assert.fail('no rate request'),hasOffers:()=>false});
 assert.equal(result.hasMore,false);assert.equal(result.rates,null);
});
