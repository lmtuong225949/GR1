const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/NotificationController');

router.post('/create', notificationController.createNotification);
router.get('/', notificationController.getNotifications);
router.get('/count', notificationController.getCount);

module.exports = router;
