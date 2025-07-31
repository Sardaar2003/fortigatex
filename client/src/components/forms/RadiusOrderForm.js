import React, { useState, useEffect, useRef } from 'react';
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
  TableRow,
  Snackbar,
  FormHelperText,
  IconButton,
  LinearProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { format } from 'date-fns';
import MuiAlert from '@mui/material/Alert';

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

const prepaidCardBins = ['411111', '422222', '433333', '444444', '455555'];

const RadiusOrderForm = ({ onOrderSuccess }) => {
  const navigate = useNavigate();
  const { token } = React.useContext(AuthContext);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    orderDate: new Date(),
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: '',
    secondaryPhoneNumber: '',
    email: '',
    sourceCode: 'R4N',
    sku: 'F11',
    productName: 'Ear Plug',
    creditCardNumber: '',
    creditCardExpiration: '',
    sessionId: Math.random().toString(36).substring(2, 15),
    project: 'Radius Project'
  });
  const [errors, setErrors] = useState({});

  // Timer effect for notification
  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setShowMessage(false);
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      orderDate: date
    }));
  };

  const handleExpirationDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      creditCardExpiration: date
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'firstName', 'lastName', 'address1', 'city', 'state',
      'zipCode', 'phoneNumber', 'sourceCode', 'sku', 'productName',
      'creditCardNumber', 'creditCardExpiration'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }
    if (formData.secondaryPhoneNumber && !/^\d{10}$/.test(formData.secondaryPhoneNumber)) {
      newErrors.secondaryPhoneNumber = 'Please enter a valid 10-digit phone number';
    }

    // Credit card validation
    if (formData.creditCardNumber && !/^\d{13,16}$/.test(formData.creditCardNumber)) {
      newErrors.creditCardNumber = 'Please enter a valid credit card number';
    }

    // Card expiration validation (MMYY format)
    if (formData.creditCardExpiration && !/^(0[1-9]|1[0-2])\d{2}$/.test(formData.creditCardExpiration)) {
      newErrors.creditCardExpiration = 'Please enter expiration in MMYY format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClearForm = () => {
    setFormData({
      orderDate: new Date(),
      firstName: '',
      lastName: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      phoneNumber: '',
      secondaryPhoneNumber: '',
      email: '',
      sourceCode: 'R4N',
      sku: 'F11',
      productName: 'Ear Plug',
      creditCardNumber: '',
      creditCardExpiration: '',
      sessionId: Math.random().toString(36).substring(2, 15)
    });
    setError('');
    setSuccess(false);
    setShowMessage(false);
  };

  // Replace showMessage/message with snackbar object for consistency
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Replace showNotification with unified version
  const showNotification = (severity, message) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
    setTimeLeft(60);
    setTimerActive(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    handleClearForm();
  };

  // Replace handleCloseMessage with unified version
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
    setTimerActive(false);
    setTimeLeft(60);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateForm()) {
      showNotification('error', 'Please fix the validation errors');
      setLoading(false);
      return;
    }

    // Store form data before clearing
    const formDataToSubmit = {
      ...formData,
      orderDate: format(formData.orderDate, 'MM/dd/yyyy'),
      creditCardExpiration: formData.creditCardExpiration
    };

    try {
      console.log('Starting order submission process...');
      console.log('Form data:', {
        ...formDataToSubmit,
        creditCardNumber: formDataToSubmit.creditCardNumber.replace(/\d(?=\d{4})/g, '*')
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/radius`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formDataToSubmit)
      });

      console.log('Server response status:', response.status);
      const data = await response.json();
      console.log('Server response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      showNotification('success', 'Order created successfully!');
    } catch (err) {
      console.error('Error submitting order:', err);
      showNotification('error', err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        {/* <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          FRP API Order Form
        </Typography> */}

        <Grid container spacing={3}>
          {/* Order Date at the top */}
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Order Date"
              value={formData.orderDate}
              onChange={handleDateChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  error={!!error}
                  helperText={error}
                />
              )}
            />
          </Grid>

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
              label="Secondary Phone (Optional)"
              name="secondaryPhoneNumber"
              value={formData.secondaryPhoneNumber}
              onChange={handleChange}
              inputProps={{ pattern: '[0-9]{10}' }}
              helperText="Optional secondary phone number"
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
            <FormControl fullWidth error={!!errors.state}>
              <InputLabel>State</InputLabel>
              <Select
                value={formData.state}
                onChange={handleChange}
                name="state"
                label="State"
              >
                {states.map((state) => (
                  <MenuItem 
                    key={state.value} 
                    value={state.value}
                    disabled={restrictedStates.includes(state.value)}
                  >
                    {state.label}
                    {restrictedStates.includes(state.value) && ' (Restricted)'}
                  </MenuItem>
                ))}
              </Select>
              {errors.state && (
                <FormHelperText>{errors.state}</FormHelperText>
              )}
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
              error={!!errors.creditCardNumber}
              helperText={errors.creditCardNumber}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Card Expiration (MMYY)"
              name="creditCardExpiration"
              value={formData.creditCardExpiration}
              onChange={handleChange}
              error={!!errors.creditCardExpiration}
              helperText={errors.creditCardExpiration || "Format: MMYY (e.g., 1225 for December 2025)"}
              inputProps={{
                maxLength: 4,
                pattern: "[0-9]*"
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Session ID"
              name="sessionId"
              value={formData.sessionId}
              onChange={handleChange}
            />
          </Grid>

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
          autoHideDuration={60000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{
            '& .MuiSnackbar-root': {
              width: '100%',
              maxWidth: '600px'
            }
          }}
        >
          <Box sx={{ width: '100%', position: 'relative' }}>
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={handleCloseSnackbar}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            sx={{
              width: '100%',
              fontSize: '1.1rem',
                fontWeight: 500,
                '&.MuiAlert-standardSuccess': {
                  backgroundColor: '#4caf50',
                  color: '#ffffff',
                  '& .MuiAlert-icon': {
                    color: '#ffffff'
                  }
                },
                '&.MuiAlert-standardError': {
                  backgroundColor: '#f44336',
                  color: '#ffffff',
                  '& .MuiAlert-icon': {
                    color: '#ffffff'
                  }
                },
                '&.MuiAlert-standardWarning': {
                  backgroundColor: '#ff9800',
                  color: '#ffffff',
                  '& .MuiAlert-icon': {
                    color: '#ffffff'
                  }
                },
                '&.MuiAlert-standardInfo': {
                  backgroundColor: '#2196f3',
                  color: '#ffffff',
                  '& .MuiAlert-icon': {
                    color: '#ffffff'
                  }
                }
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {snackbar.message}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.8 }}>
                    Auto-close in {timeLeft}s
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={((60 - timeLeft) / 60) * 100}
                    sx={{ 
                      flexGrow: 1, 
                      height: 4, 
                      borderRadius: 2,
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'rgba(255,255,255,0.8)'
                      }
                    }}
                  />
                </Box>
              </Box>
            </Alert>
          </Box>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default RadiusOrderForm; 