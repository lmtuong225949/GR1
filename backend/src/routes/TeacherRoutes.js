// routes/TeachersRoutes.js
const express = require('express');
const router = express.Router();
const teachersController = require('../controllers/TeacherController');
// GET /api/teachers
router.get('/', teachersController.getAllTeachers);

// GET /api/teachers/count
router.get('/count', teachersController.getCount);

// POST /api/teachers/add
router.post('/add', teachersController.addTeacher);

// PUT /api/teachers/:magv
router.put('/update/:magv', teachersController.updateTeacher);

// DELETE /api/teachers/:magv
router.delete('/delete/:magv', teachersController.deleteTeacher);

// GET /api/teachers/:magv
router.get('/:magv', teachersController.getTeacherName);

module.exports = router;
