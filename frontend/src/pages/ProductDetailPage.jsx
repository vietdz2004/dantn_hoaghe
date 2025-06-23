import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { productsAPI } from '../services/api';
import styles from './ProductDetailPage.module.scss';
import QuickOrderModal from '../components/QuickOrderModal';
import ProductList from '../components/ProductList';
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
  Link,
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
  Inventory
} from '@mui/icons-material';

// Format giá theo chuẩn Việt Nam
const formatGia = (gia) => {
  if (!gia || gia === 0) return '0VND';
  return Number(gia).toLocaleString('vi-VN') + 'VND';
};

// Helper function để tạo URL hình ảnh từ backend
const formatImageUrl = (hinhAnh) => {
  if (!hinhAnh) return '/no-image.svg';
  
  // Nếu đã có full URL thì return luôn
  if (hinhAnh.startsWith('http')) return hinhAnh;
  
  // Nếu có đường dẫn relative thì thêm backend URL
  if (hinhAnh.startsWith('/')) {
    return `http://localhost:5000${hinhAnh}`;
  }
  
  // Fallback cho trường hợp khác
  return `http://localhost:5000/images/products/${hinhAnh}`;
};

// ProductDetailPage: Trang chi tiết sản phẩm
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [userHasPurchased, setUserHasPurchased] = useState(false);
  const [showQuickOrderModal, setShowQuickOrderModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productsAPI.getById(id);
        console.log('Product API response:', res.data);
        
        // Handle both response formats: {success: true, data: {}} and direct data
        const productData = res.data.success ? res.data.data : res.data;
        setProduct(productData);
      } catch (error) {
        console.error('Error fetching product:', error);
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
      } catch (error) {
        console.error('Error fetching reviews:', error);
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
      } catch (error) {
        console.error('Error fetching related products:', error);
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

  // Handler đặt hàng
  const handleAddToCart = () => {
    setNotificationMessage(`Đã đặt ${quantity} sản phẩm thành công!`);
    setShowNotification(true);
    // TODO: Tích hợp với Redux/Context cho giỏ hàng thực tế
  };

  // Handler đặt nhanh
  const handleOrderNow = () => {
    setShowQuickOrderModal(true);
  };

  // Handler khi đóng modal đặt hàng nhanh
  const handleQuickOrderClose = (success, message) => {
    setShowQuickOrderModal(false);
    if (success) {
      setNotificationMessage(message || 'Đã gửi đơn hàng nhanh thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
      setShowNotification(true);
    }
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

  if (loading) return <Box className={styles.loading}>Đang tải...</Box>;
  if (error) return <Box className={styles.error}>{error}</Box>;
  if (!product) return null;

  return (
    <Box className={styles.detailWrap}>
      {/* Breadcrumbs */}
      <Box className={styles.breadcrumbWrap}>
        <Breadcrumbs aria-label="breadcrumb" className={styles.breadcrumbs}>
          <Link color="inherit" href="/" className={styles.breadcrumbLink}>
            Trang chủ
          </Link>
          <Link color="inherit" href="/products" className={styles.breadcrumbLink}>
            Sản phẩm
          </Link>
          <Typography color="text.primary">{product.tenSp}</Typography>
        </Breadcrumbs>
        <IconButton onClick={() => navigate(-1)} className={styles.backBtn}>
          <ArrowBack />
        </IconButton>
      </Box>

      <Grid container spacing={4} className={styles.productGrid}>
        {/* Hình ảnh sản phẩm */}
        <Grid item xs={12} md={6}>
          <Box className={styles.imageSection}>
            <Box className={styles.mainImageWrap}>
              {imageLoading && !imageError && (
                <Box className={styles.imageLoader}>
                  <Typography>Đang tải hình ảnh...</Typography>
                </Box>
              )}
              <img
                src={formatImageUrl(product.hinhAnh)}
                alt={product.tenSp}
                className={`${styles.mainImage} ${imageLoading ? styles.imageHidden : ''}`}
                onError={(e) => {
                  console.log('Image load error:', e.target.src);
                  setImageError(true);
                  setImageLoading(false);
                  e.target.src = '/no-image.svg';
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', formatImageUrl(product.hinhAnh));
                  setImageLoading(false);
                  setImageError(false);
                }}
              />
              <Box className={styles.imageActions}>
                <IconButton 
                  onClick={handleToggleFavorite}
                  className={`${styles.favoriteBtn} ${isFavorite ? styles.favoriteActive : ''}`}
                >
                  <Favorite />
                </IconButton>
                <IconButton onClick={handleShare} className={styles.shareBtn}>
                  <Share />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Thông tin sản phẩm */}
        <Grid item xs={12} md={6}>
          <Box className={styles.infoSection}>

            
            {/* Tên sản phẩm */}
            <Typography variant="h4" className={styles.productName}>
              {product.tenSp}
            </Typography>

            {/* Đánh giá */}
            <Box className={styles.ratingSection}>
              <Rating value={4.5} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">
                (0 đánh giá)
              </Typography>
            </Box>

            {/* Giá */}
            <Box className={styles.priceSection}>
              {product.giaKhuyenMai && Number(product.giaKhuyenMai) > 0 && Number(product.giaKhuyenMai) < Number(product.gia) ? (
                <>
                  <Typography variant="h5" className={styles.salePrice}>
                    {formatGia(product.giaKhuyenMai)}
                  </Typography>
                  <Typography variant="body1" className={styles.oldPrice}>
                    {formatGia(product.gia)}
                  </Typography>
                  <Chip 
                    label={`-${Math.round(((product.gia - product.giaKhuyenMai) / product.gia) * 100)}%`}
                    color="error"
                    size="small"
                    className={styles.discountChip}
                  />
                </>
              ) : (
                <Typography variant="h5" className={styles.salePrice}>
                  {formatGia(product.gia)}
                </Typography>
              )}
            </Box>

            {/* Thông tin chi tiết */}
            <Box className={styles.detailsSection}>
              <Typography variant="body2" color="text.secondary">
                Mã: SP{(product.maSanPham || product.id_SanPham || 0).toString().padStart(6, '0')}
              </Typography>
            </Box>

            {/* Thông tin tồn kho */}
            <Box className={styles.inventorySection}>
              <Box className={styles.stockInfo}>
                <Box className={styles.stockStatus}>
                  <Inventory className={styles.stockIcon} />
                  <Box className={styles.stockDetails}>
                    <Typography variant="body1" className={styles.stockLabel}>
                      Tình trạng kho hàng:
                    </Typography>
                    <Box className={styles.stockIndicator}>
                      {(() => {
                        const stock = Number(product.soLuongTon) || 0;
                        const minStock = Number(product.soLuongToiThieu) || 5;
                        
                        if (stock <= 0) {
                          return (
                            <Chip 
                              label="❌ Hết hàng"
                              color="error"
                              size="small"
                              className={styles.stockChip}
                            />
                          );
                        } else if (stock <= minStock) {
                          return (
                            <Chip 
                              label="⚠️ Sắp hết hàng"
                              color="warning"
                              size="small"
                              className={styles.stockChip}
                            />
                          );
                        } else {
                          return (
                            <Chip 
                              label="✅ Còn hàng"
                              color="success"
                              size="small"
                              className={styles.stockChip}
                            />
                          );
                        }
                      })()}
                    </Box>
                  </Box>
                </Box>
                
                <Box className={styles.stockQuantity}>
                  <Typography variant="body2" color="text.secondary">
                    Số lượng có sẵn: <strong>{Number(product.soLuongTon) || 0} sản phẩm</strong>
                  </Typography>
                  {Number(product.soLuongTon) > 0 && Number(product.soLuongTon) <= Number(product.soLuongToiThieu || 5) && (
                    <Typography variant="caption" color="warning.main" className={styles.lowStockWarning}>
                      ⏰ Chỉ còn lại {Number(product.soLuongTon)} sản phẩm
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            <Divider className={styles.divider} />

            {/* Số lượng */}
            <Box className={styles.quantitySection}>
              <Typography variant="body1" className={styles.quantityLabel}>
                Số lượng:
              </Typography>
              <Box className={styles.quantityControls}>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className={styles.quantityBtn}
                >
                  -
                </Button>
                <Typography variant="body1" className={styles.quantityValue}>
                  {quantity}
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= Math.min(99, Number(product.soLuongTon) || 0)}
                  className={styles.quantityBtn}
                >
                  +
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" className={styles.quantityNote}>
                Tối đa: {Math.min(99, Number(product.soLuongTon) || 0)} sản phẩm
              </Typography>
            </Box>

            {/* Buttons hành động */}
            <Box className={styles.actionSection}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={Number(product.soLuongTon) <= 0}
                className={styles.addToCartBtn}
              >
                {Number(product.soLuongTon) <= 0 ? 'Hết hàng' : 'Đặt hàng'}
              </Button>
              <Button 
                variant="contained" 
                color="secondary" 
                size="large"
                onClick={handleOrderNow}
                disabled={Number(product.soLuongTon) <= 0}
                className={styles.orderNowBtn}
              >
                Đặt nhanh
              </Button>
            </Box>

            {/* Thông tin giao hàng */}
            <Box className={styles.shippingInfo}>
              <Typography variant="body2" color="text.secondary">
                ✓ Giao hàng miễn phí nội thành | ✓ Đảm bảo hoa tươi 100%
              </Typography>
              {Number(product.soLuongTon) > 0 && (
                <Typography variant="body2" color="success.main" className={styles.availabilityInfo}>
                  🚚 Có thể giao hàng ngay trong ngày
                </Typography>
              )}
            </Box>
          </Box>
                </Grid>
      </Grid>

      {/* Mô tả sản phẩm */}
      <Box className={styles.descriptionSection}>
        <Typography variant="h6" className={styles.sectionTitle}>
          Mô tả sản phẩm
        </Typography>
        <Typography variant="body1" className={styles.description}>
          {product.moTa}
        </Typography>
      </Box>

      {/* Đánh giá sản phẩm */}
      <Box className={styles.reviewSection}>
        <Typography variant="h6" className={styles.sectionTitle}>
          Đánh giá sản phẩm
        </Typography>
        {reviews.length === 0 ? (
          <Box className={styles.noReviews}>
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
                className={styles.reviewBtn}
                startIcon={<Description />}
              >
                Viết đánh giá
              </Button>
            )}
          </Box>
        ) : (
          <Box className={styles.reviewList}>
            {reviews.map((rv) => (
              <Box key={rv.id_DanhGia} className={styles.reviewItem}>
                <Box className={styles.reviewHeader}>
                  <Box className={styles.reviewUser}>
                    <Typography variant="subtitle2" className={styles.userName}>
                      {rv.tenNguoiDung || rv.hoTen || 'Khách hàng'}
                    </Typography>
                    <Rating value={rv.danhGiaSao || rv.soSao || 5} readOnly size="small" />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(rv.ngayDanhGia || rv.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                  </Typography>
                </Box>
                <Typography variant="body2" className={styles.reviewContent}>
                  {rv.noiDung || rv.binhLuan || 'Không có nội dung đánh giá'}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Sản phẩm liên quan */}
      {relatedProducts.length > 0 && (
        <Box className={styles.relatedSection}>
          <Typography variant="h6" className={styles.sectionTitle}>
            🔗 Sản phẩm liên quan
          </Typography>
          <Typography variant="body2" color="text.secondary" className={styles.sectionSubtitle}>
            Được gợi ý dựa trên thuật toán ML: danh mục, thương hiệu, khoảng giá tương tự
          </Typography>
          
          <Box className={styles.relatedProductsGrid}>
            <ProductList 
              products={relatedProducts} 
              onProductClick={handleRelatedProductClick}
              showBadges={true}
              variant="compact"
            />
          </Box>
          
          {/* Thông tin về thuật toán gợi ý */}
          <Box className={styles.algorithmInfo}>
            <Typography variant="caption" color="text.secondary">
              💡 Gợi ý dựa trên: Cùng danh mục ({product.tenDanhMuc}), 
              cùng thương hiệu ({product.thuongHieu}), 
              khoảng giá tương tự (±30%), 
              tình trạng khuyến mãi và tồn kho
            </Typography>
          </Box>
        </Box>
      )}

      {/* Quick Order Modal */}
      <QuickOrderModal
        open={showQuickOrderModal}
        onClose={handleQuickOrderClose}
        product={product}
        quantity={quantity}
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
    </Box>
  );
};

export default ProductDetailPage; 