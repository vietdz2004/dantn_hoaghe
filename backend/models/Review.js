const { DataTypes } = require('sequelize');
const sequelize = require('./database');

// Review: Model đánh giá (tương ứng bảng danhgia)
const Review = sequelize.define('Review', {
  id_DanhGia: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_ChiTietDH: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  noiDung: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  danhGiaSao: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  ngayDanhGia: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'danhgia',
  timestamps: false,
});

module.exports = Review; 