const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: ''
};

async function quickSetup() {
  let connection;
  
  try {
    console.log('🔄 Kết nối MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Kết nối thành công!');
    
    // Create database
    await connection.query('CREATE DATABASE IF NOT EXISTS hoanghe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await connection.query('USE hoanghe');
    console.log('✅ Database hoanghe ready!');
    
    // 1. Create tables
    console.log('🔄 Tạo các bảng...');
    
    const tables = [
      `CREATE TABLE IF NOT EXISTS danhmuc (
        id_DanhMuc int(11) NOT NULL AUTO_INCREMENT,
        tenDanhMuc varchar(255) DEFAULT NULL,
        PRIMARY KEY (id_DanhMuc)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,
      
      `CREATE TABLE IF NOT EXISTS danhmucchitiet (
        id_DanhMucChiTiet int(11) NOT NULL AUTO_INCREMENT,
        id_DanhMuc int(11) DEFAULT NULL,
        tenDanhMucChiTiet varchar(255) DEFAULT NULL,
        PRIMARY KEY (id_DanhMucChiTiet),
        KEY id_DanhMuc (id_DanhMuc),
        CONSTRAINT danhmucchitiet_ibfk_1 FOREIGN KEY (id_DanhMuc) REFERENCES danhmuc (id_DanhMuc) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,
      
      `CREATE TABLE IF NOT EXISTS sanpham (
        id_SanPham int(11) NOT NULL AUTO_INCREMENT,
        maSKU varchar(100) DEFAULT NULL,
        tenSp varchar(255) DEFAULT NULL,
        moTa text DEFAULT NULL,
        hinhAnh varchar(255) DEFAULT NULL,
        thuongHieu varchar(255) DEFAULT NULL,
        gia decimal(10,2) DEFAULT NULL,
        giaKhuyenMai decimal(10,2) DEFAULT NULL,
        id_DanhMucChiTiet int(11) DEFAULT NULL,
        trangThai varchar(20) DEFAULT 'active',
        soLuong int(11) NOT NULL DEFAULT 0,
        seoTitle varchar(255) DEFAULT NULL,
        seoDescription text DEFAULT NULL,
        seoKeywords text DEFAULT NULL,
        slug varchar(255) DEFAULT NULL,
        soLuongTon int(11) NOT NULL DEFAULT 0,
        soLuongToiThieu int(11) NOT NULL DEFAULT 5,
        PRIMARY KEY (id_SanPham),
        UNIQUE KEY maSKU (maSKU),
        KEY id_DanhMucChiTiet (id_DanhMucChiTiet),
        CONSTRAINT sanpham_ibfk_1 FOREIGN KEY (id_DanhMucChiTiet) REFERENCES danhmucchitiet (id_DanhMucChiTiet) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,
      
      `CREATE TABLE IF NOT EXISTS nguoidung (
        id_NguoiDung int(11) NOT NULL AUTO_INCREMENT,
        tenDangNhap varchar(255) DEFAULT NULL,
        matKhau varchar(255) DEFAULT NULL,
        ten varchar(255) DEFAULT NULL,
        diaChi varchar(255) DEFAULT NULL,
        soDienThoai varchar(20) DEFAULT NULL,
        email varchar(255) DEFAULT NULL,
        vaiTro varchar(50) DEFAULT NULL,
        trangThai varchar(50) DEFAULT NULL,
        ngayTao datetime DEFAULT current_timestamp(),
        PRIMARY KEY (id_NguoiDung)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,
      
      `CREATE TABLE IF NOT EXISTS voucher (
        id_voucher int(11) NOT NULL AUTO_INCREMENT,
        maVoucher varchar(100) DEFAULT NULL,
        giaTriGiam decimal(10,2) DEFAULT NULL,
        dieuKienApDung text DEFAULT NULL,
        ngayBatDau datetime DEFAULT NULL,
        ngayHetHan datetime DEFAULT NULL,
        PRIMARY KEY (id_voucher)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,
      
      `CREATE TABLE IF NOT EXISTS donhang (
        id_DonHang int(11) NOT NULL AUTO_INCREMENT,
        id_NguoiDung int(11) DEFAULT NULL,
        id_voucher int(11) DEFAULT NULL,
        ngayDatHang datetime DEFAULT current_timestamp(),
        phuongThucThanhToan varchar(100) DEFAULT NULL,
        soLuong int(11) DEFAULT NULL,
        tongThanhToan decimal(10,2) DEFAULT NULL,
        phiVanChuyen decimal(10,2) DEFAULT NULL,
        trangThaiDonHang varchar(100) DEFAULT NULL,
        PRIMARY KEY (id_DonHang),
        KEY id_NguoiDung (id_NguoiDung),
        KEY id_voucher (id_voucher),
        CONSTRAINT donhang_ibfk_1 FOREIGN KEY (id_NguoiDung) REFERENCES nguoidung (id_NguoiDung) ON DELETE CASCADE,
        CONSTRAINT donhang_ibfk_2 FOREIGN KEY (id_voucher) REFERENCES voucher (id_voucher) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,
      
      `CREATE TABLE IF NOT EXISTS chitietdonhang (
        id_ChiTietDH int(11) NOT NULL AUTO_INCREMENT,
        id_SanPham int(11) DEFAULT NULL,
        id_DonHang int(11) DEFAULT NULL,
        soLuongMua int(11) DEFAULT NULL,
        thanhTien decimal(10,2) DEFAULT NULL,
        donGiaLucMua decimal(10,2) DEFAULT NULL,
        PRIMARY KEY (id_ChiTietDH),
        KEY id_SanPham (id_SanPham),
        KEY id_DonHang (id_DonHang),
        CONSTRAINT chitietdonhang_ibfk_1 FOREIGN KEY (id_SanPham) REFERENCES sanpham (id_SanPham) ON DELETE CASCADE,
        CONSTRAINT chitietdonhang_ibfk_2 FOREIGN KEY (id_DonHang) REFERENCES donhang (id_DonHang) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,
      
      `CREATE TABLE IF NOT EXISTS danhgia (
        id_DanhGia int(11) NOT NULL AUTO_INCREMENT,
        id_ChiTietDH int(11) DEFAULT NULL,
        noiDung text DEFAULT NULL,
        danhGiaSao int(11) DEFAULT NULL,
        ngayDanhGia datetime DEFAULT current_timestamp(),
        PRIMARY KEY (id_DanhGia),
        KEY id_ChiTietDH (id_ChiTietDH),
        CONSTRAINT danhgia_ibfk_1 FOREIGN KEY (id_ChiTietDH) REFERENCES chitietdonhang (id_ChiTietDH) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,
      
      `CREATE TABLE IF NOT EXISTS quick_orders (
        id int(11) NOT NULL AUTO_INCREMENT,
        maDonNhanh varchar(20) NOT NULL,
        tenKhachHang varchar(100) NOT NULL,
        soDienThoai varchar(15) NOT NULL,
        maSanPham int(11) NOT NULL,
        tenSanPham varchar(200) NOT NULL,
        soLuong int(11) DEFAULT 1,
        giaTaiThoiDiem decimal(10,2) NOT NULL,
        tongTien decimal(10,2) NOT NULL,
        trangThai enum('CHO_XU_LY','DA_LIEN_HE','DA_XAC_NHAN','DANG_GIAO','HOAN_THANH','HUY') DEFAULT 'CHO_XU_LY',
        ghiChu text DEFAULT NULL,
        nhanVienXuLy int(11) DEFAULT NULL,
        thoiGianLienHe datetime DEFAULT NULL,
        diaChiGiao text DEFAULT NULL,
        thoiGianGiao datetime DEFAULT NULL,
        priority int(11) DEFAULT 5,
        createdAt datetime NOT NULL DEFAULT current_timestamp(),
        updatedAt datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (id),
        UNIQUE KEY uq_maDonNhanh (maDonNhanh)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    ];
    
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      try {
        await connection.query(table);
        const tableName = table.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];
        console.log(`  ✅ Tạo bảng ${tableName}`);
      } catch (err) {
        console.error(`  ❌ Lỗi tạo bảng: ${err.message}`);
      }
    }
    console.log('✅ Hoàn thành tạo bảng!');
    
    // 2. Insert sample data
    console.log('🔄 Thêm dữ liệu mẫu...');
    
    try {
      // Categories
      await connection.query(`INSERT IGNORE INTO danhmuc (id_DanhMuc, tenDanhMuc) VALUES 
        (1, 'Hoa Sinh Nhật'),
        (2, 'Hoa Chúc Mừng'),
        (4, 'Hoa Tình Yêu'),
        (5, 'Hoa Khai Trương'),
        (6, 'Hoa Tang Lễ'),
        (7, 'Hoa Tổng Hợp')`);
      console.log('  ✅ Thêm danh mục');
      
      // Subcategories
      await connection.query(`INSERT IGNORE INTO danhmucchitiet (id_DanhMucChiTiet, id_DanhMuc, tenDanhMucChiTiet) VALUES 
        (1, 1, 'Hoa Hồng'),
        (2, 1, 'Hoa Cúc'),
        (3, 2, 'Hoa Khai Trương'),
        (4, 2, 'Hoa Sự Kiện')`);
      console.log('  ✅ Thêm danh mục chi tiết');
      
      // Products
      await connection.query(`INSERT IGNORE INTO sanpham (id_SanPham, maSKU, tenSp, moTa, hinhAnh, thuongHieu, gia, giaKhuyenMai, id_DanhMucChiTiet, trangThai, soLuong, seoTitle, seoDescription, seoKeywords, slug, soLuongTon, soLuongToiThieu) VALUES 
        (10, 'SKU001', 'Bó hoa hồng đỏ cao cấp', 'Bó hoa hồng đỏ tươi 12 bông, ý nghĩa tình yêu hoàn hảo', '/images/products/daisy.jpg', 'FlowerCorner', 450000.00, 399000.00, 1, 'active', 0, 'Bó Hoa Hồng Đỏ Cao Cấp - Tặng Người Yêu | HoaShop', 'Bó hoa hồng đỏ tươi 12 bông biểu tượng tình yêu. Chất lượng cao, giao hàng nhanh, giá tốt. Đặt ngay!', 'hoa hồng đỏ, hoa tươi, quà tặng, hoa sinh nhật, hoa valentine', 'bo-hoa-hong-do-cao-cap', 50, 5),
        (11, 'SKU002', 'Lẵng hoa cúc vàng tươi', 'Lẵng hoa cúc vàng tươi mang lại niềm vui và may mắn', '/images/products/event.jpg', 'FlowerCorner', 350000.00, NULL, 2, 'active', 0, 'Lẵng Hoa Cúc Vàng Tươi - Mang Lại May Mắn | HoaShop', 'Lẵng hoa cúc vàng tươi đẹp, mang ý nghĩa may mắn. Giao hàng tận nơi, chất lượng đảm bảo.', 'hoa cúc vàng, lẵng hoa, hoa tươi, may mắn, khai trương', 'lang-hoa-cuc-vang-tuoi', 30, 3),
        (12, 'SKU003', 'Giỏ hoa khai trương', 'Giỏ hoa chúc mừng khai trương phát đạt, thịnh vượng', '/images/products/product-1750594227200-929108794.webp', 'FlowerCorner', 800000.00, 750000.00, 3, 'active', 0, 'Giỏ Hoa Khai Trương - Chúc Mừng Thành Công | HoaShop', 'Giỏ hoa khai trương đẹp, ý nghĩa phát đạt thịnh vượng. Thiết kế hiện đại, giao hàng nhanh.', 'giỏ hoa khai trương, hoa chúc mừng, khai trương, phát đạt', 'gio-hoa-khai-truong', 15, 2),
        (13, 'SKU004', 'Bó hoa tulip đỏ nhập khẩu', 'Bó hoa tulip đỏ nhập khẩu Hà Lan cao cấp', '/images/products/rose.jpg', 'Holland Flowers', 650000.00, NULL, 1, 'active', 0, 'Bó Hoa Tulip Đỏ Nhập Khẩu Hà Lan | HoaShop', 'Hoa tulip đỏ nhập khẩu Hà Lan chính hãng. Chất lượng cao cấp, tươi lâu, giao hàng nhanh.', 'hoa tulip đỏ, nhập khẩu, hà lan, hoa cao cấp, quà tặng', 'bo-hoa-tulip-do-nhap-khau', 25, 5),
        (14, 'SKU005', 'Hoa baby trắng thơm', 'Hoa baby trắng thơm ngát, trang trí đẹp', '/images/products/product-1750598743293-184511824.webp', 'VietFlower', 120000.00, 100000.00, 2, 'active', 0, 'Hoa Baby Trắng Thơm - Trang Trí Đẹp | HoaShop', 'Hoa baby trắng thơm ngát, trang trí đẹp cho không gian. Giá ưu đãi, chất lượng tốt.', 'hoa baby trắng, hoa trang trí, thơm ngát, giá rẻ', 'hoa-baby-trang-thom', 0, 10),
        (15, 'SKU006', 'Chậu lan hồ điệp tím', 'Chậu lan hồ điệp tím cao cấp, sang trọng', '/images/products/product-1750598735349-755866346.webp', 'OrchidVN', 1200000.00, NULL, 4, 'active', 0, 'Chậu Lan Hồ Điệp Tím Cao Cấp - Sang Trọng | HoaShop', 'Lan hồ điệp tím cao cấp, sang trọng. Chậu đẹp, hoa to, màu sắc đẹp. Tặng kèm hướng dẫn chăm sóc.', 'lan hồ điệp tím, lan cao cấp, chậu hoa, sang trọng', 'chau-lan-ho-diep-tim', 8, 2),
        (16, 'SKU007', 'Hoa hướng dương mini', 'Bó hoa hướng dương mini tươi tắn, năng động', '/images/products/product-1750598726921-701225680.webp', 'SunFlower', 280000.00, 250000.00, 2, 'active', 0, 'Hoa Hướng Dương Mini - Tươi Tắn Năng Động | HoaShop', 'Bó hoa hướng dương mini tươi tắn, mang năng lượng tích cực. Màu vàng rực rỡ, giá ưu đãi.', 'hoa hướng dương mini, tươi tắn, năng động, màu vàng', 'hoa-huong-duong-mini', 40, 8),
        (17, 'SKU537661886', 'hoa cuc', 'cuc hoa aiuuu diep ', '/images/products/product-1750598553683-32833951.webp', 'cucuc', 800000.00, 600000.00, 1, 'active', 0, 'hoa cuc - Chất Lượng Cao | HoaShop', 'hoa cuc dep sieu nhan', 'hoa cuc ', 'hoa-cuc', 1000, 5),
        (18, 'SKU438299495', 'hoa huệ ', 'hoa huệ hoa huệ hoa huệ hoa huệ hoa huệ ', '/images/products/product-1750605448325-580859059.webp', 'hoa huệ ', 888888.00, 777777.00, 3, 'active', 0, 'h - Chất Lượng Cao | HoaShop', NULL, NULL, 'hoa-hue', 0, 5)`);
      console.log('  ✅ Thêm sản phẩm mẫu');
      
      console.log('✅ Dữ liệu mẫu đã được thêm!');
    } catch (insertError) {
      console.error('❌ Lỗi thêm dữ liệu:', insertError.message);
    }
    
    // Verify
    const [categories] = await connection.query('SELECT COUNT(*) as count FROM danhmuc');
    const [products] = await connection.query('SELECT COUNT(*) as count FROM sanpham');
    
    console.log(`✅ ${categories[0].count} danh mục`);
    console.log(`✅ ${products[0].count} sản phẩm`);
    console.log('🎉 Setup database hoàn tất!');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

quickSetup(); 