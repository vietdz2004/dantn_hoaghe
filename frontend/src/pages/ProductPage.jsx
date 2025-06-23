import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Pagination, 
  Card, 
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  GridView as GridIcon,
  ViewList as ListIcon,
  TuneOutlined as FilterIcon
} from '@mui/icons-material';
import ProductList from '../components/ProductList';
import { productsAPI, categoriesAPI } from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './ProductPage.module.scss';

// ProductPage: Trang danh sách sản phẩm với server-side filtering và pagination
const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Server-side data
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  });
  const [stats, setStats] = useState({});
  
  // Filter states - sẽ gửi thẳng lên server
  const [filters, setFilters] = useState({
    sortBy: 'default',
    itemsPerPage: 12,
    currentPage: 1,
    priceRange: 'all',
    selectedCategory: 'all'
  });
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Fetch data với server-side filtering
  useEffect(() => {
    fetchProducts();
  }, [filters, searchParams]);

  // Fetch categories một lần
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Xây dựng params cho API
      const apiParams = {
        page: filters.currentPage,
        limit: filters.itemsPerPage
      };

      // URL params từ routing
      const cat = searchParams.get('cat');
      const subcat = searchParams.get('subcat');
      
      if (subcat) {
        apiParams.subcat = subcat;
      } else if (cat) {
        apiParams.category = cat;
      }

      // Apply filters
      if (filters.selectedCategory !== 'all') {
        apiParams.category = filters.selectedCategory;
      }

      if (filters.priceRange !== 'all') {
        apiParams.priceRange = filters.priceRange;
      }

      // Apply sorting
      if (filters.sortBy !== 'default') {
        switch (filters.sortBy) {
          case 'name-asc':
            apiParams.sortBy = 'name';
            apiParams.sortOrder = 'ASC';
            break;
          case 'name-desc':
            apiParams.sortBy = 'name';
            apiParams.sortOrder = 'DESC';
            break;
          case 'price-asc':
            apiParams.sortBy = 'price';
            apiParams.sortOrder = 'ASC';
            break;
          case 'price-desc':
            apiParams.sortBy = 'price';
            apiParams.sortOrder = 'DESC';
            break;
        }
      }

      const response = await productsAPI.getAll(apiParams);
      
      if (response.data.success) {
        setProducts(response.data.data);
        setPagination(response.data.pagination);
        setStats(response.data.stats || {});
      } else {
        throw new Error('API response không thành công');
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Không thể tải dữ liệu sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleViewDetail = (product) => {
    navigate(`/products/${product.id_SanPham}`);
  };

  const handlePageChange = (event, page) => {
    setFilters(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSort) => {
    setFilters(prev => ({ 
      ...prev, 
      sortBy: newSort,
      currentPage: 1 // Reset to first page
    }));
  };

  const handleCategoryChange = (newCategory) => {
    setFilters(prev => ({ 
      ...prev, 
      selectedCategory: newCategory,
      currentPage: 1 // Reset to first page
    }));
  };

  const handlePriceRangeChange = (newPriceRange) => {
    setFilters(prev => ({ 
      ...prev, 
      priceRange: newPriceRange,
      currentPage: 1 // Reset to first page
    }));
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setFilters(prev => ({ 
      ...prev, 
      itemsPerPage: newItemsPerPage,
      currentPage: 1 // Reset to first page
    }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Đang tải sản phẩm...</Typography>
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
    <Container maxWidth="lg" className={styles.container}>
      {/* Header */}
      <Box className={styles.header}>
        <Typography variant="h4" className={styles.title}>
          Danh Sách Sản Phẩm
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tìm thấy {pagination.totalItems} sản phẩm
        </Typography>
      </Box>

      {/* Filters */}
      <Card className={styles.filterCard}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sắp xếp theo</InputLabel>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  label="Sắp xếp theo"
                >
                  <MenuItem value="default">Mặc định</MenuItem>
                  <MenuItem value="name-asc">Tên (A - Z)</MenuItem>
                  <MenuItem value="name-desc">Tên (Z - A)</MenuItem>
                  <MenuItem value="price-asc">Giá (Thấp &gt; Cao)</MenuItem>
                  <MenuItem value="price-desc">Giá (Cao &gt; Thấp)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={filters.selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  label="Danh mục"
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category.id_DanhMuc} value={category.id_DanhMuc.toString()}>
                      {category.tenDanhMuc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Khoảng giá</InputLabel>
                <Select
                  value={filters.priceRange}
                  onChange={(e) => handlePriceRangeChange(e.target.value)}
                  label="Khoảng giá"
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="under-200k">Dưới 200k</MenuItem>
                  <MenuItem value="200k-500k">200k - 500k</MenuItem>
                  <MenuItem value="500k-1m">500k - 1M</MenuItem>
                  <MenuItem value="over-1m">Trên 1M</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Hiển thị</InputLabel>
                <Select
                  value={filters.itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(e.target.value)}
                  label="Hiển thị"
                >
                  <MenuItem value={8}>8 sản phẩm</MenuItem>
                  <MenuItem value={12}>12 sản phẩm</MenuItem>
                  <MenuItem value={20}>20 sản phẩm</MenuItem>
                  <MenuItem value={40}>40 sản phẩm</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Info */}
      <Box className={styles.resultsInfo}>
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterIcon color="action" />
          <Typography variant="body2">
            Hiển thị {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} 
            của {pagination.totalItems} sản phẩm
          </Typography>
        </Stack>
        
        {/* Active Filters */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {filters.selectedCategory !== 'all' && (
            <Chip 
              label={`Danh mục: ${categories.find(c => c.id_DanhMuc.toString() === filters.selectedCategory)?.tenDanhMuc}`}
              onDelete={() => handleCategoryChange('all')}
              size="small"
              color="primary"
            />
          )}
          {filters.priceRange !== 'all' && (
            <Chip 
              label={`Giá: ${filters.priceRange}`}
              onDelete={() => handlePriceRangeChange('all')}
              size="small"
              color="primary"
            />
          )}
        </Stack>
      </Box>

      {/* Products List */}
      {products.length > 0 ? (
        <ProductList products={products} onProductClick={handleViewDetail} />
      ) : (
        <Box className={styles.noResults}>
          <Typography variant="h6" color="text.secondary">
            Không tìm thấy sản phẩm nào
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thử thay đổi bộ lọc để xem thêm sản phẩm
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box className={styles.pagination}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
          />
        </Box>
      )}
    </Container>
  );
};

export default ProductPage; 