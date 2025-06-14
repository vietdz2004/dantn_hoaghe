import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './ProductDetailPage.module.css';
import { Box, Typography, Button, Rating } from '@mui/material';

// ProductDetailPage: Trang chi tiết sản phẩm
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
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
        setReviews(res.data);
      } catch (err) {
        setReviews([]);
      }
    };
    fetchReviews();
  }, [id]);

  // Handler thêm vào giỏ hàng (giả lập, có thể tích hợp redux/cart context sau)
  const handleAddToCart = () => {
    alert('Đã thêm vào giỏ hàng!');
  };

  if (loading) return <Box className={styles.loading}>Đang tải...</Box>;
  if (error) return <Box className={styles.error}>{error}</Box>;
  if (!product) return null;

  return (
    <Box className={styles.detailWrap}>
      <Box className={styles.imgWrap}>
        <img
          src={product.hinhAnh || '/no-image.png'}
          alt={product.tenSp}
          className={styles.productImg}
        />
      </Box>
      <Box className={styles.infoWrap}>
        <Typography variant="h4" className={styles.productName}>{product.tenSp}</Typography>
        <Typography variant="body1" className={styles.productDesc}>{product.moTa}</Typography>
        <Box className={styles.infoRow}>
          <span>Mã SKU:</span> <b>{product.maSKU || 'N/A'}</b>
        </Box>
        <Box className={styles.infoRow}>
          <span>Thương hiệu:</span> <b>{product.thuongHieu || 'Hoashop'}</b>
        </Box>
        <Box className={styles.priceBlock}>
          {product.giaKhuyenMai && product.giaKhuyenMai < product.gia ? (
            <>
              <span className={styles.oldPrice}>{product.gia?.toLocaleString()} đ</span>
              <span className={styles.salePrice}>{product.giaKhuyenMai?.toLocaleString()} đ</span>
            </>
          ) : (
            <span className={styles.salePrice}>{product.gia?.toLocaleString()} đ</span>
          )}
        </Box>
        <Box className={styles.actionRow}>
          <Button variant="contained" color="secondary" className={styles.orderBtn}>Đặt hàng</Button>
          <Button variant="outlined" className={styles.cartBtn} onClick={handleAddToCart}>Thêm vào giỏ hàng</Button>
        </Box>
        <Button variant="outlined" className={styles.backBtn} onClick={() => navigate(-1)}>Quay lại</Button>
      </Box>
      {/* Block đánh giá */}
      <Box className={styles.reviewBlock}>
        <Typography variant="h6" className={styles.reviewTitle}>Đánh giá sản phẩm</Typography>
        {reviews.length === 0 ? (
          <Typography color="text.secondary">Chưa có đánh giá nào.</Typography>
        ) : (
          <Box className={styles.reviewList}>
            {reviews.map((rv) => (
              <Box key={rv.id_DanhGia} className={styles.reviewItem}>
                <Rating value={rv.danhGiaSao} readOnly size="small" />
                <Typography variant="body2" className={styles.reviewContent}>{rv.noiDung}</Typography>
                <Typography variant="caption" color="text.secondary">{new Date(rv.ngayDanhGia).toLocaleDateString()}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProductDetailPage; 