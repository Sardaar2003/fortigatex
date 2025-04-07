import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

const NotFound = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        padding: 2
      }}
    >
      <Typography variant="h1" component="h1" gutterBottom sx={{ fontSize: { xs: '4rem', sm: '6rem' } }}>
        404
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, maxWidth: '500px' }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </Typography>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Button className="glass-button">
          Go to Home
        </Button>
      </Link>
    </Box>
  );
};

export default NotFound; 