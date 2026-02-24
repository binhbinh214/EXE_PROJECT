import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';

const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Typography
              variant="h4"
              sx={{
                color: 'white',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              🧠 Mental Healthcare
            </Typography>
          </Link>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
            Chăm sóc sức khỏe tinh thần của bạn
          </Typography>
        </Box>
        <Outlet />
      </Container>
    </Box>
  );
};

export default AuthLayout;
