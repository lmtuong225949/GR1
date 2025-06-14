// routes/StudentsRoutes.js
const express = require('express');
const router = express.Router();
const studentsController = require('../controllers/StudentController');

// GET /api/students
router.get('/', studentsController.getAllStudents);

// GET /api/students/count
router.get('/count', studentsController.getCount);

// POST /api/students/add
router.post('/add', studentsController.addStudent);

// PUT /api/students/:mahs
router.put('/update/:mahs', studentsController.updateStudent);

// DELETE /api/students/delete/:mahs
router.delete('/delete/:mahs', studentsController.deleteStudent);

module.exports = router;
