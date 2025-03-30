import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Admin route component that will only render children for authenticated users with admin role
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Check if user is authenticated and has admin role
  const isAdmin = isAuthenticated && user && user.role && user.role.name === 'admin';

  return isAdmin ? children : <Navigate to="/dashboard" />;
};

export default AdminRoute; 