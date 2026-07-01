import mongoose from 'mongoose';

/**
 * CustomizationRequest model
 * Stores customer-submitted custom design requests for products.
 * These are NOT orders — they are design consultation requests managed manually by admin.
 */
const CustomizationRequestSchema = new mongoose.Schema({
  tenantId: { type: String, default: 'DEFAULT_STORE', index: true },
  requestNumber: { type: String, required: true, index: true },

  // Customer Information
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String }
  },

  // Product Reference
  product: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    slug: String,
    image: String,
    price: Number
  },

  // Customization Selections
  customizations: {
    leatherColor: { type: String, default: 'None' },
    leatherColorNote: { type: String },
    leatherType: { type: String, default: 'None' },
    leatherTypeNote: { type: String },
    innerLining: { type: String, default: 'None' },
    innerLiningNote: { type: String },
    hardwareColor: { type: String, default: 'None' },
    hardwareColorNote: { type: String },
    fur: {
      type: { type: String, default: 'None' },
      typeNote: { type: String },
      color: { type: String },
      placement: [{ type: String }],
      density: { type: String },
      removable: { type: Boolean }
    },
    artwork: {
      leftChest:  { url: String, name: String },
      rightChest: { url: String, name: String },
      leftArm:    { url: String, name: String },
      rightArm:   { url: String, name: String },
      back:       { url: String, name: String },
      other:      { url: String, name: String, note: String }
    }
  },

  additionalNotes: { type: String },

  // Admin Management
  status: {
    type: String,
    enum: ['New', 'Reviewed', 'In Progress', 'Completed', 'Rejected'],
    default: 'New',
    index: true
  },
  adminNotes: [{
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    createdAt: { type: Date, default: Date.now }
  }],

  isDeleted: { type: Boolean, default: false, index: true }
}, { timestamps: true });

CustomizationRequestSchema.index({ 'customer.email': 1, createdAt: -1 });
CustomizationRequestSchema.index({ tenantId: 1, requestNumber: 1 }, { unique: true });

export default mongoose.models.CustomizationRequest || mongoose.model('CustomizationRequest', CustomizationRequestSchema);
