import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
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
    if (token) {
      setAuthToken(token);
      
      try {
        const res = await axios.get('/api/auth/me');
        
        setUser(res.data.data);
        setIsAuthenticated(true);
        setLoading(false);
      } catch (err) {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, [token]);

  // Register user
  const register = async (formData) => {
    try {
      const res = await axios.post('/api/auth/register', formData);
      
      // If registration is successful and includes a token, set up authentication
      if (res.data.success && res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        setError(null);
        setAuthToken(res.data.token);
      }
      
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return { success: false };
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
      }
      
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return { success: false };
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthToken(null);
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
      return { success: false };
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    try {
      const res = await axios.put(`/api/auth/reset-password/${token}`, { password });
      
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
      return { success: false };
    }
  };

  // Verify email
  const verifyEmail = async (token) => {
    try {
      const res = await axios.get(`/api/auth/verify-email/${token}`);
      
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify email');
      return { success: false };
    }
  };

  // Clear errors
  const clearError = () => setError(null);

  // Load user on initial render if token exists
  useEffect(() => {
    loadUser();
  }, [loadUser]);

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

export default AuthContext; 