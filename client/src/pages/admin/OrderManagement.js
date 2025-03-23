import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Grid,
  MenuItem,
  InputAdornment,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';

// Status colors for chips
const statusColors = {
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  cancelled: 'error',
  refunded: 'default'
};

// Validation status colors
const validationColors = {
  true: 'success',
  false: 'error'
};

// Glassmorphism styles
const glassMorphism = {
  background: 'rgba(255, 255, 255, 0.75)',
  backdropFilter: 'blur(12px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
};

const OrderManagement = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [downloadingData, setDownloadingData] = useState(false);
  const [filters, setFilters] = useState({
    firstName: '',
    lastName: '',
    email: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [validationFilter, setValidationFilter] = useState('');

  // API base URL with fallback
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';
  
  // Log environment variables to help with debugging
  useEffect(() => {
    console.log('Environment variables:', {
      REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'not set'
    });
  }, []);

  // Status options for filter and editing
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' }
  ];

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      queryParams.append('page', page + 1);
      queryParams.append('limit', rowsPerPage);
      
      // Add search term if present (apply to firstName, lastName and email)
      if (searchTerm.trim()) {
        queryParams.append('firstName', searchTerm.trim());
        queryParams.append('lastName', searchTerm.trim());
        queryParams.append('email', searchTerm.trim());
      }
      
      // Add status filter if present
      if (statusFilter) {
        queryParams.append('status', statusFilter);
      }
      
      // Add validation filter - converted to boolean
      if (validationFilter) {
        queryParams.append('validationStatus', validationFilter === 'true');
      }
      
      const url = `${apiBaseUrl}/api/orders?${queryParams.toString()}`;
      console.log('Fetching orders from:', url);
      
      // Use the correct API endpoint
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // Check if response is OK before trying to parse as JSON
      if (!response.ok) {
        const text = await response.text();
        
        // Log the actual response content to help diagnose issues
        console.error('API Error Response:', text);
        console.error('API URL that failed:', url);
        
        // Try to parse as JSON if possible for structured error
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || `Server error: ${response.status}`);
        } catch (jsonError) {
          // If can't parse as JSON, use status text
          throw new Error(`Server error (${response.status}): ${response.statusText}`);
        }
      }
      
      // Only try to parse JSON if we got an OK response
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch orders');
      }
      
      setOrders(data.data || []);
      setTotalOrders(data.totalPages * rowsPerPage || 0);
    } catch (err) {
      console.error('Error fetching orders:', err);
      
      // Special handling for network errors (like CORS issues)
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError(`Network error: Could not connect to the server. This might be a CORS issue or the server is not running. Check that your API URL (${apiBaseUrl}) is correct.`);
      } else {
        setError(err.message || 'Failed to fetch orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, statusFilter, validationFilter, apiBaseUrl, token]);

  // Initial fetch and when filters/pagination change
  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token, fetchOrders]);

  // Fetch orders when search term changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (token && page === 0) {
        fetchOrders();
      } else if (token) {
        setPage(0);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, validationFilter, token, fetchOrders]);

  // Handle pagination changes
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Dialog handlers
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setEditDialogOpen(true);
  };

  const handleDeleteOrder = (order) => {
    setSelectedOrder(order);
    setDeleteDialogOpen(true);
  };

  // Update order status
  const updateOrderStatus = async (newStatus) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/orders/${selectedOrder._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      // Check if response is OK before trying to parse as JSON
      if (!response.ok) {
        const text = await response.text();
        console.error('Update API Error Response:', text);
        console.error('Update API URL that failed:', `${apiBaseUrl}/api/orders/${selectedOrder._id}`);
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || `Server error: ${response.status}`);
        } catch (jsonError) {
          throw new Error(`Server error (${response.status}): ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update order status');
      }
      
      // Close dialog and refresh orders
      setEditDialogOpen(false);
      fetchOrders();
    } catch (err) {
      console.error('Error updating order:', err);
      setError(err.message || 'Failed to update order status');
    }
  };

  // Confirm order deletion
  const confirmDeleteOrder = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/orders/${selectedOrder._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Check if response is OK before trying to parse as JSON
      if (!response.ok) {
        const text = await response.text();
        console.error('Delete API Error Response:', text);
        console.error('Delete API URL that failed:', `${apiBaseUrl}/api/orders/${selectedOrder._id}`);
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || `Server error: ${response.status}`);
        } catch (jsonError) {
          throw new Error(`Server error (${response.status}): ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete order');
      }
      
      // Close dialog and refresh orders
      setDeleteDialogOpen(false);
      fetchOrders();
    } catch (err) {
      console.error('Error deleting order:', err);
      setError(err.message || 'Failed to delete order');
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(0); // Reset to first page when filters change
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      firstName: '',
      lastName: '',
      email: '',
      status: '',
      startDate: '',
      endDate: ''
    });
    setSearchTerm('');
    setStatusFilter('');
    setValidationFilter('');
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to download orders as CSV
  const downloadOrdersAsCSV = async () => {
    setDownloadingData(true);
    setError('');
    try {
      // Prepare query params to include current filters
      const queryParams = new URLSearchParams();
      
      // Add current search and filters (apply search to name/email)
      if (searchTerm.trim()) {
        queryParams.append('firstName', searchTerm.trim());
        queryParams.append('lastName', searchTerm.trim());
        queryParams.append('email', searchTerm.trim());
      }
      
      if (statusFilter) {
        queryParams.append('status', statusFilter);
      }
      
      if (validationFilter) {
        queryParams.append('validationStatus', validationFilter === 'true');
      }
      
      // Request to download all orders matching the current filters - use regular orders endpoint with higher limit
      queryParams.append('limit', 1000); // Get a large batch of orders
      const response = await fetch(`${apiBaseUrl}/api/orders?${queryParams.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // Check if response is OK before trying to parse as JSON
      if (!response.ok) {
        const text = await response.text();
        
        // Log the actual response content to help diagnose issues
        console.error('Download API Error Response:', text);
        console.error('Download API URL that failed:', `${apiBaseUrl}/api/orders?${queryParams.toString()}`);
        
        // Try to parse as JSON if possible for structured error
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || `Server error: ${response.status}`);
        } catch (jsonError) {
          // If can't parse as JSON, use status text
          throw new Error(`Server error (${response.status}): ${response.statusText}`);
        }
      }
      
      // Only try to parse JSON if we got an OK response
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      
      const orders = data.data || [];
      if (orders.length === 0) {
        setError('No orders to download');
        return;
      }

      // Table headers
      const headers = [
        'ID', 
        'Date', 
        'First Name', 
        'Last Name', 
        'Email', 
        'Phone', 
        'Address', 
        'City', 
        'State', 
        'Zip Code', 
        'Product', 
        'Price', 
        'Status',
        'Validation Status',
        'Validation Message',
        'Session ID'
      ];

      // Convert data to rows
      const rows = orders.map(order => [
        order._id,
        new Date(order.orderDate).toLocaleDateString(),
        order.firstName,
        order.lastName,
        order.email || '',
        order.phoneNumber || '',
        order.address1 || '',
        order.city || '',
        order.state || '',
        order.zipCode || '',
        order.productName || '',
        order.price ? `$${order.price}` : '',
        order.status || '',
        order.validationStatus ? 'Valid' : 'Invalid',
        order.validationMessage || '',
        order.sessionId || ''
      ]);

      // Create CSV content with comma delimiter
      try {
        const csvContent = [headers, ...rows].map(row => {
          // Check if row has expected format
          if (!Array.isArray(row) || row.length !== headers.length) {
            console.warn('Row format issue:', row);
            // Fill missing values with empty strings to match header length
            return Array(headers.length).fill('').map((val, idx) => {
              let cell = row && idx < row.length ? (row[idx] === null || row[idx] === undefined ? '' : String(row[idx])) : '';
              // Escape quotes and wrap in quotes if contains commas or quotes
              if (cell.includes('"') || cell.includes(',') || cell.includes('\n')) {
                cell = cell.replace(/"/g, '""');
                return `"${cell}"`;
              }
              return cell;
            }).join(',');
          }
          
          return row.map(cell => {
            cell = cell === null || cell === undefined ? '' : String(cell);
            // Escape quotes and wrap in quotes if contains commas or quotes
            if (cell.includes('"') || cell.includes(',') || cell.includes('\n')) {
              cell = cell.replace(/"/g, '""');
              return `"${cell}"`;
            }
            return cell;
          }).join(',');
        }).join('\n');

        // Create Blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (formatErr) {
        console.error('CSV formatting error:', formatErr);
        setError('Error formatting data for download');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error downloading orders:', err);
    } finally {
      setDownloadingData(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', margin: '0 auto', pt: 3, px: 2 }}>
      <GlassCard maxWidth="100%" sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.3)', 
        p: { xs: 3, sm: 4 },
        m: 0,
        '&::before': {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)',
        }
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' }, 
          mb: 4,
          gap: 2
        }}>
          <Typography variant="h4" gutterBottom sx={{ 
            fontWeight: 700, 
            background: 'linear-gradient(45deg, #7371FC, #9896FF)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            letterSpacing: '0.5px',
            mb: { xs: 1, md: 0 }
          }}>
            Order Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={downloadOrdersAsCSV}
            disabled={downloadingData}
            sx={{
              background: 'linear-gradient(135deg, #5755C8 0%, #7371FC 100%)',
              boxShadow: '0 3px 5px 2px rgba(115, 113, 252, 0.3)',
              borderRadius: '8px',
              padding: '10px 24px',
              height: '44px',
              backdropFilter: 'blur(10px)',
              fontWeight: 500,
              fontSize: '15px',
              '&:hover': {
                boxShadow: '0 6px 10px 2px rgba(115, 113, 252, 0.4)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {downloadingData ? 'Downloading...' : 'Download CSV'}
          </Button>
        </Box>

        {/* Filter Section */}
        <Box 
          sx={{ 
            mb: 4, 
            p: 3, 
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(115, 113, 252, 0.15)',
            boxShadow: '0 4px 20px rgba(115, 113, 252, 0.07)'
          }}
        >
          <Typography variant="subtitle1" sx={{ 
            mb: 2.5, 
            fontWeight: 600,
            color: 'primary.dark',
            pl: 1,
            fontSize: '17px',
            display: 'flex',
            alignItems: 'center',
            '&:after': {
              content: '""',
              display: 'block',
              width: '30px',
              height: '2px',
              background: 'linear-gradient(90deg, rgba(115, 113, 252, 0.7), rgba(115, 113, 252, 0))',
              ml: 1
            }
          }}>
            Filters
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '&:hover fieldset': {
                      borderColor: 'rgba(115, 113, 252, 0.5)',
                    },
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(115, 113, 252, 0.3)'
                  },
                  '& .MuiInputLabel-root': {
                    color: 'primary.dark'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small" sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(115, 113, 252, 0.3)'
                },
                '& .MuiInputLabel-root': {
                  color: 'primary.dark'
                }
              }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small" sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(115, 113, 252, 0.3)'
                },
                '& .MuiInputLabel-root': {
                  color: 'primary.dark'
                }
              }}>
                <InputLabel>Validation</InputLabel>
                <Select
                  value={validationFilter}
                  onChange={(e) => setValidationFilter(e.target.value)}
                  label="Validation"
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Valid</MenuItem>
                  <MenuItem value="false">Invalid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={resetFilters}
                  startIcon={<RefreshIcon />}
                  sx={{ 
                    height: '38px',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    borderColor: 'rgba(115, 113, 252, 0.3)',
                    color: 'primary.dark',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      borderColor: 'rgba(115, 113, 252, 0.5)',
                    }
                  }}
                >
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Action buttons - Remove redundant Download CSV button */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-start', 
          alignItems: 'center', 
          mb: 3, 
          width: '100%' 
        }}>
          <Typography 
            variant="h6" 
            component="h2" 
            sx={{ 
              fontWeight: 600, 
              color: 'primary.dark',
              fontSize: '17px',
              pl: 1,
              display: 'flex',
              alignItems: 'center',
              '&:after': {
                content: '""',
                display: 'block',
                width: '30px',
                height: '2px',
                background: 'linear-gradient(90deg, rgba(115, 113, 252, 0.7), rgba(115, 113, 252, 0))',
                ml: 1
              }
            }}
          >
            Orders
          </Typography>
        </Box>

        {/* Error message */}
        {error && (
          <Typography color="error" sx={{ 
            my: 2, 
            textAlign: 'center', 
            fontWeight: 500,
            backgroundColor: 'rgba(211, 47, 47, 0.05)',
            borderRadius: '8px',
            p: 2,
            border: '1px solid rgba(211, 47, 47, 0.1)'
          }}>
            {error}
          </Typography>
        )}

        {/* Orders table */}
        <Box sx={{ 
          mb: 3, 
          width: '100%', 
          overflow: 'hidden', 
          borderRadius: '12px',
          border: '1px solid rgba(115, 113, 252, 0.15)',
          boxShadow: '0 4px 20px rgba(115, 113, 252, 0.07)'
        }}>
          <Table sx={{ minWidth: 650, width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.6)' }} aria-label="orders table">
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: 'rgba(115, 113, 252, 0.06)',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                height: '64px'
              }}>
                <TableCell sx={{ fontWeight: 600, color: 'primary.dark', padding: '16px 20px', fontSize: '15px' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'primary.dark', padding: '16px 20px', fontSize: '15px' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'primary.dark', padding: '16px 20px', fontSize: '15px' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'primary.dark', padding: '16px 20px', fontSize: '15px' }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'primary.dark', padding: '16px 20px', fontSize: '15px' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'primary.dark', padding: '16px 20px', fontSize: '15px' }}>Validation</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'primary.dark', padding: '16px 20px', fontSize: '15px' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ padding: '60px 16px', fontSize: '15px' }}>Loading...</TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ padding: '60px 16px', fontSize: '15px' }}>No orders found</TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow 
                    key={order._id} 
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'rgba(115, 113, 252, 0.06)',
                        boxShadow: 'inset 0 0 10px rgba(115, 113, 252, 0.1)'
                      },
                      transition: 'all 0.2s ease',
                      borderBottom: '1px solid rgba(115, 113, 252, 0.05)',
                      height: '70px'
                    }}
                  >
                    <TableCell sx={{ color: 'rgba(0, 0, 0, 0.7)', padding: '16px 20px', fontSize: '15px', fontWeight: 500 }}>{order._id.substring(0, 8)}...</TableCell>
                    <TableCell sx={{ color: 'rgba(0, 0, 0, 0.7)', padding: '16px 20px', fontSize: '15px' }}>{formatDate(order.orderDate)}</TableCell>
                    <TableCell sx={{ color: 'rgba(0, 0, 0, 0.7)', padding: '16px 20px', fontSize: '15px', fontWeight: 500 }}>{`${order.firstName} ${order.lastName}`}</TableCell>
                    <TableCell sx={{ color: 'rgba(0, 0, 0, 0.7)', padding: '16px 20px', fontSize: '15px' }}>{order.productName}</TableCell>
                    <TableCell sx={{ padding: '16px 20px' }}>
                      <Chip 
                        label={order.status.charAt(0).toUpperCase() + order.status.slice(1)} 
                        color={statusColors[order.status] || 'default'} 
                        size="small" 
                        sx={{ 
                          backdropFilter: 'blur(5px)',
                          fontWeight: 500,
                          borderRadius: '6px',
                          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                          height: '30px',
                          fontSize: '14px',
                          '& .MuiChip-label': {
                            px: 2
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: '16px 20px' }}>
                      <Chip 
                        label={order.validationStatus ? "Valid" : "Invalid"} 
                        color={validationColors[order.validationStatus ? 'true' : 'false']} 
                        size="small" 
                        title={order.validationMessage}
                        sx={{ 
                          backdropFilter: 'blur(5px)',
                          fontWeight: 500,
                          borderRadius: '6px',
                          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                          height: '30px',
                          fontSize: '14px',
                          '& .MuiChip-label': {
                            px: 2
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: '16px 20px' }}>
                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <IconButton 
                          aria-label="view" 
                          size="small" 
                          onClick={() => handleViewOrder(order)}
                          sx={{ 
                            background: 'rgba(115, 113, 252, 0.1)',
                            backdropFilter: 'blur(5px)',
                            width: '36px',
                            height: '36px',
                            '&:hover': { 
                              background: 'rgba(115, 113, 252, 0.2)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          aria-label="edit" 
                          size="small" 
                          onClick={() => handleEditOrder(order)}
                          sx={{ 
                            background: 'rgba(66, 165, 245, 0.1)',
                            backdropFilter: 'blur(5px)',
                            width: '36px',
                            height: '36px',
                            '&:hover': { 
                              background: 'rgba(66, 165, 245, 0.2)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          aria-label="delete" 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteOrder(order)}
                          sx={{ 
                            background: 'rgba(244, 67, 54, 0.1)',
                            backdropFilter: 'blur(5px)',
                            width: '36px',
                            height: '36px',
                            '&:hover': { 
                              background: 'rgba(244, 67, 54, 0.2)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>

        {/* Pagination */}
        <Box sx={{ width: '100%' }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalOrders}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              p: 1.5,
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '10px',
              border: '1px solid rgba(115, 113, 252, 0.15)',
              '.MuiTablePagination-selectIcon, .MuiTablePagination-select': {
                color: 'inherit'
              },
              '.MuiTablePagination-toolbar': {
                padding: '0 20px',
                minHeight: '60px',
                width: '100%',
                justifyContent: 'space-between'
              },
              '.MuiTablePagination-displayedRows': {
                margin: '0 20px',
                fontSize: '15px',
                fontWeight: 500
              },
              '.MuiTablePagination-select': {
                fontSize: '15px'
              }
            }}
          />
        </Box>

        {/* View Order Dialog */}
        <Dialog 
          open={viewDialogOpen} 
          onClose={() => setViewDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              p: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              pb: 1,
              pt: 1.5,
              fontWeight: 700,
              fontSize: '24px',
              color: 'primary.main',
              textAlign: 'center',
              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
              position: 'relative',
              mb: 2,
              '&:after': {
                content: '""',
                position: 'absolute',
                left: '50%',
                bottom: -1,
                width: '100px',
                height: '3px',
                backgroundColor: 'primary.main',
                transform: 'translateX(-50%)'
              }
            }}
          >
            Order Details
          </DialogTitle>
          <DialogContent dividers sx={{ 
            borderTop: 'none', 
            borderBottom: 'none', 
            py: 3 
          }}>
            {selectedOrder && (
              <>
                {/* First section: Customer and Order information */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        color: 'primary.dark',
                        fontSize: '17px',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        '&:after': {
                          content: '""',
                          display: 'block',
                          width: '30px',
                          height: '2px',
                          background: 'linear-gradient(90deg, rgba(115, 113, 252, 0.7), rgba(115, 113, 252, 0))',
                          ml: 1
                        }
                      }}
                    >
                      Customer Information
                    </Typography>
                    <Box sx={{ 
                      p: 2.5, 
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      borderRadius: '12px',
                      border: '1px solid rgba(115, 113, 252, 0.15)',
                      height: '100%',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 4px 20px rgba(115, 113, 252, 0.07)'
                    }}>
                      <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary', width: '90px' }}>Name:</Box> 
                        <Box component="span" sx={{ fontWeight: 500 }}>{selectedOrder.firstName} {selectedOrder.lastName}</Box>
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary', width: '90px' }}>Address:</Box> 
                        <Box component="span">{selectedOrder.address1}
                          {selectedOrder.address2 && <span><br />{selectedOrder.address2}</span>}
                        </Box>
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary', width: '90px' }}>City/State:</Box> 
                        <Box component="span">{selectedOrder.city}, {selectedOrder.state} {selectedOrder.zipCode}</Box>
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary', width: '90px' }}>Phone:</Box> 
                        <Box component="span">{selectedOrder.phoneNumber}</Box>
                      </Typography>
                      {selectedOrder.email && (
                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary', width: '90px' }}>Email:</Box> 
                          <Box component="span">{selectedOrder.email}</Box>
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        color: 'info.dark',
                        fontSize: '17px',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        '&:after': {
                          content: '""',
                          display: 'block',
                          width: '30px',
                          height: '2px',
                          background: 'linear-gradient(90deg, rgba(66, 165, 245, 0.7), rgba(66, 165, 245, 0))',
                          ml: 1
                        }
                      }}
                    >
                      Order Information
                    </Typography>
                    <Box sx={{ 
                      p: 2.5, 
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      borderRadius: '12px',
                      border: '1px solid rgba(66, 165, 245, 0.15)',
                      height: '100%',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 4px 20px rgba(66, 165, 245, 0.07)'
                    }}>
                      <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary', width: '110px' }}>Order ID:</Box> 
                        <Box component="span" sx={{ wordBreak: 'break-all' }}>{selectedOrder._id}</Box>
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary', width: '110px' }}>Order Date:</Box> 
                        <Box component="span">{formatDate(selectedOrder.orderDate)}</Box>
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary', width: '110px' }}>Status:</Box> 
                        <Chip 
                          label={selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)} 
                          color={statusColors[selectedOrder.status] || 'default'} 
                          size="small" 
                          sx={{ 
                            backdropFilter: 'blur(5px)',
                            fontWeight: 500,
                            height: '28px' 
                          }}
                        />
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary', width: '110px' }}>Source Code:</Box> 
                        <Box component="span">{selectedOrder.sourceCode || 'N/A'}</Box>
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{ fontWeight: 500, color: 'rgba(0, 0, 0, 0.6)', width: '110px' }}>Session ID:</Box> 
                        <Box component="span" sx={{ wordBreak: 'break-all' }}>{selectedOrder.sessionId || 'N/A'}</Box>
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{ fontWeight: 500, color: 'rgba(0, 0, 0, 0.6)', width: '110px' }}>Validation:</Box> 
                        <Chip 
                          label={selectedOrder.validationStatus ? "Valid" : "Invalid"} 
                          color={validationColors[selectedOrder.validationStatus ? 'true' : 'false']} 
                          size="small" 
                          sx={{ 
                            backdropFilter: 'blur(5px)',
                            fontWeight: 500,
                            height: '28px' 
                          }}
                        />
                      </Typography>
                      {selectedOrder.validationMessage && (
                        <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Box component="span" sx={{ fontWeight: 500, color: 'rgba(0, 0, 0, 0.6)', width: '110px' }}>Message:</Box> 
                          <Box component="span">{selectedOrder.validationMessage}</Box>
                        </Typography>
                      )}
                      {selectedOrder.validationDate && (
                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box component="span" sx={{ fontWeight: 500, color: 'rgba(0, 0, 0, 0.6)', width: '110px' }}>Validated On:</Box> 
                          <Box component="span">{formatDate(selectedOrder.validationDate)}</Box>
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>

                {/* Second section: Product and Payment information */}
                <Grid container spacing={3} sx={{ mb: 1, mt: 2 }}>
                  <Grid item xs={12} md={6}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        color: 'secondary.dark',
                        fontSize: '17px',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        '&:after': {
                          content: '""',
                          display: 'block',
                          width: '30px',
                          height: '2px',
                          background: 'linear-gradient(90deg, rgba(47, 150, 131, 0.7), rgba(47, 150, 131, 0))',
                          ml: 1
                        }
                      }}
                    >
                      Product Information
                    </Typography>
                    <Box sx={{ 
                      p: 2.5, 
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      borderRadius: '12px',
                      border: '1px solid rgba(47, 150, 131, 0.15)',
                      height: '100%',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 4px 20px rgba(47, 150, 131, 0.07)'
                    }}>
                      <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary', width: '90px' }}>Product:</Box> 
                        <Box component="span">{selectedOrder.productName || 'N/A'}</Box>
                      </Typography>
                      <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary', width: '90px' }}>SKU:</Box> 
                        <Box component="span">{selectedOrder.sku || 'N/A'}</Box>
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        color: 'error.dark',
                        fontSize: '17px',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        '&:after': {
                          content: '""',
                          display: 'block',
                          width: '30px',
                          height: '2px',
                          background: 'linear-gradient(90deg, rgba(207, 75, 75, 0.7), rgba(207, 75, 75, 0))',
                          ml: 1
                        }
                      }}
                    >
                      Payment Information
                    </Typography>
                    <Box sx={{ 
                      p: 2.5, 
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      borderRadius: '12px',
                      border: '1px solid rgba(207, 75, 75, 0.15)',
                      height: '100%',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 4px 20px rgba(207, 75, 75, 0.07)'
                    }}>
                      <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary', width: '90px' }}>Card:</Box> 
                        <Box component="span">**** **** **** {selectedOrder.creditCardLast4 || 'N/A'}</Box>
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary', width: '90px' }}>Expiration:</Box> 
                        <Box component="span">
                          {selectedOrder.creditCardExpiration ? 
                            `${selectedOrder.creditCardExpiration.substring(0, 2)}/${selectedOrder.creditCardExpiration.substring(2, 4)}` : 
                            'N/A'
                          }
                        </Box>
                      </Typography>
                      {selectedOrder.voiceRecordingId && (
                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary', width: '90px' }}>Recording:</Box> 
                          <Box component="span">{selectedOrder.voiceRecordingId}</Box>
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>

                {/* Third section: Validation Status and Results */}
                {selectedOrder && (selectedOrder.validationStatus || selectedOrder.validationMessage || selectedOrder.validationDate) && (
                  <Grid container spacing={3} sx={{ mb: 1, mt: 2 }}>
                    <Grid item xs={12}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600, 
                          color: 'primary.dark',
                          fontSize: '17px',
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          '&:after': {
                            content: '""',
                            display: 'block',
                            width: '30px',
                            height: '2px',
                            background: 'linear-gradient(90deg, rgba(87, 85, 200, 0.7), rgba(87, 85, 200, 0))',
                            ml: 1
                          }
                        }}
                      >
                        Validation Details
                      </Typography>
                      <Box sx={{ 
                        p: 2.5, 
                        backgroundColor: 'rgba(255, 255, 255, 0.6)',
                        borderRadius: '12px',
                        border: '1px solid rgba(87, 85, 200, 0.15)',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 4px 20px rgba(87, 85, 200, 0.07)'
                      }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary', width: '100px' }}>Status:</Box> 
                              <Chip 
                                label={selectedOrder.validationStatus || 'N/A'} 
                                size="small"
                                sx={{
                                  bgcolor: selectedOrder.validationStatus === 'valid' 
                                    ? 'rgba(47, 150, 131, 0.1)' 
                                    : selectedOrder.validationStatus === 'invalid' 
                                      ? 'rgba(207, 75, 75, 0.1)' 
                                      : 'rgba(87, 85, 200, 0.1)',
                                  color: selectedOrder.validationStatus === 'valid' 
                                    ? 'secondary.dark' 
                                    : selectedOrder.validationStatus === 'invalid' 
                                      ? 'error.dark' 
                                      : 'primary.dark',
                                  fontWeight: 600,
                                  border: '1px solid',
                                  borderColor: selectedOrder.validationStatus === 'valid' 
                                    ? 'rgba(47, 150, 131, 0.3)' 
                                    : selectedOrder.validationStatus === 'invalid' 
                                      ? 'rgba(207, 75, 75, 0.3)' 
                                      : 'rgba(87, 85, 200, 0.3)',
                                }}
                              />
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary', width: '100px' }}>Date:</Box> 
                              <Box component="span">
                                {selectedOrder.validationDate 
                                  ? new Date(selectedOrder.validationDate).toLocaleString()
                                  : 'N/A'
                                }
                              </Box>
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary', width: '100px', mt: 0.5 }}>Message:</Box> 
                              <Box 
                                component="span" 
                                sx={{ 
                                  p: 1.5, 
                                  bgcolor: 'rgba(87, 85, 200, 0.05)',
                                  borderRadius: '8px',
                                  border: '1px dashed rgba(87, 85, 200, 0.2)',
                                  width: 'calc(100% - 120px)',
                                  wordBreak: 'break-word',
                                  fontSize: '0.9rem',
                                  lineHeight: 1.5
                                }}
                              >
                                {selectedOrder.validationMessage || 'No validation message available.'}
                              </Box>
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  </Grid>
                )}

                {/* Fourth section: Technical Details */}
                {selectedOrder && (selectedOrder.sourceCode || selectedOrder.sessionId) && (
                  <Grid container spacing={3} sx={{ mb: 1, mt: 2 }}>
                    <Grid item xs={12}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600, 
                          color: 'text.primary',
                          fontSize: '17px',
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          '&:after': {
                            content: '""',
                            display: 'block',
                            width: '30px',
                            height: '2px',
                            background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0))',
                            ml: 1
                          }
                        }}
                      >
                        Technical Details
                      </Typography>
                      <Box sx={{ 
                        p: 2.5, 
                        backgroundColor: 'rgba(255, 255, 255, 0.6)',
                        borderRadius: '12px',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
                      }}>
                        <Grid container spacing={2}>
                          {selectedOrder.sourceCode && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary', width: '100px' }}>Source:</Box> 
                                <Chip 
                                  label={selectedOrder.sourceCode || 'N/A'} 
                                  size="small"
                                  sx={{
                                    bgcolor: 'rgba(0, 0, 0, 0.03)',
                                    color: 'text.primary',
                                    fontWeight: 500,
                                    border: '1px solid rgba(0, 0, 0, 0.1)',
                                  }}
                                />
                              </Typography>
                            </Grid>
                          )}
                          {selectedOrder.sessionId && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary', width: '100px' }}>Session ID:</Box> 
                                <Box 
                                  component="span" 
                                  sx={{ 
                                    p: 1, 
                                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                                    borderRadius: '4px',
                                    border: '1px solid rgba(0, 0, 0, 0.05)',
                                    fontSize: '0.8rem',
                                    fontFamily: 'monospace',
                                    letterSpacing: '0.5px'
                                  }}
                                >
                                  {selectedOrder.sessionId}
                                </Box>
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            justifyContent: 'center', 
            mt: 2,
            pt: 2,
            borderTop: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <Button 
              onClick={() => setViewDialogOpen(false)} 
              variant="contained"
              sx={{ 
                minWidth: '120px',
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 600,
                py: 1,
                background: 'linear-gradient(135deg, #5755C8 0%, #7371FC 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4744b7 0%, #6260eb 100%)',
                }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Order Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              p: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 1,
            pt: 1.5,
            fontWeight: 700,
            fontSize: '22px',
            color: 'info.main',
            textAlign: 'center',
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            position: 'relative',
            mb: 2,
            '&:after': {
              content: '""',
              position: 'absolute',
              left: '50%',
              bottom: -1,
              width: '80px',
              height: '3px',
              backgroundColor: 'info.main',
              transform: 'translateX(-50%)'
            }
          }}>
            Update Order Status
          </DialogTitle>
          <DialogContent sx={{ pt: 3, pb: 2, px: 2 }}>
            {selectedOrder && (
              <Box sx={{ minWidth: 300, mt: 1 }}>
                <TextField
                  select
                  label="Status"
                  value={selectedOrder.status}
                  onChange={(e) => setSelectedOrder({...selectedOrder, status: e.target.value})}
                  fullWidth
                  margin="normal"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      borderRadius: '8px',
                      border: '1px solid rgba(66, 165, 245, 0.2)'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(66, 165, 245, 0.3)'
                    },
                    '& .MuiInputLabel-root': {
                      color: 'info.dark'
                    }
                  }}
                >
                  {statusOptions.filter(option => option.value).map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            justifyContent: 'center', 
            mt: 2,
            pt: 2,
            borderTop: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <Button 
              onClick={() => setEditDialogOpen(false)}
              variant="outlined"
              sx={{ 
                minWidth: '100px',
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 500,
                mr: 2,
                color: 'text.secondary',
                borderColor: 'rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  borderColor: 'rgba(0, 0, 0, 0.3)'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => updateOrderStatus(selectedOrder.status)} 
              variant="contained" 
              sx={{
                minWidth: '100px',
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 600,
                py: 1,
                background: 'linear-gradient(135deg, #42A5F5 0%, #64B5F6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1E88E5 0%, #42A5F5 100%)',
                }
              }}
            >
              Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              p: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 1,
            pt: 1.5,
            fontWeight: 700,
            fontSize: '22px',
            color: 'error.main',
            textAlign: 'center',
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            position: 'relative',
            mb: 2,
            '&:after': {
              content: '""',
              position: 'absolute',
              left: '50%',
              bottom: -1,
              width: '80px',
              height: '3px',
              backgroundColor: 'error.main',
              transform: 'translateX(-50%)'
            }
          }}>
            Confirm Delete
          </DialogTitle>
          <DialogContent sx={{ pt: 3, pb: 2, px: 3 }}>
            <DialogContentText sx={{ 
              color: 'text.secondary', 
              fontSize: '16px',
              textAlign: 'center',
              mb: 2
            }}>
              Are you sure you want to delete this order? This action cannot be undone.
            </DialogContentText>
            {selectedOrder && (
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'rgba(244, 67, 54, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(244, 67, 54, 0.2)'
              }}>
                <Typography variant="body1" sx={{ fontSize: '14px', mb: 1 }}>
                  <strong>Order ID:</strong> {selectedOrder._id}
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '14px', mb: 1 }}>
                  <strong>Customer:</strong> {selectedOrder.firstName} {selectedOrder.lastName}
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '14px' }}>
                  <strong>Date:</strong> {formatDate(selectedOrder.orderDate)}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            justifyContent: 'center', 
            mt: 2,
            pt: 2,
            borderTop: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <Button 
              onClick={() => setDeleteDialogOpen(false)}
              variant="outlined"
              sx={{ 
                minWidth: '100px',
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 500,
                mr: 2,
                color: 'text.secondary',
                borderColor: 'rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  borderColor: 'rgba(0, 0, 0, 0.3)'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDeleteOrder} 
              variant="contained"
              sx={{ 
                minWidth: '100px',
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 600,
                py: 1,
                background: 'linear-gradient(135deg, #F44336 0%, #E57373 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #D32F2F 0%, #EF5350 100%)',
                }
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </GlassCard>
    </Box>
  );
};

export default OrderManagement; 