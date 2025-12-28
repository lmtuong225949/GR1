const db = require('../config/db');

// Tạo cột locked nếu chưa có
async function ensureLockedColumn() {
  try {
    await db.query(`
      ALTER TABLE taikhoan ADD COLUMN IF NOT EXISTS locked BOOLEAN DEFAULT FALSE;
      UPDATE taikhoan SET locked = FALSE WHERE locked IS NULL;
    `);
  } catch (err) {
    console.error('Lỗi khi thêm cột locked:', err);
  }
}
ensureLockedColumn();

const UserController = {
  // Lấy danh sách tài khoản hoặc chi tiết 1 tài khoản
  async getUsers(req, res) {
    try {
      const userId = req.params.id ? parseInt(req.params.id, 10) : null;
      if (req.params.id && isNaN(userId)) {
        return res.status(400).json({ message: 'ID không hợp lệ' });
      }

      let query = `
        SELECT 
          tk.id, tk.username, tk.role, tk.locked,
          hs.hoten AS hoten_hs, hs.email AS email_hs, hs.sdt AS sdt_hs,
          gv.hoten AS hoten_gv, gv.email AS email_gv, gv.sdt AS sdt_gv,
          bgh.ten AS hoten_bgh, bgh.email AS email_bgh, bgh.sdt AS sdt_bgh,
          ph.hoten AS hoten_ph, ph.email AS email_ph, ph.sdt AS sdt_ph
        FROM taikhoan tk
        LEFT JOIN hocsinh hs ON tk.role = 'student' AND tk.mahs = hs.mahs
        LEFT JOIN giaovien gv ON tk.role = 'teacher' AND tk.giaovienid = gv.magv
        LEFT JOIN bgh ON tk.role = 'admin' AND tk.bgh = bgh.id
        LEFT JOIN phuhuynh ph ON tk.role = 'parent' AND ph.id::text = tk.maphuhuynh
      `;

      const params = [];
      if (userId) {
        query += ' WHERE tk.id = $1';
        params.push(userId);
      } else {
        query += ' ORDER BY tk.id ASC';
      }
      query += ';';

      const result = await db.query(query, params);
      // Helper function to safely handle string encoding
      const safeString = (str) => {
        if (!str) return null;
        // Convert to string and normalize unicode characters
        return String(str).normalize('NFC');
      };

      const users = result.rows.map(user => ({
        id: user.id,
        username: safeString(user.username),
        role: safeString(user.role),
        hoten: safeString(user.hoten_hs || user.hoten_gv || user.hoten_bgh || user.hoten_ph),
        email: safeString(user.email_hs || user.email_gv || user.email_bgh || user.email_ph),
        sdt: safeString(user.sdt_hs || user.sdt_gv || user.sdt_bgh || user.sdt_ph),
        locked: user.locked
      }));

      // Set content type with charset for proper encoding
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      
      if (userId) {
        return users.length === 0
          ? res.status(404).json({ message: 'Người dùng không tồn tại' })
          : res.json(users[0]);
      }

      // Ensure proper JSON serialization of special characters
      const jsonResponse = JSON.stringify(users, (key, value) => 
        typeof value === 'string' ? value.normalize() : value
      );
      return res.send(jsonResponse);
    } catch (err) {
      console.error('Lỗi khi lấy thông tin người dùng:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  // Cập nhật email & sdt
  async updateProfile(req, res) {
    const { id } = req.params;
    const { email, sdt } = req.body;

    try {
      const result = await db.query('SELECT role FROM taikhoan WHERE id = $1', [id]);
      if (!result.rows[0]) {
        return res.status(404).json({ message: 'Người dùng không tồn tại' });
      }

      const role = result.rows[0].role;
      let query = '';
      let params = [];

      if (role === 'student') {
        query = `
          UPDATE hocsinh SET email = $1, sdt = $2 
          FROM taikhoan tk WHERE tk.id = $3 AND tk.mahs = hocsinh.mahs
        `;
        params = [email, sdt, id];
      } else if (role === 'teacher') {
        query = `
          UPDATE giaovien SET email = $1, sdt = $2 
          FROM taikhoan tk WHERE tk.id = $3 AND tk.giaovienid = giaovien.magv
        `;
        params = [email, sdt, id];
      } else if (role === 'admin') {
        query = `
          UPDATE bgh SET email = $1, sdt = $2 
          FROM taikhoan tk WHERE tk.id = $3 AND tk.bgh = bgh.id
        `;
        params = [email, sdt, id];
      } else {
        return res.status(400).json({ message: 'Vai trò không hợp lệ' });
      }

      await db.query(query, params);
      return res.json({ message: 'Cập nhật thành công' });
    } catch (err) {
      console.error('Lỗi cập nhật profile:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  // Xoá tài khoản
  async deleteUser(req, res) {
    try {
      await db.query('DELETE FROM taikhoan WHERE id = $1', [req.params.id]);
      return res.json({ message: 'Đã xoá tài khoản' });
    } catch (err) {
      console.error('Lỗi xoá tài khoản:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  // Cập nhật vai trò
  async updateRole(req, res) {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'teacher', 'student', 'librarian', 'parent'].includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }

    try {
      await db.query('UPDATE taikhoan SET role = $1 WHERE id = $2', [role, id]);
      return res.json({ message: 'Cập nhật vai trò thành công' });
    } catch (err) {
      console.error('Lỗi cập nhật vai trò:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  // Khóa/mở khóa tài khoản
  async toggleLock(req, res) {
    const { id } = req.params;
    const { locked } = req.body;

    try {
      await db.query('UPDATE taikhoan SET locked = $1 WHERE id = $2', [locked, id]);
      return res.json({
        message: locked ? 'Tài khoản đã bị khóa' : 'Tài khoản đã được mở khóa'
      });
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái khóa:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  // Tạo tài khoản mới
  async createUser(req, res) {
    const { username, password, role, mahs, giaovienid, bgh, maphuhuynh } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Thiếu thông tin tài khoản' });
    }

    if (!['admin', 'teacher', 'student', 'librarian', 'parent'].includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }

    try {
      let query = '';
      let params = [];

      if (role === 'student') {
        if (!mahs) return res.status(400).json({ message: 'Thiếu mã học sinh (mahs)' });
        query = `
          INSERT INTO taikhoan (username, password, role, mahs, locked)
          VALUES ($1, $2, $3, $4, FALSE) RETURNING *
        `;
        params = [username, password, role, mahs];
      } else if (role === 'teacher') {
        if (!giaovienid) return res.status(400).json({ message: 'Thiếu mã giáo viên (giaovienid)' });
        query = `
          INSERT INTO taikhoan (username, password, role, giaovienid, locked)
          VALUES ($1, $2, $3, $4, FALSE) RETURNING *
        `;
        params = [username, password, role, giaovienid];
      } else if (role === 'admin') {
        if (!bgh) return res.status(400).json({ message: 'Thiếu ID ban giám hiệu (bgh)' });
        query = `
          INSERT INTO taikhoan (username, password, role, bgh, locked)
          VALUES ($1, $2, $3, $4, FALSE) RETURNING *
        `;
        params = [username, password, role, bgh];
      } else if (role === 'librarian') {
        if (!bgh) return res.status(400).json({ message: 'Thiếu ID thủ thư' });
        query = `
          INSERT INTO taikhoan (username, password, role, bgh, locked)
          VALUES ($1, $2, $3, $4, FALSE) RETURNING *
        `;
        params = [username, password, role, bgh];
      } else if (role === 'parent') {
        if (!maphuhuynh) return res.status(400).json({ message: 'Thiếu mã phụ huynh (maphuhuynh)' });
        query = `
          INSERT INTO taikhoan (username, password, role, maphuhuynh, locked)
          VALUES ($1, $2, $3, $4, FALSE) RETURNING *
        `;
        params = [username, password, role, maphuhuynh];
      }

      const result = await db.query(query, params);
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Lỗi khi tạo tài khoản:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  }
};

module.exports = UserController;
