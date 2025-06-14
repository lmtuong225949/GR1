const db = require('../config/db');

async function ensureLockedColumn() {
  try {
    await db.query(`
      ALTER TABLE taikhoan ADD COLUMN IF NOT EXISTS locked BOOLEAN DEFAULT FALSE;
      UPDATE taikhoan SET locked = FALSE WHERE locked IS NULL;
    `);
  } catch (err) {
    console.error('Error creating locked column:', err);
  }
}

ensureLockedColumn();

const UserController = {
  async getUsers(req, res) {
    try {
      const userId = req.params.id ? parseInt(req.params.id, 10) : null;

      if (req.params.id && isNaN(userId)) {
        return res.status(400).json({ message: 'ID không hợp lệ' });
      }

      let query = `
        SELECT 
          tk.id,
          tk.username,
          tk.role,
          tk.locked,

          hs.hoten AS hoten_hs,
          hs.email AS email_hs,
          hs.sdt AS sdt_hs,

          gv.hoten AS hoten_gv,
          gv.email AS email_gv,
          gv.sdt AS sdt_gv,

          bgh.ten AS hoten_bgh,
          bgh.email AS email_bgh,
          bgh.sdt AS sdt_bgh

        FROM taikhoan tk
        LEFT JOIN hocsinh hs ON tk.role = 'student' AND tk.mahs = hs.mahs
        LEFT JOIN giaovien gv ON tk.role = 'teacher' AND tk.giaovienid = gv.magv
        LEFT JOIN bgh ON tk.role = 'admin' AND tk.bgh = bgh.id
      `;

      const params = [];
      if (userId) {
        query += ' WHERE tk.id = $1';
        params.push(userId);
      }

      query += ';';

      const result = await db.query(query, params);
      const rows = result.rows;

      if (userId) {
        if (rows.length === 0) {
          return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        const user = rows[0];
        return res.json({
          id: user.id,
          username: user.username,
          role: user.role,
          hoten: user.hoten_hs || user.hoten_gv || user.hoten_bgh || null,
          email: user.email_hs || user.email_gv || user.email_bgh || null,
          sdt: user.sdt_hs || user.sdt_gv || user.sdt_bgh || null,
          locked: user.locked
        });
      }

      const users = rows.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role,
        hoten: user.hoten_hs || user.hoten_gv || user.hoten_bgh || null,
        email: user.email_hs || user.email_gv || user.email_bgh || null,
        sdt: user.sdt_hs || user.sdt_gv || user.sdt_bgh || null,
        locked: user.locked
      }));

      return res.json(users);

    } catch (err) {
      console.error('Lỗi khi lấy thông tin người dùng:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

// Trong UserController
async updateProfile(req, res) {
  const { id } = req.params;
  const { email, sdt } = req.body;

  try {
    // Lấy vai trò của người dùng
    const result = await db.query('SELECT role FROM taikhoan WHERE id = $1', [id]);
    if (!result.rows[0]) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const role = result.rows[0].role;
    let query = '';
    let params = [];

    switch (role) {
      case 'student':
        query = `
          UPDATE hocsinh 
          SET email = $1, sdt = $2 
          FROM taikhoan tk 
          WHERE tk.id = $3 AND tk.mahs = hocsinh.mahs
        `;
        params = [email, sdt, id];
        break;

      case 'teacher':
        query = `
          UPDATE giaovien 
          SET email = $1, sdt = $2 
          FROM taikhoan tk 
          WHERE tk.id = $3 AND tk.giaovienid = giaovien.magv
        `;
        params = [email, sdt, id];
        break;

      case 'admin':
        query = `
          UPDATE bgh 
          SET email = $1, sdt = $2 
          FROM taikhoan tk 
          WHERE tk.id = $3 AND tk.bgh = bgh.id
        `;
        params = [email, sdt, id];
        break;

      default:
        return res.status(400).json({ message: "Vai trò không hợp lệ" });
    }

    await db.query(query, params);

    return res.json({ message: "Cập nhật thành công" });

  } catch (err) {
    console.error("Lỗi cập nhật profile:", err);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
},

  async deleteUser(req, res) {
    const { id } = req.params;
    try {
      await db.query("DELETE FROM taikhoan WHERE id = $1", [id]);
      return res.json({ message: "Đã xoá tài khoản" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ" });
    }
  },

  async updateRole(req, res) {
    const { id } = req.params;
    const { role } = req.body;
    if (!["admin", "teacher", "student"].includes(role)) {
      return res.status(400).json({ message: "Vai trò không hợp lệ" });
    }
    try {
      await db.query("UPDATE taikhoan SET role = $1 WHERE id = $2", [role, id]);
      return res.json({ message: "Cập nhật vai trò thành công" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ" });
    }
  },

  async toggleLock(req, res) {
    const { id } = req.params;
    const { locked } = req.body;
    try {
      await db.query("UPDATE taikhoan SET locked = $1 WHERE id = $2", [locked, id]);
      return res.json({ message: locked ? "Tài khoản đã bị khóa" : "Tài khoản đã được mở khóa" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ" });
    }
  },

  async createUser(req, res) {
    const { username, password, role, mahs, giaovienid, bgh } = req.body;
  
    if (!username || !password || !role) {
      return res.status(400).json({ message: "Thiếu thông tin tài khoản" });
    }
  
    if (!["admin", "teacher", "student"].includes(role)) {
      return res.status(400).json({ message: "Vai trò không hợp lệ" });
    }
  
    try {
      let query = '';
      let params = [];
  
      switch (role) {
        case 'student':
          if (!mahs) return res.status(400).json({ message: "Thiếu mã học sinh (mahs)" });
  
          query = `
            INSERT INTO taikhoan (username, passwordhash, role, mahs, locked)
            VALUES ($1, $2, $3, $4, FALSE) RETURNING *
          `;
          params = [username, password, role, mahs];
          break;
  
        case 'teacher':
          if (!giaovienid) return res.status(400).json({ message: "Thiếu mã giáo viên (giaovienid)" });
  
          query = `
            INSERT INTO taikhoan (username, passwordhash, role, giaovienid, locked)
            VALUES ($1, $2, $3, $4, FALSE) RETURNING *
          `;
          params = [username, password, role, giaovienid];
          break;
  
        case 'admin':
          if (!bgh) return res.status(400).json({ message: "Thiếu ID ban giám hiệu (bgh)" });
  
          query = `
            INSERT INTO taikhoan (username, passwordhash, role, bgh, locked)
            VALUES ($1, $2, $3, $4, FALSE) RETURNING *
          `;
          params = [username, password, role, bgh];
          break;
      }
  
      const result = await db.query(query, params);
      return res.status(201).json(result.rows[0]);
  
    } catch (err) {
      console.error("Lỗi khi tạo tài khoản:", err);
      res.status(500).json({ message: "Lỗi máy chủ" });
    }
  }
};
module.exports = UserController;
