# MedDesk Java Web-Based Healthcare System
<<<<<<< HEAD
## Architecture, Security & Database Implementation Guide

---

## 1. Problem Understanding & Solution Design

### 1.1 Problem Statement & Requirement Analysis
Modern healthcare clinics face operational bottlenecks in OPD scheduling, fragmented paper records, missing clinical prescriptions, and inconsistent billing reconciliations.
**MedDesk** digitizes end-to-end hospital workflows across Patients, Doctors, and Administrators:
- Multi-specialty doctor discovery, schedule customization, and double-booking-safe slot reservation.
- Patient Electronic Health Records (EHR) vault with role-restricted document archival.
- Atomic OPD billing slip creation and server-side iText 7 PDF rendering.
- Role-Based Access Control (RBAC) across `Patient`, `Doctor`, and `Admin` accounts.
=======
## Project Documentation & Deliverables for Galgotias University / GUVI HCL Rubric 2
**Student Submission: 50 / 50 Marks Mapping**

---

## 1. Problem Understanding & Solution Design (8 Marks)

### 1.1 Problem Statement & Requirement Analysis
Modern healthcare facilities face critical bottlenecks in OPD management: long counter queues, fragmented paper records, lost prescriptions, and delayed billing reconciliations. 
**MedDesk** is an enterprise-grade Java web application engineered to digitize:
- Multi-specialty doctor discovery and slot booking.
- Patient electronic health vault (EHR) with secure document archival.
- Atomic billing slip and receipt generation in PDF format with UPI verification stamps.
- Role-Based Access Control (RBAC) across Patients, Attending Doctors, and Hospital Administrators.
>>>>>>> origin/main

### 1.2 System Architecture
```
+-------------------------------------------------------------------------------+
|                             CLIENT TIER (BROWSER)                             |
|       React + Tailwind SPA  /  JSP Dynamic Web Pages  /  Mobile Web PWA       |
+-------------------------------------------------------------------------------+
<<<<<<< HEAD
                                      | HTTP/JSON REST (Cookie / Bearer Session)
                                      v
+-------------------------------------------------------------------------------+
|                       WEB & SERVLET TIER (APACHE TOMCAT)                      |
|   - AuthenticationFilter (Session Enforcement & Public Route Allowlist)       |
|   - AuthServlet (PBKDF2 Login, Registration, Logout & Session Status)         |
|   - PatientServlet (Patient & User Directory CRUD + Profile Updates)          |
|   - DoctorServlet (Doctor Catalog & Admin/Doctor Transactional Management)    |
|   - AppointmentServlet (Conflict-Safe Booking, Clinical Notes, Cancellation)  |
|   - MedicalRecordServlet (EHR Upload, Access Checks & Deletion)               |
|   - MedicalSlipServlet (Authorized iText 7 PDF Streamer)                      |
=======
                                      | HTTP/JSON / REST
                                      v
+-------------------------------------------------------------------------------+
|                       WEB & SERVLET TIER (APACHE TOMCAT)                       |
|   - AuthenticationFilter (Security & Session Guards)                          |
|   - AuthServlet (Session Management & Login)                                  |
|   - AppointmentServlet (CRUD, Transactions & Thread Dispatch)                  |
|   - MedicalSlipServlet (iText PDF Streamer)                                   |
|   - MedicalRecordServlet (EHR Upload & Retrieval)                             |
>>>>>>> origin/main
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
<<<<<<< HEAD
|                       CORE JAVA DOMAIN & SECURITY LAYER                       |
|   - OOP Entities (Abstract User -> Patient, Doctor, Admin, Appointment, Slip) |
|   - PasswordUtil (PBKDF2WithHmacSHA256 + SecureRandom Salt + Constant-Time)   |
|   - ValidationUtil (Strict Input Validation & XSS Sanitization)               |
|   - NotificationThreadService (ExecutorService Daemon Worker Pool)            |
|   - Custom Exceptions (Validation 400, Auth 401, Forbidden 403, Conflict 409) |
|   - PdfSlipGenerator (iText 7 Vector Engine)                                  |
+-------------------------------------------------------------------------------+
                                      | JDBC API (Parameterized PreparedStatement)
                                      v
+-------------------------------------------------------------------------------+
|                           PERSISTENCE LAYER (JDBC)                            |
|   - DBConnection (JDBC Connection Management)                                 |
|   - UserDAO / DoctorDAO / AppointmentDAO / MedicalRecordDAO                   |
|   - Atomic Commit/Rollback Transactions with Row Locking (FOR UPDATE)         |
=======
|                           CORE JAVA BUSINESS LOGIC                            |
|   - OOP Entities (User -> Patient, Doctor, Appointment, BillingSlip)          |
|   - NotificationThreadService (ExecutorService Multi-Threading)               |
|   - Custom Exceptions (DatabaseException, AuthenticationException)            |
|   - PdfSlipGenerator (iText 7 Vector Engine)                                 |
+-------------------------------------------------------------------------------+
                                      | JDBC API (PreparedStatement)
                                      v
+-------------------------------------------------------------------------------+
|                           PERSISTENCE LAYER (JDBC)                            |
|   - DBConnection (Connection Factory / Pooling)                               |
|   - AppointmentDAO (Atomic Commit/Rollback Transactions)                      |
|   - UserDAO / MedicalRecordDAO (CRUD Operations)                              |
>>>>>>> origin/main
+-------------------------------------------------------------------------------+
                                      | SQL
                                      v
+-------------------------------------------------------------------------------+
<<<<<<< HEAD
|                            DATABASE TIER (MYSQL 8+)                           |
=======
|                          DATABASE TIER (MYSQL / POSTGRESQL)                   |
>>>>>>> origin/main
|   Tables: users, doctors, appointments, billing_invoices, medical_records     |
+-------------------------------------------------------------------------------+
```

