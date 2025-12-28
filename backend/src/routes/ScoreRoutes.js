const express = require('express');
const ScoreController = require('../controllers/ScoreController');

const router = express.Router();

// Định nghĩa route
router.get('/', ScoreController.getAllScores);
router.get('/diem', ScoreController.getDiemData); // New endpoint for diem table data
router.get('/student/:mahs/subjects', ScoreController.getStudentSubjectAverages); // New endpoint for student subject averages
router.get('/student/:mahs/exams', ScoreController.getAvailableExams); // New endpoint for available exams
router.get('/exam/:dethiid', ScoreController.getExamDetails); // New endpoint for exam details
router.post('/exam/submit', ScoreController.submitExam); // New endpoint for submitting exams
router.get('/:mahs', ScoreController.getScoreDetail);

module.exports = router;  // Export the router object directly
