import React from 'react';
import styles from './ProductList.module.css';
import { Card, CardContent, CardMedia, Typography, Grid, Button, Box } from '@mui/material';

// ProductList: Hiển thị danh sách sản phẩm dạng lưới
const ProductList = ({ products, onViewDetail }) => {
  return (
    <Grid container spacing={3} className={styles.gridContainer}>
      {products.map((product) => (
        <Grid item xs={12} sm={6} md={4} key={product.id_SanPham}>
          <Card className={styles.card}>
            <Box className={styles.imgBox}>
              <CardMedia
                component="img"
                height="200"
                image={product.hinhAnh || '/no-image.png'}
                alt={product.tenSp}
                className={styles.cardImage}
              />
            </Box>
            <CardContent className={styles.cardContent}>
              <Typography gutterBottom variant="h6" component="div" className={styles.productName}>
                {product.tenSp}
              </Typography>
              <Typography variant="body2" color="text.secondary" className={styles.productDesc}>
                {product.moTa}
              </Typography>
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
              <Button
                variant="contained"
                size="small"
                className={styles.detailBtn}
                onClick={() => onViewDetail(product)}
              >
                Xem chi tiết
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductList; 