import React, { useState, useContext } from 'react';
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
  InputAdornment,
  Container
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
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
  const { register } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const result = await register(values);
      if (result.success) {
        navigate('/login');
      } else {
        setRegisterError(result.message || 'Registration failed');
      }
    } catch (err) {
      setRegisterError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        py: 12,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, rgba(111, 76, 255, 0.05) 0%, rgba(64, 42, 213, 0.05) 100%)',
          zIndex: 0,
        }
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <GlassCard>
          <Typography 
            variant="h4" 
            component="h1" 
            align="center" 
            gutterBottom
            sx={{
              background: 'linear-gradient(135deg, #6F4CFF 0%, #402AD5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 4,
              fontWeight: 700,
              letterSpacing: '-0.025em',
              filter: 'drop-shadow(0 2px 4px rgba(111, 76, 255, 0.3))',
            }}
          >
            Create Account
          </Typography>

          {registerError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                backgroundColor: 'rgba(255, 91, 91, 0.1)',
                color: '#FF5B5B',
                '& .MuiAlert-icon': {
                  color: '#FF5B5B'
                }
              }} 
              onClose={() => setRegisterError('')}
            >
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
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Field name="name">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Full Name"
                          variant="outlined"
                          error={touched.name && Boolean(errors.name)}
                          helperText={touched.name && errors.name}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              height: '56px',
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#6F4CFF',
                              },
                            },
                          }}
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              height: '56px',
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#6F4CFF',
                              },
                            },
                          }}
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              height: '56px',
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#6F4CFF',
                              },
                            },
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                  sx={{
                                    color: '#6F4CFF',
                                    '&:hover': {
                                      backgroundColor: 'rgba(111, 76, 255, 0.1)',
                                    },
                                  }}
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              height: '56px',
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#6F4CFF',
                              },
                            },
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  edge="end"
                                  sx={{
                                    color: '#6F4CFF',
                                    '&:hover': {
                                      backgroundColor: 'rgba(111, 76, 255, 0.1)',
                                    },
                                  }}
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
                      sx={{
                        height: '56px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        background: 'linear-gradient(135deg, #6F4CFF 0%, #402AD5 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #8B6FFF 0%, #6F4CFF 100%)',
                        },
                      }}
                    >
                      {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                          <Typography 
                            component="span" 
                            variant="body2" 
                            sx={{ 
                              color: '#6F4CFF',
                              fontWeight: 600,
                              '&:hover': {
                                color: '#402AD5',
                              },
                              transition: 'color 0.3s ease',
                            }}
                          >
                            Sign in
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
      </Container>
    </Box>
  );
};

export default Register; 