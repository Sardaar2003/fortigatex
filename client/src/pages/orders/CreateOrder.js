import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  CircularProgress
} from '@mui/material';
import RadiusOrderForm from '../../components/forms/RadiusOrderForm';
import SemprisOrderForm from '../../components/forms/SemprisOrderForm';
import MIOrderForm from '../../components/forms/MIOrderForm';
import ImportSaleOrderForm from '../../components/forms/ImportSaleOrderForm';
import DocwellnessACHOrderForm from '../../components/forms/DocwellnessACHOrderForm';

import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const CreateOrder = () => {
  const location = useLocation();
  const { token } = useContext(AuthContext);
  const [selectedProject, setSelectedProject] = useState(location.state?.project || '');
  const [activeProjects, setActiveProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveProjects();
  }, []);

  const fetchActiveProjects = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const enabled = data.data.filter(p => p.isActive);
        setActiveProjects(enabled);
        
        // Auto select first project if nothing is selected or if current selection is not active
        const isCurrentActive = enabled.find(p => p.name === selectedProject);
        if (!isCurrentActive && enabled.length > 0) {
          setSelectedProject(enabled[0].name);
        } else if (!selectedProject && enabled.length > 0) {
          setSelectedProject(enabled[0].name);
        }
      }
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

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
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <FormControl fullWidth>
              <InputLabel>Select Project</InputLabel>
              <Select
                value={selectedProject}
                onChange={handleProjectChange}
                label="Select Project"
              >
                {activeProjects.map((project) => (
                  <MenuItem key={project._id} value={project.name}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Paper>

        {selectedProject === 'Radius Project' ? (
          <RadiusOrderForm />
        ) : selectedProject === 'Sempris Project' ? (
          <SemprisOrderForm />
        ) : selectedProject === 'MI Project' ? (
          <MIOrderForm />
        ) : (selectedProject === 'IMPORTSALE Project' || selectedProject === 'Import Sale' || selectedProject === 'import-sale') ? (
          <ImportSaleOrderForm />
        ) : (selectedProject === 'DOCWELLNESS ACH Project' || selectedProject === 'DOCWELLNESS (ACH) Project' || selectedProject === 'Docwellness ACH' || selectedProject === 'docwellness-ach') ? (
          <DocwellnessACHOrderForm />
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