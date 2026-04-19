CREATE DATABASE IF NOT EXISTS eyesleepmask;
USE eyesleepmask;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    birthdate DATE NOT NULL,
    age INT NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    password VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sleep_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    bedtime TIME NOT NULL DEFAULT '00:20:00',
    alarm_end TIME NOT NULL DEFAULT '05:20:00',
    alarm_enabled TINYINT(1) NOT NULL DEFAULT 1,
    smart_alarm_enabled TINYINT(1) NOT NULL DEFAULT 1,
    snooze_minutes TINYINT UNSIGNED NOT NULL DEFAULT 15,
    wakeup_minutes TINYINT UNSIGNED NOT NULL DEFAULT 30,
    remind_to_sleep TINYINT(1) NOT NULL DEFAULT 1,
    alarm_days_json TEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sleep_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sleep_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_date DATE NOT NULL,
    bedtime TIME NOT NULL,
    alarm_end TIME NOT NULL,
    duration_minutes SMALLINT UNSIGNED NOT NULL,
    sleep_score TINYINT UNSIGNED DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sleep_sessions_user_date (user_id, session_date),
    UNIQUE KEY uq_sleep_sessions_user_date (user_id, session_date),
    CONSTRAINT fk_sleep_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS telemetry_samples (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    device VARCHAR(80) NOT NULL,
    snore_level TINYINT UNSIGNED NOT NULL DEFAULT 0,
    movement TINYINT UNSIGNED NOT NULL DEFAULT 0,
    battery TINYINT UNSIGNED NOT NULL DEFAULT 0,
    heart_rate SMALLINT UNSIGNED DEFAULT NULL,
    recorded_at DATETIME DEFAULT NULL,
    received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_telemetry_user_received (user_id, received_at),
    INDEX idx_telemetry_received (received_at),
    CONSTRAINT fk_telemetry_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS motion_samples (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    motion INT NOT NULL,
    sample_time DATETIME NOT NULL,
    received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_motion_user_time (user_id, sample_time),
    INDEX idx_motion_received (received_at),
    CONSTRAINT fk_motion_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sleep_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    note_date DATE NOT NULL,
    note_text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_sleep_notes_user_date (user_id, note_date),
    INDEX idx_sleep_notes_user_date (user_id, note_date),
    CONSTRAINT fk_sleep_notes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
