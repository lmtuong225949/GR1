const express = require('express');
const examController = require('../controllers/ExamController');

const router = express.Router();

// Exam routes for students
router.get('/student/:mahs/exams', examController.getAvailableExams);
router.get('/exam/:dethiid', examController.getExamDetails);
router.post('/exam/submit', examController.submitExam);
router.get('/student/:mahs/history', examController.getExamHistory);

module.exports = router;
