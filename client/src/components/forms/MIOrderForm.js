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
  LinearProgress,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox
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

// Restricted states for MI project
const restrictedStates = ['IA', 'WI', 'MS', 'MN'];

const MIOrderForm = ({ onOrderSuccess }) => {
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
    callDate: new Date(),
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: '',
    checkingAccountName: '',
    bankName: '',
    routingNumber: '',
    checkingAccountNumber: '',
    authorizedSigner: 'YES',
    ageConfirmation: 'YES',
    email: '',
    dateOfBirth: new Date(),
    consent: {
      benefitsIdTheft: false,
      myTelemedicine: false
    }
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
      callDate: date
    }));
  };

  const handleDateOfBirthChange = (date) => {
    setFormData(prev => ({
      ...prev,
      dateOfBirth: date
    }));
  };

  const handleConsentChange = (service) => {
    setFormData(prev => ({
      ...prev,
      consent: {
        ...prev.consent,
        [service]: !prev.consent[service]
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic required field validation
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.address1) newErrors.address1 = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.checkingAccountName) newErrors.checkingAccountName = 'Name on account is required';
    if (!formData.bankName) newErrors.bankName = 'Bank name is required';
    if (!formData.routingNumber) newErrors.routingNumber = 'Routing number is required';
    if (!formData.checkingAccountNumber) newErrors.checkingAccountNumber = 'Account number is required';
    if (!formData.email) newErrors.email = 'Email is required';

    // Special validation for callDate
    if (!formData.callDate || !(formData.callDate instanceof Date) || isNaN(formData.callDate.getTime())) {
      newErrors.callDate = 'Please select a valid call date';
    }

    // Special validation for dateOfBirth
    if (!formData.dateOfBirth || !(formData.dateOfBirth instanceof Date) || isNaN(formData.dateOfBirth.getTime())) {
      newErrors.dateOfBirth = 'Please select a valid date of birth';
    }

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    // Routing number validation (9 digits)
    if (formData.routingNumber && !/^\d{9}$/.test(formData.routingNumber)) {
      newErrors.routingNumber = 'Please enter a valid 9-digit routing number';
    }

    // Checking account number validation (10-12 digits)
    if (formData.checkingAccountNumber && !/^\d{10,12}$/.test(formData.checkingAccountNumber)) {
      newErrors.checkingAccountNumber = 'Please enter a valid 10-12 digit account number';
    }

    // Age confirmation validation
    if (formData.ageConfirmation !== 'YES') {
      newErrors.ageConfirmation = 'Must state YES and be between 18-90';
    }

    // Authorized signer validation
    if (formData.authorizedSigner !== 'YES') {
      newErrors.authorizedSigner = 'Must confirm YES that customer is an authorized signer';
    }

    // Consent validation - at least one service must be selected
    const consentValues = Object.values(formData.consent);
    if (!consentValues.some(value => value === true)) {
      newErrors.consent = 'Must select at least one service for trial enrollments & billing consent';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

    // Check if state is restricted
    if (restrictedStates.includes(formData.state)) {
      showNotification('error', 'Orders cannot be placed for customers in restricted states');
      setLoading(false);
      return;
    }

    // Store form data before clearing
    const formDataToSubmit = {
      ...formData,
      callDate: format(formData.callDate, 'MM/dd/yyyy'),
      dateOfBirth: format(formData.dateOfBirth, 'MM/dd/yyyy')
    };

    try {
      console.log('Starting MI order submission process...');
      console.log('Form data:', {
        ...formDataToSubmit,
        routingNumber: formDataToSubmit.routingNumber.replace(/\d(?=\d{4})/g, '*'),
        checkingAccountNumber: formDataToSubmit.checkingAccountNumber.replace(/\d(?=\d{4})/g, '*')
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/mi`, {
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
        throw new Error(data.message || 'Failed to create MI order');
      }

      showNotification('success', 'MI Order created successfully!');
    } catch (err) {
      console.error('Error submitting MI order:', err);
      showNotification('error', err.message || 'Failed to create MI order');
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
      callDate: new Date(),
      firstName: '',
      lastName: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      phoneNumber: '',
      checkingAccountName: '',
      bankName: '',
      routingNumber: '',
      checkingAccountNumber: '',
      authorizedSigner: 'YES',
      ageConfirmation: 'YES',
      email: '',
      dateOfBirth: new Date(),
      consent: {
        benefitsIdTheft: false,
        myTelemedicine: false
      }
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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          MI Project Order Form
        </Typography>

        <Grid container spacing={3}>
          {/* Date of Call at the top */}
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Date of Call"
              value={formData.callDate}
              onChange={handleDateChange}
              openTo="year"
              views={["year", "month", "day"]}
              disableFuture
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  error={!!errors.callDate}
                  helperText={errors.callDate}
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
              error={!!errors.firstName}
              helperText={errors.firstName}
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
              error={!!errors.lastName}
              helperText={errors.lastName}
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
              error={!!errors.phoneNumber}
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
              maxLength={512}
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChange={handleDateOfBirthChange}
              openTo="year"
              views={["year", "month", "day"]}
              disableFuture
              minDate={new Date(1900, 0, 1)}
              maxDate={new Date()}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth}
                />
              )}
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
              error={!!errors.address1}
              helperText={errors.address1}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address Line 2 (Optional)"
              name="address2"
              value={formData.address2}
              onChange={handleChange}
              maxLength={50}
              helperText="Apartment, suite, etc. (optional)"
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
              error={!!errors.city}
              helperText={errors.city}
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
              error={!!errors.zipCode}
            />
          </Grid>

          {/* Checking Account Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Checking Account Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Name on Account"
              name="checkingAccountName"
              value={formData.checkingAccountName}
              onChange={handleChange}
              maxLength={50}
              error={!!errors.checkingAccountName}
              helperText={errors.checkingAccountName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Bank Name"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              maxLength={50}
              error={!!errors.bankName}
              helperText={errors.bankName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Routing Number"
              name="routingNumber"
              value={formData.routingNumber}
              onChange={handleChange}
              inputProps={{ 
                pattern: '[0-9]{9}',
                maxLength: 9
              }}
              helperText="Enter 9-digit routing number"
              error={!!errors.routingNumber}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Checking Account Number"
              name="checkingAccountNumber"
              value={formData.checkingAccountNumber}
              onChange={handleChange}
              inputProps={{ 
                pattern: '[0-9]{10,12}',
                maxLength: 12
              }}
              helperText="Enter 10-12 digit account number"
              error={!!errors.checkingAccountNumber}
            />
          </Grid>

          {/* Confirmations and Consents */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Confirmations and Consents
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl required error={!!errors.authorizedSigner}>
              <FormLabel>Confirmation that customer is an authorized signer</FormLabel>
              <RadioGroup
                row
                name="authorizedSigner"
                value={formData.authorizedSigner}
                onChange={handleChange}
              >
                <FormControlLabel value="YES" control={<Radio />} label="YES" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </RadioGroup>
              {errors.authorizedSigner && (
                <FormHelperText>{errors.authorizedSigner}</FormHelperText>
              )}
            </FormControl>
          </Grid>
                     <Grid item xs={12} sm={6}>
             <FormControl required error={!!errors.ageConfirmation}>
               <FormLabel>Age Confirmation</FormLabel>
               <RadioGroup
                 row
                 name="ageConfirmation"
                 value={formData.ageConfirmation}
                 onChange={handleChange}
               >
                 <FormControlLabel value="YES" control={<Radio />} label="YES" />
               </RadioGroup>
               <FormHelperText>Must confirm YES and be between 18-90</FormHelperText>
               {errors.ageConfirmation && (
                 <FormHelperText>{errors.ageConfirmation}</FormHelperText>
               )}
             </FormControl>
           </Grid>
          <Grid item xs={12}>
            <FormControl required error={!!errors.consent}>
              <FormLabel>Consent/Authorization for trial enrollments & billing</FormLabel>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Select the services you consent to for trial enrollments & billing:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.consent.benefitsIdTheft}
                        onChange={() => handleConsentChange('benefitsIdTheft')}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Benefits Savings + ID Theft Protection
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Trial applies to both; billed per combined offer
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.consent.myTelemedicine}
                        onChange={() => handleConsentChange('myTelemedicine')}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          My Telemedicine
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          $3.29 trial → $39.95 monthly
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
              {errors.consent && (
                <FormHelperText>{errors.consent}</FormHelperText>
              )}
            </FormControl>
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
              {loading ? 'Submitting...' : 'Submit MI Order'}
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

export default MIOrderForm;
