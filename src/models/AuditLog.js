import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  staffId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Staff',
    required: true 
  },
  action: { type: String, required: true }, // e.g., 'CREATE_PRODUCT', 'UPDATE_ROLE'
  resource: { type: String, required: true }, // e.g., 'products', 'roles'
  resourceId: { type: String },
  details: { 
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    message: String
  },
  ip: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for fast searching by staff or resource
AuditLogSchema.index({ staffId: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, timestamp: -1 });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
