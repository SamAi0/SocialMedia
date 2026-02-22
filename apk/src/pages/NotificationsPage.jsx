import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, Heart, MessageCircle, X, Check } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import API from '../utils/api';
import '../styles/Notifications.css';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('accessToken');
        
        if (!userId || !token) {
          navigate('/');
          return;
        }

        // Fetch notifications
        const response = await API.get(`/user/${userId}/notifications`);
        if (response.data.success) {
          setNotifications(response.data.notifications || []);
          setUnreadCount(response.data.notifications?.filter(n => !n.isRead)?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [navigate]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const userId = localStorage.getItem('userId');
      await API.patch(`/user/${userId}/notification/${notificationId}/read`, {});
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification._id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      ));
      
      setUnreadCount(unreadCount - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const userId = localStorage.getItem('userId');
      await API.post(`/user/${userId}/notification/mark-all-read`, {});
      
      // Update local state
      setNotifications(notifications.map(notification => ({
        ...notification,
        isRead: true
      })));
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await API.delete(`/user/notification/${notificationId}`);
      
      // Update local state
      const notificationToDelete = notifications.find(n => n._id === notificationId);
      setNotifications(notifications.filter(notification => 
        notification._id !== notificationId
      ));
      
      if (!notificationToDelete.isRead) {
        setUnreadCount(unreadCount - 1);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return <Heart size={20} className="like-icon" />;
      case 'comment': return <MessageCircle size={20} className="comment-icon" />;
      case 'follow': return <User size={20} className="follow-icon" />;
      case 'message': return <MessageCircle size={20} className="message-icon" />;
      default: return <Bell size={20} />;
    }
  };

  const getNotificationMessage = (notification) => {
    const fromUser = notification.fromUser?.name || notification.fromUser?.username || 'Someone';
    
    switch (notification.type) {
      case 'like':
        return `${fromUser} liked your post`;
      case 'comment':
        return `${fromUser} commented on your post`;
      case 'follow':
        return `${fromUser} started following you`;
      case 'message':
        return `${fromUser} sent you a message`;
      default:
        return notification.message || 'New notification';
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="notifications-page">
          <div className="notifications-container">
            <div className="loading">Loading notifications...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="notifications-page">
          <div className="notifications-container">
            <div className="error">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="notifications-page">
        <div className="notifications-container">
          {/* Header */}
          <div className="notifications-header">
            <div className="header-content">
              <h1>Notifications</h1>
              {unreadCount > 0 && (
                <div className="unread-badge">{unreadCount}</div>
              )}
            </div>
            
            {unreadCount > 0 && (
              <button 
                className="mark-all-read"
                onClick={handleMarkAllAsRead}
              >
                <Check size={16} />
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <Bell size={48} />
                <h3>No Notifications</h3>
                <p>You're all caught up!</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification._id} 
                  className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="notification-content">
                    <p className="notification-message">
                      {getNotificationMessage(notification)}
                    </p>
                    <p className="notification-time">
                      {new Date(notification.date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="notification-actions">
                    {!notification.isRead && (
                      <button 
                        className="mark-read-button"
                        onClick={() => handleMarkAsRead(notification._id)}
                      >
                        <Check size={16} />
                      </button>
                    )}
                    
                    <button 
                      className="delete-button"
                      onClick={() => handleDeleteNotification(notification._id)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;