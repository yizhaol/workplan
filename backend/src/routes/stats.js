const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const statsController = require('../controllers/statsController');

router.get('/personal', auth, statsController.getPersonalStats);
router.get('/all', auth, adminOnly, statsController.getAllUsersStats);
router.get('/user/:userId', auth, adminOnly, statsController.getUserStats);

module.exports = router;
