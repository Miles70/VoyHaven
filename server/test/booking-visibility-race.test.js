import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { TravelBooking } from '../src/models/TravelBooking.js';
import { refreshBooking } from '../src/services/finalizeBooking.js';

test('provider confirmation clears a concurrent admin removal on an already-loaded Mongoose document', async () => {
  const originalFetch = globalThis.fetch, originalUpdate = TravelBooking.collection.updateOne;
  const oldKey = process.env.NUITEE_API_KEY;
  process.env.NUITEE_API_KEY = 'production_fixture';
  const booking = TravelBooking.hydrate({
    _id: new mongoose.Types.ObjectId(), kind: 'hotel', clientReference: 'TRV-RACE-CONFIRM',
    offerId: 'offer', prebookId: 'prebook', status: 'processing', paymentStatus: 'pending',
    total: 100, currency: 'USD', holder: { firstName: 'Demo', lastName: 'Guest', email: 'demo@example.test' },
    guests: [{ firstName: 'Demo', lastName: 'Guest', email: 'demo@example.test' }],
    payment: { method: 'card' }, bookingAttemptAt: new Date(),
  });
  // The admin removal happens in the database after the document was loaded.
  const persisted = { adminHiddenAt: new Date(), adminArchiveBatch: 'concurrent-admin-batch' };
  let write;
  TravelBooking.collection.updateOne = async (_filter, update) => {
    write = update;
    Object.assign(persisted, update.$set);
    for (const key of Object.keys(update.$unset || {})) delete persisted[key];
    return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
  };
  globalThis.fetch = async () => Response.json({ data: [{ clientReference: booking.clientReference, bookingId: 'provider-1', status: 'CONFIRMED' }] });
  try {
    assert.equal(booking.adminHiddenAt, undefined);
    assert.equal(booking.isModified('adminHiddenAt'), false);
    const result = await refreshBooking(booking);
    assert.equal(result.status, 'confirmed');
    assert.equal(result.paymentStatus, 'paid');
    assert.ok(Object.hasOwn(write.$unset, 'adminHiddenAt'));
    assert.ok(Object.hasOwn(write.$unset, 'adminArchiveBatch'));
    assert.equal(persisted.adminHiddenAt, undefined);
    assert.equal(persisted.adminArchiveBatch, undefined);
    assert.equal(persisted.status, 'confirmed');
  } finally {
    globalThis.fetch = originalFetch; TravelBooking.collection.updateOne = originalUpdate;
    if (oldKey === undefined) delete process.env.NUITEE_API_KEY; else process.env.NUITEE_API_KEY = oldKey;
  }
});
