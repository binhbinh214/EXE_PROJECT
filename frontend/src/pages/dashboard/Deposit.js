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
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { ArrowBack, AccountBalanceWallet, CreditCard } from '@mui/icons-material';
import toast from 'react-hot-toast';
import paymentService from '../../services/payment.service';
import { getMe } from '../../store/slices/authSlice';

const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

const Deposit = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
    setError('');
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setAmount(value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const amountNum = parseInt(amount);
    if (!amountNum || amountNum < 10000) {
      setError('Số tiền nạp tối thiểu là 10,000đ');
      return;
    }

    if (amountNum > 10000000) {
      setError('Số tiền nạp tối đa là 10,000,000đ');
      return;
    }

    try {
      setLoading(true);
      await paymentService.deposit({
        amount: amountNum,
        paymentMethod,
      });
      
      // Refresh user data to get updated balance
      dispatch(getMe());
      
      setSuccess(true);
      toast.success(`Nạp thành công ${amountNum.toLocaleString()}đ vào ví!`);
      
      setTimeout(() => {
        navigate('/payments');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Nạp tiền thất bại. Vui lòng thử lại.');
      toast.error('Nạp tiền thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <AccountBalanceWallet sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', mb: 2 }}>
          Nạp tiền thành công!
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Số dư mới: {((user?.balance || 0) + parseInt(amount)).toLocaleString()}đ
        </Typography>
        <Button variant="contained" onClick={() => navigate('/payments')}>
          Xem lịch sử giao dịch
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/payments')}>
          Quay lại
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Nạp tiền vào ví
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Chọn số tiền
                </Typography>
                <Grid container spacing={1} sx={{ mb: 3 }}>
                  {quickAmounts.map((value) => (
                    <Grid item xs={4} sm={4} md={2} key={value}>
                      <Button
                        fullWidth
                        variant={parseInt(amount) === value ? 'contained' : 'outlined'}
                        onClick={() => handleQuickAmount(value)}
                        sx={{ py: 1.5 }}
                      >
                        {value.toLocaleString()}đ
                      </Button>
                    </Grid>
                  ))}
                </Grid>

                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Hoặc nhập số tiền khác
                </Typography>
                <TextField
                  fullWidth
                  value={amount ? parseInt(amount).toLocaleString() : ''}
                  onChange={handleAmountChange}
                  placeholder="Nhập số tiền"
                  InputProps={{
                    endAdornment: <Typography color="text.secondary">VNĐ</Typography>,
                  }}
                  sx={{ mb: 3 }}
                />

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Phương thức thanh toán
                </Typography>
                <ToggleButtonGroup
                  value={paymentMethod}
                  exclusive
                  onChange={(e, v) => v && setPaymentMethod(v)}
                  sx={{ mb: 3 }}
                >
                  <ToggleButton value="bank_transfer" sx={{ px: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountBalanceWallet />
                      Chuyển khoản
                    </Box>
                  </ToggleButton>
                  <ToggleButton value="credit_card" sx={{ px: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CreditCard />
                      Thẻ tín dụng
                    </Box>
                  </ToggleButton>
                </ToggleButtonGroup>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading || !amount}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AccountBalanceWallet />}
                >
                  {loading ? 'Đang xử lý...' : `Nạp ${amount ? parseInt(amount).toLocaleString() : 0}đ`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Thông tin ví
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Số dư hiện tại
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {(user?.balance || 0).toLocaleString()}đ
                </Typography>
              </Box>
              
              {amount && (
                <Box sx={{ p: 2, bgcolor: 'success.lighter', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Số dư sau khi nạp
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {((user?.balance || 0) + (parseInt(amount) || 0)).toLocaleString()}đ
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Lưu ý
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Số tiền nạp tối thiểu: 10,000đ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Số tiền nạp tối đa: 10,000,000đ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Tiền sẽ được cộng vào ví ngay lập tức
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Đây là môi trường demo, không trừ tiền thật
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Deposit;
