/**
 * ADMINLAYOUT.JSX - LAYOUT ADMIN ĐỠN GIẢN
 * 
 * Chức năng:
 * - Sidebar navigation
 * - AppBar header
 * - Main content area
 * - Responsive design
 */

import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard,
  LocalFlorist,
  ShoppingCart,
  People,
  Menu as MenuIcon,
  ExitToApp,
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;

const AdminLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { title: 'Dashboard', icon: <Dashboard />, path: '/' },
    { title: 'Sản Phẩm', icon: <LocalFlorist />, path: '/products' },
    { title: 'Đơn Hàng', icon: <ShoppingCart />, path: '/orders' },
    { title: 'Khách Hàng', icon: <People />, path: '/customers' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo & Title */}
      <Box sx={{ 
        padding: 3, 
        textAlign: 'center',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      }}>
        <LocalFlorist sx={{ fontSize: '2rem', color: 'primary.main', mb: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
          HoaShop Admin
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Quản trị hệ thống
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flex: 1, px: 2, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': { 
                    color: 'primary.main' 
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(248, 250, 252, 0.8)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.title}
                primaryTypographyProps={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 500 
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 2 }}>
        <ListItemButton 
          onClick={() => window.open('http://localhost:5173/', '_blank')}
          sx={{ borderRadius: 2 }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText 
            primary="Xem Website"
            primaryTypographyProps={{ fontSize: '0.875rem' }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 600 }}>
            {menuItems.find(item => item.path === location.pathname)?.title || 'HoaShop Admin'}
          </Typography>
          
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            A
          </Avatar>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box 
        component="nav" 
        sx={{ 
          width: { md: DRAWER_WIDTH }, 
          flexShrink: { md: 0 } 
        }}
      >
        {/* Mobile drawer */}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: DRAWER_WIDTH 
              },
            }}
          >
            {drawer}
          </Drawer>
        )}
        
        {/* Desktop drawer */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: DRAWER_WIDTH 
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          p: 0,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout; 