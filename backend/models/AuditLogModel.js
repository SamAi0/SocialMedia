import mongoose from 'mongoose';

const auditLogSchema = mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_ADMIN_TOGGLED',
      'POST_CREATED', 'POST_UPDATED', 'POST_DELETED', 'POST_REPORTED',
      'COMMENT_CREATED', 'COMMENT_UPDATED', 'COMMENT_DELETED', 'COMMENT_REPORTED',
      'ADMIN_LOGIN', 'ADMIN_LOGOUT', 'PERMISSION_CHANGED'
    ]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  targetPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  targetCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  details: {
    type: Object,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;