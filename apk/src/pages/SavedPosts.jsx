import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, X } from 'lucide-react';
import API from '../utils/api';
import Posts from '../components/Post';
import '../styles/ProfilePage.css';

const SavedPosts = () => {
  const navigate = useNavigate();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
          navigate('/');
          return;
        }

        // Fetch user data
        const userResponse = await API.get(`/user/profile/${userId}`);
        if (userResponse.data.success) {
          setUser(userResponse.data.exist);
        }

        // Fetch saved posts
        const response = await API.get(`/user/post/${userId}/saved`);
        if (response.data.success) {
          setSavedPosts(response.data.savedPosts || []);
        }
      } catch (error) {
        console.error('Error fetching saved posts:', error);
        setError('Failed to load saved posts');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [navigate]);

  const handleUnsave = async (postId) => {
    try {
      const userId = localStorage.getItem('userId');
      await API.delete(`/user/post/${userId}/${postId}/unsave`);
      
      // Remove from local state
      setSavedPosts(savedPosts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Error unsaving post:', error);
    }
  };

  const handlePostClick = (post) => {
    navigate(`/post/${post._id}`);
  };

  if (loading) {
    return (
      <div className="saved-posts-page">
        <div className="loading">Loading saved posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="saved-posts-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="saved-posts-page">
      {/* Header */}
      <div className="saved-posts-header">
        <div className="header-content">
          <h1>Saved</h1>
          <p>{savedPosts.length} posts saved</p>
        </div>
      </div>

      {/* Content */}
      <div className="saved-posts-content">
        {savedPosts.length === 0 ? (
          <div className="no-saved-posts">
            <Bookmark size={48} />
            <h3>No Saved Posts Yet</h3>
            <p>Save posts to see them here</p>
          </div>
        ) : (
          <div className="saved-posts-grid">
            {savedPosts.map(post => (
              <div key={post._id} className="saved-post-card">
                <div 
                  className="post-thumbnail"
                  onClick={() => handlePostClick(post)}
                >
                  {post.image && (
                    <img src={post.image} alt={post.text} />
                  )}
                  {post.video && (
                    <div className="video-thumbnail">
                      <video src={post.video} />
                    </div>
                  )}
                  <div className="post-overlay">
                    <div className="post-stats">
                      <span>
                        <Heart size={16} /> {post.likes?.length || 0}
                      </span>
                      <span>
                        <MessageCircle size={16} /> {post.comments?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="unsave-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnsave(post._id);
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPosts;