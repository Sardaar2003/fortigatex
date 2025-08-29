import React, { useState, useContext } from 'react';
import { Typography, Box, Button, Divider, List, ListItem, ListItemText, Chip, Grid, Tabs, Tab } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import OrderForm from '../components/OrderForm';
// import { Assignment } from '@mui/icons-material';
import { FolderSpecial } from '@mui/icons-material';
import { AccountCircle as AccountCircleIcon, RadioButtonChecked as RadioIcon, Memory as MemoryIcon, AccountBalance as AccountBalanceIcon } from '@mui/icons-material';

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
  const [selectedProject, setSelectedProject] = useState(null);

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
  };

  const navigateToAdminArea = (route) => {
    navigate(route);
  };

  const handleProjectSelect = (project) => {
    console.log('Project selected:', project);
    setSelectedProject(project);
    console.log('Selected project state updated to:', project);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  const renderProjectSelection = () => {
    return (
      <Box sx={{ mt: 2}}>
        <Typography
          variant="h5"
          sx={{
            background: 'linear-gradient(135deg, #6F4CFF 0%, #402AD5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            filter: 'drop-shadow(0 2px 4px rgba(111, 76, 255, 0.3))',
            mb: 2
          }}
        >
          Select a Project
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <GlassCard
              onClick={() => handleProjectSelect('radius')}
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <RadioIcon sx={{ fontSize: 32, color: '#6F4CFF', mr: 2 }} />
                <Typography variant="h6">FRP API</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Submit orders for XML Format API Call
              </Typography>
            </GlassCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <GlassCard
              onClick={() => handleProjectSelect('sempris')}
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MemoryIcon sx={{ fontSize: 32, color: '#6F4CFF', mr: 2 }} />
                <Typography variant="h6">SC API</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Submit orders for Call Center Online API
              </Typography>
            </GlassCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <GlassCard
              onClick={() => handleProjectSelect('psonline')}
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MemoryIcon sx={{ fontSize: 32, color: '#6F4CFF', mr: 2 }} />
                <Typography variant="h6">MDI API</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Submit orders for MDI products and services
              </Typography>
            </GlassCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <GlassCard
              onClick={() => handleProjectSelect('sublytics')}
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FolderSpecial sx={{ fontSize: 32, color: '#6F4CFF', mr: 2 }} />
                <Typography variant="h6">HPP API</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Submit orders for Global Marketing API
              </Typography>
            </GlassCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <GlassCard
              onClick={() => handleProjectSelect('mi')}
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceIcon sx={{ fontSize: 32, color: '#6F4CFF', mr: 2 }} />
                <Typography variant="h6">MI API</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Submit orders for MI Project services
              </Typography>
            </GlassCard>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderOrderForm = () => {
    console.log('Rendering order form for:', selectedProject);
    if (!selectedProject) {
      console.log('No project selected, rendering project selection');
      return renderProjectSelection();
    }

    console.log('Rendering order form for project:', selectedProject);
    return (
      <Box sx={{ mt: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 4
          }}
        >
          <Typography
            variant="h5"
            sx={{
              background: 'linear-gradient(135deg, #6F4CFF 0%, #402AD5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              filter: 'drop-shadow(0 2px 4px rgba(111, 76, 255, 0.3))',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            {selectedProject === 'radius' ? (
              <>
                <RadioIcon sx={{ fontSize: 32, color: '#6F4CFF' }} />
                FRP API Order Form
              </>
            ) : selectedProject === 'sempris' ? (
              <>
                <MemoryIcon sx={{ fontSize: 32, color: '#6F4CFF' }} />
                SC API Order Form
              </>
            ) : selectedProject === 'psonline' ? (
              <>
                <MemoryIcon sx={{ fontSize: 32, color: '#6F4CFF' }} />
                MDI API Order Form
              </>
            ) : selectedProject === 'sublytics' ? (
              <>
                <FolderSpecial sx={{ fontSize: 32, color: '#6F4CFF' }} />
                HPP API Order Form
              </>
            ) : selectedProject === 'mi' ? (
              <>
                <AccountBalanceIcon sx={{ fontSize: 32, color: '#6F4CFF' }} />
                MI API Order Form
              </>
            ) : null
            // ) : (
            //   <>
            //     <MemoryIcon sx={{ fontSize: 32, color: '#6F4CFF' }} />
            //     PSONLINE Order Form
            //   </>
            // )
            }
          </Typography>
          <Button
            onClick={handleBackToProjects}
            variant="outlined"
            sx={{
              borderColor: 'rgba(111, 76, 255, 0.5)',
              color: '#6F4CFF',
              '&:hover': {
                borderColor: '#6F4CFF',
                backgroundColor: 'rgba(111, 76, 255, 0.1)'
              }
            }}
          >
            Back to Projects
          </Button>
        </Box>

        {/* {selectedProject === 'mi' ? (
  <Box sx={{ height: "80vh" }}>
    <iframe
      src="https://fortigatex.onrender.com/mi-form"   // 🚀 goes to your backend, not external site
      // src="https://localhost:5000/mi-form/PSOnlineAGM/dialer/newSaleNoVerifierOnePACid3r.asp"
              title="MI Project"
      width="100%"
      height="100%"
      style={{ border: "none", borderRadius: "8px" }}
    />
  </Box>
) : ( */}
        <OrderForm project={selectedProject} onOrderSuccess={handleOrderSuccess} />
      {/* )} */}
    </Box>);
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
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                background: 'linear-gradient(135deg, #6F4CFF 0%, #402AD5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                filter: 'drop-shadow(0 2px 4px rgba(111, 76, 255, 0.3))',
                mb: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <AccountCircleIcon sx={{ fontSize: 32, color: '#6F4CFF' }} />
              Account Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(26, 32, 44, 0.95) 0%, rgba(17, 25, 40, 0.95) 100%)',
                    border: '1px solid rgba(111, 76, 255, 0.2)',
                    mb: 3
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: '#A0AEC0',
                      mb: 1,
                      fontWeight: 500
                    }}
                  >
                    Name
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#fff',
                      fontWeight: 600
                    }}
                  >
                    {user?.name}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(26, 32, 44, 0.95) 0%, rgba(17, 25, 40, 0.95) 100%)',
                    border: '1px solid rgba(111, 76, 255, 0.2)',
                    mb: 3
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: '#A0AEC0',
                      mb: 1,
                      fontWeight: 500
                    }}
                  >
                    Email
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#fff',
                      fontWeight: 600
                    }}
                  >
                    {user?.email}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(26, 32, 44, 0.95) 0%, rgba(17, 25, 40, 0.95) 100%)',
                    border: '1px solid rgba(111, 76, 255, 0.2)',
                    mb: 3
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: '#A0AEC0',
                      mb: 1,
                      fontWeight: 500
                    }}
                  >
                    User ID
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#fff',
                      fontWeight: 600,
                      wordBreak: 'break-all'
                    }}
                  >
                    {user?._id}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(26, 32, 44, 0.95) 0%, rgba(17, 25, 40, 0.95) 100%)',
                    border: '1px solid rgba(111, 76, 255, 0.2)',
                    mb: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: '#A0AEC0',
                        mb: 1,
                        fontWeight: 500
                      }}
                    >
                      Verification Status
                    </Typography>
                    <Chip
                      label={user?.isVerified ? "Verified" : "Not Verified"}
                      color={user?.isVerified ? "success" : "error"}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: user?.isVerified
                          ? 'rgba(56, 229, 177, 0.1)'
                          : 'rgba(255, 91, 91, 0.1)',
                        color: user?.isVerified
                          ? '#38E5B1'
                          : '#FF5B5B',
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: '#A0AEC0',
                        mb: 1,
                        fontWeight: 500
                      }}
                    >
                      Role
                    </Typography>
                    <Chip
                      label={user?.role?.name || 'Regular User'}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: isAdmin
                          ? 'rgba(56, 229, 177, 0.1)'
                          : 'rgba(255, 91, 91, 0.1)',
                        color: isAdmin
                          ? '#38E5B1'
                          : '#FF5B5B',
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {renderOrderForm()}
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
                      onClick={() => navigateToAdminArea('/admin/users')}
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
                      color="primary"
                      onClick={() => navigateToAdminArea('/admin/roles')}
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
                      color="primary"
                      onClick={() => navigateToAdminArea('/admin/orders')}
                    >
                      Go to Order Management
                    </Button>
                  </GlassCard>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        )}

        {/* <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button variant="outlined" color="primary" onClick={handleLogout}>
            Logout
          </Button>
        </Box> */}
      </GlassCard>
    </Box>
  );
};

export default Dashboard; 