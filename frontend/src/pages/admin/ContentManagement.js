import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import { Search, Add, Edit, Delete, Visibility, PlayArrow } from '@mui/icons-material';

const mockContents = [
  {
    id: 1,
    title: 'Thiền buổi sáng',
    type: 'meditation',
    category: 'mindfulness',
    duration: 600,
    status: 'published',
    views: 1234,
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300',
  },
  {
    id: 2,
    title: 'Kỹ thuật thở 4-7-8',
    type: 'breathing',
    category: 'stress',
    duration: 300,
    status: 'published',
    views: 856,
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300',
  },
  {
    id: 3,
    title: 'Thư giãn cơ tiến bộ',
    type: 'relaxation',
    category: 'anxiety',
    duration: 900,
    status: 'draft',
    views: 0,
    thumbnail: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=300',
  },
];

const ContentManagement = () => {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} phút`;
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'meditation': return 'Thiền';
      case 'breathing': return 'Thở';
      case 'relaxation': return 'Thư giãn';
      case 'exercise': return 'Bài tập';
      case 'article': return 'Bài viết';
      default: return type;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Quản lý nội dung
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
          Thêm nội dung
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Tất cả" />
          <Tab label="Thiền định" />
          <Tab label="Bài thở" />
          <Tab label="Thư giãn" />
          <Tab label="Bài viết" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Card>

      <Grid container spacing={3}>
        {mockContents.map((content) => (
          <Grid item xs={12} sm={6} md={4} key={content.id}>
            <Card>
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={content.thumbnail}
                  alt={content.title}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 0.5,
                  }}
                >
                  <Chip
                    label={content.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                    size="small"
                    color={content.status === 'published' ? 'success' : 'default'}
                  />
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                  }}
                >
                  {formatDuration(content.duration)}
                </Box>
              </Box>
              <CardContent>
                <Typography variant="h6" noWrap>
                  {content.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 2 }}>
                  <Chip label={getTypeLabel(content.type)} size="small" variant="outlined" />
                  <Typography variant="body2" color="text.secondary">
                    <Visibility fontSize="small" sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                    {content.views.toLocaleString()} lượt xem
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button size="small" startIcon={<PlayArrow />}>
                    Xem
                  </Button>
                  <Box>
                    <IconButton size="small">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Content Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Thêm nội dung mới</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField fullWidth label="Tiêu đề" />
            <TextField fullWidth label="Mô tả" multiline rows={3} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Loại nội dung</InputLabel>
                  <Select label="Loại nội dung" defaultValue="meditation">
                    <MenuItem value="meditation">Thiền định</MenuItem>
                    <MenuItem value="breathing">Bài thở</MenuItem>
                    <MenuItem value="relaxation">Thư giãn</MenuItem>
                    <MenuItem value="exercise">Bài tập</MenuItem>
                    <MenuItem value="article">Bài viết</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Danh mục</InputLabel>
                  <Select label="Danh mục" defaultValue="general">
                    <MenuItem value="stress">Giảm stress</MenuItem>
                    <MenuItem value="anxiety">Lo âu</MenuItem>
                    <MenuItem value="sleep">Giấc ngủ</MenuItem>
                    <MenuItem value="mindfulness">Chánh niệm</MenuItem>
                    <MenuItem value="general">Chung</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField fullWidth label="URL Media" placeholder="https://..." />
            <TextField fullWidth label="URL Thumbnail" placeholder="https://..." />
            <TextField fullWidth label="Thời lượng (giây)" type="number" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="outlined" onClick={() => setOpenDialog(false)}>
            Lưu nháp
          </Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            Xuất bản
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentManagement;
