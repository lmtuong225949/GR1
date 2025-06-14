const jwt = require('jsonwebtoken');
const AccountModel = require('../models/AccountModel');
const LoginHistory = require('../models/LoginHistoryModel');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = '24h';

// Kiểm tra mật khẩu mạnh
function isStrongPassword(password) {
  return password.length >= 8;
}

const AuthController = {
  // Đăng nhập
  async login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Thiếu username hoặc password' });
      }

      const user = await AccountModel.findByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
      }

      const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
        magv: user.giaovienid || null,
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      await LoginHistory.addLoginHistory(user.id, req.ip);

      // Ensure mahs is always a string
      const mahs = user.mahs || '';

      const userInfo = {
        id: user.id,
        username: user.username,
        role: user.role,
        magv: user.giaovienid || '',
        mahs: mahs,
        email: user.email || ''
      };

      res.status(200).json({
        message: 'Đăng nhập thành công',
        accessToken: token,
        user: userInfo
      });
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập' });
    }
  },

  // Đăng ký
  async register(req, res) {
    try {
      const { username, password, role } = req.body;

      if (!username || !password || !role) {
        return res.status(400).json({ message: 'Thiếu thông tin đăng ký' });
      }

      if (!isStrongPassword(password)) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự' });
      }

      const existing = await AccountModel.findByUsername(username);
      if (existing) {
        return res.status(409).json({ message: 'Username đã tồn tại' });
      }

      const result = await AccountModel.createAccount(username, password, role);

      res.status(201).json({ message: 'Đăng ký thành công', insertedId: result.insertedId });
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký' });
    }
  },

  // Tạo tài khoản học sinh
  async createStudentAccount(req, res) {
    try {
      const { username, password, role, mahs, hoten, gioitinh, ngaysinh, diachi, sdt, email, lopid } = req.body;
      
      if (!username || !password || !role || !mahs || !hoten || !lopid) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
      }

      if (role !== 'student') {
        return res.status(400).json({ message: 'Vai trò phải là student' });
      }

      // Tạo học sinh trong bảng hocsinh trước
      const studentQuery = `
        INSERT INTO hocsinh (mahs, hoten, gioitinh, ngaysinh, diachi, sdt, email, lopid)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;

      await db.query(studentQuery, [mahs, hoten, gioitinh, ngaysinh, diachi, sdt, email, lopid]);

      // Sau đó tạo tài khoản
      const accountQuery = `
        INSERT INTO taikhoan (username, password, role, mahs)
        VALUES ($1, $2, $3, $4) RETURNING id
      `;

      const result = await db.query(accountQuery, [username, password, role, mahs]);

      const insertedId = result.rows[0].id;
      res.status(201).json({ message: 'Tạo tài khoản thành công', id: insertedId });
    } catch (error) {
      console.error('Error creating student account:', error);
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({ message: 'Mã học sinh đã tồn tại' });
      }
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  // Lấy profile
  async getProfile(req, res) {
    try {
      const user = await AccountModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }

      res.status(200).json({
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email || ''
      });
    } catch (error) {
      console.error("Lỗi lấy profile:", error);
      res.status(500).json({ message: 'Lỗi máy chủ khi lấy thông tin người dùng' });
    }
  },

  // Lịch sử đăng nhập
  async getLoginHistory(req, res) {
    try {
      const history = await LoginHistory.getLoginHistoryByUserId(req.user.id);
      res.status(200).json(history);
    } catch (error) {
      console.error("Lỗi lấy lịch sử đăng nhập:", error);
      res.status(500).json({ message: 'Lỗi máy chủ khi lấy lịch sử đăng nhập' });
    }
  },

  // Đổi mật khẩu
  async changePassword(req, res) {
    try {
      const { current, newPassword } = req.body;

      if (!isStrongPassword(newPassword)) {
        return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 8 ký tự' });
      }

      const user = await AccountModel.findById(req.user.id);
      if (!user || user.password !== current) {
        return res.status(403).json({ message: 'Mật khẩu hiện tại không đúng' });
      }

      await AccountModel.updatePassword(user.username, newPassword);
      res.status(200).json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      res.status(500).json({ message: 'Lỗi máy chủ khi đổi mật khẩu' });
    }
  }
};

module.exports = AuthController;
