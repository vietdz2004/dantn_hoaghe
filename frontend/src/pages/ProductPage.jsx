import React, { useEffect, useState, useCallback } from 'react';
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
import { productsAPI, categoriesAPI, subCategoryAPI } from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './ProductPage.module.scss';

// ============================================
// PRODUCT PAGE - Trang danh sách sản phẩm
// ============================================
const ProductPage = () => {
  // ============================================
  // STATE MANAGEMENT - Quản lý state
  // ============================================
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageTitle, setPageTitle] = useState('Danh Sách Sản Phẩm');
  
  // Thông tin phân trang từ server
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  });
  
  // Bộ lọc sẽ gửi lên server - BỎ CATEGORY/SUBCATEGORY DROPDOWN
  const [filters, setFilters] = useState({
    sortBy: 'default',
    itemsPerPage: 12,
    currentPage: 1,
    priceRange: 'all'
  });
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ============================================
  // HELPER FUNCTIONS - Hàm tiện ích
  // ============================================

  // Xây dựng params API dựa trên filters và URL params
  const buildAPIParams = useCallback(() => {
    const apiParams = {
      page: filters.currentPage,
      limit: filters.itemsPerPage
    };

    // Xử lý SEARCH QUERY từ URL - QUAN TRỌNG!
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      apiParams.q = searchQuery; // API search yêu cầu param 'q'
      setPageTitle(`🔍 Kết quả tìm kiếm: "${searchQuery}"`);
      return { apiParams, urlFilters: { search: searchQuery }, searchQuery };
    }

    // Xử lý các filter đặc biệt từ URL (từ nút "Xem thêm")
    const urlFilters = {
      category: searchParams.get('category'),
      subcategory: searchParams.get('subcategory'), // THÊM MỚI
      discount: searchParams.get('discount'),
      popular: searchParams.get('popular'),
      new: searchParams.get('new'),
      bestseller: searchParams.get('bestseller')
    };

    // Cập nhật tiêu đề trang dựa trên URL params
    if (urlFilters.discount === 'true') {
      setPageTitle('🔥 Sản phẩm giảm giá');
      apiParams.discount = true;
    } else if (urlFilters.popular === 'true') {
      setPageTitle('⭐ Sản phẩm phổ biến');
      apiParams.popular = true;
    } else if (urlFilters.new === 'true') {
      setPageTitle('🆕 Sản phẩm mới');
      apiParams.new = true;
    } else if (urlFilters.bestseller === 'true') {
      setPageTitle('🏆 Sản phẩm bán chạy');
      apiParams.bestseller = true;
    } else if (urlFilters.subcategory) {
      // Hiển thị tên subcategory cụ thể
      const subCat = categories.flatMap(cat => cat.SubCategories || [])
        .find(sub => sub.id_DanhMucChiTiet.toString() === urlFilters.subcategory);
      setPageTitle(subCat ? `${subCat.tenDanhMucChiTiet}` : 'Sản phẩm theo danh mục con');
      apiParams.subcat = urlFilters.subcategory;
    } else if (urlFilters.category) {
      // Hiển thị tên category cụ thể
      const cat = categories.find(c => c.id_DanhMuc.toString() === urlFilters.category);
      setPageTitle(cat ? `${cat.tenDanhMuc}` : 'Sản phẩm theo danh mục');
      apiParams.category = urlFilters.category;
    } else {
      setPageTitle('Danh Sách Sản Phẩm');
    }

    // Áp dụng filters từ form - CHỈ CÒN PRICE RANGE
    if (filters.priceRange !== 'all') {
      apiParams.priceRange = filters.priceRange;
    }

    // Áp dụng URL params CÓ PRIORITY CAO NHẤT (sau dropdown filters)
    if (urlFilters.category) {
      apiParams.category = urlFilters.category;
    }
    if (urlFilters.subcategory) {
      apiParams.subcat = urlFilters.subcategory;
    }

    // Áp dụng sắp xếp
    if (filters.sortBy !== 'default') {
      const sortMap = {
        'name-asc': { sortBy: 'name', sortOrder: 'ASC' },
        'name-desc': { sortBy: 'name', sortOrder: 'DESC' },
        'price-asc': { sortBy: 'price', sortOrder: 'ASC' },
        'price-desc': { sortBy: 'price', sortOrder: 'DESC' }
      };
      
      const sortConfig = sortMap[filters.sortBy];
      if (sortConfig) {
        Object.assign(apiParams, sortConfig);
      }
    }

    return { apiParams, urlFilters, searchQuery: null };
  }, [filters, searchParams, categories]);

  // Chọn API endpoint phù hợp dựa trên loại filter
  const callAppropriateAPI = useCallback(async (apiParams, urlFilters, searchQuery) => {
    // QUAN TRỌNG: Nếu có search query, gọi API search
    if (searchQuery) {
      console.log('🔍 Calling SEARCH API with query:', searchQuery);
      return await productsAPI.search(searchQuery, apiParams);
    }
    
    // Ngược lại, gọi các API khác như trước
    if (urlFilters.discount === 'true') {
      return await productsAPI.getDiscountProducts(apiParams);
    } else if (urlFilters.popular === 'true') {
      return await productsAPI.getPopularProducts(apiParams);
    } else if (urlFilters.new === 'true') {
      return await productsAPI.getNewProducts(apiParams);
    } else if (urlFilters.bestseller === 'true') {
      return await productsAPI.getBestsellerProducts(apiParams);
    } else {
      return await productsAPI.getAll(apiParams);
    }
  }, []);

  // ============================================
  // DATA FETCHING - Tải dữ liệu
  // ============================================

  // Tải danh sách sản phẩm với server-side filtering
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      const { apiParams, urlFilters, searchQuery } = buildAPIParams();
      console.log('📡 Calling API with params:', apiParams, 'searchQuery:', searchQuery);
      
      const response = await callAppropriateAPI(apiParams, urlFilters, searchQuery);
      console.log('📊 API Response:', response);
      
      if (response.data.success || response.data.data) {
        const productsData = response.data.data || response.data || [];
        setProducts(productsData);
        
        // Xử lý pagination cho search results
        if (searchQuery) {
          // Search API không trả pagination, tự tạo
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalItems: productsData.length,
            itemsPerPage: filters.itemsPerPage
          });
        } else {
          setPagination(response.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: productsData.length,
            itemsPerPage: filters.itemsPerPage
          });
        }
      } else {
        throw new Error('API response không thành công');
      }
      
      setError(null);
    } catch (err) {
      console.error('❌ Lỗi tải sản phẩm:', err);
      setError(searchQuery ? `Không tìm thấy sản phẩm cho "${searchQuery}"` : 'Không thể tải dữ liệu sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [buildAPIParams, callAppropriateAPI, filters.itemsPerPage]);

  // Tải danh sách danh mục CÓ SUBCATEGORIES
  const fetchCategories = useCallback(async () => {
    try {
      console.log('📂 Đang tải danh mục và danh mục con...');
      const response = await categoriesAPI.getWithSubcategories(); // SỬA ĐỔI
      console.log('📂 Categories API response:', response.data);
      
      const categoriesData = response.data?.data || [];
      setCategories(categoriesData);
      console.log('✅ Đã tải', categoriesData.length, 'danh mục');
    } catch (err) {
      console.error('❌ Lỗi tải danh mục:', err);
      setCategories([]);
    }
  }, []);



  // ============================================
  // EFFECTS - Xử lý side effects
  // ============================================
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);



  // ============================================
  // EVENT HANDLERS - Xử lý sự kiện
  // ============================================

  const handleViewDetail = (product) => {
    navigate(`/products/${product.id_SanPham}`);
  };

  const handlePageChange = (event, page) => {
    setFilters(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Các handler cập nhật filter và reset về trang đầu
  const handleSortChange = (newSort) => {
    setFilters(prev => ({ ...prev, sortBy: newSort, currentPage: 1 }));
  };

  const handlePriceRangeChange = (newPriceRange) => {
    setFilters(prev => ({ ...prev, priceRange: newPriceRange, currentPage: 1 }));
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setFilters(prev => ({ ...prev, itemsPerPage: newItemsPerPage, currentPage: 1 }));
  };

  // ============================================
  // RENDER - Hiển thị giao diện
  // ============================================

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Đang tải sản phẩm...</Typography>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className={styles.container}>
      {/* Header - Tiêu đề trang */}
      <Box className={styles.header}>
        <Typography variant="h4" className={styles.title}>
          {pageTitle}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tìm thấy {pagination.totalItems} sản phẩm
        </Typography>
      </Box>

      {/* Filters - Bộ lọc */}
      <Card className={styles.filterCard}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Sắp xếp */}
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

            {/* Khoảng giá */}
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

            {/* Số sản phẩm mỗi trang */}
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

      {/* Results Info - Thông tin kết quả và filter đang áp dụng */}
      <Box className={styles.resultsInfo}>
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterIcon color="action" />
          <Typography variant="body2">
            Hiển thị {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} 
            của {pagination.totalItems} sản phẩm
          </Typography>
        </Stack>
        
        {/* Active Filters - CHỈ HIỂN THỊ PRICE RANGE */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
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

      {/* Products List - Danh sách sản phẩm */}
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

      {/* Pagination - Phân trang */}
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