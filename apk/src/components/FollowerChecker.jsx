import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, AlertTriangle } from 'lucide-react';
import API from '../utils/api';
import '../styles/FollowerChecker.css';

const FollowerChecker = ({ userId, onUnfollowDetected }) => {
  const [followers, setFollowers] = useState([]);
  const [previousFollowers, setPreviousFollowers] = useState([]);
  const [checking, setChecking] = useState(false);
  const [unfollowedUsers, setUnfollowedUsers] = useState([]);
  const [lastCheckTime, setLastCheckTime] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  // Load initial followers list
  useEffect(() => {
    if (userId) {
      loadFollowers();
    }
  }, [userId]);

  // Periodic checking (every 5 minutes)
  useEffect(() => {
    if (!userId) return;
    
    const interval = setInterval(() => {
      checkForUnfollows();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [userId, followers]);

  const loadFollowers = async () => {
    try {
      const response = await API.get(`/user/${userId}/followers`);
      if (response.data.success) {
        const followerIds = response.data.followdetails.map(f => f.follower?._id || f.follower);
        setFollowers(followerIds);
        setPreviousFollowers(followerIds);
      }
    } catch (error) {
      console.error('Error loading followers:', error);
    }
  };

  const checkForUnfollows = async () => {
    if (checking) return;
    
    setChecking(true);
    try {
      const response = await API.get(`/user/${userId}/followers`);
      if (response.data.success) {
        const currentFollowers = response.data.followdetails.map(f => f.follower?._id || f.follower);
        setFollowers(currentFollowers);
        
        // Check for unfollows
        const unfollowed = previousFollowers.filter(
          id => !currentFollowers.includes(id)
        );
        
        if (unfollowed.length > 0) {
          setUnfollowedUsers(unfollowed);
          setShowAlert(true);
          
          // Notify parent component
          if (onUnfollowDetected) {
            onUnfollowDetected(unfollowed);
          }
          
          // Update previous followers
          setPreviousFollowers(currentFollowers);
        }
        
        setLastCheckTime(new Date());
      }
    } catch (error) {
      console.error('Error checking for unfollows:', error);
    } finally {
      setChecking(false);
    }
  };

  const getUnfollowedUsernames = () => {
    // In a real app, you'd fetch user details for these IDs
    return unfollowedUsers.map((_, index) => `User ${index + 1}`);
  };

  const dismissAlert = () => {
    setShowAlert(false);
    setUnfollowedUsers([]);
  };

  const refreshCheck = () => {
    checkForUnfollows();
  };

  return (
    <div className="follower-checker">
      {/* Unfollow Alert */}
      {showAlert && (
        <div className="unfollow-alert">
          <div className="alert-content">
            <AlertTriangle size={24} className="alert-icon" />
            <div className="alert-message">
              <h4>Unfollow Detected</h4>
              <p>
                {getUnfollowedUsernames().join(', ')} 
                {unfollowedUsers.length > 1 ? ' have' : ' has'} unfollowed you
              </p>
            </div>
            <button className="dismiss-btn" onClick={dismissAlert}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Checker Controls */}
      <div className="checker-controls">
        <button 
          className="check-btn"
          onClick={refreshCheck}
          disabled={checking}
          title="Check for unfollows now"
        >
          <RefreshCw size={16} className={checking ? 'spinning' : ''} />
          {checking ? 'Checking...' : 'Check Now'}
        </button>
        
        <div className="follower-count">
          <Users size={16} />
          <span>{followers.length} followers</span>
        </div>
        
        {lastCheckTime && (
          <div className="last-check">
            Last checked: {lastCheckTime.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Manual Follower List */}
      <div className="follower-list-section">
        <h4>Recent Followers</h4>
        <div className="follower-list">
          {followers.slice(0, 10).map((followerId, index) => (
            <div key={followerId} className="follower-item">
              <div className="follower-avatar">
                <img 
                  src={`/api/user/${followerId}/avatar`} 
                  alt={`Follower ${index + 1}`}
                  onError={(e) => {
                    e.target.src = '/assets/default-avatar.svg';
                  }}
                />
              </div>
              <span className="follower-name">User {index + 1}</span>
            </div>
          ))}
          {followers.length > 10 && (
            <div className="more-followers">
              +{followers.length - 10} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowerChecker;