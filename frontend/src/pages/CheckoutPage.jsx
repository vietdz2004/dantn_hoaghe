import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack,
  ShoppingCart,
  Payment,
  LocalShipping,
  CheckCircle,
  Delete,
  Edit
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderAPI } from '../services/api';
import styles from './CheckoutPage.module.scss';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Thông tin khách hàng
    hoTen: user?.ten || '',
    email: user?.email || '',
    soDienThoai: user?.soDienThoai || '',
    diaChi: user?.diaChi || '',
    
    // Thông tin giao hàng
    diaChiGiao: user?.diaChi || '',
    ghiChu: '',
    thoiGianGiao: 'asap', // asap, schedule
    ngayGiao: '',
    gioGiao: '',
    
    // Thanh toán
    phuongThucThanhToan: 'cod', // cod, transfer, card
    
    // Voucher
    maVoucher: '',
    giaTriGiam: 0
  });
  
  const [errors, setErrors] = useState({});

  const steps = ['Thông tin', 'Giao hàng', 'Thanh toán', 'Xác nhận'];

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!user) {
      // Redirect to login with return URL
      navigate('/login', { 
        state: { 
          returnUrl: '/checkout',
          message: 'Vui lòng đăng nhập để tiếp tục thanh toán'
        }
      });
      return;
    }
    
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [user, cartItems, navigate]);

  const formatPrice = (price) => {
    if (!price || price === 0) return '0đ';
    return Number(price).toLocaleString('vi-VN') + 'đ';
  };

  const getImageUrl = (hinhAnh) => {
    if (!hinhAnh) return '/no-image.png';
    if (hinhAnh.startsWith('http')) return hinhAnh;
    if (hinhAnh.startsWith('/')) return `http://localhost:5002${hinhAnh}`;
    return `http://localhost:5002/images/products/${hinhAnh}`;
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Thông tin cá nhân
        if (!formData.hoTen.trim()) newErrors.hoTen = 'Vui lòng nhập họ tên';
        if (!formData.soDienThoai.trim()) {
          newErrors.soDienThoai = 'Vui lòng nhập số điện thoại';
        } else if (!/^[0-9]{10,11}$/.test(formData.soDienThoai.trim())) {
          newErrors.soDienThoai = 'Số điện thoại không hợp lệ';
        }
        if (!formData.email.trim()) {
          newErrors.email = 'Vui lòng nhập email';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email không hợp lệ';
        }
        break;
        
      case 1: // Thông tin giao hàng
        if (!formData.diaChiGiao.trim()) newErrors.diaChiGiao = 'Vui lòng nhập địa chỉ giao hàng';
        if (formData.thoiGianGiao === 'schedule') {
          if (!formData.ngayGiao) newErrors.ngayGiao = 'Vui lòng chọn ngày giao';
          if (!formData.gioGiao) newErrors.gioGiao = 'Vui lòng chọn giờ giao';
        }
        break;
        
      case 2: // Thanh toán
        if (!formData.phuongThucThanhToan) newErrors.phuongThucThanhToan = 'Vui lòng chọn phương thức thanh toán';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const calculateShipping = () => {
    const total = getTotalPrice();
    if (total >= 500000) return 0; // Free shipping over 500k
    return 30000; // 30k shipping fee
  };

  const calculateTotal = () => {
    const subtotal = getTotalPrice();
    const shipping = calculateShipping();
    const discount = formData.giaTriGiam || 0;
    return subtotal + shipping - discount;
  };

  const handleSubmitOrder = async () => {
    if (!validateStep(activeStep)) return;
    
    setIsSubmitting(true);
    try {
      const orderData = {
        // Thông tin khách hàng
        id_NguoiDung: user?.id_NguoiDung,
        hoTen: formData.hoTen,
        email: formData.email,
        soDienThoai: formData.soDienThoai,
        diaChi: formData.diaChi,
        
        // Thông tin giao hàng
        diaChiGiao: formData.diaChiGiao,
        ghiChu: formData.ghiChu,
        thoiGianGiao: formData.thoiGianGiao,
        ngayGiao: formData.ngayGiao,
        gioGiao: formData.gioGiao,
        
        // Thanh toán và trạng thái
        phuongThucThanhToan: formData.phuongThucThanhToan.toUpperCase(),
        trangThaiDonHang: 'CHO_XAC_NHAN',
        trangThaiThanhToan: 'CHUA_THANH_TOAN',
        
        // Tổng tiền
        tongTienHang: getTotalPrice(),
        phiVanChuyen: calculateShipping(),
        giaTriGiam: formData.giaTriGiam,
        tongThanhToan: calculateTotal(),
        
        // Voucher
        maVoucher: formData.maVoucher,
        
        // Chi tiết đơn hàng cho backend
        chiTietDonHang: cartItems.map(item => ({
          id_SanPham: item.id_SanPham,
          soLuong: item.soLuong || item.quantity || 1,
          giaTaiThoiDiem: item.giaKhuyenMai || item.gia,
          thanhTien: (item.giaKhuyenMai || item.gia) * (item.soLuong || item.quantity || 1)
        }))
      };

      // Call real API to create order
      console.log('Submitting order to backend:', orderData);
      const response = await orderAPI.createOrder(orderData);
      
      if (response.data) {
        console.log('Order created successfully:', response.data);
        
        // Prepare data for success page
        const successData = {
          ...orderData,
          id_DonHang: response.data.id_DonHang,
          maDonHang: response.data.maDonHang || `DH${Date.now()}`,
          
          // Product list for display
          sanPham: cartItems.map(item => ({
            id_SanPham: item.id_SanPham,
            tenSp: item.tenSp,
            soLuong: item.soLuong || item.quantity || 1,
            gia: item.giaKhuyenMai || item.gia,
            thanhTien: (item.giaKhuyenMai || item.gia) * (item.soLuong || item.quantity || 1),
            hinhAnh: item.hinhAnh
          }))
        };
        
        // Clear cart and redirect to success page
        clearCart();
        navigate('/orders/success', { 
          state: { 
            orderData: successData,
            message: 'Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.' 
          }
        });
      }
      
    } catch (error) {
      console.error('Error submitting order:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.';
      
      if (error.response) {
        // Backend responded with error
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        // Network error
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet.';
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return null; // Will redirect in useEffect
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Họ và tên *"
                value={formData.hoTen}
                onChange={handleInputChange('hoTen')}
                error={!!errors.hoTen}
                helperText={errors.hoTen}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại *"
                value={formData.soDienThoai}
                onChange={handleInputChange('soDienThoai')}
                error={!!errors.soDienThoai}
                helperText={errors.soDienThoai}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ"
                value={formData.diaChi}
                onChange={handleInputChange('diaChi')}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        );
        
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ giao hàng *"
                value={formData.diaChiGiao}
                onChange={handleInputChange('diaChiGiao')}
                error={!!errors.diaChiGiao}
                helperText={errors.diaChiGiao}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Thời gian giao hàng</FormLabel>
                <RadioGroup
                  value={formData.thoiGianGiao}
                  onChange={handleInputChange('thoiGianGiao')}
                >
                  <FormControlLabel 
                    value="asap" 
                    control={<Radio />} 
                    label="Giao hàng ngay khi có thể" 
                  />
                  <FormControlLabel 
                    value="schedule" 
                    control={<Radio />} 
                    label="Hẹn thời gian giao hàng" 
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            {formData.thoiGianGiao === 'schedule' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ngày giao *"
                    type="date"
                    value={formData.ngayGiao}
                    onChange={handleInputChange('ngayGiao')}
                    error={!!errors.ngayGiao}
                    helperText={errors.ngayGiao}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Giờ giao *"
                    type="time"
                    value={formData.gioGiao}
                    onChange={handleInputChange('gioGiao')}
                    error={!!errors.gioGiao}
                    helperText={errors.gioGiao}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi chú cho đơn hàng"
                value={formData.ghiChu}
                onChange={handleInputChange('ghiChu')}
                multiline
                rows={3}
                placeholder="Ví dụ: Giao hàng tại cổng chính, gọi trước 15 phút..."
              />
            </Grid>
          </Grid>
        );
        
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Phương thức thanh toán *</FormLabel>
                <RadioGroup
                  value={formData.phuongThucThanhToan}
                  onChange={handleInputChange('phuongThucThanhToan')}
                >
                  <FormControlLabel 
                    value="cod" 
                    control={<Radio />} 
                    label="💵 Thanh toán khi nhận hàng (COD)" 
                  />
                  <FormControlLabel 
                    value="transfer" 
                    control={<Radio />} 
                    label="🏦 Chuyển khoản ngân hàng" 
                  />
                  <FormControlLabel 
                    value="card" 
                    control={<Radio />} 
                    label="💳 Thanh toán online (ATM/Visa/MasterCard)" 
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mã giảm giá (nếu có)"
                value={formData.maVoucher}
                onChange={handleInputChange('maVoucher')}
                placeholder="Nhập mã voucher"
              />
            </Grid>
            {formData.phuongThucThanhToan === 'transfer' && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Thông tin chuyển khoản:</strong><br/>
                    Ngân hàng: Vietcombank<br/>
                    Số TK: 0123456789<br/>
                    Tên TK: HOASHOP JSC<br/>
                    Nội dung: HoaShop {formData.hoTen} {formData.soDienThoai}
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        );
        
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                🔍 Xác nhận thông tin đặt hàng
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} className={styles.confirmSection}>
                <Typography variant="subtitle1" gutterBottom>
                  👤 Thông tin khách hàng
                </Typography>
                <Typography variant="body2">Họ tên: {formData.hoTen}</Typography>
                <Typography variant="body2">SĐT: {formData.soDienThoai}</Typography>
                <Typography variant="body2">Email: {formData.email}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} className={styles.confirmSection}>
                <Typography variant="subtitle1" gutterBottom>
                  🚚 Thông tin giao hàng
                </Typography>
                <Typography variant="body2">Địa chỉ: {formData.diaChiGiao}</Typography>
                <Typography variant="body2">
                  Thời gian: {formData.thoiGianGiao === 'asap' ? 'Ngay khi có thể' : `${formData.ngayGiao} ${formData.gioGiao}`}
                </Typography>
                <Typography variant="body2">
                  Thanh toán: {
                    formData.phuongThucThanhToan === 'cod' ? 'COD' :
                    formData.phuongThucThanhToan === 'transfer' ? 'Chuyển khoản' : 'Thẻ'
                  }
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box className={styles.checkoutPage}>
      {/* Header */}
      <Box className={styles.header}>
        <IconButton onClick={() => navigate('/cart')} className={styles.backBtn}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" className={styles.title}>
          Thanh toán
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column - Form */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} className={styles.formPaper}>
            {/* Stepper */}
            <Stepper activeStep={activeStep} alternativeLabel className={styles.stepper}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Divider className={styles.divider} />

            {/* Step Content */}
            <Box className={styles.stepContent}>
              {renderStepContent(activeStep)}
            </Box>

            {/* Navigation Buttons */}
            <Box className={styles.navigation}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                className={styles.backButton}
              >
                Quay lại
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  className={styles.nextButton}
                >
                  Tiếp tục
                </Button>
              )}
            </Box>

            {errors.submit && (
              <Alert severity="error" className={styles.submitError}>
                {errors.submit}
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} className={styles.summaryPaper}>
            <Typography variant="h6" className={styles.summaryTitle}>
              📋 Đơn hàng của bạn
            </Typography>

            {/* Cart Items */}
            <List className={styles.cartList}>
              {cartItems.map((item) => (
                <ListItem key={item.id_SanPham} className={styles.cartItem}>
                  <ListItemAvatar>
                    <Avatar
                      src={getImageUrl(item.hinhAnh)}
                      alt={item.tenSp}
                      className={styles.productAvatar}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.tenSp}
                    secondary={`${item.soLuong} x ${formatPrice(item.giaKhuyenMai || item.gia)}`}
                  />
                  <Typography variant="body2" className={styles.itemTotal}>
                    {formatPrice((item.giaKhuyenMai || item.gia) * item.soLuong)}
                  </Typography>
                </ListItem>
              ))}
            </List>

            <Divider />

            {/* Order Summary */}
            <Box className={styles.summaryDetails}>
              <Box className={styles.summaryRow}>
                <Typography>Tạm tính:</Typography>
                <Typography>{formatPrice(getTotalPrice())}</Typography>
              </Box>
              <Box className={styles.summaryRow}>
                <Typography>Phí giao hàng:</Typography>
                <Typography>
                  {calculateShipping() === 0 ? 'Miễn phí' : formatPrice(calculateShipping())}
                </Typography>
              </Box>
              {formData.giaTriGiam > 0 && (
                <Box className={styles.summaryRow}>
                  <Typography color="success.main">Giảm giá:</Typography>
                  <Typography color="success.main">-{formatPrice(formData.giaTriGiam)}</Typography>
                </Box>
              )}
              <Divider className={styles.totalDivider} />
              <Box className={styles.summaryRow + ' ' + styles.totalRow}>
                <Typography variant="h6">Tổng cộng:</Typography>
                <Typography variant="h6" className={styles.totalPrice}>
                  {formatPrice(calculateTotal())}
                </Typography>
              </Box>
            </Box>

            {/* Free Shipping Notice */}
            {calculateShipping() > 0 && (
              <Alert severity="info" className={styles.shippingNotice}>
                Mua thêm {formatPrice(500000 - getTotalPrice())} để được miễn phí giao hàng!
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CheckoutPage; 