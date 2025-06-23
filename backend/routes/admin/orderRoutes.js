const express = require('express');
const router = express.Router();
const adminOrderController = require('../../controllers/admin/adminOrderController');

// Get all orders with advanced filtering
router.get('/', adminOrderController.getAllOrders);

// Get order by ID
router.get('/:id', adminOrderController.getOrderById);

// Update order status
router.put('/:id/status', adminOrderController.updateOrderStatus);

// Update order details
router.put('/:id', adminOrderController.updateOrder);

// Delete order
router.delete('/:id', adminOrderController.deleteOrder);

// Bulk operations
router.post('/bulk/update-status', adminOrderController.bulkUpdateOrderStatus);
router.post('/bulk/delete', adminOrderController.bulkDeleteOrders);

// Order analytics
router.get('/analytics/summary', adminOrderController.getOrdersSummary);
router.get('/analytics/trends', adminOrderController.getOrderTrends);
router.get('/analytics/revenue', adminOrderController.getRevenueAnalytics);

// Export orders
router.get('/export/excel', adminOrderController.exportOrdersToExcel);

module.exports = router; 