import React from 'react';
import { Box } from '@mui/material';
import RadiusOrderForm from './forms/RadiusOrderForm';
import SemprisOrderForm from './forms/SemprisOrderForm';

const OrderForm = ({ project, onOrderSuccess }) => {
  return (
    <Box>
      {project === 'radius' ? (
        <RadiusOrderForm onOrderSuccess={onOrderSuccess} />
      ) : (
        <SemprisOrderForm onOrderSuccess={onOrderSuccess} />
      )}
    </Box>
  );
};

export default OrderForm; 