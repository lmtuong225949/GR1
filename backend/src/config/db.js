const { Pool } = require('pg');
require('dotenv').config(); // Để sử dụng biến môi trường từ .env

// Khởi tạo kết nối với PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Kiểm tra kết nối
pool.connect()
  .then(() => console.log('Kết nối cơ sở dữ liệu thành công!'))
  .catch((err) => console.error('Lỗi kết nối cơ sở dữ liệu:', err.stack));

module.exports = {
  query: (text, params) => pool.query(text, params),
};
