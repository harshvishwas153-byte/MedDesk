# MedDesk Java Web-Based Healthcare System
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

### 1.2 System Architecture
```
+-------------------------------------------------------------------------------+
|                             CLIENT TIER (BROWSER)                             |
|       React + Tailwind SPA  /  JSP Dynamic Web Pages  /  Mobile Web PWA       |
+-------------------------------------------------------------------------------+
                                      | HTTP/JSON / REST
                                      v
+-------------------------------------------------------------------------------+
|                       WEB & SERVLET TIER (APACHE TOMCAT)                       |
|   - AuthenticationFilter (Security & Session Guards)                          |
|   - AuthServlet (Session Management & Login)                                  |
|   - AppointmentServlet (CRUD, Transactions & Thread Dispatch)                  |
|   - MedicalSlipServlet (iText PDF Streamer)                                   |
|   - MedicalRecordServlet (EHR Upload & Retrieval)                             |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
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
+-------------------------------------------------------------------------------+
                                      | SQL
                                      v
+-------------------------------------------------------------------------------+
|                          DATABASE TIER (MYSQL / POSTGRESQL)                   |
|   Tables: users, doctors, appointments, billing_invoices, medical_records     |
+-------------------------------------------------------------------------------+
```

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
