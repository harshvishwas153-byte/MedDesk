-- ============================================================================
-- MedDesk Online Healthcare Management System - Database Schema & Seed Data
-- Database Target: MySQL 8.0+ / Local MySQL Server
-- Engine: InnoDB | Charset: utf8mb4
-- ============================================================================

-- 1. Create Database
CREATE DATABASE IF NOT EXISTS meddesk_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE meddesk_db;

-- Disable Foreign Key checks for clean recreation
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS patient_feedback;
DROP TABLE IF EXISTS doctor_schedules;
DROP TABLE IF EXISTS medical_records;
DROP TABLE IF EXISTS billing_invoices;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 2. Create Core Tables
-- ============================================================================

-- Table: users (Handles Patients, Doctors, Administrators)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL DEFAULT 'pbkdf2_sha256_hashed_pwd',
    role ENUM('PATIENT', 'DOCTOR', 'ADMIN') NOT NULL DEFAULT 'PATIENT',
    phone VARCHAR(20),
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    avatar_url VARCHAR(255),
    status ENUM('ACTIVE', 'SUSPENDED', 'PENDING') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: doctors (Doctor Specialty Profile & Consultation Rates)
CREATE TABLE doctors (
    doctor_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    experience_years INT DEFAULT 5,
    consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    hospital_affiliation VARCHAR(150) DEFAULT 'MedDesk Super Specialty Hospital',
    rating DECIMAL(3,2) DEFAULT 4.80,
    review_count INT DEFAULT 120,
    availability_status ENUM('AVAILABLE', 'BUSY', 'ON_LEAVE') DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_doc_specialization (specialization),
    INDEX idx_doc_dept (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: appointments (Patient OPD & Online Consultation Bookings)
CREATE TABLE appointments (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    department VARCHAR(100) NOT NULL,
    hospital VARCHAR(150) DEFAULT 'MedDesk Main Campus',
    consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    status ENUM('CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED') DEFAULT 'CONFIRMED',
    reason VARCHAR(255),
    clinical_notes TEXT,
    prescription TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    INDEX idx_apt_patient (patient_id),
    INDEX idx_apt_doctor (doctor_id),
    INDEX idx_apt_date (appointment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: billing_invoices (Consultation Payment & PDF Slip Invoices)
CREATE TABLE billing_invoices (
    invoice_id VARCHAR(50) PRIMARY KEY,
    appointment_id VARCHAR(50) NOT NULL,
    patient_id VARCHAR(50) NOT NULL,
    doctor_fee DECIMAL(10,2) NOT NULL,
    vitals_fee DECIMAL(10,2) DEFAULT 50.00,
    vault_fee DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_mode VARCHAR(50) DEFAULT 'UPI / Online',
    payment_status ENUM('PAID', 'PENDING', 'REFUNDED') DEFAULT 'PAID',
    transaction_ref VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: medical_records (EHR Health Vault Documents & Lab Reports)
CREATE TABLE medical_records (
    record_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    record_date DATE NOT NULL,
    doctor_name VARCHAR(100),
    facility VARCHAR(150) DEFAULT 'MedDesk Pathology Labs',
    file_type VARCHAR(20) DEFAULT 'PDF',
    file_size VARCHAR(20) DEFAULT '1.2 MB',
    clinical_notes TEXT,
    download_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_record_patient (patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: doctor_schedules (Doctor Calendar Shift Schedules)
CREATE TABLE doctor_schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id VARCHAR(50) NOT NULL,
    day_of_week ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_patients INT DEFAULT 20,
    is_active TINYINT(1) DEFAULT 1,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: patient_feedback (Doctor Ratings & Reviews)
CREATE TABLE patient_feedback (
    feedback_id VARCHAR(50) PRIMARY KEY,
    doctor_id VARCHAR(50) NOT NULL,
    patient_id VARCHAR(50) NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 3. Seed Sample Data
-- ============================================================================

-- Insert Users (Patients, Doctors, Admin)
INSERT INTO users (id, name, email, password_hash, role, phone, gender, blood_group, avatar_url, status) VALUES
('usr-1', 'Harsh Vishwas', 'harsh@example.com', 'hash_harsh123', 'PATIENT', '+91 98765 43210', 'Male', 'O+', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'ACTIVE'),
('usr-2', 'Dr. Priya Sharma', 'priya.sharma@meddesk.org', 'hash_doc123', 'DOCTOR', '+91 98111 22334', 'Female', 'A+', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150', 'ACTIVE'),
('usr-3', 'Dr. Rajesh Kumar', 'rajesh.kumar@meddesk.org', 'hash_doc456', 'DOCTOR', '+91 98222 33445', 'Male', 'B+', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150', 'ACTIVE'),
('usr-4', 'System Administrator', 'admin@meddesk.org', 'hash_admin789', 'ADMIN', '+91 99999 00000', 'Male', 'AB+', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'ACTIVE');

-- Insert Doctors
INSERT INTO doctors (doctor_id, user_id, specialization, department, experience_years, consultation_fee, hospital_affiliation, rating, review_count, availability_status) VALUES
('doc-1', 'usr-2', 'Cardiologist', 'Cardiology & Heart Care', 12, 800.00, 'MedDesk Heart Institute', 4.90, 142, 'AVAILABLE'),
('doc-2', 'usr-3', 'Neurologist', 'Neurology Department', 15, 1000.00, 'MedDesk Super Specialty Hospital', 4.85, 98, 'AVAILABLE');

-- Insert Appointments
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, department, hospital, consultation_fee, status, reason, clinical_notes) VALUES
('apt-101', 'usr-1', 'doc-1', '2026-10-05', '10:00 AM', 'Cardiology & Heart Care', 'MedDesk Heart Institute', 800.00, 'CONFIRMED', 'Routine Cardiac Checkup & BP Monitoring', 'Patient shows stable vitals. Prescribed ECOSPRIN 75mg once daily.'),
('apt-102', 'usr-1', 'doc-2', '2026-10-12', '02:30 PM', 'Neurology Department', 'MedDesk Super Specialty Hospital', 1000.00, 'CONFIRMED', 'Frequent Headache & Migraine Consultation', 'Pending MRI Brain review.');

-- Insert Billing Invoices
INSERT INTO billing_invoices (invoice_id, appointment_id, patient_id, doctor_fee, vitals_fee, vault_fee, discount_amount, tax_amount, total_amount, payment_mode, payment_status, transaction_ref) VALUES
('inv-101', 'apt-101', 'usr-1', 800.00, 50.00, 0.00, 50.00, 144.00, 944.00, 'UPI / PhonePe', 'PAID', 'TXN_9876543210_MED'),
('inv-102', 'apt-102', 'usr-1', 1000.00, 50.00, 0.00, 0.00, 189.00, 1239.00, 'Credit Card', 'PAID', 'TXN_9876543211_MED');

-- Insert Medical Records
INSERT INTO medical_records (record_id, patient_id, title, category, record_date, doctor_name, facility, file_type, file_size, clinical_notes, download_url) VALUES
('rec-1', 'usr-1', 'Comprehensive Blood Count (CBC) & Lipid Profile', 'Lab Report', '2026-09-15', 'Dr. Priya Sharma', 'MedDesk Central Pathology Lab', 'PDF', '1.4 MB', 'All cholesterol levels within normal range. Hb: 14.2 g/dL.', '#'),
('rec-2', 'usr-1', 'Chest X-Ray & ECG Report', 'Radiology', '2026-08-20', 'Dr. Rajesh Kumar', 'MedDesk Imaging Center', 'PDF', '3.8 MB', 'Normal sinus rhythm. Lung fields clear.', '#');

-- Insert Doctor Schedules
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, max_patients, is_active) VALUES
('doc-1', 'MONDAY', '09:00:00', '13:00:00', 15, 1),
('doc-1', 'WEDNESDAY', '09:00:00', '13:00:00', 15, 1),
('doc-1', 'FRIDAY', '14:00:00', '18:00:00', 15, 1),
('doc-2', 'TUESDAY', '10:00:00', '16:00:00', 20, 1),
('doc-2', 'THURSDAY', '10:00:00', '16:00:00', 20, 1);

-- Insert Patient Feedback
INSERT INTO patient_feedback (feedback_id, doctor_id, patient_id, rating, review_text) VALUES
('fb-1', 'doc-1', 'usr-1', 5, 'Dr. Priya Sharma listened attentively and explained the cardiac treatment plan clearly.'),
('fb-2', 'doc-2', 'usr-1', 5, 'Excellent diagnostic skills. High quality consultation.');

-- ============================================================================
-- Verification Query
-- ============================================================================
SELECT 'Database schema created and seed data populated successfully!' AS status;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_doctors FROM doctors;
SELECT COUNT(*) AS total_appointments FROM appointments;
