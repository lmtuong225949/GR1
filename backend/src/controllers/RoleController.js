const Role = require('../models/RoleModel');

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.getAllRoles();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách vai trò' });
  } 
};
