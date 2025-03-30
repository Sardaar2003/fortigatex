import { createTheme } from '@mui/material/styles';

// Enhanced dark glassmorphism styles with depth levels
const createGlassEffect = (depth = 1) => ({
  background: `rgba(17, 25, 40, ${0.6 + (depth * 0.1)})`,
  backdropFilter: `blur(${12 + (depth * 4)}px)`,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: `
    0 8px 32px 0 rgba(0, 0, 0, ${0.2 + (depth * 0.05)}),
    0 2px 4px 0 rgba(0, 0, 0, 0.15),
    inset 0 2px 4px 0 rgba(255, 255, 255, 0.05)
  `,
});

const gradients = {
  primary: 'linear-gradient(135deg, rgba(111, 76, 255, 0.9) 0%, rgba(64, 42, 213, 0.9) 100%)',
  secondary: 'linear-gradient(135deg, rgba(88, 86, 245, 0.9) 0%, rgba(155, 107, 254, 0.9) 100%)',
  success: 'linear-gradient(135deg, rgba(56, 229, 177, 0.9) 0%, rgba(11, 156, 123, 0.9) 100%)',
  error: 'linear-gradient(135deg, rgba(255, 91, 91, 0.9) 0%, rgba(204, 33, 33, 0.9) 100%)',
  warning: 'linear-gradient(135deg, rgba(255, 186, 73, 0.9) 0%, rgba(255, 146, 43, 0.9) 100%)',
  subtle: 'linear-gradient(135deg, rgba(45, 55, 72, 0.5) 0%, rgba(17, 25, 40, 0.5) 100%)',
  card: 'linear-gradient(135deg, rgba(26, 32, 44, 0.9) 0%, rgba(17, 25, 40, 0.9) 100%)',
  highlight: 'linear-gradient(135deg, rgba(111, 76, 255, 0.15) 0%, rgba(64, 42, 213, 0.15) 100%)',
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6F4CFF',
      light: '#8B6FFF',
      dark: '#402AD5',
    },
    secondary: {
      main: '#9B6BFE',
      light: '#B18DFF',
      dark: '#7B4FE0',
    },
    background: {
      default: '#0B1121',
      paper: 'rgba(17, 25, 40, 0.7)',
    },
    text: {
      primary: '#E2E8F0',
      secondary: '#A0AEC0',
    },
    error: {
      main: '#FF5B5B',
      light: '#FF7A7A',
      dark: '#CC2121',
    },
    success: {
      main: '#38E5B1',
      light: '#5CEBC1',
      dark: '#0B9C7B',
    },
    warning: {
      main: '#FFBA49',
      light: '#FFC970',
      dark: '#FF922B',
    },
    info: {
      main: '#63B3ED',
      light: '#7CC4F1',
      dark: '#3182CE',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
      background: gradients.primary,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      filter: 'drop-shadow(0 2px 4px rgba(111, 76, 255, 0.3))',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
      background: gradients.primary,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      filter: 'drop-shadow(0 2px 4px rgba(111, 76, 255, 0.3))',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
      color: '#E2E8F0',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
      color: '#E2E8F0',
    },
    h5: {
      fontWeight: 600,
      color: '#E2E8F0',
    },
    h6: {
      fontWeight: 600,
      color: '#E2E8F0',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#A0AEC0',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#A0AEC0',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #0B1121 0%, #151C2C 50%, #1A202C 100%)',
          minHeight: '100vh',
          '&:before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(111, 76, 255, 0.15) 0%, rgba(17, 25, 40, 0.15) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          ...createGlassEffect(1),
          backgroundImage: 'none',
          '&:hover': {
            ...createGlassEffect(2),
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          ...createGlassEffect(2),
          background: gradients.card,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            ...createGlassEffect(3),
            transform: 'translateY(-5px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(11, 17, 33, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '10px 20px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.1)',
            transform: 'translateX(-100%) rotate(45deg)',
            transition: 'transform 0.5s',
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            '&:before': {
              transform: 'translateX(100%) rotate(45deg)',
            },
          },
        },
        contained: {
          background: gradients.primary,
          boxShadow: '0 4px 15px rgba(111, 76, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          '&:hover': {
            background: gradients.secondary,
            boxShadow: '0 8px 25px rgba(111, 76, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          },
        },
        outlined: {
          borderColor: 'rgba(111, 76, 255, 0.5)',
          backgroundColor: 'rgba(111, 76, 255, 0.05)',
          backdropFilter: 'blur(5px)',
          '&:hover': {
            borderColor: '#6F4CFF',
            backgroundColor: 'rgba(111, 76, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            ...createGlassEffect(1),
            borderRadius: '12px',
            '&:hover': {
              ...createGlassEffect(2),
            },
            '&.Mui-focused': {
              ...createGlassEffect(3),
            },
            '& fieldset': {
              borderColor: 'rgba(111, 76, 255, 0.2)',
              transition: 'all 0.3s ease',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(111, 76, 255, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6F4CFF',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          ...createGlassEffect(1),
          borderRadius: '12px',
          '&:hover': {
            ...createGlassEffect(2),
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          ...createGlassEffect(3),
          background: gradients.card,
          borderRadius: '24px',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          ...createGlassEffect(2),
          background: gradients.card,
          borderRadius: '16px',
          overflow: 'hidden',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            background: gradients.subtle,
            backdropFilter: 'blur(10px)',
            fontWeight: 600,
            color: '#6F4CFF',
            borderBottom: '2px solid rgba(111, 76, 255, 0.2)',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(111, 76, 255, 0.1)',
            backdropFilter: 'blur(15px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          ...createGlassEffect(2),
          borderRadius: '8px',
          border: 'none',
          '&:hover': {
            ...createGlassEffect(3),
          },
        },
        filled: {
          background: gradients.primary,
          color: '#E2E8F0',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          ...createGlassEffect(3),
          background: gradients.card,
          borderRadius: '16px',
          marginTop: '8px',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(111, 76, 255, 0.1)',
            backdropFilter: 'blur(15px)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(111, 76, 255, 0.1)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          ...createGlassEffect(3),
          background: gradients.card,
          color: '#E2E8F0',
          fontSize: '0.875rem',
        },
      },
    },
  },
});

export default theme; 