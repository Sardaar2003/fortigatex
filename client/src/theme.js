import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#7371FC',
      light: '#9896FF',
      dark: '#5755C8',
      contrastText: '#fff',
    },
    secondary: {
      main: '#49BEAA',
      light: '#6FD4C2',
      dark: '#2F9683',
      contrastText: '#fff',
    },
    error: {
      main: '#FF6B6B',
      light: '#FF9F9F',
      dark: '#CF4B4B',
    },
    warning: {
      main: '#FFB169',
      light: '#FFC896',
      dark: '#D98F4E',
    },
    info: {
      main: '#64B5F6',
      light: '#90CAF9',
      dark: '#42A5F5',
    },
    success: {
      main: '#66BB6A',
      light: '#81C784',
      dark: '#43A047',
    },
    background: {
      default: '#F5F9FC',
      paper: 'rgba(255, 255, 255, 0.85)',
    },
    text: {
      primary: '#293241',
      secondary: '#546A7B',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.2s ease',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #7371FC, #9381FF)',
          '&:hover': {
            background: 'linear-gradient(135deg, #6261E8, #8271EF)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #49BEAA, #3EC1B0)',
          '&:hover': {
            background: 'linear-gradient(135deg, #40A595, #35B4A3)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: 'rgba(115, 113, 252, 0.12)',
          color: '#5755C8',
        },
        colorSecondary: {
          backgroundColor: 'rgba(73, 190, 170, 0.12)',
          color: '#2F9683',
        },
        colorError: {
          backgroundColor: 'rgba(255, 107, 107, 0.12)',
          color: '#CF4B4B',
        },
        colorWarning: {
          backgroundColor: 'rgba(255, 177, 105, 0.12)',
          color: '#D98F4E',
        },
        colorSuccess: {
          backgroundColor: 'rgba(102, 187, 106, 0.12)',
          color: '#43A047',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
        },
        head: {
          fontWeight: 600,
          color: '#293241',
        },
      },
    },
  },
});

export default theme; 