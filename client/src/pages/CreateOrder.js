import React from 'react';
import { Typography, Box } from '@mui/material';
import GlassCard from '../components/GlassCard';

const CreateOrder = () => {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <GlassCard>
        <Typography variant="h4" component="h1" gutterBottom>
          Create Order
        </Typography>
        <Typography variant="body1">
          This page is currently under development. Please use the OrderManagement page for order operations.
        </Typography>
      </GlassCard>
    </Box>
  );
};

export default CreateOrder; 