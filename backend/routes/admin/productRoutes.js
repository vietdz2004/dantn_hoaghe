const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const adminProductController = require('../../controllers/admin/adminProductController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/images/products'));
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
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all products with advanced filtering
router.get('/', adminProductController.getAllProducts);

// Get product by ID
router.get('/:id', adminProductController.getProductById);

// Create new product
router.post('/', upload.single('image'), adminProductController.createProduct);

// Update product
router.put('/:id', upload.single('image'), adminProductController.updateProduct);

// Delete product
router.delete('/:id', adminProductController.deleteProduct);

// Bulk operations
router.post('/bulk/delete', adminProductController.bulkDeleteProducts);
router.put('/bulk/update-status', adminProductController.bulkUpdateStatus);
router.put('/bulk/update-stock', adminProductController.bulkUpdateStock);

// Product status management
router.put('/:id/toggle-status', adminProductController.toggleProductStatus);
router.put('/:id/update-stock', adminProductController.updateProductStock);

// Product categories
router.get('/categories/all', adminProductController.getProductCategories);
router.get('/categories/:categoryId/subcategories', adminProductController.getSubCategories);

// Product search and filtering
router.get('/search/advanced', adminProductController.advancedSearch);
router.get('/filter/by-category/:categoryId', adminProductController.getProductsByCategory);
router.get('/filter/low-stock', adminProductController.getLowStockProducts);
router.get('/filter/out-of-stock', adminProductController.getOutOfStockProducts);
router.get('/filter/discounted', adminProductController.getDiscountedProducts);

// Product analytics
router.get('/analytics/performance', adminProductController.getProductPerformance);
router.get('/analytics/inventory', adminProductController.getInventoryAnalytics);

// Excel import/export
router.post('/import/excel', upload.single('file'), adminProductController.importFromExcel);
router.get('/export/excel', adminProductController.exportToExcel);
router.get('/export/template', adminProductController.downloadTemplate);

module.exports = router; 