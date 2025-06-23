// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios-like fetch wrapper for consistency
const api = {
  async get(url, config = {}) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    });
    return this.handleResponse(response);
  },

  async post(url, data, config = {}) {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...config.headers
      },
      body: isFormData ? data : JSON.stringify(data)
    });
    return this.handleResponse(response);
  },

  async put(url, data, config = {}) {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...config.headers
      },
      body: isFormData ? data : JSON.stringify(data)
    });
    return this.handleResponse(response);
  },

  async delete(url, config = {}) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    });
    return this.handleResponse(response);
  },

  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
};

// Dashboard APIs
export const dashboardAPI = {
  getOverview: () => api.get('/admin/dashboard/overview'),
  getRecentActivities: () => api.get('/admin/dashboard/recent-activities'),
  getSalesStats: (period = '30d') => api.get(`/admin/dashboard/sales-stats?period=${period}`),
  getProductStats: () => api.get('/admin/dashboard/product-stats'),
  getOrderStats: (period = '30d') => api.get(`/admin/dashboard/order-stats?period=${period}`),
  getUserStats: () => api.get('/admin/dashboard/user-stats'),
  getTopProducts: (limit = 10) => api.get(`/admin/dashboard/top-products?limit=${limit}`),
  getRevenueAnalytics: (period = '30d') => api.get(`/admin/dashboard/revenue-analytics?period=${period}`)
};

// Product APIs
export const productAPI = {
  // Basic CRUD
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/products${queryString ? '?' + queryString : ''}`);
  },
  getById: (id) => api.get(`/admin/products/${id}`),
  create: (data) => api.post('/admin/products', data),
  update: (id, data) => api.put(`/admin/products/${id}`, data),
  delete: (id) => api.delete(`/admin/products/${id}`),
  
  // Status management
  toggleStatus: (id) => api.put(`/admin/products/${id}/status`),
  bulkUpdateStatus: (productIds, status) => 
    api.post('/admin/products/bulk/update-status', { productIds, status }),
  
  // Stock management
  updateStock: (id, stock, minStock) => 
    api.put(`/admin/products/${id}/stock`, { stock, minStock }),
  bulkUpdateStock: (updates) => 
    api.post('/admin/products/bulk/update-stock', { updates }),
  
  // Categories
  getCategories: () => api.get('/admin/products/categories'),
  getSubCategories: (categoryId) => api.get(`/admin/products/categories/${categoryId}/subcategories`),
  
  // Advanced features
  search: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/products/search?${queryString}`);
  },
  getByCategory: (categoryId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/products/category/${categoryId}${queryString ? '?' + queryString : ''}`);
  },
  getLowStock: (limit = 50) => api.get(`/admin/products/low-stock?limit=${limit}`),
  getOutOfStock: (limit = 50) => api.get(`/admin/products/out-of-stock?limit=${limit}`),
  getDiscounted: (limit = 50) => api.get(`/admin/products/discounted?limit=${limit}`),
  
  // Analytics
  getPerformance: (period = '30d') => api.get(`/admin/products/performance?period=${period}`),
  getInventoryAnalytics: () => api.get('/admin/products/inventory-analytics'),
  
  // Bulk operations
  bulkDelete: (productIds) => api.post('/admin/products/bulk/delete', { productIds }),
  
  // Import/Export
  import: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/products/import', formData);
  },
  export: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/products/export?${queryString}`);
  },
  downloadTemplate: () => api.get('/admin/products/template')
};

// Order APIs
export const orderAPI = {
  // Basic CRUD
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/orders${queryString ? '?' + queryString : ''}`);
  },
  getById: (id) => api.get(`/admin/orders/${id}`),
  update: (id, data) => api.put(`/admin/orders/${id}`, data),
  delete: (id) => api.delete(`/admin/orders/${id}`),
  
  // Status management
  updateStatus: (id, status, note) => 
    api.put(`/admin/orders/${id}/status`, { status, note }),
  bulkUpdateStatus: (orderIds, status) => 
    api.post('/admin/orders/bulk/update-status', { orderIds, status }),
  
  // Analytics
  getSummary: (period = '30d') => api.get(`/admin/orders/analytics/summary?period=${period}`),
  getTrends: (period = '30d') => api.get(`/admin/orders/analytics/trends?period=${period}`),
  getRevenueAnalytics: (period = '30d') => api.get(`/admin/orders/analytics/revenue?period=${period}`),
  
  // Bulk operations
  bulkDelete: (orderIds) => api.post('/admin/orders/bulk/delete', { orderIds }),
  
  // Export
  export: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/orders/export/excel?${queryString}`);
  }
};

