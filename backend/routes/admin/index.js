const express = require('express');
const router = express.Router();

// Import admin routes
const dashboardRoutes = require('./dashboardRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const userRoutes = require('./userRoutes');
const categoryRoutes = require('./categoryRoutes');
const quickOrderRoutes = require('./quickOrderRoutes');

// Admin Dashboard
router.use('/dashboard', dashboardRoutes);

// Product Management
router.use('/products', productRoutes);

// Order Management  
router.use('/orders', orderRoutes);

// User/Customer Management
router.use('/users', userRoutes);

// Category Management
router.use('/categories', categoryRoutes);

// Quick Order Management
router.use('/quick-orders', quickOrderRoutes);

module.exports = router; 