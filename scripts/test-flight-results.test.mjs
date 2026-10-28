import test from 'node:test';
import assert from 'node:assert/strict';
import { flightRefundStatus, flightOfferCabin, filterFlightResults, matchingFlightOffer, nearbyFlightSearches, findNearbyFlightOffers } from '../src/services/flightFilters.js';
import { flightDisplayDate, flightResults } from '../src/services/flightResults.js';
const search = { departure:'2026-10-21', returnDate:'2026-10-28', cabinClass:'FIRST' };
const result = (id,total,terms={}) => ({ offer:{offerId:id,terms,fare:{family:'Economy Refundable'}},total,segments:[{originCode:'AYT',destinationCode:'MIA',departureTime:'2026-10-21T12:00:00',flight:{marketingNumber:'1'}}] });
test('refund filter trusts supplier conditions instead of fare branding',()=>{
 assert.equal(flightRefundStatus(result('a',1,{refundable:false})),'nonRefundable');
 assert.equal(flightRefundStatus(result('b',1)),'unknown');
 assert.equal(flightRefundStatus(result('c',1,{refundable:true,refundFee:{pricing:{display:{amount:75}}}})),'partial');
 assert.deepEqual(filterFlightResults([result('a',2),result('b',1)],{sort:'high'}).map(r=>r.total),[2,1]);
});
test('actual and mixed cabins come from segment fares',()=>{
 assert.equal(flightOfferCabin({offer:{segmentFares:[{cabin:'Business'},{cabin:'Business'}]}}),'BUSINESS');
 assert.equal(flightOfferCabin({offer:{segmentFares:[{cabin:'Economy'},{cabin:'First'}]}}),'MIXED');
 assert.equal(flightOfferCabin({offer:{fare:{family:'Business Prime'}}}),null);
});
test('upgrades must preserve flight number and departure time',()=>{
 const a=result('a',1),b=result('b',2);
 assert.equal(matchingFlightOffer([b],a),b);
 b.segments=[{...b.segments[0],departureTime:'2026-10-21T15:00:00'}];
 assert.equal(matchingFlightOffer([b],a),undefined);
});
test('wide date scans are bounded and resume without duplicate requests',async()=>{
 const calls=[];const request=async d=>{calls.push(d.departure);return []};
 const first=await findNearbyFlightOffers(search,'2026-10-14',request,x=>x,()=>true,90);
 assert.equal(calls.length,12);assert.equal(first.paused,true);
 await findNearbyFlightOffers(search,'2026-10-14',request,x=>x,()=>true,90,()=>{},first.cursor);
 const expected = Math.min(24, nearbyFlightSearches(search,'2026-10-14',30).length);
 assert.equal(calls.length,expected);assert.equal(new Set(calls).size,expected);
});
test('scan errors are never reported as exhausted availability',async()=>{
 await assert.rejects(()=>findNearbyFlightOffers(search,'2026-10-14',async()=>{throw Error('RATE_LIMIT')},x=>x),/RATE_LIMIT/);
});
test('dates preserve trip length, avoid past dates, and stay within horizon',()=>{
 const dates=nearbyFlightSearches(search,'2026-10-14',335);
 assert.ok(dates.length <= 30);
 assert.ok(dates.every(d=>d.departure>='2026-10-14' && d.returnDate<='2027-09-14'));
 assert.ok(dates.every(d=>Math.abs(Date.parse(d.departure)-Date.parse(search.departure)) <= 15*86400000));
 assert.ok(dates.every(d=>Date.parse(d.returnDate)-Date.parse(d.departure)===7*86400000));
 assert.equal(flightDisplayDate('2026-11-08','tr'),'8 Kasım 2026');
 assert.equal(flightDisplayDate('2026-02-30','tr'),'—');
});
test('invalid prices and malformed segments cannot enter results',()=>{
 const offer={offerId:'x',pricing:{display:{total:100,currency:'USD'}}};
 assert.throws(()=>flightResults({data:[{journeys:[{segments:[null],offers:[offer]}]}]},'USD'),/FLIGHT_UNAVAILABLE/);
 for (const journey of [null, {}]) assert.throws(()=>flightResults({data:[{journeys:[journey]}]},'USD'),/FLIGHT_UNAVAILABLE/);
 assert.deepEqual(flightResults({data:[{journeys:[]}]},'USD'),[]);
 assert.deepEqual(flightResults({data:[{journeys:[{segments:[{}],offers:[{...offer,pricing:{display:{total:-1,currency:'USD'}}}]}]}]},'USD'),[]);
});
test('partial provider batches cannot hide valid offers or crash the result list', () => {
 const segment = { originCode: 'AYT', destinationCode: 'UFA' };
 const valid = { offerId: 'bookable', pricing: { display: { total: 100, currency: 'USD' } } };
 const rows = flightResults({ data: [null, { error: 'provider unavailable' }, { journeys: [null, { segments: [segment], offers: [null, valid] }] }] }, 'USD');
 assert.equal(rows.length, 1); assert.equal(rows[0].offer.offerId, 'bookable');
 assert.throws(() => flightResults({ data: [null, { error: 'provider unavailable' }] }, 'USD'), /FLIGHT_UNAVAILABLE/);
});
test('a priced cheapest-offer reference rescues missing offer arrays without inventing fares', () => {
 const journey = { segments: [{ originCode: 'AYT', destinationCode: 'UFA' }], cheapestOffer: { offerId: 'cheapest-only', pricing: { display: { total: 150, currency: 'USD' } }, baggage: { included: [] } } };
 for (const offers of [undefined, [], {}, [null]]) {
  const rows = flightResults({ data: [{ journeys: [{ ...journey, offers }] }] }, 'USD');
  assert.equal(rows.length, 1); assert.equal(rows[0].offer, journey.cheapestOffer);
 }
 assert.equal(flightResults({ data: [{ journeys: [{ ...journey, cheapestOffer: { offerId: 'price-missing' } }] }] }, 'USD').length, 0);
 assert.equal(flightResults({ data: [{ journeys: [journey] }] }, 'EUR').length, 0);
});
test('economy nearby search preserves route, cabin, passengers and round-trip duration', async () => {
 const original = { origin: 'AYT', destination: 'UFA', departure: '2027-06-15', returnDate: '2027-06-22', adults: 2, children: 1, cabinClass: 'ECONOMY', currency: 'USD', country: 'TR' };
 const calls = [];
 const found = await findNearbyFlightOffers(original, '2026-10-22', async candidate => { calls.push(candidate); return candidate.departure === '2027-06-16' ? [result('available', 100)] : []; }, x => x, () => true, 7);
 assert.equal(found.search.departure, '2027-06-16'); assert.equal(found.search.returnDate, '2027-06-23');
 assert.equal(original.departure, '2027-06-15');
 assert.ok(calls.every(candidate => candidate.origin === 'AYT' && candidate.destination === 'UFA' && candidate.adults === 2 && candidate.children === 1 && candidate.cabinClass === 'ECONOMY'));
});
test('recovery messages cover every supported language', async () => {
 const { default: messages } = await import('../src/i18n/flightRecoveryTranslations.js');
 const { supportedLanguages } = await import('../shared/languages.js');
 assert.deepEqual(Object.keys(messages).sort(), [...supportedLanguages].sort());
 for (const row of Object.values(messages)) assert.ok(row.length === 4 && row.every(text => typeof text === 'string' && text.trim()));
});


