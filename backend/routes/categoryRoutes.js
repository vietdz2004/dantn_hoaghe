const express = require('express');
const categoryController = require('../controllers/categoryController');
const router = express.Router();

// Định nghĩa các route cho danh mục
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.post('/', categoryController.create);
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.delete);

module.exports = router; 