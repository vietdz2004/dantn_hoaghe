const { DataTypes } = require('sequelize');
const sequelize = require('./database');

// Product: Model sản phẩm (tương ứng bảng sanpham)
const Product = sequelize.define('Product', {
  id_SanPham: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  maSKU: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
  },
  tenSp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  moTa: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  hinhAnh: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  thuongHieu: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gia: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  giaKhuyenMai: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  id_DanhMucChiTiet: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'sanpham',
  timestamps: false,
});

module.exports = Product; 