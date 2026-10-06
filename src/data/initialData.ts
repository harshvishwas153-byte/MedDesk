import { Doctor, User, Appointment, MedicalRecord, NotificationItem, ConsultationSession, ChatMessage } from '../types';

export const HERO_DOCTOR_IMAGE = '/src/assets/images/hero_doctor_female_1790192817471.jpg';
export const LOGIN_HEART_IMAGE = '/src/assets/images/login_heart_care_1790192831018.jpg';
export const DR_PRIYA_IMAGE = '/src/assets/images/doctor_priya_sharma_1790192843688.jpg';
export const DR_RAHUL_IMAGE = '/src/assets/images/doctor_rahul_mehta_1790192856312.jpg';
export const DR_NEHA_IMAGE = '/src/assets/images/doctor_neha_verma_1790192867336.jpg';
export const DR_VIKRAM_IMAGE = '/src/assets/images/doctor_vikram_ortho_1790327638427.jpg';
export const HOSPITAL_HERO_IMAGE = '/src/assets/images/meddesk_hospital_hero_1790494035238.jpg';
export const DR_SARAH_IMAGE = '/src/assets/images/dr_sarah_johnson_1790494049182.jpg';
export const DR_AMIT_IMAGE = '/src/assets/images/dr_amit_verma_1790494063279.jpg';
export const EXPERT_CARE_BANNER = '/src/assets/images/expert_care_banner_1790494081894.jpg';
export const FIND_DOCTORS_BANNER = '/src/assets/images/find_doctors_banner_1790494098408.jpg';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Harsh Vishwas',
    email: 'harshvishwas153@gmail.com',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98765 43210',
    gender: 'Male',
    bloodGroup: 'O+',
    status: 'Active',
  },
  {
    id: 'usr-3',
    name: 'Admin',
    email: 'admin@meddesk.com',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '+91 91234 56789',
    gender: 'Male',
    status: 'Active',
  },
];

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-sarah',
    name: 'Dr. Sarah Johnson',
    specialty: 'General Physician',
    department: 'General Medicine',
    hospital: 'MedDesk Hospital, Noida',
    rating: 4.9,
    reviewsCount: 320,
    consultationFee: 500,
    avatar: DR_SARAH_IMAGE,
    experienceYears: 8,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    timeSlots: ['10:00 AM', '10:30 AM', '11:00 AM', '04:00 PM', '04:30 PM'],
    about: 'Dr. Sarah Johnson is a highly experienced General Physician specializing in preventive care, lifestyle diseases and chronic condition management.',
    education: 'MBBS, MD - General Medicine',
    email: 'sarah.johnson@meddesk.com',
    phone: '+91 98877 66554',
    uniqueDoctorId: 'DOC-1001',
    loginPassword: 'Doctor@1001',
  },
  {
    id: 'doc-amit',
    name: 'Dr. Amit Verma',
    specialty: 'Cardiologist',
    department: 'Cardiology',
    hospital: 'MedDesk Heart Institute',
    rating: 4.8,
    reviewsCount: 210,
    consultationFee: 800,
    avatar: DR_AMIT_IMAGE,
    experienceYears: 7,
    availableDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
    timeSlots: ['11:00 AM', '12:00 PM', '02:00 PM', '03:30 PM'],
    about: 'Senior Cardiologist specializing in preventive cardiology, echocardiography, blood pressure management, and cardiovascular wellness.',
    education: 'MBBS, DM (Cardiology)',
    email: 'amit.verma@meddesk.com',
    phone: '+91 96655 44332',
    uniqueDoctorId: 'DOC-1002',
    loginPassword: 'Doctor@1002',
  },
  {
    id: 'doc-priya',
    name: 'Dr. Priya Sharma',
    specialty: 'Dermatologist',
    department: 'Dermatology',
    hospital: 'MedDesk Skin & Wellness',
    rating: 4.7,
    reviewsCount: 180,
    consultationFee: 600,
    avatar: DR_PRIYA_IMAGE,
    experienceYears: 6,
    availableDays: ['Tuesday', 'Thursday', 'Friday', 'Saturday'],
    timeSlots: ['10:00 AM', '11:00 AM', '12:00 PM', '04:00 PM'],
    about: 'Consultant Dermatologist and Trichologist specializing in clinical dermatology, skin rejuvenation, acne, and allergy care.',
    education: 'MBBS, MD (Dermatology)',
    email: 'priya.sharma@meddesk.com',
    phone: '+91 97788 55441',
    uniqueDoctorId: 'DOC-1003',
    loginPassword: 'Doctor@1003',
  },
  {
    id: 'doc-vikram',
    name: 'Dr. Vikram Malhotra',
    specialty: 'Orthopedic Surgeon',
    department: 'Orthopedics & Joint Care',
    hospital: 'MedDesk Joint & Bone Clinic',
    rating: 4.9,
    reviewsCount: 142,
    consultationFee: 900,
    avatar: DR_VIKRAM_IMAGE,
    experienceYears: 15,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    timeSlots: ['10:00 AM', '11:00 AM', '01:00 PM', '03:30 PM', '05:00 PM'],
    about: 'Senior Consultant Orthopedic & Joint Replacement Surgeon with extensive expertise in arthroscopy, sports trauma, and knee care.',
    education: 'MS - Orthopedics, PGI · Fellow Joint Replacement (UK)',
    email: 'vikram.malhotra@meddesk.com',
    phone: '+91 95544 33221',
    uniqueDoctorId: 'DOC-1004',
    loginPassword: 'Doctor@1004',
  },
  {
    id: 'doc-rahul',
    name: 'Dr. Rahul Mehta',
    specialty: 'Pediatrician',
    department: 'Pediatrics & Child Care',
    hospital: 'MedDesk Children Clinic',
    rating: 4.8,
    reviewsCount: 160,
    consultationFee: 500,
    avatar: DR_RAHUL_IMAGE,
    experienceYears: 9,
    availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    timeSlots: ['09:30 AM', '11:00 AM', '02:00 PM', '04:30 PM'],
    about: 'Specialist in pediatric wellness, newborn care, childhood immunizations, and developmental health.',
    education: 'MBBS, MD - Pediatrics',
    email: 'rahul.mehta@meddesk.com',
    phone: '+91 94433 22110',
    uniqueDoctorId: 'DOC-1005',
    loginPassword: 'Doctor@1005',
  },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_RECORDS: MedicalRecord[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_CONSULTATIONS: ConsultationSession[] = [];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {};
