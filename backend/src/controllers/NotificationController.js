const NotificationModel = require('../models/NotificationModel');

const NotificationController = {
  // Lấy tổng số thông báo
  getCount: async (req, res) => {
    try {
      const count = await NotificationModel.count();
      return res.json({ count });
    } catch (error) {
      console.error('Error getting notifications count:', error);
      return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },
  // Tạo thông báo mới
  createNotification: async (req, res) => {
    try {
      const { title, content, recipientRole } = req.body;

      if (!title || !content || !recipientRole) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
      }

      const notification = await NotificationModel.create({
        title,
        content,
        recipientRole
      });

      return res.status(201).json(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      return res.status(500).json({ message: 'Lỗi khi tạo thông báo' });
    }
  },

  // Lấy danh sách tất cả thông báo
  getNotifications: async (req, res) => {
    try {
      const notifications = await NotificationModel.getAll();
      return res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({ message: 'Lỗi khi lấy danh sách thông báo' });
    }
  }
};

module.exports = NotificationController;
