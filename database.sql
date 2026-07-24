-- ========================================================
-- WorkforceHub Enterprise Database Schema & Seed Data Script
-- Target Database: MySQL 8.0+
-- Database Name: workforce_hub
-- ========================================================

CREATE DATABASE IF NOT EXISTS `workforce_hub` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `workforce_hub`;

-- Disable Foreign Key Checks for clean table recreation
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Table Structure: users
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'ROLE_EMPLOYEE',
  `department` VARCHAR(50) DEFAULT 'General',
  `profile_image_url` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table Structure: employees
-- --------------------------------------------------------
DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL,
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `department` VARCHAR(50) NOT NULL,
  `job_title` VARCHAR(100) DEFAULT NULL,
  `account_role` VARCHAR(20) DEFAULT 'ROLE_EMPLOYEE',
  `salary` DECIMAL(12,2) DEFAULT NULL,
  `join_date` DATE DEFAULT NULL,
  `status` VARCHAR(20) DEFAULT 'ACTIVE',
  `office_location` VARCHAR(100) DEFAULT NULL,
  `user_id` BIGINT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_employees_code` (`code`),
  UNIQUE KEY `uk_employees_email` (`email`),
  KEY `fk_employees_user` (`user_id`),
  CONSTRAINT `fk_employees_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table Structure: employee_skills
-- --------------------------------------------------------
DROP TABLE IF EXISTS `employee_skills`;
CREATE TABLE `employee_skills` (
  `employee_id` BIGINT NOT NULL,
  `skill` VARCHAR(255) DEFAULT NULL,
  KEY `fk_employee_skills` (`employee_id`),
  CONSTRAINT `fk_employee_skills` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table Structure: projects
-- --------------------------------------------------------
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(1000) DEFAULT NULL,
  `department` VARCHAR(50) NOT NULL,
  `priority` VARCHAR(20) DEFAULT 'MEDIUM',
  `status` VARCHAR(30) DEFAULT 'In Progress',
  `progress` INT DEFAULT 0,
  `budget` DECIMAL(12,2) DEFAULT NULL,
  `start_date` DATE DEFAULT NULL,
  `deadline` DATE DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_projects_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table Structure: tasks
-- --------------------------------------------------------
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `task_number` VARCHAR(30) DEFAULT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` VARCHAR(1000) DEFAULT NULL,
  `project_id` BIGINT NOT NULL,
  `employee_id` BIGINT DEFAULT NULL,
  `priority` VARCHAR(20) DEFAULT 'MEDIUM',
  `status` VARCHAR(30) DEFAULT 'TODO',
  `progress` INT DEFAULT 0,
  `due_date` DATE DEFAULT NULL,
  `remarks` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_tasks_project` (`project_id`),
  KEY `fk_tasks_employee` (`employee_id`),
  CONSTRAINT `fk_tasks_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tasks_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table Structure: audit_logs
-- --------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `action` VARCHAR(50) NOT NULL,
  `entity_type` VARCHAR(50) NOT NULL,
  `entity_id` VARCHAR(50) DEFAULT NULL,
  `performed_by` VARCHAR(100) NOT NULL,
  `details` VARCHAR(1000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable Foreign Key Checks
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- Seed Data Initialization
-- Admin Account (BCrypt hash for 'admin123')
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `username`, `email`, `password`, `first_name`, `last_name`, `role`, `department`)
VALUES
(1, 'admin', 'admin@workforcehub.com', '$2a$10$e8B/U93n64X/f60NlhDae..1mB/S4.8wN10S8E4X0q7ZgEaV9uP1O', 'Rajesh', 'Kumar', 'ROLE_ADMIN', 'Executive Operations')
ON DUPLICATE KEY UPDATE `username`=`username`;
