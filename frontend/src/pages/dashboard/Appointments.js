import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Avatar,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Rating,
  TextField,
} from '@mui/material';
import {
  CalendarMonth,
  Schedule,
  VideoCall,
  LocationOn,
  Cancel,
  Star,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { getMyAppointments, cancelAppointment, rateAppointment } from '../../store/slices/appointmentSlice';

const statusConfig = {
  pending: { label: 'Chờ xác nhận', color: 'warning' },
  confirmed: { label: 'Đã xác nhận', color: 'info' },
  completed: { label: 'Hoàn thành', color: 'success' },
  cancelled: { label: 'Đã hủy', color: 'error' },
  rejected: { label: 'Từ chối', color: 'error' },
};

const Appointments = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { appointments, isLoading } = useSelector((state) => state.appointment);
  
  const [tab, setTab] = useState(0);
  const [cancelDialog, setCancelDialog] = useState({ open: false, appointment: null });
  const [rateDialog, setRateDialog] = useState({ open: false, appointment: null, rating: 5, comment: '' });

  useEffect(() => {
    dispatch(getMyAppointments());
  }, [dispatch]);

  const handleCancel = async () => {
    try {
      await dispatch(cancelAppointment(cancelDialog.appointment._id)).unwrap();
      toast.success('Đã hủy lịch hẹn');
      setCancelDialog({ open: false, appointment: null });
    } catch (err) {
      toast.error(err || 'Không thể hủy lịch hẹn');
    }
  };

  const handleRate = async () => {
    try {
      await dispatch(rateAppointment({
        id: rateDialog.appointment._id,
        rating: rateDialog.rating,
        review: rateDialog.comment,
      })).unwrap();
      toast.success('Cảm ơn bạn đã đánh giá!');
      setRateDialog({ open: false, appointment: null, rating: 5, comment: '' });
    } catch (err) {
      toast.error(err || 'Không thể gửi đánh giá');
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

  const filterAppointments = () => {
    if (!appointments) return [];
    switch (tab) {
      case 1: return appointments.filter(a => ['pending', 'confirmed'].includes(a.status));
      case 2: return appointments.filter(a => a.status === 'completed');
      case 3: return appointments.filter(a => ['cancelled', 'rejected'].includes(a.status));
      default: return appointments;
    }
  };

  const canCancel = (appointment) => {
    return ['pending', 'confirmed'].includes(appointment.status);
  };

  const canRate = (appointment) => {
    return appointment.status === 'completed' && !appointment.rating?.byPatient;
  };

  const filteredAppointments = filterAppointments();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Lịch hẹn của tôi
        </Typography>
        <Button
          component={Link}
          to="/doctors"
          variant="contained"
          startIcon={<CalendarMonth />}
        >
          Đặt lịch mới
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`Tất cả (${appointments?.length || 0})`} />
          <Tab label="Sắp tới" />
          <Tab label="Hoàn thành" />
          <Tab label="Đã hủy" />
        </Tabs>
      </Card>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredAppointments.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không có lịch hẹn nào
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Hãy đặt lịch với bác sĩ để được tư vấn
            </Typography>
            <Button
              component={Link}
              to="/doctors"
              variant="contained"
            >
              Xem danh sách bác sĩ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredAppointments.map((appointment) => {
            const status = statusConfig[appointment.status] || statusConfig.pending;
            const provider = appointment.provider;

            return (
              <Grid item xs={12} key={appointment._id}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={provider?.avatar}
                            sx={{ width: 56, height: 56 }}
                          >
                            {provider?.fullName?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {provider?.role === 'doctor' ? 'BS. ' : ''}{provider?.fullName}
                            </Typography>
                            <Chip
                              label={provider?.specialization || 'Tâm lý'}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CalendarMonth fontSize="small" color="action" />
                          <Typography>{formatDate(appointment.scheduledDate)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule fontSize="small" color="action" />
                          <Typography>{appointment.scheduledTime}</Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6} md={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          {appointment.appointmentType === 'online' ? (
                            <VideoCall fontSize="small" color="primary" />
                          ) : (
                            <LocationOn fontSize="small" color="primary" />
                          )}
                          <Typography variant="body2">
                            {appointment.appointmentType === 'online' ? 'Trực tuyến' : 'Trực tiếp'}
                          </Typography>
                        </Box>
                        <Chip
                          label={status.label}
                          color={status.color}
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {canRate(appointment) && (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Star />}
                              onClick={() => setRateDialog({ open: true, appointment, rating: 5, comment: '' })}
                            >
                              Đánh giá
                            </Button>
                          )}
                          {canCancel(appointment) && (
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              startIcon={<Cancel />}
                              onClick={() => setCancelDialog({ open: true, appointment })}
                            >
                              Hủy
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => navigate(`/appointments/${appointment._id}`)}
                          >
                            Chi tiết
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>

                    {appointment.reason && (
                      <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Lý do:</strong> {appointment.reason}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog.open} onClose={() => setCancelDialog({ open: false, appointment: null })}>
        <DialogTitle>Xác nhận hủy lịch</DialogTitle>
        <DialogContent>
          Bạn có chắc chắn muốn hủy lịch hẹn này? Số tiền sẽ được hoàn lại vào ví của bạn.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog({ open: false, appointment: null })}>
            Không
          </Button>
          <Button onClick={handleCancel} color="error" variant="contained">
            Xác nhận hủy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rate Dialog */}
      <Dialog open={rateDialog.open} onClose={() => setRateDialog({ open: false, appointment: null, rating: 5, comment: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Đánh giá buổi tư vấn</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography gutterBottom>Bạn hài lòng với buổi tư vấn như thế nào?</Typography>
            <Rating
              value={rateDialog.rating}
              onChange={(e, v) => setRateDialog({ ...rateDialog, rating: v })}
              size="large"
              sx={{ my: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Nhận xét (tùy chọn)"
              value={rateDialog.comment}
              onChange={(e) => setRateDialog({ ...rateDialog, comment: e.target.value })}
              placeholder="Chia sẻ trải nghiệm của bạn..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRateDialog({ open: false, appointment: null, rating: 5, comment: '' })}>
            Hủy
          </Button>
          <Button onClick={handleRate} variant="contained">
            Gửi đánh giá
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Appointments;
