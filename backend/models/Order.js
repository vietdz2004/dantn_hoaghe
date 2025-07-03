const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

// Order: Model đơn hàng (tương ứng bảng donhang)
const Order = sequelize.define('Order', {
  id_DonHang: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_NguoiDung: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  id_voucher: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  ngayDatHang: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  phuongThucThanhToan: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  soLuong: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  tongThanhToan: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  phiVanChuyen: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  trangThaiDonHang: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'CHO_XAC_NHAN',
  }
}, {
  tableName: 'donhang',
  timestamps: false,
});

module.exports = Order; 