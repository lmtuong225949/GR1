const db = require('../config/db');

const AccountModel = {
  // Tìm tài khoản theo username
  async findByUsername(username) {
    try {
      const result = await db.query(
        'SELECT id, username, password, role, bgh, mahs, giaovienid, maphuhuynh, locked FROM taikhoan WHERE username = $1',
        [username]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Lỗi khi tìm tài khoản:', error);
      throw error;
    }
  },

  // Lấy thông tin tài khoản
  async findById(id) {
    try {
      const result = await db.query(
        'SELECT id, username, password, role, bgh, mahs, giaovienid, maphuhuynh, locked FROM taikhoan WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin tài khoản:', error);
      throw error;
    }
  },

  // Cập nhật mật khẩu
  async updatePassword(username, newPassword) {
    try {
      await db.query(
        'UPDATE taikhoan SET password = $1 WHERE username = $2',
        [newPassword, username]
      );
    } catch (error) {
      console.error('Lỗi khi cập nhật mật khẩu:', error);
      throw error;
    }
  }
};

module.exports = AccountModel;

// Export db connection for testing
module.exports.db = db;
