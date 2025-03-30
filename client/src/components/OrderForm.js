import React, { useState, useContext } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Alert,
  MenuItem,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  Paper,
  Divider
} from '@mui/material';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

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

// Restricted states based on requirements
const restrictedStates = ['IA', 'ME', 'MN', 'UT', 'VT', 'WI'];

// Validation schema
const OrderSchema = Yup.object().shape({
  orderDate: Yup.string()
    .required('Order date is required'),
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'First name is too short'),
  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name is too short'),
  address1: Yup.string()
    .required('Address is required'),
  address2: Yup.string(),
  city: Yup.string()
    .required('City is required'),
  state: Yup.string()
    .required('State is required')
    .notOneOf(restrictedStates, 'Orders from this state cannot be accepted'),
  zipCode: Yup.string()
    .required('Zip code is required')
    .matches(/^\d{5}(-\d{4})?$/, 'Invalid zip code format'),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^\d{10}$/, 'Phone number must be 10 digits'),
  email: Yup.string()
    .email('Invalid email address'),
  sourceCode: Yup.string()
    .required('Source code is required')
    .default('R4N'),
  sku: Yup.string()
    .required('SKU is required')
    .default('F11'),
  productName: Yup.string()
    .required('Product name is required'),
  sessionId: Yup.string()
    .required('Session ID is required'),
  creditCardNumber: Yup.string()
    .required('Credit card number is required')
    .matches(/^\d{16}$/, 'Credit card must be 16 digits'),
  creditCardExpiration: Yup.string()
    .required('Expiration date is required')
    .matches(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, 'Format must be MMYY'),
  voiceRecordingId: Yup.string()
});

