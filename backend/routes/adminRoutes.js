const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Import controllers - Import các controller cần thiết
const dashboardController = require('../controllers/dashboardController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const userController = require('../controllers/userController');
const categoryController = require('../controllers/categoryController');
const subCategoryController = require('../controllers/subCategoryController');

// Multer config for product image upload - Cấu hình upload ảnh sản phẩm
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images/products'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ được phép upload file ảnh!'), false);
    }
  }
});

// ===== DASHBOARD ROUTES - API Dashboard =====
router.get('/dashboard/overview', dashboardController.getOverview);
router.get('/dashboard/recent-activities', dashboardController.getRecentActivities);
router.get('/dashboard/sales-stats', dashboardController.getSalesStats);
router.get('/dashboard/product-stats', dashboardController.getProductStats);
router.get('/dashboard/order-stats', dashboardController.getOrderStats);
router.get('/dashboard/user-stats', dashboardController.getUserStats);
router.get('/dashboard/revenue-chart', dashboardController.getRevenueChart);
router.get('/dashboard/top-products', dashboardController.getTopProducts);
router.get('/dashboard/low-stock', dashboardController.getLowStockProducts);

// ===== PRODUCT ROUTES - API Quản lý sản phẩm =====
// Basic CRUD - Các thao tác cơ bản
router.get('/products', productController.getAll);
router.get('/products/:id', productController.getById);
router.post('/products', upload.single('image'), productController.create);
router.put('/products/:id', upload.single('image'), productController.update);
router.delete('/products/:id', productController.delete);

// Product management - Quản lý sản phẩm
router.put('/products/:id/status', productController.updateStatus);

// Bulk operations - Thao tác hàng loạt
router.post('/products/bulk/delete', productController.bulkDelete);

// Search & Filter - Tìm kiếm và lọc
router.get('/products/search/advanced', productController.searchProducts);
router.get('/products/filter/discounted', productController.getDiscountProducts);
router.get('/products/filter/by-category/:categoryId', productController.getProductsByCategory);

// ===== ORDER ROUTES - API Quản lý đơn hàng =====
// Basic CRUD - Các thao tác cơ bản
router.get('/orders', orderController.getAllOrders);
router.get('/orders/:id', orderController.getOrderById);
router.put('/orders/:id', orderController.updateOrder);
router.delete('/orders/:id', orderController.deleteOrder);

// Order management - Quản lý đơn hàng
router.put('/orders/:id/status', orderController.updateOrderStatus);

// Bulk operations - Thao tác hàng loạt
router.post('/orders/bulk/update-status', orderController.bulkUpdateOrderStatus);
router.post('/orders/bulk/delete', orderController.bulkDeleteOrders);

// Analytics & Export - Thống kê và xuất dữ liệu
router.get('/orders/analytics/summary', orderController.getOrdersSummary);
router.get('/orders/analytics/trends', orderController.getOrderTrends);
router.get('/orders/analytics/revenue', orderController.getRevenueAnalytics);
router.get('/orders/export/excel', orderController.exportOrdersToExcel);

// ===== USER ROUTES - API Quản lý người dùng =====
// Basic CRUD - Các thao tác cơ bản
router.get('/users', userController.getAll);
router.get('/users/:id', userController.getById);
router.put('/users/:id', userController.update);
router.delete('/users/:id', userController.delete);

// User management - Quản lý người dùng
router.put('/users/:id/status', userController.updateUserStatus);
router.get('/users/:id/orders', userController.getUserOrders);

// Analytics - Thống kê
router.get('/users/analytics/summary', userController.getUsersSummary);
router.get('/users/analytics/activity', userController.getUserActivity);

// Bulk operations - Thao tác hàng loạt
router.post('/users/bulk/update-status', userController.bulkUpdateUserStatus);
router.post('/users/bulk/delete', userController.bulkDeleteUsers);

// Export - Xuất dữ liệu
router.get('/users/export/excel', userController.exportUsersToExcel);

// ===== CATEGORY ROUTES - API Quản lý danh mục =====
// Basic CRUD - Các thao tác cơ bản
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/tree', categoryController.getCategoryTree); // Route lấy cây danh mục
router.get('/categories/:id', categoryController.getById);
router.post('/categories', categoryController.create);
router.put('/categories/:id', categoryController.update);
router.delete('/categories/:id', categoryController.delete);

// SubCategory management - Quản lý danh mục con
router.get('/categories/:categoryId/subcategories', categoryController.getSubCategories);
router.post('/categories/:categoryId/subcategories', categoryController.createSubCategory);
router.put('/categories/subcategories/:id', categoryController.updateSubCategory);
router.delete('/categories/subcategories/:id', categoryController.deleteSubCategory);

// Analytics & Bulk operations - Thống kê và thao tác hàng loạt
router.get('/categories/analytics/summary', categoryController.getCategorySummary);
router.get('/categories/:id/products', categoryController.getCategoryProducts);
router.post('/categories/bulk/delete', categoryController.bulkDeleteCategories);
router.post('/categories/subcategories/bulk/delete', categoryController.bulkDeleteSubCategories);

module.exports = router; 