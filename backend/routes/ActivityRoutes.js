import { Router } from 'express';
import ActivityTrackingService from '../services/ActivityTrackingService.js';
import { verifyToken } from '../middleware/VerifyToken.js';

const route = Router();

// Get user activity report
route.get('/user/:userId/activity/report', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    // Verify user is authorized to view this report
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).send({
        success: false,
        message: 'Not authorized to view this activity report'
      });
    }

    const report = await ActivityTrackingService.getUserActivityReport(userId, parseInt(days));
    
    res.status(200).send({
      success: true,
      report: report
    });
  } catch (error) {
    console.error('Error getting activity report:', error);
    res.status(500).send({
      success: false,
      message: 'Error generating activity report'
    });
  }
});

// Get user status (online/offline)
route.get('/user/:userId/status', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const status = await ActivityTrackingService.getUserStatus(userId);
    
    res.status(200).send({
      success: true,
      status: status
    });
  } catch (error) {
    console.error('Error getting user status:', error);
    res.status(500).send({
      success: false,
      message: 'Error getting user status'
    });
  }
});

// Get conversation activity between two users
route.get('/user/:user1Id/conversation/:user2Id/activity', verifyToken, async (req, res) => {
  try {
    const { user1Id, user2Id } = req.params;
    const { days = 7 } = req.query;

    // Verify user is authorized (must be one of the users or admin)
    if (req.user.userId !== user1Id && req.user.userId !== user2Id && req.user.role !== 'admin') {
      return res.status(403).send({
        success: false,
        message: 'Not authorized to view this conversation activity'
      });
    }

    const activity = await ActivityTrackingService.getConversationActivity(user1Id, user2Id, parseInt(days));
    
    res.status(200).send({
      success: true,
      activity: activity
    });
  } catch (error) {
    console.error('Error getting conversation activity:', error);
    res.status(500).send({
      success: false,
      message: 'Error getting conversation activity'
    });
  }
});

// Get recent activities for dashboard
route.get('/activities/recent', verifyToken, async (req, res) => {
  try {
    const { limit = 50, action } = req.query;
    const userId = req.user.userId;

    let query = { user: userId };
    if (action) {
      query.action = action;
    }

    const activities = await activitylogmodel
      .find(query)
      .populate('targetUser', 'name username avatar')
      .populate('targetGroup', 'name')
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.status(200).send({
      success: true,
      activities: activities
    });
  } catch (error) {
    console.error('Error getting recent activities:', error);
    res.status(500).send({
      success: false,
      message: 'Error getting recent activities'
    });
  }
});

// Admin: Get all user activities
route.get('/admin/activities', verifyToken, async (req, res) => {
  try {
    // Verify admin access
    if (req.user.role !== 'admin') {
      return res.status(403).send({
        success: false,
        message: 'Admin access required'
      });
    }

    const { userId, action, days = 30, limit = 100 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    let query = { date: { $gte: startDate } };
    if (userId) query.user = userId;
    if (action) query.action = action;

    const activities = await activitylogmodel
      .find(query)
      .populate('user', 'name username email')
      .populate('targetUser', 'name username')
      .populate('targetGroup', 'name')
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.status(200).send({
      success: true,
      activities: activities,
      count: activities.length
    });
  } catch (error) {
    console.error('Error getting admin activities:', error);
    res.status(500).send({
      success: false,
      message: 'Error getting admin activities'
    });
  }
});

// Manual activity logging endpoint (for testing)
route.post('/activity/log', verifyToken, async (req, res) => {
  try {
    const { action, details, targetUser, targetGroup, messageId } = req.body;
    const userId = req.user.userId;

    const activity = await ActivityTrackingService.logActivity(
      userId, 
      action, 
      details, 
      targetUser, 
      targetGroup, 
      messageId, 
      req
    );

    res.status(201).send({
      success: true,
      activity: activity
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).send({
      success: false,
      message: 'Error logging activity'
    });
  }
});

// Cleanup old activities (admin only)
route.delete('/admin/activities/cleanup', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).send({
        success: false,
        message: 'Admin access required'
      });
    }

    const deletedCount = await ActivityTrackingService.cleanupOldActivities();

    res.status(200).send({
      success: true,
      message: `Cleaned up ${deletedCount} old activity logs`,
      deletedCount: deletedCount
    });
  } catch (error) {
    console.error('Error cleaning up activities:', error);
    res.status(500).send({
      success: false,
      message: 'Error cleaning up activities'
    });
  }
});

export default route;