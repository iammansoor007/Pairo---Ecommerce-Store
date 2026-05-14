import mongoose from 'mongoose';

const PromotionRevisionSchema = new mongoose.Schema({
  promotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', required: true, index: true },
  snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
  version: { type: Number, required: true },
  createdBy: { type: String }, // Admin User ID or Name
  changeSummary: { type: String },
}, {
  timestamps: true
});

// Ensure (promotionId, version) uniqueness
PromotionRevisionSchema.index({ promotionId: 1, version: 1 }, { unique: true });

export default mongoose.models.PromotionRevision || mongoose.model('PromotionRevision', PromotionRevisionSchema);
