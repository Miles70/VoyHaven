import mongoose from 'mongoose';
export const AdminDataReset = mongoose.model('AdminDataReset', new mongoose.Schema({
  batchId: { type: String, unique: true, required: true },
  kind: { type: String, enum: ['reset', 'visitor'], default: 'reset' }, visitorId: String,
  actor: String, cutoff: Date, counts: { analytics: Number, bookings: Number, customers: Number, accounts: Number, tickets: Number, notes: Number, audits: Number },
  restoredAt: Date,
}, { timestamps: true }));
export const AdminResetArchive = mongoose.model('AdminResetArchive', new mongoose.Schema({
  batchId: { type: String, required: true, index: true }, modelKey: { type: String, required: true },
  document: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true }));
