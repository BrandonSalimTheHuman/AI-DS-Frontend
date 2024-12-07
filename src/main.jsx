import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  components: {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: 'black',
          '&.Mui-focused': {
            color: 'black', // InputLabel color when focused
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          color: 'black',
        },
        icon: {
          color: 'black', // Dropdown icon color
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'lightgray', // Border color on hover
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'black', // Border color when focused
          },
        },
        notchedOutline: {
          borderColor: 'black', // Default border color
        },
      },
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StrictMode>
);
