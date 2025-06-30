const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '', // Update this if you have a password
  multipleStatements: true
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔄 Đang kết nối MySQL...');
    
    // Connect to MySQL (without database)
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Kết nối MySQL thành công!');
    
    // Create database if not exists
    console.log('🔄 Tạo database hoanghe...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS hoanghe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Database hoanghe đã được tạo!');
    
    // Use the database
    await connection.query('USE hoanghe');
    
    // Read and execute SQL file
    console.log('🔄 Đang import dữ liệu...');
    const sqlFile = path.join(__dirname, 'data', 'hoanghe.sql');
    
    if (!fs.existsSync(sqlFile)) {
      throw new Error('Không tìm thấy file hoanghe.sql');
    }
    
    // Execute the entire SQL file as a multi-statement query
    console.log('📋 Đang đọc file SQL...');
    const sqlData = fs.readFileSync(sqlFile, 'utf8');
    
    // Remove SQL comments and unnecessary statements
    const cleanedSQL = sqlData
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/--.*$/gm, '') // Remove single-line comments
      .replace(/^\s*SET\s+.*$/gmi, '') // Remove SET statements
      .replace(/^\s*START TRANSACTION\s*;?\s*$/gmi, '') // Remove START TRANSACTION
      .replace(/^\s*COMMIT\s*;?\s*$/gmi, '') // Remove COMMIT
      .replace(/!\d+/g, '') // Remove MySQL version comments like /*!40101
      .trim();
    
    console.log('🔄 Thực hiện các câu lệnh SQL...');
    
    try {
      // Execute as multiStatements
      await connection.query({
        sql: cleanedSQL,
        multipleStatements: true
      });
      console.log('✅ Đã import toàn bộ dữ liệu thành công!');
    } catch (err) {
      console.error('❌ Lỗi khi import SQL file:', err.message);
      
      // Fallback: Execute statement by statement
      console.log('🔄 Thử thực hiện từng câu lệnh...');
      const statements = cleanedSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      let successCount = 0;
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        
        try {
          await connection.query(statement);
          successCount++;
          if (i % 10 === 0) {
            console.log(`⏳ Đã thực hiện ${successCount}/${statements.length} statements...`);
          }
        } catch (stmtErr) {
          if (!stmtErr.message.includes('already exists') && 
              !stmtErr.message.includes('Duplicate entry') &&
              !stmtErr.message.includes('Duplicate key name')) {
            console.log(`⚠️ Bỏ qua lỗi: ${stmtErr.message.substring(0, 100)}...`);
          } else {
            successCount++;
          }
        }
      }
      console.log(`✅ Đã thực hiện thành công ${successCount}/${statements.length} statements`);
    }
    
    // Verify import
    console.log('🔍 Kiểm tra dữ liệu...');
    
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Đã tạo ${tables.length} bảng`);
    
    const [categories] = await connection.execute('SELECT COUNT(*) as count FROM danhmuc');
    console.log(`✅ Danh mục: ${categories[0].count} items`);
    
    const [products] = await connection.execute('SELECT COUNT(*) as count FROM sanpham');
    console.log(`✅ Sản phẩm: ${products[0].count} items`);
    
    console.log('🎉 Import database thành công!');
    
  } catch (error) {
    console.error('❌ Lỗi setup database:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🚫 MySQL Server chưa chạy. Vui lòng:');
      console.error('   1. Mở XAMPP/WAMP và start MySQL');
      console.error('   2. Hoặc start MySQL service trong services.msc');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🚫 Lỗi đăng nhập MySQL. Vui lòng:');
      console.error('   1. Kiểm tra username/password trong config');
      console.error('   2. Cập nhật password trong script này');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run setup
setupDatabase(); 