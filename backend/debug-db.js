const mysql = require('mysql2/promise');

async function debugDatabase() {
  let connection;
  
  try {
    console.log('🔍 Debug database connection...');
    
    // Connect to MySQL
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: ''
    });
    
    console.log('✅ MySQL connected');
    
    // Check databases
    const [databases] = await connection.query('SHOW DATABASES');
    console.log('📋 Available databases:');
    databases.forEach(db => console.log(`  - ${db.Database}`));
    
    // Use hoanghe database
    await connection.query('USE hoanghe');
    console.log('✅ Using hoanghe database');
    
    // Check tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`📋 Tables in hoanghe (${tables.length}):`)
    tables.forEach(table => console.log(`  - ${Object.values(table)[0]}`));
    
    if (tables.length === 0) {
      console.log('❌ No tables found! Creating basic danhmuc table...');
      
      await connection.query(`
        CREATE TABLE danhmuc (
          id_DanhMuc int(11) NOT NULL AUTO_INCREMENT,
          tenDanhMuc varchar(255) DEFAULT NULL,
          PRIMARY KEY (id_DanhMuc)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
      `);
      
      await connection.query(`
        INSERT INTO danhmuc (tenDanhMuc) VALUES 
        ('Hoa Sinh Nhật'),
        ('Hoa Chúc Mừng'),
        ('Hoa Tình Yêu')
      `);
      
      console.log('✅ Created danhmuc table with sample data');
    }
    
    // Test categories
    const [categories] = await connection.query('SELECT * FROM danhmuc LIMIT 3');
    console.log('📋 Sample categories:');
    categories.forEach(cat => console.log(`  - ${cat.id_DanhMuc}: ${cat.tenDanhMuc}`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

debugDatabase(); 