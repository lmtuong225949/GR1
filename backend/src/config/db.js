const { Pool } = require('pg');
require('dotenv').config(); // Để sử dụng biến môi trường từ .env

// Khởi tạo kết nối với PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  client_encoding: 'UTF8',
  application_name: 'library-app',
  client_min_messages: 'warning',
  connectionString: `postgresql://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?client_encoding=UTF8&encoding=UTF8`
});

// Kiểm tra kết nối
pool.connect()
  .then(() => console.log('Kết nối cơ sở dữ liệu thành công!'))
  .catch((err) => console.error('Lỗi kết nối cơ sở dữ liệu:', err.stack));

module.exports = {
  query: (text, params) => pool.query(text, params),
};
