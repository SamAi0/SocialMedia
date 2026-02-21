import API from './api';

class NotificationService {
  // Get basic notifications
  static async getNotifications(userId, params = {}) {
    try {
      const response = await API.get(`/api/notifications/${userId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Get enhanced notifications with advanced filtering
  static async getEnhancedNotifications(userId, params = {}) {
    try {
      const response = await API.get(`/api/notifications/enhanced/${userId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching enhanced notifications:', error);
      throw error;
    }
  }

  // Get unread count
  static async getUnreadCount(userId) {
    try {
      const response = await API.get(`/api/notifications/${userId}/unread-count`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(userId, notificationId) {
    try {
      const response = await API.put(`/api/notifications/${userId}/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(userId) {
    try {
      const response = await API.put(`/api/notifications/${userId}/read-all`);
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Archive notification
  static async archiveNotification(notificationId) {
    try {
      const response = await API.put(`/api/notifications/${notificationId}/archive`);
      return response.data;
    } catch (error) {
      console.error('Error archiving notification:', error);
      throw error;
    }
  }

  // Bulk archive notifications
  static async bulkArchiveNotifications(userId, notificationIds) {
    try {
      const response = await API.post(`/api/notifications/${userId}/bulk-archive`, { notificationIds });
      return response.data;
    } catch (error) {
      console.error('Error bulk archiving notifications:', error);
      throw error;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId) {
    try {
      const response = await API.delete(`/api/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Clear all notifications
  static async clearAllNotifications(userId) {
    try {
      const response = await API.delete(`/api/notifications/${userId}/clear-all`);
      return response.data;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      throw error;
    }
  }

  // Get notification preferences
  static async getPreferences(userId) {
    try {
      const response = await API.get(`/api/notifications/${userId}/preferences`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }

  // Update notification preferences
  static async updatePreferences(userId, preferences) {
    try {
      const response = await API.put(`/api/notifications/${userId}/preferences`, preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  // Get notification analytics
  static async getAnalytics(userId, days = 30) {
    try {
      const response = await API.get(`/api/notifications/${userId}/analytics`, { params: { days } });
      return response.data;
    } catch (error) {
      console.error('Error fetching notification analytics:', error);
      throw error;
    }
  }

  // Mark as important
  static async markAsImportant(notificationId, isImportant = true) {
    try {
      const response = await API.put(`/api/notifications/${notificationId}/important`, { isImportant });
      return response.data;
    } catch (error) {
      console.error('Error marking notification as important:', error);
      throw error;
    }
  }

  // Get notification statistics
  static async getStats(userId) {
    try {
      const response = await API.get(`/api/notifications/${userId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }
}

export default NotificationService;