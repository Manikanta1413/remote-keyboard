CREATE DATABASE remote_keyboard;
USE REMOTE_KEYBOARD;

CREATE TABLE `keys` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_number INT UNIQUE NOT NULL,
    status ENUM('off', 'red', 'yellow') DEFAULT 'off',
    controlled_by INT DEFAULT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
);

CREATE TABLE `control` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    status ENUM('off', 'red', 'yellow') DEFAULT 'off',
    controlled_by INT DEFAULT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
);