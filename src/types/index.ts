export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  gender?: string;
  bloodGroup?: string;
  status: 'Active' | 'Inactive';
  uniqueDoctorId?: string; // Admin-issued unique doctor ID (e.g. DOC-1001)
  loginPassword?: string;  // Admin-provided initial/current login password
  dateOfBirth?: string;
  age?: number;
  address?: string;
  city?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  medicalConditions?: string;
  specialty?: string;
  department?: string;
  hospital?: string;
  education?: string;
  experienceYears?: number;
  consultationFee?: number;
  about?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  hospital: string;
  rating: number;
  reviewsCount: number;
  consultationFee: number;
  avatar: string;
  experienceYears: number;
  availableDays: string[];
  timeSlots: string[];
  about: string;
  education: string;
  email?: string;
  phone?: string;
  uniqueDoctorId?: string; // Admin-issued unique ID for doctor login (e.g. DOC-1001)
  loginPassword?: string;  // Admin-provided login password
}

export type AppointmentStatus = 'Upcoming' | 'Completed' | 'Pending' | 'Cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientAvatar?: string;
  doctorId: string;
  doctorName: string;
  doctorAvatar?: string;
  department: string;
  hospital: string;
  date: string; // e.g. "12 Oct 2024"
  time: string; // e.g. "10:00 AM"
  reason: string;
  status: AppointmentStatus;
  fee: number;
  consultationType?: 'In-Clinic' | 'Video/Online';
  notes?: string;
  prescription?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  title: string;
  date: string;
  category: 'Prescriptions' | 'Test Reports' | 'Consultations';
  fileType: string;
  fileSize: string;
  doctorName: string;
  facility: string;
  notes: string;
  downloadUrl?: string;
}

export interface ChatAttachment {
  type: 'prescription' | 'report' | 'advice' | 'lab-recommendation' | 'document';
  title: string;
  details?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: string;
  fileUrl?: string;
  recordId?: string;
  medicines?: { name: string; dosage: string; duration: string; instruction: string }[];
  tests?: string[];
  notes?: string;
}

export interface ChatMessage {
  id: string;
  consultationId: string;
  senderId: string;
  senderRole: 'PATIENT' | 'DOCTOR';
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  attachments?: ChatAttachment[];
}

export interface ConsultationSession {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar: string;
  patientAge?: number;
  patientGender?: string;
  patientBloodGroup?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar: string;
  hospitalName?: string;
  appointmentId?: string;
  appointmentDate?: string;
  appointmentReason?: string;
  daysRemaining?: number;
  isFollowUpActive?: boolean;
  status: 'Ongoing' | 'Completed' | 'Waiting' | 'Expired';
  chiefComplaint: string;
  startTime: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadDoctor?: number;
  unreadPatient?: number;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'appointment' | 'record' | 'chat' | 'system';
  recipientId?: string;
  recipientRole?: 'PATIENT' | 'DOCTOR' | 'ALL';
  actionView?: ViewMode;
  consultationId?: string;
  createdAt?: string;
}

export type ViewMode =
  | 'landing'
  | 'login'
  | 'signup'
  | 'patient-dashboard'
  | 'patient-find-doctors'
  | 'patient-book'
  | 'patient-confirmation'
  | 'appointment-confirmed'
  | 'patient-consultation'
  | 'patient-records'
  | 'patient-appointments'
  | 'patient-profile'
  | 'patient-notifications'
  | 'patient-settings'
  | 'doctor-dashboard'
  | 'doctor-schedule'
  | 'doctor-appointments'
  | 'doctor-patients'
  | 'doctor-consultations'
  | 'doctor-profile'
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-doctors'
  | 'admin-doctor-schedule'
  | 'admin-appointments'
  | 'admin-settings';
