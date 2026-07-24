-- Convert all database user passwords from BCrypt hashes to plain text strings
UPDATE users SET password = 'admin123' WHERE username IN ('admin', 'kiran', 'priya', 'admin2');
UPDATE users SET password = 'password123' WHERE username = 'Reshmitha.A';

-- Verify table data
SELECT id, username, email, role, password FROM users;
