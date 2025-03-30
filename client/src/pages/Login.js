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
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
});

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, error, clearError } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Redirect if authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    // Set error if exists
    if (error) {
      setLoginError(error);
      clearError();
    }
  }, [isAuthenticated, navigate, error, clearError]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const result = await login(values);
      
      if (!result.success) {
        setLoginError(result.message || 'Login failed');
      }
    } catch (err) {
      setLoginError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <GlassCard>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Login
        </Typography>
        
        {loginError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLoginError('')}>
            {loginError}
          </Alert>
        )}
        
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <Grid container spacing={2}>
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
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                      <Typography variant="body2" color="primary">
                        Forgot password?
                      </Typography>
                    </Link>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isSubmitting}
                    className="glass-button"
                  >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2">
                      Don't have an account?{' '}
                      <Link to="/register" style={{ textDecoration: 'none' }}>
                        <Typography component="span" variant="body2" color="primary">
                          Sign up
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

export default Login; 