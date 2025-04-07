import React, { useState, useContext } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Divider,
  Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const SemprisOrderForm = () => {
  const navigate = useNavigate();
  const { token, logout } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    source: '',
    sku: '',
    card_number: '',
    card_expiration: '',
    card_cvv: '',
    issuer: '',
    vendor_id: 'STAR',
    tracking_number: crypto.randomUUID()
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Valid issuers as per Sempris API with proper formatting
  const validIssuers = [
    { value: 'diners-club', label: 'Diners Club' },
    { value: 'discover', label: 'Discover' },
    { value: 'jcb', label: 'JCB' },
    { value: 'visa', label: 'Visa' },
    { value: 'mastercard', label: 'Mastercard' },
    { value: 'american-express', label: 'American Express' }
  ];

  const validateForm = () => {
    const errors = {};

    // Required fields validation
    if (!formData.first_name) errors.first_name = 'First name is required';
    if (!formData.last_name) errors.last_name = 'Last name is required';
    if (!formData.address1) errors.address1 = 'Address is required';
    if (!formData.city) errors.city = 'City is required';
    if (!formData.state) errors.state = 'State is required';
    if (!formData.zip) errors.zip = 'ZIP code is required';
    if (!formData.phone) errors.phone = 'Phone number is required';
    if (!formData.source) errors.source = 'Source is required';
    if (!formData.sku) errors.sku = 'SKU is required';
    if (!formData.card_number) errors.card_number = 'Credit card number is required';
    if (!formData.card_expiration) errors.card_expiration = 'Card expiration is required';
    if (!formData.card_cvv) errors.card_cvv = 'CVV is required';
    if (!formData.issuer) errors.issuer = 'Card issuer is required';

    // Field length and format validation
    if (formData.first_name && (formData.first_name.length < 1 || formData.first_name.length > 30)) {
      errors.first_name = 'First name must be between 1 and 30 characters';
    }
    if (formData.last_name && (formData.last_name.length < 1 || formData.last_name.length > 30)) {
      errors.last_name = 'Last name must be between 1 and 30 characters';
    }
    if (formData.address1 && (formData.address1.length < 1 || formData.address1.length > 50)) {
      errors.address1 = 'Address must be between 1 and 50 characters';
    }
    if (formData.address2 && formData.address2.length > 50) {
      errors.address2 = 'Address 2 must be less than 50 characters';
    }
    if (formData.city && (formData.city.length < 1 || formData.city.length > 30)) {
      errors.city = 'City must be between 1 and 30 characters';
    }
    if (formData.state && formData.state.length !== 2) {
      errors.state = 'State must be exactly 2 characters';
    }
    if (formData.zip && !/^\d{5}(\d{4})?$/.test(formData.zip)) {
      errors.zip = 'ZIP code must be 5 or 9 digits';
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Phone must be exactly 10 digits';
    }
    if (formData.source && (formData.source.length < 1 || formData.source.length > 6)) {
      errors.source = 'Source must be between 1 and 6 characters';
    }
    if (formData.sku && (formData.sku.length < 1 || formData.sku.length > 7)) {
      errors.sku = 'SKU must be between 1 and 7 characters';
    }
    if (formData.card_number && !/^\d{13,16}$/.test(formData.card_number)) {
      errors.card_number = 'Card number must be between 13 and 16 digits';
    }
    if (formData.card_expiration && !/^(0[1-9]|1[0-2])\d{2}$/.test(formData.card_expiration)) {
      errors.card_expiration = 'Expiration must be in MMYY format';
    }
    if (formData.card_cvv && !/^\d{3,4}$/.test(formData.card_cvv)) {
      errors.card_cvv = 'CVV must be 3 or 4 digits';
    }
    if (formData.issuer && !validIssuers.some(issuer => issuer.value === formData.issuer)) {
      errors.issuer = 'Invalid card issuer';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix the validation errors before submitting',
        severity: 'error'
      });
      return;
    }

    // Store form data before clearing
    const formDataToSubmit = { ...formData };
    
    // Clear form immediately
    handleClearForm();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/orders/sempris`,
        formDataToSubmit,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setSnackbar({
        open: true,
        message: response.data.success ? 'Order submitted successfully!' : (response.data.message || 'Failed to create order'),
        severity: response.data.success ? 'success' : 'error'
      });
    } catch (err) {
      console.error('Error submitting order:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'An error occurred while creating the order',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      email: '',
      source: '',
      sku: '',
      card_number: '',
      card_expiration: '',
      card_cvv: '',
      issuer: '',
      vendor_id: 'STAR',
      tracking_number: crypto.randomUUID()
    });
    setValidationErrors({});
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            error={!!validationErrors.first_name}
            helperText={validationErrors.first_name}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            error={!!validationErrors.last_name}
            helperText={validationErrors.last_name}
          />
        </Grid>

        {/* Address Information */}
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Address Line 1"
            name="address1"
            value={formData.address1}
            onChange={handleChange}
            error={!!validationErrors.address1}
            helperText={validationErrors.address1}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address Line 2"
            name="address2"
            value={formData.address2}
            onChange={handleChange}
            error={!!validationErrors.address2}
            helperText={validationErrors.address2}
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
            error={!!validationErrors.city}
            helperText={validationErrors.city}
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
            error={!!validationErrors.state}
            helperText={validationErrors.state || 'Enter 2-letter state code'}
            inputProps={{ maxLength: 2 }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="ZIP Code"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            error={!!validationErrors.zip}
            helperText={validationErrors.zip}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={!!validationErrors.phone}
            helperText={validationErrors.phone}
            inputProps={{ maxLength: 10 }}
          />
        </Grid>

        {/* Order Information */}
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Source"
            name="source"
            value={formData.source}
            onChange={handleChange}
            error={!!validationErrors.source}
            helperText={validationErrors.source}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="SKU"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            error={!!validationErrors.sku}
            helperText={validationErrors.sku}
          />
        </Grid>

        {/* Card Information */}
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Card Number"
            name="card_number"
            value={formData.card_number}
            onChange={handleChange}
            error={!!validationErrors.card_number}
            helperText={validationErrors.card_number}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Card Expiration (MMYY)"
            name="card_expiration"
            value={formData.card_expiration}
            onChange={handleChange}
            error={!!validationErrors.card_expiration}
            helperText={validationErrors.card_expiration || "Format: MMYY (e.g., 1225 for December 2025)"}
            inputProps={{ maxLength: 4 }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="CVV"
            name="card_cvv"
            value={formData.card_cvv}
            onChange={handleChange}
            error={!!validationErrors.card_cvv}
            helperText={validationErrors.card_cvv}
            inputProps={{ maxLength: 4 }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required error={!!validationErrors.issuer}>
            <InputLabel>Card Issuer</InputLabel>
            <Select
              name="issuer"
              value={formData.issuer}
              onChange={handleChange}
              label="Card Issuer"
            >
              {validIssuers.map((issuer) => (
                <MenuItem key={issuer.value} value={issuer.value}>
                  {issuer.label}
                </MenuItem>
              ))}
            </Select>
            {validationErrors.issuer && (
              <Typography color="error" variant="caption">
                {validationErrors.issuer}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Submit Button */}
        <Grid item xs={12}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Submit Order'}
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
  );
};

export default SemprisOrderForm; 