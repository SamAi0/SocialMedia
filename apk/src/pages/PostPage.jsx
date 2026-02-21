import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Bookmark, ArrowLeft, MoreHorizontal } from 'lucide-react';
import API from '../utils/api';
import '../styles/Posts.css';

const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await API.get(`/user/post/userpost/${postId}/get`);
        if (response.data.success) {
          setPost(response.data.post);
          
          // Check if post is liked by current user
          const userId = localStorage.getItem('userId');
          const liked = response.data.post.likes?.includes(userId);
          setIsLiked(liked);
          
          // Check if post is saved
          setIsSaved(response.data.post.isSaved || false);
        } else {
          setError('Post not found');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const handleLike = async () => {
    try {
      const userId = localStorage.getItem('userId');
      await API.post(`/user/${userId}/post/userpost/${postId}/like`, {});
      
      // Toggle like state
      setIsLiked(!isLiked);
      
      // Update like count
      if (post) {
        setPost({
          ...post,
          likes: isLiked 
            ? post.likes.filter(id => id !== userId)
            : [...(post.likes || []), userId]
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSave = async () => {
    try {
      const userId = localStorage.getItem('userId');
      await API.post(`/user/post/${userId}/${postId}/save`, {});
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const userId = localStorage.getItem('userId');
      const response = await API.post(
        `/user/${userId}/post/userpost/${postId}/comment/add`,
        { text: newComment }
      );
      
      if (response.data.success) {
        // Add comment to list
        setComments([...comments, {
          _id: Date.now(),
          text: newComment,
          user: { _id: userId, name: 'You' },
          date: new Date()
        }]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="post-page">
        <div className="loading">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="post-page">
        <div className="error">{error || 'Post not found'}</div>
        <button onClick={handleBack} className="back-button">
          <ArrowLeft size={20} /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="post-page">
      <div className="post-header">
        <button onClick={handleBack} className="back-button">
          <ArrowLeft size={24} />
        </button>
        <h2>Post</h2>
      </div>

      <div className="post-container">
        <div className="post-content">
          {/* Post Image/Video */}
          {post.image && (
            <img src={post.image} alt={post.text} className="post-image" />
          )}
          {post.video && (
            <video controls className="post-video">
              <source src={post.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}

          {/* Post Actions */}
          <div className="post-actions">
            <div className="action-buttons">
              <button 
                className={`action-button ${isLiked ? 'liked' : ''}`}
                onClick={handleLike}
              >
                <Heart size={24} />
                <span>{post.likes?.length || 0}</span>
              </button>
              
              <button className="action-button">
                <MessageCircle size={24} />
                <span>{comments.length}</span>
              </button>
              
              <button className="action-button">
                <Share2 size={24} />
                <span>Share</span>
              </button>
              
              <button 
                className={`action-button ${isSaved ? 'saved' : ''}`}
                onClick={handleSave}
              >
                <Bookmark size={24} />
                <span>Save</span>
              </button>
            </div>

            <button className="more-button">
              <MoreHorizontal size={24} />
            </button>
          </div>

          {/* Post Text */}
          <div className="post-text">
            <p>{post.text}</p>
          </div>

          {/* Comments Section */}
          <div className="comments-section">
            <h3>Comments ({comments.length})</h3>
            
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="comment-input"
              />
              <button type="submit" className="comment-submit" disabled={!newComment.trim()}>
                Post
              </button>
            </form>

            <div className="comments-list">
              {comments.map(comment => (
                <div key={comment._id} className="comment-item">
                  <div className="comment-user">
                    {comment.user?.name || 'User'}
                  </div>
                  <div className="comment-text">
                    {comment.text}
                  </div>
                  <div className="comment-date">
                    {new Date(comment.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPage;