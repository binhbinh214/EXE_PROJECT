import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { Edit, Save, PhotoCamera } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { updateProfile } from '../../store/slices/userSlice';
import { getMe } from '../../store/slices/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.user);

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    specialization: user?.specialization || '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      setError('Họ tên không được để trống');
      return;
    }

    try {
      await dispatch(updateProfile(formData)).unwrap();
      dispatch(getMe()); // Refresh user data
      toast.success('Cập nhật hồ sơ thành công!');
      setEditing(false);
    } catch (err) {
      setError(err || 'Cập nhật thất bại');
      toast.error('Cập nhật thất bại');
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return { label: 'Quản trị viên', color: 'error' };
      case 'doctor': return { label: 'Bác sĩ', color: 'primary' };
      case 'healer': return { label: 'Chuyên gia tư vấn', color: 'success' };
      default: return { label: 'Người dùng', color: 'default' };
    }
  };

  const roleInfo = getRoleLabel(user?.role);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Hồ sơ cá nhân
        </Typography>
        {!editing && (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => setEditing(true)}
          >
            Chỉnh sửa
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Avatar Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar
                  src={user?.avatar}
                  sx={{ width: 120, height: 120, mx: 'auto', fontSize: 48 }}
                >
                  {user?.fullName?.charAt(0)}
                </Avatar>
                {editing && (
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      minWidth: 'auto',
                      p: 1,
                      borderRadius: '50%',
                    }}
                  >
                    <PhotoCamera fontSize="small" />
                  </Button>
                )}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {user?.fullName}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>
              <Chip label={roleInfo.label} color={roleInfo.color} sx={{ mt: 1 }} />

              <Divider sx={{ my: 2 }} />

              <Box sx={{ textAlign: 'left' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Trạng thái</Typography>
                  <Chip
                    label={user?.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                    size="small"
                    color={user?.isVerified ? 'success' : 'warning'}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Số dư</Typography>
                  <Typography fontWeight={600} color="primary">
                    {(user?.balance || 0).toLocaleString()}đ
                  </Typography>
                </Box>
                {user?.rating > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Đánh giá</Typography>
                    <Typography fontWeight={600}>
                      ⭐ {user?.rating?.toFixed(1)} ({user?.totalRatings})
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Thông tin cá nhân
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={!editing}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={user?.email}
                      disabled
                      helperText="Email không thể thay đổi"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Vai trò"
                      value={roleInfo.label}
                      disabled
                    />
                  </Grid>

                  {['doctor', 'healer'].includes(user?.role) && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Chuyên môn"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Giới thiệu bản thân"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="Viết vài dòng giới thiệu về bản thân..."
                    />
                  </Grid>

                  {editing && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setEditing(false);
                            setFormData({
                              fullName: user?.fullName || '',
                              phone: user?.phone || '',
                              bio: user?.bio || '',
                              specialization: user?.specialization || '',
                            });
                            setError('');
                          }}
                        >
                          Hủy
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </form>
            </CardContent>
          </Card>

          {/* Additional Info for Providers */}
          {['doctor', 'healer'].includes(user?.role) && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Thông tin chuyên môn
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {user?.experienceYears || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Năm kinh nghiệm
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {user?.totalRatings || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Lượt đánh giá
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                        {(user?.consultationFee || 0).toLocaleString()}đ
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Phí tư vấn
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Chip
                        label={user?.isProfileVerified ? 'Đã xác thực' : 'Chờ xác thực'}
                        color={user?.isProfileVerified ? 'success' : 'warning'}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Hồ sơ chuyên môn
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
