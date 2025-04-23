const express = require('express');
const dotenv = require('dotenv');
const db = require('./config/db');
const authRoutes = require('./routes/users');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use('/api/users', authRoutes);

// Test API lấy danh sách giáo viên
app.get('/teachers', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Giao_vien');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi truy vấn');
  }
});

// Test root
app.get('/', (req, res) => {
  res.send('Chào mừng đến với hệ thống quản lý giáo viên!');
});

// Tạo bảng nếu chưa có
async function createTableIfNotExists() {
  const query = `
    CREATE TABLE IF NOT EXISTS Giao_vien (
      id VARCHAR(10) PRIMARY KEY,
      ten VARCHAR(50),
      ho VARCHAR(50),
      gioi_tinh VARCHAR(10),
      chuyen_mon VARCHAR(100),
      sdt VARCHAR(15),
      email VARCHAR(100),
      chuc_vu VARCHAR(100)
    );
  `;
  try {
    await db.query(query);
    console.log("✅ Bảng 'Giao_vien' đã sẵn sàng.");
  } catch (err) {
    console.error("❌ Lỗi khi tạo bảng:", err);
  }
}

async function startServer() {
  await createTableIfNotExists();
  app.listen(port, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
  });
}

// 👉 Export để index.js gọi
module.exports = { startServer };
