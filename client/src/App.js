import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Container, CssBaseline, ThemeProvider } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';
import theme from './theme';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import NotFound from './pages/NotFound';
import UserManagement from './pages/admin/UserManagement';
import RoleManagement from './pages/admin/RoleManagement';
import OrderManagement from './pages/admin/OrderManagement';

// Components
import Navigation from './components/Navigation';
import CreateOrder from './pages/CreateOrder';

// Configure axios defaults
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = apiUrl;
console.log('API URL configured as:', apiUrl);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navigation />
          <Container sx={{ mt: 4, mb: 4 }}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              
              {/* Protected routes for all authenticated users */}
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/create-order" element={<PrivateRoute><CreateOrder /></PrivateRoute>} />
              
              {/* Admin-only routes */}
              <Route path="/user-management" element={<AdminRoute><UserManagement /></AdminRoute>} />
              <Route path="/role-management" element={<AdminRoute><RoleManagement /></AdminRoute>} />
              <Route path="/order-management" element={<AdminRoute><OrderManagement /></AdminRoute>} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Container>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 