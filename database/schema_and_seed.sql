CREATE DATABASE IF NOT EXISTS student_recruitment CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE student_recruitment;

DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS student_profiles;
DROP TABLE IF EXISTS employer_profiles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student','employer','admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_profiles (
  user_id INT PRIMARY KEY,
  full_name VARCHAR(255),
  university VARCHAR(255),
  major VARCHAR(255),
  skills TEXT,
  cv_file_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE employer_profiles (
  user_id INT PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  description TEXT,
  is_verified TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE jobs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employer_user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  type ENUM('job','internship') NOT NULL,
  location VARCHAR(255) NOT NULL,
  tags TEXT,
  description TEXT NOT NULL,
  status ENUM('open','closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employer_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  job_id INT NOT NULL,
  student_user_id INT NOT NULL,
  status ENUM('submitted','shortlisted','accepted','rejected') DEFAULT 'submitted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (student_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_student_job (job_id, student_user_id)
);

-- SEED DATA
-- password for all seeded accounts: Password123!
-- bcrypt hash (cost 10): $2b$10$wJY1U9sH5bF7bN7hJ0j7kO0B4Qwz4vLq3xR9l3h5L6l2l3xG9S8Q2

INSERT INTO users (email, password_hash, role) VALUES
('admin@platform.local', '$2b$10$wJY1U9sH5bF7bN7hJ0j7kO0B4Qwz4vLq3xR9l3h5L6l2l3xG9S8Q2', 'admin');

INSERT INTO users (email, password_hash, role) VALUES
('student1@platform.local', '$2b$10$wJY1U9sH5bF7bN7hJ0j7kO0B4Qwz4vLq3xR9l3h5L6l2l3xG9S8Q2', 'student'),
('student2@platform.local', '$2b$10$wJY1U9sH5bF7bN7hJ0j7kO0B4Qwz4vLq3xR9l3h5L6l2l3xG9S8Q2', 'student');

INSERT INTO student_profiles (user_id, full_name, university, major, skills) VALUES
(2, 'Aylin Demir', 'Üsküdar University', 'Software Engineering', 'JavaScript, Node.js, SQL, REST'),
(3, 'Omar Hassan', 'Üsküdar University', 'Computer Engineering', 'Python, Data Analysis, SQL, APIs');

INSERT INTO users (email, password_hash, role) VALUES
('hr@techwave.local', '$2b$10$wJY1U9sH5bF7bN7hJ0j7kO0B4Qwz4vLq3xR9l3h5L6l2l3xG9S8Q2', 'employer'),
('jobs@brightlabs.local', '$2b$10$wJY1U9sH5bF7bN7hJ0j7kO0B4Qwz4vLq3xR9l3h5L6l2l3xG9S8Q2', 'employer');

INSERT INTO employer_profiles (user_id, company_name, contact_name, website, is_verified, description) VALUES
(4, 'TechWave', 'Selin Kaya', 'https://example.com', 1, 'Software company offering internships and junior roles.'),
(5, 'BrightLabs', 'Mert Yilmaz', 'https://example.com', 0, 'Startup with roles in web development.');

INSERT INTO jobs (employer_user_id, title, type, location, tags, description, status) VALUES
(4, 'Junior Web Developer', 'job', 'Istanbul', 'JavaScript, Node.js, SQL', 'Work on web features, APIs, and database tasks.', 'open'),
(4, 'Software Engineering Intern', 'internship', 'Remote', 'JavaScript, REST, Git', 'Internship focused on building small features and learning code reviews.', 'open'),
(4, 'Data Analyst Intern', 'internship', 'Istanbul', 'Python, SQL, Data Analysis', 'Analyze datasets and create reports.', 'open');

INSERT INTO applications (job_id, student_user_id, status) VALUES
(1, 2, 'submitted'),
(2, 3, 'shortlisted');
