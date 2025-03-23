import React, { useState, useContext } from 'react';
import { Typography, Box, Button, Divider, List, ListItem, ListItemText, Chip, Grid, Tabs, Tab, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import OrderForm from '../components/OrderForm';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  
  // Check if user is admin
  const isAdmin = user?.role?.name === 'admin';

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOrderSuccess = (orderData) => {
    console.log('Order submitted successfully:', orderData);
    // You could save this to local storage, display a toast notification, etc.
  };

  const navigateToAdminArea = (route) => {
    navigate(route);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1000px', margin: '0 auto', pt: 4, px: 2 }}>
      <GlassCard maxWidth="100%">
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.name || 'User'}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          You are logged in as: <Chip 
            label={user?.role?.name || 'User'} 
            color={isAdmin ? 'error' : 'primary'} 
            size="small" 
            sx={{ ml: 1, fontWeight: 500 }} 
          />
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
            <Tab label="Account Info" />
            <Tab label="Order Management" />
            {isAdmin && <Tab label="Admin Controls" />}
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem>
                <ListItemText primary="Name" secondary={user?.name} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Email" secondary={user?.email} />
              </ListItem>
              <ListItem>
                <ListItemText primary="User ID" secondary={user?._id} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Verification Status" 
                  secondary={
                    user?.isVerified 
                      ? <Chip label="Verified" color="success" size="small" />
                      : <Chip label="Not Verified" color="error" size="small" />
                  } />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Role" 
                  secondary={
                    <Chip 
                      label={user?.role?.name || 'Regular User'} 
                      color={isAdmin ? 'error' : 'primary'} 
                      size="small" 
                    />
                  } 
                />
              </ListItem>
            </List>

            {isAdmin && (
              <>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    mt: 3, 
                    mb: 1, 
                    fontWeight: 600, 
                    color: 'primary.main',
                    fontSize: '18px',
                    paddingBottom: '8px',
                    borderBottom: '2px solid rgba(115, 113, 252, 0.3)',
                    display: 'inline-block'
                  }}
                >
                  Admin Permissions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 3 }}>
                  <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                    As an administrator, you have access to these management features:
                  </Alert>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ 
                        borderRadius: 3, 
                        p: 2.5,
                        backgroundColor: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 20px rgba(115, 113, 252, 0.1)',
                        border: '1px solid rgba(115, 113, 252, 0.2)',
                        height: '100%',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 12px 24px rgba(115, 113, 252, 0.15)',
                          transform: 'translateY(-4px)',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        }
                      }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight={600} color="primary.dark">
                          User Management
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Create, view, edit, and delete users
                        </Typography>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          color="primary"
                          onClick={() => navigateToAdminArea('/user-management')}
                          sx={{ mt: 1 }}
                        >
                          Manage Users
                        </Button>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ 
                        borderRadius: 3, 
                        p: 2.5,
                        backgroundColor: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 20px rgba(73, 190, 170, 0.1)',
                        border: '1px solid rgba(73, 190, 170, 0.2)',
                        height: '100%',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 12px 24px rgba(73, 190, 170, 0.15)',
                          transform: 'translateY(-4px)',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        }
                      }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight={600} color="secondary.dark">
                          Role Management
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Create and manage user roles and permissions
                        </Typography>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          color="secondary"
                          onClick={() => navigateToAdminArea('/role-management')}
                          sx={{ mt: 1 }}
                        >
                          Manage Roles
                        </Button>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ 
                        borderRadius: 3, 
                        p: 2.5,
                        backgroundColor: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 20px rgba(100, 181, 246, 0.1)',
                        border: '1px solid rgba(100, 181, 246, 0.2)',
                        height: '100%',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 12px 24px rgba(100, 181, 246, 0.15)',
                          transform: 'translateY(-4px)',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        }
                      }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight={600} color="info.dark">
                          Order Management
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          View, update, and delete customer orders
                        </Typography>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          color="info"
                          onClick={() => navigateToAdminArea('/order-management')}
                          sx={{ mt: 1 }}
                        >
                          Manage Orders
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <OrderForm onOrderSuccess={handleOrderSuccess} />
        </TabPanel>

        {isAdmin && (
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ mt: 2 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 600, 
                  color: 'primary.main',
                  fontSize: '18px',
                  paddingBottom: '8px',
                  borderBottom: '2px solid rgba(115, 113, 252, 0.3)',
                  display: 'inline-block'
                }}
              >
                Admin Control Panel
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <GlassCard title="User Management">
                    <Typography variant="body2" paragraph>
                      Manage user accounts, permissions, and authentication.
                    </Typography>
                    <Button 
                      variant="contained" 
                      fullWidth
                      color="primary"
                      onClick={() => navigateToAdminArea('/user-management')}
                    >
                      Go to User Management
                    </Button>
                  </GlassCard>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <GlassCard title="Role Management">
                    <Typography variant="body2" paragraph>
                      Create and manage roles and associated permissions.
                    </Typography>
                    <Button 
                      variant="contained" 
                      fullWidth
                      color="secondary"
                      onClick={() => navigateToAdminArea('/role-management')}
                    >
                      Go to Role Management
                    </Button>
                  </GlassCard>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <GlassCard title="Order Management">
                    <Typography variant="body2" paragraph>
                      View and manage all customer orders and transactions.
                    </Typography>
                    <Button 
                      variant="contained" 
                      fullWidth
                      color="info"
                      onClick={() => navigateToAdminArea('/order-management')}
                    >
                      Go to Order Management
                    </Button>
                  </GlassCard>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        )}

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button variant="outlined" color="primary" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </GlassCard>
    </Box>
  );
};

export default Dashboard; 