import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  Grid,
  Button,
  IconButton,
  Divider,
  Avatar,
  Alert,
  Paper
} from '@mui/material';
import { 
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Utility function to format currency
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

// Helper function để tạo URL hình ảnh từ backend
const getImageUrl = (hinhAnh) => {
  if (!hinhAnh) return '/no-image.png';
  
  // Nếu đã có full URL thì return luôn
  if (hinhAnh.startsWith('http')) return hinhAnh;
  
  // Nếu có đường dẫn relative thì thêm backend URL
  if (hinhAnh.startsWith('/')) {
    return `http://localhost:5002${hinhAnh}`;
  }
  
  // Fallback cho trường hợp khác
  return `http://localhost:5002/images/products/${hinhAnh}`;
};

const CartPage = () => {
  const { cartItems, getTotalItems, getTotalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', {
        state: {
          returnUrl: '/checkout',
          message: 'Vui lòng đăng nhập để tiếp tục thanh toán'
        }
      });
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <CartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Giỏ hàng của bạn đang trống
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Hãy thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm!
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/products')}
            startIcon={<BackIcon />}
          >
            Tiếp tục mua sắm
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Giỏ hàng ({getTotalItems()} sản phẩm)
        </Typography>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/products')}
        >
          Tiếp tục mua sắm
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              {cartItems.map((item, index) => (
                <Box key={item.id_SanPham}>
                  <Grid container spacing={2} alignItems="center">
                    {/* Product Image */}
                    <Grid item xs={3} sm={2}>
                      <Avatar
                        variant="rounded"
                        src={getImageUrl(item.hinhAnh)}
                        sx={{ width: 80, height: 80 }}
                      />
                    </Grid>

                    {/* Product Info */}
                    <Grid item xs={9} sm={4}>
                      <Typography variant="h6" fontWeight="bold" noWrap>
                        {item.tenSp}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.thuongHieu}
                      </Typography>
                      <Box mt={1}>
                        {item.giaKhuyenMai ? (
                          <>
                            <Typography variant="body1" color="primary" fontWeight="bold">
                              {formatPrice(item.giaKhuyenMai)}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ textDecoration: 'line-through' }}
                            >
                              {formatPrice(item.gia)}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body1" fontWeight="bold">
                            {formatPrice(item.gia)}
                          </Typography>
                        )}
                      </Box>
                    </Grid>

                    {/* Quantity Controls */}
                    <Grid item xs={6} sm={3}>
                      <Box display="flex" alignItems="center" justifyContent="center">
                        <IconButton 
                          size="small" 
                          onClick={() => handleQuantityChange(item.id_SanPham, item.soLuong - 1)}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography variant="body1" sx={{ mx: 2, minWidth: 30, textAlign: 'center' }}>
                          {item.soLuong}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleQuantityChange(item.id_SanPham, item.soLuong + 1)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </Grid>

                    {/* Subtotal & Remove */}
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="right">
                        <Typography variant="body1" fontWeight="bold" color="primary">
                          {formatPrice((item.giaKhuyenMai || item.gia) * item.soLuong)}
                        </Typography>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => removeFromCart(item.id_SanPham)}
                          sx={{ mt: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>

                  {index < cartItems.length - 1 && <Divider sx={{ my: 2 }} />}
                </Box>
              ))}

              {/* Clear Cart Button */}
              <Box mt={3} textAlign="right">
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={clearCart}
                  startIcon={<DeleteIcon />}
                >
                  Xóa tất cả
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Tóm tắt đơn hàng
              </Typography>
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Số lượng sản phẩm:</Typography>
                <Typography>{getTotalItems()} sản phẩm</Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography>Tạm tính:</Typography>
                <Typography>{formatPrice(getTotalPrice())}</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" justifyContent="space-between" mb={3}>
                <Typography variant="h6" fontWeight="bold">
                  Tổng cộng:
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {formatPrice(getTotalPrice())}
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleCheckout}
                sx={{ mb: 2 }}
              >
                Thanh toán
              </Button>

              <Alert severity="info" sx={{ mt: 2 }}>
                Miễn phí vận chuyển cho đơn hàng trên 500.000đ
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage; 