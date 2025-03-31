import React, { useState, useEffect, useContext } from 'react';
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
import { AuthContext } from '../../context/AuthContext';

const UserManagement = () => {
  const { token } = useContext(AuthContext);
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
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setUsers(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

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
    fetchUsers();
  };

  const handleDeleteClick = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/users/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
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
          background: 'rgba(26, 32, 44, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ color: 'white' }}>
            User Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Person />}
            onClick={handleAddClick}
            sx={{
              background: 'linear-gradient(135deg, #6F4CFF 0%, #402AD5 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8266FF 0%, #4F35FF 100%)',
              }
            }}
          >
            Add User
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
                  <TableCell sx={{ color: 'white' }}>Email</TableCell>
                  <TableCell sx={{ color: 'white' }}>Role</TableCell>
                  <TableCell sx={{ color: 'white' }}>Status</TableCell>
                  <TableCell align="right" sx={{ color: 'white' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user._id}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(111, 76, 255, 0.1)',
                        transition: 'background-color 0.2s ease-in-out'
                      }
                    }}
                  >
                    <TableCell sx={{ color: 'white' }}>{user.name}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role.name}
                        size="small"
                        sx={{
                          background: user.role.name === 'admin'
                            ? 'rgba(111, 76, 255, 0.2)'
                            : user.role.name === 'moderator'
                              ? 'rgba(156, 39, 176, 0.2)'
                              : 'rgba(76, 175, 80, 0.2)',
                          color: user.role.name === 'admin'
                            ? '#6F4CFF'
                            : user.role.name === 'moderator'
                              ? '#9C27B0'
                              : '#4CAF50',
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
                          color: user.isVerified ? '#4CAF50' : '#D32F2F',
                          backdropFilter: 'blur(5px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                      />
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
                        onClick={() => handleEditClick(user)}
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