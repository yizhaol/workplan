const { ReminderConfig, ReminderRecord, Task, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// 获取提醒配置列表
exports.getConfigs = async (req, res) => {
  try {
    const where = req.user.role === 'admin' ? {} : { user_id: req.user.id };
    const configs = await ReminderConfig.findAll({
      where,
      include: [{ model: User, attributes: ['id', 'username', 'nickname'] }],
      order: [['created_at', 'DESC']]
    });
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: '获取提醒配置失败' });
  }
};

// 创建/更新提醒配置
exports.saveConfig = async (req, res) => {
  try {
    const { id, reminder_type, channel, time, week_days, is_enabled, can_modify, template_content, is_global } = req.body;

    // 普通用户只能修改自己的配置
    if (!req.user.role === 'admin' && id) {
      const existing = await ReminderConfig.findByPk(id);
      if (existing && existing.user_id !== req.user.id && !existing.can_modify) {
        return res.status(403).json({ error: '该配置不可修改' });
      }
    }

    const configData = {
      user_id: req.user.id,
      is_global: req.user.role === 'admin' ? is_global : false,
      reminder_type,
      channel,
      time,
      week_days,
      is_enabled,
      can_modify: req.user.role === 'admin' ? can_modify : true,
      template_content
    };

    let config;
    if (id) {
      config = await ReminderConfig.update(configData, { where: { id } });
    } else {
      config = await ReminderConfig.create(configData);
    }

    res.json(config);
  } catch (error) {
    res.status(500).json({ error: '保存提醒配置失败' });
  }
};

// 删除提醒配置
exports.deleteConfig = async (req, res) => {
  try {
    const config = await ReminderConfig.findByPk(req.params.id);
    if (!config) return res.status(404).json({ error: '配置不存在' });

    // 非管理员只能删除自己的
    if (req.user.role !== 'admin' && config.user_id !== req.user.id) {
      return res.status(403).json({ error: '无权删除' });
    }

    await config.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除失败' });
  }
};

// 获取提醒记录
exports.getRecords = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    const where = req.user.role === 'admin' ? {} : { user_id: req.user.id };
    if (status) where.status = status;
    if (start_date || end_date) {
      where.send_at = {};
      if (start_date) where.send_at[Op.gte] = start_date;
      if (end_date) where.send_at[Op.lte] = end_date;
    }

    const { count, rows } = await ReminderRecord.findAndCountAll({
      where,
      include: [
        { model: User, attributes: ['id', 'username', 'nickname'] },
        { model: Task, attributes: ['id', 'title'] }
      ],
      limit: parseInt(limit),
      offset,
      order: [['send_at', 'DESC']]
    });

    res.json({
      data: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ error: '获取提醒记录失败' });
  }
};

// 测试发送提醒（管理员）
exports.testReminder = async (req, res) => {
  try {
    const { channel, content } = req.body;
    // 实际发送逻辑在 reminderService 中
    res.json({ message: '测试发送功能待实现', channel, content });
  } catch (error) {
    res.status(500).json({ error: '测试失败' });
  }
};
