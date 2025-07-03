const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

const QuickOrder = sequelize.define('QuickOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  maDonNhanh: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
    comment: 'Mã đơn hàng nhanh (QO + timestamp)'
  },
  tenKhachHang: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Họ tên khách hàng'
  },
  soDienThoai: {
    type: DataTypes.STRING(15),
    allowNull: false,
    comment: 'Số điện thoại khách hàng'
  },
  maSanPham: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID sản phẩm'
  },
  tenSanPham: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Tên sản phẩm tại thời điểm đặt'
  },
  soLuong: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Số lượng đặt'
  },
  giaTaiThoiDiem: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Giá sản phẩm tại thời điểm đặt'
  },
  tongTien: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Tổng tiền = giaTaiThoiDiem * soLuong'
  },
  trangThai: {
    type: DataTypes.ENUM('CHO_XU_LY', 'DA_LIEN_HE', 'DA_XAC_NHAN', 'DANG_GIAO', 'HOAN_THANH', 'HUY'),
    defaultValue: 'CHO_XU_LY',
    comment: 'Trạng thái đơn hàng'
  },
  ghiChu: {
    type: DataTypes.TEXT,
    comment: 'Ghi chú từ khách hàng hoặc nhân viên'
  },
  nhanVienXuLy: {
    type: DataTypes.INTEGER,
    comment: 'ID nhân viên xử lý'
  },
  thoiGianLienHe: {
    type: DataTypes.DATE,
    comment: 'Thời gian nhân viên liên hệ khách hàng'
  },
  diaChiGiao: {
    type: DataTypes.TEXT,
    comment: 'Địa chỉ giao hàng (được cập nhật sau khi liên hệ)'
  },
  thoiGianGiao: {
    type: DataTypes.DATE,
    comment: 'Thời gian giao hàng mong muốn'
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    comment: 'Độ ưu tiên (1-10, số càng nhỏ càng ưu tiên)'
  }
}, {
  tableName: 'don_hang_nhanh',
  timestamps: true,
  hooks: {
    beforeCreate: (quickOrder) => {
      // Tự động tạo mã đơn hàng nhanh
      const timestamp = Date.now();
      quickOrder.maDonNhanh = `QO${timestamp}`;
      
      // Tính tổng tiền
      quickOrder.tongTien = quickOrder.giaTaiThoiDiem * quickOrder.soLuong;
    }
  }
});

module.exports = QuickOrder; 