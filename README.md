# 🏥 MedDesk — Smart OPD Patient Care & Clinic Management System

<<<<<<< HEAD
MedDesk is a modern, high-fidelity, and full-featured OPD patient care and clinical queue management platform. It facilitates a real-time, paperless healthcare flow between patients, doctors, and hospital administrators. Powered by a persistent Firestore Cloud Database, it ensures instant state synchronization across all modules.

---

## 🚀 Key Features

### 👤 Patient Module
* **Interactive Specialist Booking**: Browse doctors, view real-time available time slots, filter by specialty, and schedule appointments instantly.
* **Smart OPD Consultation Slips**: Automatically generate beautiful official OPD slips with clinical breakdowns and custom receipt references.
* **Offline PDF Downloads**: Download and print billing slips and prescriptions in professional PDF layouts.
* **Live Text Consultations**: Chat with attending doctors with attachment support and direct messaging.
* **Electronic Health Records (EHR)**: Securely store and access medical histories, past prescriptions, and diagnostic logs.

### 🩺 Doctor Module
* **Dynamic Clinic Schedule Planner**: Configure active consultation days and add or delete timeslots dynamically with live cross-client synchronization.
* **EHR Management**: Directly issue medical prescriptions, write care advice, and upload clinical history files for patients.
* **OPD Queue Monitor**: Oversee live patient arrivals, mark appointments as completed, or trigger instant diagnostic audits.
* **Patient Assistance Portal**: Provide instant consultation advice, review patient attachments, and resolve queries over text consultation.

### 👑 Administrator Module
* **Hospital Appointment Registry**: A centralized, real-time dashboard for auditing, filtering, and managing appointments across all OPD wards.
* **System-Wide Analytics**: Monitor department performance, daily consultation loads, and hospital revenue metrics.

---

## 🛠️ Tech Stack & Architecture

* **Frontend**: React 18, Vite, TypeScript
* **Styling**: Tailwind CSS
* **Database & Auth**: Google Cloud Firestore & Firebase Auth (real-time listeners enabled)
* **PDF Engine**: jsPDF (custom professional healthcare layouts)
* **Icons**: Lucide React

---

## 🌐 Live Application & Local Server Links


- **Local Server**: `http://localhost:3000` (run `npm run dev` or `npm run start`)

---

## 📦 Local Installation & Setup

Follow these simple steps to run MedDesk on your local computer:

### **Prerequisites**
Make sure you have **Node.js (v18+)** installed. Check using:
```bash
node -v
npm -v
```

### **1. Clone and Navigate to the Repository**
```bash
git clone https://github.com/harshvishwas153-byte/MedDesk.git
cd MedDesk
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Configure Environment Variables**
Create a `.env` file in the root directory (you can copy `.env.example` as a starting point) and add your configuration details.

### **4. Start the Development Server**
```bash
npm run dev
```
Open your browser and navigate to **`http://localhost:3000`** (or access the live preview at [https://ais-dev-pc2xeplawv67a6d6h6q26e-421796633930.asia-southeast1.run.app](https://ais-dev-pc2xeplawv67a6d6h6q26e-421796633930.asia-southeast1.run.app)).

### **5. Build for Production**
To generate optimized production-ready files:
```bash
npm run build
```

---

## 📁 Directory Structure Overview

```text
├── public/                  # Static assets
├── src/
│   ├── assets/              # Specialist avatars & illustrations
│   ├── components/
│   │   ├── admin/           # Centralized administration & registries
│   │   ├── common/          # Layouts, profile, navigation & modals
│   │   ├── doctor/          # Dashboard, schedules, EHR & OPD queues
│   │   └── patient/         # Booking wizard, consultation slips & history
│   ├── lib/
│   │   └── firebase.ts      # Cloud database connection setup
│   ├── services/
│   │   └── api.ts           # Centralized state controllers and API interfaces
│   ├── types/
│   │   └── index.ts         # TypeScript interface schemas
│   ├── utils/
│   │   └── pdfGenerator.ts  # Custom jsPDF healthcare slip templates
│   ├── App.tsx              # Core app router & controller
│   └── main.tsx             # Application entry point
├── package.json             # Scripts & library dependencies
└── README.md                # Project documentation
```

---

## 🤝 Contributing
Contributions are welcome! Feel free to open an Issue or submit a Pull Request to help improve MedDesk.
=======
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
>>>>>>> origin/main
