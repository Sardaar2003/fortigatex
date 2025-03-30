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
import { Add, Edit, Delete } from '@mui/icons-material';
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
      const res = await axios.get('/api/roles');
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
        await axios.delete(`/api/roles/${roleId}`);
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
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(10px)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Role Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            className="glass-button"
            onClick={handleAddClick}
          >
            Add Role
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {deleteError && <Alert severity="error" sx={{ mb: 3 }}>{deleteError}</Alert>}
        {deleteSuccess && <Alert severity="success" sx={{ mb: 3 }}>{deleteSuccess}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ 
            background: 'rgba(255, 255, 255, 0.15)', 
            backdropFilter: 'blur(5px)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Role Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role._id}>
                    <TableCell>
                      <Chip 
                        label={role.name} 
                        size="small"
                        sx={{ 
                          background: role.name === 'admin' 
                            ? 'rgba(25, 118, 210, 0.2)' 
                            : role.name === 'moderator'
                              ? 'rgba(156, 39, 176, 0.2)'
                              : 'rgba(76, 175, 80, 0.2)',
                          color: role.name === 'admin' 
                            ? 'primary.main' 
                            : role.name === 'moderator'
                              ? 'secondary.main'
                              : 'success.main',
                          backdropFilter: 'blur(5px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                      />
                    </TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      {Object.entries(categorizePermissions(role.permissions)).map(([category, perms]) => (
                        <Box key={category} sx={{ mb: 1 }}>
                          <Typography variant="caption" component="div" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                            {category}:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {perms.map((permission, index) => (
                              <Chip
                                key={index}
                                label={permission.split(':')[1]}
                                size="small"
                                sx={{
                                  background: 'rgba(255, 255, 255, 0.15)',
                                  backdropFilter: 'blur(5px)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  fontSize: '0.7rem'
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      ))}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        sx={{ mr: 1 }}
                        onClick={() => handleEditClick(role)}
                      >
                        Edit
                      </Button>
                      {role.name !== 'admin' && role.name !== 'user' && role.name !== 'moderator' && (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleDeleteClick(role._id)}
                        >
                          Delete
                        </Button>
                      )}
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

        {/* Add Role Dialog */}
        <AddRoleDialog 
          open={addDialogOpen}
          handleClose={handleDialogClose}
          onRoleAdded={handleRoleUpdated}
        />

        {/* Edit Role Dialog */}
        <EditRoleDialog 
          open={editDialogOpen}
          handleClose={handleDialogClose}
          role={selectedRole}
          onRoleUpdated={handleRoleUpdated}
        />
      </Paper>
    </Container>
  );
};

export default RoleManagement; 