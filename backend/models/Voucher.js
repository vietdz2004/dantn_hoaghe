const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

// Voucher: Model voucher (tương ứng bảng voucher)
const Voucher = sequelize.define('Voucher', {
  id_voucher: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  maVoucher: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  giaTriGiam: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  dieuKienApDung: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ngayBatDau: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  ngayHetHan: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'voucher',
  timestamps: false,
});

module.exports = Voucher; 