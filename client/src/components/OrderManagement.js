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
  Alert,
  Pagination,
  Stack
} from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import OrderDetailDialog from './OrderDetailDialog';
import { useNavigate } from 'react-router-dom';
import { Add as AddIcon } from '@mui/icons-material';

const OrderManagement = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [projectType, setProjectType] = useState('all');
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [paginatedOrders, setPaginatedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // You can make this configurable if needed

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders`, {
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
          'frp': 'FRP Project',
          'sc': 'SC Project',
          'hpp': 'HPP Project',
          'mdi': 'MDI Project',
          'mi': 'MI Project',
          'importsale': 'IMPORTSALE Project'
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
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [orders, searchTerm, projectType]);

  // Paginate filtered orders
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filteredOrders.slice(startIndex, endIndex);
    setPaginatedOrders(paginated);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const handleViewOrder = (order) => {
    console.log('View order details:', order);
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedOrder(null);
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleImportSale = () => {
    navigate('/create-order', { state: { project: 'IMPORTSALE Project' } });
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/orders/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        // Refresh orders after deletion
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders`, {
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

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredOrders.length);

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 0 }}>
          Order Management ({filteredOrders.length} orders)
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleImportSale}
        >
          Import Sale
        </Button>
      </Box>

      {filteredOrders.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing {startIndex}-{endIndex} of {filteredOrders.length} orders
        </Typography>
      )}

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
            <MenuItem value="frp">FRP Project</MenuItem>
            <MenuItem value="sc">SC Project</MenuItem>
            <MenuItem value="hpp">HPP Project</MenuItem>
            <MenuItem value="mdi">MDI Project</MenuItem>
            <MenuItem value="mi">MI Project</MenuItem>
            <MenuItem value="importsale">ImportSale Project</MenuItem>
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
                paginatedOrders.map((order) => (
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

      {/* Pagination */}
      {filteredOrders.length > itemsPerPage && (
        <Stack spacing={2} sx={{ mt: 3, alignItems: 'center' }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Stack>
      )}

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