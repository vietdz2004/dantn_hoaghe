import axios from 'axios';

// Base URL configuration
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// ====== PRODUCTS API với Server-side Filtering ======
export const productsAPI = {
  // Lấy tất cả sản phẩm với filtering, search, pagination
  getAll: (params = {}) => api.get('/products', { params }),

  getById: (id) => api.get(`/products/${id}`),

  // Tìm kiếm sản phẩm nâng cao
  search: (params = {}) => api.get('/products/search', { params }),

  // Lấy sản phẩm liên quan
  getRelatedProducts: (id, limit = 8) => api.get(`/products/${id}/related`, { params: { limit } }),

  // Lấy sản phẩm giảm giá
  getDiscountProducts: (limit = 12) => api.get('/products/discount', { params: { limit } }),

  // Lấy sản phẩm popular/trending
  getPopularProducts: (limit = 12) => api.get('/products/popular', { params: { limit } }),

  // Lấy sản phẩm mới
  getNewProducts: (limit = 12) => api.get('/products/new', { params: { limit } }),

  // Lấy sản phẩm bestseller
  getBestsellerProducts: (limit = 12) => api.get('/products/bestseller', { params: { limit } }),

  // Lấy sản phẩm theo danh mục
  getProductsByCategory: (params = {}) => api.get('/products/by-category', { params }),

  getProductsByCategories: (limit = 8) => api.get('/products/by-categories', { params: { limit } }),

  create: (data) => api.post('/products', data),

  update: (id, data) => api.put(`/products/${id}`, data),

  delete: (id) => api.delete(`/products/${id}`),
  
  bulkCreate: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/products/bulk-create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  bulkDelete: (ids) => api.delete('/products/bulk-delete', { data: { ids } }),

  searchProducts: (keyword, params = {}) => api.get('/products/search', { params: { keyword, ...params } })
};

// ====== ORDERS API với Server-side Filtering ======
export const ordersAPI = {
  // Lấy tất cả đơn hàng với filtering, search, pagination
  getAll: (params = {}) => api.get('/orders', { params }),

  getById: (id) => api.get(`/orders/${id}`),

  getByUser: (userId) => api.get(`/orders/user/${userId}`),

  create: (data) => api.post('/orders', data),

  update: (id, data) => api.put(`/orders/${id}`, data),

  delete: (id) => api.delete(`/orders/${id}`)
};

// ====== QUICK ORDERS API với Enhanced Filtering ======
export const quickOrdersAPI = {
  // Lấy tất cả đơn đặt nhanh với filtering, search, pagination
  getAll: (params = {}) => api.get('/quick-orders', { params }),

  create: (data) => api.post('/quick-orders', data),

  updateStatus: (id, data) => api.patch(`/quick-orders/${id}`, data),

  getById: (id) => api.get(`/quick-orders/${id}`)
};

// ====== CUSTOMERS API với Server-side Filtering ======
export const customersAPI = {
  // Lấy tất cả khách hàng với filtering, search, pagination
  getAll: (params = {}) => api.get('/users', { params }),

  getById: (id) => api.get(`/users/${id}`),

  create: (data) => api.post('/users', data),

  update: (id, data) => api.put(`/users/${id}`, data),

  delete: (id) => api.delete(`/users/${id}`)
};

// ====== CATEGORIES API ======
export const categoriesAPI = {
  getAll: () => api.get('/categories'),

  // Lấy categories với subcategories có sản phẩm (cho navigation menu)
  getAllWithProducts: () => api.get('/categories/with-products'),

  getById: (id) => api.get(`/categories/${id}`),

  create: (data) => api.post('/categories', data),

  update: (id, data) => api.put(`/categories/${id}`, data),

  delete: (id) => api.delete(`/categories/${id}`),

  getSubCategories: (categoryId) => api.get(`/categories/${categoryId}/subcategories`)
};

// ====== DASHBOARD API ======
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),

  getRevenueChart: (period = '7d') => api.get(`/dashboard/revenue?period=${period}`),

  getRecentOrders: (limit = 5) => api.get(`/dashboard/recent-orders?limit=${limit}`),

  getTopProducts: (limit = 5) => api.get(`/dashboard/top-products?limit=${limit}`)
};

// ====== AUTH API ======
export const authAPI = {
  login: (credentials) => api.post('/users/auth/login', credentials),

  register: (userData) => api.post('/users/auth/register', userData),

  logout: () => api.post('/users/auth/logout'),

  verifyToken: () => api.get('/users/auth/verify'),

  updateProfile: (userData) => api.put('/users/auth/profile', userData),

  forgotPassword: (email) => api.post('/users/auth/forgot-password', { email }),

  resetPassword: (token, password) => api.post('/users/auth/reset-password', { token, password })
};

// ====== LEGACY SUPPORT - Giữ lại để tương thích ngược ======
// Các method cũ sẽ tự động chuyển sang dùng server-side filtering
export const legacyProductsAPI = {
  getAll: () => productsAPI.getAll(), // Sẽ lấy tất cả mà không filter

  getByCategory: (cat) => productsAPI.getAll({ category: cat }),

  getBySubCategory: (subcat) => productsAPI.getAll({ subcat: subcat })
};

// Legacy default export for backward compatibility
export default api; 