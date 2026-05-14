import mongoose from 'mongoose';

const PromotionAuditLogSchema = new mongoose.Schema({
  promotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', index: true },
  action: { 
    type: String, 
    enum: ['CREATE', 'UPDATE', 'DELETE', 'PAUSE', 'RESUME', 'ROLLBACK', 'ARCHIVE'], 
    required: true 
  },
  changes: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }],
  adminName: String,
  adminId: String,
  ipAddress: String,
  metadata: mongoose.Schema.Types.Mixed // For extra context like order IDs in case of manual adjustments
}, {
  timestamps: true
});

export default mongoose.models.PromotionAuditLog || mongoose.model('PromotionAuditLog', PromotionAuditLogSchema);
