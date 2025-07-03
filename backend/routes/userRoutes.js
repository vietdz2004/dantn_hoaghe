const express = require('express');
const userController = require('../controllers/userController');
const requireAuth = require('../middlewares/auth');
const router = express.Router();

// Auth routes
router.post('/auth/register', userController.register);
router.post('/auth/login', userController.login);
router.post('/auth/logout', userController.logout);
router.get('/auth/verify', userController.verifyToken);
router.put('/auth/profile', requireAuth, userController.updateProfile);

// Password management routes
router.post('/auth/change-password', userController.changePassword);
router.post('/auth/forgot-password', userController.forgotPassword);
router.post('/auth/reset-password', userController.resetPassword);
router.get('/auth/verify-reset-token/:token', userController.verifyResetToken);

// Định nghĩa các route cho user
router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

module.exports = router; 