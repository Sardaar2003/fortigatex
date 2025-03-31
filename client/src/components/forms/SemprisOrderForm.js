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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const SemprisOrderForm = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
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

  const validateForm = () => {
    const errors = {};
    
    if (!formData.first_name.trim()) errors.first_name = 'First name is required';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required';
    if (!formData.address1.trim()) errors.address1 = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.zip.trim()) errors.zip = 'ZIP code is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.source.trim()) errors.source = 'Source code is required';
    if (!formData.sku.trim()) errors.sku = 'SKU is required';
    if (!formData.card_number.trim()) errors.card_number = 'Card number is required';
    if (!formData.card_expiration.trim()) errors.card_expiration = 'Card expiration is required';
    if (!formData.card_cvv.trim()) errors.card_cvv = 'CVV is required';
    if (!formData.issuer) errors.issuer = 'Card issuer is required';

    // Additional validation rules
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Phone number must be 10 digits';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (formData.state && !/^[A-Z]{2}$/.test(formData.state)) {
      errors.state = 'State must be 2 letters';
    }
    if (formData.zip && !/^\d{5}(-\d{4})?$/.test(formData.zip)) {
      errors.zip = 'Invalid ZIP code format';
    }
    if (formData.card_number && !/^\d{16}$/.test(formData.card_number.replace(/\D/g, ''))) {
      errors.card_number = 'Card number must be 16 digits';
    }
    if (formData.card_expiration && !/^\d{4}$/.test(formData.card_expiration)) {
      errors.card_expiration = 'Expiration must be in MMYY format';
    }
    if (formData.card_cvv && !/^\d{3,4}$/.test(formData.card_cvv)) {
      errors.card_cvv = 'CVV must be 3 or 4 digits';
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
    setError('');
    setValidationErrors({});
    setShowPreview(false);
  };

  const handlePreviewSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowPreview(true);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError('Please fix the validation errors before submitting');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Transform form data to match backend expectations
      const orderData = {
        firstName: formData.first_name,
        lastName: formData.last_name,
        address1: formData.address1,
        address2: formData.address2 || '',
        city: formData.city,
        state: formData.state,
        zipCode: formData.zip,
        phoneNumber: formData.phone,
        email: formData.email,
        sourceCode: formData.source,
        sku: formData.sku,
        creditCardNumber: formData.card_number,
        creditCardExpiration: formData.card_expiration,
        creditCardCVV: formData.card_cvv,
        cardIssuer: formData.issuer,
        vendorId: formData.vendor_id,
        project: 'Sempris Project',
        sessionId: formData.tracking_number
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/orders`,
        orderData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        handleClearForm();
        setShowPreview(false);
      } else {
        setError(response.data.message || 'Failed to create order');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while creating the order');
    } finally {
      setLoading(false);
    }
  };

  const PreviewDialog = () => (
    <Dialog
      open={showPreview}
      onClose={() => setShowPreview(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, rgba(26, 32, 44, 0.95) 0%, rgba(17, 25, 40, 0.95) 100%)',
        color: 'white'
      }}>
        Order Preview - Sempris Project
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <TableContainer component={Paper} sx={{
          background: 'rgba(26, 32, 44, 0.02)',
          borderRadius: 2
        }}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell component="th" sx={{ fontWeight: 'bold', width: '30%' }}>Personal Information</TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>{`${formData.first_name} ${formData.last_name}`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Phone</TableCell>
                <TableCell>{formData.phone}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>{formData.email}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell component="th" sx={{ fontWeight: 'bold' }}>Address</TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Street Address</TableCell>
                <TableCell>
                  {formData.address1}
                  {formData.address2 && <br />}
                  {formData.address2}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>City, State, ZIP</TableCell>
                <TableCell>{`${formData.city}, ${formData.state} ${formData.zip}`}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell component="th" sx={{ fontWeight: 'bold' }}>Order Information</TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Source Code</TableCell>
                <TableCell>{formData.source}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>{formData.sku}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Tracking Number</TableCell>
                <TableCell>{formData.tracking_number}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell component="th" sx={{ fontWeight: 'bold' }}>Payment Information</TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Credit Card</TableCell>
                <TableCell>
                  {formData.card_number ? `****-****-****-${formData.card_number.slice(-4)}` : 'Not provided'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Expiration</TableCell>
                <TableCell>{formData.card_expiration}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Card Issuer</TableCell>
                <TableCell>{formData.issuer}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ p: 3, background: 'rgba(26, 32, 44, 0.02)' }}>
        <Button
          onClick={() => setShowPreview(false)}
          variant="outlined"
          sx={{
            borderColor: 'rgba(111, 76, 255, 0.5)',
            color: '#6F4CFF',
            '&:hover': {
              borderColor: '#6F4CFF',
              backgroundColor: 'rgba(111, 76, 255, 0.1)'
            }
          }}
        >
          Back to Edit
        </Button>
        <Button
          onClick={handleClearForm}
          variant="outlined"
          color="error"
          sx={{ mx: 1 }}
        >
          Clear Form
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            background: 'linear-gradient(135deg, #6F4CFF 0%, #402AD5 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #8266FF 0%, #4F35FF 100%)',
            }
          }}
        >
          {loading ? 'Submitting...' : 'Confirm & Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box component="form" onSubmit={handlePreviewSubmit} sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        Sempris Order Form
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Personal Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
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
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={!!validationErrors.phone}
            helperText={validationErrors.phone || 'Enter 10-digit phone number'}
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
            error={!!validationErrors.email}
            helperText={validationErrors.email}
          />
        </Grid>

        {/* Address Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Address Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
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
        <Grid item xs={12} sm={3}>
          <TextField
            required
            fullWidth
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            error={!!validationErrors.state}
            helperText={validationErrors.state || 'Enter 2-letter state code'}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            required
            fullWidth
            label="ZIP Code"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            error={!!validationErrors.zip}
            helperText={validationErrors.zip || 'Enter 5 or 9-digit ZIP code'}
          />
        </Grid>

        {/* Order Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Order Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Source Code"
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

        {/* Payment Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Payment Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Credit Card Number"
            name="card_number"
            value={formData.card_number}
            onChange={handleChange}
            error={!!validationErrors.card_number}
            helperText={validationErrors.card_number || 'Enter 16-digit card number'}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            required
            fullWidth
            label="Expiration (MMYY)"
            name="card_expiration"
            value={formData.card_expiration}
            onChange={handleChange}
            error={!!validationErrors.card_expiration}
            helperText={validationErrors.card_expiration || 'Format: MMYY'}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            required
            fullWidth
            label="CVV"
            name="card_cvv"
            value={formData.card_cvv}
            onChange={handleChange}
            error={!!validationErrors.card_cvv}
            helperText={validationErrors.card_cvv || '3 or 4 digits'}
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
              <MenuItem value="visa">Visa</MenuItem>
              <MenuItem value="mastercard">Mastercard</MenuItem>
              <MenuItem value="american-express">American Express</MenuItem>
              <MenuItem value="discover">Discover</MenuItem>
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
            {loading ? 'Processing...' : 'Preview Order'}
          </Button>
        </Grid>
      </Grid>

      <PreviewDialog />
    </Box>
  );
};

export default SemprisOrderForm; 