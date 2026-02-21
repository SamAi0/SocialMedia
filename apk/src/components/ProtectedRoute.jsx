import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('accessToken');
  const userId = localStorage.getItem('userId');

  // If no token or userId, redirect to login
  if (!token || !userId) {
    // Save the attempted location so we can redirect back after login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If token exists, render the protected component
  return children;
};

export default ProtectedRoute;