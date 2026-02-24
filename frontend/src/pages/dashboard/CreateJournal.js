import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { createJournal } from '../../store/slices/journalSlice';

const moods = [
  { value: 'very_happy', emoji: '😄', label: 'Rất vui', score: 10 },
  { value: 'happy', emoji: '😊', label: 'Vui vẻ', score: 8 },
  { value: 'neutral', emoji: '😐', label: 'Bình thường', score: 6 },
  { value: 'sad', emoji: '😔', label: 'Buồn', score: 4 },
  { value: 'very_sad', emoji: '😢', label: 'Rất buồn', score: 2 },
];

const activities = [
  'Làm việc', 'Học tập', 'Tập thể dục', 'Đọc sách', 'Xem phim',
  'Gặp bạn bè', 'Gia đình', 'Du lịch', 'Thiền', 'Âm nhạc'
];

const CreateJournal = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.journal);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'neutral',
    moodScore: 6,
    activities: [],
    sleepHours: '',
    sleepQuality: 'good',
  });

  const handleMoodChange = (event, newMood) => {
    if (newMood) {
      const selectedMood = moods.find(m => m.value === newMood);
      setFormData({
        ...formData,
        mood: newMood,
        moodScore: selectedMood?.score || 6,
      });
    }
  };

  const handleActivityToggle = (activity) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      toast.error('Vui lòng nhập nội dung nhật ký');
      return;
    }

    try {
      await dispatch(createJournal({
        title: formData.title || `Nhật ký ngày ${new Date().toLocaleDateString('vi-VN')}`,
        content: formData.content,
        mood: formData.mood,
        moodScore: formData.moodScore,
        activities: formData.activities,
        sleep: {
          hours: parseFloat(formData.sleepHours) || null,
          quality: formData.sleepQuality,
        },
      })).unwrap();
      
      toast.success('Đã lưu nhật ký thành công!');
      navigate('/journal');
    } catch (err) {
      toast.error(err || 'Không thể lưu nhật ký');
    }
  };

  const selectedMood = moods.find(m => m.value === formData.mood);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/journal')}>
          Quay lại
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Viết nhật ký mới
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Hôm nay bạn cảm thấy thế nào?
            </Typography>
            <ToggleButtonGroup
              value={formData.mood}
              exclusive
              onChange={handleMoodChange}
              sx={{ mb: 2, flexWrap: 'wrap' }}
            >
              {moods.map((m) => (
                <ToggleButton
                  key={m.value}
                  value={m.value}
                  sx={{
                    px: 3,
                    py: 1.5,
                    flexDirection: 'column',
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                      color: 'primary.main',
                    },
                  }}
                >
                  <span style={{ fontSize: 32 }}>{m.emoji}</span>
                  <Typography variant="caption">{m.label}</Typography>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {selectedMood && (
              <Typography variant="body2" color="text.secondary">
                Điểm tâm trạng: {selectedMood.score}/10
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              label="Tiêu đề (tùy chọn)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="Ví dụ: Một ngày tuyệt vời"
            />
            <TextField
              fullWidth
              multiline
              rows={8}
              label="Nội dung nhật ký"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Hôm nay bạn đã làm gì? Cảm xúc của bạn như thế nào?..."
              required
            />
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Hoạt động trong ngày
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {activities.map((activity) => (
                <Chip
                  key={activity}
                  label={activity}
                  onClick={() => handleActivityToggle(activity)}
                  color={formData.activities.includes(activity) ? 'primary' : 'default'}
                  variant={formData.activities.includes(activity) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Giấc ngủ (tùy chọn)
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Số giờ ngủ"
                type="number"
                value={formData.sleepHours}
                onChange={(e) => setFormData({ ...formData, sleepHours: e.target.value })}
                inputProps={{ min: 0, max: 24, step: 0.5 }}
                sx={{ width: 150 }}
              />
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Chất lượng</InputLabel>
                <Select
                  value={formData.sleepQuality}
                  label="Chất lượng"
                  onChange={(e) => setFormData({ ...formData, sleepQuality: e.target.value })}
                >
                  <MenuItem value="excellent">Rất tốt</MenuItem>
                  <MenuItem value="good">Tốt</MenuItem>
                  <MenuItem value="fair">Bình thường</MenuItem>
                  <MenuItem value="poor">Kém</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
            disabled={isLoading}
          >
            {isLoading ? 'Đang lưu...' : 'Lưu nhật ký'}
          </Button>
          <Button variant="outlined" size="large" onClick={() => navigate('/journal')}>
            Hủy
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CreateJournal;
