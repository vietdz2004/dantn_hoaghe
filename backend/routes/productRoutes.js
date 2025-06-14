const express = require('express');
const productController = require('../controllers/productController');
const router = express.Router();

// Định nghĩa các route cho sản phẩm
router.get('/', productController.getAll);
router.get('/category/:categoryId', productController.getByCategory);
router.get('/:id', productController.getById);
router.post('/', productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.delete);

module.exports = router; 