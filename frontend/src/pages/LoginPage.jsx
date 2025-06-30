import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, TextField, Button, Alert, Container, Paper } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { InputAdornment, IconButton } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import styles from './LoginPage.module.scss';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');

  // Get redirect path from location state
  const from = location.state?.from?.pathname || '/';

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
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
      // Map frontend field to backend field
      const loginData = {
        email: formData.email,
        matKhau: formData.password  // Transform password -> matKhau for backend
      };
      
      console.log('📊 Sending login data to backend:', { email: loginData.email, matKhau: '***' });
      
      const result = await login(loginData);
      
      if (result.success) {
        setSuccess('Đăng nhập thành công!');
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1000);
      } else {
        setApiError(result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      setApiError('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  return (
    <Container maxWidth="sm" className={styles.loginContainer}>
      <Paper elevation={3} className={styles.loginPaper}>
        <Box className={styles.loginHeader}>
          <Typography variant="h4" component="h1" className={styles.title}>
            🌸 Đăng Nhập
          </Typography>
          <Typography variant="body1" className={styles.subtitle}>
            Chào mừng bạn quay trở lại FlowerCorner!
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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </Button>
        </Box>

        <Box className={styles.loginFooter}>
          <Typography variant="body2" className={styles.linkText}>
            Chưa có tài khoản?{' '}
            <Link to="/register" className={styles.link}>
              Đăng ký ngay
            </Link>
          </Typography>
          
          <Typography variant="body2" className={styles.linkText}>
            <Link to="/forgot-password" className={styles.link}>
              Quên mật khẩu?
            </Link>
          </Typography>
        </Box>

        <Box className={styles.demoAccount}>
          <Typography variant="body2" className={styles.demoTitle}>
            Tài khoản demo:
          </Typography>
          <Typography variant="body2" className={styles.demoInfo}>
            Email: demo@flowercorner.vn<br />
            Mật khẩu: 123456
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage; 