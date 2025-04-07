import React, { useState, useContext } from 'react';
import { Typography, Box, Button, Grid, Container, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import {
  People as PeopleIcon,
  Security as SecurityIcon,
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const features = [
    {
      title: 'User Management',
      description: 'Create, view, edit, and delete users',
      path: '/admin/users',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      buttonText: 'Manage Users',
      buttonColor: '#6F4CFF',
      status: {
        label: 'Active Users',
        value: '25',
        color: '#6F4CFF',
        bgColor: 'rgba(111, 76, 255, 0.1)'
      }
    },
    {
      title: 'Role Management',
      description: 'Create and manage role-based permissions',
      path: '/admin/roles',
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      buttonText: 'Manage Roles',
      buttonColor: '#FF6B6B',
      status: {
        label: 'Total Roles',
        value: '5',
        color: '#FF6B6B',
        bgColor: 'rgba(255, 107, 107, 0.1)'
      }
    },
    {
      title: 'Order Management',
      description: 'View and manage blockchain orders',
      path: '/admin/orders',
      icon: <ShoppingCartIcon sx={{ fontSize: 40 }} />,
      buttonText: 'Manage Orders',
      buttonColor: '#38E5B1',
      status: {
        label: 'Pending Orders',
        value: '12',
        color: '#38E5B1',
        bgColor: 'rgba(56, 229, 177, 0.1)'
      }
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
      <Grid container spacing={4}>
        {features.map((feature) => (
          <Grid item xs={12} md={4} key={feature.title}>
            <GlassCard
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                p: 4,
                transition: 'all 0.3s ease',
                background: 'linear-gradient(135deg, rgba(26, 32, 44, 0.95) 0%, rgba(17, 25, 40, 0.95) 100%)',
                borderColor: `${feature.buttonColor}33`,
                '&:hover': {
                  transform: 'translateY(-8px)',
                  borderColor: feature.buttonColor,
                  boxShadow: `0 8px 24px ${feature.buttonColor}1a`
                }
              }}
            >
              <Box 
                sx={{ 
                  mb: 4,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${feature.buttonColor}22 0%, ${feature.buttonColor}11 100%)`,
                    border: `1px solid ${feature.buttonColor}33`,
                  }}
                >
                  {React.cloneElement(feature.icon, {
                    sx: { fontSize: 32, color: feature.buttonColor }
                  })}
                </Box>
                <Chip
                  label={`${feature.status.label}: ${feature.status.value}`}
                  sx={{
                    backgroundColor: feature.status.bgColor,
                    color: feature.status.color,
                    fontWeight: 600,
                    height: 32,
                    '& .MuiChip-label': {
                      px: 2
                    }
                  }}
                />
              </Box>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{
                  background: `linear-gradient(135deg, ${feature.buttonColor} 0%, ${feature.buttonColor}99 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                  letterSpacing: '-0.025em',
                  mb: 2
                }}
              >
                {feature.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#A0AEC0',
                  mb: 4,
                  flexGrow: 1,
                  lineHeight: 1.6
                }}
              >
                {feature.description}
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  alignItems: 'center', 
                  mb: 4,
                  p: 2,
                  borderRadius: 2,
                  background: 'rgba(17, 25, 40, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  flex: 1
                }}>
                  <CheckCircleIcon sx={{ color: '#38E5B1', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#38E5B1', fontWeight: 500 }}>
                    Active
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  flex: 1
                }}>
                  <CancelIcon sx={{ color: '#FF5B5B', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#FF5B5B', fontWeight: 500 }}>
                    {feature.title === 'User Management' ? '2 Issues' : 
                     feature.title === 'Role Management' ? '1 Conflict' : 
                     'No Issues'}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate(feature.path)}
                sx={{
                  background: `linear-gradient(135deg, ${feature.buttonColor} 0%, ${feature.buttonColor}dd 100%)`,
                  color: 'white',
                  py: 1.5,
                  px: 3,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${feature.buttonColor}dd 0%, ${feature.buttonColor} 100%)`,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${feature.buttonColor}66`
                  },
                }}
              >
                {feature.buttonText}
              </Button>
            </GlassCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard; 