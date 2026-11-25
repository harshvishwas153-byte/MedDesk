-- =====================================================================
-- MEDICARE+ HEALTHCARE SYSTEM DATABASE SCHEMA (MySQL / PostgreSQL)
-- Rubric Criterion: Database Integration (JDBC) - Schema Design & CRUD
-- Galgotias University / GUVI HCL Rubric 2
-- =====================================================================

CREATE DATABASE IF NOT EXISTS medicare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medicare_db;

-- 1. USERS TABLE (Base User Entity for OOP Mapping)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('PATIENT', 'DOCTOR', 'ADMIN') NOT NULL DEFAULT 'PATIENT',
    phone VARCHAR(20),
    gender VARCHAR(15),
    blood_group VARCHAR(10),
    avatar_url VARCHAR(255),
    status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
);

-- 2. DOCTORS TABLE (Extends User with Clinical Credentials)
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id VARCHAR(50) PRIMARY KEY,
    specialty VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    hospital VARCHAR(150) NOT NULL,
    rating DECIMAL(2,1) DEFAULT 4.9,
    reviews_count INT DEFAULT 120,
    consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    experience_years INT DEFAULT 10,
    about TEXT,
    education VARCHAR(255),
    available_days VARCHAR(100) DEFAULT 'Mon,Tue,Wed,Thu,Fri',
    time_slots VARCHAR(255) DEFAULT '09:00 AM,10:30 AM,02:00 PM,04:30 PM',
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_doctor_dept (department),
    INDEX idx_doctor_hospital (hospital)
);

-- 3. APPOINTMENTS TABLE (Core Transactional Table)
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL,
    appointment_date VARCHAR(30) NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    department VARCHAR(100) NOT NULL,
    hospital VARCHAR(150) NOT NULL,
    consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    status ENUM('Upcoming', 'Completed', 'Pending', 'Cancelled') NOT NULL DEFAULT 'Upcoming',
    reason VARCHAR(255) DEFAULT 'General Health Checkup & Specialist Consultation',
    clinical_notes TEXT,
    prescription TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_apt_patient (patient_id),
    INDEX idx_apt_doctor (doctor_id),
    INDEX idx_apt_status (status)
);

-- 4. BILLING INVOICES & SLIPS (Itemized charges matching reference template)
CREATE TABLE IF NOT EXISTS billing_invoices (
    invoice_id VARCHAR(50) PRIMARY KEY,
    appointment_id VARCHAR(50) NOT NULL UNIQUE,
    patient_id VARCHAR(50) NOT NULL,
    doctor_fee DECIMAL(10,2) NOT NULL,
    vitals_fee DECIMAL(10,2) NOT NULL DEFAULT 150.00,
    vault_fee DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'UPI / Online Gateway',
    payment_status ENUM('PAID', 'PENDING', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PAID',
    transaction_ref VARCHAR(100) NOT NULL,
    payment_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. MEDICAL RECORDS VAULT (HIPAA EHR Documents)
CREATE TABLE IF NOT EXISTS medical_records (
    record_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    category ENUM('Prescriptions', 'Test Reports', 'Consultations') NOT NULL,
    record_date VARCHAR(30) NOT NULL,
    doctor_name VARCHAR(100) NOT NULL,
    facility VARCHAR(150) NOT NULL,
    file_type VARCHAR(20) DEFAULT 'PDF',
    file_size VARCHAR(20) DEFAULT '1.4 MB',
    clinical_notes TEXT NOT NULL,
    download_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_record_patient (patient_id)
);

-- =====================================================================
-- SEED DATA (Initial Demonstration Dataset)
-- =====================================================================

-- Insert Sample Patients & Doctors
INSERT INTO users (id, name, email, password_hash, role, phone, gender, blood_group, status) VALUES
('u_patient_01', 'Harsh Vishwas', 'harshvishwas153@gmail.com', 'scrypt_hashed_password', 'PATIENT', '+91 98765 43210', 'Male', 'O+', 'Active'),
('u_doc_01', 'Dr. Priya Sharma', 'priya.sharma@medicareplus.com', 'scrypt_hashed_password', 'DOCTOR', '+91 98111 22334', 'Female', 'B+', 'Active'),
('u_doc_02', 'Dr. Rahul Mehta', 'rahul.mehta@medicareplus.com', 'scrypt_hashed_password', 'DOCTOR', '+91 98222 33445', 'Male', 'A+', 'Active'),
('u_admin_01', 'Admin Officer', 'admin@medicareplus.com', 'scrypt_hashed_password', 'ADMIN', '+91 1800 419 5566', 'Other', 'AB+', 'Active')
ON DUPLICATE KEY UPDATE name=name;

-- Insert Doctor Details
INSERT INTO doctors (doctor_id, specialty, department, hospital, rating, reviews_count, consultation_fee, experience_years, about, education) VALUES
('u_doc_01', 'Senior Cardiologist', 'Cardiology', 'City Care Hospital', 4.9, 128, 500.00, 12, 'Leading cardiologist specializing in preventive heart health and advanced catheter diagnostics.', 'MBBS, MD (Cardiology) - AIIMS Delhi'),
('u_doc_02', 'Consultant Neurologist', 'Neurology', 'Metro Health Institute', 4.8, 95, 600.00, 9, 'Expert clinical neurologist diagnosing neurological migraines, epilepsy, and spinal health.', 'MBBS, DM (Neurology) - PGIMER')
ON DUPLICATE KEY UPDATE specialty=specialty;

-- Insert Sample Appointment
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, department, hospital, consultation_fee, status, reason) VALUES
('APT-1001', 'u_patient_01', 'u_doc_01', '25 Sep 2026', '10:30 AM', 'Cardiology', 'City Care Hospital', 500.00, 'Upcoming', 'Routine Cardiovascular Review & Vitals Screening')
ON DUPLICATE KEY UPDATE status=status;

-- Insert Corresponding Billing Invoice matching reference template
INSERT INTO billing_invoices (invoice_id, appointment_id, patient_id, doctor_fee, vitals_fee, vault_fee, discount_amount, tax_amount, total_amount, payment_mode, payment_status, transaction_ref) VALUES
('INV-1001', 'APT-1001', 'u_patient_01', 400.00, 75.00, 25.00, 0.00, 0.00, 500.00, 'UPI / Instant Gateway', 'PAID', 'UPI/MC-APT1001-9821')
ON DUPLICATE KEY UPDATE total_amount=total_amount;
