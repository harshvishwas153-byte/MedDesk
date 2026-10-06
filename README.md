# 🏥 MedDesk — Smart OPD Patient Care & Clinic Management System

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
git clone https://github.com/YOUR_USERNAME/MedDesk.git
cd MedDesk
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Configure Environment Variables**
Create a `.env` file in the root directory (you can copy `.env.example` as a starting point) and add your Firebase configuration details:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### **4. Start the Development Server**
```bash
npm run dev
```
Open your browser and navigate to **`http://localhost:3000`** (or the port specified in your terminal).

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
