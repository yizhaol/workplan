const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReminderConfig = sequelize.define('ReminderConfig', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    comment: '用户ID'
  },
  is_global: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否全局配置'
  },
  reminder_type: {
    type: DataTypes.ENUM('daily', 'weekly', 'start', 'due', 'overdue', 'status_change'),
    comment: '提醒类型'
  },
  channel: {
    type: DataTypes.STRING(50),
    comment: '提醒渠道: email/dingtalk/wecom'
  },
  time: {
    type: DataTypes.STRING(20),
    comment: '提醒时间，如 "08:00"'
  },
  week_days: {
    type: DataTypes.STRING(50),
    comment: '周几提醒，用逗号分隔，如 "1,3,5"'
  },
  is_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否启用'
  },
  can_modify: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '用户是否可修改'
  },
  template_content: {
    type: DataTypes.TEXT,
    comment: '自定义模板内容'
  }
}, {
  tableName: 'reminder_configs',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['is_global'] }
  ]
});

module.exports = ReminderConfig;
