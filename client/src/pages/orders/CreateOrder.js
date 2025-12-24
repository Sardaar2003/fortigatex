import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import RadiusOrderForm from '../../components/forms/RadiusOrderForm';
import SemprisOrderForm from '../../components/forms/SemprisOrderForm';
import MIOrderForm from '../../components/forms/MIOrderForm';
import ImportSaleOrderForm from '../../components/forms/ImportSaleOrderForm';

import { useLocation } from 'react-router-dom';

const CreateOrder = () => {
  const location = useLocation();
  const [selectedProject, setSelectedProject] = useState(location.state?.project || 'Radius Project');

  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          Create New Order
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <FormControl fullWidth>
            <InputLabel>Select Project</InputLabel>
            <Select
              value={selectedProject}
              onChange={handleProjectChange}
              label="Select Project"
            >
              <MenuItem value="Radius Project">Radius Project</MenuItem>
              <MenuItem value="Sempris Project">Sempris Project</MenuItem>
              <MenuItem value="MI Project">MI Project</MenuItem>
              <MenuItem value="IMPORTSALE Project">ImportSale Project</MenuItem>
            </Select>
          </FormControl>
        </Paper>

        {selectedProject === 'Radius Project' ? (
          <RadiusOrderForm />
        ) : selectedProject === 'Sempris Project' ? (
          <SemprisOrderForm />
        ) : selectedProject === 'MI Project' ? (
          <MIOrderForm />
        ) : selectedProject === 'IMPORTSALE Project' ? (
          <ImportSaleOrderForm />
        ) : (
          <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            Select a project to continue...
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default CreateOrder; 