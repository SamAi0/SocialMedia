import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Image, Video, Send } from 'lucide-react';
import API from '../utils/api';
import '../styles/CreatePost.css';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [postType, setPostType] = useState('post'); // 'post' or 'reel'

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      setImage(file);
      setVideo(null); // Clear video if image is selected
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please select a video file');
        return;
      }
      
      // Check file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        setError('Video file size should be less than 100MB');
        return;
      }
      
      setVideo(file);
      setImage(null); // Clear image if video is selected
      setPreview(URL.createObjectURL(file));
      setPostType('reel'); // Auto-set to reel for videos
      setError('');
    }
  };

  const handleRemoveMedia = () => {
    setImage(null);
    setVideo(null);
    setPreview(null);
    setPostType('post');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim() && !image && !video) {
      setError('Please add some content to your post');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userId = localStorage.getItem('userId');
      const formData = new FormData();
      
      formData.append('text', text);
      formData.append('postType', postType);
      
      if (image) {
        formData.append('image', image);
      }
      
      if (video) {
        formData.append('video', video);
      }

      const response = await API.post(
        `/user/${userId}/post/userpost/create`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        // Clear form
        setText('');
        setImage(null);
        setVideo(null);
        setPreview(null);
        setPostType('post');
        
        // Navigate back to home
        navigate('/home');
      } else {
        setError(response.data.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/home');
  };

  return (
    <div className="create-post-page">
      <div className="create-post-container">
        {/* Header */}
        <div className="create-post-header">
          <button className="close-button" onClick={handleClose}>
            <X size={24} />
          </button>
          <h2>Create New Post</h2>
          <button 
            className="share-button"
            onClick={handleSubmit}
            disabled={loading || (!text.trim() && !image && !video)}
          >
            {loading ? 'Posting...' : 'Share'}
          </button>
        </div>

        <div className="create-post-content">
          {/* Media Preview */}
          {preview && (
            <div className="media-preview">
              <button 
                className="remove-media"
                onClick={handleRemoveMedia}
              >
                <X size={20} />
              </button>
              
              {image && (
                <img src={preview} alt="Preview" className="preview-image" />
              )}
              
              {video && (
                <video 
                  src={preview} 
                  controls 
                  className="preview-video"
                  muted
                />
              )}
            </div>
          )}

          {/* Text Input */}
          <div className="text-input-container">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
              className="post-textarea"
              rows={6}
            />
            
            <div className="media-upload-buttons">
              <label className="upload-button">
                <Image size={20} />
                <span>Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
              
              <label className="upload-button">
                <Video size={20} />
                <span>Video</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePostPage;