import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { Add, Edit, Delete, Security } from '@mui/icons-material';
import AddRoleDialog from '../../components/AddRoleDialog';
import EditRoleDialog from '../../components/EditRoleDialog';

// Group permissions by category
const categorizePermissions = (permissions) => {
  const categories = {
    'Read': [],
    'Create': [],
    'Update': [],
    'Delete': [],
    'Admin': [],
    'Other': []
  };

  permissions.forEach(permission => {
    const prefix = permission.split(':')[0];
    const category = prefix.charAt(0).toUpperCase() + prefix.slice(1);

    if (categories[category] !== undefined) {
      categories[category].push(permission);
    } else {
      categories['Other'].push(permission);
    }
  });

  // Filter out empty categories
  return Object.entries(categories)
    .filter(([_, perms]) => perms.length > 0)
    .reduce((obj, [key, val]) => {
      obj[key] = val;
      return obj;
    }, {});
};

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/roles`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setRoles(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch roles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAddClick = () => {
    setAddDialogOpen(true);
  };

  const handleEditClick = (role) => {
    setSelectedRole(role);
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setAddDialogOpen(false);
    setEditDialogOpen(false);
    setSelectedRole(null);
  };

  const handleRoleUpdated = () => {
    // Refresh the roles list after a successful update
    fetchRoles();
  };

  const handleDeleteClick = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/roles/${roleId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setDeleteSuccess('Role deleted successfully');
        setTimeout(() => setDeleteSuccess(''), 3000);
        fetchRoles();
      } catch (err) {
        setDeleteError(err.response?.data?.message || 'Failed to delete role');
        setTimeout(() => setDeleteError(''), 5000);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        sx={{
          p: 3,
          background: 'rgba(26, 32, 44, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ color: 'white' }}>
            Role Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Security />}
            onClick={handleAddClick}
            sx={{
              background: 'linear-gradient(135deg, #6F4CFF 0%, #402AD5 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8266FF 0%, #4F35FF 100%)',
              }
            }}
          >
            Add Role
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {deleteError && <Alert severity="error" sx={{ mb: 3 }}>{deleteError}</Alert>}
        {deleteSuccess && <Alert severity="success" sx={{ mb: 3 }}>{deleteSuccess}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress sx={{ color: '#6F4CFF' }} />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{
            background: 'rgba(26, 32, 44, 0.95)',
            backdropFilter: 'blur(5px)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'white' }}>Name</TableCell>
                  <TableCell sx={{ color: 'white' }}>Description</TableCell>
                  <TableCell sx={{ color: 'white' }}>Permissions</TableCell>
                  <TableCell align="right" sx={{ color: 'white' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow
                    key={role._id}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(111, 76, 255, 0.1)',
                        transition: 'background-color 0.2s ease-in-out'
                      }
                    }}
                  >
                    <TableCell sx={{ color: 'white' }}>{role.name}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{role.description}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {role.permissions.map((permission) => (
                          <Chip
                            key={permission}
                            label={permission}
                            size="small"
                            sx={{
                              background: 'rgba(111, 76, 255, 0.2)',
                              color: '#6F4CFF',
                              backdropFilter: 'blur(5px)',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        sx={{
                          mr: 1,
                          color: '#6F4CFF',
                          '&:hover': {
                            backgroundColor: 'rgba(111, 76, 255, 0.1)',
                            color: '#8266FF'
                          }
                        }}
                        onClick={() => handleEditClick(role)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(211, 47, 47, 0.1)'
                          }
                        }}
                        onClick={() => handleDeleteClick(role._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Available Permissions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="primary" gutterBottom>Read Permissions</Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="read:own"
                    secondary="User can read their own data"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="read:any"
                    secondary="User can read any data in the system"
                  />
                </ListItem>
              </List>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="primary" gutterBottom>Create Permissions</Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="create:own"
                    secondary="User can create their own resources"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="create:any"
                    secondary="User can create resources for anyone"
                  />
                </ListItem>
              </List>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="primary" gutterBottom>Update Permissions</Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="update:own"
                    secondary="User can update their own data"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="update:any"
                    secondary="User can update any data in the system"
                  />
                </ListItem>
              </List>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="primary" gutterBottom>Delete Permissions</Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="delete:own"
                    secondary="User can delete their own data"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="delete:any"
                    secondary="User can delete any data in the system"
                  />
                </ListItem>
              </List>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="primary" gutterBottom>Admin Permissions</Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="admin:access"
                    secondary="User can access admin features"
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Box>

        {/* Edit Role Dialog */}
        <EditRoleDialog
          open={editDialogOpen}
          handleClose={handleDialogClose}
          role={selectedRole}
          onRoleUpdated={handleRoleUpdated}
        />

        {/* Add Role Dialog */}
        <AddRoleDialog
          open={addDialogOpen}
          handleClose={handleDialogClose}
          onRoleAdded={handleRoleUpdated}
        />
      </Paper>
    </Container>
  );
};

export default RoleManagement; 