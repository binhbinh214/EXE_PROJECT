import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Button,
  Chip,
  Rating,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack,
  CalendarMonth,
  Star,
  WorkHistory,
  School,
  LocalHospital,
  Schedule,
  Verified,
} from '@mui/icons-material';
import { getProviderById } from '../store/slices/userSlice';

const ProviderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedProvider: provider, isLoading } = useSelector((state) => state.user);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getProviderById(id));
  }, [dispatch, id]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!provider) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Không tìm thấy thông tin
          </Typography>
          <Button onClick={() => navigate('/doctors')} sx={{ mt: 2 }}>
            Quay lại danh sách
          </Button>
        </Box>
      </Container>
    );
  }

  const isDoctor = provider.role === 'doctor';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        Quay lại
      </Button>

      <Grid container spacing={4}>
        {/* Left Column - Profile */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={provider.avatar}
                sx={{ width: 150, height: 150, mx: 'auto', mb: 2, fontSize: 64 }}
              >
                {provider.fullName?.charAt(0)}
              </Avatar>

              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {isDoctor ? 'BS. ' : ''}{provider.fullName}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1, mb: 2 }}>
                <Chip
                  label={provider.specialization || 'Tâm lý học'}
                  color="primary"
                />
                {provider.isProfileVerified && (
                  <Chip
                    icon={<Verified />}
                    label="Đã xác thực"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Rating value={provider.rating || 0} precision={0.1} readOnly />
                <Typography sx={{ ml: 1 }}>
                  ({provider.totalRatings || 0} đánh giá)
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <List dense>
                <ListItem>
                  <ListItemIcon><WorkHistory /></ListItemIcon>
                  <ListItemText
                    primary={`${provider.experienceYears || 0} năm kinh nghiệm`}
                  />
                </ListItem>
                {provider.qualifications && provider.qualifications.length > 0 && (
                  <ListItem>
                    <ListItemIcon><School /></ListItemIcon>
                    <ListItemText primary={provider.qualifications.join(', ')} />
                  </ListItem>
                )}
                {provider.licenseNumber && (
                  <ListItem>
                    <ListItemIcon><LocalHospital /></ListItemIcon>
                    <ListItemText primary={`Số giấy phép: ${provider.licenseNumber}`} />
                  </ListItem>
                )}
              </List>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ textAlign: 'left', mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Phí tư vấn
                </Typography>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                  {(provider.consultationFee || 0).toLocaleString()}đ
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  /buổi
                </Typography>
              </Box>

              {isAuthenticated ? (
                <Button
                  component={Link}
                  to={`/book-appointment/${provider._id}`}
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<CalendarMonth />}
                >
                  Đặt lịch hẹn
                </Button>
              ) : (
                <Button
                  component={Link}
                  to="/login"
                  variant="contained"
                  size="large"
                  fullWidth
                >
                  Đăng nhập để đặt lịch
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Giới thiệu
              </Typography>
              <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                {provider.bio || 'Chưa có thông tin giới thiệu.'}
              </Typography>
            </CardContent>
          </Card>

          {provider.availability && provider.availability.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Lịch làm việc
                </Typography>
                <Grid container spacing={1}>
                  {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, index) => {
                    const schedule = provider.availability.find(a => a.dayOfWeek === index);
                    return (
                      <Grid item xs={6} sm={4} md={3} key={day}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 1,
                            bgcolor: schedule ? 'success.lighter' : 'grey.100',
                            textAlign: 'center',
                          }}
                        >
                          <Typography fontWeight={600}>{day}</Typography>
                          {schedule ? (
                            <Typography variant="body2" color="success.main">
                              {schedule.startTime} - {schedule.endTime}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Nghỉ
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                <Star sx={{ mr: 1, verticalAlign: 'middle', color: 'warning.main' }} />
                Đánh giá từ bệnh nhân
              </Typography>

              {provider.totalRatings > 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h2" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {provider.rating?.toFixed(1)}
                  </Typography>
                  <Rating value={provider.rating || 0} readOnly size="large" sx={{ my: 1 }} />
                  <Typography color="text.secondary">
                    Dựa trên {provider.totalRatings} đánh giá
                  </Typography>
                </Box>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Chưa có đánh giá nào
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProviderDetail;
