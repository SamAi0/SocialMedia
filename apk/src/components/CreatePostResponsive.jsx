import React, { useState, useRef, useCallback } from 'react';
import { X, Plus, Image, Video, Camera, MapPin, Calendar, Globe, Lock, Users, Send } from 'lucide-react';
import '../styles/CreatePostResponsive.css';

const CreatePostResponsive = ({ onPostCreated, onCancel, currentUser }) => {
  const [text, setText] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [privacy, setPrivacy] = useState('public'); // public, friends, private
  const [location, setLocation] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Handle file selection
  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    
    if (validFiles.length > 0) {
      const newMediaFiles = validFiles.map(file => ({
        id: Date.now() + Math.random(),
        file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'video',
        name: file.name,
        size: file.size
      }));
      
      setMediaFiles(prev => [...prev, ...newMediaFiles]);
    }
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    
    if (validFiles.length > 0) {
      const newMediaFiles = validFiles.map(file => ({
        id: Date.now() + Math.random(),
        file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'video',
        name: file.name,
        size: file.size
      }));
      
      setMediaFiles(prev => [...prev, ...newMediaFiles]);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  // Remove media file
  const removeMediaFile = useCallback((id) => {
    setMediaFiles(prev => {
      const updated = prev.filter(file => file.id !== id);
      // Revoke object URL to free memory
      const fileToRemove = prev.find(file => file.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return updated;
    });
  }, []);

  // Submit post
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Create post object
      const post = {
        text,
        mediaFiles,
        privacy,
        location,
        scheduledTime,
        hashtags,
        mentions,
        author: currentUser,
        createdAt: new Date().toISOString(),
        id: Date.now()
      };
      
      // Call the callback
      if (onPostCreated) {
        await onPostCreated(post);
      }
      
      // Reset form
      setText('');
      setMediaFiles([]);
      setPrivacy('public');
      setLocation('');
      setScheduledTime('');
      setHashtags([]);
      setMentions([]);
      
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle hashtag detection
  const detectHashtags = useCallback((text) => {
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    const matches = text.match(hashtagRegex) || [];
    setHashtags([...new Set(matches)]);
  }, []);

  // Handle mention detection
  const detectMentions = useCallback((text) => {
    const mentionRegex = /@[a-zA-Z0-9_]+/g;
    const matches = text.match(mentionRegex) || [];
    setMentions([...new Set(matches)]);
  }, []);

  const handleTextChange = (e) => {
    const value = e.target.value;
    setText(value);
    detectHashtags(value);
    detectMentions(value);
  };

  // Privacy icon mapping
  const getPrivacyIcon = (type) => {
    switch (type) {
      case 'private':
        return <Lock size={16} />;
      case 'friends':
        return <Users size={16} />;
      default:
        return <Globe size={16} />;
    }
  };

  return (
    <div 
      className="create-post-responsive-container"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="create-post-card-wrapper">
        <div className="create-post-card">
          {/* Header */}
          <div className="create-post-header">
            <h2 className="create-post-title">Create New Post</h2>
          </div>

          {/* Content with scroll */}
          <div className="create-post-content">
            <form onSubmit={handleSubmit} className="create-post-form">
              {/* Text area */}
              <div className="form-group">
                <label htmlFor="postText" className="create-post-label">
                  Share your thoughts...
                </label>
                <textarea
                  ref={textareaRef}
                  id="postText"
                  className="create-post-textarea"
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Write a caption..."
                  rows={4}
                  maxLength={2200}
                />
                <p className="create-post-hint">
                  {text.length}/2200 characters
                </p>
              </div>

              {/* Media preview */}
              {mediaFiles.length > 0 && (
                <div className="media-upload-section">
                  <label className="create-post-label">Media Preview</label>
                  <div className="media-preview-container">
                    {mediaFiles.map((media) => (
                      <div key={media.id} className="media-preview-item">
                        {media.type === 'image' ? (
                          <img 
                            src={media.url} 
                            alt={media.name} 
                            className="media-preview-img"
                          />
                        ) : (
                          <video 
                            src={media.url} 
                            className="media-preview-img"
                            muted
                            playsInline
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeMediaFile(media.id)}
                          className="remove-media-btn"
                          aria-label="Remove media"
                        >
                          <X size={12} />
                        </button>
                        <div className="create-post-hint" style={{ 
                          position: 'absolute', 
                          bottom: '4px', 
                          left: '4px', 
                          right: '4px', 
                          backgroundColor: 'rgba(0,0,0,0.7)', 
                          color: 'white', 
                          fontSize: '10px', 
                          textAlign: 'center',
                          padding: '2px'
                        }}>
                          {formatFileSize(media.size)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File upload buttons */}
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,video/*"
                  multiple
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="create-post-btn"
                  style={{ marginRight: '8px', backgroundColor: '#f0f0f0', color: '#333' }}
                >
                  <Plus size={16} />
                  <span style={{ marginLeft: '8px' }}>Add Media</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="create-post-btn"
                  style={{ backgroundColor: '#4CAF50', color: 'white' }}
                >
                  <Image size={16} />
                  <span style={{ marginLeft: '8px' }}>Photo</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="create-post-btn"
                  style={{ backgroundColor: '#2196F3', color: 'white', marginLeft: '8px' }}
                >
                  <Video size={16} />
                  <span style={{ marginLeft: '8px' }}>Video</span>
                </button>
              </div>

              {/* Additional options */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="create-post-label">Location</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Add location..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="create-post-label">Schedule Post</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} />
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Privacy settings */}
              <div>
                <label className="create-post-label">Privacy</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { value: 'public', label: 'Public' },
                    { value: 'friends', label: 'Friends' },
                    { value: 'private', label: 'Private' }
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPrivacy(option.value)}
                      style={{
                        backgroundColor: privacy === option.value ? '#667eea' : '#f0f0f0',
                        color: privacy === option.value ? 'white' : '#333',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '14px'
                      }}
                    >
                      {getPrivacyIcon(option.value)}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hashtags and mentions summary */}
              {(hashtags.length > 0 || mentions.length > 0) && (
                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
                    Detected Elements
                  </h4>
                  {hashtags.length > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Hashtags:</strong> {hashtags.join(', ')}
                    </div>
                  )}
                  {mentions.length > 0 && (
                    <div>
                      <strong>Mentions:</strong> {mentions.join(', ')}
                    </div>
                  )}
                </div>
              )}

              {/* Upload progress */}
              {isUploading && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ width: '100%', backgroundColor: '#f0f0f0', borderRadius: '4px', height: '8px' }}>
                    <div 
                      style={{ 
                        width: `${uploadProgress}%`, 
                        backgroundColor: '#667eea', 
                        height: '100%', 
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }} 
                    />
                  </div>
                  <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '14px' }}>
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Footer with action buttons */}
          <div className="create-post-footer">
            <button
              type="button"
              onClick={onCancel}
              className="create-post-btn cancel-btn"
              disabled={isUploading}
            >
              <X size={16} />
              <span style={{ marginLeft: '8px' }}>Cancel</span>
            </button>
            
            <button
              type="submit"
              onClick={handleSubmit}
              className="create-post-btn"
              disabled={isUploading || (!text.trim() && mediaFiles.length === 0)}
            >
              <Send size={16} />
              <span style={{ marginLeft: '8px' }}>
                {isUploading ? 'Posting...' : 'Post'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostResponsive;