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
  const { token } = React.useContext(AuthContext);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    setShowPreview(false);
  };

  const handlePreviewSubmit = (e) => {
    e.preventDefault();
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      const requiredFields = [
        'first_name', 'last_name', 'address1', 'city', 'state', 'zip',
        'phone', 'email', 'source', 'sku', 'card_number', 'card_expiration',
        'card_cvv', 'issuer'
      ];

      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/orders`,
        formData,
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
            maxLength={30}
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
            maxLength={30}
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
            inputProps={{ pattern: '[0-9]{10}' }}
            helperText="Enter 10-digit phone number"
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
            inputProps={{ pattern: '[A-Z]{2}' }}
            helperText="Enter 2-letter state code"
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
            inputProps={{ pattern: '[0-9]{5}(-[0-9]{4})?' }}
            helperText="Enter 5 or 9-digit ZIP code"
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
            inputProps={{ pattern: '[0-9]{16}' }}
            helperText="Enter 16-digit card number"
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
            inputProps={{ pattern: '[0-9]{4}' }}
            helperText="Format: MMYY"
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
            inputProps={{ pattern: '[0-9]{3,4}' }}
            helperText="3 or 4 digits"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
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
          </FormControl>
        </Grid>

        {/* Submit Button */}
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #6F4CFF 0%, #402AD5 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8266FF 0%, #4F35FF 100%)',
              }
            }}
          >
            Preview Order
          </Button>
        </Grid>
      </Grid>

      <PreviewDialog />
    </Box>
  );
};

export default SemprisOrderForm; 