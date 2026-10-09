import {
  INITIAL_APPOINTMENTS,
  INITIAL_DOCTORS,
  INITIAL_NOTIFICATIONS,
  INITIAL_RECORDS,
  INITIAL_USERS,
  INITIAL_CONSULTATIONS,
  INITIAL_MESSAGES,
} from '../data/initialData';
import {
  Appointment,
  Doctor,
  MedicalRecord,
  NotificationItem,
  User,
  UserRole,
  ConsultationSession,
  ChatMessage,
  ChatAttachment,
} from '../types';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';

const STORAGE_KEYS = {
  USERS: 'medicare_users_v1',
  DOCTORS: 'medicare_doctors_v1',
  APPOINTMENTS: 'medicare_appointments_v1',
  RECORDS: 'medicare_records_v1',
  NOTIFICATIONS: 'medicare_notifications_v1',
  CURRENT_USER: 'medicare_current_user_v1',
  CONSULTATIONS: 'medicare_consultations_v1',
  MESSAGES: 'medicare_messages_v1',
  FIRESTORE_SEEDED: 'medicare_firestore_seeded_v1',
};

// Safe local storage helpers
function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

type ChangeListener = () => void;
const listeners = new Set<ChangeListener>();

function notifyListeners(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Listener callback error', e);
    }
  });
}

// Full Cloud Firestore + Real-time REST Sync Client
export class MedicareApiClient {
  private static isInitialized = false;

  static subscribe(listener: ChangeListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  // Initialize Firestore listeners and seed initial cloud data if empty
  static async initFirestore(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      // 1. Listen to live updates from Firestore
      onSnapshot(collection(db, 'users'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteUsers = snapshot.docs.map((d) => d.data() as User);
          setStored(STORAGE_KEYS.USERS, remoteUsers);
          notifyListeners();
        } else {
          // Seed users if empty
          this.seedCollection('users', INITIAL_USERS);
        }
      }, (err) => console.warn('Firestore users sync warn:', err.message));

      onSnapshot(collection(db, 'doctors'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteDoctors = snapshot.docs.map((d) => d.data() as Doctor);
          setStored(STORAGE_KEYS.DOCTORS, remoteDoctors);
          notifyListeners();
        } else {
          this.seedCollection('doctors', INITIAL_DOCTORS);
        }
      }, (err) => console.warn('Firestore doctors sync warn:', err.message));

