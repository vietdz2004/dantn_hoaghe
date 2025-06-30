import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, TextField, Button, Alert, Container, Paper,
  FormControlLabel, Checkbox, Grid
} from '@mui/material';
import { 
  Visibility, VisibilityOff, Email, Lock, Person, Phone
} from '@mui/icons-material';
import { InputAdornment, IconButton } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import styles from './RegisterPage.module.scss';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    soDienThoai: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.hoTen.trim()) {
      newErrors.hoTen = 'Họ tên là bắt buộc';
    } else if (formData.hoTen.trim().length < 2) {
      newErrors.hoTen = 'Họ tên phải có ít nhất 2 ký tự';
    }

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Validate phone
    if (!formData.soDienThoai) {
      newErrors.soDienThoai = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(formData.soDienThoai)) {
      newErrors.soDienThoai = 'Số điện thoại phải có 10-11 chữ số';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    // Validate terms agreement
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Bạn phải đồng ý với điều khoản sử dụng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      const { confirmPassword, agreeToTerms, password, ...otherData } = formData;
      
      // Map frontend field to backend field
      const registerData = {
        ...otherData,
        matKhau: password  // Transform password -> matKhau for backend
      };
      
      console.log('📊 Sending to backend:', registerData);
      
      const result = await register(registerData);
      
      if (result.success) {
        setSuccess('Đăng ký thành công! Đang chuyển hướng...');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      } else {
        setApiError(result.message);
      }
    } catch (error) {
      setApiError('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  return (
    <Container maxWidth="md" className={styles.registerContainer}>
      <Paper elevation={3} className={styles.registerPaper}>
        <Box className={styles.registerHeader}>
          <Typography variant="h4" component="h1" className={styles.title}>
            🌸 Đăng Ký Tài Khoản
          </Typography>
          <Typography variant="body1" className={styles.subtitle}>
            Tạo tài khoản để trải nghiệm dịch vụ của FlowerCorner
          </Typography>
        </Box>

        {apiError && (
          <Alert severity="error" className={styles.alert}>
            {apiError}
          </Alert>
        )}

        {success && (
          <Alert severity="success" className={styles.alert}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} className={styles.form}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="hoTen"
                label="Họ và tên"
                value={formData.hoTen}
                onChange={handleChange}
                error={!!errors.hoTen}
                helperText={errors.hoTen}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
                className={styles.textField}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="soDienThoai"
                label="Số điện thoại"
                value={formData.soDienThoai}
                onChange={handleChange}
                error={!!errors.soDienThoai}
                helperText={errors.soDienThoai}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
                    </InputAdornment>
                  ),
                }}
                className={styles.textField}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="email"
                type="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                className={styles.textField}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                className={styles.textField}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                label="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                className={styles.textField}
              />
            </Grid>
          </Grid>

          <FormControlLabel
            control={
              <Checkbox
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                Tôi đồng ý với{' '}
                <Link to="/terms" className={styles.link}>
                  Điều khoản sử dụng
                </Link>{' '}
                và{' '}
                <Link to="/privacy" className={styles.link}>
                  Chính sách bảo mật
                </Link>
              </Typography>
            }
            className={styles.checkbox}
          />
          {errors.agreeToTerms && (
            <Typography variant="body2" color="error" className={styles.errorText}>
              {errors.agreeToTerms}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
          </Button>
        </Box>

        <Box className={styles.registerFooter}>
          <Typography variant="body2" className={styles.linkText}>
            Đã có tài khoản?{' '}
            <Link to="/login" className={styles.link}>
              Đăng nhập ngay
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage; 