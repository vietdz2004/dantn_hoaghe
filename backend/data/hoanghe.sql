-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th6 23, 2025 lúc 03:56 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `hoanghe`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chitietdonhang`
--

CREATE TABLE `chitietdonhang` (
  `id_ChiTietDH` int(11) NOT NULL,
  `id_SanPham` int(11) DEFAULT NULL,
  `id_DonHang` int(11) DEFAULT NULL,
  `soLuongMua` int(11) DEFAULT NULL,
  `thanhTien` decimal(10,2) DEFAULT NULL,
  `donGiaLucMua` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danhgia`
--

CREATE TABLE `danhgia` (
  `id_DanhGia` int(11) NOT NULL,
  `id_ChiTietDH` int(11) DEFAULT NULL,
  `noiDung` text DEFAULT NULL,
  `danhGiaSao` int(11) DEFAULT NULL,
  `ngayDanhGia` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danhmuc`
--

CREATE TABLE `danhmuc` (
  `id_DanhMuc` int(11) NOT NULL,
  `tenDanhMuc` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `danhmuc`
--

INSERT INTO `danhmuc` (`id_DanhMuc`, `tenDanhMuc`) VALUES
(1, 'Hoa Sinh Nhật'),
(2, 'Hoa Chúc Mừng'),
(4, 'Hoa Tình Yêu'),
(5, 'Hoa Khai Trương'),
(6, 'Hoa Tang Lễ'),
(7, 'Hoa Tổng Hợp');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danhmucchitiet`
--

CREATE TABLE `danhmucchitiet` (
  `id_DanhMucChiTiet` int(11) NOT NULL,
  `id_DanhMuc` int(11) DEFAULT NULL,
  `tenDanhMucChiTiet` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `danhmucchitiet`
--

INSERT INTO `danhmucchitiet` (`id_DanhMucChiTiet`, `id_DanhMuc`, `tenDanhMucChiTiet`) VALUES
(1, 1, 'Hoa Hồng'),
(2, 1, 'Hoa Cúc'),
(3, 2, 'Hoa Khai Trương'),
(4, 2, 'Hoa Sự Kiện');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `donhang`
--

CREATE TABLE `donhang` (
  `id_DonHang` int(11) NOT NULL,
  `id_NguoiDung` int(11) DEFAULT NULL,
  `id_voucher` int(11) DEFAULT NULL,
  `ngayDatHang` datetime DEFAULT current_timestamp(),
  `phuongThucThanhToan` varchar(100) DEFAULT NULL,
  `soLuong` int(11) DEFAULT NULL,
  `tongThanhToan` decimal(10,2) DEFAULT NULL,
  `phiVanChuyen` decimal(10,2) DEFAULT NULL,
  `trangThaiDonHang` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `don_hang_nhanh`
--

CREATE TABLE `don_hang_nhanh` (
  `id` int(11) NOT NULL,
  `maDonNhanh` varchar(20) NOT NULL COMMENT 'Mã đơn hàng nhanh (QO + timestamp)',
  `tenKhachHang` varchar(100) NOT NULL COMMENT 'Họ tên khách hàng',
  `soDienThoai` varchar(15) NOT NULL COMMENT 'Số điện thoại khách hàng',
  `maSanPham` int(11) NOT NULL COMMENT 'ID sản phẩm',
  `tenSanPham` varchar(200) NOT NULL COMMENT 'Tên sản phẩm tại thời điểm đặt',
  `soLuong` int(11) DEFAULT 1 COMMENT 'Số lượng đặt',
  `giaTaiThoiDiem` decimal(10,2) NOT NULL COMMENT 'Giá sản phẩm tại thời điểm đặt',
  `tongTien` decimal(10,2) NOT NULL COMMENT 'Tổng tiền = giaTaiThoiDiem * soLuong',
  `trangThai` enum('CHO_XU_LY','DA_LIEN_HE','DA_XAC_NHAN','DANG_GIAO','HOAN_THANH','HUY') DEFAULT 'CHO_XU_LY' COMMENT 'Trạng thái đơn hàng',
  `ghiChu` text DEFAULT NULL COMMENT 'Ghi chú từ khách hàng hoặc nhân viên',
  `nhanVienXuLy` int(11) DEFAULT NULL COMMENT 'ID nhân viên xử lý',
  `thoiGianLienHe` datetime DEFAULT NULL COMMENT 'Thời gian nhân viên liên hệ khách hàng',
  `diaChiGiao` text DEFAULT NULL COMMENT 'Địa chỉ giao hàng (được cập nhật sau khi liên hệ)',
  `thoiGianGiao` datetime DEFAULT NULL COMMENT 'Thời gian giao hàng mong muốn',
  `priority` int(11) DEFAULT 5 COMMENT 'Độ ưu tiên (1-10, số càng nhỏ càng ưu tiên)',
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng đơn đặt hàng nhanh';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nguoidung`
--

CREATE TABLE `nguoidung` (
  `id_NguoiDung` int(11) NOT NULL,
  `tenDangNhap` varchar(255) DEFAULT NULL,
  `matKhau` varchar(255) DEFAULT NULL,
  `ten` varchar(255) DEFAULT NULL,
  `diaChi` varchar(255) DEFAULT NULL,
  `soDienThoai` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `vaiTro` varchar(50) DEFAULT NULL,
  `trangThai` varchar(50) DEFAULT NULL,
  `ngayTao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `quick_orders`
--

CREATE TABLE `quick_orders` (
  `id` int(11) NOT NULL,
  `maDonNhanh` varchar(20) NOT NULL COMMENT 'Mã đơn hàng nhanh (QO + timestamp)',
  `tenKhachHang` varchar(100) NOT NULL COMMENT 'Họ tên khách hàng',
  `soDienThoai` varchar(15) NOT NULL COMMENT 'Số điện thoại khách hàng',
  `maSanPham` int(11) NOT NULL COMMENT 'ID sản phẩm',
  `tenSanPham` varchar(200) NOT NULL COMMENT 'Tên sản phẩm tại thời điểm đặt',
  `soLuong` int(11) DEFAULT 1 COMMENT 'Số lượng đặt',
  `giaTaiThoiDiem` decimal(10,2) NOT NULL COMMENT 'Giá sản phẩm tại thời điểm đặt',
  `tongTien` decimal(10,2) NOT NULL COMMENT 'Tổng tiền = giaTaiThoiDiem * soLuong',
  `trangThai` enum('CHO_XU_LY','DA_LIEN_HE','DA_XAC_NHAN','DANG_GIAO','HOAN_THANH','HUY') DEFAULT 'CHO_XU_LY' COMMENT 'Trạng thái đơn hàng',
  `ghiChu` text DEFAULT NULL COMMENT 'Ghi chú từ khách hàng hoặc nhân viên',
  `nhanVienXuLy` int(11) DEFAULT NULL COMMENT 'ID nhân viên xử lý',
  `thoiGianLienHe` datetime DEFAULT NULL COMMENT 'Thời gian nhân viên liên hệ khách hàng',
  `diaChiGiao` text DEFAULT NULL COMMENT 'Địa chỉ giao hàng (được cập nhật sau khi liên hệ)',
  `thoiGianGiao` datetime DEFAULT NULL COMMENT 'Thời gian giao hàng mong muốn',
  `priority` int(11) DEFAULT 5 COMMENT 'Độ ưu tiên (1-10, số càng nhỏ càng ưu tiên)',
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng đơn đặt hàng nhanh';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sanpham`
--

CREATE TABLE `sanpham` (
  `id_SanPham` int(11) NOT NULL,
  `maSKU` varchar(100) DEFAULT NULL,
  `tenSp` varchar(255) DEFAULT NULL,
  `moTa` text DEFAULT NULL,
  `hinhAnh` varchar(255) DEFAULT NULL,
  `thuongHieu` varchar(255) DEFAULT NULL,
  `gia` decimal(10,2) DEFAULT NULL,
  `giaKhuyenMai` decimal(10,2) DEFAULT NULL,
  `id_DanhMucChiTiet` int(11) DEFAULT NULL,
  `trangThai` varchar(20) DEFAULT 'active',
  `soLuong` int(11) NOT NULL DEFAULT 0,
  `seoTitle` varchar(255) DEFAULT NULL COMMENT 'SEO Title for search engines',
  `seoDescription` text DEFAULT NULL COMMENT 'SEO Meta Description for search engines',
  `seoKeywords` text DEFAULT NULL COMMENT 'SEO Keywords separated by commas',
  `slug` varchar(255) DEFAULT NULL COMMENT 'URL-friendly slug for product page',
  `soLuongTon` int(11) NOT NULL DEFAULT 0 COMMENT 'Số lượng tồn kho',
  `soLuongToiThieu` int(11) NOT NULL DEFAULT 5 COMMENT 'Số lượng tồn kho tối thiểu để cảnh báo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `sanpham`
--

INSERT INTO `sanpham` (`id_SanPham`, `maSKU`, `tenSp`, `moTa`, `hinhAnh`, `thuongHieu`, `gia`, `giaKhuyenMai`, `id_DanhMucChiTiet`, `trangThai`, `soLuong`, `seoTitle`, `seoDescription`, `seoKeywords`, `slug`, `soLuongTon`, `soLuongToiThieu`) VALUES
(10, 'SKU001', 'Bó hoa hồng đỏ cao cấp', 'Bó hoa hồng đỏ tươi 12 bông, ý nghĩa tình yêu hoàn hảo', '/images/products/daisy.jpg', 'FlowerCorner', 450000.00, 399000.00, 1, 'active', 0, 'Bó Hoa Hồng Đỏ Cao Cấp - Tặng Người Yêu | HoaShop', 'Bó hoa hồng đỏ tươi 12 bông biểu tượng tình yêu. Chất lượng cao, giao hàng nhanh, giá tốt. Đặt ngay!', 'hoa hồng đỏ, hoa tươi, quà tặng, hoa sinh nhật, hoa valentine', 'bo-hoa-hong-do-cao-cap', 50, 5),
(11, 'SKU002', 'Lẵng hoa cúc vàng tươi', 'Lẵng hoa cúc vàng tươi mang lại niềm vui và may mắn', '/images/products/event.jpg', 'FlowerCorner', 350000.00, NULL, 2, 'active', 0, 'Lẵng Hoa Cúc Vàng Tươi - Mang Lại May Mắn | HoaShop', 'Lẵng hoa cúc vàng tươi đẹp, mang ý nghĩa may mắn. Giao hàng tận nơi, chất lượng đảm bảo.', 'hoa cúc vàng, lẵng hoa, hoa tươi, may mắn, khai trương', 'lang-hoa-cuc-vang-tuoi', 30, 3),
(12, 'SKU003', 'Giỏ hoa khai trương', 'Giỏ hoa chúc mừng khai trương phát đạt, thịnh vượng', '/images/products/product-1750594227200-929108794.webp', 'FlowerCorner', 800000.00, 750000.00, 3, 'active', 0, 'Giỏ Hoa Khai Trương - Chúc Mừng Thành Công | HoaShop', 'Giỏ hoa khai trương đẹp, ý nghĩa phát đạt thịnh vượng. Thiết kế hiện đại, giao hàng nhanh.', 'giỏ hoa khai trương, hoa chúc mừng, khai trương, phát đạt', 'gio-hoa-khai-truong', 15, 2),
(13, 'SKU004', 'Bó hoa tulip đỏ nhập khẩu', 'Bó hoa tulip đỏ nhập khẩu Hà Lan cao cấp', '/images/products/rose.jpg', 'Holland Flowers', 650000.00, NULL, 1, 'active', 0, 'Bó Hoa Tulip Đỏ Nhập Khẩu Hà Lan | HoaShop', 'Hoa tulip đỏ nhập khẩu Hà Lan chính hãng. Chất lượng cao cấp, tươi lâu, giao hàng nhanh.', 'hoa tulip đỏ, nhập khẩu, hà lan, hoa cao cấp, quà tặng', 'bo-hoa-tulip-do-nhap-khau', 25, 5),
(14, 'SKU005', 'Hoa baby trắng thơm', 'Hoa baby trắng thơm ngát, trang trí đẹp', '/images/products/product-1750598743293-184511824.webp', 'VietFlower', 120000.00, 100000.00, 2, 'active', 0, 'Hoa Baby Trắng Thơm - Trang Trí Đẹp | HoaShop', 'Hoa baby trắng thơm ngát, trang trí đẹp cho không gian. Giá ưu đãi, chất lượng tốt.', 'hoa baby trắng, hoa trang trí, thơm ngát, giá rẻ', 'hoa-baby-trang-thom', 0, 10),
(15, 'SKU006', 'Chậu lan hồ điệp tím', 'Chậu lan hồ điệp tím cao cấp, sang trọng', '/images/products/product-1750598735349-755866346.webp', 'OrchidVN', 1200000.00, NULL, 4, 'active', 0, 'Chậu Lan Hồ Điệp Tím Cao Cấp - Sang Trọng | HoaShop', 'Lan hồ điệp tím cao cấp, sang trọng. Chậu đẹp, hoa to, màu sắc đẹp. Tặng kèm hướng dẫn chăm sóc.', 'lan hồ điệp tím, lan cao cấp, chậu hoa, sang trọng', 'chau-lan-ho-diep-tim', 8, 2),
(16, 'SKU007', 'Hoa hướng dương mini', 'Bó hoa hướng dương mini tươi tắn, năng động', '/images/products/product-1750598726921-701225680.webp', 'SunFlower', 280000.00, 250000.00, 2, 'active', 0, 'Hoa Hướng Dương Mini - Tươi Tắn Năng Động | HoaShop', 'Bó hoa hướng dương mini tươi tắn, mang năng lượng tích cực. Màu vàng rực rỡ, giá ưu đãi.', 'hoa hướng dương mini, tươi tắn, năng động, màu vàng', 'hoa-huong-duong-mini', 40, 8),
(17, 'SKU537661886', 'hoa cuc', 'cuc hoa aiuuu diep ', '/images/products/product-1750598553683-32833951.webp', 'cucuc', 800000.00, 600000.00, 1, 'active', 0, 'hoa cuc - Chất Lượng Cao | HoaShop', 'hoa cuc dep sieu nhan', 'hoa cuc ', 'hoa-cuc', 1000, 5),
(18, 'SKU438299495', 'hoa huệ ', 'hoa huệ hoa huệ hoa huệ hoa huệ hoa huệ ', '/images/products/product-1750605448325-580859059.webp', 'hoa huệ ', 888888.00, 777777.00, 3, 'active', 0, 'h - Chất Lượng Cao | HoaShop', NULL, NULL, 'hoa-hue', 0, 5);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `voucher`
--

CREATE TABLE `voucher` (
  `id_voucher` int(11) NOT NULL,
  `maVoucher` varchar(100) DEFAULT NULL,
  `giaTriGiam` decimal(10,2) DEFAULT NULL,
  `dieuKienApDung` text DEFAULT NULL,
  `ngayBatDau` datetime DEFAULT NULL,
  `ngayHetHan` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `chitietdonhang`
--
ALTER TABLE `chitietdonhang`
  ADD PRIMARY KEY (`id_ChiTietDH`),
  ADD KEY `id_SanPham` (`id_SanPham`),
  ADD KEY `id_DonHang` (`id_DonHang`);

--
-- Chỉ mục cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  ADD PRIMARY KEY (`id_DanhGia`),
  ADD KEY `id_ChiTietDH` (`id_ChiTietDH`);

--
-- Chỉ mục cho bảng `danhmuc`
--
ALTER TABLE `danhmuc`
  ADD PRIMARY KEY (`id_DanhMuc`);

--
-- Chỉ mục cho bảng `danhmucchitiet`
--
ALTER TABLE `danhmucchitiet`
  ADD PRIMARY KEY (`id_DanhMucChiTiet`),
  ADD KEY `id_DanhMuc` (`id_DanhMuc`);

--
-- Chỉ mục cho bảng `donhang`
--
ALTER TABLE `donhang`
  ADD PRIMARY KEY (`id_DonHang`),
  ADD KEY `id_NguoiDung` (`id_NguoiDung`),
  ADD KEY `id_voucher` (`id_voucher`);

--
-- Chỉ mục cho bảng `don_hang_nhanh`
--
ALTER TABLE `don_hang_nhanh`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_maDonNhanh` (`maDonNhanh`),
  ADD KEY `idx_trangThai` (`trangThai`),
  ADD KEY `idx_soDienThoai` (`soDienThoai`),
  ADD KEY `idx_priority_created` (`priority`,`createdAt`),
  ADD KEY `idx_maSanPham` (`maSanPham`),
  ADD KEY `idx_phone_product_time` (`soDienThoai`,`maSanPham`,`createdAt`),
  ADD KEY `idx_staff_processing` (`nhanVienXuLy`,`trangThai`);

--
-- Chỉ mục cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  ADD PRIMARY KEY (`id_NguoiDung`);

--
-- Chỉ mục cho bảng `quick_orders`
--
ALTER TABLE `quick_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_maDonNhanh` (`maDonNhanh`),
  ADD KEY `idx_trangThai` (`trangThai`),
  ADD KEY `idx_soDienThoai` (`soDienThoai`),
  ADD KEY `idx_priority_created` (`priority`,`createdAt`),
  ADD KEY `idx_maSanPham` (`maSanPham`),
  ADD KEY `idx_phone_product_time` (`soDienThoai`,`maSanPham`,`createdAt`),
  ADD KEY `idx_staff_processing` (`nhanVienXuLy`,`trangThai`);

--
-- Chỉ mục cho bảng `sanpham`
--
ALTER TABLE `sanpham`
  ADD PRIMARY KEY (`id_SanPham`),
  ADD UNIQUE KEY `maSKU` (`maSKU`),
  ADD KEY `id_DanhMucChiTiet` (`id_DanhMucChiTiet`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_seo_title` (`seoTitle`),
  ADD KEY `idx_stock` (`soLuongTon`);

--
-- Chỉ mục cho bảng `voucher`
--
ALTER TABLE `voucher`
  ADD PRIMARY KEY (`id_voucher`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `chitietdonhang`
--
ALTER TABLE `chitietdonhang`
  MODIFY `id_ChiTietDH` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  MODIFY `id_DanhGia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `danhmuc`
--
ALTER TABLE `danhmuc`
  MODIFY `id_DanhMuc` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `danhmucchitiet`
--
ALTER TABLE `danhmucchitiet`
  MODIFY `id_DanhMucChiTiet` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `donhang`
--
ALTER TABLE `donhang`
  MODIFY `id_DonHang` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `don_hang_nhanh`
--
ALTER TABLE `don_hang_nhanh`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  MODIFY `id_NguoiDung` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `quick_orders`
--
ALTER TABLE `quick_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `sanpham`
--
ALTER TABLE `sanpham`
  MODIFY `id_SanPham` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT cho bảng `voucher`
--
ALTER TABLE `voucher`
  MODIFY `id_voucher` int(11) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `chitietdonhang`
--
ALTER TABLE `chitietdonhang`
  ADD CONSTRAINT `chitietdonhang_ibfk_1` FOREIGN KEY (`id_SanPham`) REFERENCES `sanpham` (`id_SanPham`) ON DELETE CASCADE,
  ADD CONSTRAINT `chitietdonhang_ibfk_2` FOREIGN KEY (`id_DonHang`) REFERENCES `donhang` (`id_DonHang`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  ADD CONSTRAINT `danhgia_ibfk_1` FOREIGN KEY (`id_ChiTietDH`) REFERENCES `chitietdonhang` (`id_ChiTietDH`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `danhmucchitiet`
--
ALTER TABLE `danhmucchitiet`
  ADD CONSTRAINT `danhmucchitiet_ibfk_1` FOREIGN KEY (`id_DanhMuc`) REFERENCES `danhmuc` (`id_DanhMuc`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `donhang`
--
ALTER TABLE `donhang`
  ADD CONSTRAINT `donhang_ibfk_1` FOREIGN KEY (`id_NguoiDung`) REFERENCES `nguoidung` (`id_NguoiDung`) ON DELETE CASCADE,
  ADD CONSTRAINT `donhang_ibfk_2` FOREIGN KEY (`id_voucher`) REFERENCES `voucher` (`id_voucher`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `sanpham`
--
ALTER TABLE `sanpham`
  ADD CONSTRAINT `sanpham_ibfk_1` FOREIGN KEY (`id_DanhMucChiTiet`) REFERENCES `danhmucchitiet` (`id_DanhMucChiTiet`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
