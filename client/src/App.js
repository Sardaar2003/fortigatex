import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import theme from './theme';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import OrderManagement from './pages/admin/OrderManagement';
import RoleManagement from './pages/admin/RoleManagement';
import UserManagement from './pages/admin/UserManagement';
import GroupManagement from './pages/admin/GroupManagement';
import MyGroup from './pages/MyGroup';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import SubProjectOrderForm from './components/forms/SubProjectOrderForm';
import MIOrderForm from './components/forms/MIOrderForm';
import CreateOrder from './pages/orders/CreateOrder';

const BackgroundGradient = () => (
  <>
    <Box
      sx={{
        position: 'fixed',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle at center, rgba(111, 76, 255, 0.15) 0%, rgba(64, 42, 213, 0.1) 25%, rgba(155, 107, 254, 0.05) 50%, transparent 70%)',
        transform: 'rotate(-12deg)',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(17, 25, 40, 0.95) 0%, rgba(26, 32, 44, 0.95) 100%)',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
    <Box
      sx={{
        position: 'fixed',
        top: '10%',
        right: '-15%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(111, 76, 255, 0.3) 0%, rgba(111, 76, 255, 0) 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 8s ease-in-out infinite',
        zIndex: 0,
        pointerEvents: 'none',
        '@keyframes float': {
          '0%, 100%': {
            transform: 'translateY(0) scale(1)',
          },
          '50%': {
            transform: 'translateY(-40px) scale(1.05)',
          },
        },
      }}
    />
    <Box
      sx={{
        position: 'fixed',
        bottom: '10%',
        left: '-5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(155, 107, 254, 0.3) 0%, rgba(155, 107, 254, 0) 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float2 12s ease-in-out infinite',
        zIndex: 0,
        pointerEvents: 'none',
        '@keyframes float2': {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
          },
          '50%': {
            transform: 'translate(40px, -20px) scale(1.1)',
          },
        },
      }}
    />
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(64, 42, 213, 0.2) 0%, rgba(64, 42, 213, 0) 70%)',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'pulse 15s ease-in-out infinite',
        zIndex: 0,
        pointerEvents: 'none',
        '@keyframes pulse': {
          '0%, 100%': {
            transform: 'translate(-50%, -50%) scale(1)',
            opacity: 0.5,
          },
          '50%': {
            transform: 'translate(-50%, -50%) scale(1.2)',
            opacity: 0.8,
          },
        },
      }}
    />
  </>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Box
            sx={{
              minHeight: '100vh',
              position: 'relative',
              background: 'linear-gradient(135deg, #0B1121 0%, #151C2C 50%, #1A202C 100%)',
              backgroundAttachment: 'fixed',
              '&::before': {
                content: '""',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backdropFilter: 'blur(100px)',
                zIndex: -1,
              },
            }}
          >
            <BackgroundGradient />
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Navigation />
              <Box
                component="main"
                sx={{
                  position: 'relative',
                  zIndex: 2,
                  pt: 8,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />

                  {/* Protected Routes */}
                  <Route path="/" element={
                    <PrivateRoute>
                      <Box sx={{ p: 3 }}>
                        <Dashboard />
                      </Box>
                    </PrivateRoute>
                  } />
                  <Route path="/profile" element={
                    <PrivateRoute>
                      <Box sx={{ p: 3 }}>
                        <Profile />
                      </Box>
                    </PrivateRoute>
                  } />
                  <Route path="/admin/orders" element={
                    <PrivateRoute>
                      <Box sx={{ p: 3 }}>
                        <OrderManagement />
                      </Box>
                    </PrivateRoute>
                  } />
                  <Route path="/admin/roles" element={
                    <PrivateRoute>
                      <Box sx={{ p: 3 }}>
                        <RoleManagement />
                      </Box>
                    </PrivateRoute>
                  } />
                  <Route path="/admin/users" element={
                    <PrivateRoute>
                      <Box sx={{ p: 3 }}>
                        <UserManagement />
                      </Box>
                    </PrivateRoute>
                  } />
                  <Route path="/admin/groups" element={
                    <PrivateRoute>
                      <Box sx={{ p: 3 }}>
                        <GroupManagement />
                      </Box>
                    </PrivateRoute>
                  } />
                  <Route path="/my-group" element={
                    <PrivateRoute>
                      <Box sx={{ p: 3 }}>
                        <MyGroup />
                      </Box>
                    </PrivateRoute>
                  } />
                  <Route path="/orders/mi" element={
                    <PrivateRoute>
                      <Box sx={{ p: 3 }}>
                        <MIOrderForm />
                      </Box>
                    </PrivateRoute>
                  } />
                  <Route path="/create-order" element={
                    <PrivateRoute>
                      <Box sx={{ p: 3 }}>
                        <CreateOrder />
                      </Box>
                    </PrivateRoute>
                  } />
                  {/* <Route path="/orders/subproject" element={<SubProjectOrderForm />} /> */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Box>
            </Box>
          </Box>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App; 