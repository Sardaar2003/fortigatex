import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  TableContainer,
  Chip,
  CircularProgress,
  Container,
  Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Search,
  FilterList
} from '@mui/icons-material';
import EditOrderDialog from '../../components/EditOrderDialog';
import { format } from 'date-fns';

const OrderManagement = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    validation: '',
    project: 'all'
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  const projects = ['all', 'FRP Project', 'SC Project', 'HPP Project', 'MDI Project'];

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Fetched orders with user data:', response.data.data[0]); // Debug log
      setOrders(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setEditForm(order);
    setOpenDialog(true);
  };

  const handleDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setDeleteSuccess('Order deleted successfully');
        setTimeout(() => setDeleteSuccess(''), 3000);
        fetchOrders();
      } catch (err) {
        setDeleteError(err.response?.data?.message || 'Failed to delete order');
        setTimeout(() => setDeleteError(''), 5000);
      }
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
    setEditForm({});
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/orders/${selectedOrder._id}`, editForm, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      handleDialogClose();
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Reset to first page when filters change
    setPage(0);
  };

  const handleReset = () => {
    setFilters({
      search: '',
      status: '',
      validation: '',
      project: 'all'
    });
    // Reset to first page when resetting filters
    setPage(0);
  };

  const getStatusColor = (status) => {
    if (!status) return {
      color: '#6B7280',
      bg: '#F3F4F6'
    };

    switch (status.toLowerCase()) {
      case 'pending':
        return {
          color: '#F59E0B',
          bg: '#FEF3C7'
        };
      case 'cancelled':
        return {
          color: '#EF4444',
          bg: '#FEE2E2'
        };
      default:
        return {
          color: '#10B981',
          bg: '#D1FAE5'
        };
    }
  };

  const getValidationColor = (validation) => {
    if (validation === undefined || validation === null) return {
      color: '#6B7280',
      bg: '#F3F4F6'
    };

    if (typeof validation === 'boolean') {
      return validation ? {
        color: '#10B981',
        bg: '#D1FAE5'
      } : {
        color: '#EF4444',
        bg: '#FEE2E2'
      };
    }

    switch (validation.toLowerCase()) {
      case 'invalid':
      case 'false':
        return {
          color: '#EF4444',
          bg: '#FEE2E2'
        };
      case 'valid':
      case 'true':
        return {
          color: '#10B981',
          bg: '#D1FAE5'
        };
      default:
        return {
          color: '#F59E0B',
          bg: '#FEF3C7'
        };
    }
  };

  const getValidationText = (validation) => {
    if (validation === undefined || validation === null) return 'Pending';
    if (typeof validation === 'boolean') return validation ? 'Valid' : 'Invalid';
    return validation;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === '' || order.status === filters.status;
    const matchesValidation = filters.validation === '' || getValidationText(order.validationStatus) === filters.validation;
    const matchesProject = filters.project === 'all' || order.project === filters.project;
    return matchesSearch && matchesStatus && matchesValidation && matchesProject;
  });

  const handlePreview = (order) => {
    setSelectedOrder(order);
    setPreviewDialogOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleFixProjectNames = async () => {
    if (window.confirm('This will update project names in the database:\n• Sempris Project → SC Project\n• Radius Project → FRP Project\n• PSOnline Project → MDI Project\n\nAre you sure you want to proceed?')) {
      try {
        setLoading(true);
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/fix-project-names`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          const { updates, totalUpdated } = response.data.data;
          let message = `✅ Successfully updated ${totalUpdated} orders:\n\n`;
          updates.forEach(update => {
            if (update.count > 0) {
              message += `• ${update.from} → ${update.to}: ${update.count} orders\n`;
            }
          });
          
          alert(message);
          
          // Refresh the orders to show updated data
          await fetchOrders();
        }
      } catch (err) {
        console.error('Error fixing project names:', err);
        alert('Failed to fix project names: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDownloadCSV = () => {
  // Define headers in fixed order
  const headers = [
    'Order ID', 'Order Date', 'First Name', 'Last Name', 'Email',
    'Phone Number', 'Secondary Phone Number', 'Address Line 1', 'Address Line 2',
    'City', 'State', 'Zip Code', 'Source Code', 'SKU', 'Product Name',
    'Session ID', 'Status', 'SubLytics Order ID', 'Credit Card Number',
    'Credit Card Expiration', 'Credit Card Last 4', 'Credit Card CVV', 'Card Issuer',
    'Voice Recording ID', 'Customer ID', 'User ID', 'User Name', 'User Email',
    'Validation Status', 'Validation Message', 'Validation Response', 'Validation Date',
    'Project', 'Vendor ID', 'Client Order Number', 'Client Data', 'Pitch ID',
    'Transaction ID', 'OrderID', 'Transaction Date', 'Created At', 'Updated At'
  ];

  // Utility to sanitize values
  const sanitize = (value, options = {}) => {
    if (value === undefined || value === null || value === '') return 'Not Available';
    let str = String(value).trim();

    // Truncate if maxlength specified
    if (options.max && str.length > options.max) {
      str = str.substring(0, options.max);
    }

    // Escape quotes by doubling them for CSV
    str = str.replace(/"/g, '""');
    return str;
  };

  // Build rows
  const rows = orders.map(order => [
    sanitize(order._id),
    sanitize(order.orderDate),
    sanitize(order.firstName, { max: 30 }),
    sanitize(order.lastName, { max: 30 }),
    sanitize(order.email),
    sanitize(order.phoneNumber),
    sanitize(order.secondaryPhoneNumber),
    sanitize(order.address1, { max: 50 }),
    sanitize(order.address2, { max: 50 }),
    sanitize(order.city, { max: 30 }),
    sanitize(order.state),
    sanitize(order.zipCode),
    sanitize(order.sourceCode, { max: 6 }),
    sanitize(order.sku, { max: 7 }),
    sanitize(order.productName),
    sanitize(order.sessionId, { max: 36 }),
    sanitize(order.status),
    sanitize(order.sublyticssOrderId),
    sanitize(order.creditCardNumber),
    sanitize(order.creditCardExpiration),
    sanitize(order.creditCardLast4, { max: 4 }),
    sanitize(order.creditCardCVV),
    sanitize(order.cardIssuer),
    sanitize(order.voiceRecordingId),
    sanitize(order.customerId),
    sanitize(order.user?._id),
    sanitize(order.user?.name),
    sanitize(order.user?.email),
    sanitize(order.validationStatus),
    sanitize(order.validationMessage),
    sanitize(order.validationResponse ? JSON.stringify(order.validationResponse) : null),
    order.validationDate ? format(new Date(order.validationDate), 'yyyy-MM-dd HH:mm:ss') : 'Not Available',
    sanitize(order.project),
    sanitize(order.vendorId, { max: 4 }),
    sanitize(order.clientOrderNumber, { max: 10 }),
    sanitize(order.clientData, { max: 64 }),
    sanitize(order.pitchId, { max: 11 }),
    sanitize(order.transactionId),
    sanitize(order.OrderID),
    order.transactionDate ? format(new Date(order.transactionDate), 'yyyy-MM-dd HH:mm:ss') : 'Not Available',
    order.createdAt ? format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm:ss') : 'Not Available',
    order.updatedAt ? format(new Date(order.updatedAt), 'yyyy-MM-dd HH:mm:ss') : 'Not Available'
  ]);

  // Join into CSV
  const csvContent = [
    headers.join(','), // header row
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')) // escape commas
  ].join('\n');

  // Trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `complete_orders_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

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
            Order Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              startIcon={<RefreshIcon />}
              onClick={handleFixProjectNames}
              sx={{
                background: 'rgba(255, 152, 0, 0.2)',
                color: '#FF9800',
                '&:hover': {
                  background: 'rgba(255, 152, 0, 0.3)',
                },
              }}
            >
              Fix Project Names
            </Button>
            <Button
              startIcon={<DownloadIcon />}
              onClick={handleDownloadCSV}
              sx={{
                background: 'rgba(111, 76, 255, 0.2)',
                color: '#6F4CFF',
                '&:hover': {
                  background: 'rgba(111, 76, 255, 0.3)',
                },
              }}
            >
              Download CSV
            </Button>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search orders..."
              value={filters.search}
              onChange={handleFilterChange('search')}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />,
                sx: {
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#6F4CFF',
                  },
                  '& input': {
                    color: 'white',
                  },
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={handleFilterChange('status')}
                label="Status"
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#6F4CFF',
                  },
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Validation</InputLabel>
              <Select
                value={filters.validation}
                onChange={handleFilterChange('validation')}
                label="Validation"
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#6F4CFF',
                  },
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="valid">Valid</MenuItem>
                <MenuItem value="invalid">Invalid</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Project</InputLabel>
              <Select
                value={filters.project}
                onChange={handleFilterChange('project')}
                label="Project"
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#6F4CFF',
                  },
                }}
              >
                <MenuItem value="all">All Projects</MenuItem>
                <MenuItem value="FRP Project">FRP Project</MenuItem>
                <MenuItem value="SC Project">SC Project</MenuItem>
                <MenuItem value="HPP Project">HPP Project</MenuItem>
                <MenuItem value="MDI Project">MDI Project</MenuItem>
                <MenuItem value="MI Project">MI Project</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Button
          startIcon={<RefreshIcon />}
          onClick={handleReset}
          sx={{
            mb: 3,
            color: 'white',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          Refresh
        </Button>

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
                  <TableCell sx={{ color: 'white' }}>Order ID</TableCell>
                  <TableCell sx={{ color: 'white' }}>Customer</TableCell>
                  <TableCell sx={{ color: 'white' }}>Project</TableCell>
                  <TableCell sx={{ color: 'white' }}>Status</TableCell>
                  <TableCell align="right" sx={{ color: 'white' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order) => (
                  <TableRow
                    key={order._id}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(111, 76, 255, 0.1)',
                        transition: 'background-color 0.2s ease-in-out'
                      }
                    }}
                  >
                    <TableCell sx={{ color: 'white' }}>{order._id}</TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      {`${order.firstName} ${order.lastName}`}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.project}
                        size="small"
                        sx={{
                          background: order.project === 'FRP Project'
                            ? 'rgba(111, 76, 255, 0.2)'
                            : order.project === 'SC Project'
                            ? 'rgba(156, 39, 176, 0.2)'
                            : order.project === 'HPP Project'
                            ? 'rgba(244, 67, 54, 0.2)'
                            : order.project === 'MDI Project'
                            ? 'rgba(76, 175, 80, 0.2)'
                            : order.project === 'MI Project'
                            ? 'rgba(255, 152, 0, 0.2)'
                            : 'rgba(158, 158, 158, 0.2)',
                          color: order.project === 'FRP Project'
                            ? '#6F4CFF'
                            : order.project === 'SC Project'
                            ? '#9C27B0'
                            : order.project === 'HPP Project'
                            ? '#F44336'
                            : order.project === 'MDI Project'
                            ? '#4CAF50'
                            : order.project === 'MI Project'
                            ? '#FF9800'
                            : '#9E9E9E',
                          backdropFilter: 'blur(5px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        size="small"
                        sx={{
                          background: order.status === 'completed'
                            ? 'rgba(76, 175, 80, 0.2)'
                            : order.status === 'pending'
                              ? 'rgba(255, 152, 0, 0.2)'
                              : 'rgba(211, 47, 47, 0.2)',
                          color: order.status === 'completed'
                            ? '#4CAF50'
                            : order.status === 'pending'
                              ? '#FF9800'
                              : '#D32F2F',
                          backdropFilter: 'blur(5px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        sx={{
                          mr: 1,
                          color: '#6F4CFF',
                          '&:hover': {
                            backgroundColor: 'rgba(111, 76, 255, 0.1)',
                            color: '#8266FF'
                          }
                        }}
                        onClick={() => handlePreview(order)}
                      >
                        Preview
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(211, 47, 47, 0.1)'
                          }
                        }}
                        onClick={() => handleDelete(order._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredOrders.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                color: 'white',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  color: 'white',
                },
                '& .MuiTablePagination-select': {
                  color: 'white',
                },
                '& .MuiTablePagination-actions button': {
                  color: 'white',
                },
                '& .MuiTablePagination-actions button:disabled': {
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            />
          </TableContainer>
        )}

        {/* Edit Order Dialog */}
        <EditOrderDialog
          open={editDialogOpen}
          handleClose={handleDialogClose}
          order={selectedOrder}
          onOrderUpdated={handleUpdate}
        />

        {/* Preview Dialog */}
        <Dialog
          open={previewDialogOpen}
          onClose={handlePreviewClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(26, 32, 44, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white'
            }
          }}
        >
          <DialogTitle sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            Order Details
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {selectedOrder && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: '#6F4CFF', mb: 2 }}>
                    Order Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Order ID
                      </Typography>
                      <Typography>{selectedOrder._id}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Project
                      </Typography>
                      <Typography>{selectedOrder.project}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Status
                      </Typography>
                      <Typography>{selectedOrder.status}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Order Date
                      </Typography>
                      <Typography>
                        {new Date(selectedOrder.orderDate).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Source Code
                      </Typography>
                      <Typography>{selectedOrder.sourceCode}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        SKU
                      </Typography>
                      <Typography>{selectedOrder.sku}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Session ID
                      </Typography>
                      <Typography>{selectedOrder.sessionId}</Typography>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                  <Typography variant="h6" sx={{ color: '#6F4CFF', mb: 2 }}>
                    Customer Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        First Name
                      </Typography>
                      <Typography>{selectedOrder.firstName}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Last Name
                      </Typography>
                      <Typography>{selectedOrder.lastName}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Phone
                      </Typography>
                      <Typography>{selectedOrder.phoneNumber}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Email
                      </Typography>
                      <Typography>{selectedOrder.email || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                  <Typography variant="h6" sx={{ color: '#6F4CFF', mb: 2 }}>
                    Address Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Address Line 1
                      </Typography>
                      <Typography>{selectedOrder.address1}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Address Line 2
                      </Typography>
                      <Typography>{selectedOrder.address2 || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        City
                      </Typography>
                      <Typography>{selectedOrder.city}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        State
                      </Typography>
                      <Typography>{selectedOrder.state}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        ZIP Code
                      </Typography>
                      <Typography>{selectedOrder.zipCode}</Typography>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                  <Typography variant="h6" sx={{ color: '#6F4CFF', mb: 2 }}>
                    Product Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Product Name
                      </Typography>
                      <Typography>{selectedOrder.productName}</Typography>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                  <Typography variant="h6" sx={{ color: '#6F4CFF', mb: 2 }}>
                    Payment Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Credit Card Last 4
                      </Typography>
                      <Typography>{selectedOrder.creditCardLast4}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Credit Card Expiration
                      </Typography>
                      <Typography>{selectedOrder.creditCardExpiration}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Voice Recording ID
                      </Typography>
                      <Typography>{selectedOrder.voiceRecordingId || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                  <Typography variant="h6" sx={{ color: '#6F4CFF', mb: 2 }}>
                    Validation Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Validation Status
                      </Typography>
                      <Typography>{selectedOrder.validationStatus ? 'Valid' : 'Invalid'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Validation Message
                      </Typography>
                      <Typography>{selectedOrder.validationMessage}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Validation Date
                      </Typography>
                      <Typography>
                        {new Date(selectedOrder.validationDate).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Last Updated
                      </Typography>
                      <Typography>
                        {new Date(selectedOrder.updatedAt).toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 2 }}>
            <Button
              onClick={handlePreviewClose}
              sx={{
                color: 'white',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
        {deleteError && <Alert severity="error" sx={{ mt: 3 }}>{deleteError}</Alert>}
        {deleteSuccess && <Alert severity="success" sx={{ mt: 3 }}>{deleteSuccess}</Alert>}
      </Paper>
    </Container>
  );
};

export default OrderManagement; 