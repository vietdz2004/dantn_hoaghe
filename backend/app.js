require('dotenv').config({ path: './config.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { sequelize } = require('./models');

// Import tất cả routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const quickOrderRoutes = require('./routes/quickOrderRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const cartRoutes = require('./routes/cartRoutes');

// Import admin routes
const adminRoutes = require('./routes/admin/index');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (images)
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'public/images/products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp + random + original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Hoashop API is running', status: 'OK', timestamp: new Date().toISOString() });
});

// Test route cho API
app.get('/api/test', (req, res) => {
  res.json({ message: 'API endpoints working', status: 'OK' });
});

// Debug route để test req.query và req.params
app.get('/api/debug', (req, res) => {
  console.log('DEBUG - req.query:', req.query);
  console.log('DEBUG - req.params:', req.params);
  console.log('DEBUG - req.url:', req.url);
  
  res.json({ 
    message: 'Debug API working', 
    query: req.query,
    params: req.params,
    url: req.url,
    method: req.method
  });
});

// Sử dụng tất cả routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/quick-orders', quickOrderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cart', cartRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// ===== ROOT ROUTE =====
app.get('/', (req, res) => {
  res.json({ 
    message: 'HoaShop API Server', 
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders'
    }
  });
});

// ===== ERROR HANDLING =====
// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    url: req.url
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🚨 Global Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message
  });
});

// Khởi động server và kết nối DB
const PORT = process.env.PORT || 5000;
console.log('ENV Variables:', {
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  PORT: PORT
});

app.listen(PORT, async () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối MySQL thành công!');
  } catch (error) {
    console.error('❌ Không thể kết nối MySQL:', error.message);
    console.log('⚠️ Server vẫn chạy nhưng không có database connection');
  }
});

module.exports = app; 