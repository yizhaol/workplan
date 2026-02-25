const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');

// 注册
exports.register = async (req, res) => {
  try {
    const { username, password, nickname, email } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      nickname: nickname || username,
      email
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: '注册成功',
      user: { id: user.id, username: user.username, nickname: user.nickname, role: user.role },
      token
    });
  } catch (error) {
    res.status(500).json({ error: '注册失败' });
  }
};

// 登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    if (user.status === 'disabled') {
      return res.status(401).json({ error: '账户已被禁用' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    await user.update({ last_login_at: new Date() });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: '登录成功',
      user: { id: user.id, username: user.username, nickname: user.nickname, role: user.role, email: user.email },
      token
    });
  } catch (error) {
    res.status(500).json({ error: '登录失败' });
  }
};

// 获取当前用户信息
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: '获取用户信息失败' });
  }
};

// 修改密码
exports.changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    const user = await User.findByPk(req.user.id);

    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: '原密码错误' });
    }

    user.password = await bcrypt.hash(new_password, 10);
    await user.save();

    res.json({ message: '密码修改成功' });
  } catch (error) {
    res.status(500).json({ error: '密码修改失败' });
  }
};

// 获取所有用户（管理员）
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, keyword } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (keyword) where.username = { [Op.like]: `%${keyword}%` };

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      data: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ error: '获取用户列表失败' });
  }
};

// 切换用户状态（管理员）
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    user.status = user.status === 'active' ? 'disabled' : 'active';
    await user.save();

    res.json({ message: '状态更新成功', user });
  } catch (error) {
    res.status(500).json({ error: '操作失败' });
  }
};

// 重置用户密码（管理员）
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;
    console.log('重置密码请求:', id, new_password);  // 添加这行
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: '用户不存在' });
    user.password = await bcrypt.hash(new_password, 10);
    await user.save();
    res.json({ message: '密码重置成功' });
  } catch (error) {
    console.error('重置密码错误:', error);  // 添加这行
    res.status(500).json({ error: '操作失败' });
  }
};
