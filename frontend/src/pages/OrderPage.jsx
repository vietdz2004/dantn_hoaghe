import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  Button, 
  Box, 
  Divider,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import { 
  ShoppingBag, 
  LocalShipping, 
  CheckCircle, 
  Cancel, 
  Schedule,
  Visibility,
  Star
} from '@mui/icons-material';
import { orderAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ReviewForm from '../components/ReviewForm';

// OrderPage: Trang quản lý đơn hàng
const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id_NguoiDung) {
        console.log('❌ No user ID found:', user);
        return;
      }
      
      console.log('🔍 Fetching orders for user ID:', user.id_NguoiDung);
      
      try {
        setLoading(true);
        
        // Try to fetch from API first
        try {
          console.log('📡 Calling API: /api/orders/user/' + user.id_NguoiDung);
          const response = await orderAPI.getUserOrders(user.id_NguoiDung);
          console.log('✅ API Response:', response);
          console.log('📦 Orders data:', response.data);
          
          // If API returns empty array, use mock data for testing
          if (!response.data || response.data.length === 0) {
            console.log('⚠️ API returned empty data, using mock data for testing');
            throw new Error('No orders found, using mock data');
          }
          
          const ordersData = response.data?.data || response.data || [];
          setOrders(Array.isArray(ordersData) ? ordersData : []);
          setError('');
        } catch (apiError) {
          console.warn('❌ API Error:', apiError);
          console.warn('📄 Using mock data instead');
          
          // Use mock data when API is not available OR returns empty
          const mockOrders = [
            {
              id_DonHang: 1,
              maDonHang: 'DH001',
              tongThanhToan: 350000,
              trangThaiDonHang: 'CHO_XAC_NHAN',
              ngayDatHang: new Date(Date.now() - 86400000).toISOString(), // Yesterday
              phuongThucThanhToan: 'TIEN_MAT',
              itemCount: 3,
              OrderDetails: [
                {
                  tenSp: 'Hoa Hồng Đỏ (12 bông)',
                  hinhAnh: 'rose.jpg',
                  soLuong: 2,
                  giaTaiThoiDiem: 150000
                },
                {
                  tenSp: 'Hoa Cúc Trắng (6 bông)',
                  hinhAnh: 'daisy.jpg',
                  soLuong: 1,
                  giaTaiThoiDiem: 50000
                }
              ]
            },
            {
              id_DonHang: 2,
              maDonHang: 'DH002',
              tongThanhToan: 250000,
              trangThaiDonHang: 'DA_GIAO',
              ngayDatHang: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
              phuongThucThanhToan: 'CHUYEN_KHOAN',
              itemCount: 1,
              OrderDetails: [
                {
                  tenSp: 'Bó Hoa Sinh Nhật',
                  hinhAnh: 'event.jpg',
                  soLuong: 1,
                  giaTaiThoiDiem: 250000
                }
              ]
            }
          ];
          
          console.log('📋 Setting mock orders:', mockOrders);
          setOrders(mockOrders);
          setError('');
        }
      } catch (error) {
        console.error('💥 Fatal error fetching orders:', error);
        setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Get status info
  const getStatusInfo = (status) => {
    const statusMap = {
      'CHO_XAC_NHAN': { 
        label: 'Chờ xác nhận', 
        color: 'warning', 
        icon: <Schedule fontSize="small" /> 
      },
      'DA_XAC_NHAN': { 
        label: 'Đã xác nhận', 
        color: 'info', 
        icon: <CheckCircle fontSize="small" /> 
      },
      'DANG_GIAO': { 
        label: 'Đang giao', 
        color: 'primary', 
        icon: <LocalShipping fontSize="small" /> 
      },
      'DA_GIAO': { 
        label: 'Đã giao', 
        color: 'success', 
        icon: <CheckCircle fontSize="small" /> 
      },
      'DA_HUY': { 
        label: 'Đã hủy', 
        color: 'error', 
        icon: <Cancel fontSize="small" /> 
      }
    };
    return statusMap[status] || { label: status, color: 'default', icon: null };
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle view order details
  const handleViewDetails = (orderId) => {
    // For now, we'll show an alert. Later you can create OrderDetailPage
    alert(`Xem chi tiết đơn hàng #${orderId}`);
  };

  // Handle cancel order
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
    
    try {
      await orderAPI.cancelOrder(orderId);
      // Refresh orders
      const response = await orderAPI.getUserOrders(user.id_NguoiDung);
      setOrders(response.data || []);
      alert('Đã hủy đơn hàng thành công!');
    } catch (error) {
      console.error('Error canceling order:', error);
      alert('Không thể hủy đơn hàng. Vui lòng thử lại sau.');
    }
  };

  // Handle review product
  const handleReviewProduct = (product, orderId) => {
    console.log('📝 Opening review form for product:', product);
    setSelectedProduct({
      ...product,
      orderId: orderId,
      // Tạo product ID từ tên sản phẩm nếu không có
      id_SanPham: product.id_SanPham || 1 // Mock ID cho demo
    });
    setShowReviewForm(true);
  };

  // Handle close review form
  const handleCloseReviewForm = () => {
    setShowReviewForm(false);
    setSelectedProduct(null);
  };

  // Handle review submitted successfully
  const handleReviewSubmitted = () => {
    console.log('✅ Review submitted successfully');
    // Có thể refresh orders hoặc update UI ở đây
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Đang tải đơn hàng...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        <ShoppingBag sx={{ verticalAlign: 'middle', mr: 1 }} />
        Đơn hàng của tôi
      </Typography>

      {orders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingBag sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Bạn chưa có đơn hàng nào
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Hãy khám phá những sản phẩm tuyệt vời của chúng tôi!
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/products')}
            sx={{ mt: 2 }}
          >
            Mua sắm ngay
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.trangThaiDonHang);
            
            return (
              <Grid item xs={12} key={order.id_DonHang}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    {/* Order Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" component="div">
                          Đơn hàng #{order.maDonHang || order.id_DonHang}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Đặt ngày: {formatDate(order.ngayDatHang)}
                        </Typography>
                      </Box>
                      <Chip 
                        label={statusInfo.label}
                        color={statusInfo.color}
                        icon={statusInfo.icon}
                        variant="outlined"
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Order Details */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={8}>
                        <Typography variant="subtitle2" gutterBottom>
                          Sản phẩm ({order.OrderDetails?.length || 0} sản phẩm):
                        </Typography>
                        {order.OrderDetails && order.OrderDetails.length > 0 ? (
                          <List dense>
                            {order.OrderDetails.slice(0, 3).map((item, index) => (
                              <ListItem key={index} sx={{ px: 0 }}>
                                <ListItemAvatar>
                                  <Avatar 
                                    src={item.hinhAnh ? `/images/products/${item.hinhAnh}` : '/no-image.png'}
                                    variant="rounded"
                                    sx={{ width: 50, height: 50 }}
                                  />
                                </ListItemAvatar>
                                <ListItemText
                                  primary={item.tenSp}
                                  secondary={`Số lượng: ${item.soLuongMua ?? item.soLuong ?? '-'} × ${formatCurrency(item.donGiaLucMua ?? item.giaTaiThoiDiem ?? item.giaSanPham ?? 0)}`}
                                />
                              </ListItem>
                            ))}
                            {order.OrderDetails.length > 3 && (
                              <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                                ... và {order.OrderDetails.length - 3} sản phẩm khác
                              </Typography>
                            )}
                          </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Thông tin sản phẩm đang được tải...
                          </Typography>
                        )}
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="text.secondary">
                            Tổng tiền:
                          </Typography>
                          <Typography variant="h6" color="primary" gutterBottom>
                            {formatCurrency(order.tongThanhToan)}
                          </Typography>

                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Phương thức: {order.phuongThucThanhToan || 'Chưa xác định'}
                          </Typography>

                          {/* Action Buttons */}
                          <Box sx={{ mt: 2 }}>
                            <Button
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => handleViewDetails(order.id_DonHang)}
                              sx={{ mr: 1, mb: 1 }}
                            >
                              Xem chi tiết
                            </Button>
                            
                            {order.trangThaiDonHang === 'CHO_XAC_NHAN' && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<Cancel />}
                                onClick={() => handleCancelOrder(order.id_DonHang)}
                                sx={{ mb: 1 }}
                              >
                                Hủy đơn
                              </Button>
                            )}
                            
                            {/* Nút đánh giá cho đơn hàng đã giao */}
                            {order.trangThaiDonHang === 'DA_GIAO' && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Đánh giá sản phẩm:
                                </Typography>
                                {order.OrderDetails && order.OrderDetails.map((product, index) => (
                                  <Button
                                    key={index}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<Star />}
                                    onClick={() => handleReviewProduct(product, order.id_DonHang)}
                                    sx={{ mr: 1, mb: 1 }}
                                    title={`Đánh giá ${product.tenSp}`}
                                  >
                                    Đánh giá
                                  </Button>
                                ))}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Review Form Modal */}
      {selectedProduct && (
        <ReviewForm
          open={showReviewForm}
          onClose={handleCloseReviewForm}
          productId={selectedProduct.id_SanPham}
          productName={selectedProduct.tenSp}
          userHasPurchased={true} // User đã mua sản phẩm vì đây là từ order
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </Container>
  );
};

export default OrderPage; 