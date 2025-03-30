import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import AuthContext from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

// Validation schema
const RegisterSchema = Yup.object().shape({
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
    .required('Confirm password is required')
});

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, error, clearError } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');

  useEffect(() => {
    // Redirect if authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    // Set error if exists
    if (error) {
      setRegisterError(error);
      clearError();
    }
  }, [isAuthenticated, navigate, error, clearError]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const { confirmPassword, ...registerData } = values;
      const result = await register(registerData);
      
      if (result.success) {
        // Registration successful, user will automatically be redirected to dashboard by the useEffect above
        resetForm();
      } else {
        setRegisterError(result.message || 'Registration failed');
      }
    } catch (err) {
      setRegisterError('An error occurred. Please try again.');
    } finally {
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
    <div className="auth-container">
      <GlassCard>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Create Account
        </Typography>
        
        {registerError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setRegisterError('')}>
            {registerError}
          </Alert>
        )}
        
        <Formik
          initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
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
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isSubmitting}
                    className="glass-button"
                  >
                    {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2">
                      Already have an account?{' '}
                      <Link to="/login" style={{ textDecoration: 'none' }}>
                        <Typography component="span" variant="body2" color="primary">
                          Login
                        </Typography>
                      </Link>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </GlassCard>
    </div>
  );
};

export default Register; 