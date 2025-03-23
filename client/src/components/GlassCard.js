import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const glassMorphism = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
};

const GlassCard = ({ children, title, subtitle, maxWidth = '800px', sx = {} }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        ...glassMorphism,
        padding: 3,
        maxWidth: maxWidth,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        ...sx
      }}
    >
      {title && (
        <Box sx={{ mb: subtitle ? 1 : 3 }}>
          <Typography variant="h5" component="h2" fontWeight={600} color="primary.dark">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
      
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(115, 113, 252, 0.2), rgba(73, 190, 170, 0.2))',
          filter: 'blur(30px)',
          zIndex: 0
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(73, 190, 170, 0.15), rgba(100, 181, 246, 0.15))',
          filter: 'blur(25px)',
          zIndex: 0
        }}
      />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </Paper>
  );
};

export default GlassCard; 