      onSnapshot(collection(db, 'appointments'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteAppointments = snapshot.docs.map((d) => d.data() as Appointment);
          setStored(STORAGE_KEYS.APPOINTMENTS, remoteAppointments);
          notifyListeners();
        } else {
          this.seedCollection('appointments', INITIAL_APPOINTMENTS);
        }
      }, (err) => console.warn('Firestore appointments sync warn:', err.message));

      onSnapshot(collection(db, 'records'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteRecords = snapshot.docs.map((d) => d.data() as MedicalRecord);
          setStored(STORAGE_KEYS.RECORDS, remoteRecords);
          notifyListeners();
        } else {
          this.seedCollection('records', INITIAL_RECORDS);
        }
      }, (err) => console.warn('Firestore records sync warn:', err.message));

      onSnapshot(collection(db, 'notifications'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteNotifications = snapshot.docs.map((d) => d.data() as NotificationItem);
          setStored(STORAGE_KEYS.NOTIFICATIONS, remoteNotifications);
          notifyListeners();
        } else {
          this.seedCollection('notifications', INITIAL_NOTIFICATIONS);
        }
      }, (err) => console.warn('Firestore notifications sync warn:', err.message));

      onSnapshot(collection(db, 'doctor_slots'), (snapshot) => {
        snapshot.docs.forEach((d) => {
          const slotsData = d.data() as { slots: string[] };
          localStorage.setItem(`medicare_doctor_slots_${d.id}`, JSON.stringify(slotsData.slots));
        });
        notifyListeners();
      }, (err) => console.warn('Firestore doctor_slots sync warn:', err.message));

    } catch (e) {
      console.warn('Firestore initialization warning (using local fallback):', e);
    }
  }

  private static async seedCollection<T extends { id: string }>(
    collectionName: string,
    items: T[]
  ): Promise<void> {
    try {
      const snap = await getDocs(collection(db, collectionName));
      if (snap.empty) {
        for (const item of items) {
          await setDoc(doc(db, collectionName, item.id), item);
        }
      }
    } catch (e) {
      console.warn(`Could not seed ${collectionName}:`, e);
    }
  }

  // Auth API
  static getCurrentUser(): User | null {
    const saved = getStored<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    return saved;
  }

  static setCurrentUser(user: User): void {
    setStored(STORAGE_KEYS.CURRENT_USER, user);
    notifyListeners();
  }

  static switchUserRole(role: UserRole): User {
    const users = this.getUsers();
    let target = users.find((u) => u.role === role);
    if (!target) {
      target = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    }
    this.setCurrentUser(target);
    return target;
  }

  static logout(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    notifyListeners();
  }

  // Users API (`/api/v1/users`)
  static getUsers(): User[] {
    return getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  static async registerUser(data: {
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    avatar?: string;
  }): Promise<User> {
    const users = this.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      this.setCurrentUser(existing);
      return existing;
    }

    const defaultAvatars: Record<UserRole, string> = {
      PATIENT:
        data.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      DOCTOR:
        data.avatar ||
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250',
      ADMIN:
        data.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
    };

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      avatar: defaultAvatars[data.role],
      phone: data.phone || '+91 98765 43210',
      status: 'Active',
    };

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const result = await response.json();
        const activeUser = result.user || newUser;

        const updated = [activeUser, ...users];
        setStored(STORAGE_KEYS.USERS, updated);
        this.setCurrentUser(activeUser);

        // Sync to Firestore for backup
        setDoc(doc(db, 'users', activeUser.id), activeUser).catch(() => {});

        notifyListeners();
        return activeUser;
      }
    } catch (err) {
      console.warn('Servlet connection failed, falling back to local database / firestore:', err);
    }

    // Fallback
    return this.getAppointments().filter((a) => a.patientId === patientId);
  }

  static getAppointmentsByDoctor(doctorId: string): Appointment[] {
    return this.getAppointments().filter((a) => a.doctorId === doctorId);
  }

  static async bookAppointment(data: {
    doctorId: string;
    patientId: string;
    patientName: string;
    date: string;
    time: string;
    reason: string;
  }): Promise<Appointment> {
    const doctors = this.getDoctors();
    const doctor = doctors.find((d) => d.id === data.doctorId) || doctors[0];
    const current = this.getAppointments();

    const normalizeDate = (dateStr: string) => {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      }
      return dateStr.trim().toLowerCase();
    };

    const targetDateNorm = normalizeDate(data.date);
    const targetTimeNorm = data.time.trim().toLowerCase();

    const isSlotBooked = current.some((app) => {
      if (app.status === 'Cancelled') return false;
      const appDocMatch = app.doctorId === doctor.id || app.doctorName.toLowerCase().includes(doctor.name.toLowerCase());
      const appDateMatch = normalizeDate(app.date) === targetDateNorm;
      const appTimeMatch = app.time.trim().toLowerCase() === targetTimeNorm;
      return appDocMatch && appDateMatch && appTimeMatch;
    });

    if (isSlotBooked) {
      throw new Error(`The time slot '${data.time}' on ${data.date} is already booked. Please choose another slot.`);
    }

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: data.patientId,
      patientName: data.patientName,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorAvatar: doctor.avatar,
      department: doctor.department,
      hospital: doctor.hospital,
      date: data.date,
      time: data.time,
      reason: data.reason || 'General Health Consultation',
      status: 'Upcoming',
      fee: doctor.consultationFee,
    };

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment),
      });

      if (response.ok) {
        const result = await response.json();
        const activeAppointment = result.appointment || newAppointment;
        const updated = [activeAppointment, ...current];
        setStored(STORAGE_KEYS.APPOINTMENTS, updated);
        setDoc(doc(db, 'appointments', activeAppointment.id), activeAppointment).catch(() => {});

        this.addNotification({
          title: 'Appointment Confirmed & 10-Day Chat Active',
          message: `Confirmed with ${doctor.name} on ${data.date}. You can chat with doctor for 10 days!`,
          type: 'appointment',
        });

        this.createOrUpdateFollowUpSession({
          patientId: data.patientId,
          patientName: data.patientName,
          doctorId: doctor.id,
          doctorName: doctor.name,
          doctorAvatar: doctor.avatar,
          doctorSpecialty: doctor.specialty,
          hospitalName: doctor.hospital,
          appointmentId: activeAppointment.id,
          appointmentDate: data.date,
          appointmentReason: activeAppointment.reason,
        });

        notifyListeners();
        return activeAppointment;
      }
    } catch (err) {
      console.warn('Servlet connection failed, falling back to local database / firestore:', err);
    }

    const updated = [newAppointment, ...current];
    setStored(STORAGE_KEYS.APPOINTMENTS, updated);
    setDoc(doc(db, 'appointments', newAppointment.id), newAppointment).catch(() => {});
    notifyListeners();
    return newAppointment;
  }

  static getDoctors(): Doctor[] {
    return getStored<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
  }

  static getAppointments(): Appointment[] {
    return getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  }

  static getAppointmentsByPatient(patientId: string): Appointment[] {
    return this.getAppointments().filter((a) => a.patientId === patientId);
  }

  static getAppointmentsByDoctor(doctorId: string): Appointment[] {
    return this.getAppointments().filter((a) => a.doctorId === doctorId);
  }

  static updateAppointmentStatus(id: string, status: Appointment['status']): Appointment[] {
    const updated = this.getAppointments().map((appointment) =>
      appointment.id === id ? { ...appointment, status } : appointment
    );
    setStored(STORAGE_KEYS.APPOINTMENTS, updated);
    notifyListeners();
    return updated;
  }

  static addDoctor(data: Omit<Doctor, 'id'> & { id?: string }): Doctor {
    const doctor: Doctor = {
      id: data.id || `doc-${Date.now()}`,
      name: data.name,
      specialty: data.specialty,
      department: data.department,
      hospital: data.hospital,
      rating: data.rating,
      reviewsCount: data.reviewsCount,
      consultationFee: data.consultationFee,
      avatar: data.avatar,
      experienceYears: data.experienceYears,
      availableDays: data.availableDays,
      timeSlots: data.timeSlots,
      about: data.about,
      education: data.education,
      email: data.email,
      phone: data.phone,
      uniqueDoctorId: data.uniqueDoctorId,
      loginPassword: data.loginPassword,
    };

    const doctors = this.getDoctors();
    const updated = [doctor, ...doctors];
    setStored(STORAGE_KEYS.DOCTORS, updated);
    setDoc(doc(db, 'doctors', doctor.id), doctor).catch(() => {});
    notifyListeners();
    return doctor;
  }

  static deleteDoctor(id: string): Doctor[] {
    const updated = this.getDoctors().filter((doctor) => doctor.id !== id);
    setStored(STORAGE_KEYS.DOCTORS, updated);
    deleteDoc(doc(db, 'doctors', id)).catch(() => {});
    notifyListeners();
    return updated;
  }

  static getRecords(patientId?: string): MedicalRecord[] {
    const all = getStored<MedicalRecord[]>(STORAGE_KEYS.RECORDS, INITIAL_RECORDS);
    if (!patientId) return all;
    return all.filter((r) => r.patientId === patientId);
  }

  static async uploadRecord(record: Omit<MedicalRecord, 'id'>): Promise<MedicalRecord> {
    const newRecord: MedicalRecord = {
      ...record,
      id: `rec-${Date.now()}`,
    };
    const current = this.getRecords();

    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });

      if (response.ok) {
        const result = await response.json();
        const activeRecord = result.record || newRecord;
        const updated = [activeRecord, ...current];
        setStored(STORAGE_KEYS.RECORDS, updated);
        setDoc(doc(db, 'records', activeRecord.id), activeRecord).catch(() => {});

        this.addNotification({
          title: '📄 Medical Record Uploaded',
          message: `Medical record "${record.title}" was saved to your vault successfully.`,
          type: 'record',
          recipientId: record.patientId,
          recipientRole: 'PATIENT',
          actionView: 'patient-records',
        });

        notifyListeners();
        return activeRecord;
      }
    } catch (err) {
      console.warn('Servlet connection failed, falling back to local database / firestore:', err);
    }

    const updated = [newRecord, ...current];
    setStored(STORAGE_KEYS.RECORDS, updated);
    setDoc(doc(db, 'records', newRecord.id), newRecord).catch(() => {});
    notifyListeners();
    return newRecord;
  }

  static async issuePrescriptionFromConsultation(params: {
    consultationId: string;
    doctorId: string;
    doctorName: string;
    doctorAvatar?: string;
    patientId: string;
    diagnosis: string;
    medicines: { name: string; dosage: string; duration: string; instruction: string }[];
    notes: string;
    recommendedTests?: string[];
  }): Promise<MedicalRecord> {
    const medSummary = params.medicines.map((m) => `${m.name} (${m.dosage}) for ${m.duration}`).join(', ');
    const record = await this.uploadRecord({
      patientId: params.patientId,
      title: `Prescription - ${params.doctorName}`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      category: 'Prescriptions',
      fileType: 'PDF',
      fileSize: '1.4 MB',
      doctorName: params.doctorName,
      facility: 'MedDesk Digital OPD',
      notes: `Diagnosis: ${params.diagnosis}. Rx: ${medSummary}. Instructions: ${params.notes}`,
    });

    this.sendConsultationMessage({
      consultationId: params.consultationId,
      senderId: params.doctorId,
      senderRole: 'DOCTOR',
      senderName: params.doctorName,
      senderAvatar: params.doctorAvatar,
      text: `I have issued an official digital prescription for ${params.diagnosis}.`,
      attachments: [
        {
          type: 'prescription',
          title: `Official OPD Prescription - ${params.doctorName}`,
          details: `Diagnosis: ${params.diagnosis}`,
          medicines: params.medicines,
          notes: params.notes,
          tests: params.recommendedTests,
        },
      ],
    });

    notifyListeners();
    return record;
  }

  static getNotifications(currentUser: User | null): NotificationItem[] {
    const all = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    if (!currentUser) return all;
    return all.filter((n) => n.recipientId === currentUser.id || n.recipientRole === 'ALL' || !n.recipientId);
  }

  static markAllNotificationsRead(currentUser: User | null): NotificationItem[] {
    const all = this.getNotifications(currentUser);
    const updated = all.map((notification) => ({ ...notification, read: true }));
    setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
    notifyListeners();
    return updated;
  }

  static addNotification(notification: Omit<NotificationItem, 'id' | 'time' | 'read'> & Partial<Pick<NotificationItem, 'id' | 'time' | 'read'>>): NotificationItem {
    const item: NotificationItem = {
      id: notification.id || `notif-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: notification.title,
      message: notification.message,
      time: notification.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: notification.read ?? false,
      type: notification.type,
      recipientId: notification.recipientId,
      recipientRole: notification.recipientRole,
      actionView: notification.actionView,
      consultationId: notification.consultationId,
      createdAt: notification.createdAt || new Date().toISOString(),
    };

    const current = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = [item, ...current];
    setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
    notifyListeners();
    return item;
  }

  static getConsultations(userId: string, role: UserRole): ConsultationSession[] {
    const all = getStored<ConsultationSession[]>(STORAGE_KEYS.CONSULTATIONS, INITIAL_CONSULTATIONS);
    return all.filter((session) =>
      role === 'PATIENT' ? session.patientId === userId : session.doctorId === userId
    );
  }

  static getConsultationMessages(consultationId: string): ChatMessage[] {
    const all = getStored<Record<string, ChatMessage[]>>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    return all[consultationId] || [];
  }

  static mergeConsultationMessages(consultationId: string, cloudMessages: ChatMessage[]): ChatMessage[] {
    const localMessages = this.getConsultationMessages(consultationId);
    const merged = [...localMessages, ...cloudMessages.filter((msg) => !localMessages.some((local) => local.id === msg.id))];
    const map = getStored<Record<string, ChatMessage[]>>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    map[consultationId] = merged;
    setStored(STORAGE_KEYS.MESSAGES, map);
    notifyListeners();
    return merged;
  }

  static createConsultation(data: {
    patientId: string;
    patientName: string;
    patientAvatar?: string;
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
    chiefComplaint: string;
    initialMessage?: string;
  }): ConsultationSession {
    const session: ConsultationSession = {
      id: `consult-${Date.now()}`,
      patientId: data.patientId,
      patientName: data.patientName,
      patientAvatar: data.patientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      patientAge: data.patientAge,
      patientGender: data.patientGender,
      patientBloodGroup: data.patientBloodGroup,
      doctorId: data.doctorId,
      doctorName: data.doctorName,
      doctorSpecialty: data.doctorSpecialty,
      doctorAvatar: data.doctorAvatar,
      hospitalName: data.hospitalName,
      appointmentId: data.appointmentId,
      appointmentDate: data.appointmentDate,
      appointmentReason: data.appointmentReason,
      daysRemaining: 10,
      isFollowUpActive: true,
      status: 'Ongoing',
      chiefComplaint: data.chiefComplaint,
      startTime: new Date().toISOString(),
      lastMessage: data.initialMessage || 'Consultation started',
      lastMessageTime: new Date().toISOString(),
      unreadDoctor: 0,
      unreadPatient: 0,
    };

    const all = getStored<ConsultationSession[]>(STORAGE_KEYS.CONSULTATIONS, INITIAL_CONSULTATIONS);
    const updated = [session, ...all];
    setStored(STORAGE_KEYS.CONSULTATIONS, updated);
    if (data.initialMessage) {
      this.sendConsultationMessage({
        consultationId: session.id,
        senderId: data.patientId,
        senderRole: 'PATIENT',
        senderName: data.patientName,
        senderAvatar: data.patientAvatar,
        text: data.initialMessage,
      });
    }
    notifyListeners();
    return session;
  }

  static sendConsultationMessage(data: {
    consultationId: string;
    senderId: string;
    senderRole: 'PATIENT' | 'DOCTOR';
    senderName: string;
    senderAvatar?: string;
    text?: string;
    attachments?: ChatAttachment[];
  }): ChatMessage {
    const map = getStored<Record<string, ChatMessage[]>>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      consultationId: data.consultationId,
      senderId: data.senderId,
      senderRole: data.senderRole,
      senderName: data.senderName,
      senderAvatar: data.senderAvatar,
      text: data.text || 'Shared a document',
      timestamp: new Date().toISOString(),
      attachments: data.attachments || [],
    };

    if (!map[data.consultationId]) map[data.consultationId] = [];
    map[data.consultationId] = [...map[data.consultationId], message];
    setStored(STORAGE_KEYS.MESSAGES, map);

    const consultations = getStored<ConsultationSession[]>(STORAGE_KEYS.CONSULTATIONS, INITIAL_CONSULTATIONS);
    const updated = consultations.map((session) =>
      session.id === data.consultationId
        ? { ...session, lastMessage: message.text, lastMessageTime: message.timestamp }
        : session
    );
    setStored(STORAGE_KEYS.CONSULTATIONS, updated);
    notifyListeners();
    return message;
  }

  static createOrUpdateFollowUpSession(params: {
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    doctorAvatar?: string;
    doctorSpecialty?: string;
    hospitalName?: string;
    appointmentId?: string;
    appointmentDate?: string;
    appointmentReason?: string;
  }): ConsultationSession {
    const consultations = getStored<ConsultationSession[]>(STORAGE_KEYS.CONSULTATIONS, INITIAL_CONSULTATIONS);
    const existing = consultations.find(
      (session) =>
        session.patientId === params.patientId &&
        session.doctorId === params.doctorId &&
        (session.appointmentId === params.appointmentId || session.status === 'Ongoing')
    );

    if (existing) {
      const updated = consultations.map((session) =>
        session.id === existing.id
          ? {
              ...session,
              lastMessageTime: new Date().toISOString(),
              daysRemaining: Math.max(1, session.daysRemaining ?? 10),
              isFollowUpActive: true,
            }
          : session
      );
      setStored(STORAGE_KEYS.CONSULTATIONS, updated);
      notifyListeners();
      return existing;
    }

    const session = this.createConsultation({
      patientId: params.patientId,
      patientName: params.patientName,
      patientAvatar: params.doctorAvatar,
      doctorId: params.doctorId,
      doctorName: params.doctorName,
      doctorSpecialty: params.doctorSpecialty || 'General Physician',
      doctorAvatar: params.doctorAvatar || '',
      hospitalName: params.hospitalName,
      appointmentId: params.appointmentId,
      appointmentDate: params.appointmentDate,
      appointmentReason: params.appointmentReason,
      chiefComplaint: params.appointmentReason || 'Follow-up consultation',
      initialMessage: `Follow-up consultation started for ${params.appointmentReason || 'your consultation'}.`,
    });

    return session;
  }

  static sendEmailOtp(email: string): { otp: string } {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setStored(`meddesk_otp_${email.trim().toLowerCase()}`, { otp, createdAt: Date.now() });
    return { otp };
  }

  static verifyEmailOtp(email: string, code: string): boolean {
    const saved = getStored<{ otp: string; createdAt: number } | null>(`meddesk_otp_${email.trim().toLowerCase()}`, null);
    if (!saved) return false;
    return saved.otp === code.trim();
  }

  static getDoctorByUniqueId(uniqueId: string): Doctor | undefined {
    return this.getDoctors().find((doctor) =>
      doctor.uniqueDoctorId?.toLowerCase() === uniqueId.trim().toLowerCase() ||
      doctor.email?.toLowerCase() === uniqueId.trim().toLowerCase() ||
      doctor.name.toLowerCase() === uniqueId.trim().toLowerCase()
    );
  }

  static loginDoctorWithUniqueId(uniqueId: string, password: string): { success: boolean; user?: User; doctor?: Doctor } {
    const doctor = this.getDoctorByUniqueId(uniqueId);
    if (!doctor) {
      return { success: false };
    }

    const matchesPassword = (!doctor.loginPassword && !password) || doctor.loginPassword === password;
    if (!matchesPassword) {
      return { success: false };
    }

    const user: User = {
      id: doctor.id,
      name: doctor.name,
      email: doctor.email || `${doctor.uniqueDoctorId}@meddesk.com`,
      role: 'DOCTOR',
      avatar: doctor.avatar,
      phone: doctor.phone,
      status: 'Active',
      uniqueDoctorId: doctor.uniqueDoctorId,
      specialty: doctor.specialty,
      department: doctor.department,
      hospital: doctor.hospital,
      loginPassword: doctor.loginPassword,
    };

    this.setCurrentUser(user);
    return { success: true, user, doctor };
  }

  static toggleUserStatus(userId: string): User[] {
    const users = this.getUsers().map((user) =>
      user.id === userId
        ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' }
        : user
    );
    setStored(STORAGE_KEYS.USERS, users);
    notifyListeners();
    return users;
  }

  // Reset to completely fresh default state
  static resetToDefault(): void {
    localStorage.clear();
    setStored(STORAGE_KEYS.APPOINTMENTS, []);
    setStored(STORAGE_KEYS.NOTIFICATIONS, []);
    setStored(STORAGE_KEYS.RECORDS, []);
    setStored(STORAGE_KEYS.CONSULTATIONS, []);
    setStored(STORAGE_KEYS.MESSAGES, {});
    setStored(STORAGE_KEYS.USERS, INITIAL_USERS);
    notifyListeners();

    // Async clear non-initial users from Cloud Firestore
    getDocs(collection(db, 'users')).then((snap) => {
      snap.docs.forEach((d) => {
        const u = d.data() as User;
        const isKeep = INITIAL_USERS.some(initU => initU.id === u.id || initU.email === u.email);
        if (!isKeep) {
          deleteDoc(doc(db, 'users', d.id)).catch((err) =>
            console.warn('Failed to delete cloud user:', err)
          );
        }
      });
    }).catch((err) => console.warn('Failed to fetch cloud users:', err));

    // Async clear appointments from Cloud Firestore
    getDocs(collection(db, 'appointments')).then((snap) => {
      snap.docs.forEach((d) => {
        deleteDoc(doc(db, 'appointments', d.id)).catch((err) =>
          console.warn('Failed to delete cloud appointment:', err)
        );
      });
    }).catch((err) => console.warn('Failed to fetch cloud appointments:', err));

    // Async clear records from Cloud Firestore
    getDocs(collection(db, 'records')).then((snap) => {
      snap.docs.forEach((d) => {
        deleteDoc(doc(db, 'records', d.id)).catch((err) =>
          console.warn('Failed to delete cloud record:', err)
        );
      });
    }).catch((err) => console.warn('Failed to fetch cloud records:', err));

    // Async clear consultations from Cloud Firestore
    getDocs(collection(db, 'consultations')).then((snap) => {
      snap.docs.forEach((d) => {
        deleteDoc(doc(db, 'consultations', d.id)).catch((err) =>
          console.warn('Failed to delete cloud consultation:', err)
        );
      });
    }).catch((err) => console.warn('Failed to fetch cloud consultations:', err));

    // Async clear notifications from Cloud Firestore
    getDocs(collection(db, 'notifications')).then((snap) => {
      snap.docs.forEach((d) => {
        deleteDoc(doc(db, 'notifications', d.id)).catch((err) =>
          console.warn('Failed to delete cloud notification:', err)
        );
      });
    }).catch((err) => console.warn('Failed to fetch cloud notifications:', err));
  }

  // Custom Doctor Time Slots API
  static getDoctorSlots(doctorId: string, dateStr: string): string[] {
    const key = `medicare_doctor_slots_${doctorId}_${dateStr}`;
    const defaultSlots = [
      '09:00 AM',
      '09:30 AM',
      '10:00 AM',
      '10:30 AM',
      '11:00 AM',
      '11:30 AM',
      '02:00 PM',
      '03:30 PM',
      '04:00 PM',
      '04:30 PM',
    ];
    return getStored<string[]>(key, defaultSlots);
  }

  static saveDoctorSlots(doctorId: string, dateStr: string, slots: string[]): void {
    const key = `medicare_doctor_slots_${doctorId}_${dateStr}`;
    setStored(key, slots);
    
    // Save to Firestore for cross-client sync
    const docRef = doc(db, 'doctor_slots', `${doctorId}_${dateStr}`);
    setDoc(docRef, { slots }).catch((err) => {
      console.warn('Failed to save slots to Firestore:', err);
    });
    
    notifyListeners();
  }
}

// Execute automatic database flush for fresh state
MedicareApiClient.resetToDefault();

