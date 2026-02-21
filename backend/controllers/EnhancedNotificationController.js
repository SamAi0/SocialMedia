import NotificationModel from "../models/NotificationModel.js";
import UserModel from "../models/UserModel.js";

// Enhanced notification features

// Get notifications with advanced filtering and sorting
export const getEnhancedNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const { 
            page = 1, 
            limit = 20,
            type,
            priority,
            isRead,
            isArchived = false,
            sortBy = 'date',
            sortOrder = 'desc'
        } = req.query;
        
        const skip = (page - 1) * limit;
        
        // Build query object
        const query = { 
            user: userId,
            isArchived: isArchived === 'true'
        };
        
        if (type && type !== 'all') {
            query.type = type;
        }
        
        if (priority && priority !== 'all') {
            query.priority = priority;
        }
        
        if (isRead !== undefined) {
            query.isRead = isRead === 'true';
        }
        
        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        
        // Fetch notifications with advanced filtering
        const notifications = await NotificationModel.find(query)
            .populate('fromUser', 'name avatar username')
            .populate('post', 'image caption')
            .populate('story', 'media')
            .populate('group', 'name')
            .populate('event', 'title date')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));
            
        // Get counts for different categories
        const total = await NotificationModel.countDocuments(query);
        const unreadCount = await NotificationModel.countDocuments({
            user: userId,
            isRead: false,
            isArchived: false
        });
        
        const urgentCount = await NotificationModel.countDocuments({
            user: userId,
            priority: 'urgent',
            isRead: false,
            isArchived: false
        });
        
        const hasMore = total > skip + notifications.length;
        
        res.status(200).json({
            success: true,
            notifications,
            total,
            unreadCount,
            urgentCount,
            hasMore,
            page: parseInt(page),
            limit: parseInt(limit)
        });
        
    } catch (error) {
        console.error('Error fetching enhanced notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: error.message
        });
    }
};

// Archive notifications
export const archiveNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user?.id || req.query.userId;
        
        const notification = await NotificationModel.findOne({
            _id: notificationId,
            user: userId
        });
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found or unauthorized"
            });
        }
        
        notification.isArchived = true;
        await notification.save();
        
        // Update unread count
        const unreadCount = await NotificationModel.countDocuments({
            user: userId,
            isRead: false,
            isArchived: false
        });
        
        res.status(200).json({
            success: true,
            message: "Notification archived successfully",
            unreadCount
        });
        
    } catch (error) {
        console.error("Error archiving notification:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

// Bulk archive notifications
export const bulkArchiveNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const { notificationIds } = req.body;
        
        if (!notificationIds || !Array.isArray(notificationIds)) {
            return res.status(400).json({
                success: false,
                message: "Notification IDs array is required"
            });
        }
        
        const result = await NotificationModel.updateMany(
            { 
                _id: { $in: notificationIds },
                user: userId
            },
            { isArchived: true }
        );
        
        const unreadCount = await NotificationModel.countDocuments({
            user: userId,
            isRead: false,
            isArchived: false
        });
        
        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} notifications archived`,
            modifiedCount: result.modifiedCount,
            unreadCount
        });
        
    } catch (error) {
        console.error("Error bulk archiving notifications:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

// Get notification preferences
export const getNotificationPreferences = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await UserModel.findById(userId).select('notificationPreferences');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        const defaultPreferences = {
            email: {
                likes: true,
                comments: true,
                follows: true,
                messages: true,
                mentions: true
            },
            push: {
                likes: true,
                comments: true,
                follows: true,
                messages: true,
                mentions: true,
                stories: true
            },
            inApp: {
                likes: true,
                comments: true,
                follows: true,
                messages: true,
                mentions: true,
                stories: true,
                events: true
            }
        };
        
        const preferences = user.notificationPreferences || defaultPreferences;
        
        res.status(200).json({
            success: true,
            preferences
        });
        
    } catch (error) {
        console.error("Error getting notification preferences:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get notification preferences"
        });
    }
};

// Update notification preferences
export const updateNotificationPreferences = async (req, res) => {
    try {
        const { userId } = req.params;
        const preferences = req.body;
        
        const user = await UserModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        user.notificationPreferences = {
            ...user.notificationPreferences,
            ...preferences
        };
        
        await user.save();
        
        res.status(200).json({
            success: true,
            message: "Notification preferences updated successfully",
            preferences: user.notificationPreferences
        });
        
    } catch (error) {
        console.error("Error updating notification preferences:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update notification preferences"
        });
    }
};

// Create system notification
export const createSystemNotification = async (req, res) => {
    try {
        const { userId, message, priority = 'medium' } = req.body;
        
        const notification = new NotificationModel({
            user: userId,
            type: 'system',
            message,
            priority,
            date: new Date(),
            isRead: false,
            isArchived: false
        });
        
        await notification.save();
        
        // Populate for response
        const populatedNotification = await NotificationModel.findById(notification._id)
            .populate('fromUser', 'name avatar username');
        
        res.status(201).json({
            success: true,
            message: "System notification created",
            notification: populatedNotification
        });
        
    } catch (error) {
        console.error("Error creating system notification:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create system notification"
        });
    }
};

// Get notification analytics
export const getNotificationAnalytics = async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = 30 } = req.query;
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        
        const mongoose = await import('mongoose');
        
        // Total notifications by type
        const typeStats = await NotificationModel.aggregate([
            { 
                $match: { 
                    user: new mongoose.Types.ObjectId(userId),
                    date: { $gte: startDate }
                } 
            },
            { 
                $group: { 
                    _id: '$type', 
                    count: { $sum: 1 },
                    unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } }
                } 
            }
        ]);
        
        // Notifications by day
        const dailyStats = await NotificationModel.aggregate([
            { 
                $match: { 
                    user: new mongoose.Types.ObjectId(userId),
                    date: { $gte: startDate }
                } 
            },
            { 
                $group: { 
                    _id: { 
                        $dateToString: { format: "%Y-%m-%d", date: "$date" } 
                    },
                    count: { $sum: 1 },
                    unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } }
                } 
            },
            { $sort: { "_id": 1 } }
        ]);
        
        // Read vs unread ratio
        const readStats = await NotificationModel.aggregate([
            { 
                $match: { 
                    user: new mongoose.Types.ObjectId(userId),
                    date: { $gte: startDate }
                } 
            },
            { 
                $group: { 
                    _id: null,
                    total: { $sum: 1 },
                    read: { $sum: { $cond: [{ $eq: ['$isRead', true] }, 1, 0] } },
                    unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } }
                } 
            }
        ]);
        
        res.status(200).json({
            success: true,
            analytics: {
                byType: typeStats,
                daily: dailyStats,
                readStats: readStats[0] || { total: 0, read: 0, unread: 0 }
            }
        });
        
    } catch (error) {
        console.error("Error getting notification analytics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get notification analytics"
        });
    }
};

// Mark notifications as important
export const markAsImportant = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { isImportant = true } = req.body;
        const userId = req.user?.id || req.query.userId;
        
        const notification = await NotificationModel.findOne({
            _id: notificationId,
            user: userId
        });
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found or unauthorized"
            });
        }
        
        // Store importance in metadata
        if (!notification.metadata) {
            notification.metadata = new Map();
        }
        notification.metadata.set('important', isImportant.toString());
        
        await notification.save();
        
        res.status(200).json({
            success: true,
            message: `Notification marked as ${isImportant ? 'important' : 'not important'}`,
            notification
        });
        
    } catch (error) {
        console.error("Error marking notification as important:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};