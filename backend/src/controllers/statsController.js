const { Task, User, sequelize } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

// 个人统计
exports.getPersonalStats = async (req, res) => {
  try {
    const { start_date, end_date, group_by } = req.query;
    const userId = req.user.id;

    const where = { creator_id: userId };
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at[Op.gte] = start_date;
      if (end_date) where.created_at[Op.lte] = end_date;
    }

    // 基础统计
    const stats = await Task.findAll({
      where,
      attributes: [
        [fn('COUNT', col('id')), 'total'],
        [fn('SUM', literal(`CASE WHEN status = 'completed' THEN 1 ELSE 0 END`)), 'completed'],
        [fn('SUM', literal(`CASE WHEN status = 'overdue' THEN 1 ELSE 0 END`)), 'overdue'],
        [fn('SUM', literal(`CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END`)), 'in_progress']
      ],
      raw: true
    });

    // 按状态统计
    const byStatus = await Task.findAll({
      where,
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // 按优先级统计
    const byPriority = await Task.findAll({
      where,
      attributes: [
        'priority',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['priority'],
      raw: true
    });

    // 按日/周/月趋势
    let dateFormat = '%Y-%m-%d';
    if (group_by === 'week') dateFormat = '%Y-%u';
    if (group_by === 'month') dateFormat = '%Y-%m';

    const trend = await Task.findAll({
      where,
      attributes: [
        [literal(`DATE_FORMAT(created_at, '${dateFormat}')`), 'date'],
        [fn('COUNT', col('id')), 'created'],
        [fn('SUM', literal(`CASE WHEN status = 'completed' THEN 1 ELSE 0 END`)), 'completed']
      ],
      group: [literal(`DATE_FORMAT(created_at, '${dateFormat}')`)],
      order: [[literal('date'), 'ASC']],
      raw: true
    });

    res.json({
      summary: stats[0] || {},
      by_status: byStatus,
      by_priority: byPriority,
      trend
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取统计数据失败' });
  }
};

// 管理员获取指定用户统计
exports.getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { start_date, end_date } = req.query;

    // 检查用户是否存在
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const where = { creator_id: userId };
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at[Op.gte] = start_date;
      if (end_date) where.created_at[Op.lte] = end_date;
    }

    // 基础统计
    const stats = await Task.findAll({
      where,
      attributes: [
        [fn('COUNT', col('id')), 'total'],
        [fn('SUM', literal(`CASE WHEN status = 'completed' THEN 1 ELSE 0 END`)), 'completed'],
        [fn('SUM', literal(`CASE WHEN status = 'overdue' THEN 1 ELSE 0 END`)), 'overdue'],
        [fn('SUM', literal(`CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END`)), 'in_progress'],
        [fn('SUM', literal(`CASE WHEN status = 'todo' THEN 1 ELSE 0 END`)), 'todo']
      ],
      raw: true
    });

    const summary = stats[0] || {};
    const total = parseInt(summary.total) || 0;
    const completed = parseInt(summary.completed) || 0;

    res.json({
      username: user.username,
      summary,
      completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取用户统计数据失败' });
  }
};

// 管理员获取所有用户统计
exports.getAllUsersStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const whereClause = {};
    if (start_date || end_date) {
      whereClause.created_at = {};
      if (start_date) whereClause.created_at[Op.gte] = start_date;
      if (end_date) whereClause.created_at[Op.lte] = end_date;
    }

    // 用户任务统计汇总
    const userStats = await User.findAll({
      attributes: [
        'id', 'username', 'nickname',
        [literal('(SELECT COUNT(*) FROM tasks WHERE tasks.creator_id = User.id)'), 'total_tasks'],
        [literal('(SELECT COUNT(*) FROM tasks WHERE tasks.creator_id = User.id AND status = "completed")'), 'completed_tasks'],
        [literal('(SELECT COUNT(*) FROM tasks WHERE tasks.creator_id = User.id AND status = "overdue")'), 'overdue_tasks']
      ],
      where: { status: 'active' },
      raw: true
    });

    // 全局统计
    const globalStats = await Task.findAll({
      where: whereClause,
      attributes: [
        [fn('COUNT', col('id')), 'total'],
        [fn('SUM', literal(`CASE WHEN status = 'completed' THEN 1 ELSE 0 END`)), 'completed'],
        [fn('SUM', literal(`CASE WHEN status = 'overdue' THEN 1 ELSE 0 END`)), 'overdue']
      ],
      raw: true
    });

    res.json({
      global: globalStats[0] || {},
      users: userStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取统计数据失败' });
  }
};
