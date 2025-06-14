const express = require('express');
const voucherController = require('../controllers/voucherController');
const router = express.Router();

// Định nghĩa các route cho voucher
router.get('/', voucherController.getAll);
router.get('/:id', voucherController.getById);
router.post('/', voucherController.create);
router.post('/validate', voucherController.validateVoucher);
router.put('/:id', voucherController.update);
router.delete('/:id', voucherController.delete);

module.exports = router; 