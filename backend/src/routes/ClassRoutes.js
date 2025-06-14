// routes/classes.js
const express = require('express');
const router = express.Router();
const classesController = require('../controllers/ClassController');

// Log all class-related requests
router.use((req, res, next) => {
  next();
});
// GET /api/classes/count
router.get('/count', classesController.getCount);
// Lấy thông tin lớp theo ID
router.get("/:malop", classesController.getClassById);

// Lấy danh sách lớp (nếu có)
router.get("/", classesController.getAllClasses);

// Lấy danh sách học sinh theo mã lớp
router.get("/:malop/students", classesController.getStudentsByClass);

// Thêm lớp học
router.post('/add', classesController.createClass);

// Cập nhật lớp học
router.put("/update/:malop", classesController.updateClass);

// Xoá lớp học
router.delete("/delete/:malop", classesController.deleteClass);


module.exports = router;
