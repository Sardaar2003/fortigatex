import React from 'react';
import { Box } from '@mui/material';
import RadiusOrderForm from './forms/RadiusOrderForm';
import SemprisOrderForm from './forms/SemprisOrderForm';
import PSONLINEOrderForm from './forms/PSONLINEOrderForm';
import SubProjectOrderForm from './forms/SubProjectOrderForm';
import MIOrderForm from './forms/MIOrderForm';

const OrderForm = ({ project, onOrderSuccess }) => {
  return (
    <Box>
      {project === 'radius' ? (
        <RadiusOrderForm onOrderSuccess={onOrderSuccess} />
      ) : project === 'sempris' ? (
        <SemprisOrderForm onOrderSuccess={onOrderSuccess} />
      ) : project === 'psonline'? (
        <PSONLINEOrderForm onOrderSuccess={onOrderSuccess} />
      ) : project === 'sublytics' ? (
        <SubProjectOrderForm onOrderSuccess={onOrderSuccess} />
      ) : project === 'mi' ? (
        <MIOrderForm onOrderSuccess={onOrderSuccess} />
      ) : null
      }
    </Box>
  );
};

export default OrderForm; 