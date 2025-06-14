import React from 'react';
import { Typography, Box } from '@mui/material';
import ProductList from './ProductList';

// HomeSection: Hiển thị 1 block sản phẩm với tiêu đề và danh sách sản phẩm
const HomeSection = ({ title, products, onViewDetail }) => {
  if (!products || products.length === 0) return null;
  return (
    <Box mb={5}>
      <Typography variant="h5" mb={2} fontWeight={600} color="primary.main">
        {title}
      </Typography>
      <ProductList products={products} onViewDetail={onViewDetail} />
    </Box>
  );
};

export default HomeSection; 