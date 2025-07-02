const { sequelize } = require('./models');
const fs = require('fs');
const path = require('path');

async function runCartMigration() {
  try {
    console.log('🚀 Starting cart table migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', 'create_cart_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Execute migration
    await sequelize.query(migrationSQL);
    console.log('✅ Cart table created successfully');
    
    // Test the table by counting rows
    const [results] = await sequelize.query('SELECT COUNT(*) as count FROM giohang');
    console.log(`📊 Cart table initialized with ${results[0].count} records`);
    
    console.log('🎉 Cart migration completed successfully!');
    console.log('💡 You can now use database cart functionality');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Cart table already exists, migration skipped');
    } else {
      console.error('Full error:', error);
    }
  } finally {
    process.exit(0);
  }
}

// Run migration
runCartMigration(); 