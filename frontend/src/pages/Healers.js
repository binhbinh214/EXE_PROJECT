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
import { Search } from '@mui/icons-material';

import { getHealers } from '../store/slices/userSlice';

const Healers = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const dispatch = useDispatch();
  const { healers, isLoading, pagination } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getHealers({ page, search, limit: 9 }));
  }, [dispatch, page, search]);

  return (
    <Box sx={{ py: 4 }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          color: 'white',
          py: 6,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Chuyên gia Tâm lý
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
            Kết nối và trò chuyện với các chuyên gia tâm lý
          </Typography>
          <Box sx={{ maxWidth: 500 }}>
            <TextField
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm chuyên gia..."
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
        ) : healers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Không tìm thấy chuyên gia nào
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {healers.map((healer) => (
              <Grid item xs={12} sm={6} md={4} key={healer._id}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'translateY(-8px)' },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar src={healer.avatar} sx={{ width: 80, height: 80, mr: 2 }}>
                        {healer.fullName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {healer.fullName}
                        </Typography>
                        <Chip label="Chuyên gia" size="small" color="success" variant="outlined" />
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={healer.rating || 0} readOnly size="small" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({healer.totalRatings || 0})
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {healer.bio?.slice(0, 100) || 'Chuyên gia tư vấn tâm lý'}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" color="success.main">
                        {healer.chatRatePerMinute?.toLocaleString() || '5,000'}đ/phút
                      </Typography>
                      <Button
                        component={Link}
                        to={`/provider/${healer._id}`}
                        variant="contained"
                        color="success"
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
        )}

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
      </Container>
    </Box>
  );
};

export default Healers;
