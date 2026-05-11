import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  rating: { type: Number, default: 0 },
  image: { type: String, required: true },
  image2: { type: String },
  colors: [{ type: String }],
  sizes: [{ type: String }],
  details: { type: String },
  faqs: [{ q: String, a: String }],
  type: { type: String, enum: ['newArrival', 'topSelling'], required: true }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
