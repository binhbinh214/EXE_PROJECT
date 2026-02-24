import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Avatar,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  CalendarMonth,
  Schedule,
  VideoCall,
  LocationOn,
  Phone,
  Email,
  Cancel,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { getAppointmentById, cancelAppointment } from '../../store/slices/appointmentSlice';

const statusConfig = {
  pending: { label: 'Chờ xác nhận', color: 'warning' },
  confirmed: { label: 'Đã xác nhận', color: 'info' },
  completed: { label: 'Hoàn thành', color: 'success' },
  cancelled: { label: 'Đã hủy', color: 'error' },
  rejected: { label: 'Từ chối', color: 'error' },
};

const sessionTypeLabels = {
  consultation: 'Tư vấn',
  therapy: 'Trị liệu',
  'follow-up': 'Tái khám',
};

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentAppointment: appointment, isLoading } = useSelector((state) => state.appointment);

  useEffect(() => {
    dispatch(getAppointmentById(id));
  }, [dispatch, id]);

  const handleCancel = async () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) {
      try {
        await dispatch(cancelAppointment(id)).unwrap();
        toast.success('Đã hủy lịch hẹn');
      } catch (err) {
        toast.error(err || 'Không thể hủy lịch hẹn');
      }
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!appointment) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Không tìm thấy lịch hẹn
        </Typography>
        <Button onClick={() => navigate('/appointments')} sx={{ mt: 2 }}>
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  const status = statusConfig[appointment.status] || statusConfig.pending;
  const provider = appointment.provider;
  const canCancel = ['pending', 'confirmed'].includes(appointment.status);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/appointments')}>
          Quay lại
        </Button>
        {canCancel && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Cancel />}
            onClick={handleCancel}
          >
            Hủy lịch
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Appointment Info */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Chi tiết lịch hẹn
                </Typography>
                <Chip label={status.label} color={status.color} />
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CalendarMonth color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Ngày hẹn
                      </Typography>
                      <Typography fontWeight={600}>
                        {formatDate(appointment.scheduledDate)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Schedule color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Giờ hẹn
                      </Typography>
                      <Typography fontWeight={600}>
                        {appointment.scheduledTime}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {appointment.appointmentType === 'online' ? (
                      <VideoCall color="primary" />
                    ) : (
                      <LocationOn color="primary" />
                    )}
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Hình thức
                      </Typography>
                      <Typography fontWeight={600}>
                        {appointment.appointmentType === 'online' ? 'Trực tuyến' : 'Trực tiếp'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Loại buổi hẹn
                    </Typography>
                    <Typography fontWeight={600}>
                      {sessionTypeLabels[appointment.sessionType] || appointment.sessionType}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Lý do khám
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                {appointment.reason || 'Không có thông tin'}
              </Typography>

              {appointment.notes && (
                <>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Ghi chú
                  </Typography>
                  <Typography color="text.secondary">
                    {appointment.notes}
                  </Typography>
                </>
              )}

              {/* Consultation Notes (if completed) */}
              {appointment.status === 'completed' && appointment.consultationNotes && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Ghi chú từ bác sĩ
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    {appointment.consultationNotes.diagnosis && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Chẩn đoán
                        </Typography>
                        <Typography>{appointment.consultationNotes.diagnosis}</Typography>
                      </Box>
                    )}
                    {appointment.consultationNotes.treatment && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Điều trị
                        </Typography>
                        <Typography>{appointment.consultationNotes.treatment}</Typography>
                      </Box>
                    )}
                    {appointment.consultationNotes.notes && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Ghi chú
                        </Typography>
                        <Typography>{appointment.consultationNotes.notes}</Typography>
                      </Box>
                    )}
                  </Card>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Thông tin thanh toán
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Phí tư vấn</Typography>
                <Typography fontWeight={600}>
                  {appointment.payment?.amount?.toLocaleString() || 0}đ
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Trạng thái</Typography>
                <Chip
                  label={appointment.payment?.status === 'completed' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  size="small"
                  color={appointment.payment?.status === 'completed' ? 'success' : 'warning'}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Provider Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Thông tin bác sĩ
              </Typography>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Avatar
                  src={provider?.avatar}
                  sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }}
                >
                  {provider?.fullName?.charAt(0)}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {provider?.role === 'doctor' ? 'BS. ' : ''}{provider?.fullName}
                </Typography>
                <Chip
                  label={provider?.specialization || 'Tâm lý'}
                  size="small"
                  color="primary"
                  sx={{ mt: 1 }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {provider?.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2">{provider.phone}</Typography>
                </Box>
              )}
              {provider?.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email fontSize="small" color="action" />
                  <Typography variant="body2">{provider.email}</Typography>
                </Box>
              )}

              {appointment.status === 'confirmed' && appointment.appointmentType === 'online' && (
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<VideoCall />}
                  sx={{ mt: 2 }}
                >
                  Tham gia cuộc gọi
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AppointmentDetail;
