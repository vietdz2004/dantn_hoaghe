import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, CircularProgress } from '@mui/material';
import api from '../services/api';
import HomeSection from '../components/HomeSection';
import styles from './HomePage.module.css';
import { useNavigate } from 'react-router-dom';
import BannerSlider from '../components/BannerSlider';

// HomePage: Trang chủ tổng quan của Hoashop
const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [productsNew, setProductsNew] = useState([]);
  const [productsDiscount, setProductsDiscount] = useState([]);
  const [productsBySubCategory, setProductsBySubCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh mục cha và con
        const catRes = await api.get('/categories');
        setCategories(catRes.data);
        // Lấy tất cả sản phẩm
        const prodRes = await api.get('/products');
        const allProducts = prodRes.data;
        // Sản phẩm mới nhất
        setProductsNew([...allProducts].slice(-6).reverse());
        // Sản phẩm khuyến mãi
        setProductsDiscount(allProducts.filter(p => p.giaKhuyenMai && p.giaKhuyenMai < p.gia).slice(0, 6));
        // Sản phẩm theo từng danh mục chi tiết (subCategory)
        const bySubCat = {};
        catRes.data.forEach(cat => {
          if (cat.SubCategories && cat.SubCategories.length > 0) {
            cat.SubCategories.forEach(sub => {
              bySubCat[sub.tenDanhMucChiTiet] = allProducts.filter(p => p.id_DanhMucChiTiet === sub.id_DanhMucChiTiet).slice(0, 6);
            });
          }
        });
        setProductsBySubCategory(bySubCat);
      } catch (err) {
        setError('Không thể tải dữ liệu trang chủ');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleViewDetail = (product) => {
    navigate(`/products/${product.id_SanPham}`);
  };

  if (loading) return <Box textAlign="center" mt={8}><CircularProgress /></Box>;
  if (error) return <Typography color="error" align="center">{error}</Typography>;

  return (
    <div className={styles.homeWrap}>
      {/* Banner động */}
      <BannerSlider />
      {/* Sản phẩm khuyến mãi */}
      <HomeSection title="Hoa tươi giảm giá" products={productsDiscount} onViewDetail={handleViewDetail} />
      {/* Sản phẩm mới nhất */}
      <HomeSection title="Sản phẩm mới nhất" products={productsNew} onViewDetail={handleViewDetail} />
      {/* Hiển thị danh mục cha và các block danh mục con */}
      {categories.map(cat => (
        <Box key={cat.id_DanhMuc} mb={4}>
          <Typography variant="h5" color="secondary" fontWeight={700} mb={2}>{cat.tenDanhMuc}</Typography>
          {cat.SubCategories && cat.SubCategories.map(sub => (
            <HomeSection
              key={sub.id_DanhMucChiTiet}
              title={sub.tenDanhMucChiTiet}
              products={productsBySubCategory[sub.tenDanhMucChiTiet]}
              onViewDetail={handleViewDetail}
            />
          ))}
        </Box>
      ))}
      {/* Giới thiệu shop */}
      <Box mt={8} mb={4} className={styles.introBlock}>
        <Card className={styles.introCard}>
          <CardContent>
            <Typography variant="h5" gutterBottom color="secondary" fontWeight={700}>Shop Hoa Tươi Hoashop</Typography>
            <Typography variant="body1" color="text.secondary" mb={2}>
              Hoashop chuyên cung cấp các loại hoa tươi, hoa bó, hoa sự kiện, hoa khai trương, hoa sinh nhật... Giao hàng nhanh, chất lượng đảm bảo, giá tốt nhất.
            </Typography>
            <Button variant="contained" color="secondary" sx={{ mt: 2 }} onClick={() => window.open('https://zalo.me', '_blank')}>Liên hệ Zalo</Button>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

export default HomePage; 