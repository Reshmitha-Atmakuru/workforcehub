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
  `project_id` BIGINT DEFAULT NULL,
  `employee_id` BIGINT DEFAULT NULL,
  `priority` VARCHAR(20) DEFAULT 'MEDIUM',
  `status` VARCHAR(20) DEFAULT 'TODO',
  `progress` INT DEFAULT 0,
  `due_date` DATE DEFAULT NULL,
  `remarks` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_tasks_project` (`project_id`),
  KEY `fk_tasks_employee` (`employee_id`),
  CONSTRAINT `fk_tasks_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tasks_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table Structure: departments
-- --------------------------------------------------------
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `location` VARCHAR(100) DEFAULT NULL,
  `budget` DECIMAL(12,2) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_departments_code` (`code`),
  UNIQUE KEY `uk_departments_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table Structure: audit_logs
-- --------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `action` VARCHAR(50) NOT NULL,
  `entity_type` VARCHAR(50) DEFAULT NULL,
  `entity_id` VARCHAR(50) DEFAULT NULL,
  `performed_by` VARCHAR(50) NOT NULL,
  `details` VARCHAR(1000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable Foreign Key Checks
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- Seed Initial Data
-- Passwords are BCrypt encrypted hashes of 'password123'
-- Default login: admin / password123, kiran / password123, priya / password123
-- Default emails: admin@workforcehub.com, kiran.reddy@workforcehub.com, priya.sharma@workforcehub.com
-- ========================================================

INSERT INTO `users` (`id`, `username`, `email`, `password`, `first_name`, `last_name`, `role`, `department`) VALUES
(1, 'admin', 'admin@workforcehub.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi', 'Rajesh', 'Kumar', 'ROLE_ADMIN', 'Management'),
(2, 'kiran', 'kiran.reddy@workforcehub.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi', 'Kiran', 'Reddy', 'ROLE_EMPLOYEE', 'Engineering'),
(3, 'priya', 'priya.sharma@workforcehub.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi', 'Priya', 'Sharma', 'ROLE_MANAGER', 'Product'),
(4, 'Vikram', 'vikram@gmail.com', 'vikramMal', 'Vikram', 'M', 'ROLE_EMPLOYEE', 'Engineering'),
(5, 'Riya', 'riya@gmail.com', 'riyajoseph', 'Riya', 'joseph', 'ROLE_HR', 'Engineering'),
(6, 'Krishna', 'krishna@gmail.com', '12345678', 'Krishna', 'K', 'ROLE_EMPLOYEE', 'Human Resources');

INSERT INTO `employees` (`id`, `code`, `first_name`, `last_name`, `email`, `phone`, `department`, `job_title`, `account_role`, `salary`, `join_date`, `status`, `office_location`, `user_id`) VALUES
(1, 'EMP-1001', 'Kiran', 'Reddy', 'kiran.reddy@workforcehub.com', '+91 98765 43210', 'Engineering', 'Senior Full Stack Developer', 'ROLE_EMPLOYEE', 1200000.00, '2024-01-15', 'ACTIVE', 'Hyderabad, TS', 2),
(2, 'EMP-1002', 'Priya', 'Sharma', 'priya.sharma@workforcehub.com', '+91 98765 43211', 'Product', 'Product Director', 'ROLE_MANAGER', 1800000.00, '2023-06-10', 'ACTIVE', 'Bengaluru, KA', 3),
(3, 'EMP-1003', 'Rahul', 'Verma', 'rahul.verma@workforcehub.com', '+91 98765 43212', 'Engineering', 'DevOps & Cloud Engineer', 'ROLE_EMPLOYEE', 950000.00, '2025-02-01', 'ACTIVE', 'Pune, MH', NULL);

INSERT INTO `employee_skills` (`employee_id`, `skill`) VALUES
(1, 'Java'), (1, 'Spring Boot'), (1, 'ReactJS'), (1, 'MySQL'),
(2, 'Agile Project Management'), (2, 'System Architecture'), (2, 'JIRA'),
(3, 'Kubernetes'), (3, 'AWS'), (3, 'Docker'), (3, 'CI/CD Pipelines');

INSERT INTO `projects` (`id`, `code`, `name`, `description`, `department`, `priority`, `status`, `progress`, `budget`, `start_date`, `deadline`) VALUES
(1, 'PRJ-101', 'Enterprise Cloud Migration', 'Migrate legacy infrastructure to AWS cloud microservices.', 'Engineering', 'HIGH', 'In Progress', 0, 1200000.00, '2026-01-10', '2026-08-30'),
(2, 'PRJ-102', 'Smart Workforce Portal', 'Next-gen employee lifecycle management platform.', 'Product', 'URGENT', 'In Progress', 50, 850000.00, '2026-02-01', '2026-07-31'),
(3, 'PRJ-103', 'Automated Payroll System', 'Real-time automated tax calculation and direct deposit.', 'Finance', 'MEDIUM', 'Not Started', 0, 500000.00, '2026-06-01', '2026-11-30');

INSERT INTO `tasks` (`id`, `task_number`, `title`, `description`, `project_id`, `employee_id`, `priority`, `status`, `progress`, `due_date`, `remarks`) VALUES
(1, 'TSK-1001', 'Implement JWT Security Layer', 'Setup Spring Security JWT authentication filter and token provider.', 2, 1, 'HIGH', 'COMPLETED', 100, '2026-07-20', 'Successfully integrated HMAC-SHA512 JWT.'),
(2, 'TSK-1002', 'Design Responsive React Dashboard', 'Build interactive analytics widgets using TailwindCSS & Lucide icons.', 2, 2, 'URGENT', 'IN_PROGRESS', 50, '2026-07-25', 'Components assembled, polishing charts.'),
(3, 'TSK-1003', 'Setup Kubernetes CI/CD Pipeline', 'Automate deployment workflow with Helm charts and GitHub Actions.', 1, 3, 'MEDIUM', 'TODO', 0, '2026-08-15', 'Pending staging environment creation.');

INSERT INTO `audit_logs` (`id`, `timestamp`, `action`, `entity_type`, `performed_by`, `details`) VALUES
(1, '2026-07-24 12:00:00', 'LOGIN', 'USER #admin', 'admin', 'User admin logged in successfully.'),
(2, '2026-07-24 12:05:00', 'CREATE', 'PROJECT PRJ-102', 'admin', 'Created enterprise project: Smart Workforce Portal'),
(3, '2026-07-24 12:10:00', 'CREATE', 'TASK TSK-1001', 'admin', 'Assigned task "Implement JWT Security Layer" to Kiran Reddy');
