const express = require('express');
const router = express.Router();
const adminCategoryController = require('../../controllers/admin/adminCategoryController');

// Category Management
router.get('/', adminCategoryController.getAllCategories);
router.get('/:id', adminCategoryController.getCategoryById);
router.post('/', adminCategoryController.createCategory);
router.put('/:id', adminCategoryController.updateCategory);
router.delete('/:id', adminCategoryController.deleteCategory);

// SubCategory Management
router.get('/:categoryId/subcategories', adminCategoryController.getSubCategories);
router.post('/:categoryId/subcategories', adminCategoryController.createSubCategory);
router.put('/subcategories/:id', adminCategoryController.updateSubCategory);
router.delete('/subcategories/:id', adminCategoryController.deleteSubCategory);

// Category Analytics
router.get('/analytics/summary', adminCategoryController.getCategorySummary);
router.get('/:id/products', adminCategoryController.getCategoryProducts);

// Bulk operations
router.post('/bulk/delete', adminCategoryController.bulkDeleteCategories);
router.post('/subcategories/bulk/delete', adminCategoryController.bulkDeleteSubCategories);

module.exports = router; 