const OrderForm = ({ onOrderSubmit, onOrderSuccess }) => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const { token } = useContext(AuthContext);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Generate a random session ID
  const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setError('');
      setValidationError(null);
      setSubmitAttempted(true);
      
      // Generate a session ID if not already present
      const sessionId = values.sessionId || generateSessionId();
      
      // Format the values properly
      const formattedOrderData = {
        ...values,
        sessionId,
        orderDate: new Date().toISOString(), // Just use current date
        creditCardExpiration: values.creditCardExpiration.replace('/', '') // Remove any slash if entered
      };
      
      // Send data to server API
      const response = await axios.post('/api/orders', formattedOrderData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Set order data with the response
      setOrderData(response.data.data);
      setSuccess('Order submitted successfully!');
      
      // Call the parent component's callback
      if (onOrderSuccess) {
        onOrderSuccess(response.data.data);
      }
      
      // Reset form
      resetForm();
      setSubmitAttempted(false);
    } catch (err) {
      console.error('Error details:', err);
      
      // Handle validation errors from Radius API
      if (err.response?.data?.validation) {
        setValidationError({
          message: err.response.data.message,
          details: err.response.data.validation
        });
        
        // We still set the order data if the server returned it
        if (err.response.data.data) {
          setOrderData(err.response.data.data);
        }
      } else {
        setError(err.response?.data?.message || 'Failed to submit order. Please check your form data.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Format today's date as YYYY-MM-DD for the date input
  const today = new Date().toISOString().split('T')[0];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Submit New Order
      </Typography>
      
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'rgba(236, 64, 122, 0.05)',
          borderRadius: '10px',
          border: '1px solid rgba(236, 64, 122, 0.1)',
        }}
      >
        <Typography variant="subtitle1" color="error" gutterBottom>
          Order Restrictions
        </Typography>
        <Typography variant="body2">
          We cannot accept orders from the following states: Iowa (IA), Maine (ME), Minnesota (MN), Utah (UT), Vermont (VT), Wisconsin (WI), or from outside the US.
        </Typography>
        <Typography variant="body2" mt={1}>
          We also cannot accept prepaid credit cards or orders from existing customers with active subscriptions.
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {validationError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {validationError.message}
          </Typography>
          {validationError.details.reason && (
            <Typography variant="body2">
              Reason: {validationError.details.reason}
            </Typography>
          )}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Formik
        initialValues={{
          orderDate: today,
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
          sessionId: generateSessionId(), // Pre-generate a session ID
          creditCardNumber: '',
          creditCardExpiration: '',
          voiceRecordingId: ''
        }}
        validationSchema={OrderSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => (
          <Form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Customer Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Field name="orderDate">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="date"
                      label="Order Date"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      error={touched.orderDate && Boolean(errors.orderDate)}
                      helperText={touched.orderDate && errors.orderDate}
                    />
                  )}
                </Field>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Field name="firstName">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="First Name"
                      error={touched.firstName && Boolean(errors.firstName)}
                      helperText={touched.firstName && errors.firstName}
                    />
                  )}
                </Field>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Field name="lastName">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Last Name"
                      error={touched.lastName && Boolean(errors.lastName)}
                      helperText={touched.lastName && errors.lastName}
                    />
                  )}
                </Field>
              </Grid>
              
              <Grid item xs={12}>
                <Field name="address1">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Address 1"
                      error={touched.address1 && Boolean(errors.address1)}
                      helperText={touched.address1 && errors.address1}
                    />
                  )}
                </Field>
              </Grid>
              
              <Grid item xs={12}>
                <Field name="address2">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Address 2"
                      error={touched.address2 && Boolean(errors.address2)}
                      helperText={touched.address2 && errors.address2}
                    />
                  )}
                </Field>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Field name="city">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="City"
                      error={touched.city && Boolean(errors.city)}
                      helperText={touched.city && errors.city}
                    />
                  )}
                </Field>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth error={touched.state && Boolean(errors.state)}>
                  <InputLabel id="state-select-label">State</InputLabel>
                  <Field name="state">
                    {({ field }) => (
                      <Select
                        {...field}
                        labelId="state-select-label"
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
                    )}
                  </Field>
                  {touched.state && errors.state && (
                    <FormHelperText>{errors.state}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Field name="zipCode">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Zip Code"
                      error={touched.zipCode && Boolean(errors.zipCode)}
                      helperText={touched.zipCode && errors.zipCode}
                    />
                  )}
                </Field>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Field name="phoneNumber">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Phone Number"
                      error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                      helperText={touched.phoneNumber && errors.phoneNumber}
                    />
                  )}
                </Field>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Field name="email">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email Address (Optional)"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  )}
                </Field>
              </Grid>
              
              <Grid item xs={12}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mt: 3, 
                    mb: 1, 
                    fontWeight: 600, 
                    color: 'primary.main',
                    fontSize: '18px',
                    paddingBottom: '8px',
                    borderBottom: '2px solid rgba(69, 104, 220, 0.3)',
                    display: 'inline-block'
                  }}
                >
                  Product Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Field name="sourceCode">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Source Code"
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  )}
                </Field>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Field name="sku">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="SKU"
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  )}
                </Field>
              </Grid>
              
              <Grid item xs={12}>
                <Field name="productName">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Product Name"
                      placeholder="Descriptive information about the product"
                      error={touched.productName && Boolean(errors.productName)}
                      helperText={touched.productName && errors.productName}
                    />
                  )}
                </Field>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Field name="sessionId">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Session ID"
                      error={touched.sessionId && Boolean(errors.sessionId)}
                      helperText={touched.sessionId && errors.sessionId}
                    />
                  )}
                </Field>
              </Grid>
              
              <Grid item xs={12}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mt: 3, 
                    mb: 1, 
                    fontWeight: 600, 
                    color: 'primary.main',
                    fontSize: '18px',
                    paddingBottom: '8px',
                    borderBottom: '2px solid rgba(69, 104, 220, 0.3)',
                    display: 'inline-block'
                  }}
                >
                  Payment Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Field name="creditCardNumber">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Credit Card Number"
                      error={touched.creditCardNumber && Boolean(errors.creditCardNumber)}
                      helperText={touched.creditCardNumber && errors.creditCardNumber}
                    />
                  )}
                </Field>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Field name="creditCardExpiration">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Credit Card Expiration (MMYY)"
                      placeholder="MMYY"
                      error={touched.creditCardExpiration && Boolean(errors.creditCardExpiration)}
                      helperText={touched.creditCardExpiration && errors.creditCardExpiration}
                    />
                  )}
                </Field>
              </Grid>
              
              <Grid item xs={12}>
                <Field name="voiceRecordingId">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Voice Recording ID (Optional)"
                      error={touched.voiceRecordingId && Boolean(errors.voiceRecordingId)}
                      helperText={touched.voiceRecordingId && errors.voiceRecordingId}
                    />
                  )}
                </Field>
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  disabled={isSubmitting}
                  sx={{
                    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                  }}
                  fullWidth
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Order'}
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
      
      {orderData && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Order Details (Preview)
          </Typography>
          <Paper sx={{ p: 2, background: 'rgba(255, 255, 255, 0.9)' }}>
            <pre>{JSON.stringify(orderData, null, 2)}</pre>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default OrderForm; 