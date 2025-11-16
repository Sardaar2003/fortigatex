import React, { useState, useContext, useEffect, useMemo } from 'react';
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
  Alert,
  IconButton,
  LinearProgress,
  FormHelperText
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AuthContext } from '../../context/AuthContext';
import {
  PSONLINE_REJECTED_BINS,
  PSONLINE_REJECTED_STATES
} from '../../constants/binLists';

const PSONLINEOrderForm = ({ onOrderSuccess }) => {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [formData, setFormData] = useState({
    selectedProducts: [], // Array of selected products
    amount: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    secondaryPhone: '',
    dob: null,
    gender: '',
    streetAddress: '',
    apt: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const getFieldErrorStyles = (hasError) =>
    hasError
      ? {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(244, 67, 54, 0.12)',
            '& fieldset': { borderColor: 'error.main' },
            '&:hover fieldset': { borderColor: 'error.dark' },
            '&.Mui-focused fieldset': { borderColor: 'error.main' }
          },
          '& .MuiInputLabel-root': {
            color: 'error.main !important'
          }
        }
      : {};

  const clearFieldError = (field) => {
    setFieldErrors(prev => {
      if (!prev[field]) {
        return prev;
      }
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  // Timer effect for notification
  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setSnackbar(prev => ({ ...prev, open: false }));
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const rejectedStates = PSONLINE_REJECTED_STATES;
  const rejectedBinSet = useMemo(
    () => new Set(PSONLINE_REJECTED_BINS),
    []
  );

  // All US states for dropdown
  const allStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const products = [
    { id: 43, name: 'ID Theft', price: 3.82 },
    { id: 46, name: 'Telemed', price: 3.78 }
  ];

  const handleProductChange = (event) => {
    const selectedValues = event.target.value;
    const selectedProductObjects = products.filter(p => selectedValues.includes(p.id));
    
    const totalAmount = selectedProductObjects.reduce((sum, product) => sum + product.price, 0);
    
    setFormData(prev => ({
      ...prev,
      selectedProducts: selectedValues,
      amount: totalAmount
    }));
    clearFieldError('selectedProducts');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearFieldError(name);
  };

  const handleDateChange = (name) => (date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
    clearFieldError(name);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
    setTimerActive(false);
    setTimeLeft(60);
  };

  const showNotification = (severity, message) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
    setTimeLeft(60);
    setTimerActive(true);
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearForm = () => {
    setFormData({
      selectedProducts: [],
      amount: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      secondaryPhone: '',
      dob: null,
      gender: '',
      streetAddress: '',
      apt: '',
      city: '',
      state: '',
      zipCode: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: ''
    });
    setFieldErrors({});
  };

  // Generate month and year options
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i);

  const validateForm = () => {
    const errors = {};
    const trimmedFirstName = formData.firstName.trim();
    const trimmedLastName = formData.lastName.trim();
    const trimmedStreet = formData.streetAddress.trim();
    const trimmedApt = formData.apt.trim();
    const trimmedCity = formData.city.trim();
    const trimmedState = formData.state.trim().toUpperCase();
    const trimmedZip = formData.zipCode.trim();
    const trimmedEmail = formData.email.trim();
    const primaryPhoneDigits = formData.phone.replace(/\D/g, '');
    const secondaryPhoneDigits = formData.secondaryPhone.replace(/\D/g, '');
    const sanitizedCardNumber = formData.cardNumber.replace(/\s/g, '');

    if (!formData.selectedProducts.length) {
      errors.selectedProducts = 'Select at least one product';
    }

    if (!trimmedFirstName) {
      errors.firstName = 'First name is required';
    } else if (trimmedFirstName.length > 30) {
      errors.firstName = 'First name must be 30 characters or fewer';
    }

    if (!trimmedLastName) {
      errors.lastName = 'Last name is required';
    } else if (trimmedLastName.length > 30) {
      errors.lastName = 'Last name must be 30 characters or fewer';
    }

    if (!trimmedStreet) {
      errors.streetAddress = 'Street address is required';
    } else if (trimmedStreet.length > 50) {
      errors.streetAddress = 'Street address must be 50 characters or fewer';
    }

    if (trimmedApt && trimmedApt.length > 50) {
      errors.apt = 'Apt/Suite must be 50 characters or fewer';
    }

    if (!trimmedCity) {
      errors.city = 'City is required';
    } else if (trimmedCity.length > 30) {
      errors.city = 'City must be 30 characters or fewer';
    }

    if (!trimmedState) {
      errors.state = 'State is required';
    } else if (trimmedState.length !== 2) {
      errors.state = 'State must be exactly 2 characters';
    } else if (rejectedStates.includes(trimmedState)) {
      errors.state = `Orders from ${trimmedState} are not currently accepted. Please contact support for assistance.`;
    }

    if (!trimmedZip) {
      errors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(\d{4})?$/.test(trimmedZip)) {
      errors.zipCode = 'ZIP code must be 5 or 9 digits';
    }

    if (!primaryPhoneDigits) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(primaryPhoneDigits)) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }

    if (formData.secondaryPhone && !/^\d{10}$/.test(secondaryPhoneDigits)) {
      errors.secondaryPhone = 'Secondary phone must be exactly 10 digits';
    }

    if (!trimmedEmail) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Invalid email format';
    }

    if (formData.dob) {
      const dobDate = new Date(formData.dob);
      if (Number.isNaN(dobDate.getTime())) {
        errors.dob = 'Date of birth must be valid';
      }
    }

    if (formData.gender && !['M', 'F'].includes(formData.gender)) {
      errors.gender = 'Gender must be M or F';
    }

    if (!sanitizedCardNumber) {
      errors.cardNumber = 'Card number is required';
    } else if (!/^\d{15,16}$/.test(sanitizedCardNumber)) {
      errors.cardNumber = 'Card number must be 15 or 16 digits';
    } else if (rejectedBinSet.has(sanitizedCardNumber.substring(0, 6))) {
      errors.cardNumber = 'This card type is not currently accepted. Please use a different payment method.';
    }

    if (!formData.expiryMonth) {
      errors.expiryMonth = 'Expiry month is required';
    }

    if (!formData.expiryYear) {
      errors.expiryYear = 'Expiry year is required';
    }

    if (!formData.cvv) {
      errors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      errors.cvv = 'CVV must be 3 or 4 digits';
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      errors.selectedProducts = errors.selectedProducts || 'Select at least one product';
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      showNotification('error', 'Please fix the highlighted fields before submitting.');
      setLoading(false);
      return;
    }

    setFieldErrors({});
    
    console.log('=== PSOnline Order Form Submission Started ===');
    console.log('Form data before processing:', formData);
    
    try {
      // Format dates to MM/DD/YYYY
      const formatDate = (date) => {
        if (!date) return '';
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      };

      console.log('Building order data...');
      console.log('Current domain:', window.location.hostname);
      console.log('Selected products:', formData.selectedProducts);
      
      // Get selected product objects
      const selectedProductObjects = products.filter(p => formData.selectedProducts.includes(p.id));
      console.log('Selected product objects:', selectedProductObjects);
      
      const trimmedFirstName = formData.firstName.trim();
      const trimmedLastName = formData.lastName.trim();
      const trimmedStreet = formData.streetAddress.trim();
      const trimmedApt = formData.apt.trim();
      const trimmedCity = formData.city.trim();
      const trimmedZip = formData.zipCode.trim();
      const trimmedEmail = formData.email.trim();

      const orderData = {
        domain: 'fortigatex.onrender.com', // Domain without https://
        buildorder: 1, // Set to 0 for preauthorization only
        capture_delay: 0,
        card_num: formData.cardNumber.replace(/\s/g, ''),
        card_expm: formData.expiryMonth,
        card_expy: formData.expiryYear,
        card_cvv: formData.cvv,
        CustomerFirstName: trimmedFirstName,
        CustomerLastName: trimmedLastName,
        BillingStreetAddress: trimmedStreet,
        BillingApt: trimmedApt,
        BillingCity: trimmedCity,
        BillingState: formData.state.toUpperCase(),
        BillingZipCode: trimmedZip,
        Email: trimmedEmail,
        BillingHomePhone: formData.phone.replace(/\D/g, '').slice(0, 10), // Ensure 10 digits
        amount: formData.amount,
        ProductCount: selectedProductObjects.length,
        DOB: formData.dob ? formatDate(formData.dob) : '',
        Gender: formData.gender,
        FormOfPayment: 'card'
      };
      
      // Add product fields for each selected product
      selectedProductObjects.forEach((product, index) => {
        const productNumber = index + 1;
        orderData[`productid_${productNumber}`] = product.id;
        orderData[`productqty_${productNumber}`] = 1; // Always 1 as per requirement
      });

      // console.log('Order data built:', {
      //   ...orderData,
      //   card_num: orderData.card_num ? `${orderData.card_num.substring(0, 4)}****${orderData.card_num.substring(-4)}` : 'Missing',
      //   card_cvv: orderData.card_cvv ? '***' : 'Missing'
      // });

      console.log('All validations passed, sending request to backend...');
      console.log('Request URL:', '/api/orders/psonline');
      console.log('Full URL:', `${process.env.REACT_APP_API_URL}/api/orders/psonline`);
      console.log('Auth token present:', !!token);
      console.log('Request payload (masked):', {
        ...orderData,
        card_num: orderData.card_num ? `${orderData.card_num.substring(0, 4)}****${orderData.card_num.substring(-4)}` : 'Missing',
        card_cvv: '***'
      });
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/psonline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      console.log('=== Backend Response ===');
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      // Extract message from PSOnline response
      if (data.rawPSOnlineResponse) {
        console.log('=== RAW PSOnline API Response ===');
        console.log('Raw response:', data.rawPSOnlineResponse);
        console.log('Response type:', typeof data.rawPSOnlineResponse);
        console.log('Response as string:', JSON.stringify(data.rawPSOnlineResponse, null, 2));
        console.log('================================');
        
        // Extract the actual message from PSOnline response
        const psOnlineResponse = data.rawPSOnlineResponse;
        let message = '';
        let severity = 'info';
        
        // Check if it's a success or failure based on ResponseCode
        if (psOnlineResponse.ResponseCode === 200 || psOnlineResponse.ResponseCode === 0) {
          // Success case
          message = psOnlineResponse.ResponseData || 'Order processed successfully!';
          severity = 'success';
        } else {
          // Failure case
          message = psOnlineResponse.ResponseData || 'Order processing failed';
          severity = 'error';
        }
        
        showNotification(severity, message);
      } else {
        showNotification('warning', 'No PSOnline response received');
      }
    } catch (error) {
      console.error('=== PSOnline Order Submission Error ===');
      console.error('Error message:', error.message);
      console.error('Full error object:', error);
      
      // Display the raw error response
      let errorMessage = error.message;
      
      // For fetch errors, we need to handle them differently than axios
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Network error: Unable to connect to the server';
      }
      
      showNotification('error', errorMessage || 'An error occurred while processing your order');
    } finally {
      console.log('=== PSOnline Order Form Submission Ended ===');
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
            <FormControl
              fullWidth
              required
              error={!!fieldErrors.selectedProducts}
              sx={getFieldErrorStyles(!!fieldErrors.selectedProducts)}
            >
              <InputLabel>Select Products</InputLabel>
              <Select
                multiple
                value={formData.selectedProducts}
                onChange={handleProductChange}
                label="Select Products"
                required
                renderValue={(selected) => {
                  const selectedNames = products
                    .filter(p => selected.includes(p.id))
                    .map(p => `${p.name} - $${p.price}`)
                    .join(', ');
                  return selectedNames;
                }}
              >
                {products.map(product => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name} - ${product.price}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.selectedProducts && (
                <FormHelperText>{fieldErrors.selectedProducts}</FormHelperText>
              )}
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
            error={!!fieldErrors.firstName}
            helperText={fieldErrors.firstName}
            sx={getFieldErrorStyles(!!fieldErrors.firstName)}
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
            error={!!fieldErrors.lastName}
            helperText={fieldErrors.lastName}
            sx={getFieldErrorStyles(!!fieldErrors.lastName)}
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
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
            sx={getFieldErrorStyles(!!fieldErrors.email)}
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
            error={!!fieldErrors.phone}
            helperText={fieldErrors.phone}
            sx={getFieldErrorStyles(!!fieldErrors.phone)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Secondary Phone (Optional)"
              name="secondaryPhone"
              value={formData.secondaryPhone}
              onChange={handleChange}
            error={!!fieldErrors.secondaryPhone}
            helperText={fieldErrors.secondaryPhone || 'Optional secondary phone number'}
            sx={getFieldErrorStyles(!!fieldErrors.secondaryPhone)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            {/* <DatePicker
              label="Date of Birth"
              value={formData.dob}
              onChange={handleDateChange('dob')}
              openTo="year"
              views={['year', 'month', 'day']}
              disableFuture
              minDate={new Date(1900, 0, 1)}
              maxDate={new Date()}
              renderInput={(params) => <TextField {...params} fullWidth />}
            /> */}
            <TextField
              label="Date of Birth"
              type="date"
              name="dob"
              value={formData.dob ? formData.dob.toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const value = e.target.value ? new Date(e.target.value) : null;
                setFormData(prev => ({
                  ...prev,
                  dob: value
                }));
                clearFieldError('dob');
              }}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              error={!!fieldErrors.dob}
              helperText={fieldErrors.dob}
              sx={getFieldErrorStyles(!!fieldErrors.dob)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl
              fullWidth
              error={!!fieldErrors.gender}
              sx={getFieldErrorStyles(!!fieldErrors.gender)}
            >
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
              {fieldErrors.gender && (
                <FormHelperText>{fieldErrors.gender}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Billing Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Billing Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
              Note: Orders from ME, IA, UT, MN, VT, KS, WI, and MO are not currently accepted.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Street Address"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleChange}
              error={!!fieldErrors.streetAddress}
              helperText={fieldErrors.streetAddress}
              sx={getFieldErrorStyles(!!fieldErrors.streetAddress)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Apt/Suite"
              name="apt"
              value={formData.apt}
              onChange={handleChange}
              error={!!fieldErrors.apt}
              helperText={fieldErrors.apt}
              sx={getFieldErrorStyles(!!fieldErrors.apt)}
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
              error={!!fieldErrors.city}
              helperText={fieldErrors.city}
              sx={getFieldErrorStyles(!!fieldErrors.city)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl
              fullWidth
              required
              error={!!fieldErrors.state}
              sx={getFieldErrorStyles(!!fieldErrors.state)}
            >
              <InputLabel>State</InputLabel>
              <Select
                value={formData.state}
                onChange={handleChange}
                name="state"
                label="State"
              >
                {allStates.map(state => (
                  <MenuItem 
                    key={state} 
                    value={state}
                    disabled={rejectedStates.includes(state)}
                    sx={{
                      color: rejectedStates.includes(state) ? 'text.disabled' : 'inherit',
                      fontStyle: rejectedStates.includes(state) ? 'italic' : 'normal'
                    }}
                  >
                    {state} {rejectedStates.includes(state) && '(Not Available)'}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.state && (
                <FormHelperText>{fieldErrors.state}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="ZIP Code"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              error={!!fieldErrors.zipCode}
              helperText={fieldErrors.zipCode}
              sx={getFieldErrorStyles(!!fieldErrors.zipCode)}
            />
          </Grid>

          {/* Payment Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Payment Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
              Note: Certain card types may not be accepted. If your card is declined, please try a different payment method.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Card Number"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              error={!!fieldErrors.cardNumber}
              helperText={fieldErrors.cardNumber}
              sx={getFieldErrorStyles(!!fieldErrors.cardNumber)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl
              fullWidth
              required
              error={!!fieldErrors.expiryMonth}
              sx={getFieldErrorStyles(!!fieldErrors.expiryMonth)}
            >
              <InputLabel>Expiry Month</InputLabel>
              <Select
                value={formData.expiryMonth}
                onChange={handleChange}
                name="expiryMonth"
                label="Expiry Month"
              >
                {months.map(month => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.expiryMonth && (
                <FormHelperText>{fieldErrors.expiryMonth}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl
              fullWidth
              required
              error={!!fieldErrors.expiryYear}
              sx={getFieldErrorStyles(!!fieldErrors.expiryYear)}
            >
              <InputLabel>Expiry Year</InputLabel>
              <Select
                value={formData.expiryYear}
                onChange={handleChange}
                name="expiryYear"
                label="Expiry Year"
              >
                {years.map(year => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.expiryYear && (
                <FormHelperText>{fieldErrors.expiryYear}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="CVV"
              name="cvv"
              value={formData.cvv}
              onChange={handleChange}
              error={!!fieldErrors.cvv}
              helperText={fieldErrors.cvv}
              sx={getFieldErrorStyles(!!fieldErrors.cvv)}
            />
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={6}>
            <Button
              type="button"
              variant="outlined"
              fullWidth
              size="large"
              disabled={loading}
              onClick={handleClearForm}
            >
              Clear Form
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

export default PSONLINEOrderForm; 