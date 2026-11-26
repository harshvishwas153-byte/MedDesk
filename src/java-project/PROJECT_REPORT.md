# MedDesk Java Web-Based Healthcare System
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

### 1.2 System Architecture
```
+-------------------------------------------------------------------------------+
|                             CLIENT TIER (BROWSER)                             |
|       React + Tailwind SPA  /  JSP Dynamic Web Pages  /  Mobile Web PWA       |
+-------------------------------------------------------------------------------+
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
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
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
+-------------------------------------------------------------------------------+
                                      | SQL
                                      v
+-------------------------------------------------------------------------------+
|                            DATABASE TIER (MYSQL 8+)                           |
|   Tables: users, doctors, appointments, billing_invoices, medical_records     |
+-------------------------------------------------------------------------------+
```

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
