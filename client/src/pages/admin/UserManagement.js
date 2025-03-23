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
  CircularProgress,
  Alert
} from '@mui/material';
import { Person, Edit, Delete } from '@mui/icons-material';
import EditUserDialog from '../../components/EditUserDialog';
import AddUserDialog from '../../components/AddUserDialog';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleAddClick = () => {
    setAddDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditDialogOpen(false);
    setAddDialogOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = () => {
    // Refresh the users list after a successful update
    fetchUsers();
  };

  const handleDeleteClick = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/users/${userId}`);
        setDeleteSuccess('User deleted successfully');
        setTimeout(() => setDeleteSuccess(''), 3000);
        fetchUsers();
      } catch (err) {
        setDeleteError(err.response?.data?.message || 'Failed to delete user');
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
            User Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Person />}
            className="glass-button"
            onClick={handleAddClick}
          >
            Add User
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
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role.name}
                        size="small"
                        sx={{
                          background: user.role.name === 'admin'
                            ? 'rgba(25, 118, 210, 0.2)'
                            : user.role.name === 'moderator'
                              ? 'rgba(156, 39, 176, 0.2)'
                              : 'rgba(76, 175, 80, 0.2)',
                          color: user.role.name === 'admin'
                            ? 'primary.main'
                            : user.role.name === 'moderator'
                              ? 'secondary.main'
                              : 'success.main',
                          backdropFilter: 'blur(5px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isVerified ? 'Verified' : 'Unverified'}
                        size="small"
                        sx={{
                          background: user.isVerified
                            ? 'rgba(76, 175, 80, 0.2)'
                            : 'rgba(211, 47, 47, 0.2)',
                          color: user.isVerified ? 'success.main' : 'error.main',
                          backdropFilter: 'blur(5px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        sx={{ mr: 1 }}
                        onClick={() => handleEditClick(user)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteClick(user._id)}
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

        {/* Edit User Dialog */}
        <EditUserDialog
          open={editDialogOpen}
          handleClose={handleDialogClose}
          user={selectedUser}
          onUserUpdated={handleUserUpdated}
        />

        {/* Add User Dialog */}
        <AddUserDialog
          open={addDialogOpen}
          handleClose={handleDialogClose}
          onUserAdded={handleUserUpdated}
        />
      </Paper>
    </Container>
  );
};

export default UserManagement; 