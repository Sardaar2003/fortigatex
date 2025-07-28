import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import OrderDetailDialog from './OrderDetailDialog';

const OrderManagement = () => {
  const { token } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectType, setProjectType] = useState('all');
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Orders fetched:', response.data);
        setOrders(response.data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token]);

  // Filter orders based on search term and project type
  useEffect(() => {
    let filtered = orders;

    // Filter by project type
    if (projectType !== 'all') {
      filtered = filtered.filter(order => {
        if (!order.project) return false;
        
        // Map filter values to actual project names
        const projectMapping = {
          'radius': 'Radius Project',
          'sempris': 'Sempris Project', 
          'psonline': 'PSOnline Project'
        };
        
        const expectedProject = projectMapping[projectType];
        return order.project === expectedProject;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phoneNumber?.includes(searchTerm) ||
        order._id?.includes(searchTerm)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, projectType]);

  const handleViewOrder = (order) => {
    console.log('View order details:', order);
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`/api/orders/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        // Refresh orders after deletion
        const response = await axios.get('/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setOrders(response.data.data || []);
      } catch (err) {
        console.error('Error deleting order:', err);
        alert('Failed to delete order');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Order Management ({filteredOrders.length} orders)
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="Search Orders"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Project Type</InputLabel>
          <Select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            label="Project Type"
          >
            <MenuItem value="all">All Projects</MenuItem>
            <MenuItem value="radius">Radius Project</MenuItem>
            <MenuItem value="sempris">Sempris Project</MenuItem>
            <MenuItem value="psonline">PSOnline Project</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order._id}</TableCell>
                  <TableCell>{order.project}</TableCell>
                  <TableCell>{`${order.firstName} ${order.lastName}`}</TableCell>
                  <TableCell>{order.email}</TableCell>
                  <TableCell>{order.phoneNumber}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={
                        order.status === 'completed' ? 'success' :
                        order.status === 'pending' ? 'warning' :
                        order.status === 'failed' ? 'error' : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewOrder(order)}
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDeleteOrder(order._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Order Detail Dialog */}
      <OrderDetailDialog
        open={detailDialogOpen}
        handleClose={handleCloseDetailDialog}
        order={selectedOrder}
      />
    </Box>
  );
};

export default OrderManagement; 