import React, { useState, useContext } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Avatar,
  IconButton,
  Alert,
  Container,
  Divider
} from '@mui/material';
import { PhotoCamera, Save, Edit, Cancel } from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              background: 'rgba(26, 32, 44, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            }}
          >
            <Box sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography 
                  variant="h4" 
                  component="h1"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    letterSpacing: '-0.025em',
                  }}
                >
                  Account Information
                </Typography>
                {!isEditing ? (
                  <Button
                    startIcon={<Edit />}
                    onClick={() => setIsEditing(true)}
                    sx={{
                      background: 'rgba(111, 76, 255, 0.2)',
                      color: '#6F4CFF',
                      '&:hover': {
                        background: 'rgba(111, 76, 255, 0.3)',
                      },
                    }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                      sx={{
                        color: '#FF5B5B',
                        '&:hover': {
                          background: 'rgba(255, 91, 91, 0.1)',
                        },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      startIcon={<Save />}
                      onClick={handleSubmit}
                      sx={{
                        background: 'rgba(111, 76, 255, 0.2)',
                        color: '#6F4CFF',
                        '&:hover': {
                          background: 'rgba(111, 76, 255, 0.3)',
                        },
                      }}
                    >
                      Save Changes
                    </Button>
                  </Box>
                )}
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(255, 91, 91, 0.1)', color: '#FF5B5B' }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 3, backgroundColor: 'rgba(56, 229, 177, 0.1)', color: '#38E5B1' }}>
                  {success}
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    background: 'rgba(111, 76, 255, 0.2)',
                    fontSize: '3rem',
                    color: '#6F4CFF',
                    border: '4px solid rgba(111, 76, 255, 0.3)',
                  }}
                >
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                  {user?.name || 'User Name'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {user?.email || 'user@example.com'}
                </Typography>
              </Box>

              <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '56px',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(111, 76, 255, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6F4CFF',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': {
                          color: '#6F4CFF',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '56px',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(111, 76, 255, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6F4CFF',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': {
                          color: '#6F4CFF',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '56px',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(111, 76, 255, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6F4CFF',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': {
                          color: '#6F4CFF',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '56px',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(111, 76, 255, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6F4CFF',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': {
                          color: '#6F4CFF',
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile; 