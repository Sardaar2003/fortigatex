import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Divider,
  Tooltip
} from '@mui/material';
import { Info } from '@mui/icons-material';

// Available permissions
const availablePermissions = [
  { 
    value: 'read:own', 
    label: 'Read Own', 
    description: 'User can read their own data',
    category: 'Read'
  },
  { 
    value: 'read:any', 
    label: 'Read Any', 
    description: 'User can read any data in the system',
    category: 'Read'
  },
  { 
    value: 'create:own', 
    label: 'Create Own', 
    description: 'User can create their own resources',
    category: 'Create'
  },
  { 
    value: 'create:any', 
    label: 'Create Any', 
    description: 'User can create resources for anyone',
    category: 'Create'
  },
  { 
    value: 'update:own', 
    label: 'Update Own', 
    description: 'User can update their own data',
    category: 'Update'
  },
  { 
    value: 'update:any', 
    label: 'Update Any', 
    description: 'User can update any data in the system',
    category: 'Update'
  },
  { 
    value: 'delete:own', 
    label: 'Delete Own', 
    description: 'User can delete their own data',
    category: 'Delete'
  },
  { 
    value: 'delete:any', 
    label: 'Delete Any', 
    description: 'User can delete any data in the system',
    category: 'Delete'
  },
  {
    value: 'admin:access',
    label: 'Admin Access',
    description: 'User can access admin features',
    category: 'Admin'
  }
];

// Group permissions by category
const permissionsByCategory = availablePermissions.reduce((acc, permission) => {
  if (!acc[permission.category]) {
    acc[permission.category] = [];
  }
  acc[permission.category].push(permission);
  return acc;
}, {});

// Validation schema
const EditRoleSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .max(50, 'Name is too long')
    .required('Role name is required')
    .matches(/^[a-zA-Z0-9_-]+$/, 'Role name can only contain letters, numbers, underscores and hyphens'),
  description: Yup.string()
    .required('Description is required'),
  permissions: Yup.array()
    .min(1, 'At least one permission is required')
});

const EditRoleDialog = ({ open, handleClose, role, onRoleUpdated }) => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [initialValues, setInitialValues] = useState({
    name: '',
    description: '',
    permissions: []
  });
  const [isBuiltIn, setIsBuiltIn] = useState(false);

  useEffect(() => {
    if (role) {
      setInitialValues({
        name: role.name || '',
        description: role.description || '',
        permissions: role.permissions || []
      });
      
      // Check if this is a built-in role (cannot change name)
      setIsBuiltIn(['user', 'admin', 'moderator'].includes(role.name));
    }
  }, [role]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setSuccess('');
      
      // If it's a built-in role, make sure we don't try to change the name
      const dataToSubmit = isBuiltIn 
        ? { description: values.description, permissions: values.permissions }
        : values;
      
      // Submit the form
      const response = await axios.put(`/api/roles/${role._id}`, dataToSubmit);
      
      if (response.data.success) {
        setSuccess('Role updated successfully!');
        setTimeout(() => {
          handleClose();
          setSuccess('');
          if (onRoleUpdated) {
            onRoleUpdated();
          }
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (!role) return null;
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Role: {role.name}
        {isBuiltIn && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            (Built-in role)
          </Typography>
        )}
      </DialogTitle>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={EditRoleSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => (
          <Form>
            <DialogContent>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    name="name"
                    label="Role Name"
                    variant="outlined"
                    fullWidth
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    disabled={isBuiltIn}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    name="description"
                    label="Role Description"
                    variant="outlined"
                    fullWidth
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Permissions
                    {touched.permissions && errors.permissions && (
                      <Typography color="error" variant="caption" sx={{ ml: 1 }}>
                        {errors.permissions}
                      </Typography>
                    )}
                  </Typography>
                  
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <Box key={category} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        {category} Permissions
                      </Typography>
                      <Divider sx={{ mb: 1 }} />
                      <FormGroup>
                        <Grid container spacing={1}>
                          {perms.map((permission) => (
                            <Grid item xs={12} sm={6} md={4} key={permission.value}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={values.permissions.includes(permission.value)}
                                    onChange={(e) => {
                                      const isChecked = e.target.checked;
                                      if (isChecked) {
                                        setFieldValue('permissions', [...values.permissions, permission.value]);
                                      } else {
                                        setFieldValue(
                                          'permissions',
                                          values.permissions.filter((value) => value !== permission.value)
                                        );
                                      }
                                    }}
                                  />
                                }
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {permission.label}
                                    <Tooltip title={permission.description} arrow>
                                      <Info fontSize="small" sx={{ ml: 0.5, color: 'text.secondary' }} />
                                    </Tooltip>
                                  </Box>
                                }
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </FormGroup>
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Role'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default EditRoleDialog; 