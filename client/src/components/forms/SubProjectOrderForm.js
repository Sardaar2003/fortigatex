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
  Snackbar,
  FormHelperText,
  IconButton,
  LinearProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { format } from 'date-fns';
import MuiAlert from '@mui/material/Alert';

const SubProjectOrderForm = ({ onOrderSuccess }) => {
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
    user_id: '37',
    connection_id: '1',
    payment_method_id: '1',
    campaign_id: '1',
    offers: [
      { offer_id: 40, order_offer_quantity: 1 }
    ],
    currency_id: '1',
    email: '',
    phone: '',
    bill_fname: '',
    bill_lname: '',
    bill_organization: '',
    bill_country: '',
    bill_address1: '',
    bill_address2: '',
    bill_city: '',
    bill_state: '',
    bill_zipcode: '',
    shipping_same: true,
    ship_fname: '',
    ship_lname: '',
    ship_organization: '',
    ship_country: '',
    ship_address1: '',
    ship_address2: '',
    ship_city: '',
    ship_state: '',
    ship_zipcode: '',
    card_type_id: '',
    card_number: '',
    card_cvv: '',
    card_exp_month: '',
    card_exp_year: '',
    tracking1: 'SA',
    tracking2: '01',
    // ... add other fields as needed
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
  // Finalize validation logic for all conditional requirements
  const validateForm = () => {
    const newErrors = {};
    // Required fields (using SubProjectOrderForm field names)
    const requiredFields = [
      'bill_fname', 'bill_lname', 'bill_address1', 'bill_city', 'bill_state',
      'bill_zipcode', 'phone', 'card_number', 'card_exp_month', 'card_exp_year', 'card_cvv', 'card_type_id'
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
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    // Card number validation
    if (formData.card_number && !/^\d{13,16}$/.test(formData.card_number)) {
      newErrors.card_number = 'Please enter a valid card number';
    }
    // Card expiration month
    if (formData.card_exp_month && !/^(0[1-9]|1[0-2])$/.test(formData.card_exp_month)) {
      newErrors.card_exp_month = 'Enter a valid month (01-12)';
    }
    // Card expiration year
    if (formData.card_exp_year && !/^\d{4}$/.test(formData.card_exp_year)) {
      newErrors.card_exp_year = 'Enter a valid year (e.g., 2025)';
    }
    // Card CVV
    if (formData.card_cvv && !/^\d{3,4}$/.test(formData.card_cvv)) {
      newErrors.card_cvv = 'Enter a valid CVV';
    }
    // Shipping address validation if not shipping_same
    if (!formData.shipping_same) {
      const shippingFields = [
        'ship_fname', 'ship_lname', 'ship_address1', 'ship_city', 'ship_state', 'ship_zipcode', 'ship_country'
      ];
      shippingFields.forEach(field => {
        if (!formData[field]) {
          newErrors[field] = 'This field is required';
        }
      });
    }
      setErrors(newErrors);
      console.log(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handler for form submission (to be implemented)
  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  
  if (!validateForm()) {
    showNotification('error', 'Please fix the validation errors');
    return;
  }

  setLoading(true);

  try {

    // Email fallback logic
    let email = formData.email;
    if (!email && formData.phone) {
      email = `${formData.phone}@noemail.com`;
    }

    // Format fields as needed
    const formDataToSubmit = {
      ...formData,
      email,
    };

    console.log('🚀 Submitting order...');
    console.log('📦 Payload:', {
      ...formDataToSubmit,
      creditCardNumber: formDataToSubmit.creditCardNumber?.replace(/\d(?=\d{4})/g, '*')
    });

    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/sublytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formDataToSubmit)
      });

    console.log('📡 Server status:', response.status);
    const data = await response.json();
    console.log('📨 Server response:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create order');
    }

    if (Array.isArray(data.transaction)) {
      const resp = data.transaction[0];
      switch (resp.response_code) {
        case 100:
          showNotification('success', 'Order processed successfully!');
          if (onOrderSuccess) onOrderSuccess(data);
          break;
        case 101:
          showNotification('info', 'Further action required to complete the transaction.');
          break;
        default:
          showNotification('error', resp.response_message || 'Order failed.');
      }
    } else {
      // Generic success fallback
      showNotification('success', 'Order processed successfully!');
      if (onOrderSuccess) onOrderSuccess(data);
    }
  } catch (err) {
    console.error('❌ Order error:', err);
    showNotification('error', err.message || 'Failed to process order.');
  } finally {
    setLoading(false);
        }
    
};


  // Handler for clearing the form
  const handleClearForm = () => {
    setFormData({
    user_id: '37',
    user_password: '',
    connection_id: '1',
    payment_method_id: '1',
    campaign_id: '1',
    offers: [
      { offer_id: 40, order_offer_quantity: 1 }
    ],
    currency_id: '1',
    email: '',
    phone: '',
    bill_fname: '',
    bill_lname: '',
    bill_organization: '',
    bill_country: '',
    bill_address1: '',
    bill_address2: '',
    bill_city: '',
    bill_state: '',
    bill_zipcode: '',
    shipping_same: true,
    ship_fname: '',
    ship_lname: '',
    ship_organization: '',
    ship_country: '',
    ship_address1: '',
    ship_address2: '',
    ship_city: '',
    ship_state: '',
    ship_zipcode: '',
    card_type_id: '',
    card_number: '',
    card_cvv: '',
    card_exp_month: '',
    card_exp_year: '',
    tracking1: 'SA',
    tracking2: '01',
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

   // Replace handleCloseMessage with unified version
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
    setTimerActive(false);
    setTimeLeft(60);
  };

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

  const months = [
    '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => String(currentYear + i));

    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <Grid container spacing={3}>
            {/* Personal Information Section */}
            <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Personal Information</Typography>
            <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
            <TextField
                required
                fullWidth
                label="First Name"
                name="bill_fname"
                value={formData.bill_fname}
                onChange={handleChange}
                // error={!!errors.bill_fname}
                // helperText={errors.bill_fname}
                maxLength={30}
            />
            </Grid>
            <Grid item xs={12} sm={6}>
            <TextField
                required
                fullWidth
                label="Last Name"
                name="bill_lname"
                value={formData.bill_lname}
                onChange={handleChange}
                // error={!!errors.bill_lname}
                // helperText={errors.bill_lname}
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
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                maxLength={512}
            />
            </Grid>
            {/* Remove User Password field from the form UI */}

            {/* Billing Address Section */}
            <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Billing Address</Typography>
            <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
            <TextField
                required
                fullWidth
                label="Country"
                name="bill_country"
                value={formData.bill_country}
                onChange={handleChange}
                // error={!!errors.bill_country}
                // helperText={errors.bill_country}
                maxLength={50}
            />
            </Grid>
            <Grid item xs={12} sm={6}>
            <TextField
                fullWidth
                label="Organization (Optional)"
                name="bill_organization"
                value={formData.bill_organization}
                onChange={handleChange}
                maxLength={56}
            />
            </Grid>
            <Grid item xs={12}>
            <TextField
                required
                fullWidth
                label="Address Line 1"
                name="bill_address1"
                value={formData.bill_address1}
                onChange={handleChange}
                maxLength={50}
            />
            </Grid>
            <Grid item xs={12}>
            <TextField
                fullWidth
                label="Address Line 2 (Optional)"
                name="bill_address2"
                value={formData.bill_address2}
                onChange={handleChange}
                maxLength={50}
            />
            </Grid>
            <Grid item xs={12} sm={4}>
            <TextField
                required
                fullWidth
                label="City"
                name="bill_city"
                value={formData.bill_city}
                onChange={handleChange}
                maxLength={30}
            />
            </Grid>
            <Grid item xs={12} sm={4}>
            <TextField
                required
                fullWidth
                label="State"
                name="bill_state"
                value={formData.bill_state}
                onChange={handleChange}
                // error={!!errors.bill_state}
                // helperText={errors.bill_state}
                maxLength={30}
            />
            </Grid>
            <Grid item xs={12} sm={4}>
            <TextField
                required
                fullWidth
                label="ZIP Code"
                name="bill_zipcode"
                value={formData.bill_zipcode}
                onChange={handleChange}
                // error={!!errors.bill_zipcode}
                // helperText={errors.bill_zipcode}
                maxLength={10}
            />
            </Grid>

            {/* Shipping Address Section (conditionally rendered) */}
            {!formData.shipping_same && (
            <>
                <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Shipping Address</Typography>
                <Divider sx={{ mb: 2 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField
                    required
                    fullWidth
                    label="First Name"
                    name="ship_fname"
                    value={formData.ship_fname}
                    onChange={handleChange}
                    // error={!!errors.ship_fname}
                    // helperText={errors.ship_fname}
                    maxLength={30}
                />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField
                    required
                    fullWidth
                    label="Last Name"
                    name="ship_lname"
                    value={formData.ship_lname}
                    onChange={handleChange}
                    // error={!!errors.ship_lname}
                    // helperText={errors.ship_lname}
                    imaxLength={30}
                />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="Organization (Optional)"
                    name="ship_organization"
                    value={formData.ship_organization}
                    onChange={handleChange}
                    maxLength={56}
                />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField
                    required
                    fullWidth
                    label="Country"
                    name="ship_country"
                    value={formData.ship_country}
                    onChange={handleChange}
                    // error={!!errors.ship_country}
                    // helperText={errors.ship_country}
                    maxLength={56}
                />
                </Grid>
                <Grid item xs={12}>
                <TextField
                    required
                    fullWidth
                    label="Address Line 1"
                    name="ship_address1"
                    value={formData.ship_address1}
                    onChange={handleChange}
                    maxLength={50}
                />
                </Grid>
                <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Address Line 2 (Optional)"
                    name="ship_address2"
                    value={formData.ship_address2}
                    onChange={handleChange}
                    maxLength={50}
                />
                </Grid>
                <Grid item xs={12} sm={4}>
                <TextField
                    required
                    fullWidth
                    label="City"
                    name="ship_city"
                    value={formData.ship_city}
                    onChange={handleChange}
                    maxLength={30}
                />
                </Grid>
                <Grid item xs={12} sm={4}>
                <TextField
                    required
                    fullWidth
                    label="State"
                    name="ship_state"
                    value={formData.ship_state}
                    onChange={handleChange}
                    maxLength={30}
                />
                </Grid>
                <Grid item xs={12} sm={4}>
                <TextField
                    required
                    fullWidth
                    label="ZIP Code"
                    name="ship_zipcode"
                    value={formData.ship_zipcode}
                    onChange={handleChange}
                    maxLength={10}
                />
                </Grid>
            </>
            )}

            {/* Toggle for shipping_same */}
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <FormControlLabel
                    control={
                        <Switch
                        checked={formData.shipping_same}
                        onChange={(e) =>
                            setFormData((prev) => ({
                            ...prev,
                            shipping_same: e.target.checked,
                            }))
                        }
                        name="shipping_same"
                        color="primary"
                        />
                    }
                    label="Shipping address same as billing address"
                    />
                </FormControl>
            </Grid>


            {/* Payment Information Section */}
            <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Payment Information</Typography>
            <Divider sx={{ mb: 2 }} />
            </Grid>
            {formData.payment_method_id === '1' && (
            <>
                <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.card_type_id}>
                    <InputLabel>Card Type</InputLabel>
                    <Select
                    name="card_type_id"
                    value={formData.card_type_id}
                    onChange={handleChange}
                    label="Card Type"
                    >
                    <MenuItem value="1">Mastercard</MenuItem>
                    <MenuItem value="2">Visa</MenuItem>
                    <MenuItem value="3">Discover</MenuItem>
                    <MenuItem value="4">American Express</MenuItem>
                    </Select>
                    {errors.card_type_id && (
                    <Typography color="error" variant="caption">
                        {errors.card_type_id}
                    </Typography>
                    )}
                </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField
                    required
                    fullWidth
                    label="Card Number"
                    name="card_number"
                    value={formData.card_number}
                    onChange={handleChange}
                    error={!!errors.card_number}
                    helperText={errors.card_number}
                    // inputProps={{ maxLength: 16 }}
                />
                </Grid>
                <Grid item xs={12} sm={4}>
                <TextField
                    required
                    fullWidth
                    label="CVV"
                    name="card_cvv"
                    value={formData.card_cvv}
                    onChange={handleChange}
                    error={!!errors.card_cvv}
                    helperText={errors.card_cvv}
                    inputProps={{ maxLength: 4 }}
                />
                </Grid>
                <Grid item xs={12} sm={4}>
                <FormControl fullWidth required error={!!errors.card_exp_month}>
                    <InputLabel>Exp Month</InputLabel>
                    <Select
                    name="card_exp_month"
                    value={formData.card_exp_month}
                    onChange={handleChange}
                    label="Exp Month"
                    >
                    {months.map(month => (
                        <MenuItem key={month} value={month}>{month}</MenuItem>
                    ))}
                    </Select>
                    {errors.card_exp_month && (
                    <Typography color="error" variant="caption">
                        {errors.card_exp_month}
                    </Typography>
                    )}
                </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                <TextField
                    required
                    fullWidth
                    label="Exp Year (YYYY)"
                    name="card_exp_year"
                    value={formData.card_exp_year}
                    onChange={handleChange}
                    error={!!errors.creditCardExpiration}
                    helperText={errors.creditCardExpiration || "Format: YYYY (2025)"}
                    inputProps={{
                        maxLength: 4,
                        pattern: "[0-9]*"
              }}
            />
                </Grid>
            </>
            )}

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

export default SubProjectOrderForm;
