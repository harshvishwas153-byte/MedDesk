# 🏥 MedDesk — Smart OPD Patient Care & Clinic Management System

MedDesk is a modern digital healthcare management platform designed to simplify and organize the OPD workflow between patients, doctors, and hospital administrators.

The system provides a centralized platform for appointment management, doctor scheduling, patient records, prescriptions, OPD queues, billing documents, and administrative monitoring.

---

## 📋 Overview

Traditional OPD workflows often involve multiple manual processes such as appointment booking, patient registration, queue management, maintaining medical records, and generating consultation documents.

MedDesk brings these processes together into a single digital platform.

The application provides separate workflows for:

- 👤 Patients
- 🩺 Doctors
- 👑 Administrators

Each role has access to features relevant to their responsibilities.

---

# 🚀 Key Features

## 👤 Patient Module

### 📅 Appointment Booking

- Browse available doctors and specialists.
- View doctor availability.
- Select available consultation slots.
- Book appointments.
- View appointment details and status.
- Access previous appointment history.

### 🧾 OPD Consultation & Billing Slips

- Generate professional OPD consultation slips.
- Generate billing-related documents.
- Display appointment and patient information.
- Generate printable PDF documents.
- Download generated documents for future reference.

### 🏥 Medical Records

- Access previous consultation information.
- View prescriptions and medical history.
- Maintain patient healthcare records.
- Access relevant diagnostic and consultation information.

### 💬 Patient Consultation

- Communicate with doctors through the consultation system.
- View consultation-related information.
- Share relevant information and attachments where supported.

---

# 🩺 Doctor Module

## 📊 Doctor Dashboard

Doctors can access a dedicated dashboard containing:

- Today's appointments
- Patient information
- Consultation activity
- Appointment statuses
- OPD queue information

## 🗓️ Schedule Management

Doctors can manage their consultation availability.

Features include:

- Configure consultation days.
- Create available time slots.
- Add new slots.
- Remove unavailable slots.
- Manage consultation availability.

## 👥 OPD Queue Management

Doctors can manage the patient consultation queue.

Features include:

- View waiting patients.
- Monitor appointment status.
- Process patients in the OPD queue.
- Mark appointments according to their consultation status.

## 📋 Electronic Health Records

Doctors can access relevant patient records and maintain clinical information.

This includes:

- Patient history
- Previous consultations
- Prescriptions
- Medical information
- Clinical notes

## 💊 Prescription Management

Doctors can:

- Create prescriptions.
- Add medicines and treatment instructions.
- Provide care instructions.
- Maintain prescription records for patients.

---

# 👑 Administrator Module

The administrator provides centralized control over the healthcare management system.

## 📅 Appointment Management

Administrators can:

- View appointments across the system.
- Monitor appointment statuses.
- Filter and manage appointment information.
- Maintain centralized appointment records.

## 👨‍⚕️ Doctor Management

Administrative functionality includes management of doctor-related information and availability.

## 📊 Dashboard & Analytics

The administrator dashboard provides an overview of important system information such as:

- Appointment activity
- Consultation workload
- Operational statistics
- Revenue-related information
- Overall system activity

## ⚙️ System Management

Administrators can monitor and manage important operational records across the platform.

---

# 🛠️ Technology Stack

## Frontend

- **React**
- **TypeScript**
- **Vite**
- **Tailwind CSS**

## Authentication & Database

- **Firebase Authentication**
- **Cloud Firestore**

## Document Generation

- **jsPDF**

## Icons & UI

- **Lucide React**

---

# 🏗️ Project Architecture

MedDesk follows a modular component-based architecture.

```text
MedDesk
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── admin/
│   │   │   ├── Dashboard
│   │   │   ├── Appointment Management
│   │   │   └── Administrative Features
│   │   │
│   │   ├── common/
│   │   │   ├── Navigation
│   │   │   ├── Layouts
│   │   │   ├── Modals
│   │   │   └── Common UI
│   │   │
│   │   ├── doctor/
│   │   │   ├── Dashboard
│   │   │   ├── Schedule Management
│   │   │   ├── OPD Queue
│   │   │   ├── EHR
│   │   │   └── Prescriptions
│   │   │
│   │   └── patient/
│   │       ├── Appointment Booking
│   │       ├── Consultation
│   │       ├── Medical History
│   │       └── Patient Records
│   │
│   ├── lib/
│   │   └── firebase.ts
│   │
│   ├── services/
│   │   └── api.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── utils/
│   │   └── pdfGenerator.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
├── vite.config.ts
└── README.md


<img width="1917" height="963" alt="image" src="https://github.com/user-attachments/assets/af45ec51-09b0-4c74-a436-2c97e1df16ab" />
