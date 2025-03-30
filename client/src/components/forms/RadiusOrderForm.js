import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Divider,
  Paper,
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

// List of US states
const states = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MD', label: 'Maryland' },
  { value: 'ME', label: 'Maine' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' }
];

// Restricted states
const restrictedStates = ['IA', 'ME', 'MN', 'UT', 'VT', 'WI'];

const RadiusOrderForm = () => {
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
    sourceCode: 'R4N',
    sku: 'F11',
    productName: '',
    creditCardNumber: '',
    creditCardExpiration: '',
    voiceRecordingId: '',
    project: 'Radius Project'
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
      sourceCode: 'R4N',
      sku: 'F11',
      productName: '',
      creditCardNumber: '',
      creditCardExpiration: '',
      voiceRecordingId: '',
      project: 'Radius Project'
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
      disableEscapeKeyDown
      disableBackdropClick
    >
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, rgba(26, 32, 44, 0.95) 0%, rgba(17, 25, 40, 0.95) 100%)',
        color: 'white'
      }}>
        Order Preview - Radius Project
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
        Radius Order Form
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
          <FormControl fullWidth required>
            <InputLabel>State</InputLabel>
            <Select
              name="state"
              value={formData.state}
              onChange={handleChange}
              label="State"
            >
              {states.map((state) => (
                <MenuItem
                  key={state.value}
                  value={state.value}
                  disabled={restrictedStates.includes(state.value)}
                >
                  {state.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
            InputProps={{
              readOnly: true,
            }}
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
            InputProps={{
              readOnly: true,
            }}
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
        <Grid item xs={12} sm={6}>
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

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Voice Recording ID"
            name="voiceRecordingId"
            value={formData.voiceRecordingId}
            onChange={handleChange}
          />
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Button
              onClick={handleClearForm}
              variant="outlined"
              color="error"
              fullWidth
              size="large"
            >
              Clear Form
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
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
      </Grid>

      <PreviewDialog />
    </Box>
  );
};

export default RadiusOrderForm; 