<<<<<<< HEAD
### 1.3 Sequence Flow: Double-Booking Safe OPD Scheduling
1. Patient selects doctor, date, time slot, reason, and payment option.
2. `AuthenticationFilter` verifies an active authenticated `HttpSession`.
3. `AppointmentServlet` validates inputs via `ValidationUtil` and enforces patient identity from session.
4. `AppointmentDAO` starts a transaction (`conn.setAutoCommit(false)`), acquires a row lock (`SELECT id ... FOR UPDATE`) to reject conflicting active bookings (`409 Conflict`), inserts into `appointments`, inserts the itemized `billing_invoices` record, and commits (`conn.commit()`), rolling back on any failure.
5. `NotificationThreadService` dispatches confirmation asynchronously in a background daemon thread.
6. `MedicalSlipServlet` verifies session ownership before streaming the dynamically generated PDF slip.

---

## 2. Core Java Concepts

1. **Object-Oriented Programming (OOP)**:
   - Abstract `User` base class defining `getRoleDisplayName()`, extended by `Patient`, `Doctor`, and `Admin` with polymorphic overrides.
   - `passwordHash` marked `transient` so Gson never leaks credential hashes in JSON responses.
2. **Collections & Generics**:
   - `List<Appointment>`, `List<Doctor>`, `List<MedicalRecord>`, `Map<String, Object>`, and immutable validation allowlists (`Set<String>`).
3. **Exception Handling**:
   - Hierarchical `MedicareException` subclasses mapped cleanly to HTTP semantics: `ValidationException` (400), `AuthenticationException` (401), `ForbiddenException` (403), `AppointmentNotFoundException` (404), `ConflictException` (409), and `DatabaseException` (500).
4. **Multithreading**:
   - `NotificationThreadService` uses `Executors.newFixedThreadPool` with daemon threads for non-blocking notification dispatch.

---

## 3. Database Integration (JDBC) & Security

- All SQL statements use parameterized `PreparedStatement` queries and try-with-resources cleanup.
- Multi-table workflows (`DoctorDAO.createDoctorWithTransaction`, `AppointmentDAO.createAppointmentWithTransaction`) execute atomically with `setAutoCommit(false)`, `commit()`, and `rollback()`.
- Passwords are salted and hashed with `PBKDF2WithHmacSHA256` (65,536 iterations) and verified using constant-time `MessageDigest.isEqual`.
- Automated unit tests in `AppointmentServiceTest.java` verify fee splits, polymorphism, PBKDF2 hashing, Gson serialization exclusions, validation rules, and exception status codes.
=======
### 1.3 Entity Relationship (ER) Diagram
```
+------------------+         +------------------+
|      USERS       | 1     1 |     DOCTORS      |
+------------------+---------+------------------+
| id (PK)          |         | doctor_id (PK/FK)|
| name             |         | specialty        |
| email (Unique)   |         | department       |
| password_hash    |         | hospital         |
| role             |         | consultation_fee |
| phone            |         | rating           |
+------------------+         +------------------+
        | 1                           | 1
        |                             |
        | M                           | M
+------------------+                  |
|   APPOINTMENTS   | <----------------+
+------------------+
| id (PK)          |
| patient_id (FK)  |
| doctor_id (FK)   |
| appointment_date |
| appointment_time |
| fee              |
| status           |
+------------------+
        | 1
        | 1
+------------------+         +------------------+
| BILLING_INVOICES |         | MEDICAL_RECORDS  |
+------------------+         +------------------+
| invoice_id (PK)  |         | record_id (PK)   |
| appointment_id(FK)         | patient_id (FK)  |
| doctor_fee       |         | title            |
| vitals_fee       |         | category         |
| vault_fee        |         | clinical_notes   |
| total_amount     |         | file_type        |
| payment_mode     |         +------------------+
| payment_status   |
| transaction_ref  |
+------------------+
```

