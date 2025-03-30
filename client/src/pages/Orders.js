import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

const OrderCard = ({ order }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" color="text.primary">
            Order #{order.id}
          </Typography>
          <Typography
            sx={{
              color: order.status === 'Completed' ? 'success.main' : 
                     order.status === 'Pending' ? 'warning.main' : 'error.main',
              display: 'inline-block',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: order.status === 'Completed' ? 'success.light' : 
                             order.status === 'Pending' ? 'warning.light' : 'error.light',
              opacity: 0.8
            }}
          >
            {order.status}
          </Typography>
        </Box>
        <Typography color="text.secondary" gutterBottom>
          {order.date}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {order.items} items
        </Typography>
        <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
          ${order.total}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Orders = () => {
  const theme = useTheme();
  const [orders] = useState([
    {
      id: '1234',
      date: '2024-03-15',
      items: 3,
      total: 299.99,
      status: 'Completed'
    },
    {
      id: '1235',
      date: '2024-03-14',
      items: 1,
      total: 99.99,
      status: 'Pending'
    },
    {
      id: '1236',
      date: '2024-03-13',
      items: 2,
      total: 199.99,
      status: 'Processing'
    }
  ]);

  return (
    <Box sx={{ p: 3, mt: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Orders
        </Typography>
        <Box>
          <IconButton sx={{ mr: 1 }}>
            <FilterIcon />
          </IconButton>
          <IconButton sx={{ mr: 1 }}>
            <DownloadIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4338CA 0%, #3730A3 100%)'
              }
            }}
          >
            New Order
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Search orders...
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid item xs={12} sm={6} md={4} key={order.id}>
            <OrderCard order={order} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Orders; 