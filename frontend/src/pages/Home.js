import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Rating,
  Chip,
} from '@mui/material';
import {
  Psychology,
  SelfImprovement,
  Chat,
  CalendarMonth,
  Book,
  TrendingUp,
} from '@mui/icons-material';
import { getDoctors } from '../store/slices/userSlice';
import { getFeaturedContents } from '../store/slices/contentSlice';

const features = [
  {
    icon: <CalendarMonth sx={{ fontSize: 40 }} />,
    title: 'Đặt lịch với chuyên gia',
    description: 'Đặt lịch hẹn trực tuyến với bác sĩ và chuyên gia tâm lý hàng đầu',
    color: '#667eea',
  },
  {
    icon: <Book sx={{ fontSize: 40 }} />,
    title: 'Nhật ký cảm xúc',
    description: 'Ghi chép và theo dõi cảm xúc hàng ngày với phân tích thông minh',
    color: '#764ba2',
  },
  {
    icon: <SelfImprovement sx={{ fontSize: 40 }} />,
    title: 'Thiền & Thư giãn',
    description: 'Thư viện các bài thiền, bài tập thở và nội dung thư giãn',
    color: '#11998e',
  },
  {
    icon: <Chat sx={{ fontSize: 40 }} />,
    title: 'AI Chatbot 24/7',
    description: 'Trợ lý AI luôn sẵn sàng lắng nghe và hỗ trợ bạn mọi lúc',
    color: '#f093fb',
  },
  {
    icon: <TrendingUp sx={{ fontSize: 40 }} />,
    title: 'Thống kê sức khỏe',
    description: 'Theo dõi xu hướng sức khỏe tinh thần qua biểu đồ trực quan',
    color: '#ff9800',
  },
  {
    icon: <Psychology sx={{ fontSize: 40 }} />,
    title: 'Đội ngũ chuyên gia',
    description: 'Được hỗ trợ bởi các bác sĩ tâm thần và chuyên gia tâm lý giàu kinh nghiệm',
    color: '#e91e63',
  },
];

const Home = () => {
  const dispatch = useDispatch();
  const { doctors } = useSelector((state) => state.user);
  const { featuredContents } = useSelector((state) => state.content);

  useEffect(() => {
    dispatch(getDoctors({ limit: 4 }));
    dispatch(getFeaturedContents());
  }, [dispatch]);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
                Chăm sóc sức khỏe tinh thần của bạn
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, lineHeight: 1.8 }}>
                Nền tảng toàn diện giúp bạn theo dõi, cải thiện và duy trì sức khỏe tinh thần 
                với sự hỗ trợ của đội ngũ chuyên gia và công nghệ AI tiên tiến.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                >
                  Bắt đầu miễn phí
                </Button>
                <Button
                  component={Link}
                  to="/doctors"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  Xem bác sĩ
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600"
                alt="Mental Health"
                sx={{
                  width: '100%',
                  borderRadius: 4,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Tính năng nổi bật
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Mọi thứ bạn cần để chăm sóc sức khỏe tinh thần
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: `${feature.color}20`,
                      color: feature.color,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Doctors Section */}
      {doctors && doctors.length > 0 && (
        <Box sx={{ bgcolor: 'grey.50', py: 10 }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  Đội ngũ bác sĩ
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Các chuyên gia tâm lý hàng đầu
                </Typography>
              </Box>
              <Button component={Link} to="/doctors" variant="outlined">
                Xem tất cả
              </Button>
            </Box>

            <Grid container spacing={3}>
              {doctors.slice(0, 4).map((doctor) => (
                <Grid item xs={12} sm={6} md={3} key={doctor._id}>
                  <Card
                    component={Link}
                    to={`/provider/${doctor._id}`}
                    sx={{
                      textDecoration: 'none',
                      transition: 'transform 0.3s',
                      '&:hover': { transform: 'translateY(-8px)' },
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Avatar
                        src={doctor.avatar}
                        sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                      >
                        {doctor.fullName?.charAt(0)}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {doctor.fullName}
                      </Typography>
                      <Chip
                        label={doctor.specialization || 'Tâm lý học'}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ my: 1 }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Rating value={doctor.rating || 0} size="small" readOnly />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          ({doctor.totalRatings || 0})
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* Content Section */}
      {featuredContents && featuredContents.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 10 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                Thiền & Thư giãn
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Nội dung được đề xuất cho bạn
              </Typography>
            </Box>
            <Button component={Link} to="/meditation" variant="outlined">
              Xem tất cả
            </Button>
          </Box>

          <Grid container spacing={3}>
            {featuredContents.slice(0, 4).map((content) => (
              <Grid item xs={12} sm={6} md={3} key={content._id}>
                <Card
                  component={Link}
                  to={`/content/${content._id}`}
                  sx={{
                    textDecoration: 'none',
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'translateY(-8px)' },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={content.thumbnailUrl || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400'}
                    alt={content.title}
                  />
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {content.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Math.floor((content.duration || 0) / 60)} phút
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      )}

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          color: 'white',
          py: 10,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Sẵn sàng bắt đầu hành trình?
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
            Đăng ký ngay hôm nay và nhận ưu đãi đặc biệt cho lần tư vấn đầu tiên
          </Typography>
          <Button
            component={Link}
            to="/register"
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'white',
              color: '#11998e',
              px: 6,
              py: 2,
              fontSize: '1.1rem',
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            Đăng ký miễn phí
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
