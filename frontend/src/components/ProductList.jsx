import React from 'react';
import styles from './ProductList.module.scss';
import { Card, CardContent, CardMedia, Typography, Button, Box, Chip } from '@mui/material';

// Format giá theo chuẩn Việt Nam
const formatGia = (gia) => {
  if (!gia || gia === 0) return '0VND';
  return Number(gia).toLocaleString('vi-VN') + 'VND';
};

// Helper function để tạo URL hình ảnh từ backend
const getImageUrl = (hinhAnh) => {
  if (!hinhAnh) return '/no-image.png';
  
  // Nếu đã có full URL thì return luôn
  if (hinhAnh.startsWith('http')) return hinhAnh;
  
  // Nếu có đường dẫn relative thì thêm backend URL
  if (hinhAnh.startsWith('/')) {
    return `http://localhost:5000${hinhAnh}`;
  }
  
  // Fallback cho trường hợp khác
  return `http://localhost:5000/images/products/${hinhAnh}`;
};

// Tính phần trăm giảm giá
const calculateDiscountPercent = (originalPrice, salePrice) => {
  if (!originalPrice || !salePrice || salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

// ProductList: Hiển thị danh sách sản phẩm dạng lưới
const ProductList = ({ products, onProductClick }) => {
  return (
    <div className={styles.gridContainer}>
      <div className={styles.productsGrid}>
        {products.map((product) => {
          const hasDiscount = product.giaKhuyenMai && 
                              Number(product.giaKhuyenMai) > 0 && 
                              Number(product.giaKhuyenMai) < Number(product.gia);
          const discountPercent = hasDiscount ? 
                                  calculateDiscountPercent(Number(product.gia), Number(product.giaKhuyenMai)) : 0;
          
          return (
            <div key={product.id_SanPham} className={styles.gridItem}>
              <Card 
                className={styles.card}
                onClick={() => onProductClick && onProductClick(product)}
              >
                <Box className={styles.imgBox}>
                  {/* Hiển thị phần trăm giảm giá cho tất cả sản phẩm có giảm giá */}
                  {hasDiscount && discountPercent > 0 && (
                    <Chip
                      label={`-${discountPercent}%`}
                      color="error"
                      size="small"
                      className={styles.discountBadge}
                    />
                  )}
                  <CardMedia
                    component="img"
                    height="220"
                    image={getImageUrl(product.hinhAnh)}
                    alt={product.tenSp}
                    className={styles.cardImage}
                    onError={(e) => {
                      e.target.src = '/no-image.png';
                    }}
                  />
                </Box>
                <CardContent className={styles.cardContent}>
                  <Typography variant="h6" component="div" className={styles.productName}>
                    {product.tenSp}
                  </Typography>
                  <Box className={styles.priceBlock}>
                    {hasDiscount ? (
                      <>
                        <span className={styles.oldPrice}>{formatGia(product.gia)}</span>
                        <span className={styles.salePrice}>{formatGia(product.giaKhuyenMai)}</span>
                      </>
                    ) : (
                      <span className={styles.salePrice}>{formatGia(product.gia)}</span>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    className={styles.detailBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onProductClick && onProductClick(product);
                    }}
                  >
                    ĐẶT HÀNG
                  </Button>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductList; 