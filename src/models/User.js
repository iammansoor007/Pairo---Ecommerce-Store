import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  cart: [{
    productId: { type: Number },
    quantity: { type: Number, default: 1 },
    selectedSize: { type: String },
    selectedColor: { type: String }
  }],
  orderHistory: [{
    items: Array,
    total: Number,
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'Delivered' }
  }],
  addresses: [{
    fullName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    isDefault: { type: Boolean, default: false }
  }],
  paymentMethods: [{
    type: { type: String, default: 'Visa' },
    last4: String,
    expiry: String,
    isDefault: { type: Boolean, default: false }
  }],
  activityLog: [{
    action: String,
    details: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
