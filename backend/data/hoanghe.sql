-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th6 12, 2025 lúc 05:05 PM
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
(2, 'Hoa Chúc Mừng');

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
  `id_DanhMucChiTiet` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `sanpham`
--

INSERT INTO `sanpham` (`id_SanPham`, `maSKU`, `tenSp`, `moTa`, `hinhAnh`, `thuongHieu`, `gia`, `giaKhuyenMai`, `id_DanhMucChiTiet`) VALUES
(1, 'SKU001', 'Bó hoa hồng đỏ', 'Hoa hồng đỏ tươi, ý nghĩa tình yêu', 'rose.jpg', 'FlowerCorner', 500000.00, 450000.00, 1),
(2, 'SKU002', 'Lẵng hoa cúc vàng', 'Mang lại niềm vui, thành công', 'daisy.jpg', 'FlowerCorner', 600000.00, NULL, 2),
(3, 'SKU003', 'Giỏ hoa khai trương', 'Chúc khai trương phát đạt', 'event.jpg', 'FlowerCorner', 800000.00, 750000.00, 3);

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
-- Chỉ mục cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  ADD PRIMARY KEY (`id_NguoiDung`);

--
-- Chỉ mục cho bảng `sanpham`
--
ALTER TABLE `sanpham`
  ADD PRIMARY KEY (`id_SanPham`),
  ADD UNIQUE KEY `maSKU` (`maSKU`),
  ADD KEY `id_DanhMucChiTiet` (`id_DanhMucChiTiet`);

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
  MODIFY `id_DanhMuc` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `danhmucchitiet`
--
ALTER TABLE `danhmucchitiet`
  MODIFY `id_DanhMucChiTiet` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `donhang`
--
ALTER TABLE `donhang`
  MODIFY `id_DonHang` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  MODIFY `id_NguoiDung` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `sanpham`
--
ALTER TABLE `sanpham`
  MODIFY `id_SanPham` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
