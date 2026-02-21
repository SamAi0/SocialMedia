import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Search, Eye, Edit, Trash2, Shield, ShieldOff, AlertTriangle, CheckCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import API from '../utils/api';

const AdminUserManagement = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
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

        // Load users
        await loadUsers();
      } catch (error) {
        console.error('Error loading admin page:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await API.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const toggleUserAdmin = async (userId, currentAdminStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await API.patch(`/admin/users/${userId}/toggle-admin`, 
        { isAdmin: !currentAdminStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId ? { ...user, isAdmin: !currentAdminStatus } : user
          )
        );
        setFilteredUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId ? { ...user, isAdmin: !currentAdminStatus } : user
          )
        );
      }
    } catch (error) {
      console.error('Error toggling admin status:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await API.delete(`/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Remove user from state
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        setFilteredUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
    setShowUserDetails(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading user management...</p>
      </div>
    );
  }

  return (
    <div className="admin-user-management">
      <Sidebar user={currentUser} />
      <div className="admin-content">
        <div className="admin-header">
          <h1>User Management</h1>
          <Link to="/admin" className="back-to-dashboard">
            Back to Dashboard
          </Link>
        </div>

        <div className="admin-search-bar">
          <div className="search-container">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search users by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Name</th>
                <th>Email</th>
                <th>Username</th>
                <th>Account Type</th>
                <th>Admin Status</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td>
                    <img 
                      src={user.avatar || '/assets/default-avatar.svg'} 
                      alt={user.name} 
                      className="user-avatar-small"
                    />
                  </td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.username || 'N/A'}</td>
                  <td>{user.accountType}</td>
                  <td>
                    {user.isAdmin ? (
                      <span className="admin-badge admin">Admin</span>
                    ) : (
                      <span className="admin-badge user">User</span>
                    )}
                  </td>
                  <td>{new Date(user.date).toLocaleDateString()}</td>
                  <td className="user-actions">
                    <button 
                      className="action-button view"
                      onClick={() => viewUserDetails(user)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className={`action-button ${user.isAdmin ? 'demote' : 'promote'}`}
                      onClick={() => toggleUserAdmin(user._id, user.isAdmin)}
                      title={user.isAdmin ? 'Remove Admin Rights' : 'Make Admin'}
                    >
                      {user.isAdmin ? <ShieldOff size={16} /> : <Shield size={16} />}
                    </button>
                    <button 
                      className="action-button delete"
                      onClick={() => deleteUser(user._id)}
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="no-results">
            <AlertTriangle size={48} />
            <h3>No users found</h3>
            <p>{searchTerm ? 'Try adjusting your search terms' : 'No users exist in the system'}</p>
          </div>
        )}

        {/* User Details Modal */}
        {showUserDetails && selectedUser && (
          <div className="modal-overlay" onClick={closeUserDetails}>
            <div className="user-details-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>User Details</h2>
                <button className="close-modal" onClick={closeUserDetails}>×</button>
              </div>
              
              <div className="user-details-content">
                <div className="user-avatar-large">
                  <img 
                    src={selectedUser.avatar || '/assets/default-avatar.svg'} 
                    alt={selectedUser.name} 
                  />
                </div>
                
                <div className="user-info-grid">
                  <div className="info-group">
                    <label>Name:</label>
                    <span>{selectedUser.name}</span>
                  </div>
                  
                  <div className="info-group">
                    <label>Email:</label>
                    <span>{selectedUser.email}</span>
                  </div>
                  
                  <div className="info-group">
                    <label>Username:</label>
                    <span>{selectedUser.username || 'N/A'}</span>
                  </div>
                  
                  <div className="info-group">
                    <label>Account Type:</label>
                    <span>{selectedUser.accountType}</span>
                  </div>
                  
                  <div className="info-group">
                    <label>Admin Status:</label>
                    <span className={selectedUser.isAdmin ? 'admin-badge admin' : 'admin-badge user'}>
                      {selectedUser.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </div>
                  
                  <div className="info-group">
                    <label>Joined Date:</label>
                    <span>{new Date(selectedUser.date).toLocaleString()}</span>
                  </div>
                  
                  <div className="info-group">
                    <label>Bio:</label>
                    <span>{selectedUser.bio || 'No bio provided'}</span>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button 
                    className={`action-button ${selectedUser.isAdmin ? 'demote' : 'promote'}`}
                    onClick={() => {
                      toggleUserAdmin(selectedUser._id, selectedUser.isAdmin);
                      closeUserDetails();
                    }}
                  >
                    {selectedUser.isAdmin ? 'Remove Admin Rights' : 'Make Admin'}
                  </button>
                  <button 
                    className="action-button delete"
                    onClick={() => {
                      deleteUser(selectedUser._id);
                      closeUserDetails();
                    }}
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;