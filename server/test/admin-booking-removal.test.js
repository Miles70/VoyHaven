import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { AdminSession } from '../src/models/AdminSession.js';
import { TravelBooking } from '../src/models/TravelBooking.js';
import { AdminDataReset, AdminResetArchive } from '../src/models/AdminDataReset.js';
import { TravelAdminAudit } from '../src/models/TravelAdmin.js';
import { TravelAnalytics } from '../src/models/TravelAnalytics.js';

test('single booking removal requires admin confirmation, archives exactly one record and can be restored', async () => {
  const previous = process.env.VOYHAVEN_ADMIN_PASSWORD;
  process.env.VOYHAVEN_ADMIN_PASSWORD = 'fixture-admin-password';
  const originals = {
    admin: AdminSession.findOne, start: mongoose.startSession,
    update: TravelBooking.findOneAndUpdate, find: TravelBooking.findOne,
    batch: AdminDataReset.create, batchFind: AdminDataReset.findOne,
    archiveFind: AdminResetArchive.find, audit: TravelAdminAudit.create,
    restore: TravelBooking.collection.updateMany, analytics: TravelAnalytics.collection.updateMany,
  };
  const records = new Map([
    ['TRV-DEMO-PAID', { clientReference: 'TRV-DEMO-PAID', status: 'confirmed', paymentStatus: 'paid' }],
    ['TRV-DEMO-OTHER', { clientReference: 'TRV-DEMO-OTHER', status: 'failed', paymentStatus: 'unpaid' }],
    ['TRV-DEMO-PROCESSING', { clientReference: 'TRV-DEMO-PROCESSING', status: 'processing' }],
    ['TRV-DEMO-VERIFYING', { clientReference: 'TRV-DEMO-VERIFYING', status: 'awaiting_payment', cryptoVerification: { expiresAt: new Date(Date.now() + 60000) } }],
  ]);
  let authorized = false, sessionsEnded = 0, writes = 0;
  const batches = new Map(), audits = [];
  AdminSession.findOne = async () => authorized ? { _id: 'fixture-session' } : null;
  mongoose.startSession = async () => ({ withTransaction: async fn => fn(), endSession: async () => { sessionsEnded++; } });
  TravelBooking.findOneAndUpdate = async (filter, update) => {
    const record = records.get(filter.clientReference);
    if (!record || record.archivedAt || record.status === 'processing' || record.cryptoVerification?.expiresAt > new Date()) return null;
    writes++; Object.assign(record, update.$set); return { ...record };
  };
  TravelBooking.findOne = filter => ({ session: () => ({ lean: async () => {
    const record = records.get(filter.clientReference);
    return record && !record.archivedAt ? record : null;
  } }) });
  AdminDataReset.create = async rows => { rows.forEach(row => batches.set(row.batchId, row)); return rows; };
  AdminDataReset.findOne = filter => ({ session: async () => {
    const row = batches.get(filter.batchId);
    if (!row || row.restoredAt) return null;
    return { ...row, save: async function () { row.restoredAt = this.restoredAt; } };
  } });
  AdminResetArchive.find = () => ({ session: () => ({ lean: async () => [] }) });
  TravelAdminAudit.create = async rows => { audits.push(...rows); return rows; };
  TravelBooking.collection.updateMany = async filter => {
    let count = 0;
    for (const row of records.values()) if (row.archiveBatch === filter.archiveBatch) {
      delete row.archivedAt; delete row.archiveBatch; count++;
    }
    return { modifiedCount: count };
  };
  TravelAnalytics.collection.updateMany = async () => ({ modifiedCount: 0 });
  const server = createApp().listen(0); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/api/admin`;
  const remove = (reference, confirmation = reference, auth = true) => fetch(`${base}/bookings/${reference}`, {
    method: 'DELETE', headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer admin_${'a'.repeat(43)}` } : {}) },
    body: JSON.stringify({ confirmation }),
  });
  try {
    assert.equal((await remove('TRV-DEMO-PAID', undefined, false)).status, 401);
    assert.equal((await remove('TRV-DEMO-PAID')).status, 401);
    assert.equal(writes, 0);
    authorized = true;
    assert.equal((await remove('TRV-DEMO-PAID', 'different-reference')).status, 400);
    for (const reference of ['TRV-DEMO-PROCESSING', 'TRV-DEMO-VERIFYING']) assert.equal((await remove(reference)).status, 409);
    assert.equal(writes, 0);
    assert.equal((await remove('TRV-MISSING')).status, 404);
    const response = await remove('TRV-DEMO-PAID');
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    const result = await response.json();
    assert.equal(result.clientReference, 'TRV-DEMO-PAID');
    assert.ok(records.get(result.clientReference).archivedAt);
    assert.equal(records.get('TRV-DEMO-OTHER').archivedAt, undefined);
    assert.equal(records.get(result.clientReference).status, 'confirmed');
    assert.equal(records.get(result.clientReference).paymentStatus, 'paid');
    assert.deepEqual(batches.get(result.batchId).counts, { analytics: 0, bookings: 1 });
    assert.equal(batches.get(result.batchId).kind, 'booking');
    assert.equal(audits.at(-1).action, 'booking.archive');
    assert.equal((await remove('TRV-DEMO-PAID')).status, 404);
    assert.equal(writes, 1);
    const restored = await fetch(`${base}/data-reset/${result.batchId}/restore`, {
      method: 'POST', headers: { Authorization: `Bearer admin_${'a'.repeat(43)}`, 'Content-Type': 'application/json' }, body: '{}',
    });
    assert.equal(restored.status, 200);
    assert.equal(records.get('TRV-DEMO-PAID').archivedAt, undefined);
    assert.equal(records.get('TRV-DEMO-PAID').status, 'confirmed');
    assert.equal(records.get('TRV-DEMO-PAID').paymentStatus, 'paid');
    assert.equal(audits.at(-1).action, 'data.restore');
    assert.ok(sessionsEnded >= 5);
  } finally {
    await new Promise(resolve => server.close(resolve));
    AdminSession.findOne = originals.admin; mongoose.startSession = originals.start;
    TravelBooking.findOneAndUpdate = originals.update; TravelBooking.findOne = originals.find;
    AdminDataReset.create = originals.batch; AdminDataReset.findOne = originals.batchFind;
    AdminResetArchive.find = originals.archiveFind; TravelAdminAudit.create = originals.audit;
    TravelBooking.collection.updateMany = originals.restore; TravelAnalytics.collection.updateMany = originals.analytics;
    if (previous === undefined) delete process.env.VOYHAVEN_ADMIN_PASSWORD; else process.env.VOYHAVEN_ADMIN_PASSWORD = previous;
  }
});
