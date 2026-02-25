const express = require('express');
const router = express.Router();

router.use('/user', require('./user'));
router.use('/task', require('./task'));
router.use('/reminder', require('./reminder'));
router.use('/stats', require('./stats'));

module.exports = router;
