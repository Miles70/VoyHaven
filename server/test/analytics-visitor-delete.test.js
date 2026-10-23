import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { visitorArchiveFilter } from '../src/routes/adminDataReset.js';
import { TravelAnalytics } from '../src/models/TravelAnalytics.js';
import { AdminDataReset, AdminResetArchive } from '../src/models/AdminDataReset.js';
import { TravelAdminAudit } from '../src/models/TravelAdmin.js';
import { AdminSession } from '../src/models/AdminSession.js';
import { TravelBooking } from '../src/models/TravelBooking.js';
test('visitor deletion requires an exact bounded ID and captures a cutoff', () => {
  const cutoff = new Date();
  assert.deepEqual(visitorArchiveFilter('visitor-12345', cutoff), { visitorId: 'visitor-12345', createdAt: { $lte: cutoff } });
  for (const id of ['', 'short', '.*', { $ne: '' }, 'a'.repeat(101), '../visitor-12345']) assert.throws(() => visitorArchiveFilter(id), { statusCode: 400 });
});
test('all archived visitors and resets remain reachable on later history pages', async () => {
  const previous = process.env.VOYHAVEN_ADMIN_PASSWORD; process.env.VOYHAVEN_ADMIN_PASSWORD = 'fixture-password';
  const originals = { auth: AdminSession.findOne, find: AdminDataReset.find };
  const rows = Array.from({ length: 30 }, (_, i) => ({ _id: new mongoose.Types.ObjectId((100 - i).toString(16).padStart(24, '0')), batchId: `batch-${i}`, counts: { analytics: 1 } }));
  AdminSession.findOne = async () => ({ _id: 'admin-test' });
  const filters = [];
  AdminDataReset.find = filter => {
    filters.push(filter); let limit;
    const query = { sort: () => query, limit: value => { limit = value; return query; }, select: () => query, lean: async () => rows.filter(row => !filter._id || String(row._id) < String(filter._id.$lt)).slice(0, limit) }; return query;
  };
  const server = createApp().listen(0); await once(server, 'listening');
  const headers = { Authorization: `Bearer admin_${'a'.repeat(43)}` };
  try {
    for (const history of ['visitors', 'history']) {
      const base = `http://127.0.0.1:${server.address().port}/api/admin/data-reset/${history}`;
      const first = await (await fetch(base, { headers })).json();
      const second = await (await fetch(`${base}?cursor=${first.nextCursor}`, { headers })).json();
      assert.equal(first.items.length, 25); assert.equal(second.items.length, 5); assert.equal(second.nextCursor, null);
      assert.equal(new Set([...first.items, ...second.items].map(row => row.batchId)).size, 30);
    }
    assert.equal(filters[0].kind, 'visitor'); assert.deepEqual(filters[2].kind, { $ne: 'visitor' });
  } finally {
    AdminSession.findOne = originals.auth; AdminDataReset.find = originals.find;
    if (previous === undefined) delete process.env.VOYHAVEN_ADMIN_PASSWORD; else process.env.VOYHAVEN_ADMIN_PASSWORD = previous;
    await new Promise(resolve => server.close(resolve));
  }
});
test('visitor archive and listing require admin access', async () => {
  const server = createApp().listen(0); await once(server, 'listening');
  try {
    for (const [path, method] of [['/data-reset/visitors', 'GET'], ['/data-reset/visitors/visitor-12345', 'POST']]) {
      assert.equal((await fetch(`http://127.0.0.1:${server.address().port}/api/admin${path}`, { method })).status, 401);
    }
  } finally { await new Promise(resolve => server.close(resolve)); }
});
test('deletion archives only the selected visitor; restoration targets only its batch', async () => {
  const previous = process.env.VOYHAVEN_ADMIN_PASSWORD; process.env.VOYHAVEN_ADMIN_PASSWORD = 'fixture-password';
  const originals = { session: AdminSession.findOne, start: mongoose.startSession, update: TravelAnalytics.updateMany, create: AdminDataReset.create, audit: TravelAdminAudit.create, batch: AdminDataReset.findOne, archives: AdminResetArchive.find, analyticsRestore: TravelAnalytics.collection.updateMany, bookingRestore: TravelBooking.collection.updateMany };
  let archivedFilter, batch, saved = false, mutations = [];
  AdminSession.findOne = async () => ({ _id: 'admin-test' });
  mongoose.startSession = async () => ({ withTransaction: async callback => callback(), endSession: async () => {} });
  TravelAnalytics.updateMany = async (filter, update) => { archivedFilter = filter; assert.equal(typeof update.$set.archiveBatch, 'string'); return { modifiedCount: 2 }; };
  AdminDataReset.create = async entries => { [batch] = entries; };
  TravelAdminAudit.create = async () => {};
  AdminDataReset.findOne = () => ({ session: () => Promise.resolve({ ...batch, save: async () => { saved = true; } }) });
  AdminResetArchive.find = () => ({ session: () => ({ lean: async () => [] }) });
  TravelAnalytics.collection.updateMany = async (filter, update) => { mutations.push(filter); assert.ok(update.$unset.archivedAt !== undefined); };
  TravelBooking.collection.updateMany = async filter => { mutations.push(filter); };
  const server = createApp().listen(0); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/api/admin`;
  const headers = { Authorization: `Bearer admin_${'a'.repeat(43)}`, 'Content-Type': 'application/json' };
  try {
    const response = await fetch(`${base}/data-reset/visitors/visitor-12345`, { method: 'POST', headers });
    assert.equal(response.status, 200); const data = await response.json(); assert.equal(data.count, 2);
    assert.equal(archivedFilter.visitorId, 'visitor-12345'); assert.ok(archivedFilter.createdAt.$lte instanceof Date);
    assert.equal(batch.kind, 'visitor'); assert.equal(batch.counts.bookings, 0); assert.equal(batch.visitorId, 'visitor-12345');
    assert.equal((await fetch(`${base}/data-reset/${data.batchId}/restore`, { method: 'POST', headers })).status, 200);
    assert.equal(saved, true); assert.deepEqual(mutations, [{ archiveBatch: data.batchId }]);
  } finally {
    AdminSession.findOne = originals.session; mongoose.startSession = originals.start; TravelAnalytics.updateMany = originals.update;
    AdminDataReset.create = originals.create; TravelAdminAudit.create = originals.audit; AdminDataReset.findOne = originals.batch; AdminResetArchive.find = originals.archives;
    TravelAnalytics.collection.updateMany = originals.analyticsRestore; TravelBooking.collection.updateMany = originals.bookingRestore;
    if (previous === undefined) delete process.env.VOYHAVEN_ADMIN_PASSWORD; else process.env.VOYHAVEN_ADMIN_PASSWORD = previous;
    await new Promise(resolve => server.close(resolve));
  }
});
