import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import NotificationService from '../utils/NotificationService';
import { io } from 'socket.io-client';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [preferences, setPreferences] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    if (userId) {
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket'],
        query: { userId }
      });

      newSocket.on('connect', () => {
        console.log('Connected to notification server');
      });

      newSocket.on('new-notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification('New Notification', {
            body: notification.message || 'You have a new notification',
            icon: '/favicon.ico'
          });
        }
      });

      newSocket.on('unread-count-updated', (data) => {
        setUnreadCount(data.count);
      });

      newSocket.on('notification-read', (data) => {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === data.notificationId 
              ? { ...notif, isRead: true } 
              : notif
          )
        );
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [userId]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async (params = {}) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await NotificationService.getEnhancedNotifications(userId, params);
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
      setUrgentCount(response.urgentCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await NotificationService.markAsRead(userId, notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true } 
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [userId]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationService.markAllAsRead(userId);
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [userId]);

  // Archive notification
  const archiveNotification = useCallback(async (notificationId) => {
    try {
      await NotificationService.archiveNotification(notificationId);
      setNotifications(prev => 
        prev.filter(notif => notif._id !== notificationId)
      );
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      setNotifications(prev => 
        prev.filter(notif => notif._id !== notificationId)
      );
      // If it was unread, decrease the count
      const notification = notifications.find(n => n._id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  // Load notification preferences
  const loadPreferences = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await NotificationService.getPreferences(userId);
      setPreferences(response.preferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }, [userId]);

  // Update notification preferences
  const updatePreferences = useCallback(async (newPreferences) => {
    if (!userId) return;
    
    try {
      const response = await NotificationService.updatePreferences(userId, newPreferences);
      setPreferences(response.preferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }, [userId]);

  // Get notification analytics
  const getAnalytics = useCallback(async (days = 30) => {
    if (!userId) return null;
    
    try {
      const response = await NotificationService.getAnalytics(userId, days);
      return response.analytics;
    } catch (error) {
      console.error('Error getting analytics:', error);
      return null;
    }
  }, [userId]);

  // Mark as important
  const markAsImportant = useCallback(async (notificationId, isImportant = true) => {
    try {
      await NotificationService.markAsImportant(notificationId, isImportant);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { 
                ...notif, 
                metadata: { 
                  ...notif.metadata, 
                  important: isImportant.toString() 
                } 
              } 
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking as important:', error);
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    urgentCount,
    loading,
    preferences,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    loadPreferences,
    updatePreferences,
    getAnalytics,
    markAsImportant,
    socket
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};