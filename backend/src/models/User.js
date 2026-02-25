const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '账号'
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '密码'
  },
  nickname: {
    type: DataTypes.STRING(50),
    comment: '昵称'
  },
  email: {
    type: DataTypes.STRING(100),
    comment: '邮箱'
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
    comment: '角色: user-普通用户, admin-管理员'
  },
  status: {
    type: DataTypes.ENUM('active', 'disabled'),
    defaultValue: 'active',
    comment: '状态'
  },
  last_login_at: {
    type: DataTypes.DATE,
    comment: '最后登录时间'
  }
}, {
  tableName: 'users',
  indexes: [
    { fields: ['username'] },
    { fields: ['email'] }
  ]
});

module.exports = User;
