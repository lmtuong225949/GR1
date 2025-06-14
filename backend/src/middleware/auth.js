// src/middleware/auth.js
const jwt = require('jsonwebtoken');

// Khóa bí mật JWT (phải trùng với khóa dùng ở AuthController)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

function authenticateToken(req, res, next) {
  // Lấy header: Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Thiếu token đăng nhập' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // decoded chứa payload, ví dụ: { id, username, role, magv, giaovienid, iat, exp }
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      // Gán magv hoặc giaovienid nếu có (để controller truy cập)
      magv: decoded.magv || decoded.giaovienid || null,
    };
    next();
  } catch (err) {
    console.error('authenticateToken error:', err);
    return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

module.exports = authenticateToken;
