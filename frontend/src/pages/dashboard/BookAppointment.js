import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Avatar,
  Chip,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  ArrowBack,
  CalendarMonth,
  VideoCall,
  LocationOn,
  Warning,
  Chat,
  AccountBalanceWallet,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { getProviderById } from "../../store/slices/userSlice";
import { getMe } from "../../store/slices/authSlice";
import appointmentService from "../../services/appointment.service";

const timeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

const BookAppointment = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedProvider: currentProvider, isLoading: loadingProvider } =
    useSelector((state) => state.user);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    sessionType: "consultation",
    appointmentType: "online",
    reasonForVisit: "",
    patientNotes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  useEffect(() => {
    if (providerId) {
      dispatch(getProviderById(providerId));
    }
  }, [dispatch, providerId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.scheduledDate || !formData.scheduledTime) {
      setError("Vui lòng chọn ngày và giờ hẹn");
      return;
    }

    if (!formData.reasonForVisit.trim()) {
      setError("Vui lòng nhập lý do khám");
      return;
    }

    // Check balance
    const fee = currentProvider?.consultationFee || 0;
    if ((user?.balance || 0) < fee) {
      setError(
        `Số dư không đủ. Vui lòng nạp thêm ${(
          fee - (user?.balance || 0)
        ).toLocaleString()}đ`
      );
      return;
    }

    // Open confirmation dialog
    setOpenConfirmDialog(true);
  };

  const handleConfirmBooking = async () => {
    setOpenConfirmDialog(false);

    try {
      setLoading(true);

      const appointmentData = {
        providerId,
        providerType: currentProvider.role,
        sessionType: formData.sessionType,
        appointmentType: formData.appointmentType,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        reasonForVisit: formData.reasonForVisit,
        patientNotes: formData.patientNotes,
      };

      console.log("=== BOOKING APPOINTMENT ===");
      console.log("Appointment data:", appointmentData);

      const response = await appointmentService.createAppointment(
        appointmentData
      );

      console.log("Booking response:", response.data);

      if (response.data.success) {
        // ===== REFRESH USER BALANCE =====
        await dispatch(getMe()).unwrap();
        console.log("✅ User balance refreshed");
        // ================================

        toast.success(response.data.message || "Đặt lịch thành công!");

        setTimeout(() => {
          navigate("/appointments");
        }, 1500);
      }
    } catch (err) {
      console.error("Create appointment error:", err);
      console.error("Error response:", err.response?.data);
      const errorMsg =
        err.response?.data?.message || "Không thể đặt lịch. Vui lòng thử lại.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChatWithProvider = () => {
    navigate("/messages", {
      state: {
        otherUser: currentProvider,
      },
    });
  };

  const handleGoToDeposit = () => {
    navigate("/deposit");
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const getSessionTypeLabel = (type) => {
    const labels = {
      consultation: "Tư vấn",
      therapy: "Trị liệu",
      "follow-up": "Tái khám",
    };
    return labels[type] || type;
  };

  const getAppointmentTypeLabel = (type) => {
    return type === "online" ? "Trực tuyến" : "Trực tiếp";
  };

  if (loadingProvider) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 8,
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Đang tải thông tin...</Typography>
      </Box>
    );
  }

  if (!currentProvider) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Không tìm thấy thông tin bác sĩ/chuyên gia
        </Alert>
        <Button variant="contained" onClick={() => navigate("/doctors")}>
          Quay lại danh sách bác sĩ
        </Button>
      </Box>
    );
  }

  const consultationFee = currentProvider?.consultationFee || 0;
  const hasEnoughBalance = (user?.balance || 0) >= consultationFee;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
          Quay lại
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Đặt lịch hẹn
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Provider Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Avatar
                  src={currentProvider.avatar}
                  sx={{ width: 100, height: 100, mx: "auto", mb: 2 }}
                >
                  {currentProvider.fullName?.charAt(0)}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {currentProvider.role === "doctor" ? "BS. " : ""}
                  {currentProvider.fullName}
                </Typography>
                <Chip
                  label={currentProvider.specialization || "Tâm lý học"}
                  size="small"
                  color="primary"
                  sx={{ mt: 1 }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <Rating
                  value={currentProvider.rating || 0}
                  precision={0.1}
                  readOnly
                  size="small"
                />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({currentProvider.totalRatings || 0})
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography color="text.secondary">Phí tư vấn:</Typography>
                <Typography fontWeight={600} color="primary">
                  {consultationFee.toLocaleString()}đ
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography color="text.secondary">Kinh nghiệm:</Typography>
                <Typography>
                  {currentProvider.experienceYears || 0} năm
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography color="text.secondary">Số dư của bạn:</Typography>
                <Typography
                  fontWeight={600}
                  color={hasEnoughBalance ? "success.main" : "error.main"}
                >
                  {(user?.balance || 0).toLocaleString()}đ
                </Typography>
              </Box>

              {!hasEnoughBalance && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Bạn cần nạp thêm{" "}
                    {(consultationFee - (user?.balance || 0)).toLocaleString()}đ
                    để đặt lịch
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AccountBalanceWallet />}
                    onClick={handleGoToDeposit}
                    fullWidth
                  >
                    Nạp tiền ngay
                  </Button>
                </Alert>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Chat Button */}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Chat />}
                onClick={handleChatWithProvider}
                sx={{ mb: 1 }}
              >
                Nhắn tin với{" "}
                {currentProvider.role === "doctor" ? "bác sĩ" : "chuyên gia"}
              </Button>

              {/* Provider Info */}
              {currentProvider.bio && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Giới thiệu
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {currentProvider.bio}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Booking Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Thông tin đặt lịch
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Date and Time */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      name="scheduledDate"
                      label="Ngày hẹn"
                      value={formData.scheduledDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: getMinDate() }}
                      required
                      helperText="Đặt lịch trước ít nhất 1 ngày"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Giờ hẹn</InputLabel>
                      <Select
                        name="scheduledTime"
                        value={formData.scheduledTime}
                        label="Giờ hẹn"
                        onChange={handleChange}
                      >
                        {timeSlots.map((time) => (
                          <MenuItem key={time} value={time}>
                            {time}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Session Type and Appointment Type */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Loại buổi hẹn</InputLabel>
                      <Select
                        name="sessionType"
                        value={formData.sessionType}
                        label="Loại buổi hẹn"
                        onChange={handleChange}
                      >
                        <MenuItem value="consultation">
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              Tư vấn
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Buổi tư vấn lần đầu
                            </Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="therapy">
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              Trị liệu
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Buổi điều trị tâm lý
                            </Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="follow-up">
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              Tái khám
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Theo dõi tiến độ
                            </Typography>
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Hình thức</InputLabel>
                      <Select
                        name="appointmentType"
                        value={formData.appointmentType}
                        label="Hình thức"
                        onChange={handleChange}
                      >
                        <MenuItem value="online">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <VideoCall fontSize="small" color="primary" />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                Trực tuyến
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Qua video call
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                        <MenuItem value="in-person">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <LocationOn fontSize="small" color="primary" />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                Trực tiếp
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Gặp trực tiếp
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Reason for Visit */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      name="reasonForVisit"
                      label="Lý do khám / Vấn đề gặp phải"
                      value={formData.reasonForVisit}
                      onChange={handleChange}
                      placeholder="Mô tả ngắn gọn vấn đề bạn đang gặp phải... Ví dụ: Lo âu, stress, trầm cảm, rối loạn giấc ngủ, vấn đề gia đình..."
                      required
                      helperText={`${formData.reasonForVisit.length}/500 ký tự`}
                      inputProps={{ maxLength: 500 }}
                    />
                  </Grid>

                  {/* Patient Notes */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      name="patientNotes"
                      label="Ghi chú thêm (tùy chọn)"
                      value={formData.patientNotes}
                      onChange={handleChange}
                      placeholder="Thông tin bổ sung cho bác sĩ... Ví dụ: Tiền sử bệnh, thuốc đang dùng, yêu cầu đặc biệt..."
                      helperText={`${formData.patientNotes.length}/500 ký tự`}
                      inputProps={{ maxLength: 500 }}
                    />
                  </Grid>

                  {/* Important Notes */}
                  <Grid item xs={12}>
                    <Alert severity="info" icon={<Warning />}>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Lưu ý quan trọng:
                      </Typography>
                      <Typography variant="body2" component="div">
                        • Số tiền{" "}
                        <strong>{consultationFee.toLocaleString()}đ</strong> sẽ
                        được trừ ngay sau khi đặt lịch
                      </Typography>
                      <Typography variant="body2" component="div">
                        • Hủy trước 24h: hoàn <strong>100%</strong> tiền
                      </Typography>
                      <Typography variant="body2" component="div">
                        • Hủy trong 24h: chỉ hoàn <strong>50%</strong> tiền
                      </Typography>
                      <Typography variant="body2" component="div">
                        • Bác sĩ từ chối: hoàn <strong>100%</strong> tiền
                      </Typography>
                    </Alert>
                  </Grid>

                  {/* Submit Button */}
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={loading || !hasEnoughBalance}
                      startIcon={
                        loading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <CalendarMonth />
                        )
                      }
                      sx={{ py: 1.5 }}
                    >
                      {loading
                        ? "Đang xử lý..."
                        : !hasEnoughBalance
                        ? "Số dư không đủ"
                        : `Đặt lịch ngay (${consultationFee.toLocaleString()}đ)`}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarMonth color="primary" />
            <Typography variant="h6">Xác nhận đặt lịch</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600}>
              Số tiền sẽ được trừ ngay sau khi xác nhận đặt lịch
            </Typography>
          </Alert>

          <List>
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body2" color="text.secondary">
                    Bác sĩ/Chuyên gia
                  </Typography>
                }
                secondary={
                  <Typography variant="body1" fontWeight={600}>
                    {currentProvider?.fullName}
                  </Typography>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body2" color="text.secondary">
                    Chuyên khoa
                  </Typography>
                }
                secondary={
                  <Typography variant="body1">
                    {currentProvider?.specialization}
                  </Typography>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body2" color="text.secondary">
                    Ngày hẹn
                  </Typography>
                }
                secondary={
                  <Typography variant="body1" fontWeight={600}>
                    {new Date(formData.scheduledDate).toLocaleDateString(
                      "vi-VN",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </Typography>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body2" color="text.secondary">
                    Giờ hẹn
                  </Typography>
                }
                secondary={
                  <Typography variant="body1" fontWeight={600}>
                    {formData.scheduledTime}
                  </Typography>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body2" color="text.secondary">
                    Loại buổi hẹn
                  </Typography>
                }
                secondary={
                  <Typography variant="body1">
                    {getSessionTypeLabel(formData.sessionType)}
                  </Typography>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body2" color="text.secondary">
                    Hình thức
                  </Typography>
                }
                secondary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {formData.appointmentType === "online" ? (
                      <VideoCall fontSize="small" />
                    ) : (
                      <LocationOn fontSize="small" />
                    )}
                    <Typography variant="body1">
                      {getAppointmentTypeLabel(formData.appointmentType)}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body2" color="text.secondary">
                    Lý do khám
                  </Typography>
                }
                secondary={
                  <Typography variant="body2">
                    {formData.reasonForVisit}
                  </Typography>
                }
              />
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="h6" fontWeight={600}>
                    Tổng chi phí
                  </Typography>
                }
                secondary={
                  <Typography variant="h5" color="primary" fontWeight={600}>
                    {consultationFee.toLocaleString()}đ
                  </Typography>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body2" color="text.secondary">
                    Số dư hiện tại
                  </Typography>
                }
                secondary={
                  <Typography variant="body1" fontWeight={600}>
                    {(user?.balance || 0).toLocaleString()}đ
                  </Typography>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body2" color="text.secondary">
                    Số dư sau khi thanh toán
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="body1"
                    color="success.main"
                    fontWeight={600}
                  >
                    {((user?.balance || 0) - consultationFee).toLocaleString()}đ
                  </Typography>
                }
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setOpenConfirmDialog(false)}
            variant="outlined"
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmBooking}
            variant="contained"
            disabled={loading}
            startIcon={
              loading && <CircularProgress size={20} color="inherit" />
            }
          >
            {loading ? "Đang xử lý..." : "Xác nhận đặt lịch"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookAppointment;
