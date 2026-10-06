import JSZip from 'jszip';

export async function downloadJavaProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Root Maven pom.xml
  zip.file(
    'pom.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.meddesk</groupId>
    <artifactId>meddesk-backend</artifactId>
    <version>1.0.0</version>
    <packaging>war</packaging>

    <name>MedDesk Hospital Management System - Java Web Backend</name>
    <description>
        Java Servlet and JDBC Backend for MedDesk Online Healthcare System.
        Uses MySQL Connector/J for local database persistence.
    </description>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <servlet.version>4.0.1</servlet.version>
        <mysql.version>8.3.0</mysql.version>
        <gson.version>2.10.1</gson.version>
        <junit.version>4.13.2</junit.version>
        <itext.version>7.2.5</itext.version>
    </properties>

    <dependencies>
        <!-- Servlets & JSP API -->
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>javax.servlet-api</artifactId>
            <version>\${servlet.version}</version>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>javax.servlet.jsp</groupId>
            <artifactId>javax.servlet.jsp-api</artifactId>
            <version>2.3.3</version>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>jstl</artifactId>
            <version>1.2</version>
        </dependency>

        <!-- MySQL Connector/J (JDBC Driver) -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <version>\${mysql.version}</version>
        </dependency>

        <!-- JSON Parser for RESTful Servlet Requests & Responses -->
        <dependency>
            <groupId>com.google.code.gson</groupId>
            <artifactId>gson</artifactId>
            <version>\${gson.version}</version>
        </dependency>

        <!-- iText PDF Library for Server-Side Consultation Slip Generation -->
        <dependency>
            <groupId>com.itextpdf</groupId>
            <artifactId>itext7-core</artifactId>
            <version>\${itext.version}</version>
            <type>pom</type>
        </dependency>

        <!-- Unit Testing -->
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>\${junit.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <finalName>meddesk</finalName>
        <plugins>
            <!-- Maven WAR Plugin -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-war-plugin</artifactId>
                <version>3.3.2</version>
                <configuration>
                    <failOnMissingWebXml>false</failOnMissingWebXml>
                </configuration>
            </plugin>
            <!-- Maven Compiler Plugin -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>17</source>
                    <target>17</target>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>`
  );

  // Complete SQL Schema and Seed Data Script
  zip.file(
    'meddesk.sql',
    `-- MedDesk Online Healthcare Management System - Database Schema & Seed Data
-- Target Database: Local MySQL Server 8.0+

CREATE DATABASE IF NOT EXISTS meddesk_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE meddesk_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS patient_feedback;
DROP TABLE IF EXISTS doctor_schedules;
DROP TABLE IF EXISTS medical_records;
DROP TABLE IF EXISTS billing_invoices;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

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
    INDEX idx_apt_doctor (doctor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Data
INSERT INTO users (id, name, email, password_hash, role, phone, gender, blood_group, avatar_url, status) VALUES
('usr-1', 'Harsh Vishwas', 'harsh@example.com', 'hash_harsh123', 'PATIENT', '+91 98765 43210', 'Male', 'O+', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'ACTIVE'),
('usr-2', 'Dr. Priya Sharma', 'priya.sharma@meddesk.org', 'hash_doc123', 'DOCTOR', '+91 98111 22334', 'Female', 'A+', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150', 'ACTIVE'),
('usr-3', 'Dr. Rajesh Kumar', 'rajesh.kumar@meddesk.org', 'hash_doc456', 'DOCTOR', '+91 98222 33445', 'Male', 'B+', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150', 'ACTIVE'),
('usr-4', 'System Administrator', 'admin@meddesk.org', 'hash_admin789', 'ADMIN', '+91 99999 00000', 'Male', 'AB+', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'ACTIVE');

INSERT INTO doctors (doctor_id, user_id, specialization, department, experience_years, consultation_fee, hospital_affiliation, rating, review_count, availability_status) VALUES
('doc-1', 'usr-2', 'Cardiologist', 'Cardiology & Heart Care', 12, 800.00, 'MedDesk Heart Institute', 4.90, 142, 'AVAILABLE'),
('doc-2', 'usr-3', 'Neurologist', 'Neurology Department', 15, 1000.00, 'MedDesk Super Specialty Hospital', 4.85, 98, 'AVAILABLE');

INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, department, hospital, consultation_fee, status, reason, clinical_notes) VALUES
('apt-101', 'usr-1', 'doc-1', '2026-10-05', '10:00 AM', 'Cardiology & Heart Care', 'MedDesk Heart Institute', 800.00, 'CONFIRMED', 'Routine Cardiac Checkup & BP Monitoring', 'Patient shows stable vitals. Prescribed ECOSPRIN 75mg once daily.'),
('apt-102', 'usr-1', 'doc-2', '2026-10-12', '02:30 PM', 'Neurology Department', 'MedDesk Super Specialty Hospital', 1000.00, 'CONFIRMED', 'Frequent Headache & Migraine Consultation', 'Pending MRI Brain review.');

INSERT INTO billing_invoices (invoice_id, appointment_id, patient_id, doctor_fee, vitals_fee, vault_fee, discount_amount, tax_amount, total_amount, payment_mode, payment_status, transaction_ref) VALUES
('inv-101', 'apt-101', 'usr-1', 800.00, 50.00, 0.00, 50.00, 144.00, 944.00, 'UPI / PhonePe', 'PAID', 'TXN_9876543210_MED'),
('inv-102', 'apt-102', 'usr-1', 1000.00, 50.00, 0.00, 0.00, 189.00, 1239.00, 'Credit Card', 'PAID', 'TXN_9876543211_MED');

INSERT INTO medical_records (record_id, patient_id, title, category, record_date, doctor_name, facility, file_type, file_size, clinical_notes, download_url) VALUES
('rec-1', 'usr-1', 'Comprehensive Blood Count (CBC) & Lipid Profile', 'Lab Report', '2026-09-15', 'Dr. Priya Sharma', 'MedDesk Central Pathology Lab', 'PDF', '1.4 MB', 'All cholesterol levels within normal range. Hb: 14.2 g/dL.', '#'),
('rec-2', 'usr-1', 'Chest X-Ray & ECG Report', 'Radiology', '2026-08-20', 'Dr. Rajesh Kumar', 'MedDesk Imaging Center', 'PDF', '3.8 MB', 'Normal sinus rhythm. Lung fields clear.', '#');
`
  );

  // DBConnection Utility Class
  zip.file(
    'src/main/java/com/medicare/util/DBConnection.java',
    `package com.medicare.util;

import com.medicare.exception.DatabaseException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Centralized JDBC Connection Utility for Local MySQL Database Connectivity.
 * Credentials are retrieved dynamically from Environment Variables (PowerShell / OS)
 * or System Properties, avoiding hardcoded real passwords in source code.
 */
public class DBConnection {

    private static final String DB_DRIVER = getEnvOrProperty("DB_DRIVER", "com.mysql.cj.jdbc.Driver");
    private static final String DB_URL = getEnvOrProperty("DB_URL", "jdbc:mysql://localhost:3306/meddesk_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC");
    private static final String DB_USER = getEnvOrProperty("DB_USER", "root");
    private static final String DB_PASSWORD = getEnvOrProperty("DB_PASSWORD", "root");

    static {
        try {
            Class.forName(DB_DRIVER);
        } catch (ClassNotFoundException e) {
            try {
                Class.forName("com.mysql.jdbc.Driver");
            } catch (ClassNotFoundException ex) {
                System.err.println("JDBC Driver error: MySQL Connector/J driver not found: " + e.getMessage());
            }
        }
    }

    private DBConnection() {
        // Prevent instantiation
    }

    private static String getEnvOrProperty(String key, String defaultValue) {
        String envValue = System.getenv(key);
        if (envValue != null && !envValue.trim().isEmpty()) {
            return envValue;
        }
        String propValue = System.getProperty(key);
        if (propValue != null && !propValue.trim().isEmpty()) {
            return propValue;
        }
        return defaultValue;
    }

    public static Connection getConnection() throws DatabaseException {
        try {
            return DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
        } catch (SQLException e) {
            throw new DatabaseException("Failed to establish JDBC Connection to MySQL Server [" + DB_URL + "]: " + e.getMessage(), e);
        }
    }

    public static void close(AutoCloseable... resources) {
        for (AutoCloseable res : resources) {
            if (res != null) {
                try {
                    res.close();
                } catch (Exception ignored) {
                }
            }
        }
    }
}
`
  );

  // Local Setup Guide
  zip.file(
    'LOCAL_SETUP_GUIDE.md',
    `# MedDesk Local Deployment & MySQL JDBC Integration Guide

Follow these exact steps on your local Windows / macOS machine to run the application with MySQL Server and Tomcat.

---

### Step 1: Set Up Local MySQL Database

1. Open **MySQL Workbench** or **MySQL Command Line Client**.
2. Run the provided \`meddesk.sql\` script:
   \`\`\`sql
   SOURCE C:/path/to/meddesk.sql;
   \`\`\`
   Or execute directly in terminal:
   \`\`\`powershell
   mysql -u root -p < meddesk.sql
   \`\`\`

---

### Step 2: Set Environment Variables (Windows PowerShell)

Run these commands in PowerShell to configure database credentials safely:

\`\`\`powershell
$env:DB_DRIVER="com.mysql.cj.jdbc.Driver"
$env:DB_URL="jdbc:mysql://localhost:3306/meddesk_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USER="root"
$env:DB_PASSWORD="your_mysql_password_here"
\`\`\`

---

### Step 3: Build WAR & Deploy to Apache Tomcat

1. Build the WAR artifact using Maven:
   \`\`\`bash
   mvn clean package
   \`\`\`
2. Copy the resulting WAR file (\`target/meddesk.war\`) into your Tomcat \`webapps/\` directory:
   \`\`\`powershell
   Copy-Item target/meddesk.war C:\\apache-tomcat-9.0\\webapps\\
   \`\`\`
3. Start Apache Tomcat:
   \`\`\`powershell
   C:\\apache-tomcat-9.0\\bin\\startup.bat
   \`\`\`
4. The Java REST Servlet backend will be active at: \`http://localhost:8080/meddesk\`

---

### Step 4: Run React Frontend

1. Install frontend dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. Start the local Vite dev server:
   \`\`\`bash
   npm run dev
   \`\`\`
3. Access the React application at: \`http://localhost:3000\`
`
  );

  // Generate ZIP blob and download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'meddesk-java-mysql-project.zip';
  a.click();
  URL.revokeObjectURL(url);
}
