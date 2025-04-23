const jwt = require('jsonwebtoken');
const SECRET = 'mysecret'; // tốt nhất lấy từ process.env

// Xác thực token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Token không hợp lệ

    req.user = user; // { id, role }
    next();
  });
};

// Kiểm tra role cụ thể
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};
