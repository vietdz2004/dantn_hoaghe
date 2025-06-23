import { dashboardAPI } from './api';

// Dashboard Service - Wrapper around dashboardAPI with additional business logic
class DashboardService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.refreshInterval = null;
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

  // Auto refresh functionality
  startAutoRefresh(callback, interval = 30000) { // 30 seconds
    this.stopAutoRefresh();
    this.refreshInterval = setInterval(() => {
      this.clearCache();
      if (callback) callback();
    }, interval);
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  // Dashboard overview
  async getOverview() {
    try {
      const cacheKey = this.getCacheKey('getOverview', {});
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await dashboardAPI.getOverview();
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error getting overview:', error);
      throw error;
    }
  }

  // Recent activities
  async getRecentActivities() {
    try {
      const response = await dashboardAPI.getRecentActivities();
      return response;
    } catch (error) {
      console.error('Error getting recent activities:', error);
      throw error;
    }
  }

  // Statistics
  async getSalesStats(period = '30d') {
    try {
      const cacheKey = this.getCacheKey('getSalesStats', { period });
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await dashboardAPI.getSalesStats(period);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error getting sales stats:', error);
      throw error;
    }
  }

  async getProductStats() {
    try {
      const cacheKey = this.getCacheKey('getProductStats', {});
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await dashboardAPI.getProductStats();
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error getting product stats:', error);
      throw error;
    }
  }

  async getOrderStats(period = '30d') {
    try {
      const cacheKey = this.getCacheKey('getOrderStats', { period });
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await dashboardAPI.getOrderStats(period);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error getting order stats:', error);
      throw error;
    }
  }

  async getUserStats() {
    try {
      const cacheKey = this.getCacheKey('getUserStats', {});
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await dashboardAPI.getUserStats();
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  async getTopProducts(limit = 10) {
    try {
      const cacheKey = this.getCacheKey('getTopProducts', { limit });
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await dashboardAPI.getTopProducts(limit);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error getting top products:', error);
      throw error;
    }
  }

  async getRevenueAnalytics(period = '30d') {
    try {
      const cacheKey = this.getCacheKey('getRevenueAnalytics', { period });
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await dashboardAPI.getRevenueAnalytics(period);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error getting revenue analytics:', error);
      throw error;
    }
  }

  // Combined dashboard data
  async getDashboardData(period = '30d') {
    try {
      const [
        overview,
        salesStats,
        productStats,
        orderStats,
        userStats,
        topProducts,
        revenueAnalytics
      ] = await Promise.all([
        this.getOverview(),
        this.getSalesStats(period),
        this.getProductStats(),
        this.getOrderStats(period),
        this.getUserStats(),
        this.getTopProducts(),
        this.getRevenueAnalytics(period)
      ]);

      return {
        overview: overview.data,
        salesStats: salesStats.data,
        productStats: productStats.data,
        orderStats: orderStats.data,
        userStats: userStats.data,
        topProducts: topProducts.data,
        revenueAnalytics: revenueAnalytics.data
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }

  // Utility methods
  formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  formatNumber(number) {
    return new Intl.NumberFormat('vi-VN').format(number);
  }

  formatPercentage(value, total) {
    if (!total || total === 0) return '0%';
    const percentage = (value / total) * 100;
    return `${percentage.toFixed(1)}%`;
  }

  calculateGrowthRate(current, previous) {
    if (!previous || previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  }

  getGrowthColor(growthRate) {
    if (growthRate > 0) return 'success';
    if (growthRate < 0) return 'error';
    return 'default';
  }

  getGrowthIcon(growthRate) {
    if (growthRate > 0) return 'TrendingUp';
    if (growthRate < 0) return 'TrendingDown';
    return 'Remove';
  }

  // Chart data formatters
  formatChartData(data, type = 'line') {
    if (!data || !Array.isArray(data)) return [];

    switch (type) {
      case 'line':
      case 'area':
        return data.map(item => ({
          x: item.period || item.date,
          y: item.value || item.amount || item.count
        }));

      case 'bar':
        return data.map(item => ({
          name: item.label || item.category,
          value: item.value || item.amount || item.count
        }));

      case 'pie':
      case 'donut':
        return data.map(item => ({
          label: item.label || item.category,
          value: item.value || item.amount || item.count
        }));

      default:
        return data;
    }
  }

  // Alert thresholds
  getAlerts(dashboardData) {
    const alerts = [];

    // Low stock alert
    if (dashboardData.productStats?.lowStockCount > 0) {
      alerts.push({
        type: 'warning',
        title: 'Sản phẩm sắp hết hàng',
        message: `${dashboardData.productStats.lowStockCount} sản phẩm đang có số lượng thấp`,
        action: 'Xem chi tiết',
        link: '/admin/products?stockStatus=low'
      });
    }

    // Out of stock alert
    if (dashboardData.productStats?.outOfStockCount > 0) {
      alerts.push({
        type: 'error',
        title: 'Sản phẩm hết hàng',
        message: `${dashboardData.productStats.outOfStockCount} sản phẩm đã hết hàng`,
        action: 'Xem chi tiết',
        link: '/admin/products?stockStatus=out'
      });
    }

    // Pending orders alert
    if (dashboardData.orderStats?.pendingCount > 10) {
      alerts.push({
        type: 'info',
        title: 'Đơn hàng chờ xử lý',
        message: `${dashboardData.orderStats.pendingCount} đơn hàng đang chờ xác nhận`,
        action: 'Xem chi tiết',
        link: '/admin/orders?status=CHO_XAC_NHAN'
      });
    }

    return alerts;
  }

  // Performance metrics
  calculateKPIs(dashboardData) {
    const kpis = {};

    // Revenue KPIs
    if (dashboardData.revenueAnalytics) {
      const { totalRevenue, previousRevenue } = dashboardData.revenueAnalytics;
      kpis.revenueGrowth = this.calculateGrowthRate(totalRevenue, previousRevenue);
    }

    // Order KPIs
    if (dashboardData.orderStats) {
      const { totalOrders, completedOrders } = dashboardData.orderStats;
      kpis.orderCompletionRate = this.formatPercentage(completedOrders, totalOrders);
    }

    // Product KPIs
    if (dashboardData.productStats) {
      const { totalProducts, activeProducts } = dashboardData.productStats;
      kpis.activeProductRate = this.formatPercentage(activeProducts, totalProducts);
    }

    return kpis;
  }

  // Period options
  getPeriodOptions() {
    return [
      { value: '7d', label: '7 ngày qua' },
      { value: '30d', label: '30 ngày qua' },
      { value: '90d', label: '3 tháng qua' },
      { value: '12m', label: '12 tháng qua' }
    ];
  }

  // Widget configurations
  getWidgetConfigs() {
    return {
      overview: {
        title: 'Tổng quan',
        size: 'large',
        refreshable: true
      },
      recentOrders: {
        title: 'Đơn hàng gần đây',
        size: 'medium',
        refreshable: true
      },
      topProducts: {
        title: 'Sản phẩm bán chạy',
        size: 'medium',
        refreshable: true
      },
      revenueChart: {
        title: 'Biểu đồ doanh thu',
        size: 'large',
        refreshable: true
      },
      alerts: {
        title: 'Cảnh báo',
        size: 'small',
        refreshable: true
      }
    };
  }
}

// Export singleton instance
const dashboardService = new DashboardService();
export default dashboardService; 