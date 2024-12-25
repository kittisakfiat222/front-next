import React from 'react';
import { Drawer, List, ListItemButton, ListItemText, Box, Toolbar } from '@mui/material';
import { useRouter } from 'next/router';

const drawerWidth = 240;

const Sidebar = () => {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path); // Programmatic navigation
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItemButton onClick={() => handleNavigation('/dashboard')}>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
          {/* <ListItemButton onClick={() => handleNavigation('/dashboardtest')}>
            <ListItemText primary="Dashboardtest" />
          </ListItemButton> */}
          <ListItemButton onClick={() => handleNavigation('/showUsers')}>
            <ListItemText primary="Users" />
          </ListItemButton>
          <ListItemButton onClick={() => handleNavigation('/cashier')}>
            <ListItemText primary="Cashier" />
          </ListItemButton>
          <ListItemButton onClick={() => handleNavigation('/product')}>
            <ListItemText primary="Product" />
          </ListItemButton>
          <ListItemButton onClick={() => handleNavigation('/showOrders')}>
            <ListItemText primary="Order" />
          </ListItemButton>
          <ListItemButton onClick={() => handleNavigation('/master')}>
            <ListItemText primary="Master" />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
