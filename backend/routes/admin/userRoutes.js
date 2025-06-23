const express = require('express');
const router = express.Router();
const adminUserController = require('../../controllers/admin/adminUserController');

// Get all users/customers with filtering
router.get('/', adminUserController.getAllUsers);

// Get user by ID
router.get('/:id', adminUserController.getUserById);

// Update user status
router.put('/:id/status', adminUserController.updateUserStatus);

// Update user information
router.put('/:id', adminUserController.updateUser);

// Delete user
router.delete('/:id', adminUserController.deleteUser);

// Get user order history
router.get('/:id/orders', adminUserController.getUserOrders);

// User analytics
router.get('/analytics/summary', adminUserController.getUsersSummary);
router.get('/analytics/activity', adminUserController.getUserActivity);

// Bulk operations
router.post('/bulk/update-status', adminUserController.bulkUpdateUserStatus);
router.post('/bulk/delete', adminUserController.bulkDeleteUsers);

// Export users
router.get('/export/excel', adminUserController.exportUsersToExcel);

module.exports = router; 