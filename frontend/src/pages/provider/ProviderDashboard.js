import React from 'react';
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
  Chip,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  CalendarMonth,
  People,
  Star,
  AccountBalanceWallet,
  TrendingUp,
  Schedule,
} from '@mui/icons-material';

const upcomingAppointments = [
  { id: 1, patient: 'Nguyễn Văn A', time: '09:00', type: 'Tư vấn', status: 'confirmed' },
  { id: 2, patient: 'Trần Thị B', time: '10:30', type: 'Theo dõi', status: 'pending' },
  { id: 3, patient: 'Lê Văn C', time: '14:00', type: 'Tư vấn', status: 'confirmed' },
];

const ProviderDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const isDoctor = user?.role === 'doctor';

  return (
    <Box>
      {/* Welcome Card */}
      <Card
        sx={{
          mb: 3,
          background: isDoctor
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          color: 'white',
        }}
      >
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={user?.avatar}
              sx={{ width: 64, height: 64, border: '3px solid white' }}
            >
              {user?.fullName?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Xin chào, {isDoctor ? 'BS.' : ''} {user?.fullName}!
              </Typography>
              <Typography sx={{ opacity: 0.9 }}>
                {isDoctor ? 'Bác sĩ tâm lý' : 'Chuyên gia tư vấn'} | {user?.specialization || 'Tâm lý học'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Lịch hẹn hôm nay
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    5
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#667eea20', color: '#667eea' }}>
                  <CalendarMonth />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tổng bệnh nhân
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    128
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#764ba220', color: '#764ba2' }}>
                  <People />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Đánh giá
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    4.8
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#ff980020', color: '#ff9800' }}>
                  <Star />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Thu nhập tháng
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    12.5M
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#4caf5020', color: '#4caf50' }}>
                  <AccountBalanceWallet />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Upcoming Appointments */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Lịch hẹn hôm nay
                </Typography>
                <Button size="small">Xem tất cả</Button>
              </Box>
              <List>
                {upcomingAppointments.map((apt, index) => (
                  <React.Fragment key={apt.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar>{apt.patient.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={apt.patient}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Schedule fontSize="small" sx={{ fontSize: 14 }} />
                            {apt.time} - {apt.type}
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={apt.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ duyệt'}
                          size="small"
                          color={apt.status === 'confirmed' ? 'success' : 'warning'}
                        />
                        <Button size="small" variant="outlined">
                          Chi tiết
                        </Button>
                      </Box>
                    </ListItem>
                    {index < upcomingAppointments.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Side Panel */}
        <Grid item xs={12} md={4}>
          {/* Performance */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Hiệu suất tháng này
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Tỷ lệ hoàn thành</Typography>
                  <Typography variant="body2" fontWeight={500}>92%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={92} color="success" />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Đánh giá tích cực</Typography>
                  <Typography variant="body2" fontWeight={500}>96%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={96} color="primary" />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Tỷ lệ quay lại</Typography>
                  <Typography variant="body2" fontWeight={500}>78%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={78} color="secondary" />
              </Box>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Thao tác nhanh
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="outlined" fullWidth>
                  Cập nhật lịch làm việc
                </Button>
                <Button variant="outlined" fullWidth>
                  Xem yêu cầu đặt lịch
                </Button>
                <Button variant="outlined" fullWidth>
                  Gửi bài tập cho bệnh nhân
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProviderDashboard;
