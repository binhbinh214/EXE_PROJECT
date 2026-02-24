import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  TextField,
  InputAdornment,
  Chip,
  Rating,
  Pagination,
  CircularProgress,
  Button,
} from '@mui/material';
import { Search, LocationOn, Star } from '@mui/icons-material';

import { getDoctors } from '../store/slices/userSlice';

const Doctors = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const dispatch = useDispatch();
  const { doctors, isLoading, pagination } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getDoctors({ page, search, limit: 9 }));
  }, [dispatch, page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    dispatch(getDoctors({ page: 1, search, limit: 9 }));
  };

  return (
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 6,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Đội ngũ Bác sĩ
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
            Tìm và đặt lịch với các bác sĩ tâm lý hàng đầu
          </Typography>
          <Box component="form" onSubmit={handleSearch} sx={{ maxWidth: 500 }}>
            <TextField
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tên, chuyên môn..."
              sx={{
                bgcolor: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : doctors.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Không tìm thấy bác sĩ nào
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {doctors.map((doctor) => (
                <Grid item xs={12} sm={6} md={4} key={doctor._id}>
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          src={doctor.avatar}
                          sx={{ width: 80, height: 80, mr: 2 }}
                        >
                          {doctor.fullName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {doctor.fullName}
                          </Typography>
                          <Chip
                            label={doctor.specialization || 'Tâm lý học'}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={doctor.rating || 0} precision={0.1} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({doctor.totalRatings || 0} đánh giá)
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {doctor.bio?.slice(0, 100) || 'Chuyên gia tâm lý với nhiều năm kinh nghiệm'}
                        {doctor.bio?.length > 100 && '...'}
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" color="primary">
                          {doctor.consultationFee?.toLocaleString() || '500,000'}đ
                        </Typography>
                        <Button
                          component={Link}
                          to={`/provider/${doctor._id}`}
                          variant="contained"
                          size="small"
                        >
                          Xem chi tiết
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {pagination.pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={pagination.pages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default Doctors;
