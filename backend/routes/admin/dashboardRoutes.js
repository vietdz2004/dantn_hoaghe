const express = require('express');
const router = express.Router();
const adminDashboardController = require('../../controllers/admin/adminDashboardController');

// Dashboard Overview - Thống kê tổng quan
router.get('/overview', adminDashboardController.getOverview);

// Recent Activities - Hoạt động gần đây
router.get('/recent-activities', adminDashboardController.getRecentActivities);

// Sales Statistics - Thống kê bán hàng
router.get('/sales-stats', adminDashboardController.getSalesStats);

// Product Statistics - Thống kê sản phẩm
router.get('/product-stats', adminDashboardController.getProductStats);

// Order Statistics - Thống kê đơn hàng
router.get('/order-stats', adminDashboardController.getOrderStats);

// User Statistics - Thống kê người dùng
router.get('/user-stats', adminDashboardController.getUserStats);

// Quick Order Statistics - Thống kê đơn nhanh
router.get('/quick-order-stats', adminDashboardController.getQuickOrderStats);

// Revenue Chart Data - Dữ liệu biểu đồ doanh thu
router.get('/revenue-chart', adminDashboardController.getRevenueChart);

// Top Products - Sản phẩm bán chạy
router.get('/top-products', adminDashboardController.getTopProducts);

// Low Stock Products - Sản phẩm sắp hết hàng
router.get('/low-stock', adminDashboardController.getLowStockProducts);

module.exports = router; 