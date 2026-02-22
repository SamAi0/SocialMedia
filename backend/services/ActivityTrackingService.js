import activitylogmodel from '../models/ActivityLogModel.js';
import { v4 as uuidv4 } from 'uuid';

class ActivityTrackingService {
  // Log user activity
  static async logActivity(userId, action, details = null, targetUser = null, targetGroup = null, messageId = null, req = null) {
    try {
      const activityData = {
        user: userId,
        action: action,
        details: details,
        targetUser: targetUser,
        targetGroup: targetGroup,
        messageId: messageId
      };

      // Add IP address and user agent if request object is provided
      if (req) {
        activityData.ipAddress = req.ip || req.connection.remoteAddress;
        activityData.userAgent = req.get('User-Agent');
      }

      const activity = new activitylogmodel(activityData);
      await activity.save();
      
      console.log(`Activity logged: ${userId} performed ${action}`);
      return activity;
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw error as this shouldn't break the main functionality
      return null;
    }
  }

  // Log messaging activities
  static async logMessageActivity(senderId, receiverId, messageId, action = 'message_sent', details = null, req = null) {
    return await this.logActivity(senderId, action, details, receiverId, null, messageId, req);
  }

  // Log group activities
  static async logGroupActivity(userId, groupId, action, details = null, req = null) {
    return await this.logActivity(userId, action, details, null, groupId, null, req);
  }

  // Get user activity report
  static async getUserActivityReport(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const activities = await activitylogmodel
        .find({
          user: userId,
          date: { $gte: startDate }
        })
        .populate('targetUser', 'name username avatar')
        .populate('targetGroup', 'name')
        .sort({ date: -1 })
        .limit(100);

      // Aggregate activity statistics
      const activityStats = await activitylogmodel.aggregate([
        {
          $match: {
            user: userId,
            date: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 },
            lastActivity: { $max: '$date' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      // Get messaging statistics
      const messagingStats = await activitylogmodel.aggregate([
        {
          $match: {
            user: userId,
            action: { $in: ['message_sent', 'message_received'] },
            date: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get most interacted users
      const userInteractions = await activitylogmodel.aggregate([
        {
          $match: {
            user: userId,
            targetUser: { $ne: null },
            date: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$targetUser',
            interactionCount: { $sum: 1 },
            lastInteraction: { $max: '$date' }
          }
        },
        {
          $sort: { interactionCount: -1 }
        },
        {
          $limit: 10
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userDetails'
          }
        },
        {
          $unwind: '$userDetails'
        },
        {
          $project: {
            userId: '$_id',
            interactionCount: 1,
            lastInteraction: 1,
            'userDetails.name': 1,
            'userDetails.username': 1,
            'userDetails.avatar': 1
          }
        }
      ]);

      return {
        activities: activities,
        activityStats: activityStats,
        messagingStats: messagingStats,
        userInteractions: userInteractions,
        totalActivities: activities.length,
        period: `${days} days`
      };
    } catch (error) {
      console.error('Error generating activity report:', error);
      throw error;
    }
  }

  // Get real-time user status
  static async getUserStatus(userId) {
    try {
      const recentActivity = await activitylogmodel
        .findOne({ user: userId })
        .sort({ date: -1 });

      if (!recentActivity) {
        return { status: 'inactive', lastSeen: null };
      }

      const now = new Date();
      const lastActivityTime = new Date(recentActivity.date);
      const minutesSinceLastActivity = Math.floor((now - lastActivityTime) / (1000 * 60));

      let status = 'offline';
      if (minutesSinceLastActivity < 5) {
        status = 'online';
      } else if (minutesSinceLastActivity < 60) {
        status = 'recently';
      } else if (minutesSinceLastActivity < 1440) {
        status = 'today';
      } else {
        status = 'inactive';
      }

      return {
        status: status,
        lastSeen: lastActivityTime,
        minutesAgo: minutesSinceLastActivity
      };
    } catch (error) {
      console.error('Error getting user status:', error);
      return { status: 'unknown', lastSeen: null };
    }
  }

  // Get conversation activity between two users
  static async getConversationActivity(user1Id, user2Id, days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const activities = await activitylogmodel
        .find({
          $or: [
            { user: user1Id, targetUser: user2Id },
            { user: user2Id, targetUser: user1Id }
          ],
          action: { $in: ['message_sent', 'message_received', 'profile_view'] },
          date: { $gte: startDate }
        })
        .populate('user', 'name username avatar')
        .sort({ date: -1 });

      const user1Messages = activities.filter(activity => 
        activity.user._id.toString() === user1Id && activity.action === 'message_sent'
      ).length;

      const user2Messages = activities.filter(activity => 
        activity.user._id.toString() === user2Id && activity.action === 'message_sent'
      ).length;

      return {
        activities: activities,
        user1MessageCount: user1Messages,
        user2MessageCount: user2Messages,
        totalInteractions: activities.length,
        startDate: startDate
      };
    } catch (error) {
      console.error('Error getting conversation activity:', error);
      throw error;
    }
  }

  // Clean old activity logs (older than 90 days)
  static async cleanupOldActivities() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);

      const result = await activitylogmodel.deleteMany({
        date: { $lt: cutoffDate }
      });

      console.log(`Cleaned up ${result.deletedCount} old activity logs`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up old activities:', error);
      throw error;
    }
  }
}

export default ActivityTrackingService;