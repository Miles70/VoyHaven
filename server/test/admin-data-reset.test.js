import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import mongoose from 'mongoose';
import { resetInput } from '../src/routes/adminDataReset.js';
import { TravelBooking } from '../src/models/TravelBooking.js';
import { TravelAnalytics } from '../src/models/TravelAnalytics.js';
import { AdminSession } from '../src/models/AdminSession.js';
import { createApp } from '../src/app.js';
const now = new Date('2026-10-19T17:00:00Z');
test('reset rejects stale or future snapshots, duplicate refs and missing confirmation', () => {
  const valid = { cutoff: now.toISOString(), references: ['TRV-CARD-20261002-65B29E6C'], confirmation: 'SIFIRLA' };
  assert.equal(resetInput(valid, now).references.length, 1);
  for (const body of [{ ...valid, confirmation: '' }, { ...valid, references: ['bad'] }, { ...valid, references: [...valid.references, ...valid.references] }, { ...valid, cutoff: 'invalid' }, { ...valid, cutoff: new Date(+now + 1).toISOString() }, { ...valid, cutoff: new Date(+now - 3600001).toISOString() }]) assert.throws(() => resetInput(body, now), { statusCode: 400 });
});
test('archived bookings and analytics are excluded from reads, counts and aggregates', async () => {
  for (const model of [TravelBooking, TravelAnalytics]) {
    const collection = model.collection;
    const original = { findOne: collection.findOne, countDocuments: collection.countDocuments, aggregate: collection.aggregate };
    const filters = [];
    collection.findOne = async filter => { filters.push(filter); return null; };
    collection.countDocuments = async filter => { filters.push(filter); return 0; };
    collection.aggregate = pipeline => { filters.push(pipeline[0].$match); return { toArray: async () => [] }; };
    try {
      await model.findOne({}); await model.countDocuments({}); await model.aggregate([{ $group: { _id: null, n: { $sum: 1 } } }]);
      assert.equal(filters.length, 3);
      filters.forEach(filter => assert.deepEqual(filter.archivedAt, { $exists: false }));
    } finally { Object.assign(collection, original); }
  }
});
test('reset and restore require existing admin authentication', async () => {
  const server = createApp().listen(0); await once(server, 'listening');
  try {
    for (const path of ['/api/admin/data-reset', '/api/admin/data-reset/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/restore']) {
      assert.equal((await fetch(`http://127.0.0.1:${server.address().port}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 401);
    }
  } finally { await new Promise(resolve => server.close(resolve)); }
});
test('paid tests need explicit inclusion and no write occurs when refused', async () => {
  const previous = process.env.VOYHAVEN_ADMIN_PASSWORD; process.env.VOYHAVEN_ADMIN_PASSWORD = 'fixture-test-password';
  const original = { findOne: AdminSession.findOne, find: TravelBooking.find, startSession: mongoose.startSession };
  let ended = false;
  AdminSession.findOne = async () => ({ _id: 'admin-fixture' });
  TravelBooking.find = () => ({ session: () => ({ lean: async () => [{ paymentStatus: 'paid', status: 'confirmed' }] }) });
  mongoose.startSession = async () => ({ withTransaction: async callback => callback(), endSession: async () => { ended = true; } });
  const server = createApp().listen(0); await once(server, 'listening');
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/admin/data-reset`, { method: 'POST', headers: { Authorization: `Bearer admin_${'a'.repeat(43)}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ cutoff: new Date().toISOString(), references: ['TRV-CARD-20261002-65B29E6C'], confirmation: 'SIFIRLA' }) });
    assert.equal(response.status, 400); assert.match((await response.json()).message, /test/); assert.equal(ended, true);
  } finally {
    AdminSession.findOne = original.findOne; TravelBooking.find = original.find; mongoose.startSession = original.startSession;
    if (previous === undefined) delete process.env.VOYHAVEN_ADMIN_PASSWORD; else process.env.VOYHAVEN_ADMIN_PASSWORD = previous;
    await new Promise(resolve => server.close(resolve));
  }
});
