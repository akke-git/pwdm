import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';

const SearchPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4, fontFamily: 'apple gothic' }}>
      <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontFamily: 'apple gothic' }}>
          Search
        </Typography>
        <Typography variant="body1" sx={{ fontFamily: 'apple gothic' }}>
          Search functionality will be implemented here.
        </Typography>
      </Paper>
    </Container>
  );
};

export default SearchPage;
