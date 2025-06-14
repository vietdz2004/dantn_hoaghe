const express = require('express');
const reviewController = require('../controllers/reviewController');
const router = express.Router();

// Định nghĩa các route cho đánh giá
router.get('/', reviewController.getAll);
router.get('/product/:productId', reviewController.getByProduct);
router.get('/:id', reviewController.getById);
router.post('/', reviewController.create);
router.put('/:id', reviewController.update);
router.delete('/:id', reviewController.delete);

module.exports = router; 