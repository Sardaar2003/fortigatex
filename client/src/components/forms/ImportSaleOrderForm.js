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
    FIRSTNAME: '',
    LASTNAME: '',
    BILLINGNAME: '',
    EMAIL: '',
    HOMEAREA: '',
    HOMEPHONE: '',
    BILLADDR1: '',
    BILLADDR2: '',
    BILLCITY: '',
    BILLSTATE: '',
    BILLZIP: '',
    BILLCOUNTRY: 'US',
    PAYMETHOD: 'VS',
    ACCTNUM: '',
    ROUTENUM: '',
    CREDNUM: '',
    CREDEXP: '',
    CVV2: '',
    PRODID: '',
    PROMOID: '',
    COMPANYID: '',
    TRACKINGID: crypto.randomUUID(),
    RETNUM: '',
    SALESID: '',
    SOURCEID: '',
    ORDERSOURCE: 'WEB'
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
      'FIRSTNAME', 'LASTNAME', 'BILLINGNAME', 'EMAIL', 'HOMEAREA', 'HOMEPHONE',
      'BILLADDR1', 'BILLCITY', 'BILLSTATE', 'BILLZIP', 'BILLCOUNTRY', 'PAYMETHOD',
      'PRODID', 'PROMOID', 'COMPANYID', 'SOURCEID'
    ];
    required.forEach(f => {
      if (!formData[f]) e[f] = 'Required';
    });

    if (formData.HOMEAREA && !/^[0-9]{3}$/.test(formData.HOMEAREA)) {
      e.HOMEAREA = 'Area code must be 3 digits';
    }
    if (formData.HOMEPHONE && !/^[0-9]{7}$/.test(formData.HOMEPHONE)) {
      e.HOMEPHONE = 'Phone must be 7 digits (no area code)';
    }
    if (formData.EMAIL && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.EMAIL)) {
      e.EMAIL = 'Invalid email';
    }
    if (formData.BILLZIP && !/^\d{5}(\d{4})?$/.test(formData.BILLZIP)) {
      e.BILLZIP = 'ZIP must be 5 or 9 digits';
    }
    const method = formData.PAYMETHOD?.toUpperCase();
    if (method === 'CH') {
      if (!formData.ACCTNUM) e.ACCTNUM = 'Account number required';
      if (!formData.ROUTENUM) e.ROUTENUM = 'Routing number required';
      if (formData.ROUTENUM && !/^\d{9}$/.test(formData.ROUTENUM)) {
        e.ROUTENUM = 'Routing must be 9 digits';
      }
    } else {
      if (!formData.CREDNUM) e.CREDNUM = 'Card number required';
      if (!formData.CREDEXP) e.CREDEXP = 'Exp required';
      if (!formData.CVV2) e.CVV2 = 'CVV required';
      if (formData.CREDNUM && !/^\d{13,16}$/.test(formData.CREDNUM)) {
        e.CREDNUM = '13-16 digits';
      }
      if (formData.CREDEXP && !/^(0[1-9]|1[0-2])\d{2}$/.test(formData.CREDEXP)) {
        e.CREDEXP = 'MMYY';
      }
      if (formData.CVV2 && !/^\d{3,4}$/.test(formData.CVV2)) {
        e.CVV2 = '3-4 digits';
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
        BILLSTATE: formData.BILLSTATE.toUpperCase(),
        PAYMETHOD: formData.PAYMETHOD.toUpperCase()
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
        <Grid item xs={12} sm={6}>{textField('FIRSTNAME', 'First Name')}</Grid>
        <Grid item xs={12} sm={6}>{textField('LASTNAME', 'Last Name')}</Grid>
        <Grid item xs={12}>{textField('BILLINGNAME', 'Billing Name')}</Grid>
        <Grid item xs={12} sm={6}>{textField('EMAIL', 'Email')}</Grid>
        <Grid item xs={6} sm={3}>{textField('HOMEAREA', 'Area Code')}</Grid>
        <Grid item xs={6} sm={3}>{textField('HOMEPHONE', 'Phone (7 digits)')}</Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Billing Address</Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        <Grid item xs={12}>{textField('BILLADDR1', 'Address Line 1')}</Grid>
        <Grid item xs={12}>{textField('BILLADDR2', 'Address Line 2 (Optional)')}</Grid>
        <Grid item xs={12} sm={4}>{textField('BILLCITY', 'City')}</Grid>
        <Grid item xs={12} sm={4}>{textField('BILLSTATE', 'State')}</Grid>
        <Grid item xs={12} sm={4}>{textField('BILLZIP', 'ZIP')}</Grid>
        <Grid item xs={12} sm={4}>{textField('BILLCOUNTRY', 'Country')}</Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Payment</Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth sx={getFieldErrorStyles(!!errors.PAYMETHOD)}>
            <InputLabel>Payment Method</InputLabel>
            <Select
              label="Payment Method"
              name="PAYMETHOD"
              value={formData.PAYMETHOD}
              onChange={handleChange}
            >
              {payMethods.map(m => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {formData.PAYMETHOD === 'CH' ? (
          <>
            <Grid item xs={12} sm={4}>{textField('ACCTNUM', 'Account Number')}</Grid>
            <Grid item xs={12} sm={4}>{textField('ROUTENUM', 'Routing Number')}</Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} sm={4}>{textField('CREDNUM', 'Card Number')}</Grid>
            <Grid item xs={6} sm={2}>{textField('CREDEXP', 'Exp (MMYY)')}</Grid>
            <Grid item xs={6} sm={2}>{textField('CVV2', 'CVV')}</Grid>
          </>
        )}

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Product & Tracking</Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        <Grid item xs={12} sm={4}>{textField('PRODID', 'Product ID')}</Grid>
        <Grid item xs={12} sm={4}>{textField('PROMOID', 'Promo ID')}</Grid>
        <Grid item xs={12} sm={4}>{textField('COMPANYID', 'Company ID')}</Grid>
        <Grid item xs={12} sm={6}>{textField('SOURCEID', 'Source ID')}</Grid>
        <Grid item xs={12} sm={6}>{textField('ORDERSOURCE', 'Order Source')}</Grid>
        <Grid item xs={12} sm={6}>{textField('TRACKINGID', 'Tracking ID')}</Grid>
        <Grid item xs={12} sm={3}>{textField('RETNUM', 'RetNum (optional)')}</Grid>
        <Grid item xs={12} sm={3}>{textField('SALESID', 'Sales ID (optional)')}</Grid>

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

