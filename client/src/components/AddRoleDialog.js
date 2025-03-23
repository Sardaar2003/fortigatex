import React, { useState } from 'react';
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
const AddRoleSchema = Yup.object().shape({
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

const AddRoleDialog = ({ open, handleClose, onRoleAdded }) => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setError('');
      setSuccess('');

      // Submit the form
      const response = await axios.post('/api/roles', values);

      if (response.data.success) {
        setSuccess('Role created successfully!');
        setTimeout(() => {
          handleClose();
          resetForm();
          setSuccess('');
          if (onRoleAdded) {
            onRoleAdded();
          }
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create role');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Role</DialogTitle>
      <Formik
        initialValues={{
          name: '',
          description: '',
          permissions: []
        }}
        validationSchema={AddRoleSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, setFieldValue, isSubmitting }) => (
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
                {isSubmitting ? 'Creating...' : 'Create Role'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AddRoleDialog; 