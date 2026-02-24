import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Avatar,
  Divider,
} from '@mui/material';
import { Visibility, CheckCircle, Cancel, MoreVert } from '@mui/icons-material';

const mockReports = [
  {
    id: 1,
    reporter: 'Nguyễn Văn A',
    type: 'behavioral',
    subject: 'Hành vi không phù hợp',
    description: 'Bác sĩ có thái độ không chuyên nghiệp trong buổi tư vấn',
    status: 'open',
    priority: 'high',
    createdAt: '2024-01-20',
  },
  {
    id: 2,
    reporter: 'Trần Thị B',
    type: 'technical',
    subject: 'Lỗi thanh toán',
    description: 'Không thể nạp tiền vào ví',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2024-01-19',
  },
  {
    id: 3,
    reporter: 'Lê Văn C',
    type: 'payment',
    subject: 'Yêu cầu hoàn tiền',
    description: 'Buổi tư vấn bị hủy nhưng chưa được hoàn tiền',
    status: 'resolved',
    priority: 'low',
    createdAt: '2024-01-18',
  },
];

const ReportManagement = () => {
  const [tab, setTab] = useState(0);
  const [selectedReport, setSelectedReport] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const getTypeLabel = (type) => {
    switch (type) {
      case 'technical': return 'Kỹ thuật';
      case 'payment': return 'Thanh toán';
      case 'behavioral': return 'Hành vi';
      case 'harassment': return 'Quấy rối';
      case 'content': return 'Nội dung';
      default: return 'Khác';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'error';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'dismissed': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'open': return 'Mới';
      case 'in_progress': return 'Đang xử lý';
      case 'resolved': return 'Đã giải quyết';
      case 'dismissed': return 'Đã bác bỏ';
      default: return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setOpenDialog(true);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Quản lý báo cáo
      </Typography>

      <Card>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab label="Tất cả" />
          <Tab label="Mới (3)" />
          <Tab label="Đang xử lý (2)" />
          <Tab label="Đã giải quyết" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Người báo cáo</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Ưu tiên</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockReports.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell>#{report.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {report.reporter.charAt(0)}
                      </Avatar>
                      {report.reporter}
                    </Box>
                  </TableCell>
                  <TableCell>{getTypeLabel(report.type)}</TableCell>
                  <TableCell>{report.subject}</TableCell>
                  <TableCell>
                    <Chip
                      label={report.priority}
                      size="small"
                      color={getPriorityColor(report.priority)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(report.status)}
                      size="small"
                      color={getStatusColor(report.status)}
                    />
                  </TableCell>
                  <TableCell>{report.createdAt}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleViewReport(report)}>
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Report Detail Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Chi tiết báo cáo #{selectedReport?.id}
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip label={getTypeLabel(selectedReport.type)} />
                <Chip label={selectedReport.priority} color={getPriorityColor(selectedReport.priority)} />
                <Chip label={getStatusLabel(selectedReport.status)} color={getStatusColor(selectedReport.status)} />
              </Box>

              <Typography variant="subtitle2" color="text.secondary">
                Người báo cáo
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedReport.reporter}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Tiêu đề
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedReport.subject}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Mô tả
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedReport.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Phản hồi
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Nhập phản hồi cho người dùng..."
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Cập nhật trạng thái</InputLabel>
                <Select label="Cập nhật trạng thái" defaultValue={selectedReport.status}>
                  <MenuItem value="open">Mới</MenuItem>
                  <MenuItem value="in_progress">Đang xử lý</MenuItem>
                  <MenuItem value="resolved">Đã giải quyết</MenuItem>
                  <MenuItem value="dismissed">Bác bỏ</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Đóng</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportManagement;
