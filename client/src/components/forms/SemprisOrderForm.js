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
  FormHelperText,
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
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: '',
    email: '',
    sourceCode: '',
    sku: '',
    productName: '',
    creditCardNumber: '',
    creditCardExpiration: '',
    creditCardCVV: '',
    cardIssuer: '',
    vendorId: '',
    clientOrderNumber: '',
    clientData: '',
    pitchId: '',
    project: 'Sempris Project'
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
      firstName: '',
      lastName: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      phoneNumber: '',
      email: '',
      sourceCode: '',
      sku: '',
      productName: '',
      creditCardNumber: '',
      creditCardExpiration: '',
      creditCardCVV: '',
      cardIssuer: '',
      vendorId: '',
      clientOrderNumber: '',
      clientData: '',
      pitchId: '',
      project: 'Sempris Project'
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
                <TableCell>{`${formData.firstName} ${formData.lastName}`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Phone</TableCell>
                <TableCell>{formData.phoneNumber}</TableCell>
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
                <TableCell>{`${formData.city}, ${formData.state} ${formData.zipCode}`}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell component="th" sx={{ fontWeight: 'bold' }}>Product Information</TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Source Code</TableCell>
                <TableCell>{formData.sourceCode}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>{formData.sku}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>{formData.productName}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell component="th" sx={{ fontWeight: 'bold' }}>Payment Information</TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Credit Card</TableCell>
                <TableCell>
                  {`****-****-****-${formData.creditCardNumber.slice(-4)}`}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Expiration</TableCell>
                <TableCell>{formData.creditCardExpiration}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Card Issuer</TableCell>
                <TableCell>{formData.cardIssuer}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell component="th" sx={{ fontWeight: 'bold' }}>Sempris Specific Information</TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Vendor ID</TableCell>
                <TableCell>{formData.vendorId}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Client Order Number</TableCell>
                <TableCell>{formData.clientOrderNumber}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Client Data</TableCell>
                <TableCell>{formData.clientData}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Pitch ID</TableCell>
                <TableCell>{formData.pitchId}</TableCell>
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
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            maxLength={30}
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
            maxLength={30}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            inputProps={{ pattern: '[0-9]{10}' }}
            helperText="Enter 10-digit phone number"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            maxLength={512}
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
            maxLength={50}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address Line 2"
            name="address2"
            value={formData.address2}
            onChange={handleChange}
            maxLength={50}
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
            maxLength={30}
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
            maxLength={2}
            inputProps={{ pattern: '[A-Z]{2}' }}
            helperText="Enter 2-letter state code"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            required
            fullWidth
            label="ZIP Code"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            inputProps={{ pattern: '[0-9]{5}(-[0-9]{4})?' }}
            helperText="Enter 5 or 9-digit ZIP code"
          />
        </Grid>

        {/* Product Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Product Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Source Code"
            name="sourceCode"
            value={formData.sourceCode}
            onChange={handleChange}
            maxLength={6}
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
            maxLength={7}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Product Name"
            name="productName"
            value={formData.productName}
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
            name="creditCardNumber"
            value={formData.creditCardNumber}
            onChange={handleChange}
            inputProps={{ pattern: '[0-9]{13,16}' }}
            helperText="Enter 13-16 digit card number"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            required
            fullWidth
            label="Expiration (MMYY)"
            name="creditCardExpiration"
            value={formData.creditCardExpiration}
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
            name="creditCardCVV"
            value={formData.creditCardCVV}
            onChange={handleChange}
            inputProps={{ pattern: '[0-9]{3,4}' }}
            helperText="3 or 4 digits"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Card Issuer</InputLabel>
            <Select
              name="cardIssuer"
              value={formData.cardIssuer}
              onChange={handleChange}
              label="Card Issuer"
            >
              <MenuItem value="diners-club">Diners Club</MenuItem>
              <MenuItem value="discover">Discover</MenuItem>
              <MenuItem value="jcb">JCB</MenuItem>
              <MenuItem value="visa">Visa</MenuItem>
              <MenuItem value="mastercard">Mastercard</MenuItem>
              <MenuItem value="american-express">American Express</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Sempris Specific Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Sempris Specific Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Vendor ID"
            name="vendorId"
            value={formData.vendorId}
            onChange={handleChange}
            maxLength={4}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Client Order Number"
            name="clientOrderNumber"
            value={formData.clientOrderNumber}
            onChange={handleChange}
            maxLength={10}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Client Data"
            name="clientData"
            value={formData.clientData}
            onChange={handleChange}
            maxLength={64}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Pitch ID"
            name="pitchId"
            value={formData.pitchId}
            onChange={handleChange}
            maxLength={11}
          />
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