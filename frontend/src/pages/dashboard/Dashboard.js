import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  CalendarMonth,
  Book,
  SelfImprovement,
  SmartToy,
  AccountBalanceWallet,
  TrendingUp,
} from '@mui/icons-material';

const quickActions = [
  { icon: <CalendarMonth />, title: 'Đặt lịch hẹn', path: '/doctors', color: '#667eea' },
  { icon: <Book />, title: 'Viết nhật ký', path: '/journal/create', color: '#764ba2' },
  { icon: <SelfImprovement />, title: 'Thiền định', path: '/meditation', color: '#11998e' },
  { icon: <SmartToy />, title: 'Chat với AI', path: '/chatbot', color: '#f093fb' },
];

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Box>
      {/* Welcome Section */}
      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <CardContent sx={{ py: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Xin chào, {user?.fullName}! 👋
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Chào mừng bạn trở lại. Hôm nay bạn cảm thấy thế nào?
          </Typography>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Thao tác nhanh
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Card
              component={Link}
              to={action.path}
              sx={{
                textDecoration: 'none',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: `${action.color}20`,
                    color: action.color,
                    mx: 'auto',
                    mb: 1,
                  }}
                >
                  {action.icon}
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {action.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Lịch hẹn
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    3
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#667eea20', color: '#667eea' }}>
                  <CalendarMonth />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Nhật ký
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    12
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#764ba220', color: '#764ba2' }}>
                  <Book />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Điểm tâm trạng
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    7.5
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#11998e20', color: '#11998e' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Số dư
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {(user?.balance || 0).toLocaleString()}đ
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#ff980020', color: '#ff9800' }}>
                  <AccountBalanceWallet />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Lịch hẹn sắp tới
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>BS</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="BS. Nguyễn Văn A"
                    secondary="Thứ 2, 10:00 - Tư vấn trực tuyến"
                  />
                </ListItem>
              </List>
              <Button component={Link} to="/appointments" fullWidth variant="outlined" sx={{ mt: 1 }}>
                Xem tất cả
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Nhật ký gần đây
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#4caf50' }}>😊</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="Hôm nay tôi cảm thấy vui" secondary="Hôm nay, 09:00" />
                </ListItem>
              </List>
              <Button component={Link} to="/journal" fullWidth variant="outlined" sx={{ mt: 1 }}>
                Xem tất cả
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
