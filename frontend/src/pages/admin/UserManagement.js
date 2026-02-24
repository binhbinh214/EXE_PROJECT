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
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Avatar,
} from '@mui/material';
import {
  Search,
  MoreVert,
  Edit,
  Block,
  CheckCircle,
  Delete,
  FilterList,
} from '@mui/icons-material';

const mockUsers = [
  { id: 1, fullName: 'Nguyễn Văn A', email: 'nguyenvana@email.com', phone: '0901234567', role: 'customer', status: 'active', createdAt: '2024-01-15' },
  { id: 2, fullName: 'BS. Trần Thị B', email: 'bstranb@email.com', phone: '0912345678', role: 'doctor', status: 'active', createdAt: '2024-01-14' },
  { id: 3, fullName: 'Lê Văn C', email: 'levanc@email.com', phone: '0923456789', role: 'healer', status: 'pending', createdAt: '2024-01-13' },
  { id: 4, fullName: 'Phạm Thị D', email: 'phamthid@email.com', phone: '0934567890', role: 'customer', status: 'suspended', createdAt: '2024-01-12' },
];

const UserManagement = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleMenuClick = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'doctor': return 'primary';
      case 'healer': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'doctor': return 'Bác sĩ';
      case 'healer': return 'Chuyên gia';
      case 'customer': return 'Người dùng';
      default: return role;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'pending': return 'Chờ duyệt';
      case 'suspended': return 'Tạm khóa';
      default: return status;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Quản lý người dùng
        </Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          Thêm người dùng
        </Button>
      </Box>

      <Card>
        {/* Filters */}
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Vai trò</InputLabel>
            <Select
              value={roleFilter}
              label="Vai trò"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="customer">Người dùng</MenuItem>
              <MenuItem value="doctor">Bác sĩ</MenuItem>
              <MenuItem value="healer">Chuyên gia</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Người dùng</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 36, height: 36 }}>
                        {user.fullName.charAt(0)}
                      </Avatar>
                      {user.fullName}
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(user.role)}
                      size="small"
                      color={getRoleColor(user.role)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(user.status)}
                      size="small"
                      color={getStatusColor(user.status)}
                    />
                  </TableCell>
                  <TableCell>{user.createdAt}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => handleMenuClick(e, user)}>
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={mockUsers.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          labelRowsPerPage="Số hàng mỗi trang:"
        />
      </Card>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>
          <Edit fontSize="small" sx={{ mr: 1 }} /> Chỉnh sửa
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <CheckCircle fontSize="small" sx={{ mr: 1 }} /> Xác thực
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Block fontSize="small" sx={{ mr: 1 }} /> Tạm khóa
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Xóa
        </MenuItem>
      </Menu>

      {/* Add User Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm người dùng mới</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField fullWidth label="Họ tên" />
            <TextField fullWidth label="Email" type="email" />
            <TextField fullWidth label="Số điện thoại" />
            <FormControl fullWidth>
              <InputLabel>Vai trò</InputLabel>
              <Select label="Vai trò" defaultValue="customer">
                <MenuItem value="customer">Người dùng</MenuItem>
                <MenuItem value="doctor">Bác sĩ</MenuItem>
                <MenuItem value="healer">Chuyên gia</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="Mật khẩu" type="password" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            Thêm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
