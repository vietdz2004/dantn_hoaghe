const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

// OrderDetail: Model chi tiết đơn hàng (tương ứng bảng chitietdonhang)
const OrderDetail = sequelize.define('OrderDetail', {
  id_ChiTietDH: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_SanPham: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  id_DonHang: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  soLuongMua: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  thanhTien: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  donGiaLucMua: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
}, {
  tableName: 'chitietdonhang',
  timestamps: false,
});

module.exports = OrderDetail; 