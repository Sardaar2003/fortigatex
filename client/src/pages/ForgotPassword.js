import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Alert,
  Container
} from '@mui/material';
import GlassCard from '../components/GlassCard';
import { AuthContext } from '../context/AuthContext';

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
});

const ForgotPassword = () => {
  const [status, setStatus] = useState({ type: '', message: '' });
  const { forgotPassword } = useContext(AuthContext);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await forgotPassword(values.email);
      
      if (response.success) {
        setStatus({
          type: 'success',
          message: 'If an account exists with this email, you will receive password reset instructions.'
        });
      } else {
        setStatus({
          type: 'error',
          message: response.message || 'An error occurred. Please try again.'
        });
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: 'An error occurred. Please try again.'
      });
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
            Enter your email address and we'll send you instructions to reset your password.
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
            initialValues={{ email: '' }}
            validationSchema={ForgotPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <Grid container spacing={3}>
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
                      {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
                        Remember your password?{' '}
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

export default ForgotPassword; 