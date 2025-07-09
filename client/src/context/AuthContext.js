import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';

// Create context
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set auth token in header
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Load user
  const loadUser = useCallback(async () => {
    const publicRoutes = ['/login', '/register', '/forgot-password'];
    const isResetPasswordRoute = window.location.pathname.startsWith('/reset-password');
    if (token) {
      setAuthToken(token);

      try {
        const res = await axios.get('/api/auth/me');

        setUser(res.data.data);
        setIsAuthenticated(true);
        setLoading(false);
      } catch (err) {
        // Token expired or invalid
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        // Only redirect to login if we're not on a public route
        if (!publicRoutes.includes(window.location.pathname) && !isResetPasswordRoute) {
          navigate('/login');
        }
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      // Only redirect to login if we're not on a public route
      if (!publicRoutes.includes(window.location.pathname) && !isResetPasswordRoute) {
        navigate('/login');
      }
    }
  }, [token, navigate]);

  // Check token on page load
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Register user
  const register = async (formData) => {
    try {
      const res = await axios.post('/api/auth/register', formData);

      if (res.data.success && res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        setError(null);
        setAuthToken(res.data.token);
        navigate('/dashboard');
      }

      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const res = await axios.post('/api/auth/login', formData);

      if (res.data.success && res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        setError(null);
        setAuthToken(res.data.token);
        navigate('/dashboard');
      }

      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    setAuthToken(null);
    navigate('/login');
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset request failed');
      return { success: false, message: err.response?.data?.message || 'Password reset request failed' };
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    try {
      const res = await axios.put(`/api/auth/reset-password/${token}`, { password });
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
      return { success: false, message: err.response?.data?.message || 'Password reset failed' };
    }
  };

  // Verify email
  const verifyEmail = async (token) => {
    try {
      const res = await axios.get(`/api/auth/verify-email/${token}`);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Email verification failed');
      return { success: false };
    }
  };

  // Clear error
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        verifyEmail,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext }; 