const nodemailer = require('nodemailer');
const axios = require('axios');
const cron = require('node-cron');
const { ReminderConfig, ReminderRecord, Task, User } = require('../models');
const { Op } = require('sequelize');

// 发送邮箱
const sendEmail = async (to, subject, content) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, html: content });
    return true;
  } catch (error) {
    console.error('邮件发送失败:', error);
    return false;
  }
};

// 发送钉钉机器人
const sendDingTalk = async (content) => {
  try {
    await axios.post(process.env.DINGTALK_ROBOT_URL, {
      msgtype: 'text',
      text: { content }
    });
    return true;
  } catch (error) {
    console.error('钉钉发送失败:', error);
    return false;
  }
};

// 发送企业微信机器人
const sendWeCom = async (content) => {
  try {
    await axios.post(process.env.WECOM_ROBOT_URL, {
      msgtype: 'text',
      text: { content }
    });
    return true;
  } catch (error) {
    console.error('企业微信发送失败:', error);
    return false;
  }
};

// 根据渠道发送
const sendReminder = async (user, task, channel, type) => {
  const content = `【WorkPlan提醒】\n任务: ${task.title}\n类型: ${type === 'daily' ? '每日任务清单' : type === 'overdue' ? '任务已逾期' : '任务提醒'}\n截止日期: ${task.due_date || '未设置'}`;

  let success = false;
  switch (channel) {
    case 'email':
      if (user.email) success = await sendEmail(user.email, 'WorkPlan 任务提醒', content);
      break;
    case 'dingtalk':
      success = await sendDingTalk(content);
      break;
    case 'wecom':
      success = await sendWeCom(content);
      break;
  }

  // 记录发送结果
  await ReminderRecord.create({
    user_id: user.id,
    task_id: task.id,
    reminder_type: type,
    channel,
    content,
    send_at: new Date(),
    status: success ? 'sent' : 'failed'
  });
};

// 每日任务提醒
const dailyReminder = async () => {
  console.log('📅 执行每日任务提醒...');

  const configs = await ReminderConfig.findAll({
    where: { reminder_type: 'daily', is_enabled: true }
  });

  const today = new Date().toISOString().split('T')[0];

  for (const config of configs) {
    const user = await User.findByPk(config.user_id);
    if (!user) continue;

    // 获取用户未完成任务
    const tasks = await Task.findAll({
      where: {
        creator_id: config.user_id,
        status: { [Op.in]: ['pending', 'in_progress'] },
        [Op.or]: [
          { due_date: { [Op.lte]: today } },
          { due_date: null }
        ]
      }
    });

    if (tasks.length === 0) continue;

    // 发送提醒
    switch (config.channel) {
      case 'email':
        const taskList = tasks.map(t => `• ${t.title}`).join('\n');
        await sendEmail(user.email, 'WorkPlan - 今日任务清单', `待办任务(${tasks.length}):\n${taskList}`);
        break;
      case 'dingtalk':
        await sendDingTalk(`📅 您有 ${tasks.length} 个待办任务`);
        break;
      case 'wecom':
        await sendWeCom(`📅 您有 ${tasks.length} 个待办任务`);
        break;
    }

    await ReminderRecord.create({
      user_id: user.id,
      reminder_type: 'daily',
      channel: config.channel,
      content: `每日提醒: ${tasks.length}个任务`,
      send_at: new Date(),
      status: 'sent'
    });
  }
};

// 逾期任务提醒
const overdueReminder = async () => {
  console.log('⚠️ 执行逾期任务提醒...');

  const today = new Date().toISOString().split('T')[0];
  const configs = await ReminderConfig.findAll({
    where: { reminder_type: 'overdue', is_enabled: true }
  });

  for (const config of configs) {
    const user = await User.findByPk(config.user_id);
    if (!user) continue;

    const tasks = await Task.findAll({
      where: {
        creator_id: config.user_id,
        status: { [Op.in]: ['pending', 'in_progress'] },
        due_date: { [Op.lt]: today }
      }
    });

    for (const task of tasks) {
      await sendReminder(user, task, config.channel, 'overdue');
    }
  }
};

// 启动定时任务
const startCronJobs = () => {
  // 每日早上8点提醒
  cron.schedule('0 8 * * *', dailyReminder);

  // 每天9点检查逾期
  cron.schedule('0 9 * * *', overdueReminder);

  console.log('⏰ 定时任务已启动');
};

// 手动触发提醒
const triggerReminder = async (userId, taskId, type) => {
  const user = await User.findByPk(userId);
  const task = await Task.findByPk(taskId);
  const configs = await ReminderConfig.findAll({
    where: { user_id: userId, reminder_type: type, is_enabled: true }
  });

  for (const config of configs) {
    await sendReminder(user, task, config.channel, type);
  }
};

module.exports = { startCronJobs, triggerReminder, dailyReminder, overdueReminder };
