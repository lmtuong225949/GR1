const express = require('express');
const ScoreController = require('../controllers/ScoreController');

const router = express.Router();

// Định nghĩa route
router.get('/', ScoreController.getAllScores);
router.get('/:mahs', ScoreController.getScoreDetail);

module.exports = router;  // Export the router object directly
