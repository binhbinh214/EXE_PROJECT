import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import { TrendingUp, TrendingDown, SentimentSatisfied } from '@mui/icons-material';
import { getEmotionStats } from '../../store/slices/journalSlice';

const moodLabels = {
  very_happy: { emoji: '😄', label: 'Rất vui', color: '#4caf50' },
  happy: { emoji: '😊', label: 'Vui vẻ', color: '#8bc34a' },
  neutral: { emoji: '😐', label: 'Bình thường', color: '#ff9800' },
  sad: { emoji: '😔', label: 'Buồn', color: '#ff5722' },
  very_sad: { emoji: '😢', label: 'Rất buồn', color: '#f44336' },
};

const EmotionStats = () => {
  const dispatch = useDispatch();
  const { stats, isLoading } = useSelector((state) => state.journal);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    dispatch(getEmotionStats({ period }));
  }, [dispatch, period]);

  const getAverageMoodLabel = (score) => {
    if (score >= 9) return { ...moodLabels.very_happy, text: 'Tuyệt vời' };
    if (score >= 7) return { ...moodLabels.happy, text: 'Tốt' };
    if (score >= 5) return { ...moodLabels.neutral, text: 'Ổn' };
    if (score >= 3) return { ...moodLabels.sad, text: 'Cần cải thiện' };
    return { ...moodLabels.very_sad, text: 'Cần hỗ trợ' };
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const avgMood = stats?.averageMoodScore || 6;
  const moodInfo = getAverageMoodLabel(avgMood);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Thống kê cảm xúc
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <MenuItem value="week">7 ngày qua</MenuItem>
            <MenuItem value="month">30 ngày qua</MenuItem>
            <MenuItem value="year">Năm nay</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Average Mood Score */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Điểm tâm trạng trung bình
              </Typography>
              <Box sx={{ fontSize: 64, my: 2 }}>{moodInfo.emoji}</Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: moodInfo.color }}>
                {avgMood.toFixed(1)}/10
              </Typography>
              <Typography color="text.secondary">{moodInfo.text}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Journal Count */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Số nhật ký đã viết
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.main', my: 2 }}>
                {stats?.totalJournals || 0}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                {(stats?.trend || 0) >= 0 ? (
                  <TrendingUp color="success" />
                ) : (
                  <TrendingDown color="error" />
                )}
                <Typography color={stats?.trend >= 0 ? 'success.main' : 'error.main'}>
                  {stats?.trend >= 0 ? '+' : ''}{stats?.trend || 0}% so với kỳ trước
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Streak */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Chuỗi ngày viết liên tục
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 700, color: '#ff9800', my: 2 }}>
                {stats?.streak || 0}
              </Typography>
              <Typography color="text.secondary">
                {stats?.streak > 0 ? 'Tiếp tục phát huy! 🔥' : 'Bắt đầu viết nhật ký mỗi ngày!'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Mood Distribution */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Phân bố tâm trạng
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(moodLabels).map(([key, value]) => {
                  const count = stats?.moodDistribution?.[key] || 0;
                  const total = stats?.totalJournals || 1;
                  const percentage = (count / total) * 100;
                  
                  return (
                    <Grid item xs={12} sm={6} md={2.4} key={key}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography sx={{ fontSize: 40, mb: 1 }}>{value.emoji}</Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {value.label}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {count}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: `${value.color}20`,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: value.color,
                              },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {percentage.toFixed(0)}%
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Activities */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Hoạt động phổ biến
              </Typography>
              {stats?.topActivities?.length > 0 ? (
                stats.topActivities.map((activity, index) => (
                  <Box key={activity.name} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography>{activity.name}</Typography>
                      <Typography fontWeight={500}>{activity.count}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(activity.count / (stats.topActivities[0]?.count || 1)) * 100}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">Chưa có dữ liệu hoạt động</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sleep Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Thống kê giấc ngủ
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {stats?.averageSleep?.toFixed(1) || '0.0'}h
                    </Typography>
                    <Typography color="text.secondary">Trung bình/ngày</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {stats?.goodSleepDays || 0}
                    </Typography>
                    <Typography color="text.secondary">Ngày ngủ tốt</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmotionStats;
