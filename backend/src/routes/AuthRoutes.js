const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const verifyToken = require('../middleware/verifyToken');

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/create-student', AuthController.createStudentAccount);

router.get('/profile', verifyToken, AuthController.getProfile);
router.get('/login-history', verifyToken, AuthController.getLoginHistory);
router.post('/change-password', verifyToken, AuthController.changePassword);

module.exports = router;
