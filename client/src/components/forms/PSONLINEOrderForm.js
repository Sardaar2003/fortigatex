import React, { useState, useContext } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PSONLINEOrderForm = ({ onOrderSuccess }) => {
  const navigate = useNavigate();
  const { token, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    product: '',
    productId: '',
    amount: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: null,
    gender: '',
    streetAddress: '',
    apt: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: null,
    cvv: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const products = [
    { id: 43, name: 'ID Theft', price: 3.72 },
    { id: 46, name: 'Telemed', price: 3.78 }
  ];

  const handleProductChange = (event) => {
    const product = products.find(p => p.id === event.target.value);
    setSelectedProduct(product);
    setFormData(prev => ({
      ...prev,
      product: event.target.value,
      productId: product.id,
      amount: product.price
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name) => (date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      // Format dates to MM/DD/YYYY
      const formatDate = (date) => {
        if (!date) return '';
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      };

      const orderData = {
        domain: window.location.hostname,
        buildorder: 0, // Changed to 1 to build order in PSOnline
        capture_delay: 0,
        card_num: formData.cardNumber.replace(/\s/g, ''),
        card_expm: formData.expiryDate ? String(formData.expiryDate.getMonth() + 1).padStart(2, '0') : '',
        card_expy: formData.expiryDate ? formData.expiryDate.getFullYear() : '',
        card_cvv: formData.cvv,
        CustomerFirstName: formData.firstName,
        CustomerLastName: formData.lastName,
        BillingStreetAddress: formData.streetAddress,
        BillingApt: formData.apt,
        BillingCity: formData.city,
        BillingState: formData.state,
        BillingZipCode: formData.zipCode,
        Email: formData.email,
        BillingHomePhone: formData.phone.replace(/\D/g, '').slice(0, 10), // Ensure 10 digits
        amount: formData.amount,
        ProductCount: 1,
        productid_1: formData.productId,
        // productsku_1: `PSO-${formData.productId}`,
        productqty_1: 1,
        // producttype_1: 'simple',
        // DOB: formData.dob ? formatDate(formData.dob) : '',
        // Gender: formData.gender,
        FormOfPayment: 'card'
      };

      // Validate required fields
      const requiredFields = {
        card_num: 'Card number',
        card_expm: 'Card expiration month',
        card_expy: 'Card expiration year',
        card_cvv: 'CVV',
        CustomerFirstName: 'First name',
        CustomerLastName: 'Last name',
        BillingStreetAddress: 'Street address',
        BillingCity: 'City',
        BillingState: 'State',
        BillingZipCode: 'ZIP code',
        Email: 'Email',
        BillingHomePhone: 'Phone number',
        amount: 'Amount'
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key]) => !orderData[key])
        .map(([_, label]) => label);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate card number format (15-16 digits)
      if (!/^\d{15,16}$/.test(orderData.card_num)) {
        throw new Error('Card number must be 15 or 16 digits');
      }

      // Validate CVV format (3-4 digits)
      if (!/^\d{3,4}$/.test(orderData.card_cvv)) {
        throw new Error('CVV must be 3 or 4 digits');
      }

      // Validate phone number format (10 digits)
      if (!/^\d{10}$/.test(orderData.BillingHomePhone)) {
        throw new Error('Phone number must be 10 digits');
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderData.Email)) {
        throw new Error('Invalid email format');
      }

      const response = await axios.post('/api/orders/psonline', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.ResponseCode === 200) {
        setSnackbar({
          open: true,
          message: 'Order processed successfully!',
          severity: 'success'
        });
        setFormData({
          product: '',
          productId: '',
          amount: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dob: null,
          gender: '',
          streetAddress: '',
          apt: '',
          city: '',
          state: '',
          zipCode: '',
          cardNumber: '',
          expiryDate: null,
          cvv: ''
        });
        setSelectedProduct(null);
        if (onOrderSuccess) {
          onOrderSuccess();
        }
      } else {
        setSnackbar({
          open: true,
          message: response.data.ResponseData || 'Failed to process order',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Order submission error:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setSnackbar({
        open: true,
        message: 'An error occurred while processing your order',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          PSOnline Order Form
        </Typography>

        <Grid container spacing={3}>
          {/* Product Selection */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Product Selection
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Select Product</InputLabel>
              <Select
                value={formData.product}
                onChange={handleProductChange}
                label="Select Product"
                required
              >
                {products.map(product => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name} - ${product.price}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Personal Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Date of Birth"
              value={formData.dob}
              onChange={handleDateChange('dob')}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={formData.gender}
                onChange={handleChange}
                name="gender"
                label="Gender"
              >
                <MenuItem value="M">Male</MenuItem>
                <MenuItem value="F">Female</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Billing Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Billing Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Street Address"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Apt/Suite"
              name="apt"
              value={formData.apt}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="ZIP Code"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
            />
          </Grid>

          {/* Payment Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Payment Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Card Number"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Expiry Date"
              value={formData.expiryDate}
              onChange={handleDateChange('expiryDate')}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="CVV"
              name="cvv"
              value={formData.cvv}
              onChange={handleChange}
            />
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #6F4CFF 0%, #402AD5 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8266FF 0%, #4F35FF 100%)',
                }
              }}
            >
              {loading ? 'Submitting...' : 'Submit Order'}
            </Button>
          </Grid>
        </Grid>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{
            '& .MuiSnackbar-root': {
              width: '100%',
              maxWidth: '600px'
            }
          }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default PSONLINEOrderForm; 