// User APIs
export const userAPI = {
  // Basic CRUD
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/users${queryString ? '?' + queryString : ''}`);
  },
  getById: (id) => api.get(`/admin/users/${id}`),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  delete: (id) => api.delete(`/admin/users/${id}`),
  
  // Status management
  updateStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  bulkUpdateStatus: (userIds, status) => 
    api.post('/admin/users/bulk/update-status', { userIds, status }),
  
  // User details
  getOrders: (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/users/${id}/orders${queryString ? '?' + queryString : ''}`);
  },
  
  // Analytics
  getSummary: (period = '30d') => api.get(`/admin/users/analytics/summary?period=${period}`),
  getActivity: (period = '30d') => api.get(`/admin/users/analytics/activity?period=${period}`),
  
  // Bulk operations
  bulkDelete: (userIds) => api.post('/admin/users/bulk/delete', { userIds }),
  
  // Export
  export: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/users/export/excel?${queryString}`);
  }
};

// Category APIs
export const categoryAPI = {
  // Categories
  getAll: () => api.get('/admin/categories'),
  getById: (id) => api.get(`/admin/categories/${id}`),
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/admin/categories/${id}`),
  
  // SubCategories
  getSubCategories: (categoryId) => api.get(`/admin/categories/${categoryId}/subcategories`),
  createSubCategory: (categoryId, data) => api.post(`/admin/categories/${categoryId}/subcategories`, data),
  updateSubCategory: (id, data) => api.put(`/admin/categories/subcategories/${id}`, data),
  deleteSubCategory: (id) => api.delete(`/admin/categories/subcategories/${id}`),
  
  // Analytics
  getSummary: () => api.get('/admin/categories/analytics/summary'),
  getProducts: (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/categories/${id}/products${queryString ? '?' + queryString : ''}`);
  },
  
  // Bulk operations
  bulkDelete: (categoryIds) => api.post('/admin/categories/bulk/delete', { categoryIds }),
  bulkDeleteSubCategories: (subCategoryIds) => 
    api.post('/admin/categories/subcategories/bulk/delete', { subCategoryIds })
};

// Quick Order APIs
export const quickOrderAPI = {
  // Basic CRUD
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/quick-orders${queryString ? '?' + queryString : ''}`);
  },
  getById: (id) => api.get(`/admin/quick-orders/${id}`),
  update: (id, data) => api.put(`/admin/quick-orders/${id}`, data),
  delete: (id) => api.delete(`/admin/quick-orders/${id}`),
  
  // Status management
  updateStatus: (id, status, note) => 
    api.put(`/admin/quick-orders/${id}/status`, { status, note }),
  bulkUpdateStatus: (orderIds, status) => 
    api.post('/admin/quick-orders/bulk/update-status', { orderIds, status }),
  
  // Convert to regular order
  convertToRegular: (id) => api.post(`/admin/quick-orders/${id}/convert`),
  bulkConvertToRegular: (orderIds) => 
    api.post('/admin/quick-orders/bulk/convert', { orderIds }),
  
  // Analytics
  getSummary: (period = '30d') => api.get(`/admin/quick-orders/analytics/summary?period=${period}`),
  
  // Bulk operations
  bulkDelete: (orderIds) => api.post('/admin/quick-orders/bulk/delete', { orderIds }),
  
  // Export
  export: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/quick-orders/export/excel?${queryString}`);
  }
};

// Common utility functions
export const utils = {
  formatPrice: (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  },
  
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  },
  
  formatDateTime: (date) => {
    return new Date(date).toLocaleString('vi-VN');
  },
  
  getStatusColor: (status) => {
    const statusColors = {
      'CHO_XAC_NHAN': 'warning',
      'DA_XAC_NHAN': 'info',
      'DANG_GIAO': 'primary',
      'DA_GIAO': 'success',
      'DA_HUY': 'error',
      'active': 'success',
      'hidden': 'error',
      'out_of_stock': 'error',
      'low_stock': 'warning',
      'good_stock': 'success'
    };
    return statusColors[status] || 'default';
  },
  
  getStatusText: (status) => {
    const statusTexts = {
      'CHO_XAC_NHAN': 'Chờ xác nhận',
      'DA_XAC_NHAN': 'Đã xác nhận',
      'DANG_GIAO': 'Đang giao',
      'DA_GIAO': 'Đã giao',
      'DA_HUY': 'Đã hủy',
      'active': 'Hoạt động',
      'hidden': 'Ẩn',
      'out_of_stock': 'Hết hàng',
      'low_stock': 'Sắp hết',
      'good_stock': 'Đủ hàng'
    };
    return statusTexts[status] || status;
  }
};

export default api; 