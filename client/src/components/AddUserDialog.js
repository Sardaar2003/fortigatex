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
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

// Validation schema
const AddUserSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .max(50, 'Name is too long')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  role: Yup.string().required('Role is required')
});

const AddUserDialog = ({ open, handleClose, onUserAdded }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchRoles = async () => {
        try {
          const res = await axios.get('/api/roles');
          setRoles(res.data.data);
        } catch (err) {
          setError('Failed to fetch roles. Please try again.');
          console.error(err);
        }
      };

      fetchRoles();
    }
  }, [open]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { confirmPassword, ...userData } = values;

      await axios.post('/api/users', userData);
      setSuccess(true);
      resetForm();

      // Notify parent component that user has been added
      if (onUserAdded) {
        onUserAdded();
      }

      // Close dialog after short delay to show success message
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
      console.error(err);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New User</DialogTitle>
      <Formik
        initialValues={{
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: ''
        }}
        validationSchema={AddUserSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting, values, handleChange }) => (
          <Form>
            <DialogContent>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>User created successfully!</Alert>}

              <Grid container spacing={2}>
                <Grid item xs={12}>
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

                <Grid item xs={12}>
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
                  <Field name="password">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        error={touched.password && Boolean(errors.password)}
                        helperText={touched.password && errors.password}
                        disabled={loading}
                        className="glass-input"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={handleClickShowPassword}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  </Field>
                </Grid>

                <Grid item xs={12}>
                  <Field name="confirmPassword">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        variant="outlined"
                        error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                        helperText={touched.confirmPassword && errors.confirmPassword}
                        disabled={loading}
                        className="glass-input"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={handleClickShowConfirmPassword}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  </Field>
                </Grid>

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
                      {roles.map((role) => (
                        <MenuItem key={role._id} value={role._id}>
                          {role.name} - {role.description}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.role && errors.role && (
                      <div style={{ color: '#f44336', fontSize: '0.75rem', marginTop: '3px', marginLeft: '14px' }}>
                        {errors.role}
                      </div>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
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
                {loading || isSubmitting ? 'Creating...' : 'Create User'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AddUserDialog; 