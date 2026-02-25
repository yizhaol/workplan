const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const userController = require('../controllers/userController');

// 公开接口
router.post('/register', userController.register);
router.post('/login', userController.login);

// 需认证
router.get('/profile', auth, userController.getProfile);
router.put('/password', auth, userController.changePassword);

// 管理员接口
router.get('/users', auth, adminOnly, userController.getAllUsers);
router.put('/users/:id/status', auth, adminOnly, userController.toggleUserStatus);
router.put('/users/:id/reset-password', auth, adminOnly, userController.resetPassword);

module.exports = router;
