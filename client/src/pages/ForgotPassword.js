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
  Alert
} from '@mui/material';
import AuthContext from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

// Validation schema
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required')
});

const ForgotPassword = () => {
  const { forgotPassword } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const result = await forgotPassword(values.email);

      if (result.success) {
        resetForm();
        setSuccessMessage(
          'Password reset instructions have been sent to your email.'
        );
      } else {
        setError(result.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <GlassCard>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Forgot Password
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        <Typography variant="body1" align="center" paragraph>
          Enter your email address and we'll send you instructions to reset your password.
        </Typography>

        <Formik
          initialValues={{ email: '' }}
          validationSchema={ForgotPasswordSchema}
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
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isSubmitting}
                    className="glass-button"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2">
                      Remember your password?{' '}
                      <Link to="/login" style={{ textDecoration: 'none' }}>
                        <Typography component="span" variant="body2" color="primary">
                          Back to Login
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

export default ForgotPassword; 