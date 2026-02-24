import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Avatar,
  Pagination,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Add,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import paymentService from '../../services/payment.service';

const typeConfig = {
  deposit: { label: 'Nạp tiền', color: 'success', icon: <ArrowUpward /> },
  appointment: { label: 'Đặt lịch', color: 'primary', icon: <ArrowDownward /> },
  refund: { label: 'Hoàn tiền', color: 'info', icon: <ArrowUpward /> },
  withdrawal: { label: 'Rút tiền', color: 'warning', icon: <ArrowDownward /> },
};

const statusConfig = {
  pending: { label: 'Đang xử lý', color: 'warning' },
  completed: { label: 'Hoàn thành', color: 'success' },
  failed: { label: 'Thất bại', color: 'error' },
  refunded: { label: 'Đã hoàn', color: 'info' },
};

const Payments = () => {
  const { user } = useSelector((state) => state.auth);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await paymentService.getMyPayments({ page, limit: 10 });
        setPayments(response.data.data || []);
        setPagination(response.data.pagination || { total: 0, pages: 1 });
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [page]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Quản lý thanh toán
      </Typography>

      {/* Balance Card */}
      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
              Số dư hiện tại
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {(user?.balance || 0).toLocaleString()}đ
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              component={Link}
              to="/deposit"
              variant="contained"
              startIcon={<Add />}
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
            >
              Nạp tiền
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Lịch sử giao dịch
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : payments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AccountBalanceWallet sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
              <Typography color="text.secondary">Chưa có giao dịch nào</Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Loại</TableCell>
                      <TableCell>Mô tả</TableCell>
                      <TableCell align="right">Số tiền</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Thời gian</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.map((payment) => {
                      const type = typeConfig[payment.transactionType] || typeConfig.deposit;
                      const status = statusConfig[payment.status] || statusConfig.pending;
                      const isIncome = ['deposit', 'refund'].includes(payment.transactionType);

                      return (
                        <TableRow key={payment._id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar
                                sx={{
                                  width: 36,
                                  height: 36,
                                  bgcolor: isIncome ? 'success.light' : 'error.light',
                                }}
                              >
                                {type.icon}
                              </Avatar>
                              <Chip label={type.label} size="small" color={type.color} variant="outlined" />
                            </Box>
                          </TableCell>
                          <TableCell>
                            {payment.description || 'Giao dịch'}
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              fontWeight={600}
                              color={isIncome ? 'success.main' : 'error.main'}
                            >
                              {isIncome ? '+' : '-'}{payment.amount?.toLocaleString()}đ
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={status.label}
                              size="small"
                              color={status.color}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(payment.createdAt)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {pagination.pages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
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
        </CardContent>
      </Card>
    </Box>
  );
};

export default Payments;
