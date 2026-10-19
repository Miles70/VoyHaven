import test from 'node:test';
import assert from 'node:assert/strict';
import { analyticsClientIp, analyticsGeo } from '../src/services/analyticsGeo.js';
test('Railway uses ingress IP instead of proxy chain; other hosts ignore header', () => {
  const request = { ip: '1.1.1.1', get: () => '::ffff:88.1.2.3' };
  assert.equal(analyticsClientIp(request, true), '88.1.2.3');
  assert.equal(analyticsClientIp(request, false), '1.1.1.1');
  assert.equal(analyticsClientIp({ get: () => undefined }, true), '');
  assert.equal(analyticsClientIp({ get: () => '8.8.8.8, 1.1.1.1' }, true), '');
});
test('Turkish location is persisted with city and provenance', async () => {
  assert.deepEqual(await analyticsGeo('88.1.2.3', async () => ({ ok: true, json: async () => ({ success: true, ip: '88.1.2.3', country_code: 'TR', country: 'Türkiye', city: 'Antalya' }) })), { country: 'Türkiye', city: 'Antalya', geoSource: 'ipwho.is', geoVersion: 2 });
});
test('private addresses, mismatched lookup and network failures stay unknown', async () => {
  for (const ip of ['127.0.0.1', '10.0.0.1', '100.64.0.1', '::1', 'fc00::1']) assert.equal((await analyticsGeo(ip, () => { throw Error('no lookup'); })).country, '');
  assert.equal((await analyticsGeo('8.8.4.4', async () => ({ ok: true, json: async () => ({ success: true, ip: '1.1.1.1', country_code: 'US', country: 'United States' }) }))).country, '');
  assert.equal((await analyticsGeo('9.9.9.9', async () => { throw Error('offline'); })).city, '');
});
test('HTTP errors and missing city never manufacture location', async () => {
  assert.equal((await analyticsGeo('8.8.8.8', async () => ({ ok: false, json: async () => ({ success: true, ip: '8.8.8.8', country_code: 'US', country: 'US' }) }))).country, '');
  const value = await analyticsGeo('88.1.2.4', async () => ({ ok: true, json: async () => ({ success: true, ip: '88.1.2.4', country_code: 'TR', country: 'Türkiye' }) }));
  assert.equal(value.country, 'Türkiye'); assert.equal(value.city, '');
});
test('country filter follows provenance masking and visitor cards include city', async () => {
  const { TravelAnalytics } = await import('../src/models/TravelAnalytics.js');
  const { analyticsV2 } = await import('../src/services/analyticsReport.js');
  const original = TravelAnalytics.aggregate;
  let pipeline;
  TravelAnalytics.aggregate = stages => { pipeline = stages; return { option: async () => [] }; };
  try {
    await analyticsV2({ query: { country: 'Türkiye' } }, { json: () => {} });
    assert.equal(pipeline[0].$match.country, undefined);
    assert.deepEqual(pipeline[1].$set.country.$cond, [{ $eq: ['$geoVersion', 2] }, '$country', '']);
    assert.deepEqual(pipeline[2], { $match: { country: 'Türkiye' } });
    assert.deepEqual(pipeline.at(-1).$facet.visitors[1].$group.city, { $first: '$city' });
  } finally { TravelAnalytics.aggregate = original; }
});
