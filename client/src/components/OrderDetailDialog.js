import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const OrderDetailDialog = ({ open, handleClose, order }) => {
  if (!order) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatCreditCard = (cardNumber) => {
    if (!cardNumber) return 'N/A';
    // Display the full credit card number
    return cardNumber;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'cancelled': return 'error';
      case 'failed': return 'error';
      case 'refunded': return 'default';
      default: return 'default';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(26, 32, 44, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        color: 'white',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">Order Details</Typography>
        <Button
          onClick={handleClose}
          sx={{ color: 'white', minWidth: 'auto' }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2, color: 'white' }}>
        <Grid container spacing={3}>
          {/* Order Header Information */}
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 2, 
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" color="primary">
                    Order ID: {order._id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Project: {order.project}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Created: {formatDate(order.createdAt)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Customer Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: 2, 
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <Typography variant="h6" gutterBottom color="primary">
                Customer Information
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none', py: 0.5 }}>
                        <strong>Name:</strong>
                      </TableCell>
                      <TableCell sx={{ color: 'white', border: 'none', py: 0.5 }}>
                        {order.firstName} {order.lastName}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none', py: 0.5 }}>
                        <strong>Email:</strong>
                      </TableCell>
                      <TableCell sx={{ color: 'white', border: 'none', py: 0.5 }}>
                        {order.email || 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none', py: 0.5 }}>
                        <strong>Phone:</strong>
                      </TableCell>
                      <TableCell sx={{ color: 'white', border: 'none', py: 0.5 }}>
                        {order.phoneNumber || 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none', py: 0.5 }}>
                        <strong>Secondary Phone:</strong>
                      </TableCell>
                      <TableCell sx={{ color: 'white', border: 'none', py: 0.5 }}>
                        {order.secondaryPhoneNumber || 'N/A'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Address Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: 2, 
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <Typography variant="h6" gutterBottom color="primary">
                Address Information
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none', py: 0.5 }}>
                        <strong>Address:</strong>
                      </TableCell>
                      <TableCell sx={{ color: 'white', border: 'none', py: 0.5 }}>
                        {order.address1}
                      </TableCell>
                    </TableRow>
                    {order.address2 && (
                      <TableRow>
                        <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none', py: 0.5 }}>
                          <strong>Address 2:</strong>
                        </TableCell>
                        <TableCell sx={{ color: 'white', border: 'none', py: 0.5 }}>
                          {order.address2}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none', py: 0.5 }}>
                        <strong>City:</strong>
                      </TableCell>
                      <TableCell sx={{ color: 'white', border: 'none', py: 0.5 }}>
                        {order.city}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none', py: 0.5 }}>
                        <strong>State:</strong>
                      </TableCell>
                      <TableCell sx={{ color: 'white', border: 'none', py: 0.5 }}>
                        {order.state}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none', py: 0.5 }}>
                        <strong>ZIP Code:</strong>
                      </TableCell>
                      <TableCell sx={{ color: 'white', border: 'none', py: 0.5 }}>
                        {order.zipCode}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Credit Card Information */}
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 2, 
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <Typography variant="h6" gutterBottom color="primary">
                Credit Card Information
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none', py: 0.5 }}>
                        <strong>Card Number:</strong>
                      </TableCell>
                      <TableCell sx={{ color: 'white', border: 'none', py: 0.5 }}>
                        {formatCreditCard(order.creditCardNumber)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none', py: 0.5 }}>
                        <strong>Last 4 Digits:</strong>
                      </TableCell>
                      <TableCell sx={{ color: 'white', border: 'none', py: 0.5 }}>
                        {order.creditCardLast4 || 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none', py: 0.5 }}>
                        <strong>Expiration:</strong>
                      </TableCell>
                      <TableCell sx={{ color: 'white', border: 'none', py: 0.5 }}>
                        {order.creditCardExpiration || 'N/A'}
                      </TableCell>
                    </TableRow>
                    {order.creditCardCVV && (
                      <TableRow>
                        <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none', py: 0.5 }}>
                          <strong>CVV:</strong>
                        </TableCell>
                        <TableCell sx={{ color: 'white', border: 'none', py: 0.5 }}>
                          {order.creditCardCVV}
                        </TableCell>
                      </TableRow>
                    )}
                    {order.cardIssuer && (
                      <TableRow>
                        <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none', py: 0.5 }}>
                          <strong>Card Issuer:</strong>
                        </TableCell>
                        <TableCell sx={{ color: 'white', border: 'none', py: 0.5 }}>
                          {order.cardIssuer}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Order Details */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: 2, 
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <Typography variant="h6" gutterBottom color="primary">
                Order Details
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none', py: 0.5 }}>
                        <strong>Product:</strong>
                      </TableCell>
                      <TableCell sx={{ color: 'white', border: 'none', py: 0.5 }}>
                        {order.productName || 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none', py: 0.5 }}>
                        <strong>Source Code:</strong>
                      </TableCell>
                      <TableCell sx={{ color: 'white', border: 'none', py: 0.5 }}>
                        {order.sourceCode || 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none', py: 0.5 }}>
                        <strong>SKU:</strong>
                      </TableCell>
                      <TableCell sx={{ color: 'white', border: 'none', py: 0.5 }}>
                        {order.sku || 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none', py: 0.5 }}>
                        <strong>Session ID:</strong>
                      </TableCell>
                      <TableCell sx={{ color: 'white', border: 'none', py: 0.5 }}>
                        {order.sessionId || 'N/A'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Validation Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: 2, 
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <Typography variant="h6" gutterBottom color="primary">
                Validation Information
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none', py: 0.5 }}>
                        <strong>Validation Status:</strong>
                      </TableCell>
                      <TableCell sx={{ color: 'white', border: 'none', py: 0.5 }}>
                        <Chip
                          label={order.validationStatus ? 'Validated' : 'Not Validated'}
                          color={order.validationStatus ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none', py: 0.5 }}>
                        <strong>Validation Message:</strong>
                      </TableCell>
                      <TableCell sx={{ color: 'white', border: 'none', py: 0.5 }}>
                        {order.validationMessage || 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none', py: 0.5 }}>
                        <strong>Validation Date:</strong>
                      </TableCell>
                      <TableCell sx={{ color: 'white', border: 'none', py: 0.5 }}>
                        {formatDate(order.validationDate)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none', py: 0.5 }}>
                        <strong>Order Date:</strong>
                      </TableCell>
                      <TableCell sx={{ color: 'white', border: 'none', py: 0.5 }}>
                        {order.orderDate || 'N/A'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ 
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        p: 2
      }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          sx={{ 
            color: 'white',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.5)'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailDialog; 