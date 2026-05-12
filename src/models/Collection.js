import mongoose from 'mongoose';

const CollectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
  productCount: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Hidden'], default: 'Active' },
  isDeleted: { type: Boolean, default: false },
  seo: {
    title: String,
    description: String
  }
}, { timestamps: true });

export default mongoose.models.Collection || mongoose.model('Collection', CollectionSchema);
