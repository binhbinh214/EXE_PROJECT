import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
} from '@mui/material';
import { ArrowBack, Edit, Delete, Bed } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { getJournalById, deleteJournal } from '../../store/slices/journalSlice';

const moodConfig = {
  very_happy: { emoji: '😄', label: 'Rất vui', color: '#4caf50' },
  happy: { emoji: '😊', label: 'Vui vẻ', color: '#8bc34a' },
  neutral: { emoji: '😐', label: 'Bình thường', color: '#ff9800' },
  sad: { emoji: '😔', label: 'Buồn', color: '#ff5722' },
  very_sad: { emoji: '😢', label: 'Rất buồn', color: '#f44336' },
};

const sleepQualityLabels = {
  excellent: 'Rất tốt',
  good: 'Tốt',
  fair: 'Bình thường',
  poor: 'Kém',
};

const JournalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentJournal: journal, isLoading } = useSelector((state) => state.journal);

  useEffect(() => {
    dispatch(getJournalById(id));
  }, [dispatch, id]);

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhật ký này?')) {
      try {
        await dispatch(deleteJournal(id)).unwrap();
        toast.success('Đã xóa nhật ký');
        navigate('/journal');
      } catch (err) {
        toast.error(err || 'Không thể xóa nhật ký');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!journal) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Không tìm thấy nhật ký
        </Typography>
        <Button onClick={() => navigate('/journal')} sx={{ mt: 2 }}>
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  const mood = moodConfig[journal.mood] || moodConfig.neutral;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/journal')}>
          Quay lại
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleDelete}>
            Xóa
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(journal.createdAt)}
                </Typography>
                <Chip
                  label={`${mood.emoji} ${mood.label}`}
                  sx={{ bgcolor: `${mood.color}20`, color: mood.color }}
                />
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                {journal.title || 'Không có tiêu đề'}
              </Typography>

              <Typography
                variant="body1"
                sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}
              >
                {journal.content}
              </Typography>

              {journal.activities && journal.activities.length > 0 && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Hoạt động trong ngày
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {journal.activities.map((activity, idx) => (
                      <Chip key={idx} label={activity} variant="outlined" />
                    ))}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Mood Score Card */}
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Điểm tâm trạng
              </Typography>
              <Typography sx={{ fontSize: 64, my: 1 }}>{mood.emoji}</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: mood.color }}>
                {journal.moodScore || 6}/10
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {mood.label}
              </Typography>
            </CardContent>
          </Card>

          {/* Sleep Info Card */}
          {journal.sleep && (journal.sleep.hours || journal.sleep.quality) && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Bed color="action" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Giấc ngủ
                  </Typography>
                </Box>
                {journal.sleep.hours && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="text.secondary">Số giờ ngủ</Typography>
                    <Typography fontWeight={600}>{journal.sleep.hours} giờ</Typography>
                  </Box>
                )}
                {journal.sleep.quality && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Chất lượng</Typography>
                    <Chip
                      label={sleepQualityLabels[journal.sleep.quality] || journal.sleep.quality}
                      size="small"
                      color={journal.sleep.quality === 'excellent' || journal.sleep.quality === 'good' ? 'success' : 'default'}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sentiment Analysis Card */}
          {journal.sentiment && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Phân tích cảm xúc
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Điểm</Typography>
                  <Typography fontWeight={600}>
                    {(journal.sentiment.score * 100).toFixed(0)}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Xu hướng</Typography>
                  <Chip
                    label={journal.sentiment.label}
                    size="small"
                    color={journal.sentiment.label === 'positive' ? 'success' : journal.sentiment.label === 'negative' ? 'error' : 'default'}
                  />
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default JournalDetail;
