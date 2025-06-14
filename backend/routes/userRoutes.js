const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

// Định nghĩa các route cho user
router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

module.exports = router; 