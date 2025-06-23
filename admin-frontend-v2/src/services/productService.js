import { productAPI } from './api';

// Product Service - Wrapper around productAPI with additional business logic
class ProductService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Cache management
  getCacheKey(method, params) {
    return `${method}_${JSON.stringify(params)}`;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  clearCache() {
    this.cache.clear();
  }

  // Products CRUD with caching
  async getAllProducts(params = {}) {
    try {
      const cacheKey = this.getCacheKey('getAllProducts', params);
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await productAPI.getAll(params);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      const cacheKey = this.getCacheKey('getProductById', { id });
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await productAPI.getById(id);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  }

  async createProduct(productData) {
    try {
      // Validate required fields
      if (!productData.tenSp || productData.tenSp.trim() === '') {
        throw new Error('Tên sản phẩm không được để trống');
      }
      
      if (!productData.id_DanhMucChiTiet) {
        throw new Error('Vui lòng chọn danh mục sản phẩm');
      }

      if (!productData.gia || productData.gia <= 0) {
        throw new Error('Giá sản phẩm phải lớn hơn 0');
      }

      const response = await productAPI.create(productData);
      this.clearCache(); // Clear cache after create
      return response;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id, productData) {
    try {
      const response = await productAPI.update(id, productData);
      this.clearCache(); // Clear cache after update
      return response;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      const response = await productAPI.delete(id);
      this.clearCache(); // Clear cache after delete
      return response;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Status management
  async toggleProductStatus(id) {
    try {
      const response = await productAPI.toggleStatus(id);
      this.clearCache();
      return response;
    } catch (error) {
      console.error('Error toggling product status:', error);
      throw error;
    }
  }

  async bulkUpdateStatus(productIds, status) {
    try {
      if (!productIds || productIds.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một sản phẩm');
      }

      const response = await productAPI.bulkUpdateStatus(productIds, status);
      this.clearCache();
      return response;
    } catch (error) {
      console.error('Error bulk updating status:', error);
      throw error;
    }
  }

  // Stock management
  async updateStock(id, stock, minStock) {
    try {
      if (stock < 0) {
        throw new Error('Số lượng tồn kho không được âm');
      }

      if (minStock < 0) {
        throw new Error('Số lượng tối thiểu không được âm');
      }

      const response = await productAPI.updateStock(id, stock, minStock);
      this.clearCache();
      return response;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }

  async bulkUpdateStock(updates) {
    try {
      if (!updates || updates.length === 0) {
        throw new Error('Không có dữ liệu để cập nhật');
      }

      // Validate stock updates
      for (const update of updates) {
        if (update.stock < 0) {
          throw new Error(`Số lượng tồn kho không được âm (ID: ${update.id})`);
        }
      }

      const response = await productAPI.bulkUpdateStock(updates);
      this.clearCache();
      return response;
    } catch (error) {
      console.error('Error bulk updating stock:', error);
      throw error;
    }
  }

  // Search and filtering
  async searchProducts(searchParams) {
    try {
      const cacheKey = this.getCacheKey('searchProducts', searchParams);
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await productAPI.search(searchParams);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  async getProductsByCategory(categoryId, params = {}) {
    try {
      const cacheKey = this.getCacheKey('getProductsByCategory', { categoryId, ...params });
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await productAPI.getByCategory(categoryId, params);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error getting products by category:', error);
      throw error;
    }
  }

  // Inventory management
  async getLowStockProducts(limit = 50) {
    try {
      const response = await productAPI.getLowStock(limit);
      return response;
    } catch (error) {
      console.error('Error getting low stock products:', error);
      throw error;
    }
  }

  async getOutOfStockProducts(limit = 50) {
    try {
      const response = await productAPI.getOutOfStock(limit);
      return response;
    } catch (error) {
      console.error('Error getting out of stock products:', error);
      throw error;
    }
  }

  async getDiscountedProducts(limit = 50) {
    try {
      const response = await productAPI.getDiscounted(limit);
      return response;
    } catch (error) {
      console.error('Error getting discounted products:', error);
      throw error;
    }
  }

  // Categories
  async getCategories() {
    try {
      const cacheKey = this.getCacheKey('getCategories', {});
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await productAPI.getCategories();
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  async getSubCategories(categoryId) {
    try {
      const cacheKey = this.getCacheKey('getSubCategories', { categoryId });
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await productAPI.getSubCategories(categoryId);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error getting subcategories:', error);
      throw error;
    }
  }

  // Analytics
  async getProductPerformance(period = '30d') {
    try {
      const response = await productAPI.getPerformance(period);
      return response;
    } catch (error) {
      console.error('Error getting product performance:', error);
      throw error;
    }
  }

  async getInventoryAnalytics() {
    try {
      const response = await productAPI.getInventoryAnalytics();
      return response;
    } catch (error) {
      console.error('Error getting inventory analytics:', error);
      throw error;
    }
  }

  // Bulk operations
  async bulkDeleteProducts(productIds) {
    try {
      if (!productIds || productIds.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một sản phẩm để xóa');
      }

      // Confirm deletion (should be handled by UI)
      const response = await productAPI.bulkDelete(productIds);
      this.clearCache();
      return response;
    } catch (error) {
      console.error('Error bulk deleting products:', error);
      throw error;
    }
  }

  // Import/Export
  async importProducts(file) {
    try {
      if (!file) {
        throw new Error('Vui lòng chọn file để import');
      }

      // Validate file type
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Chỉ chấp nhận file Excel (.xls, .xlsx)');
      }

      const response = await productAPI.import(file);
      this.clearCache();
      return response;
    } catch (error) {
      console.error('Error importing products:', error);
      throw error;
    }
  }

  async exportProducts(params = {}) {
    try {
      const response = await productAPI.export(params);
      return response;
    } catch (error) {
      console.error('Error exporting products:', error);
      throw error;
    }
  }

  async downloadTemplate() {
    try {
      const response = await productAPI.downloadTemplate();
      return response;
    } catch (error) {
      console.error('Error downloading template:', error);
      throw error;
    }
  }

  // Utility methods
  calculateDiscountPercent(originalPrice, salePrice) {
    if (!salePrice || salePrice >= originalPrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  }

  getStockStatus(currentStock, minStock) {
    if (currentStock === 0) return 'out_of_stock';
    if (currentStock <= minStock) return 'low_stock';
    return 'good_stock';
  }

  formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString('vi-VN');
  }

  generateSKU() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SKU${timestamp}${random}`;
  }

  // Validation helpers
  validateProductData(productData) {
    const errors = [];

    if (!productData.tenSp || productData.tenSp.trim() === '') {
      errors.push('Tên sản phẩm không được để trống');
    }

    if (!productData.id_DanhMucChiTiet) {
      errors.push('Vui lòng chọn danh mục sản phẩm');
    }

    if (!productData.gia || productData.gia <= 0) {
      errors.push('Giá sản phẩm phải lớn hơn 0');
    }

    if (productData.giaKhuyenMai && productData.giaKhuyenMai >= productData.gia) {
      errors.push('Giá khuyến mãi phải nhỏ hơn giá gốc');
    }

    if (productData.soLuongTon < 0) {
      errors.push('Số lượng tồn kho không được âm');
    }

    if (productData.soLuongToiThieu < 0) {
      errors.push('Số lượng tối thiểu không được âm');
    }

    return errors;
  }
}

// Export singleton instance
const productService = new ProductService();
export default productService;
