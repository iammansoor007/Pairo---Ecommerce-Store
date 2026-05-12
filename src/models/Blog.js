import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  excerpt: String,
  content: String,
  image: String,
  category: String,
  author: { type: String, default: "Pairo Studio" },
  status: { type: String, enum: ['Draft', 'Published'], default: 'Draft' },
  isFeatured: { type: Boolean, default: false },
  tags: [String]
}, { timestamps: true });

delete mongoose.models.Blog;
export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
