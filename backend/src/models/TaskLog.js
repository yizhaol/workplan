const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TaskLog = sequelize.define('TaskLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  task_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '任务ID'
  },
  user_id: {
    type: DataTypes.UUID,
    comment: '操作人'
  },
  action: {
    type: DataTypes.STRING(50),
    comment: '操作类型: create/update/status/assign/comment/delete'
  },
  field_name: {
    type: DataTypes.STRING(50),
    comment: '字段名'
  },
  old_value: {
    type: DataTypes.TEXT,
    comment: '旧值'
  },
  new_value: {
    type: DataTypes.TEXT,
    comment: '新值'
  },
  remark: {
    type: DataTypes.TEXT,
    comment: '备注'
  }
}, {
  tableName: 'task_logs',
  indexes: [
    { fields: ['task_id'] },
    { fields: ['user_id'] },
    { fields: ['created_at'] }
  ]
});

module.exports = TaskLog;
