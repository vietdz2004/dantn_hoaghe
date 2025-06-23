const { Sequelize } = require('sequelize');

// Khởi tạo Sequelize với thông tin từ biến môi trường
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
  }
);

// Export both default and named exports for compatibility
module.exports = sequelize;
module.exports.sequelize = sequelize; 