// Bag descriptions must never suppress quantitative baggage allowances.
test('baggage shows weight and pieces without inventing missing allowances', async () => {
 const { baggageText, baggageRows } = await import('../src/services/flightBaggage.js');
 const { default: labels } = await import('../src/i18n/flightDetailLabels.js');
 assert.equal(baggageText({ bagType: 'cabin', description: 'Carry-on bag', pieces: 1, weightKg: 8 }, labels.tr, 'tr'), 'Kabin bagajı: 1 adet · 8 kg');
 assert.equal(baggageText({ bagType: 'checked', pieces: 0, weightKg: 15 }, labels.tr, 'tr'), 'Uçak altı bagajı: 15 kg');
 assert.equal(baggageText({ bagType: 'checked' }, labels.tr, 'tr'), 'Uçak altı bagajı: Bilgi belirtilmedi');
 assert.equal(baggageText({ bagType: 'cabin', weightKg: null, pieces: '' }, labels.tr, 'tr'), 'Kabin bagajı: Bilgi belirtilmedi');
 assert.deepEqual(baggageRows([null, { weightKg: 15 }, 'bad']), [{ weightKg: 15 }]);
 assert.deepEqual(baggageRows({}), []);
 assert.equal(Object.keys(labels).length, 18);
 for (const row of Object.values(labels)) assert.ok(Object.values(row).every(value => typeof value === 'string' && value));
});


