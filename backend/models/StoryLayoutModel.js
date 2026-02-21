import mongoose from 'mongoose';

const storyLayoutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  templateType: {
    type: String,
    enum: ['split-screen', 'multi-column', 'grid', 'carousel', 'custom'],
    required: true
  },
  sections: [{
    type: {
      type: String,
      enum: ['image', 'video', 'text', 'poll', 'link'],
      required: true
    },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 }
    },
    size: {
      width: { type: Number, default: 100 },
      height: { type: Number, default: 100 }
    },
    zIndex: { type: Number, default: 1 },
    styles: {
      type: Map,
      of: String,
      default: {}
    }
  }],
  backgroundColor: {
    type: String,
    default: '#000000'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
storyLayoutSchema.index({ userId: 1, createdAt: -1 });
storyLayoutSchema.index({ templateType: 1, isPublic: 1 });

const StoryLayout = mongoose.model('StoryLayout', storyLayoutSchema);

export default StoryLayout;