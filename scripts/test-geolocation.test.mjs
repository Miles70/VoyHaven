import assert from 'node:assert/strict';
import test from 'node:test';
import { getCurrentCoordinates } from '../src/services/geolocation.js';

const coordinates = { latitude: 36.9, longitude: 30.7 };
function device(responses) {
  const calls = [];
  return {
    calls,
    getCurrentPosition(success, failure, options) {
      calls.push(options);
      const response = responses.shift();
      queueMicrotask(() => response.error ? failure(response.error) : success({ coords: response.coords }));
    },
  };
}

test('First click returns coordinates without any destination input', async () => {
  const geo = device([{ coords: coordinates }]);
  assert.deepEqual(await getCurrentCoordinates(geo), coordinates);
  assert.equal(geo.calls.length, 1);
  assert.equal(geo.calls[0].enableHighAccuracy, true);
});
for (const code of [2, 3]) {
  test(`Temporary failure ${code} recovers within the same click`, async () => {
    const geo = device([{ error: { code } }, { coords: coordinates }]);
    assert.deepEqual(await getCurrentCoordinates(geo), coordinates);
    assert.equal(geo.calls.length, 2);
    assert.equal(geo.calls[1].enableHighAccuracy, false);
    assert.ok(geo.calls.every(call => call.timeout > 0 && call.timeout <= 20000));
  });
}
test('Permission denial is preserved without retrying', async () => {
  const denied = { code: 1 };
  const geo = device([{ error: denied }]);
  await assert.rejects(getCurrentCoordinates(geo), error => error === denied);
  assert.equal(geo.calls.length, 1);
});
test('Repeated failure stops after one fallback and preserves the final error', async () => {
  const finalError = { code: 3 };
  const geo = device([{ error: { code: 2 } }, { error: finalError }]);
  await assert.rejects(getCurrentCoordinates(geo), error => error === finalError);
  assert.equal(geo.calls.length, 2);
});
test('Invalid coordinates cannot be used as a nearby search location', async () => {
  for (const latitude of [NaN, Infinity, 91]) {
    const geo = device([{ coords: { latitude, longitude: 30 } }]);
    await assert.rejects(getCurrentCoordinates(geo), /Invalid device coordinates/);
    assert.equal(geo.calls.length, 1);
  }
});
test('Missing location API fails cleanly', async () => {
  await assert.rejects(getCurrentCoordinates(null), /unavailable/);
});
