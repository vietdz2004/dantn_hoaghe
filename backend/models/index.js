// Import sequelize từ file database.js
const { sequelize } = require('./database');

// Import tất cả models
const User = require('./User');
const Category = require('./Category');
const SubCategory = require('./SubCategory');
const Product = require('./Product');
const Order = require('./Order');
const OrderDetail = require('./OrderDetail');
const Voucher = require('./Voucher');
const Review = require('./Review');
const QuickOrder = require('./QuickOrder');
const Cart = require('./Cart');
const Wishlist = require('./Wishlist');

// Thiết lập quan hệ theo cấu trúc database
// Category - SubCategory: 1-nhiều
Category.hasMany(SubCategory, { foreignKey: 'id_DanhMuc' });
SubCategory.belongsTo(Category, { foreignKey: 'id_DanhMuc' });

// SubCategory - Product: 1-nhiều
SubCategory.hasMany(Product, { foreignKey: 'id_DanhMucChiTiet' });
Product.belongsTo(SubCategory, { foreignKey: 'id_DanhMucChiTiet' });

// User - Order: 1-nhiều
User.hasMany(Order, { foreignKey: 'id_NguoiDung' });
Order.belongsTo(User, { foreignKey: 'id_NguoiDung' });

// Voucher - Order: 1-nhiều
Voucher.hasMany(Order, { foreignKey: 'id_voucher' });
Order.belongsTo(Voucher, { foreignKey: 'id_voucher' });

// Order - OrderDetail: 1-nhiều
Order.hasMany(OrderDetail, { foreignKey: 'id_DonHang' });
OrderDetail.belongsTo(Order, { foreignKey: 'id_DonHang' });

// Product - OrderDetail: 1-nhiều
Product.hasMany(OrderDetail, { foreignKey: 'id_SanPham' });
OrderDetail.belongsTo(Product, { foreignKey: 'id_SanPham' });

// OrderDetail - Review: 1-1
OrderDetail.hasOne(Review, { foreignKey: 'id_ChiTietDH' });
Review.belongsTo(OrderDetail, { foreignKey: 'id_ChiTietDH' });

// User - Cart: 1-nhiều
User.hasMany(Cart, { foreignKey: 'id_NguoiDung' });
Cart.belongsTo(User, { foreignKey: 'id_NguoiDung' });

// Product - Cart: 1-nhiều
Product.hasMany(Cart, { foreignKey: 'id_SanPham' });
Cart.belongsTo(Product, { foreignKey: 'id_SanPham' });

// User - Wishlist: 1-nhiều
User.hasMany(Wishlist, { foreignKey: 'id_NguoiDung' });
Wishlist.belongsTo(User, { foreignKey: 'id_NguoiDung' });

// Product - Wishlist: 1-nhiều
Product.hasMany(Wishlist, { foreignKey: 'id_SanPham' });
Wishlist.belongsTo(Product, { foreignKey: 'id_SanPham' });

// Export tất cả models và sequelize
module.exports = { 
  sequelize, 
  User, 
  Category, 
  SubCategory, 
  Product, 
  Order, 
  OrderDetail, 
  Voucher, 
  Review,
  QuickOrder,
  Cart,
  Wishlist
}; 