### 1.4 Sequence Diagram: OPD Booking & Slip Generation Flow
1. **Patient** submits appointment booking form with doctor & time slot.
2. **AppointmentServlet** validates session and extracts JSON payload.
3. **AppointmentDAO** initiates an atomic transaction (`conn.setAutoCommit(false)`).
4. Inserts appointment record into `appointments` table.
5. Calculates itemized fee breakdown (Consultation, Vitals, Digital EHR) and inserts into `billing_invoices`.
6. Calls `conn.commit()` on success (or `conn.rollback()` on error).
7. Spawns asynchronous worker thread via `NotificationThreadService` to dispatch SMS/Email.
8. Patient requests slip download; **MedicalSlipServlet** calls `PdfSlipGenerator` to stream official PDF slip.

---

## 2. Core Java Concepts (10 Marks)

1. **Object-Oriented Programming (OOP)**:
   - **Abstraction**: Abstract `User` base class with common attributes and abstract method `getRoleDisplayName()`.
   - **Inheritance**: `Patient extends User`, `Doctor extends User` inheriting core authentication fields.
   - **Polymorphism**: `Doctor.getRoleDisplayName()` returns specialized clinical credential; `Patient.getRoleDisplayName()` returns patient status.
   - **Encapsulation**: Private and protected fields accessed via strictly validated getters and setters.

2. **Collections Framework**:
   - `List<Appointment>`, `ArrayList<MedicalRecord>` used for patient histories.
   - `Map<String, Object>` and `HashMap` utilized for JSON payload serialization with Google Gson.

3. **Exception Handling**:
   - Custom hierarchy under `MedicareException`:
     - `DatabaseException`: Handles SQL and connection failures.
     - `AuthenticationException`: Handles 401 Unauthorized states.
     - `AppointmentNotFoundException`: 404 error management.
   - Try-with-resources and defensive `finally` blocks closing JDBC resources safely.

4. **Multithreading**:
   - `NotificationThreadService` utilizes `ExecutorService` with a daemon `ThreadFactory` (`MediCare-Notification-Worker-*`) to offload external SMS and notification I/O operations away from the main HTTP servlet thread.

---

## 3. Database Integration (JDBC) (8 Marks)

1. **Schema Design**:
   - Normalized 3NF tables with Primary Keys, Foreign Keys, cascading deletions, and B-Tree indexes on query fields (`email`, `status`, `department`).
2. **CRUD Operations**:
   - Clean implementation in `UserDAO`, `AppointmentDAO`, and `MedicalRecordDAO` utilizing parameterized `PreparedStatement` to defend against SQL Injection.
3. **Transaction Management**:
   ```java
   conn.setAutoCommit(false);
   // 1. Insert appointment
   aptStmt.executeUpdate();
   // 2. Insert billing invoice
   invStmt.executeUpdate();
   // 3. Atomic commit
   conn.commit();
   ```
   With fail-safe rollback in `catch (SQLException e) { conn.rollback(); }`.

---

## 4. Servlets & Web Integration (7 Marks)

1. **HTTP Request / Response Processing**:
   - `doGet`, `doPost`, `doPut` handlers in `AppointmentServlet`, `AuthServlet`, and `MedicalSlipServlet`.
   - Setting appropriate MIME types: `application/json;charset=UTF-8` for REST data and `application/pdf` for file downloads.
2. **Session Management**:
   - `request.getSession(true)` creates authenticated sessions.
   - `session.setAttribute("currentUser", user)` persists session state.
   - 30-minute inactivity timeout configured in `web.xml`.
   - `session.invalidate()` clears credentials on logout.
3. **Security Interceptor**:
   - `AuthenticationFilter` intercepts protected URL patterns `/api/appointments/*` and `/api/records/*`.

---

## 5. Code Quality & Testing (10 Marks)

- Modular package separation:
  - `com.medicare.model`
  - `com.medicare.dao`
  - `com.medicare.servlet`
  - `com.medicare.util`
  - `com.medicare.exception`
  - `com.medicare.test`
- Automated JUnit test suite: `AppointmentServiceTest.java` verifying billing fee breakdown calculations and polymorphic behavior.

---

## 6. Innovation & Extra Effort (2 Marks)

- **Vector PDF Slip Generation in Java**: Using iText 7 to render official hospital consultation slips matching the clinical reference template with verification QR stamps and hospital accreditation.
- **Progressive Web App (PWA) & Cloud Architecture**: Multi-device responsive interface with instant slip preview and offline capabilities.
>>>>>>> origin/main
