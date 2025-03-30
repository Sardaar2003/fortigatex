import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Check if user is authenticated and has admin role
  if (isAuthenticated && user && user.role && user.role.name === 'admin') {
    return children;
  }

  // Redirect to dashboard if logged in but not admin
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  // Redirect to login if not authenticated
  return <Navigate to="/login" />;
};

export default AdminRoute; 