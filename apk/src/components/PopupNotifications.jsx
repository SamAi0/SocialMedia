import React, { useState, useEffect } from 'react';
import { X, Check, User, MessageCircle, Heart, Bell } from 'lucide-react';
import '../styles/PopupNotifications.css';

const PopupNotifications = ({ notifications = [], onNotificationClick, onMarkAsRead, onDismiss }) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  // Add new notifications to visible list
  useEffect(() => {
    const newNotifications = notifications.filter(
      notif => !visibleNotifications.some(v => v._id === notif._id)
    );
    
    if (newNotifications.length > 0) {
      setVisibleNotifications(prev => [...prev, ...newNotifications]);
    }
  }, [notifications]);

  const handleNotificationClick = (notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    dismissNotification(notification._id);
  };

  const handleMarkAsRead = (notificationId, e) => {
    e.stopPropagation();
    if (onMarkAsRead) {
      onMarkAsRead(notificationId);
    }
    dismissNotification(notificationId);
  };

  const dismissNotification = (notificationId) => {
    setVisibleNotifications(prev => prev.filter(n => n._id !== notificationId));
    if (onDismiss) {
      onDismiss(notificationId);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return <Heart size={20} className="like-icon" />;
      case 'comment': return <MessageCircle size={20} className="comment-icon" />;
      case 'follow': return <User size={20} className="follow-icon" />;
      case 'message': return <MessageCircle size={20} className="message-icon" />;
      case 'message_request': return <User size={20} className="request-icon" />;
      case 'message_request_accepted': return <Check size={20} className="accepted-icon" />;
      case 'message_request_declined': return <X size={20} className="declined-icon" />;
      case 'follow_request_accepted': return <Check size={20} className="accepted-icon" />;
      default: return <Bell size={20} />;
    }
  };

  const getNotificationTitle = (notification) => {
    const fromUser = notification.fromUser?.username || notification.fromUser?.name || 'Someone';
    
    switch (notification.type) {
      case 'like': return `${fromUser} liked your post`;
      case 'comment': return `${fromUser} commented on your post`;
      case 'follow': return `${fromUser} started following you`;
      case 'message': return `${fromUser} sent you a message`;
      case 'message_request': return `${fromUser} wants to message you`;
      case 'message_request_accepted': return `${fromUser} accepted your request`;
      case 'message_request_declined': return `${fromUser} declined your request`;
      case 'follow_request_accepted': return `${fromUser} accepted your follow request`;
      default: return 'New notification';
    }
  };

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'message':
        return notification.message?.substring(0, 100) || 'Check it out!';
      case 'message_request':
        return notification.metadata?.content?.substring(0, 100) || 'Wants to connect with you';
      default:
        return notification.message || 'Tap to view details';
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="popup-notifications-container">
      {visibleNotifications.map(notification => (
        <div
          key={notification._id}
          className={`popup-notification ${notification.type}-popup`}
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="notification-header">
            <div className="notification-icon-container">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="notification-title">
              {getNotificationTitle(notification)}
            </div>
            <button
              className="dismiss-button"
              onClick={(e) => {
                e.stopPropagation();
                dismissNotification(notification._id);
              }}
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="notification-content">
            <p className="notification-message">
              {getNotificationMessage(notification)}
            </p>
          </div>
          
          <div className="notification-footer">
            <span className="notification-time">
              {new Date(notification.date).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            
            {!notification.isRead && (
              <button
                className="mark-read-button"
                onClick={(e) => handleMarkAsRead(notification._id, e)}
              >
                <Check size={14} />
                Mark as read
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PopupNotifications;