import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Divider,
  TextField,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Visibility,
  VideoCall,
  LocationOn,
  Warning,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import appointmentService from "../../services/appointment.service";

const ProviderAppointments = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [appointmentToReject, setAppointmentToReject] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const statusMap = {
    0: "pending",
    1: "confirmed",
    2: "completed",
    3: "cancelled",
  };

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const status = statusMap[activeTab];

      const response = await appointmentService.getProviderAppointments({
        status,
      });

      if (response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Không thể tải danh sách lịch hẹn");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    const appointment = appointments.find((a) => a._id === appointmentId);

    if (!appointment) return;

    const confirmed = window.confirm(
      `Xác nhận lịch hẹn?\n\n` +
        `Bệnh nhân: ${appointment.patient?.fullName}\n` +
        `Ngày: ${new Date(appointment.scheduledDate).toLocaleDateString(
          "vi-VN"
        )}\n` +
        `Giờ: ${appointment.scheduledTime}\n` +
        `Phí: ${appointment.fee?.toLocaleString()}đ\n\n` +
        `Bệnh nhân đã thanh toán. Bạn có chắc chắn xác nhận?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      const response = await appointmentService.updateAppointmentStatus(
        appointmentId,
        "confirmed"
      );

      if (response.data.success) {
        toast.success("Đã chấp nhận lịch hẹn");
        fetchAppointments();
      }
    } catch (error) {
      console.error("Error confirming appointment:", error);
      toast.error(
        error.response?.data?.message || "Không thể xác nhận lịch hẹn"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRejectDialog = (appointment) => {
    setAppointmentToReject(appointment);
    setRejectionReason("");
    setOpenRejectDialog(true);
  };

  const handleRejectAppointment = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      setActionLoading(true);
      const response = await appointmentService.updateAppointmentStatus(
        appointmentToReject._id,
        "rejected"
      );

      if (response.data.success) {
        toast.success("Đã từ chối lịch hẹn. Đã hoàn tiền cho bệnh nhân.");
        setOpenRejectDialog(false);
        setAppointmentToReject(null);
        setRejectionReason("");
        fetchAppointments();
      }
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      toast.error(
        error.response?.data?.message || "Không thể từ chối lịch hẹn"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenDetailDialog(true);
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { label: "Chờ duyệt", color: "warning" },
      confirmed: { label: "Đã xác nhận", color: "success" },
      completed: { label: "Hoàn thành", color: "info" },
      cancelled: { label: "Đã hủy", color: "error" },
      rejected: { label: "Từ chối", color: "error" },
    };

    const config = statusConfig[status] || { label: status, color: "default" };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getSessionTypeLabel = (type) => {
    const types = {
      consultation: "Tư vấn",
      therapy: "Trị liệu",
      "follow-up": "Tái khám",
    };
    return types[type] || type;
  };

  if (loading) {
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
        <Typography sx={{ ml: 2 }}>Đang tải...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Quản lý lịch hẹn
      </Typography>

      <Card>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Chờ duyệt" />
          <Tab label="Đã xác nhận" />
          <Tab label="Hoàn thành" />
          <Tab label="Đã hủy" />
        </Tabs>

        <CardContent>
          {appointments.length === 0 ? (
            <Alert severity="info">Không có lịch hẹn nào</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bệnh nhân</TableCell>
                    <TableCell>Ngày</TableCell>
                    <TableCell>Giờ</TableCell>
                    <TableCell>Loại</TableCell>
                    <TableCell>Lý do</TableCell>
                    <TableCell>Phí</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="right">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment._id}>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            src={appointment.patient?.avatar}
                            sx={{ width: 40, height: 40 }}
                          >
                            {appointment.patient?.fullName?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {appointment.patient?.fullName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {appointment.patient?.phone}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {new Date(appointment.scheduledDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </TableCell>
                      <TableCell>{appointment.scheduledTime}</TableCell>
                      <TableCell>
                        <Chip
                          icon={
                            appointment.appointmentType === "online" ? (
                              <VideoCall />
                            ) : (
                              <LocationOn />
                            )
                          }
                          label={getSessionTypeLabel(appointment.sessionType)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: 200 }}
                        >
                          {appointment.reasonForVisit}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="primary"
                        >
                          {appointment.fee?.toLocaleString()}đ
                        </Typography>
                        {appointment.isPaid && (
                          <Chip
                            label="Đã thanh toán"
                            size="small"
                            color="success"
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>{getStatusChip(appointment.status)}</TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "flex-end",
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(appointment)}
                            title="Xem chi tiết"
                          >
                            <Visibility />
                          </IconButton>
                          {appointment.status === "pending" && (
                            <>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() =>
                                  handleConfirmAppointment(appointment._id)
                                }
                                title="Chấp nhận"
                                disabled={actionLoading}
                              >
                                <CheckCircle />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  handleOpenRejectDialog(appointment)
                                }
                                title="Từ chối"
                                disabled={actionLoading}
                              >
                                <Cancel />
                              </IconButton>
                            </>
                          )}
                          {appointment.status === "confirmed" && (
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<VideoCall />}
                              onClick={() =>
                                window.open(appointment.meetingLink, "_blank")
                              }
                            >
                              Bắt đầu
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi tiết lịch hẹn</DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Bệnh nhân
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedAppointment.patient?.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedAppointment.patient?.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedAppointment.patient?.phone}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Thời gian
                </Typography>
                <Typography variant="body1">
                  {new Date(
                    selectedAppointment.scheduledDate
                  ).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  - {selectedAppointment.scheduledTime}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Loại buổi hẹn
                </Typography>
                <Typography variant="body1">
                  {getSessionTypeLabel(selectedAppointment.sessionType)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Hình thức
                </Typography>
                <Typography variant="body1">
                  {selectedAppointment.appointmentType === "online"
                    ? "Trực tuyến"
                    : "Trực tiếp"}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Lý do khám
                </Typography>
                <Typography variant="body1">
                  {selectedAppointment.reasonForVisit}
                </Typography>
              </Box>

              {selectedAppointment.patientNotes && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ghi chú của bệnh nhân
                  </Typography>
                  <Typography variant="body1">
                    {selectedAppointment.patientNotes}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Phí tư vấn
                </Typography>
                <Typography variant="h6" color="primary">
                  {selectedAppointment.fee?.toLocaleString()}đ
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Trạng thái thanh toán
                </Typography>
                {selectedAppointment.isPaid ? (
                  <Chip label="Đã thanh toán" color="success" size="small" />
                ) : (
                  <Chip label="Chưa thanh toán" color="default" size="small" />
                )}
              </Box>

              {selectedAppointment.meetingLink && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Link cuộc họp
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<VideoCall />}
                    onClick={() =>
                      window.open(selectedAppointment.meetingLink, "_blank")
                    }
                    fullWidth
                  >
                    Tham gia cuộc họp
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={openRejectDialog}
        onClose={() => setOpenRejectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Warning color="error" />
            <Typography variant="h6">Từ chối lịch hẹn</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Khi từ chối, số tiền {appointmentToReject?.fee?.toLocaleString()}đ
            sẽ được hoàn lại cho bệnh nhân
          </Alert>

          {appointmentToReject && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Thông tin lịch hẹn:
              </Typography>
              <Typography variant="body2">
                Bệnh nhân: {appointmentToReject.patient?.fullName}
              </Typography>
              <Typography variant="body2">
                Ngày:{" "}
                {new Date(appointmentToReject.scheduledDate).toLocaleDateString(
                  "vi-VN"
                )}
              </Typography>
              <Typography variant="body2">
                Giờ: {appointmentToReject.scheduledTime}
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Lý do từ chối *"
            placeholder="Vui lòng nhập lý do từ chối lịch hẹn..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenRejectDialog(false)}
            disabled={actionLoading}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejectAppointment}
            disabled={actionLoading || !rejectionReason.trim()}
            startIcon={
              actionLoading && <CircularProgress size={20} color="inherit" />
            }
          >
            {actionLoading ? "Đang xử lý..." : "Xác nhận từ chối"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProviderAppointments;
