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

// Import admin routes
const adminRoutes = require('./routes/admin/index');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Admin routes
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
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