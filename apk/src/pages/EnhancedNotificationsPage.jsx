import React, { useState, useEffect } from 'react';
import { Bell, User, Heart, MessageCircle, X, Check, UserPlus, UserCheck, UserX } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import API from '../utils/api';
import '../styles/Notifications.css';

const EnhancedNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    fetchNotifications();
  }, [userId, activeFilter]);

  const fetchNotifications = async () => {
    if (!userId || !token) return;
    
    setLoading(true);
    try {
      const response = await API.get(`/user/${userId}/notifications`, {
        params: { 
          type: activeFilter !== 'all' ? activeFilter : undefined,
          limit: 50
        }
      });
      
      if (response.data.success) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await API.patch(`/user/${userId}/notification/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.post(`/user/${userId}/notification/mark-all-read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
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
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      if (notificationToDelete && !notificationToDelete.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleAcceptFollowRequest = async (notificationId, fromUserId) => {
    try {
      // Accept the follow request by following the user back
      const response = await API.post(`/user/${userId}/${fromUserId}/follow`);
      
      if (response.data.success) {
        // Mark notification as read
        await handleMarkAsRead(notificationId);
        // Show success message
        alert(`${response.data.message}`);
        // Refresh notifications
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error accepting follow request:', error);
      alert('Failed to accept follow request');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return <Heart size={20} className="like-icon" />;
      case 'comment': return <MessageCircle size={20} className="comment-icon" />;
      case 'follow': return <UserPlus size={20} className="follow-icon" />;
      case 'message': return <MessageCircle size={20} className="message-icon" />;
      case 'message_request': return <User size={20} className="message-request-icon" />;
      case 'message_request_accepted': return <UserCheck size={20} className="accepted-icon" />;
      case 'message_request_declined': return <UserX size={20} className="declined-icon" />;
      case 'follow_request_accepted': return <UserCheck size={20} className="accepted-icon" />;
      default: return <Bell size={20} />;
    }
  };

  const getNotificationMessage = (notification) => {
    const fromUser = notification.fromUser?.username || notification.fromUser?.name || 'Someone';
    
    switch (notification.type) {
      case 'like':
        return `${fromUser} liked your post`;
      case 'comment':
        return `${fromUser} commented on your post`;
      case 'follow':
        return `${fromUser} started following you`;
      case 'message':
        return `${fromUser}: ${notification.message?.substring(0, 50) || 'sent you a message'}`;
      case 'message_request':
        return `${fromUser} wants to message you`;
      case 'message_request_accepted':
        return `${fromUser} accepted your message request`;
      case 'message_request_declined':
        return `${fromUser} declined your message request`;
      case 'follow_request_accepted':
        return `${fromUser} accepted your follow request`;
      default:
        return notification.message || 'New notification';
    }
  };

  const renderNotificationActions = (notification) => {
    if (notification.type === 'follow' && !notification.isRead) {
      // Follow request - show accept button
      return (
        <button 
          className="accept-btn small"
          onClick={() => handleAcceptFollowRequest(notification._id, notification.fromUser._id)}
        >
          <UserCheck size={16} />
          Accept
        </button>
      );
    }
    
    if (!notification.isRead) {
      return (
        <button 
          className="mark-read-button"
          onClick={() => handleMarkAsRead(notification._id)}
        >
          <Check size={16} />
        </button>
      );
    }
    
    return (
      <button 
        className="delete-button"
        onClick={() => handleDeleteNotification(notification._id)}
      >
        <X size={16} />
      </button>
    );
  };

  const filterNotifications = (notifications, filter) => {
    if (filter === 'all') return notifications;
    return notifications.filter(n => n.type === filter);
  };

  const filteredNotifications = filterNotifications(notifications, activeFilter);

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
            
            <div className="notifications-controls">
              {unreadCount > 0 && (
                <button 
                  className="mark-all-read"
                  onClick={handleMarkAllAsRead}
                >
                  <Check size={16} />
                  Mark all as read
                </button>
              )}
              
              <div className="filter-buttons">
                {['all', 'follow', 'like', 'comment', 'message'].map(filter => (
                  <button
                    key={filter}
                    className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="notifications-list">
            {filteredNotifications.length === 0 ? (
              <div className="no-notifications">
                <Bell size={48} />
                <h3>No {activeFilter === 'all' ? '' : activeFilter} Notifications</h3>
                <p>
                  {activeFilter === 'all' 
                    ? "You're all caught up!" 
                    : `No ${activeFilter} notifications at this time`}
                </p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div 
                  key={notification._id} 
                  className={`notification-item ${notification.isRead ? 'read' : 'unread'} ${notification.type}-notification`}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="notification-content">
                    <p className="notification-message">
                      {getNotificationMessage(notification)}
                    </p>
                    <p className="notification-time">
                      {new Date(notification.date).toLocaleString()}
                    </p>
                    {notification.type === 'message' && notification.message && (
                      <p className="message-preview">
                        {notification.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="notification-actions">
                    {renderNotificationActions(notification)}
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

export default EnhancedNotificationsPage;