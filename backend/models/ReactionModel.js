import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reactionType: {
    type: String,
    enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure one reaction per user per post
reactionSchema.index({ postId: 1, userId: 1 }, { unique: true });
reactionSchema.index({ postId: 1, createdAt: -1 });
reactionSchema.index({ userId: 1, createdAt: -1 });

const Reaction = mongoose.model('Reaction', reactionSchema);

export default Reaction;