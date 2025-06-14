const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Yêu cầu đăng nhập" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || !decoded.role || !decoded.id) {
      return res.status(403).json({ message: "Token không hợp lệ: Thiếu thông tin cần thiết" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Lỗi xác thực token:", err);
    res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

module.exports = verifyToken;
