import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Flag, Trash2, CheckCircle, Eye, Clock, AlertTriangle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import API from '../utils/api';

const AdminContentModeration = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // posts, comments, reports
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showContentDetails, setShowContentDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
          navigate('/login');
          return;
        }

        // Verify admin access
        const response = await API.get(`/admin/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.data.success || !response.data.isAdmin) {
          navigate('/');
          return;
        }

        // Get current user
        const userResponse = await API.get(`/user/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (userResponse.data.exist?.isAdmin) {
          setCurrentUser(userResponse.data.exist);
        } else {
          navigate('/');
          return;
        }

        // Load content
        await loadContent();
      } catch (error) {
        console.error('Error loading admin page:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  const loadContent = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // Load posts
      const postsResponse = await API.get('/admin/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (postsResponse.data.success) {
        setPosts(postsResponse.data.posts);
      }

      // Load comments
      const commentsResponse = await API.get('/admin/comments', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (commentsResponse.data.success) {
        setComments(commentsResponse.data.comments);
      }

      // Load reports
      const reportsResponse = await API.get('/admin/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (reportsResponse.data.success) {
        setReports(reportsResponse.data.reports);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await API.delete(`/admin/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await API.delete(`/admin/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const approveReport = async (reportId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await API.patch(`/admin/reports/${reportId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setReports(prevReports => prevReports.filter(report => report._id !== reportId));
      }
    } catch (error) {
      console.error('Error approving report:', error);
    }
  };

  const viewContentDetails = (content, type) => {
    setSelectedContent({...content, type});
    setShowContentDetails(true);
  };

  const closeContentDetails = () => {
    setSelectedContent(null);
    setShowContentDetails(false);
  };

  const renderPostsTab = () => (
    <div className="content-list">
      {posts.map(post => (
        <div key={post._id} className="content-item">
          <div className="content-header">
            <div className="user-info">
              <img 
                src={post.user?.avatar || '/assets/default-avatar.svg'} 
                alt={post.user?.name} 
                className="user-avatar-small"
              />
              <div className="user-details">
                <h4>{post.user?.name}</h4>
                <p>@{post.user?.username || 'user'}</p>
              </div>
            </div>
            <div className="content-date">
              <Clock size={16} />
              {new Date(post.date || post.createdAt).toLocaleDateString()}
            </div>
          </div>
          
          <div className="content-body">
            {post.image && (
              <img src={post.image} alt="Post" className="content-image" />
            )}
            {post.video && (
              <video src={post.video} controls className="content-video" />
            )}
            {post.text && (
              <p className="content-text">{post.text}</p>
            )}
          </div>
          
          <div className="content-actions">
            <button 
              className="action-button view"
              onClick={() => viewContentDetails(post, 'post')}
            >
              <Eye size={16} /> View
            </button>
            <button 
              className="action-button delete"
              onClick={() => deletePost(post._id)}
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      ))}
      
      {posts.length === 0 && (
        <div className="no-results">
          <MessageSquare size={48} />
          <h3>No posts found</h3>
          <p>No posts exist in the system</p>
        </div>
      )}
    </div>
  );

  const renderCommentsTab = () => (
    <div className="content-list">
      {comments.map(comment => (
        <div key={comment._id} className="content-item">
          <div className="content-header">
            <div className="user-info">
              <img 
                src={comment.user?.avatar || '/assets/default-avatar.svg'} 
                alt={comment.user?.name} 
                className="user-avatar-small"
              />
              <div className="user-details">
                <h4>{comment.user?.name}</h4>
                <p>@{comment.user?.username || 'user'}</p>
              </div>
            </div>
            <div className="content-date">
              <Clock size={16} />
              {new Date(comment.createdAt || comment.date).toLocaleDateString()}
            </div>
          </div>
          
          <div className="content-body">
            <p className="content-text">{comment.text}</p>
          </div>
          
          <div className="content-actions">
            <button 
              className="action-button view"
              onClick={() => viewContentDetails(comment, 'comment')}
            >
              <Eye size={16} /> View
            </button>
            <button 
              className="action-button delete"
              onClick={() => deleteComment(comment._id)}
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      ))}
      
      {comments.length === 0 && (
        <div className="no-results">
          <MessageSquare size={48} />
          <h3>No comments found</h3>
          <p>No comments exist in the system</p>
        </div>
      )}
    </div>
  );

  const renderReportsTab = () => (
    <div className="content-list">
      {reports.map(report => (
        <div key={report._id} className="content-item">
          <div className="content-header">
            <div className="user-info">
              <img 
                src={report.reportedBy?.avatar || '/assets/default-avatar.svg'} 
                alt={report.reportedBy?.name} 
                className="user-avatar-small"
              />
              <div className="user-details">
                <h4>Reported by: {report.reportedBy?.name}</h4>
                <p>Reason: {report.reason}</p>
              </div>
            </div>
            <div className="content-date">
              <Clock size={16} />
              {new Date(report.createdAt).toLocaleDateString()}
            </div>
          </div>
          
          <div className="content-body">
            <p className="content-text"><strong>Reported content:</strong> {report.contentText || report.description}</p>
          </div>
          
          <div className="content-actions">
            <button 
              className="action-button approve"
              onClick={() => approveReport(report._id)}
            >
              <CheckCircle size={16} /> Approve
            </button>
            <button 
              className="action-button view"
              onClick={() => viewContentDetails(report, 'report')}
            >
              <Eye size={16} /> View
            </button>
          </div>
        </div>
      ))}
      
      {reports.length === 0 && (
        <div className="no-results">
          <Flag size={48} />
          <h3>No reports found</h3>
          <p>No pending reports exist in the system</p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading content moderation...</p>
      </div>
    );
  }

  return (
    <div className="admin-content-moderation">
      <Sidebar user={currentUser} />
      <div className="admin-content">
        <div className="admin-header">
          <h1>Content Moderation</h1>
          <Link to="/admin" className="back-to-dashboard">
            Back to Dashboard
          </Link>
        </div>

        <div className="tabs-container">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              <MessageSquare size={18} />
              Posts
              <span className="badge">{posts.length}</span>
            </button>
            <button 
              className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              <MessageSquare size={18} />
              Comments
              <span className="badge">{comments.length}</span>
            </button>
            <button 
              className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <Flag size={18} />
              Reports
              <span className="badge">{reports.length}</span>
            </button>
          </div>
        </div>

        <div className="tab-content">
          {activeTab === 'posts' && renderPostsTab()}
          {activeTab === 'comments' && renderCommentsTab()}
          {activeTab === 'reports' && renderReportsTab()}
        </div>

        {/* Content Details Modal */}
        {showContentDetails && selectedContent && (
          <div className="modal-overlay" onClick={closeContentDetails}>
            <div className="content-details-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedContent.type.charAt(0).toUpperCase() + selectedContent.type.slice(1)} Details</h2>
                <button className="close-modal" onClick={closeContentDetails}>×</button>
              </div>
              
              <div className="content-details-content">
                {selectedContent.type === 'post' && (
                  <>
                    <div className="user-info-full">
                      <img 
                        src={selectedContent.user?.avatar || '/assets/default-avatar.svg'} 
                        alt={selectedContent.user?.name} 
                      />
                      <div>
                        <h3>{selectedContent.user?.name}</h3>
                        <p>@{selectedContent.user?.username || 'user'}</p>
                      </div>
                    </div>
                    
                    <div className="content-preview">
                      {selectedContent.image && (
                        <img src={selectedContent.image} alt="Post" className="preview-image" />
                      )}
                      {selectedContent.video && (
                        <video src={selectedContent.video} controls className="preview-video" />
                      )}
                      {selectedContent.text && (
                        <p className="preview-text">{selectedContent.text}</p>
                      )}
                    </div>
                    
                    <div className="content-meta">
                      <p><strong>Date:</strong> {new Date(selectedContent.date || selectedContent.createdAt).toLocaleString()}</p>
                      <p><strong>Likes:</strong> {selectedContent.likeCount || selectedContent.likes?.length || 0}</p>
                      <p><strong>Comments:</strong> {selectedContent.commentCount || 0}</p>
                    </div>
                  </>
                )}
                
                {selectedContent.type === 'comment' && (
                  <>
                    <div className="user-info-full">
                      <img 
                        src={selectedContent.user?.avatar || '/assets/default-avatar.svg'} 
                        alt={selectedContent.user?.name} 
                      />
                      <div>
                        <h3>{selectedContent.user?.name}</h3>
                        <p>@{selectedContent.user?.username || 'user'}</p>
                      </div>
                    </div>
                    
                    <div className="content-preview">
                      <p className="preview-text">{selectedContent.text}</p>
                    </div>
                    
                    <div className="content-meta">
                      <p><strong>Date:</strong> {new Date(selectedContent.createdAt || selectedContent.date).toLocaleString()}</p>
                    </div>
                  </>
                )}
                
                {selectedContent.type === 'report' && (
                  <>
                    <div className="user-info-full">
                      <img 
                        src={selectedContent.reportedBy?.avatar || '/assets/default-avatar.svg'} 
                        alt={selectedContent.reportedBy?.name} 
                      />
                      <div>
                        <h3>Reported by: {selectedContent.reportedBy?.name}</h3>
                        <p>Reason: {selectedContent.reason}</p>
                      </div>
                    </div>
                    
                    <div className="content-preview">
                      <p className="preview-text"><strong>Reported content:</strong> {selectedContent.contentText || selectedContent.description}</p>
                    </div>
                    
                    <div className="content-meta">
                      <p><strong>Date:</strong> {new Date(selectedContent.createdAt).toLocaleString()}</p>
                      <p><strong>Status:</strong> {selectedContent.status || 'Pending'}</p>
                    </div>
                  </>
                )}
                
                <div className="modal-actions">
                  {selectedContent.type === 'post' && (
                    <button 
                      className="action-button delete"
                      onClick={() => {
                        deletePost(selectedContent._id);
                        closeContentDetails();
                      }}
                    >
                      Delete Post
                    </button>
                  )}
                  {selectedContent.type === 'comment' && (
                    <button 
                      className="action-button delete"
                      onClick={() => {
                        deleteComment(selectedContent._id);
                        closeContentDetails();
                      }}
                    >
                      Delete Comment
                    </button>
                  )}
                  {selectedContent.type === 'report' && (
                    <button 
                      className="action-button approve"
                      onClick={() => {
                        approveReport(selectedContent._id);
                        closeContentDetails();
                      }}
                    >
                      Approve Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContentModeration;