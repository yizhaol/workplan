const { Task, TaskLog, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// 获取任务列表
exports.getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority, assignee_id, keyword, parent_id, start_date, end_date, sort_by, sort_order } = req.query;
    const offset = (page - 1) * limit;

    const where = { creator_id: req.user.id };
    if (parent_id === 'null') where.parent_id = null;
    if (parent_id && parent_id !== 'null') where.parent_id = parent_id;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignee_id) where.assignee_id = assignee_id;
    if (keyword) where.title = { [Op.like]: `%${keyword}%` };
    if (start_date) where.start_date = { [Op.gte]: start_date };
    if (end_date) where.due_date = { [Op.lte]: end_date };

    if (req.user.role === 'admin') delete where.creator_id;

    const allowedSortFields = ['title', 'status', 'priority', 'due_date', 'created_at', 'completed_at'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDir = sort_order === 'asc' ? 'ASC' : 'DESC';

    const { count, rows } = await Task.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'nickname'] },
        { model: User, as: 'assignee', attributes: ['id', 'username', 'nickname'] },
        { model: Task, as: 'subtasks', attributes: ['id', 'title', 'status'] }
      ],
      limit: parseInt(limit),
      offset,
      order: [[sortField, sortDir]]
    });

    res.json({ data: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取任务列表失败' });
  }
};

// 获取单个任务
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'nickname'] },
        { model: User, as: 'assignee', attributes: ['id', 'username', 'nickname'] },
        { model: Task, as: 'subtasks', include: ['creator', 'assignee'] },
        { model: TaskLog, as: 'logs', include: [{ model: User, as: 'operator', attributes: ['id', 'username', 'nickname'] }] }
      ]
    });
    if (!task) return res.status(404).json({ error: '任务不存在' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: '获取任务失败' });
  }
};

// 创建任务
exports.createTask = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { title, description, priority, start_date, due_date, parent_id, assignee_id, extra_fields } = req.body;

    const task = await Task.create({
      title,
      description,
      priority: priority || 'medium',
      start_date,
      due_date,
      parent_id: parent_id || null,
      creator_id: req.user.id,
      assignee_id,
      extra_fields
    }, { transaction: t });

    await TaskLog.create({
      task_id: task.id,
      user_id: req.user.id,
      action: 'create',
      new_value: JSON.stringify(req.body)
    }, { transaction: t });

    await t.commit();
    res.status(201).json(task);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: '创建任务失败' });
  }
};

// 更新任务
exports.updateTask = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: '任务不存在' });

    await task.update(req.body, { transaction: t });

    await TaskLog.create({
      task_id: task.id,
      user_id: req.user.id,
      action: 'update',
      new_value: JSON.stringify(req.body)
    }, { transaction: t });

    await t.commit();
    res.json(task);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: '更新任务失败' });
  }
};

// 更新任务状态
exports.updateStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { status } = req.body;
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: '任务不存在' });

    task.status = status;
    if (status === 'completed') task.completed_at = new Date();
    else task.completed_at = null;
    await task.save({ transaction: t });

    await TaskLog.create({
      task_id: task.id,
      user_id: req.user.id,
      action: 'status',
      new_value: status
    }, { transaction: t });

    await t.commit();
    res.json(task);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: '更新状态失败' });
  }
};

// 批量更新状态
exports.bulkUpdateStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { task_ids, status } = req.body;
    await Task.update({ status, completed_at: status === 'completed' ? new Date() : null }, { where: { id: task_ids }, transaction: t });
    for (const task_id of task_ids) {
      await TaskLog.create({ task_id, user_id: req.user.id, action: 'status', new_value: status }, { transaction: t });
    }
    await t.commit();
    res.json({ message: '批量更新成功', count: task_ids.length });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: '批量更新失败' });
  }
};

// 删除任务
exports.deleteTask = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: '任务不存在' });

    await Task.destroy({ where: { parent_id: task.id }, transaction: t });
    await TaskLog.destroy({ where: { task_id: task.id }, transaction: t });
    await task.destroy({ transaction: t });

    await t.commit();
    res.json({ message: '删除成功' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: '删除任务失败' });
  }
};
// 获取任务日志
exports.getTaskLogs = async (req, res) => {
  try {
    const logs = await TaskLog.findAll({
      where: { task_id: req.params.id },
      include: [{ model: User, as: 'operator', attributes: ['id', 'username', 'nickname'] }],
      order: [['created_at', 'DESC']]
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: '获取日志失败' });
  }
};
// 管理员获取所有任务
exports.getAllTasks = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority, keyword, creator_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (keyword) where.title = { [Op.like]: `%${keyword}%` };
    if (creator_id) where.creator_id = creator_id;

    const { count, rows } = await Task.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username']
      }],
      attributes: { exclude: ['creator_id'] },
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      raw: false
    });

    const tasks = rows.map(task => ({
      ...task.toJSON(),
      username: task.creator?.username || '未知'
    }));

    res.json({
      data: tasks,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取任务列表失败' });
  }
};