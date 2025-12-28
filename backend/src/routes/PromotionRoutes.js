const express = require('express');
const router = express.Router();
const {
  getStudentsByClass,
  getClasses,
  getAcademicYears,
  promoteStudents
} = require('../controllers/PromotionController');

// Lấy danh sách học sinh theo lớp và năm học
router.get('/students', getStudentsByClass);

// Lấy danh sách lớp học
router.get('/classes', getClasses);

// Lấy danh sách năm học
router.get('/academic-years', getAcademicYears);

// Xử lý lên lớp cho học sinh
router.post('/promote', promoteStudents);

module.exports = router;
