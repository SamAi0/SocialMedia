import React, { useState } from 'react';
import { X, Heart, MessageCircle, Share2, Calendar, Lock, Globe, Users } from 'lucide-react';

const PostPreview = ({ postData, onClose }) => {
  const engagementStats = {
    likes: Math.floor(Math.random() * 1000) + 50,
    comments: Math.floor(Math.random() * 100) + 10,
    shares: Math.floor(Math.random() * 50) + 5
  };

  const getPrivacyIcon = (privacy) => {
    switch (privacy) {
      case 'public': return <Globe size={14} />;
      case 'friends': return <Users size={14} />;
      case 'private': return <Lock size={14} />;
      default: return <Globe size={14} />;
    }
  };

  const getPrivacyLabel = (privacy) => {
    switch (privacy) {
      case 'public': return 'Public';
      case 'friends': return 'Friends';
      case 'private': return 'Private';
      default: return 'Public';
    }
  };

  const formatScheduledTime = (scheduledTime) => {
    if (!scheduledTime) return null;
    const date = new Date(scheduledTime);
    return date.toLocaleString();
  };

  if (!postData) return null;

  return (
    <div className="post-preview-overlay">
      <div className="post-preview-container">
        <div className="preview-header">
          <h2>Post Preview</h2>
          <button className="close-preview-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="preview-content">
          <div className="preview-device">
            <div className="device-header">
              <div className="device-status-bar">
                <span className="time">9:41</span>
                <div className="device-icons">
                  <div className="signal">📶</div>
                  <div className="wifi">WiFi</div>
                  <div className="battery">100%</div>
                </div>
              </div>
              <div className="device-navbar">
                <span className="back-button">←</span>
                <span className="title">Post</span>
                <span className="menu-button">⋯</span>
              </div>
            </div>
            
            <div className="device-content">
              {/* Post Header */}
              <div className="preview-post-header">
                <div className="user-info">
                  <div className="user-avatar-placeholder">
                    <span>👤</span>
                  </div>
                  <div className="user-details">
                    <div className="username">YourUsername</div>
                    <div className="post-meta">
                      <span>Just now</span>
                      {postData.privacy && (
                        <span className="privacy-indicator">
                          {getPrivacyIcon(postData.privacy)}
                          {getPrivacyLabel(postData.privacy)}
                        </span>
                      )}
                      {postData.location && (
                        <span className="location-indicator">
                          📍 {postData.location.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="post-actions">
                  <span>⋯</span>
                </div>
              </div>
              
              {/* Post Content */}
              <div className="preview-post-content">
                {postData.text && (
                  <div className="post-text">
                    {postData.text}
                  </div>
                )}
                
                {/* Media Preview */}
                {postData.media && postData.media.length > 0 && (
                  <div className={`media-container ${postData.media.length > 1 ? 'multiple' : 'single'}`}>
                    {postData.media.length === 1 ? (
                      <div className="single-media">
                        {postData.media[0].type === 'image' ? (
                          <div className="image-placeholder">
                            <span>🖼️ Image Preview</span>
                          </div>
                        ) : (
                          <div className="video-placeholder">
                            <span>🎬 Video Preview</span>
                            {postData.duration && (
                              <div className="video-duration">
                                {Math.floor(postData.duration / 60)}:{Math.floor(postData.duration % 60).toString().padStart(2, '0')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="multiple-media-grid">
                        {postData.media.slice(0, 4).map((media, index) => (
                          <div key={index} className={`media-item ${index === 3 && postData.media.length > 4 ? 'has-more' : ''}`}>
                            {media.type === 'image' ? (
                              <div className="image-placeholder">
                                <span>🖼️</span>
                                {index === 3 && postData.media.length > 4 && (
                                  <div className="more-overlay">
                                    +{postData.media.length - 4}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="video-placeholder">
                                <span>🎬</span>
                                {index === 3 && postData.media.length > 4 && (
                                  <div className="more-overlay">
                                    +{postData.media.length - 4}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Hashtags */}
                {postData.hashtags && postData.hashtags.length > 0 && (
                  <div className="post-hashtags">
                    {postData.hashtags.map((tag, index) => (
                      <span key={index} className="hashtag">#{tag.replace('#', '')}</span>
                    ))}
                  </div>
                )}
                
                {/* Scheduled Time */}
                {postData.scheduledTime && (
                  <div className="scheduled-info">
                    <Calendar size={14} />
                    <span>Scheduled for {formatScheduledTime(postData.scheduledTime)}</span>
                  </div>
                )}
              </div>
              
              {/* Post Engagement */}
              <div className="preview-post-engagement">
                <div className="engagement-stats">
                  <div className="stat">
                    <Heart size={16} />
                    <span>{engagementStats.likes.toLocaleString()}</span>
                  </div>
                  <div className="stat">
                    <MessageCircle size={16} />
                    <span>{engagementStats.comments.toLocaleString()}</span>
                  </div>
                  <div className="stat">
                    <Share2 size={16} />
                    <span>{engagementStats.shares.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="engagement-actions">
                  <button className="action-button">
                    <Heart size={20} />
                  </button>
                  <button className="action-button">
                    <MessageCircle size={20} />
                  </button>
                  <button className="action-button">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="device-navbar-bottom">
              <div className="nav-item active">🏠</div>
              <div className="nav-item">🔍</div>
              <div className="nav-item">➕</div>
              <div className="nav-item">❤️</div>
              <div className="nav-item">👤</div>
            </div>
          </div>
          
          {/* Analytics Preview */}
          <div className="analytics-preview">
            <h3>Analytics Preview</h3>
            <div className="analytics-metrics">
              <div className="metric-card">
                <div className="metric-value">{engagementStats.likes}</div>
                <div className="metric-label">Likes</div>
                <div className="metric-trend positive">+12% from avg</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">{engagementStats.comments}</div>
                <div className="metric-label">Comments</div>
                <div className="metric-trend positive">+8% from avg</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">{engagementStats.shares}</div>
                <div className="metric-label">Shares</div>
                <div className="metric-trend negative">-3% from avg</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">
                  {Math.round((engagementStats.likes + engagementStats.comments + engagementStats.shares) / (postData.text?.length || 1) * 100) / 100}
                </div>
                <div className="metric-label">Engagement Rate</div>
                <div className="metric-trend positive">Good</div>
              </div>
            </div>
            
            <div className="recommendations">
              <h4>Optimization Tips</h4>
              <ul>
                <li className="tip">✅ Great use of hashtags for discoverability</li>
                <li className="tip">✅ Media content looks engaging</li>
                <li className="tip warning">⚠️ Consider adding more context to your caption</li>
                <li className="tip">✅ Perfect timing for posting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPreview;