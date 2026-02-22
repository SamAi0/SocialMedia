import React, { useState, useEffect, useCallback } from 'react';
import { User, MessageCircle, Clock, Activity, Users, TrendingUp } from 'lucide-react';
import API from '../utils/api';

const UserActivityTracker = ({ userId, targetUserId = null }) => {
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(30); // days

  const fetchActivityData = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };
      
      let endpoint;
      if (targetUserId) {
        // Get conversation activity between two users
        endpoint = `/api/user/${userId}/conversation/${targetUserId}/activity?days=${timeRange}`;
      } else {
        // Get user's own activity report
        endpoint = `/api/user/${userId}/activity/report?days=${timeRange}`;
      }

      const response = await API.get(endpoint, { headers });
      
      if (response.data.success) {
        setActivityData(response.data[targetUserId ? 'activity' : 'report']);
      } else {
        setError('Failed to fetch activity data');
      }
    } catch (err) {
      console.error('Error fetching activity data:', err);
      setError('Error loading activity data');
    } finally {
      setLoading(false);
    }
  }, [userId, targetUserId, timeRange]);

  useEffect(() => {
    fetchActivityData();
  }, [fetchActivityData]);

  const getUserStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'recently': return 'text-yellow-500';
      case 'today': return 'text-orange-500';
      case 'inactive': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  const getUserStatusText = (status) => {
    switch (status) {
      case 'online': return 'Online';
      case 'recently': return 'Recently active';
      case 'today': return 'Active today';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="activity-tracker-loading">
        <Activity className="animate-spin" size={24} />
        <span>Loading activity data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="activity-tracker-error">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchActivityData}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!activityData) {
    return (
      <div className="activity-tracker-empty">
        <Activity size={48} className="text-gray-300" />
        <p>No activity data available</p>
      </div>
    );
  }

  return (
    <div className="user-activity-tracker">
      {/* Header with time range selector */}
      <div className="activity-header">
        <h3>
          {targetUserId ? 'Conversation Activity' : 'Your Activity Report'}
        </h3>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(parseInt(e.target.value))}
          className="time-range-selector"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* User Status (if showing individual user) */}
      {activityData.status && (
        <div className="user-status-card">
          <div className="status-header">
            <User size={20} />
            <span className="status-label">Current Status</span>
          </div>
          <div className="status-content">
            <span className={`status-indicator ${getUserStatusColor(activityData.status.status)}`}>
              ●
            </span>
            <span className="status-text">{getUserStatusText(activityData.status.status)}</span>
            {activityData.status.lastSeen && (
              <span className="last-seen">
                Last seen: {new Date(activityData.status.lastSeen).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Activity Statistics */}
      {activityData.activityStats && (
        <div className="activity-stats">
          <h4><TrendingUp size={18} /> Activity Overview</h4>
          <div className="stats-grid">
            {activityData.activityStats.map((stat, index) => (
              <div key={index} className="stat-card">
                <span className="stat-action">{stat._id.replace('_', ' ')}</span>
                <span className="stat-count">{stat.count}</span>
                <span className="stat-last">
                  Last: {new Date(stat.lastActivity).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messaging Statistics */}
      {activityData.messagingStats && (
        <div className="messaging-stats">
          <h4><MessageCircle size={18} /> Messaging Activity</h4>
          <div className="messaging-grid">
            {activityData.messagingStats.map((stat, index) => (
              <div key={index} className="message-stat">
                <span className="stat-label">
                  {stat._id === 'message_sent' ? 'Messages Sent' : 'Messages Received'}
                </span>
                <span className="stat-value">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversation Specific Stats */}
      {activityData.user1MessageCount !== undefined && (
        <div className="conversation-stats">
          <h4><Users size={18} /> Conversation Breakdown</h4>
          <div className="conversation-grid">
            <div className="conv-stat">
              <span className="stat-label">Your Messages</span>
              <span className="stat-value">{activityData.user1MessageCount}</span>
            </div>
            <div className="conv-stat">
              <span className="stat-label">Their Messages</span>
              <span className="stat-value">{activityData.user2MessageCount}</span>
            </div>
            <div className="conv-stat">
              <span className="stat-label">Total Interactions</span>
              <span className="stat-value">{activityData.totalInteractions}</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activities */}
      {activityData.activities && activityData.activities.length > 0 && (
        <div className="recent-activities">
          <h4><Clock size={18} /> Recent Activity</h4>
          <div className="activities-list">
            {activityData.activities.slice(0, 10).map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {activity.action.includes('message') && <MessageCircle size={16} />}
                  {activity.action.includes('login') && <User size={16} />}
                  {activity.action.includes('post') && <TrendingUp size={16} />}
                  {!activity.action.includes('message') && 
                   !activity.action.includes('login') && 
                   !activity.action.includes('post') && <Activity size={16} />}
                </div>
                <div className="activity-details">
                  <span className="activity-action">{activity.action.replace('_', ' ')}</span>
                  {activity.details && (
                    <span className="activity-description">{activity.details}</span>
                  )}
                  {activity.targetUser && (
                    <span className="activity-target">
                      with {activity.targetUser.name || activity.targetUser.username}
                    </span>
                  )}
                  <span className="activity-time">
                    {new Date(activity.date).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Interactions (for personal reports) */}
      {activityData.userInteractions && activityData.userInteractions.length > 0 && (
        <div className="user-interactions">
          <h4><Users size={18} /> Most Interacted Users</h4>
          <div className="interactions-list">
            {activityData.userInteractions.map((interaction, index) => (
              <div key={index} className="interaction-item">
                <div className="user-avatar">
                  {interaction.userDetails.avatar ? (
                    <img src={interaction.userDetails.avatar} alt={interaction.userDetails.name} />
                  ) : (
                    <User size={24} />
                  )}
                </div>
                <div className="user-info">
                  <span className="user-name">
                    {interaction.userDetails.name || interaction.userDetails.username}
                  </span>
                  <span className="interaction-count">
                    {interaction.interactionCount} interactions
                  </span>
                  <span className="last-interaction">
                    Last: {new Date(interaction.lastInteraction).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="activity-actions">
        <button 
          onClick={fetchActivityData}
          className="refresh-button"
          disabled={loading}
        >
          <Activity size={16} />
          Refresh Activity
        </button>
      </div>
    </div>
  );
};

export default UserActivityTracker;