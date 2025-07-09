import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stepper, Step, StepLabel, Button, Typography, Box, Paper, TextField, RadioGroup, FormControlLabel, Radio, CircularProgress } from '@mui/material';
import { CartContext } from '../contexts/CartContext';
import AuthContext from '../contexts/AuthContext';
import api from '../services/api';

const steps = ['Thông tin khách hàng', 'Địa chỉ giao hàng', 'Phương thức thanh toán', 'Xác nhận đơn hàng'];

const initialCustomerInfo = {
  name: '',
  phone: '',
  email: '',
};
const initialShipping = {
  address: '',
  note: '',
};

const CheckoutPage = () => {
  const { cartItems, totalAmount, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({ ...initialCustomerInfo, ...(user ? { name: user.hoTen, phone: user.soDienThoai, email: user.email } : {}) });
  const [shipping, setShipping] = useState(initialShipping);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validate từng bước
  const validateStep = () => {
    if (activeStep === 0) {
      if (!customerInfo.name || !customerInfo.phone) return 'Vui lòng nhập họ tên và số điện thoại.';
    }
    if (activeStep === 1) {
      if (!shipping.address) return 'Vui lòng nhập địa chỉ giao hàng.';
    }
    if (activeStep === 2) {
      if (!paymentMethod) return 'Vui lòng chọn phương thức thanh toán.';
    }
    if (activeStep === 3) {
      if (
        !customerInfo.name?.trim() || customerInfo.name.trim().length < 2 ||
        !customerInfo.phone?.trim() || customerInfo.phone.trim().length < 8 ||
        !shipping.address?.trim() || shipping.address.trim().length < 5 ||
        !paymentMethod?.trim()
      ) {
        return 'Vui lòng nhập đầy đủ và hợp lệ họ tên (tối thiểu 2 ký tự), số điện thoại (tối thiểu 8 số), địa chỉ giao hàng (tối thiểu 5 ký tự), phương thức thanh toán!';
      }
      if (
        !cartItems ||
        !Array.isArray(cartItems) ||
        cartItems.length === 0 ||
        !cartItems.every(item => item.id_SanPham && ((item.soLuong || item.quantity) && item.gia))
      ) {
        return 'Giỏ hàng trống hoặc không hợp lệ';
      }
    }
    return '';
  };

  const handleNext = async () => {
    setError('');
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    if (activeStep === steps.length - 1) {
      // Đặt hàng
      setLoading(true);
      try {
        // Format cartItems data để match backend expectation
        const formattedCartItems = cartItems.map(item => ({
          id_SanPham: item.id_SanPham,
          soLuong: item.quantity || item.soLuong || 1,
          gia: item.giaKhuyenMai || item.gia,
          giaTaiThoiDiem: item.giaKhuyenMai || item.gia,
          tenSp: item.tenSp || 'Sản phẩm'
        }));

        console.log('📦 Original cartItems:', cartItems);
        console.log('📦 Formatted cartItems:', formattedCartItems);
        console.log('📦 Creating order with data:', {
          hoTen: customerInfo.name,
          soDienThoai: customerInfo.phone,
          email: customerInfo.email,
          diaChiGiao: shipping.address,
          ghiChu: shipping.note,
          phuongThucThanhToan: paymentMethod,
          sanPham: formattedCartItems,
          tongThanhToan: totalAmount,
          id_NguoiDung: user?.id_NguoiDung
        });

        // 1. Tạo đơn hàng
        const orderRes = await api.post('/orders', {
          hoTen: customerInfo.name,
          soDienThoai: customerInfo.phone,
          email: customerInfo.email,
          diaChiGiao: shipping.address,
          ghiChu: shipping.note,
          phuongThucThanhToan: paymentMethod,
          sanPham: formattedCartItems,
          tongThanhToan: totalAmount,
          id_NguoiDung: user?.id_NguoiDung
        });
        
        console.log('✅ Order response:', orderRes);
        console.log('✅ Order response data:', orderRes.data);
        
        if (!orderRes.data?.success) {
          throw new Error('API không trả về success=true: ' + JSON.stringify(orderRes.data));
        }
        
        if (!orderRes.data?.data?.id_DonHang) {
          throw new Error('API không trả về id_DonHang: ' + JSON.stringify(orderRes.data));
        }
        
        const order = orderRes.data.data;
        console.log('✅ Order created with ID:', order.id_DonHang);
        
        // 2. Xử lý thanh toán theo phương thức đã chọn
        if (paymentMethod === 'VNPay') {
          await handleVNPayPayment(order, totalAmount);
        } else if (paymentMethod === 'ZaloPay') {
          await handleZaloPayPayment(order, totalAmount);
        } else {
          // 3. Thanh toán COD: chuyển sang trang thành công
          console.log('✅ COD order completed, clearing cart and redirecting...');
          clearCart();
          navigate('/order-success', { state: { order } });
        }
      } catch (e) {
        console.error('❌ Checkout error:', e);
        console.error('❌ Error response:', e.response?.data);
        console.error('❌ Error message:', e.message);
        console.error('❌ Full error object:', e);
        setError(e.response?.data?.message || e.message || 'Có lỗi xảy ra khi đặt hàng.');
      } finally {
        setLoading(false);
      }
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  // Xử lý thanh toán VNPay
  const handleVNPayPayment = async (order, amount) => {
    console.log('💳 Creating VNPay payment with amount:', amount);
    const payRes = await api.post('/payment/create_payment_url', {
      amount: amount,
      orderId: order.id_DonHang,
      orderDesc: `Thanh toán đơn hàng #${order.id_DonHang} - HoaShop`,
    });
    
    console.log('💳 VNPay payment response:', payRes);
    console.log('💳 VNPay payment response data:', payRes.data);
    
    const paymentData = payRes.data;
    if (paymentData?.success && paymentData?.paymentUrl) {
      console.log('🚀 Redirecting to VNPay:', paymentData.paymentUrl);
      window.location.href = paymentData.paymentUrl;
    } else {
      throw new Error('VNPay không trả về payment URL: ' + JSON.stringify(paymentData));
    }
  };

  // Xử lý thanh toán ZaloPay
  const handleZaloPayPayment = async (order, amount) => {
    console.log('🟡 Creating ZaloPay payment with amount:', amount);
    const payRes = await api.post('/payment/create_zalopay_order', {
      amount: amount,
      orderId: order.id_DonHang,
      orderDesc: `Thanh toán đơn hàng #${order.id_DonHang} - HoaShop`,
    });
    
    console.log('🟡 ZaloPay payment response:', payRes);
    console.log('🟡 ZaloPay payment response data:', payRes.data);
    
    const paymentData = payRes.data;
    if (paymentData?.success && paymentData?.order_url) {
      console.log('🚀 Redirecting to ZaloPay:', paymentData.order_url);
      window.location.href = paymentData.order_url;
    } else {
      throw new Error('ZaloPay không trả về order URL: ' + JSON.stringify(paymentData));
    }
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prev) => prev - 1);
  };

  // Render từng bước
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField label="Họ tên" fullWidth margin="normal" value={customerInfo.name} onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })} />
            <TextField label="Số điện thoại" fullWidth margin="normal" value={customerInfo.phone} onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })} />
            <TextField label="Email" fullWidth margin="normal" value={customerInfo.email} onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })} />
          </Box>
        );
      case 1:
        return (
          <Box>
            <TextField label="Địa chỉ giao hàng" fullWidth margin="normal" value={shipping.address} onChange={e => setShipping({ ...shipping, address: e.target.value })} />
            <TextField label="Ghi chú" fullWidth margin="normal" value={shipping.note} onChange={e => setShipping({ ...shipping, note: e.target.value })} />
          </Box>
        );
      case 2:
        return (
          <Box>
            <RadioGroup value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <FormControlLabel value="COD" control={<Radio />} label="Thanh toán khi nhận hàng (COD)" />
              <FormControlLabel value="VNPay" control={<Radio />} label="Thanh toán qua VNPay (ATM, QR, thẻ quốc tế)" />
              <FormControlLabel value="ZaloPay" control={<Radio />} label="Thanh toán qua ZaloPay (Ví điện tử, thẻ ATM)" />
            </RadioGroup>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6">Xác nhận đơn hàng</Typography>
            <Typography>Khách hàng: {customerInfo.name} - {customerInfo.phone}</Typography>
            <Typography>Địa chỉ: {shipping.address}</Typography>
            <Typography>Phương thức thanh toán: {
              paymentMethod === 'VNPay' ? 'VNPay' : 
              paymentMethod === 'ZaloPay' ? 'ZaloPay' : 'COD'
            }</Typography>
            <Typography>Số sản phẩm: {cartItems.length}</Typography>
            <Typography>Tổng tiền: {totalAmount.toLocaleString()}₫</Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ maxWidth: 600, margin: '32px auto', p: 3 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box mt={3} mb={2}>{renderStepContent(activeStep)}</Box>
      {error && <Typography color="error">{error}</Typography>}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Button disabled={activeStep === 0 || loading} onClick={handleBack}>Quay lại</Button>
        <Button variant="contained" color="primary" onClick={handleNext} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : (activeStep === steps.length - 1 ? 'Đặt hàng' : 'Tiếp tục')}
        </Button>
      </Box>
    </Paper>
  );
};

export default CheckoutPage; 