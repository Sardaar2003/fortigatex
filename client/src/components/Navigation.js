import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import AuthContext from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const Navigation = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const location = useLocation();

  // Only show navigation when the user is authenticated
  if (!isAuthenticated) return null;

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isAdmin = user && user.role && user.role.name === 'admin';

  const handleMenuClose = () => {
    // Implement the logic to close the menu
  };

  return (
    <AppBar position="static" className="glass-navbar">
      <Container>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component={Link} to="/dashboard" sx={{ textDecoration: 'none', color: 'inherit' }}>
            FortiGateX
          </Typography>

          <Box>
            <Button 
              component={Link} 
              to="/dashboard" 
              color="inherit" 
              sx={{ 
                mx: 1,
                fontWeight: isActive('/dashboard') ? 'bold' : 'normal',
                borderBottom: isActive('/dashboard') ? '2px solid' : 'none'
              }}
            >
              Dashboard
            </Button>
            
            <Button 
              component={Link} 
              to="/profile" 
              color="inherit"
              sx={{ 
                mx: 1,
                fontWeight: isActive('/profile') ? 'bold' : 'normal',
                borderBottom: isActive('/profile') ? '2px solid' : 'none'
              }}
            >
              Profile
            </Button>
            
            {isAdmin && (
              <>
                <Button 
                  component={Link} 
                  to="/user-management" 
                  color="inherit"
                  sx={{ 
                    mx: 1,
                    fontWeight: isActive('/user-management') ? 'bold' : 'normal',
                    borderBottom: isActive('/user-management') ? '2px solid' : 'none'
                  }}
                >
                  Users
                </Button>
                
                <Button 
                  component={Link} 
                  to="/role-management" 
                  color="inherit"
                  sx={{ 
                    mx: 1,
                    fontWeight: isActive('/role-management') ? 'bold' : 'normal',
                    borderBottom: isActive('/role-management') ? '2px solid' : 'none'
                  }}
                >
                  Roles
                </Button>

                <Button 
                  component={Link} 
                  to="/order-management" 
                  color="inherit"
                  sx={{ 
                    mx: 1,
                    fontWeight: isActive('/order-management') ? 'bold' : 'normal',
                    borderBottom: isActive('/order-management') ? '2px solid' : 'none'
                  }}
                >
                  Orders
                </Button>
              </>
            )}
            
            <Button 
              color="inherit" 
              onClick={logout}
              sx={{ ml: 2 }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation; 