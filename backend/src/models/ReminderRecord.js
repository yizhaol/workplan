const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReminderRecord = sequelize.define('ReminderRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    comment: '接收用户'
  },
  task_id: {
    type: DataTypes.UUID,
    comment: '关联任务'
  },
  reminder_type: {
    type: DataTypes.STRING(50),
    comment: '提醒类型'
  },
  channel: {
    type: DataTypes.STRING(50),
    comment: '发送渠道'
  },
  content: {
    type: DataTypes.TEXT,
    comment: '发送内容'
  },
  send_at: {
    type: DataTypes.DATE,
    comment: '发送时间'
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'failed'),
    defaultValue: 'pending',
    comment: '状态'
  },
  error_msg: {
    type: DataTypes.TEXT,
    comment: '错误信息'
  }
}, {
  tableName: 'reminder_records',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['task_id'] },
    { fields: ['send_at'] }
  ]
});

module.exports = ReminderRecord;
