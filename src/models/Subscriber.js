import mongoose from 'mongoose';

const SubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  status: {
    type: String,
    enum: ['Subscribed', 'Unsubscribed'],
    default: 'Subscribed',
    index: true
  },
  source: {
    type: String,
    default: 'Footer Form'
  }
}, { timestamps: true });

delete mongoose.models.Subscriber;
export default mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema);
