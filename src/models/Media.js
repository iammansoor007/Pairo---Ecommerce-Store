import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  url: { type: String, required: true },
  fileType: { type: String },
  size: { type: Number },
  altText: { type: String },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Media || mongoose.model('Media', MediaSchema);
