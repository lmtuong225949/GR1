const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

router.get('/', UserController.getUsers);      // GET tất cả
router.get('/:id', UserController.getUsers);   // GET theo ID
router.delete('/:id/delete', UserController.deleteUser);
router.patch('/:id/role', UserController.updateRole);
router.patch('/:id/lock', UserController.toggleLock);
router.patch('/:id/profile', UserController.updateProfile);
router.post('/add', UserController.createUser);

module.exports = router;
