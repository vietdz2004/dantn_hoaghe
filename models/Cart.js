const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

const Cart = sequelize.define('Cart', {
  id_GioHang: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_NguoiDung: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'nguoidung',
      key: 'id_NguoiDung'
    }
  },
  id_SanPham: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sanpham',
      key: 'id_SanPham'
    }
  },
  soLuong: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  giaTaiThoiDiem: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Giá sản phẩm tại thời điểm thêm vào giỏ'
  },
  ngayThem: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  ngayCapNhat: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'giohang',
  timestamps: true,
  createdAt: 'ngayThem',
  updatedAt: 'ngayCapNhat',
  indexes: [
    {
      unique: true,
      fields: ['id_NguoiDung', 'id_SanPham'],
      name: 'unique_user_product_cart'
    },
    {
      fields: ['id_NguoiDung'],
      name: 'idx_cart_user'
    },
    {
      fields: ['id_SanPham'],
      name: 'idx_cart_product'
    }
  ]
});

module.exports = Cart; 