import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { Router } from 'express';
import { TravelBooking } from '../models/TravelBooking.js';
import { TravelAnalytics } from '../models/TravelAnalytics.js';
import { AdminDataReset, AdminResetArchive } from '../models/AdminDataReset.js';
import { TravelAdminAudit, TravelSupportTicket, TravelBookingNote } from '../models/TravelAdmin.js';
import { Customer } from '../models/Customer.js';
import { CustomerSession } from '../models/CustomerSession.js';
import { CustomerAuthChallenge } from '../models/CustomerAuthChallenge.js';
import { TravelAccount } from '../models/TravelAccount.js';
const operationalModels = { customers: Customer, accounts: TravelAccount, tickets: TravelSupportTicket, notes: TravelBookingNote, audits: TravelAdminAudit };
export const adminDataResetRouter = Router(); // Mounted behind existing requireAdmin.
const actor = request => request.customer.email || request.customer.providerId;
const fail = message => Object.assign(new Error(message), { statusCode: 400 });
export function resetInput(body, now = new Date()) {
  const cutoff = new Date(body.cutoff);
  if (body.confirmation !== 'SIFIRLA' || !Array.isArray(body.references) || body.references.length > 100 || body.references.some(r => typeof r !== 'string' || !/^TRV-[A-Z0-9-]{8,120}$/.test(r)) || new Set(body.references).size !== body.references.length || !Number.isFinite(+cutoff) || cutoff > now || now - cutoff > 3600000) throw fail('Önizlemeyi yenile ve SIFIRLA yazarak doğrula.');
  return { cutoff, references: body.references };
}
export function visitorArchiveFilter(visitorId, cutoff = new Date()) {
  if (typeof visitorId !== 'string' || !/^[a-zA-Z0-9_-]{8,100}$/.test(visitorId)) throw fail('Geçersiz ziyaretçi.');
  return { visitorId, createdAt: { $lte: cutoff } };
}
adminDataResetRouter.get('/visitors', async (request, response) => {
  const items = await AdminDataReset.find({ kind: 'visitor', restoredAt: { $exists: false } }).sort({ createdAt: -1 }).limit(25).select('batchId visitorId counts.analytics createdAt').lean();
  response.json({ items });
});
adminDataResetRouter.post('/visitors/:visitorId', async (request, response) => {
  const cutoff = new Date();
  const filter = visitorArchiveFilter(request.params.visitorId, cutoff);
  const batchId = crypto.randomUUID();
  const session = await mongoose.startSession();
  let count = 0;
  try {
    await session.withTransaction(async () => {
      const result = await TravelAnalytics.updateMany(filter, { $set: { archivedAt: cutoff, archiveBatch: batchId } }, { session, timestamps: false });
      count = result.modifiedCount;
      if (!count) throw Object.assign(new Error('Ziyaretçi kaydı bulunamadı veya zaten silindi.'), { statusCode: 404 });
      await AdminDataReset.create([{ batchId, kind: 'visitor', visitorId: filter.visitorId, actor: actor(request), cutoff, counts: { analytics: count, bookings: 0 } }], { session });
      await TravelAdminAudit.create([{ actor: actor(request), action: 'analytics.visitor.archive', target: batchId }], { session });
    });
  } finally { await session.endSession(); }
  response.json({ batchId, visitorId: filter.visitorId, count });
});
adminDataResetRouter.get('/', async (request, response) => {
  const cutoff = new Date();
  const [analytics, bookings, batches] = await Promise.all([
    TravelAnalytics.countDocuments({ createdAt: { $lte: cutoff } }),
    TravelBooking.find({ createdAt: { $lte: cutoff } }).sort({ createdAt: -1 }).limit(101).select('clientReference status paymentStatus createdAt updatedAt holder.firstName holder.lastName').lean(),
    AdminDataReset.find({ restoredAt: { $exists: false } }).sort({ createdAt: -1 }).limit(10).select('batchId counts createdAt').lean(),
  ]);
  const operational = Object.fromEntries(await Promise.all(Object.entries(operationalModels).map(async ([key, model]) => [key, await model.countDocuments({ createdAt: { $lte: cutoff } })])));
  response.json({ cutoff, analytics, bookings, batches, operational });
});
adminDataResetRouter.post('/', async (request, response) => {
  const { cutoff, references } = resetInput(request.body);
  const batchId = crypto.randomUUID();
  const session = await mongoose.startSession();
  let counts;
  try {
    await session.withTransaction(async () => {
      const filter = { clientReference: { $in: references }, createdAt: { $lte: cutoff }, updatedAt: { $lte: cutoff } };
      const bookings = await TravelBooking.find(filter).session(session).lean();
      if (bookings.length !== references.length || bookings.some(b => b.status === 'processing')) throw fail('Rezervasyonlar değişti veya işlem sürüyor. Önizlemeyi yenile.');
      if (bookings.some(b => b.paymentStatus === 'paid') && request.body.includePaidTests !== true) throw fail('Ödendi görünen kayıtların da test olduğunu doğrula.');
      const archivedAt = new Date();
      const analyticsResult = await TravelAnalytics.updateMany({ createdAt: { $lte: cutoff } }, { $set: { archivedAt, archiveBatch: batchId } }, { session, timestamps: false });
      const bookingResult = await TravelBooking.updateMany(filter, { $set: { archivedAt, archiveBatch: batchId } }, { session, timestamps: false });
      if (bookingResult.modifiedCount !== references.length) throw fail('Kayıtlar değişti. Önizlemeyi yenile.');
      counts = { analytics: analyticsResult.modifiedCount, bookings: bookingResult.modifiedCount };
      if (request.body.resetOperationalData === true) {
        for (const [modelKey, model] of Object.entries(operationalModels)) {
          const documents = await model.find({ createdAt: { $lte: cutoff } }).session(session).limit(10001).lean();
          if (documents.length > 10000) throw fail('Tek sıfırlama sınırı aşıldı.');
          counts[modelKey] = documents.length;
          if (!documents.length) continue;
          await AdminResetArchive.insertMany(documents.map(document => ({ batchId, modelKey, document })), { session });
          const ids = documents.map(doc => doc._id);
          await model.deleteMany({ _id: { $in: ids } }, { session });
          if (modelKey === 'customers') await CustomerSession.deleteMany({ customer: { $in: ids } }, { session });
        }
        await CustomerAuthChallenge.deleteMany({ createdAt: { $lte: cutoff } }, { session });
      }
      await AdminDataReset.create([{ batchId, actor: actor(request), cutoff, counts }], { session });
      await TravelAdminAudit.create([{ actor: actor(request), action: 'data.archive', target: batchId }], { session });
    });
  } finally { await session.endSession(); }
  response.json({ batchId, counts });
});
adminDataResetRouter.post('/:batchId/restore', async (request, response) => {
  if (!/^[a-f0-9-]{36}$/.test(request.params.batchId)) throw fail('Geçersiz arşiv.');
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const batch = await AdminDataReset.findOne({ batchId: request.params.batchId, restoredAt: { $exists: false } }).session(session);
      if (!batch) throw fail('Arşiv bulunamadı veya zaten geri yüklendi.');
      const entries = await AdminResetArchive.find({ batchId: batch.batchId }).session(session).lean();
      for (const [key, model] of Object.entries(operationalModels)) {
        const documents = entries.filter(entry => entry.modelKey === key).map(entry => entry.document);
        if (documents.length) await model.collection.insertMany(documents, { session });
      }
      // Raw collection updates intentionally bypass the active-record middleware.
      for (const model of (batch.kind === 'visitor' ? [TravelAnalytics] : [TravelAnalytics, TravelBooking])) await model.collection.updateMany({ archiveBatch: batch.batchId }, { $unset: { archivedAt: '', archiveBatch: '' } }, { session });
      batch.restoredAt = new Date(); await batch.save({ session });
      await TravelAdminAudit.create([{ actor: actor(request), action: 'data.restore', target: batch.batchId }], { session });
    });
  } finally { await session.endSession(); }
  response.json({ ok: true });
});
