import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, MessageSquare, BarChart3, Shield, LogOut, Activity } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import API from '../utils/api';

const AdminDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    activeToday: 0
  });
  const [loading, setLoading] = useState(true);
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

        // Load admin stats
        const statsResponse = await API.get('/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (statsResponse.data.success) {
          setAdminStats(statsResponse.data.stats);
        }
      } catch (error) {
        console.error('Error verifying admin access:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Sidebar user={currentUser} />
      <div className="admin-content">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>

        <div className="admin-stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={32} />
            </div>
            <div className="stat-info">
              <h3>{adminStats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <BarChart3 size={32} />
            </div>
            <div className="stat-info">
              <h3>{adminStats.activeToday}</h3>
              <p>Active Today</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <MessageSquare size={32} />
            </div>
            <div className="stat-info">
              <h3>{adminStats.totalPosts}</h3>
              <p>Total Posts</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Activity size={32} />
            </div>
            <div className="stat-info">
              <h3>{adminStats.totalComments}</h3>
              <p>Total Comments</p>
            </div>
          </div>
        </div>

        <div className="admin-quick-links">
          <h2>Quick Links</h2>
          <div className="quick-links-grid">
            <Link to="/admin/users" className="quick-link-card">
              <div className="link-icon">
                <Users size={24} />
              </div>
              <h3>User Management</h3>
              <p>Manage user accounts and permissions</p>
            </Link>
            
            <Link to="/admin/content" className="quick-link-card">
              <div className="link-icon">
                <Shield size={24} />
              </div>
              <h3>Content Moderation</h3>
              <p>Moderate posts and comments</p>
            </Link>
            
            <Link to="/admin/reports" className="quick-link-card">
              <div className="link-icon">
                <BarChart3 size={24} />
              </div>
              <h3>Reports & Analytics</h3>
              <p>View platform analytics and reports</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;