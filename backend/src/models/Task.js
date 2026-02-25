const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '任务标题'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '任务描述'
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled', 'overdue'),
    defaultValue: 'pending',
    comment: '状态'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
    comment: '优先级'
  },
  start_date: {
    type: DataTypes.DATEONLY,
    comment: '开始日期'
  },
  due_date: {
    type: DataTypes.DATEONLY,
    comment: '截止日期'
  },
  completed_at: {
    type: DataTypes.DATE,
    comment: '完成时间'
  },
  parent_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: '父任务ID'
  },
  creator_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '创建人'
  },
  assignee_id: {
    type: DataTypes.UUID,
    comment: '负责人'
  },
  extra_fields: {
    type: DataTypes.JSON,
    comment: '自定义拓展字段'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序'
  }
}, {
  tableName: 'tasks',
  timestamps: true,  // 关键：启用时间戳
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 自关联
Task.hasMany(Task, { as: 'subtasks', foreignKey: 'parent_id' });
Task.belongsTo(Task, { as: 'parent', foreignKey: 'parent_id' });

module.exports = Task;