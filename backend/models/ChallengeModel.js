import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
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
    enum: ['fitness', 'cooking', 'reading', 'learning', 'creativity', 'social', 'other'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    progress: [{
      date: Date,
      completed: Boolean,
      proof: String, // Image/video proof
      notes: String
    }],
    currentStreak: {
      type: Number,
      default: 0
    },
    totalCompleted: {
      type: Number,
      default: 0
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  maxParticipants: {
    type: Number,
    default: 1000
  },
  entryFee: {
    type: Number,
    default: 0
  },
  prize: {
    type: String,
    default: 'Recognition'
  },
  tags: [String]
}, {
  timestamps: true
});

// Indexes for better performance
challengeSchema.index({ createdBy: 1, createdAt: -1 });
challengeSchema.index({ category: 1, isActive: 1 });
challengeSchema.index({ startDate: 1, endDate: 1 });
challengeSchema.index({ title: 'text', description: 'text' });

const Challenge = mongoose.model('Challenge', challengeSchema);

export default Challenge;