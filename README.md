# 🏥 MedDesk — Smart OPD Patient Care & Clinic Management System

**MedDesk** is a full-stack, web-based OPD Patient Care and Clinic Management System designed to digitize hospital operations and simplify communication between patients, doctors, and administrators.

The platform provides appointment scheduling, patient records management, doctor consultations, electronic prescriptions, billing support, and real-time patient-doctor communication through a modern, responsive interface.

---

## 🚀 Key Features

### 👤 Patient Module
- **Doctor Discovery:** Browse doctors and explore available medical specialties.
- **Smart Appointment Booking:** Schedule appointments and select available consultation slots.
- **Appointment Management:** View, track, and manage upcoming and previous appointments.
- **Digital OPD Slips:** Generate professional consultation and billing slips.
- **PDF Downloads:** Download and print prescriptions and consultation documents.
- **Doctor-Patient Chat:** Communicate directly with attending doctors through text messaging.
- **Electronic Health Records:** Access medical history, prescriptions, and diagnostic information.

### 🩺 Doctor Module
- **Doctor Dashboard:** View appointments, patient information, and consultation activity.
- **Dynamic Schedule Management:** Configure consultation days and available time slots.
- **OPD Queue Management:** Monitor patient appointments and update consultation status.
- **Electronic Prescriptions:** Create prescriptions and provide medical advice.
- **Patient Records:** Access relevant patient medical histories and consultation details.
- **Direct Patient Communication:** Respond to patient messages and consultation queries.

### 👑 Administrator Module
- **Centralized Dashboard:** Monitor hospital operations and appointment activity.
- **Appointment Registry:** View and manage appointments across departments.
- **User Management:** Manage patient and doctor accounts.
- **Hospital Analytics:** Monitor consultation activity and operational metrics.

---

## 💬 Special Innovation — Doctor-Patient Live Chat

MedDesk introduces an integrated communication feature that connects patients directly with their attending doctors.

Key capabilities:
- Direct text-based communication.
- Consultation-related messaging.
- Attachment support where enabled.
- Centralized conversation management.
- Convenient follow-up communication.

**Innovation Goal:** Reduce communication gaps between patients and doctors while making healthcare assistance more accessible.

---

## 🛠️ Technology Stack

| Category | Technology |
|---|---|
| Frontend | React 18, TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js |
| Authentication | Custom authentication and Firebase integration |
| Local Data Persistence | JSON-based server storage |
| Database Schema | MySQL SQL schema |
| PDF Generation | jsPDF |
| Icons | Lucide React |

---

## 🏗️ Project Architecture

MedDesk follows a modular architecture that separates the frontend, backend services, data management, and application modules.

```text
MedDesk/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── admin/
│   │   ├── common/
│   │   ├── doctor/
│   │   └── patient/
│   │
│   ├── data/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── types/
│   ├── utils/
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── tests/
│   └── api.test.ts
│
├── server.ts
├── meddesk.sql
├── firebase-applet-config.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
└── README.md
```

---

## ⚙️ Installation and Setup

### Prerequisites

Make sure you have installed:

- Node.js (v18 or above)
- npm
- Git

Verify your installation:

```bash
node -v
npm -v
git --version
```

### 1. Clone the Repository

```bash
git clone https://github.com/harshvishwas153-byte/MedDesk.git

cd MedDesk
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root using `.env.example` as a reference.

Add the required application configuration and credentials.

**Important:** Never commit private API keys, passwords, or service credentials to GitHub.

### 4. Start the Development Server

```bash
npm run dev
```

Open your browser:

```text
http://localhost:3000
```

### 5. Build for Production

```bash
npm run build
```

---

## 🔐 Security and Reliability

MedDesk incorporates security-focused backend functionality, including:

- Password hashing using secure crypt
