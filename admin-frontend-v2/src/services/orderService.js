import { orderAPI } from './api';

// Order Service - Wrapper around orderAPI with additional business logic
class OrderService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 3 * 60 * 1000; // 3 minutes (shorter for orders)
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

  // Orders CRUD
  async getAllOrders(params = {}) {
    try {
      const cacheKey = this.getCacheKey('getAllOrders', params);
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await orderAPI.getAll(params);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  }

  async getOrderById(id) {
    try {
      const cacheKey = this.getCacheKey('getOrderById', { id });
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await orderAPI.getById(id);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  }

  async updateOrder(id, orderData) {
    try {
      const response = await orderAPI.update(id, orderData);
      this.clearCache();
      return response;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  async deleteOrder(id) {
    try {
      const response = await orderAPI.delete(id);
      this.clearCache();
      return response;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  // Status management
  async updateOrderStatus(id, status, note = '') {
    try {
      if (!this.isValidStatus(status)) {
        throw new Error('Trạng thái đơn hàng không hợp lệ');
      }

      const response = await orderAPI.updateStatus(id, status, note);
      this.clearCache();
      return response;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async bulkUpdateOrderStatus(orderIds, status) {
    try {
      if (!orderIds || orderIds.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một đơn hàng');
      }

      if (!this.isValidStatus(status)) {
        throw new Error('Trạng thái đơn hàng không hợp lệ');
      }

      const response = await orderAPI.bulkUpdateStatus(orderIds, status);
      this.clearCache();
      return response;
    } catch (error) {
      console.error('Error bulk updating order status:', error);
      throw error;
    }
  }

  // Analytics
  async getOrdersSummary(period = '30d') {
    try {
      const response = await orderAPI.getSummary(period);
      return response;
    } catch (error) {
      console.error('Error getting orders summary:', error);
      throw error;
    }
  }

  async getOrderTrends(period = '30d') {
    try {
      const response = await orderAPI.getTrends(period);
      return response;
    } catch (error) {
      console.error('Error getting order trends:', error);
      throw error;
    }
  }

  async getRevenueAnalytics(period = '30d') {
    try {
      const response = await orderAPI.getRevenueAnalytics(period);
      return response;
    } catch (error) {
      console.error('Error getting revenue analytics:', error);
      throw error;
    }
  }

  // Bulk operations
  async bulkDeleteOrders(orderIds) {
    try {
      if (!orderIds || orderIds.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một đơn hàng để xóa');
      }

      const response = await orderAPI.bulkDelete(orderIds);
      this.clearCache();
      return response;
    } catch (error) {
      console.error('Error bulk deleting orders:', error);
      throw error;
    }
  }

  // Export
  async exportOrders(params = {}) {
    try {
      const response = await orderAPI.export(params);
      return response;
    } catch (error) {
      console.error('Error exporting orders:', error);
      throw error;
    }
  }

  // Utility methods
  isValidStatus(status) {
    const validStatuses = ['CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_GIAO', 'DA_GIAO', 'DA_HUY'];
    return validStatuses.includes(status);
  }

  getStatusText(status) {
    const statusTexts = {
      'CHO_XAC_NHAN': 'Chờ xác nhận',
      'DA_XAC_NHAN': 'Đã xác nhận',
      'DANG_GIAO': 'Đang giao',
      'DA_GIAO': 'Đã giao',
      'DA_HUY': 'Đã hủy'
    };
    return statusTexts[status] || status;
  }

  getStatusColor(status) {
    const statusColors = {
      'CHO_XAC_NHAN': 'warning',
      'DA_XAC_NHAN': 'info',
      'DANG_GIAO': 'primary',
      'DA_GIAO': 'success',
      'DA_HUY': 'error'
    };
    return statusColors[status] || 'default';
  }

  getPaymentMethodText(method) {
    const methodTexts = {
      'TIEN_MAT': 'Tiền mặt',
      'CHUYEN_KHOAN': 'Chuyển khoản',
      'THE': 'Thẻ'
    };
    return methodTexts[method] || method;
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

  formatDateTime(date) {
    return new Date(date).toLocaleString('vi-VN');
  }

  calculateOrderTotal(orderDetails) {
    if (!orderDetails || !Array.isArray(orderDetails)) return 0;
    return orderDetails.reduce((total, item) => total + item.thanhTien, 0);
  }

  getNextValidStatus(currentStatus) {
    const statusFlow = {
      'CHO_XAC_NHAN': ['DA_XAC_NHAN', 'DA_HUY'],
      'DA_XAC_NHAN': ['DANG_GIAO', 'DA_HUY'],
      'DANG_GIAO': ['DA_GIAO', 'DA_HUY'],
      'DA_GIAO': [],
      'DA_HUY': []
    };
    return statusFlow[currentStatus] || [];
  }

  canUpdateStatus(currentStatus, newStatus) {
    const allowedStatuses = this.getNextValidStatus(currentStatus);
    return allowedStatuses.includes(newStatus);
  }

  // Search and filter helpers
  buildSearchParams(filters) {
    const params = {};
    
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.minTotal) params.minTotal = filters.minTotal;
    if (filters.maxTotal) params.maxTotal = filters.maxTotal;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;

    return params;
  }

  // Validation helpers
  validateOrderUpdate(orderData) {
    const errors = [];

    if (orderData.tongThanhToan && orderData.tongThanhToan <= 0) {
      errors.push('Tổng thanh toán phải lớn hơn 0');
    }

    if (orderData.phuongThucThanhToan) {
      const validMethods = ['TIEN_MAT', 'CHUYEN_KHOAN', 'THE'];
      if (!validMethods.includes(orderData.phuongThucThanhToan)) {
        errors.push('Phương thức thanh toán không hợp lệ');
      }
    }

    return errors;
  }

  // Statistics helpers
  calculateStatusDistribution(orders) {
    if (!orders || orders.length === 0) return {};

    const distribution = {};
    orders.forEach(order => {
      const status = order.trangThaiDonHang;
      distribution[status] = (distribution[status] || 0) + 1;
    });

    return distribution;
  }

  calculateRevenueByPeriod(orders, period = 'day') {
    if (!orders || orders.length === 0) return [];

    const revenue = {};
    
    orders.forEach(order => {
      if (order.trangThaiDonHang === 'DA_GIAO') {
        const date = new Date(order.ngayDatHang);
        let key;
        
        switch (period) {
          case 'day':
            key = date.toISOString().split('T')[0];
            break;
          case 'month':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          case 'year':
            key = date.getFullYear().toString();
            break;
          default:
            key = date.toISOString().split('T')[0];
        }
        
        revenue[key] = (revenue[key] || 0) + order.tongThanhToan;
      }
    });

    return Object.entries(revenue)
      .map(([period, amount]) => ({ period, amount }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  // Export helpers
  prepareExportData(orders) {
    return orders.map(order => ({
      'ID': order.id_DonHang,
      'Khách hàng': order.customerName,
      'Email': order.customerEmail,
      'SĐT': order.customerPhone,
      'Tổng tiền': this.formatPrice(order.tongThanhToan),
      'Trạng thái': this.getStatusText(order.trangThaiDonHang),
      'Phương thức TT': this.getPaymentMethodText(order.phuongThucThanhToan),
      'Ngày đặt': this.formatDateTime(order.ngayDatHang),
      'Ghi chú': order.ghiChu || ''
    }));
  }
}

// Export singleton instance
const orderService = new OrderService();
export default orderService;