/**
 * Migration Script - Thêm cột trangThai và dữ liệu mẫu
 */

require('dotenv').config();
const { sequelize } = require('./models');
const { QueryTypes } = require('sequelize');

async function runMigration() {
  try {
    console.log('🚀 Bắt đầu migration...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công');
    
    // 1. Thêm cột trangThai nếu chưa có
    try {
      console.log('📝 Thêm cột trangThai...');
      await sequelize.query(`
        ALTER TABLE \`sanpham\` 
        ADD COLUMN \`trangThai\` VARCHAR(20) DEFAULT 'active' 
        AFTER \`id_DanhMucChiTiet\`
      `, { type: QueryTypes.RAW });
      console.log('✅ Đã thêm cột trangThai');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('ℹ️ Cột trangThai đã tồn tại');
      } else {
        console.error('❌ Lỗi thêm cột:', error.message);
        throw error;
      }
    }
    
    // 2. Cập nhật tất cả sản phẩm hiện tại về trạng thái active
    console.log('📝 Cập nhật trạng thái sản phẩm...');
    await sequelize.query(`
      UPDATE \`sanpham\` SET \`trangThai\` = 'active' WHERE \`trangThai\` IS NULL
    `, { type: QueryTypes.UPDATE });
    console.log('✅ Đã cập nhật trạng thái sản phẩm hiện tại');
    
    // 2.5. Thêm cột số lượng tồn kho nếu chưa có
    try {
      console.log('📦 Thêm cột quản lý kho...');
      await sequelize.query(`
        ALTER TABLE \`sanpham\` 
        ADD COLUMN \`soLuongTon\` INT NOT NULL DEFAULT 0 COMMENT 'Số lượng tồn kho',
        ADD COLUMN \`soLuongToiThieu\` INT NOT NULL DEFAULT 5 COMMENT 'Số lượng tồn kho tối thiểu để cảnh báo'
      `, { type: QueryTypes.RAW });
      console.log('✅ Đã thêm cột quản lý kho');
      
      // Cập nhật stock cho sản phẩm hiện tại
      console.log('📦 Cập nhật số lượng tồn kho...');
      await sequelize.query(`
        UPDATE \`sanpham\` 
        SET 
          \`soLuongTon\` = FLOOR(RAND() * 100) + 10,
          \`soLuongToiThieu\` = 5
        WHERE \`soLuongTon\` = 0
      `, { type: QueryTypes.UPDATE });
      console.log('✅ Đã cập nhật số lượng tồn kho');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('ℹ️ Cột quản lý kho đã tồn tại');
      } else {
        console.error('❌ Lỗi thêm cột kho:', error.message);
        throw error;
      }
    }
    
    // 3. Thêm dữ liệu mẫu nếu bảng trống
    const productCount = await sequelize.query(`
      SELECT COUNT(*) as count FROM \`sanpham\`
    `, { type: QueryTypes.SELECT });
    
    console.log(`📊 Số sản phẩm hiện tại: ${productCount[0].count}`);
    
    if (productCount[0].count === 0) {
      console.log('📦 Thêm dữ liệu mẫu...');
      
      // Thêm sản phẩm mẫu
      await sequelize.query(`
        INSERT INTO \`sanpham\` 
        (\`maSKU\`, \`tenSp\`, \`moTa\`, \`hinhAnh\`, \`thuongHieu\`, \`gia\`, \`giaKhuyenMai\`, \`id_DanhMucChiTiet\`, \`trangThai\`) 
        VALUES 
        ('SP001', 'Bó hoa hồng đỏ cao cấp', 'Bó hoa hồng đỏ tươi 12 bông, ý nghĩa tình yêu', '/images/products/ho-hong-do.jpg', 'FlowerCorner', 450000, 399000, 1, 'active'),
        ('SP002', 'Lẵng hoa cúc vàng', 'Lẵng hoa cúc vàng tươi, mang lại niềm vui', '/images/products/cuc-vang.jpg', 'FlowerCorner', 350000, NULL, 2, 'active'),
        ('SP003', 'Giỏ hoa khai trương', 'Giỏ hoa chúc mừng khai trương phát đạt', '/images/products/gio-khai-truong.jpg', 'FlowerCorner', 800000, 750000, 3, 'active'),
        ('SP004', 'Bó hoa tulip đỏ', 'Bó hoa tulip đỏ nhập khẩu Hà Lan', '/images/products/tulip-do.jpg', 'Holland Flowers', 650000, NULL, 1, 'active'),
        ('SP005', 'Hoa baby thơm', 'Hoa baby trắng thơm ngát, trang trí đẹp', '/images/products/baby-trang.jpg', 'VietFlower', 120000, 100000, 2, 'hidden'),
        ('SP006', 'Lan hồ điệp tím', 'Chậu lan hồ điệp tím cao cấp', '/images/products/lan-ho-diep.jpg', 'OrchidVN', 1200000, NULL, 4, 'active')
      `, { type: QueryTypes.INSERT });
      
      console.log('✅ Đã thêm 6 sản phẩm mẫu');
    }
    
    // 4. Show final table structure
    const columns = await sequelize.query(`
      SHOW COLUMNS FROM \`sanpham\`
    `, { type: QueryTypes.SELECT });
    
    console.log('📋 Cấu trúc bảng sanpham:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'} ${col.Default ? `default: ${col.Default}` : ''}`);
    });
    
    console.log('🎉 Migration hoàn thành!');
    
  } catch (error) {
    console.error('❌ Lỗi migration:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Chạy migration
runMigration(); 