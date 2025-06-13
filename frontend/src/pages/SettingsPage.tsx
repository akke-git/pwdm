import React from 'react';
import { Box, Container, Typography, Paper, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category'; // Using a generic category icon
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link as RouterLink } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, fontFamily: 'apple gothic', mb: 8 /* Bottom padding for nav bar */ }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontFamily: 'apple gothic', textAlign: 'center', mb: { xs: 2, sm: 4} }}>
        Settings
      </Typography>
      <Paper elevation={0} sx={{ 
        p: { xs: 1, sm: 2 }, 
        border: '1px solid #eee', 
        borderRadius: 2 
      }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/settings/categories">
              <ListItemIcon>
                <CategoryIcon />
              </ListItemIcon>
              <ListItemText primary="Category Management" sx={{ fontFamily: 'apple gothic' }} />
            </ListItemButton>
          </ListItem>
          <Divider />
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/settings/profile">
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText primary="User Profile Management" sx={{ fontFamily: 'apple gothic' }} />
            </ListItemButton>
          </ListItem>
          {/* Add more settings items here */}
        </List>
      </Paper>
      {/* Placeholder for Category Management Page - to be implemented as a sub-route or separate component */}
      {/* Placeholder for User Profile Management Page - to be implemented as a sub-route or separate component */}
    </Container>
  );
};

export default SettingsPage;
