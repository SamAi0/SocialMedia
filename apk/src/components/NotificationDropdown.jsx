import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, Archive, Trash2, Settings, BarChart3, Star, StarOff } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import '../styles/Notifications.css';

const NotificationDropdown = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const dropdownRef = useRef(null);
  const { 
    notifications, 
    unreadCount, 
    urgentCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    markAsImportant
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchNotifications({ 
        type: filter !== 'all' ? filter : undefined,
        sortBy: sortBy,
        limit: 10
      });
    }
  }, [isOpen, filter, sortBy, userId, fetchNotifications]);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    // Handle navigation based on notification type
    switch (notification.type) {
      case 'like':
      case 'comment':
        if (notification.post) {
          window.location.href = `/post/${notification.post._id}`;
        }
        break;
      case 'follow':
        if (notification.fromUser) {
          window.location.href = `/user/${notification.fromUser._id}`;
        }
        break;
      case 'message':
        window.location.href = '/messages';
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'follow': return '👤';
      case 'message': return '✉️';
      case 'message_request': return '.NewRequest';
      case 'message_request_accepted': return '✅';
      case 'message_request_declined': return '❌';
      case 'follow_request_accepted': return '🤝';
      case 'mention': return '@';
      case 'tag': return '🏷️';
      case 'story_reply': return '📸';
      case 'group_invite': return '👥';
      case 'event_reminder': return '📅';
      case 'system': return '📢';
      default: return '🔔';
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#ff4757';
      case 'high': return '#ffa502';
      case 'medium': return '#3742fa';
      case 'low': return '#747d8c';
      default: return '#747d8c';
    }
  };

  const isImportant = (notification) => {
    return notification.metadata?.important === 'true';
  };

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <button 
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {urgentCount > 0 && (
          <span className="urgent-indicator" title={`${urgentCount} urgent notifications`}>
            !
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-controls">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All</option>
                <option value="like">Likes</option>
                <option value="comment">Comments</option>
                <option value="follow">Follows</option>
                <option value="message">Messages</option>
                <option value="mention">Mentions</option>
                <option value="system">System</option>
              </select>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="date">Newest</option>
                <option value="priority">Priority</option>
              </select>
              <button 
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="mark-all-read"
                title="Mark all as read"
              >
                <Check size={16} />
              </button>
            </div>
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="loading-notifications">
                <div className="spinner"></div>
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <Bell size={48} />
                <p>No notifications yet</p>
                <p className="subtext">Your notifications will appear here</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification._id}
                  className={`notification-item ${notification.isRead ? 'read' : 'unread'} ${isImportant(notification) ? 'important' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <div className="notification-icon" style={{ color: getPriorityColor(notification.priority) }}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-text">
                      <p className="notification-message">
                        {getNotificationMessage(notification) || 
                         `${notification.fromUser?.name || 'Someone'} ${notification.type}ed your ${notification.type === 'follow' ? 'profile' : 'post'}`}
                      </p>
                      <p className="notification-time">
                        {new Date(notification.date).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <div className="notification-actions">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsImportant(notification._id, !isImportant(notification));
                        }}
                        className="action-btn"
                        title={isImportant(notification) ? "Remove importance" : "Mark as important"}
                      >
                        {isImportant(notification) ? <StarOff size={16} /> : <Star size={16} />}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          archiveNotification(notification._id);
                        }}
                        className="action-btn"
                        title="Archive"
                      >
                        <Archive size={16} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                        className="action-btn delete"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="notification-footer">
            <button 
              className="view-all-btn"
              onClick={() => {
                window.location.href = '/notifications';
                setIsOpen(false);
              }}
            >
              View All Notifications
            </button>
            <button 
              className="settings-btn"
              onClick={() => {
                window.location.href = '/settings/notifications';
                setIsOpen(false);
              }}
            >
              <Settings size={16} />
              Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;