import React, { useState, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required')
});

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const result = await resetPassword(token, values.password);

      if (result.success) {
        setSuccessMessage('Password reset successful! You can now login with your new password.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
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
          Reset Password
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
          Enter your new password below.
        </Typography>

        <Formik
          initialValues={{ password: '', confirmPassword: '' }}
          validationSchema={ResetPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Field name="password">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="New Password"
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
                        label="Confirm New Password"
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
                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword; 