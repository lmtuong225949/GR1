const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Lấy SECRET từ biến môi trường
const SECRET = process.env.JWT_SECRET || 'mysecret';

// Middleware kiểm tra token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: 'Thiếu token' });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token không hợp lệ' });
    req.user = user;
    next();
  });
};

// Middleware phân quyền
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    next();
  };
};

// ========== Đăng nhập ==========
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ message: 'Tài khoản không tồn tại' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Sai mật khẩu' });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1d' });

    res.json({ message: 'Đăng nhập thành công', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// ========== Đăng ký ==========
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
      [username, hashedPassword, role]
    );
    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi hệ thống khi đăng ký' });
  }
});

// ========== Route kiểm tra người dùng ==========
router.get('/me', authenticateToken, (req, res) => {
  res.json({ message: 'Bạn đã xác thực thành công', user: req.user });
});

// ========== Route chỉ ADMIN truy cập ==========
router.get('/admin', authenticateToken, authorizeRoles('ADMIN'), (req, res) => {
  res.json({ message: 'Xin chào ADMIN!' });
});

module.exports = router;
