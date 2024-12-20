import React from 'react';
import { AppBar, Box, Toolbar, Typography, Avatar, Button } from '@mui/material';
import { handleLogout } from '../utils/auth';

const TopBar = () => {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6" noWrap component="div">
          My Dashboard
        </Typography>

        {/* Right Section with User Icon and Logout Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>Admin</Avatar>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleLogout}
            size="small"
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
