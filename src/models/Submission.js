import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String },
  message: { type: String, required: true },
  status: { type: String, enum: ['New', 'Read', 'Replied', 'Archived'], default: 'New' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
