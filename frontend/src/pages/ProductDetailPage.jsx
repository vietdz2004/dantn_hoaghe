import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { productsAPI } from '../services/api';
import styles from './ProductDetailPage.module.scss';

import ProductList from '../components/ProductList';
import ReviewForm from '../components/ReviewForm';
import { 
  Box, 
  Typography, 
  Button, 
  Rating, 
  Chip, 
  Divider, 
  Grid, 
  IconButton,
  Snackbar,
  Alert,
  Breadcrumbs,
  Container,
  Card,
  CardContent
} from '@mui/material';
import { 
  ShoppingCart, 
  Favorite, 
  Share, 
  LocalShipping,
  Verified,
  ArrowBack,
  Description,
  Info,
  LocalFlorist,
  Category,
  Tag,
  Inventory,
  Add,
  Remove
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

// Format giá theo chuẩn Việt Nam
const formatGia = (gia) => {
  if (!gia || gia === 0) return '0VND';
  return Number(gia).toLocaleString('vi-VN') + 'VND';
};

// Helper function để tạo URL hình ảnh từ backend
const formatImageUrl = (hinhAnh) => {
  if (!hinhAnh) return '/no-image.svg';
  if (hinhAnh.startsWith('http')) return hinhAnh;
  
  // Nếu có đường dẫn relative thì thêm backend URL
  if (hinhAnh.startsWith('/')) {
    return `http://localhost:5002${hinhAnh}`;
  }
  
  // Fallback cho trường hợp khác
  return `http://localhost:5002/images/products/${hinhAnh}`;
};

// ProductDetailPage: Trang chi tiết sản phẩm
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [userHasPurchased, setUserHasPurchased] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productsAPI.getById(id);
        console.log('Product API response:', res.data);
        
        // Handle both response formats: {success: true, data: {}} and direct data
        const productData = res.data.success ? res.data.data : res.data;
        setProduct(productData);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Không tìm thấy sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(`/products/${id}/reviews`);
        console.log('Reviews API response:', res.data);
        
        // Handle both response formats
        const reviewsData = res.data.success ? res.data.data : res.data;
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviews([]);
      }
    };
    
    // Fetch sản phẩm liên quan từ server-side API
    const fetchRelatedProducts = async () => {
      try {
        const res = await productsAPI.getRelatedProducts(id, 8);
        console.log('Related products API response:', res.data);
        
        // Handle both response formats
        const relatedData = res.data.success ? res.data.data : res.data;
        setRelatedProducts(Array.isArray(relatedData) ? relatedData : []);
      } catch (err) {
        console.error('Error fetching related products:', err);
        setRelatedProducts([]);
      }
    };
    
    // Kiểm tra xem user đã mua sản phẩm này chưa
    const checkUserPurchase = async () => {
      try {
        // TODO: Thay thế bằng API thực tế để check purchase history
        // const res = await api.get(`/users/me/purchases/${id}`);
        // setUserHasPurchased(res.data.hasPurchased);
        
        // Mock data for demo
        setUserHasPurchased(false); // Thay đổi thành true để test
      } catch {
        setUserHasPurchased(false);
      }
    };
    
    fetchReviews();
    fetchRelatedProducts();
    checkUserPurchase();
  }, [id]);

  // Handler thêm giỏ hàng
  const handleAddToCart = () => {
    if (!user) {
      navigate('/login', {
        state: {
          returnUrl: `/products/${id}`,
          message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng'
        }
      });
      return;
    }
    
    try {
      addToCart(product, quantity);
      setNotificationMessage(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
      setShowNotification(true);
    } catch {
      setNotificationMessage('Có lỗi khi thêm vào giỏ hàng');
      setShowNotification(true);
    }
  };

  // Handler đặt hàng
  const handleOrder = () => {
    if (!user) {
      navigate('/login', {
        state: {
          returnUrl: `/products/${id}`,
          message: 'Vui lòng đăng nhập để đặt hàng'
        }
      });
      return;
    }
    
    // Thêm vào giỏ hàng trước
    addToCart(product, quantity);
    // Chuyển đến trang thanh toán
    navigate('/checkout');
  };

  // Handler yêu thích
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    setNotificationMessage(isFavorite ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
    setShowNotification(true);
  };

  // Handler chia sẻ
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.tenSp,
        text: product.moTa,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setNotificationMessage('Đã copy link sản phẩm!');
      setShowNotification(true);
    }
  };

  // Handler thay đổi số lượng
  const handleQuantityChange = (newQuantity) => {
    const maxQuantity = Math.min(99, Number(product?.soLuongTon) || 0);
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  // Handler khi click vào sản phẩm liên quan
  const handleRelatedProductClick = (relatedProduct) => {
    navigate(`/products/${relatedProduct.id_SanPham}`);
  };

  // Handler mở form viết đánh giá
  const handleOpenReviewForm = () => {
    if (!user) {
      navigate('/login', {
        state: {
          returnUrl: `/products/${id}`,
          message: 'Vui lòng đăng nhập để viết đánh giá'
        }
      });
      return;
    }
    setShowReviewForm(true);
  };

  // Handler đóng form viết đánh giá
  const handleCloseReviewForm = () => {
    setShowReviewForm(false);
  };

  // Handler sau khi submit đánh giá thành công
  const handleReviewSubmitted = async () => {
    try {
      // Refresh danh sách đánh giá
      const res = await api.get(`/products/${id}/reviews`);
      const reviewsData = res.data.success ? res.data.data : res.data;
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      
      // Hiện thông báo thành công
      setNotificationMessage('Đánh giá của bạn đã được gửi thành công!');
      setShowNotification(true);
    } catch (err) {
      console.error('Error refreshing reviews:', err);
    }
  };

  if (loading) return (
    <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
      <Typography variant="h6">Đang tải...</Typography>
    </Container>
  );
  
  if (error) return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Alert severity="error">{error}</Alert>
    </Container>
  );
  
  if (!product) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/">
            Trang chủ
          </Link>
          <Link color="inherit" href="/products">
            Sản phẩm
          </Link>
          <Typography color="text.primary">{product.tenSp}</Typography>
        </Breadcrumbs>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack />
        </IconButton>
      </Box>

      <Grid container spacing={4}>
        {/* Hình ảnh sản phẩm */}
        <Grid item xs={12} md={6}>
          <Card sx={{ position: 'relative' }}>
            <Box sx={{ position: 'relative', paddingTop: '100%' }}>
              <img
                src={formatImageUrl(product.hinhAnh)}
                alt={product.tenSp}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.src = '/no-image.svg';
                }}
              />
              <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <IconButton 
                  onClick={handleToggleFavorite}
                  sx={{ 
                    bgcolor: 'white', 
                    color: isFavorite ? 'red' : 'gray',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                  }}
                >
                  <Favorite />
                </IconButton>
                <IconButton 
                  onClick={handleShare}
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'gray',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                  }}
                >
                  <Share />
                </IconButton>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Thông tin sản phẩm */}
        <Grid item xs={12} md={6}>
          <Box>
            {/* Tên sản phẩm */}
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
              {product.tenSp}
            </Typography>

            {/* Đánh giá */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Rating value={4.5} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">
                (0 đánh giá)
              </Typography>
            </Box>

            {/* Giá */}
            <Card sx={{ bgcolor: '#fce4ec', p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                {product.giaKhuyenMai && Number(product.giaKhuyenMai) > 0 && Number(product.giaKhuyenMai) < Number(product.gia) ? (
                  <>
                    <Typography variant="h5" sx={{ color: '#e91e63', fontWeight: 'bold' }}>
                      {formatGia(product.giaKhuyenMai)}
                    </Typography>
                    <Typography variant="body1" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                      {formatGia(product.gia)}
                    </Typography>
                    <Chip 
                      label={`-${Math.round(((product.gia - product.giaKhuyenMai) / product.gia) * 100)}%`}
                      color="error"
                      size="small"
                    />
                  </>
                ) : (
                  <Typography variant="h5" sx={{ color: '#e91e63', fontWeight: 'bold' }}>
                    {formatGia(product.gia)}
                  </Typography>
                )}
              </Box>
            </Card>

            {/* Thông tin chi tiết */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Mã: SP{(product.maSanPham || product.id_SanPham || 0).toString().padStart(6, '0')}
            </Typography>

            {/* Thông tin tồn kho */}
            <Box sx={{ mb: 2 }}>
              {(() => {
                const stock = Number(product.soLuongTon) || 0;
                const minStock = Number(product.soLuongToiThieu) || 5;
                
                if (stock <= 0) {
                  return <Chip label="Hết hàng" color="error" />;
                } else if (stock <= minStock) {
                  return <Chip label={`Còn ${stock} sản phẩm`} color="warning" />;
                } else {
                  return <Chip label={`Còn ${stock} sản phẩm`} color="success" />;
                }
              })()}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Số lượng */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Số lượng:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 1 }}>
                <IconButton 
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  size="small"
                >
                  <Remove />
                </IconButton>
                <Typography sx={{ px: 2, minWidth: 40, textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <IconButton 
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= Math.min(99, Number(product.soLuongTon) || 0)}
                  size="small"
                >
                  <Add />
                </IconButton>
              </Box>
            </Box>

            {/* Buttons hành động */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button 
                variant="outlined" 
                color="primary" 
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={Number(product.soLuongTon) <= 0}
                fullWidth
              >
                {Number(product.soLuongTon) <= 0 ? 'Hết hàng' : 'Thêm giỏ hàng'}
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={handleOrder}
                disabled={Number(product.soLuongTon) <= 0}
                fullWidth
              >
                Đặt hàng
              </Button>
            </Box>

            {/* Thông tin giao hàng */}
            <Card sx={{ bgcolor: '#f5f5f5', p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                ✓ Giao hàng miễn phí nội thành | ✓ Đảm bảo hoa tươi 100%
              </Typography>
              {Number(product.soLuongTon) > 0 && (
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  🚚 Có thể giao hàng ngay trong ngày
                </Typography>
              )}
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Mô tả sản phẩm */}
      <Card sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Mô tả sản phẩm
        </Typography>
        <Typography variant="body1">
          {product.moTa}
        </Typography>
      </Card>

      {/* Đánh giá sản phẩm */}
      <Card sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Đánh giá sản phẩm
        </Typography>
        {reviews.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {userHasPurchased 
                ? 'Chưa có đánh giá. Hãy là người đầu tiên đánh giá sản phẩm!' 
                : 'Chưa có đánh giá. Chỉ khách hàng đã mua sản phẩm mới có thể đánh giá.'
              }
            </Typography>
            {userHasPurchased && (
              <Button 
                variant="outlined" 
                color="primary" 
                size="small"
                startIcon={<Description />}
                onClick={handleOpenReviewForm}
                sx={{ mt: 2 }}
              >
                Viết đánh giá
              </Button>
            )}
          </Box>
        ) : (
          <Box>
            {reviews.map((review, index) => (
              <Card key={index} sx={{ mb: 2, p: 2, bgcolor: '#f9f9f9' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {review.userName || 'Khách hàng'}
                  </Typography>
                  <Rating value={review.rating || 5} readOnly size="small" />
                </Box>
                <Typography variant="body2">
                  {review.content}
                </Typography>
              </Card>
            ))}
            {userHasPurchased && (
              <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<Description />}
                onClick={handleOpenReviewForm}
              >
                Viết đánh giá
              </Button>
            )}
          </Box>
        )}
      </Card>

      {/* Sản phẩm liên quan */}
      {relatedProducts.length > 0 && (
        <Card sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
            🔗 Sản phẩm liên quan
          </Typography>
          <ProductList 
            products={relatedProducts} 
            onProductClick={handleRelatedProductClick}
            showBadges={true}
            variant="compact"
          />
        </Card>
      )}

      {/* Review Form Modal */}
      <ReviewForm
        open={showReviewForm}
        onClose={handleCloseReviewForm}
        productId={product.id_SanPham}
        productName={product.tenSp}
        userHasPurchased={userHasPurchased}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={showNotification}
        autoHideDuration={3000}
        onClose={() => setShowNotification(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowNotification(false)} 
          severity="success"
          variant="filled"
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetailPage; 