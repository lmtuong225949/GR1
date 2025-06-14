const db = require('../config/db');

const NotificationModel = {
  // Lấy tất cả thông báo
  async getAll() {
    try {
      const result = await db.query(
        'SELECT * FROM thongbao'
      );
      return result.rows;
    } catch (error) {
      console.error('Lỗi khi lấy tất cả thông báo:', error);
      throw error;
    }
  },

  // Lấy thông báo theo ID
  async getNotificationById(id) {
    try {
      const result = await db.query(
        'SELECT * FROM thongbao WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Lỗi khi lấy thông báo:', error);
      throw error;
    }
  },

  // Tạo thông báo mới
  async createNotification(data) {
    try {
      const { noidung, nguoitao, loai } = data;
      const result = await db.query(
        'INSERT INTO thongbao (noidung, nguoitao, loai, ngaytao) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [noidung, nguoitao, loai]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Lỗi khi tạo thông báo:', error);
      throw error;
    }
  },

  // Cập nhật thông báo
  async updateNotification(id, data) {
    try {
      const { noidung, loai } = data;
      const result = await db.query(
        'UPDATE thongbao SET noidung = $1, loai = $2 WHERE id = $3 RETURNING *',
        [noidung, loai, id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Lỗi khi cập nhật thông báo:', error);
      throw error;
    }
  },

  // Xóa thông báo
  async deleteNotification(id) {
    try {
      await db.query(
        'DELETE FROM thongbao WHERE id = $1',
        [id]
      );
    } catch (error) {
      console.error('Lỗi khi xóa thông báo:', error);
      throw error;
    }
  },

  // Đếm số lượng thông báo
  async count() {
    try {
      const result = await db.query('SELECT COUNT(*) as count FROM thongbao');
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Lỗi khi đếm thông báo:', error);
      throw error;
    }
  }
};

module.exports = NotificationModel;
