import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, X, Edit3, Trash2, Eye, Send } from 'lucide-react';
import '../styles/Scheduler.css';
import API from '../utils/api';

const Scheduler = ({ onClose, onSchedule, initialPost = null }) => {
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    text: '',
    media: [],
    scheduledTime: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    postType: 'feed',
    privacy: 'public',
    hashtags: ''
  });

  useEffect(() => {
    loadScheduledPosts();
  }, []);

  const loadScheduledPosts = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/scheduled-posts');
      
      if (response.data.success) {
        setScheduledPosts(response.data.scheduledPosts || []);
      }
    } catch (error) {
      console.error('Error loading scheduled posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.text.trim() && formData.media.length === 0) {
      alert('Please add some content or media');
      return;
    }

    if (!formData.scheduledTime) {
      alert('Please select a schedule time');
      return;
    }

    try {
      const postData = {
        content: {
          text: formData.text,
          media: formData.media
        },
        scheduledTime: new Date(formData.scheduledTime).toISOString(),
        timezone: formData.timezone,
        postType: formData.postType,
        privacy: formData.privacy,
        hashtags: formData.hashtags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (editingPost) {
        // Update existing scheduled post
        const response = await API.put(`/api/scheduled-posts/${editingPost._id}`, postData);
        if (response.data.success) {
          alert('Scheduled post updated successfully');
        }
      } else {
        // Create new scheduled post
        const response = await API.post('/api/scheduled-posts', postData);
        if (response.data.success) {
          alert('Post scheduled successfully');
        }
      }

      // Reset form and refresh
      resetForm();
      loadScheduledPosts();
      
      if (onSchedule) {
        onSchedule();
      }
    } catch (error) {
      console.error('Error scheduling post:', error);
      alert('Failed to schedule post');
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled post?')) {
      return;
    }

    try {
      const response = await API.delete(`/api/scheduled-posts/${postId}`);
      if (response.data.success) {
        loadScheduledPosts();
        alert('Scheduled post cancelled');
      }
    } catch (error) {
      console.error('Error deleting scheduled post:', error);
      alert('Failed to cancel scheduled post');
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      text: post.content?.text || '',
      media: post.content?.media || [],
      scheduledTime: new Date(post.scheduledTime).toISOString().slice(0, 16),
      timezone: post.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      postType: post.postType || 'feed',
      privacy: post.privacy || 'public',
      hashtags: (post.hashtags || []).join(', ')
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      text: '',
      media: [],
      scheduledTime: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      postType: 'feed',
      privacy: 'public',
      hashtags: ''
    });
    setEditingPost(null);
    setShowCreateForm(false);
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      file: file
    }));
    
    setFormData(prev => ({
      ...prev,
      media: [...prev.media, ...newMedia]
    }));
  };

  const removeMedia = (index) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { class: 'status-scheduled', text: 'Scheduled' },
      published: { class: 'status-published', text: 'Published' },
      failed: { class: 'status-failed', text: 'Failed' },
      cancelled: { class: 'status-cancelled', text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (showCreateForm) {
    return (
      <div className="scheduler-modal">
        <div className="scheduler-container">
          <div className="scheduler-header">
            <h2>{editingPost ? 'Edit Scheduled Post' : 'Schedule New Post'}</h2>
            <button className="close-btn" onClick={resetForm}>
              <X size={24} />
            </button>
          </div>

          <form className="scheduler-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Content</label>
              <textarea
                value={formData.text}
                onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                placeholder="What's on your mind?"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Media</label>
              <div className="media-upload">
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleMediaUpload}
                  id="media-upload"
                  style={{ display: 'none' }}
                />
                <label htmlFor="media-upload" className="upload-button">
                  <Plus size={16} /> Add Media
                </label>
                
                <div className="media-preview">
                  {formData.media.map((media, index) => (
                    <div key={index} className="media-item">
                      {media.type === 'image' ? (
                        <img src={media.url} alt="Preview" />
                      ) : (
                        <video src={media.url} />
                      )}
                      <button
                        type="button"
                        className="remove-media"
                        onClick={() => removeMedia(index)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Schedule Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div className="form-group">
                <label>Timezone</label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Post Type</label>
                <select
                  value={formData.postType}
                  onChange={(e) => setFormData(prev => ({ ...prev, postType: e.target.value }))}
                >
                  <option value="feed">Feed Post</option>
                  <option value="story">Story</option>
                </select>
              </div>

              <div className="form-group">
                <label>Privacy</label>
                <select
                  value={formData.privacy}
                  onChange={(e) => setFormData(prev => ({ ...prev, privacy: e.target.value }))}
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Hashtags</label>
              <input
                type="text"
                value={formData.hashtags}
                onChange={(e) => setFormData(prev => ({ ...prev, hashtags: e.target.value }))}
                placeholder="Enter hashtags separated by commas"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                {editingPost ? 'Update Schedule' : 'Schedule Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="scheduler-modal">
      <div className="scheduler-container">
        <div className="scheduler-header">
          <h2>Content Scheduler</h2>
          <div className="header-actions">
            <button className="create-btn" onClick={() => setShowCreateForm(true)}>
              <Plus size={18} /> Schedule Post
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="scheduler-content">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading scheduled posts...</p>
            </div>
          ) : scheduledPosts.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <h3>No scheduled posts</h3>
              <p>Schedule your content to be published automatically at the perfect time</p>
              <button className="create-first-btn" onClick={() => setShowCreateForm(true)}>
                Schedule Your First Post
              </button>
            </div>
          ) : (
            <div className="scheduled-posts">
              {scheduledPosts.map((post) => (
                <div key={post._id} className="scheduled-post-card">
                  <div className="post-header">
                    <div className="post-info">
                      <h4>{post.content?.text?.substring(0, 50) || 'Untitled Post'}</h4>
                      <div className="post-meta">
                        <span className="schedule-time">
                          <Clock size={14} />
                          {formatDate(post.scheduledTime)}
                        </span>
                        {getStatusBadge(post.status)}
                      </div>
                    </div>
                    <div className="post-actions">
                      {post.status === 'scheduled' && (
                        <>
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => handleEdit(post)}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(post._id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {post.content?.media?.length > 0 && (
                    <div className="post-media">
                      {post.content.media.slice(0, 3).map((media, index) => (
                        <div key={index} className="media-thumbnail">
                          {media.type === 'image' ? (
                            <img src={media.url} alt="Media preview" />
                          ) : (
                            <div className="video-placeholder">
                              <span>🎬</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {post.content.media.length > 3 && (
                        <div className="more-media">
                          +{post.content.media.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="post-footer">
                    <span className="post-type">{post.postType}</span>
                    <span className="privacy">{post.privacy}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scheduler;