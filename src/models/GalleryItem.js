import mongoose from 'mongoose';

const GalleryItemSchema = new mongoose.Schema({
  image: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },

  // Link to a product by ObjectId — resolves URL dynamically from product slug
  linkedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },

  order: { type: Number, default: 0, index: true },
  enabled: { type: Boolean, default: true },

  tenantId: { type: String, default: 'DEFAULT_STORE', index: true }
}, { timestamps: true });

GalleryItemSchema.index({ tenantId: 1, order: 1 });

export default mongoose.models.GalleryItem ||
  mongoose.model('GalleryItem', GalleryItemSchema);
