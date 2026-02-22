import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfilePage from './pages/ProfilePage';
import PostPage from './pages/PostPage';
import CreatePostPage from './pages/CreatePost';
import SearchPage from './pages/SearchPage';
import SavedPosts from './pages/SavedPosts';
import NotificationsPage from './pages/NotificationsPage';
import EnhancedNotificationsPage from './pages/EnhancedNotificationsPage';
import FollowsPage from './pages/FollowsPage';
import MessagingPage from './pages/MessagingPage';
import EnhancedMessaging from './components/EnhancedMessaging';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminContentModeration from './pages/AdminContentModeration';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { NotificationProvider } from './context/NotificationContext';
import PopupNotifications from './components/PopupNotifications';
import './App.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import '../node_modules/bootstrap/dist/js/bootstrap.min.js'

function App() {
  const userId = localStorage.getItem('userId');
  
  return (
    <NotificationProvider userId={userId}>
      <Router 
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <PopupNotifications />
      
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <div className="app-container">
                    <Home />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile/:userId" 
              element={
                <ProtectedRoute>
                  <div className="app-container">
                    <ProfilePage />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/post/:postId" 
              element={
                <ProtectedRoute>
                  <div className="app-container">
                    <PostPage />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create" 
              element={
                <ProtectedRoute>
                  <div className="app-container">
                    <CreatePostPage />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/search" 
              element={
                <ProtectedRoute>
                  <div className="app-container">
                    <SearchPage />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/saved" 
              element={
                <ProtectedRoute>
                  <div className="app-container">
                    <SavedPosts />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <EnhancedNotificationsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/follows" 
              element={
                <ProtectedRoute>
                  <div className="app-container">
                    <FollowsPage />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <EnhancedMessaging />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <AdminRoute>
                  <AdminUserManagement />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/content" 
              element={
                <AdminRoute>
                  <AdminContentModeration />
                </AdminRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;