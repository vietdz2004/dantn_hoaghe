const { DataTypes } = require('sequelize');
const sequelize = require('./database');

// User: Model người dùng (tương ứng bảng nguoidung)
const User = sequelize.define('User', {
  id_NguoiDung: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tenDangNhap: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  matKhau: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ten: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  diaChi: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  soDienThoai: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  vaiTro: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  trangThai: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  ngayTao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'nguoidung',
  timestamps: false,
});

module.exports = User; 