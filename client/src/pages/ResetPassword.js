import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Alert,
  Container,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import GlassCard from '../components/GlassCard';
import { AuthContext } from '../context/AuthContext';

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const ResetPassword = () => {
  const [status, setStatus] = useState({ type: '', message: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();
  const { resetPassword } = useContext(AuthContext);

  useEffect(() => {
    // Check if token is present
    if (!token) {
      setStatus({
        type: 'error',
        message: 'Invalid reset password link. Please request a new password reset link.'
      });
    }
  }, [token]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await resetPassword(token, values.password);
      
      if (response.success) {
        setStatus({
          type: 'success',
          message: 'Password has been successfully reset. You can now login with your new password.'
        });
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus({
          type: 'error',
          message: response.message || 'Failed to reset password. Please try again.'
        });
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to reset password. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
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
            <Alert severity="error" sx={{ mb: 3 }}>
              Invalid reset password link. Please request a new password reset link.
            </Alert>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/forgot-password')}
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
              Request New Reset Link
            </Button>
          </GlassCard>
        </Container>
      </Box>
    );
  }

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
            Reset Password
          </Typography>

          <Typography 
            variant="body1" 
            align="center" 
            sx={{ 
              mb: 4,
              color: '#A0AEC0',
              maxWidth: '400px',
              mx: 'auto'
            }}
          >
            Please enter your new password below.
          </Typography>

          {status.message && (
            <Alert 
              severity={status.type} 
              sx={{ 
                mb: 3,
                backgroundColor: status.type === 'error' 
                  ? 'rgba(255, 91, 91, 0.1)' 
                  : 'rgba(56, 229, 177, 0.1)',
                color: status.type === 'error' 
                  ? '#FF5B5B' 
                  : '#38E5B1',
                '& .MuiAlert-icon': {
                  color: status.type === 'error' 
                    ? '#FF5B5B' 
                    : '#38E5B1'
                }
              }}
              onClose={() => setStatus({ type: '', message: '' })}
            >
              {status.message}
            </Alert>
          )}

          <Formik
            initialValues={{ password: '', confirmPassword: '' }}
            validationSchema={ResetPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Field name="password">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type={showPassword ? 'text' : 'password'}
                          label="New Password"
                          variant="outlined"
                          error={touched.password && Boolean(errors.password)}
                          helperText={touched.password && errors.password}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                  sx={{
                                    color: '#A0AEC0',
                                    '&:hover': { color: '#6F4CFF' },
                                  }}
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
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
                    <Field name="confirmPassword">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type={showConfirmPassword ? 'text' : 'password'}
                          label="Confirm New Password"
                          variant="outlined"
                          error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                          helperText={touched.confirmPassword && errors.confirmPassword}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  edge="end"
                                  sx={{
                                    color: '#A0AEC0',
                                    '&:hover': { color: '#6F4CFF' },
                                  }}
                                >
                                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
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
                      {isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </Button>
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

export default ResetPassword; 