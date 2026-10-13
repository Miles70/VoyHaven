import test from 'node:test';
import assert from 'node:assert/strict';
import { adminCredentials } from '../src/services/adminPasswordAuth.js';

test('new admin environment name preserves credential versions and overrides the legacy value', () => {
  const old = process.env.ROTAVOY_ADMIN_PASSWORD;
  const current = process.env.VOYHAVEN_ADMIN_PASSWORD;
  try {
    delete process.env.VOYHAVEN_ADMIN_PASSWORD;
    process.env.ROTAVOY_ADMIN_PASSWORD = 'migration-test-password';
    const legacy = adminCredentials();
    process.env.VOYHAVEN_ADMIN_PASSWORD = 'migration-test-password';
    delete process.env.ROTAVOY_ADMIN_PASSWORD;
    assert.deepEqual(adminCredentials(), legacy);
    process.env.ROTAVOY_ADMIN_PASSWORD = 'stale-test-password';
    assert.deepEqual(adminCredentials(), legacy);
  } finally {
    if (old === undefined) delete process.env.ROTAVOY_ADMIN_PASSWORD;
    else process.env.ROTAVOY_ADMIN_PASSWORD = old;
    if (current === undefined) delete process.env.VOYHAVEN_ADMIN_PASSWORD;
    else process.env.VOYHAVEN_ADMIN_PASSWORD = current;
  }
});
