import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

const VerifyEmail = () => {
  const { token } = useParams();
  const { verifyEmail } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyUserEmail = async () => {
      try {
        const result = await verifyEmail(token);

        if (result.success) {
          setVerified(true);
        } else {
          setError(result.message || 'Email verification failed');
        }
      } catch (err) {
        setError('An error occurred during verification');
      } finally {
        setLoading(false);
      }
    };

    verifyUserEmail();
  }, [token, verifyEmail]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="auth-container">
      <GlassCard>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Email Verification
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {verified && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Your email has been verified successfully!
          </Alert>
        )}

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button className="glass-button">
              Proceed to Login
            </Button>
          </Link>
        </Box>
      </GlassCard>
    </div>
  );
};

export default VerifyEmail; 