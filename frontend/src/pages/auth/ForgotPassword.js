import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Email, ArrowBack } from '@mui/icons-material';
import toast from 'react-hot-toast';

import authService from '../../services/auth.service';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await authService.forgotPassword(email);
      setSuccess(true);
      toast.success('Đã gửi mã OTP đến email của bạn');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/reset-password', { state: { email } });
  };

  return (
    <Card sx={{ p: 2, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
          Quên mật khẩu
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success ? (
          <Box sx={{ textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              Chúng tôi đã gửi mã OTP đến email của bạn. Vui lòng kiểm tra hộp thư.
            </Alert>
            <Button variant="contained" onClick={handleContinue} fullWidth>
              Tiếp tục đặt lại mật khẩu
            </Button>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email"
              placeholder="Nhập email của bạn"
              type="email"
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mb: 2 }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Gửi mã OTP'}
            </Button>
          </form>
        )}

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Link
            to="/login"
            style={{ color: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
          >
            <ArrowBack fontSize="small" /> Quay lại đăng nhập
          </Link>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ForgotPassword;
