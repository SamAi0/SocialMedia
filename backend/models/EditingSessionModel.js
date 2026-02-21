import mongoose from 'mongoose';

const editingSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  mediaUrl: {
    type: String,
    required: true
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  edits: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    editType: {
      type: String,
      enum: ['brush', 'text', 'sticker', 'filter', 'crop', 'other']
    },
    editData: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
editingSessionSchema.index({ sessionId: 1 });
editingSessionSchema.index({ createdAt: -1 });
editingSessionSchema.index({ expiresAt: 1 });

const EditingSession = mongoose.model('EditingSession', editingSessionSchema);

export default EditingSession;