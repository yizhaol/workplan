/*
 Navicat Premium Dump SQL

 Source Server         : fnOS
 Source Server Type    : MySQL
 Source Server Version : 80036 (8.0.36)
 Source Host           : 192.168.1.10:3306
 Source Schema         : workplan

 Target Server Type    : MySQL
 Target Server Version : 80036 (8.0.36)
 File Encoding         : 65001

 Date: 25/02/2026 21:21:45
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for reminder_configs
-- ----------------------------
DROP TABLE IF EXISTS `reminder_configs`;
CREATE TABLE `reminder_configs`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL COMMENT '用户ID',
  `is_global` tinyint(1) NULL DEFAULT 0 COMMENT '是否全局配置',
  `reminder_type` enum('daily','weekly','start','due','overdue','status_change') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '提醒类型',
  `channel` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '提醒渠道: email/dingtalk/wecom',
  `time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '提醒时间，如 \"08:00\"',
  `week_days` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '周几提醒，用逗号分隔，如 \"1,3,5\"',
  `is_enabled` tinyint(1) NULL DEFAULT 1 COMMENT '是否启用',
  `can_modify` tinyint(1) NULL DEFAULT 1 COMMENT '用户是否可修改',
  `template_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '自定义模板内容',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `reminder_configs_user_id`(`user_id` ASC) USING BTREE,
  INDEX `reminder_configs_is_global`(`is_global` ASC) USING BTREE,
  CONSTRAINT `reminder_configs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of reminder_configs
-- ----------------------------

-- ----------------------------
-- Table structure for reminder_records
-- ----------------------------
DROP TABLE IF EXISTS `reminder_records`;
CREATE TABLE `reminder_records`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL COMMENT '接收用户',
  `task_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL COMMENT '关联任务',
  `reminder_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '提醒类型',
  `channel` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '发送渠道',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '发送内容',
  `send_at` datetime NULL DEFAULT NULL COMMENT '发送时间',
  `status` enum('pending','sent','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pending' COMMENT '状态',
  `error_msg` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '错误信息',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `reminder_records_user_id`(`user_id` ASC) USING BTREE,
  INDEX `reminder_records_task_id`(`task_id` ASC) USING BTREE,
  INDEX `reminder_records_send_at`(`send_at` ASC) USING BTREE,
  CONSTRAINT `reminder_records_ibfk_49` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reminder_records_ibfk_50` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of reminder_records
-- ----------------------------

-- ----------------------------
-- Table structure for task_logs
-- ----------------------------
DROP TABLE IF EXISTS `task_logs`;
CREATE TABLE `task_logs`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `task_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '任务ID',
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL COMMENT '操作人',
  `action` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '操作类型: create/update/status/assign/comment/delete',
  `field_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '字段名',
  `old_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '旧值',
  `new_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '新值',
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '备注',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `task_logs_task_id`(`task_id` ASC) USING BTREE,
  INDEX `task_logs_user_id`(`user_id` ASC) USING BTREE,
  INDEX `task_logs_created_at`(`created_at` ASC) USING BTREE,
  CONSTRAINT `task_logs_ibfk_49` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `task_logs_ibfk_50` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of task_logs
-- ----------------------------
INSERT INTO `task_logs` VALUES ('8db934f1-c35c-4acd-b6ad-e42856a1fd3a', '755cfea1-2b7f-45e7-b729-def25bb95e02', '4fcaf0c4-702c-4374-aa41-d83d7338d47f', 'create', NULL, NULL, '{\"title\":\"测试任务2\",\"description\":\"测试任务描述2\",\"priority\":\"medium\",\"assignee_id\":null,\"start_date\":\"2026-02-26\",\"due_date\":\"2026-02-26\",\"parent_id\":null}', NULL, '2026-02-25 17:22:59', '2026-02-25 17:22:59');
INSERT INTO `task_logs` VALUES ('b9c79833-311d-408e-81eb-5f76ac11f3de', '41446f09-8f9c-49aa-9e51-e2c0ef3c93b0', '4fcaf0c4-702c-4374-aa41-d83d7338d47f', 'create', NULL, NULL, '{\"title\":\"测试任务1\",\"description\":\"测试任务描述1\",\"priority\":\"medium\",\"assignee_id\":null,\"start_date\":\"2026-02-17\",\"due_date\":\"2026-02-18\",\"parent_id\":null}', NULL, '2026-02-25 17:22:22', '2026-02-25 17:22:22');

-- ----------------------------
-- Table structure for tasks
-- ----------------------------
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '任务标题',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '任务描述',
  `status` enum('pending','in_progress','completed','cancelled','overdue') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pending' COMMENT '状态',
  `priority` enum('low','medium','high','urgent') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'medium' COMMENT '优先级',
  `start_date` date NULL DEFAULT NULL COMMENT '开始日期',
  `due_date` date NULL DEFAULT NULL COMMENT '截止日期',
  `completed_at` datetime NULL DEFAULT NULL COMMENT '完成时间',
  `parent_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL COMMENT '父任务ID',
  `creator_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '创建人',
  `assignee_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL COMMENT '负责人',
  `extra_fields` json NULL COMMENT '自定义拓展字段',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `tasks_status`(`status` ASC) USING BTREE,
  INDEX `tasks_creator_id`(`creator_id` ASC) USING BTREE,
  INDEX `tasks_assignee_id`(`assignee_id` ASC) USING BTREE,
  INDEX `tasks_parent_id`(`parent_id` ASC) USING BTREE,
  INDEX `tasks_due_date`(`due_date` ASC) USING BTREE,
  INDEX `tasks_created_at`(`created_at` ASC) USING BTREE,
  CONSTRAINT `tasks_ibfk_73` FOREIGN KEY (`parent_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `tasks_ibfk_74` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tasks_ibfk_75` FOREIGN KEY (`assignee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tasks
-- ----------------------------
INSERT INTO `tasks` VALUES ('41446f09-8f9c-49aa-9e51-e2c0ef3c93b0', '测试任务1', '测试任务描述1', 'pending', 'medium', '2026-02-17', '2026-02-18', NULL, NULL, '4fcaf0c4-702c-4374-aa41-d83d7338d47f', NULL, NULL, 0, '2026-02-25 17:22:22', '2026-02-25 17:22:22');
INSERT INTO `tasks` VALUES ('755cfea1-2b7f-45e7-b729-def25bb95e02', '测试任务2', '测试任务描述2', 'pending', 'medium', '2026-02-26', '2026-02-26', NULL, NULL, '4fcaf0c4-702c-4374-aa41-d83d7338d47f', NULL, NULL, 0, '2026-02-25 17:22:59', '2026-02-25 17:22:59');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账号',
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码',
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '昵称',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '邮箱',
  `role` enum('user','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'user' COMMENT '角色: user-普通用户, admin-管理员',
  `status` enum('active','disabled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'active' COMMENT '状态',
  `last_login_at` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_2`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_3`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_4`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_5`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_6`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_7`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_8`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_9`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_10`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_11`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_12`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_13`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_14`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_15`(`username` ASC) USING BTREE,
  INDEX `users_username`(`username` ASC) USING BTREE,
  INDEX `users_email`(`email` ASC) USING BTREE,
  UNIQUE INDEX `username_16`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_17`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_18`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_19`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_20`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_21`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_22`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_23`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_24`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_25`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_26`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_27`(`username` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('4fcaf0c4-702c-4374-aa41-d83d7338d47f', 'admin', '$2a$10$idH5N1oxrsj3MirLbF2LOup7zGhBxmSBAHs/iYvYHBwhn3mLej0uu', 'admin', '', 'admin', 'active', '2026-02-25 19:15:35', '2026-02-25 01:07:56', '2026-02-25 19:15:35');

SET FOREIGN_KEY_CHECKS = 1;
