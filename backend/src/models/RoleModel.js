const db = require('../config/db');

const RoleModel = {
  // Lấy tất cả các vai trò
  async getAllRoles() {
    try {
      const result = await db.query('SELECT * FROM roles ORDER BY name');
      return result.rows;
    } catch (error) {
      console.error('Lỗi khi lấy tất cả vai trò:', error);
      throw error;
    }
  },

  // Lấy vai trò theo ID
  async getRoleById(id) {
    try {
      const result = await db.query('SELECT * FROM roles WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Lỗi khi lấy vai trò:', error);
      throw error;
    }
  },

  // Tạo vai trò mới
  async createRole(data) {
    try {
      const { ten_vai_tro, mo_ta } = data;
      const result = await db.query(
        'INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING *',
        [ten_vai_tro, mo_ta]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Lỗi khi tạo vai trò:', error);
      throw error;
    }
  },

  // Cập nhật vai trò
  async updateRole(id, data) {
    try {
      const { ten_vai_tro, mo_ta } = data;
      const result = await db.query(
        'UPDATE roles SET name = $1, description = $2 WHERE id = $3 RETURNING *',
        [ten_vai_tro, mo_ta, id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Lỗi khi cập nhật vai trò:', error);
      throw error;
    }
  },

  // Xóa vai trò
  async deleteRole(id) {
    try {
      await db.query('DELETE FROM roles WHERE id = $1', [id]);
    } catch (error) {
      console.error('Lỗi khi xóa vai trò:', error);
      throw error;
    }
  },

  // Kiểm tra quyền của vai trò
  async hasPermission(roleId, permission) {
    try {
      const result = await db.query(
        'SELECT EXISTS(SELECT 1 FROM vai_tro_quyen WHERE vai_tro_id = $1 AND quyen_id = $2)',
        [roleId, permission]
      );
      return result.rows[0].exists;
    } catch (error) {
      console.error('Lỗi khi kiểm tra quyền:', error);
      throw error;
    }
  }
};

module.exports = RoleModel;
