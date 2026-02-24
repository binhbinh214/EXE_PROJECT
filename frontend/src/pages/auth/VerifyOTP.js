import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import toast from 'react-hot-toast';

import { verifyOTP, clearError } from '../../store/slices/authSlice';
import authService from '../../services/auth.service';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Vui lòng nhập đủ 6 số OTP');
      return;
    }
    dispatch(verifyOTP({ email, otp }));
  };

  const handleResendOTP = async () => {
    try {
      setResendLoading(true);
      await authService.resendOTP(email);
      toast.success('Đã gửi lại mã OTP');
      setCountdown(60);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể gửi lại OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Card sx={{ p: 2, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
          Xác thực OTP
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Nhập mã OTP đã được gửi đến email <strong>{email}</strong>
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Nhập mã OTP 6 số"
            inputProps={{
              style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' },
              maxLength: 6,
            }}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading || otp.length !== 6}
            sx={{ mb: 2 }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Xác thực'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Không nhận được mã?{' '}
              {countdown > 0 ? (
                <span>Gửi lại sau {countdown}s</span>
              ) : (
                <Button
                  onClick={handleResendOTP}
                  disabled={resendLoading}
                  sx={{ p: 0, minWidth: 'auto' }}
                >
                  {resendLoading ? 'Đang gửi...' : 'Gửi lại'}
                </Button>
              )}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link to="/login" style={{ color: '#667eea' }}>
              Quay lại đăng nhập
            </Link>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default VerifyOTP;
