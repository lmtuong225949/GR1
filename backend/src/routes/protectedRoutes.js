const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/admin-only', authenticateToken, authorizeRoles('admin'), (req, res) => {
  res.json({ message: 'Chào mừng Admin!' });
});

router.get('/teacher-only', authenticateToken, authorizeRoles('teacher'), (req, res) => {
  res.json({ message: 'Chào mừng Giáo viên!' });
});

router.get('/student-only', authenticateToken, authorizeRoles('student'), (req, res) => {
  res.json({ message: 'Chào mừng Học sinh!' });
});

module.exports = router;
