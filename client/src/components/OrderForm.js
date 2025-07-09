import React from 'react';
import { Box } from '@mui/material';
import RadiusOrderForm from './forms/RadiusOrderForm';
import SemprisOrderForm from './forms/SemprisOrderForm';
import PSONLINEOrderForm from './forms/PSONLINEOrderForm';

const OrderForm = ({ project, onOrderSuccess }) => {
  return (
    <Box>
      {project === 'radius' ? (
        <RadiusOrderForm onOrderSuccess={onOrderSuccess} />
      ) : project === 'sempris' ? (
        <SemprisOrderForm onOrderSuccess={onOrderSuccess} />
      ) : (
        <PSONLINEOrderForm onOrderSuccess={onOrderSuccess} />
      )}
    </Box>
  );
};

export default OrderForm; 