test('supplier conditions are localized without changing penalties or currency', async () => {
 const { flightSupplierText, flightAirportName } = await import('../src/services/flightSupplierText.js');
 const { default: labels } = await import('../src/i18n/flightConditionLabels.js');
 assert.equal(flightSupplierText('Refundable with penalty', 'tr'), 'Ceza ücreti uygulanarak iade edilebilir');
 assert.equal(flightSupplierText('Refund fee: from 1100 USD', 'tr'), 'İade cezası: Başlangıç tutarı 1100 USD');
 assert.equal(flightSupplierText('Changes allowed with penalty', 'tr'), 'Ceza ücreti uygulanarak değişiklik yapılabilir');
 assert.equal(flightSupplierText('Change fee: from 950 TRY', 'tr'), 'Değişiklik ücreti: Başlangıç tutarı 950 TRY');
 assert.equal(flightSupplierText('Refund fee: 1,100.50 USD', 'tr'), 'İade cezası: 1,100.50 USD');
 assert.equal(flightSupplierText('Special restriction 123 USD', 'tr'), 'Special restriction 123 USD');
 assert.equal(flightAirportName('SAW', 'Istanbul Sabiha Gokcen International Airport', 'tr'), 'İstanbul Sabiha Gökçen Havalimanı');
 for (const language of Object.keys(labels)) {
  assert.ok(flightSupplierText('Refundable with penalty', language));
  assert.ok(flightSupplierText('Refund fee: from 1100 USD', language).endsWith('1100 USD'));
 }
});


test('explicit no-baggage allowances stay distinct from unknown and weight-based allowances', async () => {
 const { baggageText } = await import('../src/services/flightBaggage.js');
 const { default: labels } = await import('../src/i18n/flightDetailLabels.js');
 assert.equal(baggageText({ bagType: 'checked', pieces: 0, weightKg: 0, description: 'No checked baggage included' }, labels.tr, 'tr'), 'Uçak altı bagajı: Dahil değil');
 assert.equal(baggageText({ bagType: 'checked', pieces: 0, weightKg: 0 }, labels.tr, 'tr'), 'Uçak altı bagajı: Dahil değil');
 assert.equal(baggageText({ bagType: 'checked', description: 'No checked baggage included' }, labels.tr, 'tr'), 'Uçak altı bagajı: Dahil değil');
 assert.equal(baggageText({ bagType: 'checked', pieces: 0, weightKg: 15 }, labels.tr, 'tr'), 'Uçak altı bagajı: 15 kg');
 assert.equal(baggageText({ bagType: 'checked', pieces: null, weightKg: null }, labels.tr, 'tr'), 'Uçak altı bagajı: Bilgi belirtilmedi');
 for(const row of Object.values(labels)) assert.ok(row.notIncluded);
});
