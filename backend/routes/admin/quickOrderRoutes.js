const express = require('express');
const router = express.Router();
const adminQuickOrderController = require('../../controllers/admin/adminQuickOrderController');

// Get all quick orders with filtering
router.get('/', adminQuickOrderController.getAllQuickOrders);

// Get quick order by ID
router.get('/:id', adminQuickOrderController.getQuickOrderById);

// Update quick order status
router.put('/:id/status', adminQuickOrderController.updateQuickOrderStatus);

// Convert quick order to regular order
router.post('/:id/convert', adminQuickOrderController.convertToRegularOrder);

// Update quick order
router.put('/:id', adminQuickOrderController.updateQuickOrder);

// Delete quick order
router.delete('/:id', adminQuickOrderController.deleteQuickOrder);

// Bulk operations
router.post('/bulk/update-status', adminQuickOrderController.bulkUpdateStatus);
router.post('/bulk/convert', adminQuickOrderController.bulkConvertToRegularOrders);
router.post('/bulk/delete', adminQuickOrderController.bulkDeleteQuickOrders);

// Quick order analytics
router.get('/analytics/summary', adminQuickOrderController.getQuickOrdersSummary);

// Export quick orders
router.get('/export/excel', adminQuickOrderController.exportQuickOrdersToExcel);

module.exports = router; 