import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String },
  description: { type: String },
  isDeleted: { type: Boolean, default: false },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  productCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
