import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Box,
  Typography
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';

// Validation schema
const EditUserSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .max(50, 'Name is too long')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  role: Yup.string().required('Role is required')
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-edit-tabpanel-${index}`}
      aria-labelledby={`user-edit-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const EditUserDialog = ({ open, handleClose, user, onUserUpdated }) => {
  const { token } = React.useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Fetch available roles when dialog opens
  useEffect(() => {
    if (open && user) {
      const fetchRoles = async () => {
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/roles`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setRoles(res.data.data);
        } catch (err) {
          setError('Failed to fetch roles. Please try again.');
          console.error(err);
        }
      };
      fetchRoles();
    }
  }, [open, user, token]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleUserUpdate = async (values, { setSubmitting }) => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      // Update basic info
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/${user._id}`,
        { name: values.name, email: values.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update role if changed
      if (values.role !== (user.role?._id || '')) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/users/${user._id}/role`,
          { role: values.role },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      // Update verification status if changed
      if (values.isVerified !== user.isVerified) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/users/${user._id}/verify`,
          { isVerified: values.isVerified },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setSuccess(true);
      if (onUserUpdated) {
        onUserUpdated();
      }
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user.');
      console.error(err);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  if (!user) return null;
  if (!user.role || !user.role._id) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Alert severity="error">User role information is missing or invalid. Cannot edit this user.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit User</DialogTitle>

      <Tabs value={tabValue} onChange={handleTabChange} centered>
        <Tab label="User Information" />
        <Tab label="Role & Permissions" />
      </Tabs>

      <Formik
        initialValues={{
          name: user?.name || '',
          email: user?.email || '',
          role: user?.role?._id || '',
          isVerified: user?.isVerified || false
        }}
        validationSchema={EditUserSchema}
        onSubmit={handleUserUpdate}
        enableReinitialize
      >
        {({ errors, touched, isSubmitting, values, handleChange, setFieldValue }) => (
          <Form>
            <DialogContent>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>User updated successfully!</Alert>}

              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      User ID: {user._id}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field name="name">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Name"
                          variant="outlined"
                          error={touched.name && Boolean(errors.name)}
                          helperText={touched.name && errors.name}
                          disabled={loading}
                          className="glass-input"
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
                          label="Email"
                          variant="outlined"
                          error={touched.email && Boolean(errors.email)}
                          helperText={touched.email && errors.email}
                          disabled={loading}
                          className="glass-input"
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={values.isVerified}
                          onChange={(e) => setFieldValue('isVerified', e.target.checked)}
                          name="isVerified"
                          color="primary"
                          disabled={loading}
                        />
                      }
                      label="Email Verified"
                    />
                    <Typography variant="caption" color="text.secondary" display="block">
                      {values.isVerified ?
                        "User's email is verified and they can login" :
                        "User's email is not verified and they cannot login"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Created: {user.createdAt && new Date(user.createdAt).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth variant="outlined" className="glass-input">
                      <InputLabel id="role-select-label">Role</InputLabel>
                      <Select
                        labelId="role-select-label"
                        id="role"
                        name="role"
                        value={values.role}
                        onChange={handleChange}
                        label="Role"
                        disabled={loading}
                        error={touched.role && Boolean(errors.role)}
                      >
                        {roles.length === 0 ? (
                          <MenuItem value="" disabled>No roles available</MenuItem>
                        ) : (
                          roles.map((role) => (
                            <MenuItem key={role._id} value={role._id}>
                              {role.name} - {role.description}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {touched.role && errors.role && (
                        <div style={{ color: '#f44336', fontSize: '0.75rem', marginTop: '3px', marginLeft: '14px' }}>
                          {errors.role}
                        </div>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Current Permissions
                    </Typography>

                    {roles.find(r => r._id === values.role)?.permissions?.map((permission, index) => (
                      <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                        • {permission}
                      </Typography>
                    )) || (
                        <Typography variant="body2" color="text.secondary">
                          No permissions found for this role
                        </Typography>
                      )}
                  </Grid>
                </Grid>
              </TabPanel>
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClose} disabled={loading || isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || isSubmitting}
                className="glass-button"
              >
                {loading || isSubmitting ? 'Updating...' : 'Save Changes'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default EditUserDialog; 