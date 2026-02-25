const sequelize = require('../config/database');
const User = require('./User');
const Task = require('./Task');
const TaskLog = require('./TaskLog');
const ReminderConfig = require('./ReminderConfig');
const ReminderRecord = require('./ReminderRecord');

// 关联关系
User.hasMany(Task, { foreignKey: 'creator_id', as: 'createdTasks' });
User.hasMany(Task, { foreignKey: 'assignee_id', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'creator_id', as: 'creator' });
Task.belongsTo(User, { foreignKey: 'assignee_id', as: 'assignee' });

Task.hasMany(TaskLog, { foreignKey: 'task_id', as: 'logs' });
TaskLog.belongsTo(Task, { foreignKey: 'task_id' });
TaskLog.belongsTo(User, { foreignKey: 'user_id', as: 'operator' });

User.hasMany(ReminderConfig, { foreignKey: 'user_id', as: 'reminderConfigs' });
ReminderConfig.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(ReminderRecord, { foreignKey: 'user_id', as: 'reminderRecords' });
ReminderRecord.belongsTo(User, { foreignKey: 'user_id' });
ReminderRecord.belongsTo(Task, { foreignKey: 'task_id' });

const db = {
  sequelize,
  User,
  Task,
  TaskLog,
  ReminderConfig,
  ReminderRecord
};

// 初始化数据库
const initDb = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ 数据库同步完成');
    return true;
  } catch (error) {
    console.error('❌ 数据库同步失败:', error);
    return false;
  }
};

module.exports = { ...db, initDb };
