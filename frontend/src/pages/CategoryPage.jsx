import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProductList from '../components/ProductList';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

// CategoryPage: Trang danh mục sản phẩm
const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await api.get('/categories');
      setCategories(res.data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCat) {
      const cat = categories.find(c => c.id_DanhMuc === selectedCat);
      setSubCategories(cat?.SubCategories || []);
      setSelectedSub('');
    } else {
      setSubCategories([]);
      setSelectedSub('');
    }
  }, [selectedCat, categories]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = '/products';
        if (selectedSub) {
          url += `?subcat=${selectedSub}`;
        } else if (selectedCat) {
          // Lấy tất cả id_DanhMucChiTiet của danh mục cha
          const cat = categories.find(c => c.id_DanhMuc === selectedCat);
          const subIds = cat?.SubCategories?.map(sub => sub.id_DanhMucChiTiet) || [];
          if (subIds.length > 0) {
            url += `?subcat=${subIds.join(',')}`;
          } else {
            // Nếu danh mục cha không có subCategory, không lọc gì cả
            // Hoặc có thể truyền cat để backend xử lý
            url += `?cat=${selectedCat}`;
          }
        }
        
        const res = await api.get(url);
        setProducts(res.data);
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCat, selectedSub, categories]);

  return (
    <Box mt={4} sx={{ width: '100vw' }}>
      <Typography variant="h4" color="secondary" fontWeight={700} mb={3}>Danh mục sản phẩm</Typography>
      <Box display="flex" gap={3} mb={4} flexWrap="wrap">
        <FormControl sx={{ minWidth: 220 }} size="small">
          <InputLabel>Danh mục cha</InputLabel>
          <Select
            value={selectedCat}
            label="Danh mục cha"
            onChange={e => setSelectedCat(e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {categories.map(cat => (
              <MenuItem value={cat.id_DanhMuc} key={cat.id_DanhMuc}>{cat.tenDanhMuc}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 220 }} size="small" disabled={!selectedCat}>
          <InputLabel>Danh mục con</InputLabel>
          <Select
            value={selectedSub}
            label="Danh mục con"
            onChange={e => setSelectedSub(e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {subCategories.map(sub => (
              <MenuItem value={sub.id_DanhMucChiTiet} key={sub.id_DanhMucChiTiet}>{sub.tenDanhMucChiTiet}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {loading ? (
        <Typography align="center" color="secondary">Đang tải sản phẩm...</Typography>
      ) : (
        <ProductList products={products} onViewDetail={p => window.location.href = `/products/${p.id_SanPham}`} />
      )}
    </Box>
  );
};

export default CategoryPage; 