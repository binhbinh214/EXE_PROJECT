import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
} from '@mui/material';
import { Add, Delete, Visibility, Edit } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { getMyJournals, deleteJournal } from '../../store/slices/journalSlice';

const moodConfig = {
  very_happy: { emoji: '😄', label: 'Rất vui', color: '#4caf50' },
  happy: { emoji: '😊', label: 'Vui vẻ', color: '#8bc34a' },
  neutral: { emoji: '😐', label: 'Bình thường', color: '#ff9800' },
  sad: { emoji: '😔', label: 'Buồn', color: '#ff5722' },
  very_sad: { emoji: '😢', label: 'Rất buồn', color: '#f44336' },
};

const Journal = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { journals, isLoading, pagination } = useSelector((state) => state.journal);
  const [page, setPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, journal: null });

  useEffect(() => {
    dispatch(getMyJournals({ page, limit: 9 }));
  }, [dispatch, page]);

  const handleDelete = async () => {
    try {
      await dispatch(deleteJournal(deleteDialog.journal._id)).unwrap();
      toast.success('Đã xóa nhật ký');
      setDeleteDialog({ open: false, journal: null });
    } catch (err) {
      toast.error(err || 'Không thể xóa nhật ký');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Nhật ký cảm xúc
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            component={Link}
            to="/emotion-stats"
            variant="outlined"
          >
            Xem thống kê
          </Button>
          <Button
            component={Link}
            to="/journal/create"
            variant="contained"
            startIcon={<Add />}
          >
            Viết nhật ký
          </Button>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : journals.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Chưa có nhật ký nào
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Hãy bắt đầu viết nhật ký để theo dõi cảm xúc của bạn
            </Typography>
            <Button
              component={Link}
              to="/journal/create"
              variant="contained"
              startIcon={<Add />}
            >
              Viết nhật ký đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={3}>
            {journals.map((journal) => {
              const mood = moodConfig[journal.mood] || moodConfig.neutral;
              return (
                <Grid item xs={12} md={6} lg={4} key={journal._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-4px)' },
                    }}
                  >
                    <CardContent sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Chip
                          label={`${mood.emoji} ${mood.label}`}
                          size="small"
                          sx={{ bgcolor: `${mood.color}20`, color: mood.color }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(journal.createdAt)}
                        </Typography>
                      </Box>
                      
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {journal.title || 'Không có tiêu đề'}
                      </Typography>
                      
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          mb: 2,
                        }}
                      >
                        {journal.content}
                      </Typography>

                      {journal.activities && journal.activities.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                          {journal.activities.slice(0, 3).map((activity, idx) => (
                            <Chip key={idx} label={activity} size="small" variant="outlined" />
                          ))}
                          {journal.activities.length > 3 && (
                            <Chip label={`+${journal.activities.length - 3}`} size="small" />
                          )}
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/journal/${journal._id}`)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteDialog({ open: true, journal })}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, journal: null })}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          Bạn có chắc chắn muốn xóa nhật ký này? Hành động này không thể hoàn tác.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, journal: null })}>
            Hủy
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Journal;
