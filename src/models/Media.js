import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
  // Core Identity
  filename: { type: String, required: true },       // Sanitized stored name
  originalName: { type: String, required: true },   // Original upload name
  url: { type: String, required: true },             // Primary URL (Cloudinary or local)
  publicId: { type: String },                        // Cloudinary public_id for deletion/transforms
  thumbnailUrl: { type: String },                    // Auto-generated small preview

  // SEO & Metadata
  title: { type: String, default: '' },
  altText: { type: String, default: '' },
  caption: { type: String, default: '' },
  tags: [{ type: String }],

  // Technical Metadata
  mimeType: { type: String },
  fileSize: { type: Number },
  width: { type: Number },
  height: { type: Number },
  format: { type: String },

  // Upload Info
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadSource: { type: String, default: 'admin-upload' }, // "admin-upload", "product-editor"

  // Media Type Classification
  mediaType: { type: String, enum: ['image', 'video', 'document'], default: 'image' },
  folder: { type: String, default: 'general' }, // Future: "products", "banners", "branding"

  // Usage Tracking
  usageCount: { type: Number, default: 0 },
  usageRefs: [{
    entityType: { type: String },  // "Product", "Category", "SiteConfig"
    entityId: { type: mongoose.Schema.Types.ObjectId },
    fieldName: { type: String },   // "image", "gallery", "ogImage"
    label: { type: String },       // "Black T-Shirt — Featured Image"
  }],

  // Lifecycle
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },

}, { timestamps: true });

// Performance indexes
MediaSchema.index({ isDeleted: 1, createdAt: -1 });
MediaSchema.index({ tags: 1 });
MediaSchema.index({ mimeType: 1 });
MediaSchema.index({ folder: 1 });
MediaSchema.index({ uploadedBy: 1 });

delete mongoose.models.Media;
export default mongoose.models.Media || mongoose.model('Media', MediaSchema);
