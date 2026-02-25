const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const reminderController = require('../controllers/reminderController');

router.get('/configs', auth, reminderController.getConfigs);
router.post('/configs', auth, reminderController.saveConfig);
router.delete('/configs/:id', auth, reminderController.deleteConfig);
router.get('/records', auth, reminderController.getRecords);
router.post('/test', auth, adminOnly, reminderController.testReminder);

module.exports = router;
