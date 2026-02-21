import mongoose from 'mongoose';

const causeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['education', 'healthcare', 'environment', 'social-justice', 'animals', 'disaster-relief', 'other'],
    required: true
  },
  goalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0
  },
  imageUrl: {
    type: String,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  beneficiaryInfo: {
    name: String,
    organization: String,
    contactEmail: String
  },
  tags: [String],
  supporters: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
causeSchema.index({ userId: 1, createdAt: -1 });
causeSchema.index({ category: 1, isActive: 1 });
causeSchema.index({ endDate: 1 });
causeSchema.index({ title: 'text', description: 'text' });

const Cause = mongoose.model('Cause', causeSchema);

export default Cause;