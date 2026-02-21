import AuditLog from '../models/AuditLogModel.js';

// Utility function to create audit log entry
const logAuditEvent = async (action, userId, details = {}, req = null) => {
  try {
    const logEntry = new AuditLog({
      action,
      userId,
      details,
      ipAddress: req?.ip || null,
      userAgent: req?.headers['user-agent'] || null,
      ...details // Spread additional details that might include target IDs
    });

    await logEntry.save();
    return logEntry;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error as audit logging shouldn't break the main flow
  }
};

// Specific audit functions for common actions
const logUserAction = {
  created: async (adminUserId, userAffectedId, req = null) => {
    await logAuditEvent('USER_CREATED', adminUserId, { targetUserId: userAffectedId }, req);
  },
  
  updated: async (adminUserId, userAffectedId, changes, req = null) => {
    await logAuditEvent('USER_UPDATED', adminUserId, { targetUserId: userAffectedId, changes }, req);
  },
  
  deleted: async (adminUserId, userAffectedId, req = null) => {
    await logAuditEvent('USER_DELETED', adminUserId, { targetUserId: userAffectedId }, req);
  },
  
  adminToggled: async (adminUserId, userAffectedId, isAdmin, req = null) => {
    await logAuditEvent('USER_ADMIN_TOGGLED', adminUserId, { targetUserId: userAffectedId, newAdminStatus: isAdmin }, req);
  }
};

const logPostAction = {
  created: async (adminUserId, postId, req = null) => {
    await logAuditEvent('POST_CREATED', adminUserId, { targetPostId: postId }, req);
  },
  
  updated: async (adminUserId, postId, changes, req = null) => {
    await logAuditEvent('POST_UPDATED', adminUserId, { targetPostId: postId, changes }, req);
  },
  
  deleted: async (adminUserId, postId, req = null) => {
    await logAuditEvent('POST_DELETED', adminUserId, { targetPostId: postId }, req);
  },
  
  reported: async (adminUserId, postId, reason, req = null) => {
    await logAuditEvent('POST_REPORTED', adminUserId, { targetPostId: postId, reason }, req);
  }
};

const logCommentAction = {
  created: async (adminUserId, commentId, req = null) => {
    await logAuditEvent('COMMENT_CREATED', adminUserId, { targetCommentId: commentId }, req);
  },
  
  updated: async (adminUserId, commentId, changes, req = null) => {
    await logAuditEvent('COMMENT_UPDATED', adminUserId, { targetCommentId: commentId, changes }, req);
  },
  
  deleted: async (adminUserId, commentId, req = null) => {
    await logAuditEvent('COMMENT_DELETED', adminUserId, { targetCommentId: commentId }, req);
  },
  
  reported: async (adminUserId, commentId, reason, req = null) => {
    await logAuditEvent('COMMENT_REPORTED', adminUserId, { targetCommentId: commentId, reason }, req);
  }
};

const logAdminAction = {
  login: async (adminUserId, req = null) => {
    await logAuditEvent('ADMIN_LOGIN', adminUserId, {}, req);
  },
  
  logout: async (adminUserId, req = null) => {
    await logAuditEvent('ADMIN_LOGOUT', adminUserId, {}, req);
  },
  
  permissionChanged: async (adminUserId, targetUserId, permissionChange, req = null) => {
    await logAuditEvent('PERMISSION_CHANGED', adminUserId, { targetUserId, permissionChange }, req);
  }
};

export {
  logAuditEvent,
  logUserAction,
  logPostAction,
  logCommentAction,
  logAdminAction
};