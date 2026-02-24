import React from 'react';
import { Box, Typography, Card, CardContent, Switch, FormControlLabel, Divider, Button } from '@mui/material';

const Settings = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Cài đặt</Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Thông báo</Typography>
          <FormControlLabel control={<Switch defaultChecked />} label="Thông báo email" />
          <FormControlLabel control={<Switch defaultChecked />} label="Nhắc nhở lịch hẹn" />
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>Bảo mật</Typography>
          <Button variant="outlined" sx={{ mr: 2 }}>Đổi mật khẩu</Button>
          <Button variant="outlined" color="error">Xóa tài khoản</Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;
