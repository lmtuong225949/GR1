// src/middleware/role.js

/**
 * authorizeRoles('admin', 'teacher')
 * Trả về một middleware function
 * Nếu req.user.role không nằm trong allowedRoles thì sẽ trả 403
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res
        .status(401)
        .json({ message: 'Người dùng chưa xác thực hoặc không có quyền' });
    }

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
    }

    next();
  };
}

module.exports = authorizeRoles;
