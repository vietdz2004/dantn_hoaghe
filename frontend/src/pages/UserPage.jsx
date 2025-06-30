import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  Avatar,
  Divider
} from '@mui/material';
import { 
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

// UserPage: Trang quản lý người dùng
const UserPage = () => {
  const { user, updateProfile, loading } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    hoTen: user?.hoTen || user?.ten || '',
    email: user?.email || '',
    soDienThoai: user?.soDienThoai || ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      setError('');
      const result = await updateProfile(formData);
      
      if (result.success) {
        setMessage('Cập nhật thông tin thành công!');
        setEditMode(false);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(result.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  const handleCancel = () => {
    setFormData({
      hoTen: user?.hoTen || user?.ten || '',
      email: user?.email || '',
      soDienThoai: user?.soDienThoai || ''
    });
    setEditMode(false);
    setError('');
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          Vui lòng đăng nhập để xem thông tin cá nhân
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
            <PersonIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Thông tin cá nhân
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Quản lý thông tin tài khoản của bạn
            </Typography>
          </Box>
        </Box>
      </Paper>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">
              Thông tin tài khoản
            </Typography>
            {!editMode ? (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
              >
                Chỉnh sửa
              </Button>
            ) : (
              <Box gap={1} display="flex">
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={loading}
                >
                  Lưu
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Hủy
                </Button>
              </Box>
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Họ và tên"
                name="hoTen"
                value={formData.hoTen}
                onChange={handleChange}
                disabled={!editMode || loading}
                variant={editMode ? "outlined" : "filled"}
                InputProps={{
                  readOnly: !editMode
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                name="soDienThoai"
                value={formData.soDienThoai}
                onChange={handleChange}
                disabled={!editMode || loading}
                variant={editMode ? "outlined" : "filled"}
                InputProps={{
                  readOnly: !editMode
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!editMode || loading}
                variant={editMode ? "outlined" : "filled"}
                InputProps={{
                  readOnly: !editMode
                }}
                helperText={!editMode ? "Email không thể thay đổi" : ""}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Account Info */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Thông tin tài khoản
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Vai trò
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {user?.vaiTro === 'KHACH_HANG' ? 'Khách hàng' : user?.vaiTro}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Trạng thái
              </Typography>
              <Typography variant="body1" fontWeight="medium" color="success.main">
                {user?.trangThai === 'HOAT_DONG' ? 'Đang hoạt động' : user?.trangThai}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Ngày tạo tài khoản
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Không xác định'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default UserPage; 