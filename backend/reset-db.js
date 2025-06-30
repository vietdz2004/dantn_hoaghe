const mysql = require('mysql2/promise');

async function resetDatabase() {
  let connection;
  
  try {
    console.log('🔄 Resetting database...');
    
    // Connect to MySQL (no database selected)
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: ''
    });
    
    // Drop and recreate database
    console.log('🗑️ Dropping existing database...');
    await connection.query('DROP DATABASE IF EXISTS hoanghe');
    
    console.log('🔨 Creating fresh database...');
    await connection.query('CREATE DATABASE hoanghe CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci');
    
    await connection.query('USE hoanghe');
    
    // Create basic tables only
    console.log('📋 Creating essential tables...');
    
    // 1. Categories table
    await connection.query(`
      CREATE TABLE danhmuc (
        id_DanhMuc int(11) NOT NULL AUTO_INCREMENT,
        tenDanhMuc varchar(255) DEFAULT NULL,
        PRIMARY KEY (id_DanhMuc)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('  ✅ danhmuc table created');
    
    // 2. Subcategories table
    await connection.query(`
      CREATE TABLE danhmucchitiet (
        id_DanhMucChiTiet int(11) NOT NULL AUTO_INCREMENT,
        id_DanhMuc int(11) DEFAULT NULL,
        tenDanhMucChiTiet varchar(255) DEFAULT NULL,
        PRIMARY KEY (id_DanhMucChiTiet),
        KEY id_DanhMuc (id_DanhMuc)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('  ✅ danhmucchitiet table created');
    
    // 3. Products table (simplified)
    await connection.query(`
      CREATE TABLE sanpham (
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
        soLuongTon int(11) NOT NULL DEFAULT 0,
        soLuongToiThieu int(11) NOT NULL DEFAULT 5,
        PRIMARY KEY (id_SanPham),
        UNIQUE KEY maSKU (maSKU),
        KEY id_DanhMucChiTiet (id_DanhMucChiTiet)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('  ✅ sanpham table created');
    
    // Insert sample data
    console.log('📦 Inserting sample data...');
    
    await connection.query(`
      INSERT INTO danhmuc (id_DanhMuc, tenDanhMuc) VALUES 
      (1, 'Hoa Sinh Nhật'),
      (2, 'Hoa Chúc Mừng'),
      (4, 'Hoa Tình Yêu'),
      (5, 'Hoa Khai Trương'),
      (6, 'Hoa Tang Lễ'),
      (7, 'Hoa Tổng Hợp')
    `);
    console.log('  ✅ Categories inserted');
    
    await connection.query(`
      INSERT INTO danhmucchitiet (id_DanhMucChiTiet, id_DanhMuc, tenDanhMucChiTiet) VALUES 
      (1, 1, 'Hoa Hồng'),
      (2, 1, 'Hoa Cúc'),
      (3, 2, 'Hoa Khai Trương'),
      (4, 2, 'Hoa Sự Kiện')
    `);
    console.log('  ✅ Subcategories inserted');
    
    await connection.query(`
      INSERT INTO sanpham (id_SanPham, maSKU, tenSp, moTa, hinhAnh, thuongHieu, gia, giaKhuyenMai, id_DanhMucChiTiet, trangThai, soLuongTon, soLuongToiThieu) VALUES 
      (10, 'SKU001', 'Bó hoa hồng đỏ cao cấp', 'Bó hoa hồng đỏ tươi 12 bông', '/images/products/daisy.jpg', 'FlowerCorner', 450000.00, 399000.00, 1, 'active', 50, 5),
      (11, 'SKU002', 'Lẵng hoa cúc vàng tươi', 'Lẵng hoa cúc vàng tươi mang lại niềm vui', '/images/products/event.jpg', 'FlowerCorner', 350000.00, NULL, 2, 'active', 30, 3),
      (12, 'SKU003', 'Giỏ hoa khai trương', 'Giỏ hoa chúc mừng khai trương', '/images/products/product-1750594227200-929108794.webp', 'FlowerCorner', 800000.00, 750000.00, 3, 'active', 15, 2)
    `);
    console.log('  ✅ Products inserted');
    
    // Verify
    const [categories] = await connection.query('SELECT COUNT(*) as count FROM danhmuc');
    const [products] = await connection.query('SELECT COUNT(*) as count FROM sanpham');
    
    console.log(`✅ ${categories[0].count} categories`);
    console.log(`✅ ${products[0].count} products`);
    console.log('🎉 Database reset successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetDatabase(); 