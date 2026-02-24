import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';

import { logout } from '../../store/slices/authSlice';

const navLinks = [
  { text: 'Trang chủ', path: '/' },
  { text: 'Bác sĩ', path: '/doctors' },
  { text: 'Chuyên gia', path: '/healers' },
  { text: 'Thiền & Thư giãn', path: '/meditation' },
];

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    setAnchorEl(null);
    navigate('/');
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'white', color: 'text.primary' }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ px: { xs: 0 } }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              🧠 Mental Healthcare
            </Typography>
          </Link>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  component={Link}
                  to={link.path}
                  sx={{ color: 'text.primary' }}
                >
                  {link.text}
                </Button>
              ))}

              {isAuthenticated ? (
                <>
                  <Button
                    component={Link}
                    to="/dashboard"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  >
                    Dashboard
                  </Button>
                  <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                    <Avatar
                      src={user?.avatar}
                      sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}
                    >
                      {user?.fullName?.charAt(0)}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                  >
                    <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}>
                      Hồ sơ
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button component={Link} to="/login" sx={{ ml: 1 }}>
                    Đăng nhập
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                  >
                    Đăng ký
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}

          {/* Mobile Drawer */}
          <Drawer
            anchor="right"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
          >
            <Box sx={{ width: 280, p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <IconButton onClick={() => setMobileOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <List>
                {navLinks.map((link) => (
                  <ListItem key={link.path} disablePadding>
                    <ListItemButton
                      component={Link}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                    >
                      <ListItemText primary={link.text} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              <Box sx={{ p: 2 }}>
                {isAuthenticated ? (
                  <>
                    <Button
                      fullWidth
                      variant="outlined"
                      component={Link}
                      to="/dashboard"
                      sx={{ mb: 1 }}
                      onClick={() => setMobileOpen(false)}
                    >
                      Dashboard
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      fullWidth
                      variant="outlined"
                      component={Link}
                      to="/login"
                      sx={{ mb: 1 }}
                      onClick={() => setMobileOpen(false)}
                    >
                      Đăng nhập
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      component={Link}
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                    >
                      Đăng ký
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Drawer>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
