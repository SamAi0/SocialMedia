import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck, UserX, Users, MessageCircle } from 'lucide-react';
import API from '../utils/api';
import '../styles/FollowStatusBadge.css';

const FollowStatusBadge = ({ 
  userId, 
  targetUserId, 
  username, 
  onFollowChange,
  showFollowButton = true,
  showMessageButton = true 
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStatus, setFollowStatus] = useState('loading');
  const [loading, setLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    if (userId && targetUserId && userId !== targetUserId) {
      checkFollowStatus();
      fetchFollowersCount();
    } else if (userId === targetUserId) {
      setFollowStatus('self');
    }
  }, [userId, targetUserId]);

  const checkFollowStatus = async () => {
    try {
      const response = await API.get(`/follows/check/${userId}/${targetUserId}`);
      if (response.data.success) {
        setIsFollowing(response.data.isFollowing);
        setFollowStatus(response.data.isFollowing ? 'following' : 'not_following');
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
      setFollowStatus('error');
    }
  };

  const fetchFollowersCount = async () => {
    try {
      const response = await API.get(`/user/${targetUserId}/followers`);
      if (response.data.success) {
        setFollowersCount(response.data.followdetails?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching followers count:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const endpoint = isFollowing 
        ? `/user/${userId}/${targetUserId}/unfollow`
        : `/user/${userId}/${targetUserId}/follow`;
      
      const response = await API.post(endpoint);
      
      if (response.data.success) {
        const newFollowingStatus = !isFollowing;
        setIsFollowing(newFollowingStatus);
        setFollowStatus(newFollowingStatus ? 'following' : 'not_following');
        
        // Update followers count
        setFollowersCount(prev => newFollowingStatus ? prev + 1 : Math.max(0, prev - 1));
        
        // Notify parent component
        if (onFollowChange) {
          onFollowChange(newFollowingStatus);
        }
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      alert(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageUser = () => {
    // Navigate to messages with this user
    window.location.href = `/messages?user=${targetUserId}`;
  };

  const renderFollowButton = () => {
    if (!showFollowButton) return null;
    
    switch (followStatus) {
      case 'loading':
        return (
          <button className="follow-btn loading" disabled>
            <div className="spinner"></div>
          </button>
        );
      
      case 'self':
        return (
          <div className="follow-status self">
            <UserCheck size={16} />
            <span>This is you</span>
          </div>
        );
      
      case 'following':
        return (
          <button 
            className="follow-btn following"
            onClick={handleFollowToggle}
            disabled={loading}
          >
            <UserCheck size={16} />
            <span>Following</span>
          </button>
        );
      
      case 'not_following':
        return (
          <button 
            className="follow-btn follow"
            onClick={handleFollowToggle}
            disabled={loading}
          >
            <UserPlus size={16} />
            <span>Follow</span>
          </button>
        );
      
      case 'error':
        return (
          <button 
            className="follow-btn error"
            onClick={checkFollowStatus}
            title="Retry"
          >
            <UserX size={16} />
            <span>Error</span>
          </button>
        );
      
      default:
        return null;
    }
  };

  const renderMessageButton = () => {
    if (!showMessageButton || followStatus !== 'following') return null;
    
    return (
      <button 
        className="message-btn"
        onClick={handleMessageUser}
        title={`Message ${username}`}
      >
        <MessageCircle size={16} />
      </button>
    );
  };

  return (
    <div className="follow-status-badge">
      <div className="follow-info">
        <div className="followers-count">
          <Users size={16} />
          <span>{followersCount} followers</span>
        </div>
        
        {renderFollowButton()}
        {renderMessageButton()}
      </div>
      
      {isFollowing && (
        <div className="following-indicator">
          <div className="indicator-dot"></div>
          <span>You follow {username}</span>
        </div>
      )}
    </div>
  );
};

export default FollowStatusBadge;