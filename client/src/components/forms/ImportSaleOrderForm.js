import React, { useMemo, useState, useContext, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Divider,
  Snackbar,
  Alert,
  IconButton,
  LinearProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

const payMethods = [
  { value: 'CH', label: 'ACH / Checking' },
  { value: 'VS', label: 'Visa' },
  { value: 'MC', label: 'Mastercard' },
  { value: 'DS', label: 'Discover' },
  { value: 'AX', label: 'American Express' }
];

const ImportSaleOrderForm = ({ onOrderSuccess }) => {
  const { token } = useContext(AuthContext);

  const initialData = useMemo(() => ({
    firstName: '',
    lastName: '',
    billingName: '',
    email: '',
    homeArea: '',
    homePhone: '',
    billAddr1: '',
    billAddr2: '',
    billCity: '',
    billState: '',
    billZip: '',
    billCountry: 'US',
    payMethod: 'VS',
    acctNum: '',
    routeNum: '',
    credNum: '',
    credExp: '',
    cvv2: '',
    prodId: '',
    promoId: '',
    companyId: '',
    trackingId: crypto.randomUUID(),
    retNum: '',
    salesId: '',
    sourceId: '',
    orderSource: 'WEB'
  }), []);

  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    let timer;
    if (snackbar.open && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleCloseSnackbar();
    }
    return () => clearInterval(timer);
  }, [snackbar.open, timeLeft]);

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
    setErrors(prev => {
      if (!prev[field]) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearFieldError(name);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
    setTimeLeft(60);
  };

  const showNotification = (severity, message) => {
    setSnackbar({ open: true, severity, message });
    setTimeLeft(60);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearForm = () => {
    setFormData(initialData);
    setErrors({});
  };

  const validate = () => {
    const e = {};
    const required = [
      'firstName', 'lastName', 'billingName', 'email', 'homeArea', 'homePhone',
      'billAddr1', 'billCity', 'billState', 'billZip', 'billCountry', 'payMethod',
      'prodId', 'promoId', 'companyId', 'sourceId'
    ];
    required.forEach(f => {
      if (!formData[f]) e[f] = 'Required';
    });

    if (formData.homeArea && !/^[0-9]{3}$/.test(formData.homeArea)) {
      e.homeArea = 'Area code must be 3 digits';
    }
    if (formData.homePhone && !/^[0-9]{7}$/.test(formData.homePhone)) {
      e.homePhone = 'Phone must be 7 digits (no area code)';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = 'Invalid email';
    }
    if (formData.billZip && !/^\d{5}(\d{4})?$/.test(formData.billZip)) {
      e.billZip = 'ZIP must be 5 or 9 digits';
    }
    const method = formData.payMethod?.toUpperCase();
    if (method === 'CH') {
      if (!formData.acctNum) e.acctNum = 'Account number required';
      if (!formData.routeNum) e.routeNum = 'Routing number required';
      if (formData.routeNum && !/^\d{9}$/.test(formData.routeNum)) {
        e.routeNum = 'Routing must be 9 digits';
      }
    } else {
      if (!formData.credNum) e.credNum = 'Card number required';
      if (!formData.credExp) e.credExp = 'Exp required';
      if (!formData.cvv2) e.cvv2 = 'CVV required';
      if (formData.credNum && !/^\d{13,16}$/.test(formData.credNum)) {
        e.credNum = '13-16 digits';
      }
      if (formData.credExp && !/^(0[1-9]|1[0-2])\d{2}$/.test(formData.credExp)) {
        e.credExp = 'MMYY';
      }
      if (formData.cvv2 && !/^\d{3,4}$/.test(formData.cvv2)) {
        e.cvv2 = '3-4 digits';
      }
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      showNotification('error', 'Fix the highlighted fields');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        billState: formData.billState.toUpperCase(),
        payMethod: formData.payMethod.toUpperCase()
      };
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/import-sale`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        // Server already formats the upstream error as "Title: Detail"
        let msg = data.message || 'Order failed';
        if (typeof msg === 'object') msg = msg.message || msg.error || JSON.stringify(msg);
        showNotification('error', msg);
        return;
      }

      const successMsg = data.orderId
        ? `Success! Order ID: ${data.orderId}`
        : (data.message || 'Order created');

      showNotification('success', successMsg);
      if (onOrderSuccess) onOrderSuccess(data);
    } catch (err) {
      showNotification('error', err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const textField = (name, label, props = {}) => (
    <TextField
      fullWidth
      label={label}
      name={name}
      value={formData[name]}
      onChange={handleChange}
      error={!!errors[name]}
      helperText={errors[name]}
      sx={getFieldErrorStyles(!!errors[name])}
      {...props}
    />
  );

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        importSale Order Form
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Customer Info</Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        <Grid item xs={12} sm={6}>{textField('firstName', 'First Name')}</Grid>
        <Grid item xs={12} sm={6}>{textField('lastName', 'Last Name')}</Grid>
        <Grid item xs={12}>{textField('billingName', 'Billing Name')}</Grid>
        <Grid item xs={12} sm={6}>{textField('email', 'Email')}</Grid>
        <Grid item xs={6} sm={3}>{textField('homeArea', 'Area Code')}</Grid>
        <Grid item xs={6} sm={3}>{textField('homePhone', 'Phone (7 digits)')}</Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Billing Address</Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        <Grid item xs={12}>{textField('billAddr1', 'Address Line 1')}</Grid>
        <Grid item xs={12}>{textField('billAddr2', 'Address Line 2 (Optional)')}</Grid>
        <Grid item xs={12} sm={4}>{textField('billCity', 'City')}</Grid>
        <Grid item xs={12} sm={4}>{textField('billState', 'State')}</Grid>
        <Grid item xs={12} sm={4}>{textField('billZip', 'ZIP')}</Grid>
        <Grid item xs={12} sm={4}>{textField('billCountry', 'Country')}</Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Payment</Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth sx={getFieldErrorStyles(!!errors.payMethod)}>
            <InputLabel>Payment Method</InputLabel>
            <Select
              label="Payment Method"
              name="payMethod"
              value={formData.payMethod}
              onChange={handleChange}
            >
              {payMethods.map(m => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {formData.payMethod === 'CH' ? (
          <>
            <Grid item xs={12} sm={4}>{textField('acctNum', 'Account Number')}</Grid>
            <Grid item xs={12} sm={4}>{textField('routeNum', 'Routing Number')}</Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} sm={4}>{textField('credNum', 'Card Number')}</Grid>
            <Grid item xs={6} sm={2}>{textField('credExp', 'Exp (MMYY)')}</Grid>
            <Grid item xs={6} sm={2}>{textField('cvv2', 'CVV')}</Grid>
          </>
        )}

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Product & Tracking</Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        <Grid item xs={12} sm={4}>{textField('prodId', 'Product ID')}</Grid>
        <Grid item xs={12} sm={4}>{textField('promoId', 'Promo ID')}</Grid>
        <Grid item xs={12} sm={4}>{textField('companyId', 'Company ID')}</Grid>
        <Grid item xs={12} sm={6}>{textField('sourceId', 'Source ID')}</Grid>
        <Grid item xs={12} sm={6}>{textField('orderSource', 'Order Source')}</Grid>
        <Grid item xs={12} sm={6}>{textField('trackingId', 'Tracking ID')}</Grid>
        <Grid item xs={12} sm={3}>{textField('retNum', 'RetNum (optional)')}</Grid>
        <Grid item xs={12} sm={3}>{textField('salesId', 'Sales ID (optional)')}</Grid>

        <Grid item xs={12} sm={6}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={60000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
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
                    borderRadius: 2
                  }}
                />
              </Box>
            </Box>
          </Alert>
        </Box>
      </Snackbar>
    </Box>
  );
};

export default ImportSaleOrderForm;

