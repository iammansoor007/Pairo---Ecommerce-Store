import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  permissions: {
    type: Map,
    of: [String],
    default: {}
  },
  // Example permissions map structure:
  // {
  //   "products": ["view", "create", "edit", "delete"],
  //   "orders": ["view", "update", "refund"],
  //   "customers": ["view", "edit", "delete"],
  //   "blogs": ["view", "create", "edit", "publish", "delete"],
  //   "staff": ["view", "manage_roles", "create_staff"],
  //   "settings": ["view", "edit"],
  //   "analytics": ["view"],
  //   "media": ["manage"]
  // }
  isSystem: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Role || mongoose.model('Role', RoleSchema);
