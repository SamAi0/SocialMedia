import mongoose from 'mongoose';

const scheduledPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    text: String,
    media: [{
      url: String,
      type: {
        type: String,
        enum: ['image', 'video']
      }
    }]
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  status: {
    type: String,
    enum: ['scheduled', 'published', 'failed', 'cancelled'],
    default: 'scheduled'
  },
  postType: {
    type: String,
    enum: ['feed', 'story'],
    default: 'feed'
  },
  privacy: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },
  hashtags: [String],
  taggedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  location: {
    name: String,
    latitude: Number,
    longitude: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
scheduledPostSchema.index({ userId: 1, scheduledTime: 1 });
scheduledPostSchema.index({ scheduledTime: 1, status: 1 });
scheduledPostSchema.index({ status: 1 });

const ScheduledPost = mongoose.model('ScheduledPost', scheduledPostSchema);

export default ScheduledPost;