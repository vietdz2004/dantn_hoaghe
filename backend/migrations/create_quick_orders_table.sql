-- Migration: Tạo bảng don_hang_nhanh
-- File: create_don_hang_nhanh_table.sql

CREATE TABLE IF NOT EXISTS `don_hang_nhanh` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `maDonNhanh` varchar(20) NOT NULL UNIQUE COMMENT 'Mã đơn hàng nhanh (QO + timestamp)',
  `tenKhachHang` varchar(100) NOT NULL COMMENT 'Họ tên khách hàng',
  `soDienThoai` varchar(15) NOT NULL COMMENT 'Số điện thoại khách hàng',
  `maSanPham` int(11) NOT NULL COMMENT 'ID sản phẩm',
  `tenSanPham` varchar(200) NOT NULL COMMENT 'Tên sản phẩm tại thời điểm đặt',
  `soLuong` int(11) DEFAULT 1 COMMENT 'Số lượng đặt',
  `giaTaiThoiDiem` decimal(10,2) NOT NULL COMMENT 'Giá sản phẩm tại thời điểm đặt',
  `tongTien` decimal(10,2) NOT NULL COMMENT 'Tổng tiền = giaTaiThoiDiem * soLuong',
  `trangThai` enum('CHO_XU_LY','DA_LIEN_HE','DA_XAC_NHAN','DANG_GIAO','HOAN_THANH','HUY') DEFAULT 'CHO_XU_LY' COMMENT 'Trạng thái đơn hàng',
  `ghiChu` text COMMENT 'Ghi chú từ khách hàng hoặc nhân viên',
  `nhanVienXuLy` int(11) DEFAULT NULL COMMENT 'ID nhân viên xử lý',
  `thoiGianLienHe` datetime DEFAULT NULL COMMENT 'Thời gian nhân viên liên hệ khách hàng',
  `diaChiGiao` text COMMENT 'Địa chỉ giao hàng (được cập nhật sau khi liên hệ)',
  `thoiGianGiao` datetime DEFAULT NULL COMMENT 'Thời gian giao hàng mong muốn',
  `priority` int(11) DEFAULT 5 COMMENT 'Độ ưu tiên (1-10, số càng nhỏ càng ưu tiên)',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `maDonNhanh` (`maDonNhanh`),
  KEY `idx_trangThai` (`trangThai`),
  KEY `idx_soDienThoai` (`soDienThoai`),
  KEY `idx_priority_created` (`priority`, `createdAt`),
  KEY `idx_maSanPham` (`maSanPham`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng đơn đặt hàng nhanh';

-- Tạo index cho tìm kiếm hiệu quả
CREATE INDEX idx_phone_product_time ON don_hang_nhanh (soDienThoai, maSanPham, createdAt);
CREATE INDEX idx_staff_processing ON don_hang_nhanh (nhanVienXuLy, trangThai);

-- Insert sample data (optional)
-- INSERT INTO don_hang_nhanh (maDonNhanh, tenKhachHang, soDienThoai, maSanPham, tenSanPham, soLuong, giaTaiThoiDiem, tongTien, ghiChu) 
-- VALUES ('QO1703123456789', 'Nguyen Van A', '0123456789', 1, 'Hoa hồng đỏ', 1, 500000.00, 500000.00, 'Đặt từ web - Test'); 