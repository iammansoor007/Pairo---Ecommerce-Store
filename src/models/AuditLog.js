import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  event: { type: String, required: true }, // e.g., 'ORDER_CREATED', 'EMAIL_FAILED'
  referenceId: { type: String }, // e.g., Order ID or User ID
  severity: { type: String, enum: ['info', 'warning', 'error'], default: 'info' },
  message: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for fast searching by event and date
AuditLogSchema.index({ event: 1, timestamp: -1 });
AuditLogSchema.index({ referenceId: 1 });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
