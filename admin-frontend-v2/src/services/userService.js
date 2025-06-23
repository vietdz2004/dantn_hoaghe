import { userAPI } from './api';

// User Service - Wrapper around userAPI with additional business logic
class UserService {
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

  // Users CRUD
  async getAllUsers(params = {}) {
    try {
      const cacheKey = this.getCacheKey('getAllUsers', params);
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await userAPI.getAll(params);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const cacheKey = this.getCacheKey('getUserById', { id });
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await userAPI.getById(id);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async updateUser(id, userData) {
    try {
      // Validate user data
      const validationErrors = this.validateUserData(userData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const response = await userAPI.update(id, userData);
      this.clearCache();
      return response;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const response = await userAPI.delete(id);
      this.clearCache();
      return response;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Status management
  async updateUserStatus(id, status) {
    try {
      if (!this.isValidStatus(status)) {
        throw new Error('Trạng thái người dùng không hợp lệ');
      }

      const response = await userAPI.updateStatus(id, status);
      this.clearCache();
      return response;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  async bulkUpdateUserStatus(userIds, status) {
    try {
      if (!userIds || userIds.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một người dùng');
      }

      if (!this.isValidStatus(status)) {
        throw new Error('Trạng thái người dùng không hợp lệ');
      }

      const response = await userAPI.bulkUpdateStatus(userIds, status);
      this.clearCache();
      return response;
    } catch (error) {
      console.error('Error bulk updating user status:', error);
      throw error;
    }
  }

  // User orders
  async getUserOrders(id, params = {}) {
    try {
      const response = await userAPI.getOrders(id, params);
      return response;
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw error;
    }
  }

  // Analytics
  async getUsersSummary(period = '30d') {
    try {
      const response = await userAPI.getSummary(period);
      return response;
    } catch (error) {
      console.error('Error getting users summary:', error);
      throw error;
    }
  }

  async getUserActivity(period = '30d') {
    try {
      const response = await userAPI.getActivity(period);
      return response;
    } catch (error) {
      console.error('Error getting user activity:', error);
      throw error;
    }
  }

  // Bulk operations
  async bulkDeleteUsers(userIds) {
    try {
      if (!userIds || userIds.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một người dùng để xóa');
      }

      const response = await userAPI.bulkDelete(userIds);
      this.clearCache();
      return response;
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      throw error;
    }
  }

  // Export
  async exportUsers(params = {}) {
    try {
      const response = await userAPI.export(params);
      return response;
    } catch (error) {
      console.error('Error exporting users:', error);
      throw error;
    }
  }

  // Utility methods
  isValidStatus(status) {
    const validStatuses = ['active', 'inactive', 'banned'];
    return validStatuses.includes(status);
  }

  getStatusText(status) {
    const statusTexts = {
      'active': 'Hoạt động',
      'inactive': 'Không hoạt động',
      'banned': 'Bị cấm'
    };
    return statusTexts[status] || status;
  }

  getStatusColor(status) {
    const statusColors = {
      'active': 'success',
      'inactive': 'warning',
      'banned': 'error'
    };
    return statusColors[status] || 'default';
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString('vi-VN');
  }

  formatDateTime(date) {
    return new Date(date).toLocaleString('vi-VN');
  }

  formatPhone(phone) {
    if (!phone) return '';
    // Format phone number: 0123456789 -> 0123 456 789
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }

  // Search and filter helpers
  buildSearchParams(filters) {
    const params = {};
    
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;

    return params;
  }

  // Validation helpers
  validateUserData(userData) {
    const errors = [];

    if (userData.ten && userData.ten.trim().length < 2) {
      errors.push('Tên phải có ít nhất 2 ký tự');
    }

    if (userData.email && !this.isValidEmail(userData.email)) {
      errors.push('Email không hợp lệ');
    }

    if (userData.soDienThoai && !this.isValidPhone(userData.soDienThoai)) {
      errors.push('Số điện thoại không hợp lệ');
    }

    return errors;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    // Vietnamese phone number regex
    const phoneRegex = /^(0|84|\+84)[1-9][0-9]{8,9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // Statistics helpers
  calculateUserStats(users) {
    if (!users || users.length === 0) return {};

    const stats = {
      total: users.length,
      active: 0,
      inactive: 0,
      banned: 0
    };

    users.forEach(user => {
      stats[user.trangThai] = (stats[user.trangThai] || 0) + 1;
    });

    return stats;
  }

  calculateUserGrowth(currentUsers, previousUsers) {
    if (!previousUsers || previousUsers === 0) {
      return currentUsers > 0 ? 100 : 0;
    }
    return ((currentUsers - previousUsers) / previousUsers) * 100;
  }

  // User activity analysis
  analyzeUserActivity(users) {
    if (!users || users.length === 0) return {};

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activity = {
      activeThisWeek: 0,
      activeThisMonth: 0,
      newThisWeek: 0,
      newThisMonth: 0
    };

    users.forEach(user => {
      const lastLogin = new Date(user.lastLogin);
      const createdAt = new Date(user.createdAt);

      if (lastLogin >= oneWeekAgo) {
        activity.activeThisWeek++;
      }
      if (lastLogin >= oneMonthAgo) {
        activity.activeThisMonth++;
      }
      if (createdAt >= oneWeekAgo) {
        activity.newThisWeek++;
      }
      if (createdAt >= oneMonthAgo) {
        activity.newThisMonth++;
      }
    });

    return activity;
  }

  // User segments
  segmentUsers(users) {
    if (!users || users.length === 0) return {};

    const segments = {
      new: [], // Registered in last 30 days
      active: [], // Active in last 7 days
      inactive: [], // No activity in last 30 days
      frequent: [] // Multiple orders
    };

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    users.forEach(user => {
      const lastLogin = new Date(user.lastLogin);
      const createdAt = new Date(user.createdAt);

      if (createdAt >= oneMonthAgo) {
        segments.new.push(user);
      }

      if (lastLogin >= oneWeekAgo) {
        segments.active.push(user);
      } else if (lastLogin < oneMonthAgo) {
        segments.inactive.push(user);
      }

      if (user.orderCount && user.orderCount >= 5) {
        segments.frequent.push(user);
      }
    });

    return segments;
  }

  // Export helpers
  prepareExportData(users) {
    return users.map(user => ({
      'ID': user.id_NguoiDung,
      'Tên': user.ten,
      'Email': user.email,
      'SĐT': this.formatPhone(user.soDienThoai),
      'Địa chỉ': user.diaChi || '',
      'Trạng thái': this.getStatusText(user.trangThai),
      'Ngày đăng ký': this.formatDate(user.ngayTao),
      'Lần cuối đăng nhập': user.lanCuoiDangNhap ? this.formatDateTime(user.lanCuoiDangNhap) : 'Chưa đăng nhập',
      'Số đơn hàng': user.soDonHang || 0,
      'Tổng chi tiêu': user.tongChiTieu ? this.formatPrice(user.tongChiTieu) : '0 VND'
    }));
  }

  formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }
}

// Export singleton instance
const userService = new UserService();
export default userService; 