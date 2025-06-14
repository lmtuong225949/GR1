// src/scripts/hashPasswords.js
const bcrypt = require('bcrypt');
const db = require('../config/db'); // pool mysql2 promise

async function hashAll() {
  try {
    // Lấy tất cả người dùng có password chưa được hash
    const [rows] = await db.query('SELECT id, passwordhash FROM taikhoan');
    for (const row of rows) {
      const raw = row.passwordhash;
      // Bỏ qua nếu đã có định dạng bcrypt (thường bắt đầu bằng "$2b$")
      if (raw.startsWith('$2b$') || raw.startsWith('$2a$')) {
        console.log(`User ID ${row.id} đã được hash, bỏ qua.`);
        continue;
      }

      const hashed = await bcrypt.hash(raw, 10);
      await db.query('UPDATE taikhoan SET passwordhash = ? WHERE id = ?', [
        hashed,
        row.id
      ]);
      console.log(`Đã hash password cho user ID ${row.id}`);
    }
    console.log('Hoàn tất hash tất cả mật khẩu.');
    process.exit(0);
  } catch (err) {
    console.error('Error khi hash passwords:', err);
    process.exit(1);
  }
}

hashAll();
