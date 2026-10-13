import test from 'node:test';
import assert from 'node:assert/strict';
import { readBrandedStorage, writeBrandedStorage, removeBrandedStorage } from '../../src/services/brandStorage.js';

const storage = entries => {
  const data = new Map(entries);
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
};

test('brand migration preserves sessions, booking access and preferences; logout cannot revive a legacy session', () => {
  for (const suffix of ['admin_session_v2', 'customer_session', 'guest_session', 'booking_access:reservation', 'visitor_v1', 'seo_theme']) {
    const store = storage([[`rotavoy_${suffix}`, 'existing-value']]);
    assert.equal(readBrandedStorage(store, `voyhaven_${suffix}`), 'existing-value');
    assert.equal(store.getItem(`rotavoy_${suffix}`), null);
    assert.equal(store.getItem(`voyhaven_${suffix}`), 'existing-value');
    store.setItem(`rotavoy_${suffix}`, 'stale-value');
    assert.equal(readBrandedStorage(store, `voyhaven_${suffix}`), 'existing-value');
    removeBrandedStorage(store, `voyhaven_${suffix}`);
    assert.equal(readBrandedStorage(store, `voyhaven_${suffix}`), null);
  }
});

test('new writes remove obsolete keys without removing unrelated preferences', () => {
  const store = storage([['rotavoy_admin_theme', 'dark'], ['language', 'tr']]);
  writeBrandedStorage(store, 'voyhaven_admin_theme', 'light');
  assert.equal(store.getItem('rotavoy_admin_theme'), null);
  assert.equal(store.getItem('voyhaven_admin_theme'), 'light');
  writeBrandedStorage(store, 'language', 'en');
  assert.equal(readBrandedStorage(store, 'language'), 'en');
});

test('a storage quota failure still permits reading an existing session', () => {
  const store = storage([['rotavoy_customer_session', 'valid-session']]);
  store.setItem = () => { throw new Error('Quota exceeded'); };
  assert.equal(readBrandedStorage(store, 'voyhaven_customer_session'), 'valid-session');
});
