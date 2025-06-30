const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

// Auth routes
router.post('/auth/register', userController.register);
router.post('/auth/login', userController.login);
router.post('/auth/logout', userController.logout);
router.get('/auth/verify', userController.verifyToken);
router.put('/auth/profile', userController.updateProfile);

// Định nghĩa các route cho user
router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

module.exports = router; 