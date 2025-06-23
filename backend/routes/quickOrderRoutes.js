const express = require('express');
const router = express.Router();
const {
  createQuickOrder,
  getQuickOrders,
  updateQuickOrderStatus
} = require('../controllers/quickOrderController');

// POST /api/quick-orders - Tạo đơn đặt nhanh (public)
router.post('/', createQuickOrder);

// GET /api/quick-orders - Lấy danh sách đơn đặt nhanh (admin only)
router.get('/', getQuickOrders);

// PATCH /api/quick-orders/:id - Cập nhật trạng thái đơn (admin only)
router.patch('/:id', updateQuickOrderStatus);

module.exports = router; 