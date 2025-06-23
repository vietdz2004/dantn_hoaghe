/**
 * APP.JSX - ADMIN PANEL CHÍNH
 * 
 * Chức năng:
 * - Theme Material-UI xanh dương chuyên nghiệp
 * - Router setup cho admin pages
 * - Layout cơ bản với sidebar
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';

// THEME XANH DƯƠNG CHUYÊN NGHIỆP
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',      // Blue 600 - chuyên nghiệp
      light: '#3b82f6',     // Blue 500
      dark: '#1e40af',      // Blue 700
    },
    secondary: {
      main: '#10b981',      // Emerald 500 - success
      light: '#34d399',     // Emerald 400
      dark: '#059669',      // Emerald 600
    },
    background: {
      default: '#f8fafc',   // Slate 50 - nền sáng
      paper: '#ffffff',     // Trắng cho cards
    },
    text: {
      primary: '#0f172a',   // Slate 900 - chữ chính
      secondary: '#64748b', // Slate 500 - chữ phụ
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    // Card styling
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
        },
      },
    },
    // Button styling
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    // Input styling
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
