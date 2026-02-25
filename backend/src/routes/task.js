const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const taskController = require('../controllers/taskController');
// 管理员获取所有任务
router.get('/all', auth, adminOnly, taskController.getAllTasks);
router.get('/', auth, taskController.getTasks);
router.get('/:id', auth, taskController.getTask);
router.post('/', auth, taskController.createTask);
router.put('/:id', auth, taskController.updateTask);
router.put('/:id/status', auth, taskController.updateStatus);
router.post('/bulk/status', auth, taskController.bulkUpdateStatus);
router.delete('/:id', auth, taskController.deleteTask);
router.get('/:id/logs', auth, taskController.getTaskLogs);



module.exports = router;