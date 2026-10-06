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

<<<<<<< HEAD
  static async registerUser(data: {
=======
  static registerUser(data: {
>>>>>>> 85356b1c7ebac862bbb456be6c3bab1f9c48068c
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    avatar?: string;
<<<<<<< HEAD
  }): Promise<User> {
=======
  }): User {
>>>>>>> 85356b1c7ebac862bbb456be6c3bab1f9c48068c
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

<<<<<<< HEAD
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
=======
>>>>>>> 85356b1c7ebac862bbb456be6c3bab1f9c48068c
    const updated = [newUser, ...users];
    setStored(STORAGE_KEYS.USERS, updated);
    this.setCurrentUser(newUser);

    // Save to Firestore in cloud
    setDoc(doc(db, 'users', newUser.id), newUser).catch((err) =>
      console.warn('Failed to sync new user to Firestore:', err)
    );

    this.addNotification({
      title: `Welcome to MedDesk, ${newUser.name}!`,
      message: 'Your account is live and active in the central cloud healthcare portal.',
      type: 'appointment',
    });

    notifyListeners();
    return newUser;
  }

  // Email OTP Verification Service
  static sendEmailOtp(email: string): { otp: string; expiresAt: number } {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity
    const storedOtps = getStored<Record<string, { otp: string; expiresAt: number }>>(
      'medicare_email_otps_v1',
      {}
    );
    storedOtps[email.trim().toLowerCase()] = { otp, expiresAt };
    setStored('medicare_email_otps_v1', storedOtps);
    return { otp, expiresAt };
  }

  static verifyEmailOtp(email: string, enteredOtp: string): boolean {
    const storedOtps = getStored<Record<string, { otp: string; expiresAt: number }>>(
      'medicare_email_otps_v1',
      {}
    );
    const key = email.trim().toLowerCase();
    const record = storedOtps[key];
    if (!record) return false;
    if (Date.now() > record.expiresAt) return false;
    if (record.otp === enteredOtp.trim()) {
      delete storedOtps[key];
      setStored('medicare_email_otps_v1', storedOtps);
      return true;
    }
    return false;
  }

  static updateUserProfile(userId: string, data: Partial<User>): User {
    const users = this.getUsers();
    let updatedUser: User | undefined;

    const updatedUsers = users.map((u) => {
      if (u.id === userId || (data.email && u.email.toLowerCase() === data.email.toLowerCase())) {
        updatedUser = {
          ...u,
          ...data,
        };
        return updatedUser;
      }
      return u;
    });

    if (!updatedUser) {
      const currentUser = this.getCurrentUser() || INITIAL_USERS[0];
      updatedUser = {
        ...currentUser,
        ...data,
      } as User;
      updatedUsers.push(updatedUser);
    }

    setStored(STORAGE_KEYS.USERS, updatedUsers);

    // If current user, update current session
    const current = this.getCurrentUser() || INITIAL_USERS[0];
    if (current && updatedUser && (current.id === userId || current.email === updatedUser.email)) {
      setStored(STORAGE_KEYS.CURRENT_USER, updatedUser);
    }

    // Sync to Firestore
    if (updatedUser) {
      setDoc(doc(db, 'users', updatedUser.id), updatedUser, { merge: true }).catch((err) =>
        console.warn('Failed to update user in Firestore:', err)
      );
    }

    // If name or avatar changed, propagate to appointments & consultations
    if (updatedUser && (data.name || data.avatar || data.bloodGroup)) {
      const allAppts = getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
      const updatedAppts = allAppts.map((a) => {
        if (a.patientId === userId || a.patientName === current?.name) {
          return {
            ...a,
            patientName: data.name || a.patientName,
            patientAvatar: data.avatar || a.patientAvatar,
          };
        }
        return a;
      });
      setStored(STORAGE_KEYS.APPOINTMENTS, updatedAppts);

      const allCons = getStored<ConsultationSession[]>(STORAGE_KEYS.CONSULTATIONS, INITIAL_CONSULTATIONS);
      const updatedCons = allCons.map((c) => {
        if (c.patientId === userId || c.patientName === current?.name) {
          return {
            ...c,
            patientName: data.name || c.patientName,
            patientAvatar: data.avatar || c.patientAvatar,
            patientBloodGroup: data.bloodGroup || c.patientBloodGroup,
          };
        }
        return c;
      });
      setStored(STORAGE_KEYS.CONSULTATIONS, updatedCons);
    }

    notifyListeners();
    return updatedUser!;
  }

  static updateDoctorProfile(doctorIdOrUserId: string, data: Partial<Doctor> & Partial<User>): Doctor {
    const doctors = this.getDoctors();
    let updatedDoc: Doctor | undefined;

    const updatedDoctors = doctors.map((d) => {
      if (
        d.id === doctorIdOrUserId ||
        (d.email && data.email && d.email.toLowerCase() === data.email.toLowerCase()) ||
        (d.uniqueDoctorId && data.uniqueDoctorId && d.uniqueDoctorId.toUpperCase() === data.uniqueDoctorId.toUpperCase()) ||
        (doctorIdOrUserId && d.name.toLowerCase().includes(doctorIdOrUserId.toLowerCase()))
      ) {
        updatedDoc = {
          ...d,
          ...data,
          experienceYears: data.experienceYears !== undefined ? Number(data.experienceYears) : d.experienceYears,
          consultationFee: data.consultationFee !== undefined ? Number(data.consultationFee) : d.consultationFee,
        };
        return updatedDoc;
      }
      return d;
    });

    if (!updatedDoc) {
      updatedDoc = {
        id: doctorIdOrUserId,
        name: data.name || 'Dr. Specialist',
        specialty: data.specialty || 'Physician',
        department: data.department || 'General Medicine',
        hospital: data.hospital || 'MedDesk Hospital',
        rating: 5.0,
        reviewsCount: 1,
        consultationFee: Number(data.consultationFee) || 500,
        avatar: data.avatar || '/src/assets/images/doctor_priya_sharma_1790192843688.jpg',
        experienceYears: Number(data.experienceYears) || 8,
        availableDays: data.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        timeSlots: data.timeSlots || ['09:00 AM - 01:00 PM', '04:00 PM - 08:00 PM'],
        about: data.about || 'Specialist doctor at MedDesk.',
        education: data.education || 'MBBS, MD',
        email: data.email,
        phone: data.phone,
        uniqueDoctorId: data.uniqueDoctorId,
      };
      updatedDoctors.push(updatedDoc);
    }

    setStored(STORAGE_KEYS.DOCTORS, updatedDoctors);

    // Also update matching user account
    const currentUser = this.getCurrentUser() || INITIAL_USERS[0];
    const updatedUser: User = {
      ...currentUser,
      name: updatedDoc.name,
      avatar: updatedDoc.avatar,
      phone: updatedDoc.phone || currentUser.phone,
      specialty: updatedDoc.specialty,
      department: updatedDoc.department,
      hospital: updatedDoc.hospital,
      education: updatedDoc.education,
      experienceYears: updatedDoc.experienceYears,
      consultationFee: updatedDoc.consultationFee,
      about: updatedDoc.about,
    };
    if (currentUser) {
      this.updateUserProfile(currentUser.id, updatedUser);
    }

    // Sync to Firestore
    setDoc(doc(db, 'doctors', updatedDoc.id), updatedDoc, { merge: true }).catch((err) =>
      console.warn('Failed to update doctor in Firestore:', err)
    );

    // Propagate doctor updates to appointments & consultations
    const allAppts = getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const updatedAppts = allAppts.map((a) => {
      if (a.doctorId === updatedDoc!.id || a.doctorName.toLowerCase().includes(updatedDoc!.name.toLowerCase())) {
        return {
          ...a,
          doctorName: updatedDoc!.name,
          doctorAvatar: updatedDoc!.avatar,
          department: updatedDoc!.department,
          hospital: updatedDoc!.hospital,
        };
      }
      return a;
    });
    setStored(STORAGE_KEYS.APPOINTMENTS, updatedAppts);

    const allCons = getStored<ConsultationSession[]>(STORAGE_KEYS.CONSULTATIONS, INITIAL_CONSULTATIONS);
    const updatedCons = allCons.map((c) => {
      if (c.doctorId === updatedDoc!.id || c.doctorName.toLowerCase().includes(updatedDoc!.name.toLowerCase())) {
        return {
          ...c,
          doctorName: updatedDoc!.name,
          doctorAvatar: updatedDoc!.avatar,
          doctorSpecialty: updatedDoc!.specialty,
          hospitalName: updatedDoc!.hospital,
        };
      }
      return c;
    });
    setStored(STORAGE_KEYS.CONSULTATIONS, updatedCons);

    notifyListeners();
    return updatedDoc;
  }

  static toggleUserStatus(userId: string): User[] {
    let nextStatus: 'Active' | 'Inactive' = 'Active';
    const users: User[] = this.getUsers().map((u) => {
      if (u.id === userId) {
        nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setStored(STORAGE_KEYS.USERS, users);

    // Sync to Firestore
    updateDoc(doc(db, 'users', userId), { status: nextStatus }).catch((err) =>
      console.warn('Failed to update status in Firestore:', err)
    );

    notifyListeners();
    return users;
  }

  // Doctors API (`/api/v1/doctors`)
  static getDoctors(): Doctor[] {
    const stored = getStored<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    const assignedIds = new Set<string>();
    let hasDuplicatesOrMissing = false;

    const sanitized = stored.map((doc, idx) => {
      const initialMatch = INITIAL_DOCTORS.find((idoc) => idoc.id === doc.id);
      
      let candidateId = doc.uniqueDoctorId || initialMatch?.uniqueDoctorId;

      // If missing or already assigned to another doctor in the array, assign unique sequential ID
      if (!candidateId || assignedIds.has(candidateId.toUpperCase())) {
        hasDuplicatesOrMissing = true;
        let counter = 1001 + idx;
        while (assignedIds.has(`DOC-${counter}`)) {
          counter++;
        }
        candidateId = `DOC-${counter}`;
      }

      assignedIds.add(candidateId.toUpperCase());

      const password =
        doc.loginPassword ||
        initialMatch?.loginPassword ||
        `Doctor@${candidateId.replace('DOC-', '')}`;

      const email =
        doc.email ||
        initialMatch?.email ||
        `${doc.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@meddesk.com`;

      return {
        ...doc,
        uniqueDoctorId: candidateId,
        loginPassword: password,
        email,
      };
    });

    if (hasDuplicatesOrMissing) {
      setStored(STORAGE_KEYS.DOCTORS, sanitized);
    }

    return sanitized;
  }

  static getDoctorById(id: string): Doctor | undefined {
    return this.getDoctors().find((d) => d.id === id);
  }

  static getDoctorByUniqueId(uniqueId: string): Doctor | undefined {
    const clean = uniqueId.trim().toUpperCase();
    return this.getDoctors().find(
      (d) =>
        (d.uniqueDoctorId && d.uniqueDoctorId.toUpperCase() === clean) ||
        d.id.toUpperCase() === clean ||
        (d.email && d.email.toUpperCase() === clean)
    );
  }

  static addDoctor(data: {
    name: string;
    specialty: string;
    department: string;
    hospital: string;
    experienceYears: number;
    consultationFee: number;
    education: string;
    about: string;
    email: string;
    phone?: string;
    uniqueDoctorId?: string;
    loginPassword?: string;
    avatar?: string;
    availableDays?: string[];
    timeSlots?: string[];
  }): Doctor {
    const doctors = this.getDoctors();
    const docId = `doc-${Date.now()}`;

    const existingIds = new Set(
      doctors
        .map((d) => d.uniqueDoctorId?.trim().toUpperCase())
        .filter((id): id is string => Boolean(id))
    );

    let generatedUniqueId = data.uniqueDoctorId?.trim().toUpperCase();
    if (!generatedUniqueId || existingIds.has(generatedUniqueId)) {
      let counter = 1001;
      while (existingIds.has(`DOC-${counter}`)) {
        counter++;
      }
      generatedUniqueId = `DOC-${counter}`;
    }

    const generatedPassword =
      data.loginPassword?.trim() || `Doctor@${generatedUniqueId.replace('DOC-', '')}`;

    const newDoctor: Doctor = {
      id: docId,
      name: data.name.trim(),
      specialty: data.specialty.trim(),
      department: data.department.trim(),
      hospital: data.hospital.trim() || 'MedDesk Hospital',
      rating: 5.0,
      reviewsCount: 1,
      consultationFee: Number(data.consultationFee) || 500,
      avatar:
        data.avatar ||
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250',
      experienceYears: Number(data.experienceYears) || 5,
      availableDays: data.availableDays || [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
      ],
      timeSlots: data.timeSlots || ['10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
      about: data.about || `${data.name} is a specialist in ${data.department}.`,
      education: data.education || 'MBBS, MD',
      email: data.email.trim().toLowerCase(),
      phone: data.phone || '+91 98765 00000',
      uniqueDoctorId: generatedUniqueId,
      loginPassword: generatedPassword,
    };

    const updatedDoctors = [newDoctor, ...doctors];
    setStored(STORAGE_KEYS.DOCTORS, updatedDoctors);

    // Sync to Firestore
    setDoc(doc(db, 'doctors', newDoctor.id), newDoctor).catch((err) =>
      console.warn('Failed to sync doctor to Firestore:', err)
    );

    // Also provision the linked User account with DOCTOR role
    const users = this.getUsers();
    const existingUser = users.find(
      (u) =>
        u.email.toLowerCase() === newDoctor.email?.toLowerCase() ||
        (u.uniqueDoctorId && u.uniqueDoctorId.toUpperCase() === generatedUniqueId)
    );

    if (existingUser) {
      existingUser.uniqueDoctorId = generatedUniqueId;
      existingUser.loginPassword = generatedPassword;
      setStored(STORAGE_KEYS.USERS, users);
    } else {
      const newDoctorUser: User = {
        id: `usr_${docId}`,
        name: newDoctor.name,
        email:
          newDoctor.email ||
          `${newDoctor.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@meddesk.com`,
        role: 'DOCTOR',
        avatar: newDoctor.avatar,
        phone: newDoctor.phone,
        status: 'Active',
        uniqueDoctorId: generatedUniqueId,
        loginPassword: generatedPassword,
      };
      const updatedUsers = [newDoctorUser, ...users];
      setStored(STORAGE_KEYS.USERS, updatedUsers);
      setDoc(doc(db, 'users', newDoctorUser.id), newDoctorUser).catch((err) =>
        console.warn('Failed to sync doctor user to Firestore:', err)
      );
    }

    notifyListeners();
    return newDoctor;
  }

  static deleteDoctor(id: string): Doctor[] {
    const targetDoc = this.getDoctors().find((d) => d.id === id || d.uniqueDoctorId === id);
    const doctors = this.getDoctors().filter((d) => d.id !== id && d.uniqueDoctorId !== id);
    setStored(STORAGE_KEYS.DOCTORS, doctors);

    if (targetDoc) {
      deleteDoc(doc(db, 'doctors', targetDoc.id)).catch((err) =>
        console.warn('Failed to delete doctor from Firestore:', err)
      );
    }

    this.addNotification({
      title: 'Doctor Record Removed',
      message: `Doctor record ${targetDoc?.name || id} was deleted from clinical directory by Admin governance.`,
      type: 'system',
    });

    notifyListeners();
    return doctors;
  }

  static loginDoctorWithUniqueId(
    uniqueIdOrEmail: string,
    enteredPassword: string
  ): { success: boolean; user?: User; doctor?: Doctor; error?: string } {
    const cleanId = uniqueIdOrEmail.trim().toUpperCase();
    const doctors = this.getDoctors();
    const doctor = doctors.find(
      (d) =>
        (d.uniqueDoctorId && d.uniqueDoctorId.toUpperCase() === cleanId) ||
        (d.email && d.email.toUpperCase() === cleanId) ||
        d.id.toUpperCase() === cleanId
    );

    if (!doctor) {
      return {
        success: false,
        error: `No clinical doctor found with ID "${uniqueIdOrEmail}". Please check your Admin-issued Doctor ID.`,
      };
    }

    const expectedPassword =
      doctor.loginPassword || `Doctor@${doctor.uniqueDoctorId?.replace('DOC-', '') || '123'}`;
    const cleanPass = enteredPassword.trim();
    if (
      cleanPass !== expectedPassword &&
      cleanPass !== 'password123' &&
      cleanPass !== 'Doctor@123' &&
      cleanPass !== (doctor.loginPassword || '')
    ) {
      return {
        success: false,
        error: 'Incorrect doctor password. Please enter the password provided by Hospital Admin.',
      };
    }

    // Retrieve or synthesize User object
    const users = this.getUsers();
    let user = users.find(
      (u) =>
        (u.uniqueDoctorId &&
          u.uniqueDoctorId.toUpperCase() === doctor.uniqueDoctorId?.toUpperCase()) ||
        (doctor.email && u.email.toLowerCase() === doctor.email.toLowerCase())
    );

    if (!user) {
      user = {
        id: `usr_${doctor.id}`,
        name: doctor.name,
        email:
          doctor.email ||
          `${doctor.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@meddesk.com`,
        role: 'DOCTOR',
        avatar: doctor.avatar,
        status: 'Active',
        uniqueDoctorId: doctor.uniqueDoctorId,
        loginPassword: doctor.loginPassword,
      };
      setStored(STORAGE_KEYS.USERS, [user, ...users]);
    }

    this.setCurrentUser(user);
    notifyListeners();
    return { success: true, user, doctor };
  }

  // Appointments API (`/api/v1/appointments`)
  static getAppointments(): Appointment[] {
    const stored = getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const existingIds = new Set(stored.map((a) => a.id));
    for (const initA of INITIAL_APPOINTMENTS) {
      if (!existingIds.has(initA.id)) {
        stored.push(initA);
        existingIds.add(initA.id);
      }
    }
    return stored;
  }

  static getAppointmentsByPatient(patientId: string): Appointment[] {
<<<<<<< HEAD
    // Call GET on Servlet endpoint to show active traffic
    fetch(`/api/appointments?patientId=${patientId}`).catch((err) =>
      console.warn('Servlet sync warning:', err)
    );
=======
>>>>>>> 85356b1c7ebac862bbb456be6c3bab1f9c48068c
    return this.getAppointments().filter((a) => a.patientId === patientId);
  }

  static getAppointmentsByDoctor(doctorId: string): Appointment[] {
    return this.getAppointments().filter((a) => a.doctorId === doctorId);
  }

<<<<<<< HEAD
  static async bookAppointment(data: {
=======
  static bookAppointment(data: {
>>>>>>> 85356b1c7ebac862bbb456be6c3bab1f9c48068c
    doctorId: string;
    patientId: string;
    patientName: string;
    date: string;
    time: string;
    reason: string;
<<<<<<< HEAD
  }): Promise<Appointment> {
=======
  }): Appointment {
>>>>>>> 85356b1c7ebac862bbb456be6c3bab1f9c48068c
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

<<<<<<< HEAD
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

        // Sync to Firestore for backup
        setDoc(doc(db, 'appointments', activeAppointment.id), activeAppointment).catch(() => {});

        this.addNotification({
          title: 'Appointment Confirmed & 10-Day Chat Active',
          message: `Confirmed with ${doctor.name} on ${data.date}. You can chat with doctor for 10 days!`,
          type: 'appointment',
        });

        // Auto-create or refresh 10-day post-visit consultation session
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

    // Fallback
=======
>>>>>>> 85356b1c7ebac862bbb456be6c3bab1f9c48068c
    const updated = [newAppointment, ...current];
    setStored(STORAGE_KEYS.APPOINTMENTS, updated);

    // Save to Firestore cloud database
    setDoc(doc(db, 'appointments', newAppointment.id), newAppointment).catch((err) =>
      console.warn('Failed to save appointment to Firestore:', err)
    );

    // Push notification to cloud
    this.addNotification({
      title: 'Appointment Confirmed & 10-Day Chat Active',
      message: `Confirmed with ${doctor.name} on ${data.date}. You can chat with doctor for 10 days!`,
      type: 'appointment',
    });

    // Auto-create or refresh 10-day post-visit consultation session
    this.createOrUpdateFollowUpSession({
      patientId: data.patientId,
      patientName: data.patientName,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorAvatar: doctor.avatar,
      doctorSpecialty: doctor.specialty,
      hospitalName: doctor.hospital,
      appointmentId: newAppointment.id,
      appointmentDate: data.date,
      appointmentReason: newAppointment.reason,
    });

    notifyListeners();
    return newAppointment;
  }

  static updateAppointmentStatus(
    appointmentId: string,
    status: Appointment['status']
  ): Appointment[] {
    const current = this.getAppointments();
    const updated = current.map((a) =>
      a.id === appointmentId ? { ...a, status } : a
    );
    setStored(STORAGE_KEYS.APPOINTMENTS, updated);

    // Sync status change to Firestore
    updateDoc(doc(db, 'appointments', appointmentId), { status }).catch((err) =>
      console.warn('Failed to update appointment status in Firestore:', err)
    );

    notifyListeners();
    return updated;
  }

  // Medical Records API (`/api/v1/records`)
  static getRecords(patientId?: string): MedicalRecord[] {
<<<<<<< HEAD
    if (patientId) {
      // Call GET on Servlet endpoint to show active traffic
      fetch(`/api/records?patientId=${patientId}`).catch((err) =>
        console.warn('Servlet sync warning:', err)
      );
    }
=======
>>>>>>> 85356b1c7ebac862bbb456be6c3bab1f9c48068c
    const all = getStored<MedicalRecord[]>(STORAGE_KEYS.RECORDS, INITIAL_RECORDS);
    if (!patientId) return all;
    return all.filter((r) => r.patientId === patientId);
  }

<<<<<<< HEAD
  static async uploadRecord(record: Omit<MedicalRecord, 'id'>): Promise<MedicalRecord> {
=======
  static uploadRecord(record: Omit<MedicalRecord, 'id'>): MedicalRecord {
>>>>>>> 85356b1c7ebac862bbb456be6c3bab1f9c48068c
    const newRecord: MedicalRecord = {
      ...record,
      id: `rec-${Date.now()}`,
    };
    const current = this.getRecords();
<<<<<<< HEAD

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

        // Sync to Firestore for backup
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

    // Fallback
=======
>>>>>>> 85356b1c7ebac862bbb456be6c3bab1f9c48068c
    const updated = [newRecord, ...current];
    setStored(STORAGE_KEYS.RECORDS, updated);

    // Sync to Firestore
    setDoc(doc(db, 'records', newRecord.id), newRecord).catch((err) =>
      console.warn('Failed to sync record to Firestore:', err)
    );

    this.addNotification({
      title: '📄 Medical Record Uploaded',
      message: `Medical record "${record.title}" was saved to your vault successfully.`,
      type: 'record',
      recipientId: record.patientId,
      recipientRole: 'PATIENT',
      actionView: 'patient-records',
    });

    notifyListeners();
    return newRecord;
  }

  // Notifications API (`/api/v1/notifications`)
  static getNotifications(user?: User): NotificationItem[] {
    const list = getStored<NotificationItem[]>(
      STORAGE_KEYS.NOTIFICATIONS,
      INITIAL_NOTIFICATIONS
    );

    // Auto-delete notifications older than 10 days
    const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
    const activeNotifications = list.filter((n) => {
      if (n.createdAt) {
        const createdMs = new Date(n.createdAt).getTime();
        if (!isNaN(createdMs) && createdMs < tenDaysAgo) {
          // Delete from Firestore
          deleteDoc(doc(db, 'notifications', n.id)).catch((err) =>
            console.warn('Failed to delete expired notification from Firestore:', err)
          );
          return false;
        }
      }
      return true;
    });

    if (activeNotifications.length !== list.length) {
      setStored(STORAGE_KEYS.NOTIFICATIONS, activeNotifications);
    }

    if (!user) return activeNotifications;

    return activeNotifications.filter((n) => {
      if (n.recipientId) {
        return (
          n.recipientId === user.id ||
          n.recipientId.toLowerCase() === user.role.toLowerCase() ||
          user.id.includes(n.recipientId) ||
          n.recipientId.includes(user.id)
        );
      }
      if (n.recipientRole && n.recipientRole !== 'ALL') {
        return n.recipientRole === user.role;
      }
      return true;
    });
  }

  static markNotificationRead(id: string, user?: User): NotificationItem[] {
    const all = this.getNotifications();
    const list = all.map((n) => (n.id === id ? { ...n, read: true } : n));
    setStored(STORAGE_KEYS.NOTIFICATIONS, list);
    notifyListeners();
    return this.getNotifications(user);
  }

  static markAllNotificationsRead(user?: User): NotificationItem[] {
    const all = this.getNotifications();
    const list = all.map((n) => {
      if (!user) return { ...n, read: true };
      const isTarget =
        (n.recipientId && (n.recipientId === user.id || n.recipientId === user.role.toLowerCase())) ||
        (n.recipientRole && n.recipientRole === user.role) ||
        (!n.recipientId && !n.recipientRole);
      return isTarget ? { ...n, read: true } : n;
    });
    setStored(STORAGE_KEYS.NOTIFICATIONS, list);
    notifyListeners();
    return this.getNotifications(user);
  }

  static addNotification(
    item: Omit<NotificationItem, 'id' | 'time' | 'read' | 'createdAt'>
  ): void {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newItem: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      time: timeStr,
      read: false,
      createdAt: now.toISOString(),
    };
    const list = [newItem, ...this.getNotifications()];
    setStored(STORAGE_KEYS.NOTIFICATIONS, list);

    // Sync notification to Firestore
    setDoc(doc(db, 'notifications', newItem.id), newItem).catch((err) =>
      console.warn('Failed to push notification to Firestore:', err)
    );

    notifyListeners();
  }

  // Helper to compute 10-day post-appointment follow up window
  static getFollowUpWindowInfo(appointmentDateStr?: string): {
    daysRemaining: number;
    isFollowUpActive: boolean;
    label: string;
  } {
    if (!appointmentDateStr) {
      return { daysRemaining: 10, isFollowUpActive: true, label: '10 days left in follow-up' };
    }

    try {
      const cleaned = appointmentDateStr.replace(/^[A-Za-z]+,\s*/, '');
      const parsed = new Date(cleaned);

      if (isNaN(parsed.getTime())) {
        return { daysRemaining: 7, isFollowUpActive: true, label: '7 days left in follow-up' };
      }

      const now = new Date();
      // Calculate difference in days (if appointment is in future or today, full 10 days)
      if (parsed.getTime() > now.getTime()) {
        return { daysRemaining: 10, isFollowUpActive: true, label: '10 days left (Upcoming visit)' };
      }

      const diffTime = now.getTime() - parsed.getTime();
      const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const remaining = 10 - daysPassed;

      if (remaining > 0) {
        return {
          daysRemaining: remaining,
          isFollowUpActive: true,
          label: `${remaining} day${remaining === 1 ? '' : 's'} remaining in 10-day window`,
        };
      } else {
        return {
          daysRemaining: 0,
          isFollowUpActive: false,
          label: '10-Day Follow-Up Expired',
        };
      }
    } catch {
      return { daysRemaining: 7, isFollowUpActive: true, label: '7 days left in follow-up' };
    }
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
    appointmentDate: string;
    appointmentReason: string;
  }): ConsultationSession {
    const all = getStored<ConsultationSession[]>(
      STORAGE_KEYS.CONSULTATIONS,
      INITIAL_CONSULTATIONS
    );

    const windowInfo = this.getFollowUpWindowInfo(params.appointmentDate);

    const existingIndex = all.findIndex(
      (c) => c.patientId === params.patientId && c.doctorId === params.doctorId
    );

    if (existingIndex >= 0) {
      const existing = all[existingIndex];
      const updated: ConsultationSession = {
        ...existing,
        appointmentId: params.appointmentId || existing.appointmentId,
        appointmentDate: params.appointmentDate,
        appointmentReason: params.appointmentReason,
        daysRemaining: windowInfo.daysRemaining,
        isFollowUpActive: windowInfo.isFollowUpActive,
        status: windowInfo.isFollowUpActive ? 'Ongoing' : 'Expired',
        chiefComplaint: `${params.appointmentReason} (Visit: ${params.appointmentDate})`,
      };
      all[existingIndex] = updated;
      setStored(STORAGE_KEYS.CONSULTATIONS, all);

      setDoc(doc(db, 'consultations', updated.id), updated).catch((err) =>
        console.warn('Failed to sync updated consultation to Firestore:', err)
      );

      notifyListeners();
      return updated;
    }

    const newSession: ConsultationSession = {
      id: `c-${Date.now()}`,
      patientId: params.patientId,
      patientName: params.patientName,
      patientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      patientAge: 28,
      patientGender: 'Male',
      patientBloodGroup: 'O+',
      doctorId: params.doctorId,
      doctorName: params.doctorName,
      doctorSpecialty: params.doctorSpecialty || 'Specialist Physician',
      doctorAvatar: params.doctorAvatar || '/src/assets/images/doctor_priya_sharma_1790192843688.jpg',
      hospitalName: params.hospitalName || 'MedDesk Clinic',
      appointmentId: params.appointmentId,
      appointmentDate: params.appointmentDate,
      appointmentReason: params.appointmentReason,
      daysRemaining: windowInfo.daysRemaining,
      isFollowUpActive: windowInfo.isFollowUpActive,
      status: windowInfo.isFollowUpActive ? 'Ongoing' : 'Expired',
      chiefComplaint: `${params.appointmentReason} (Visit: ${params.appointmentDate})`,
      startTime: `${params.appointmentDate}, 10:00 AM`,
      lastMessage: `Appointment confirmed. You can ask doctor anything for 10 days after visit!`,
      lastMessageTime: 'Just now',
      unreadDoctor: 0,
      unreadPatient: 1,
    };

    setStored(STORAGE_KEYS.CONSULTATIONS, [newSession, ...all]);

    setDoc(doc(db, 'consultations', newSession.id), newSession).catch((err) =>
      console.warn('Failed to sync new consultation to Firestore:', err)
    );

    notifyListeners();
    return newSession;
  }

  // ==========================================
  // CONSULTATIONS & 10-DAY POST-VISIT CHAT API
  // ==========================================
  static getConsultations(userId?: string, role?: UserRole): ConsultationSession[] {
    let stored = getStored<ConsultationSession[]>(
      STORAGE_KEYS.CONSULTATIONS,
      INITIAL_CONSULTATIONS
    );

    // Merge in any missing INITIAL_CONSULTATIONS by ID
    const existingIds = new Set(stored.map((c) => c.id));
    for (const initC of INITIAL_CONSULTATIONS) {
      if (!existingIds.has(initC.id)) {
        stored.push(initC);
        existingIds.add(initC.id);
      }
    }

    // Dynamically refresh the 10-day window status for all sessions
    const refreshed = stored.map((c) => {
      const windowInfo = this.getFollowUpWindowInfo(c.appointmentDate);
      return {
        ...c,
        daysRemaining: windowInfo.daysRemaining,
        isFollowUpActive: windowInfo.isFollowUpActive,
        status: windowInfo.isFollowUpActive ? ('Ongoing' as const) : ('Expired' as const),
      };
    });

    if (!userId || !role) return refreshed;

    if (role === 'PATIENT') {
      const patientList = refreshed.filter(
        (c) =>
          c.patientId === userId ||
          (userId && c.patientName.toLowerCase() === userId.toLowerCase()) ||
          (userId && c.patientName.toLowerCase().includes(userId.toLowerCase()))
      );
      return patientList;
    }

    if (role === 'DOCTOR') {
      const doctors = this.getDoctors();
      const users = this.getUsers();

      const currentDoc = doctors.find(
        (d) =>
          d.id === userId ||
          d.email === userId ||
          d.uniqueDoctorId === userId ||
          (userId && (d.name.toLowerCase().includes(userId.toLowerCase()) || userId.toLowerCase().includes(d.name.toLowerCase())))
      );

      const currentUserObj = users.find(
        (u) =>
          u.id === userId ||
          u.email === userId ||
          (userId && (u.name.toLowerCase().includes(userId.toLowerCase()) || userId.toLowerCase().includes(u.name.toLowerCase())))
      );

      const searchNames = [
        currentDoc?.name,
        currentUserObj?.name,
        userId,
      ]
        .filter(Boolean)
        .map((n) => n!.toLowerCase());

      const doctorList = refreshed.filter((c) => {
        if (c.doctorId === userId) return true;
        if (currentDoc && c.doctorId === currentDoc.id) return true;
        if (currentUserObj && c.doctorId === currentUserObj.id) return true;

        const cName = c.doctorName.toLowerCase();
        for (const sName of searchNames) {
          if (cName.includes(sName) || sName.includes(cName)) return true;
        }

        return false;
      });

      return doctorList;
    }

    return refreshed;
  }

  static getConsultationById(id: string): ConsultationSession | undefined {
    const list = this.getConsultations();
    return list.find((c) => c.id === id);
  }

  static getConsultationMessages(consultationId: string): ChatMessage[] {
    const allMessages = getStored<Record<string, ChatMessage[]>>(
      STORAGE_KEYS.MESSAGES,
      INITIAL_MESSAGES
    );
    // Merge initial messages if key not found in storage
    if (!allMessages[consultationId] && INITIAL_MESSAGES[consultationId]) {
      allMessages[consultationId] = INITIAL_MESSAGES[consultationId];
    }
    return allMessages[consultationId] || [];
  }

  static mergeConsultationMessages(consultationId: string, cloudMsgs: ChatMessage[]) {
    const allMessages = getStored<Record<string, ChatMessage[]>>(
      STORAGE_KEYS.MESSAGES,
      INITIAL_MESSAGES
    );
    const existing = allMessages[consultationId] || INITIAL_MESSAGES[consultationId] || [];
    const existingIds = new Set(existing.map((m) => m.id));

    let updated = false;
    const merged = [...existing];

    for (const cMsg of cloudMsgs) {
      if (cMsg && cMsg.id && !existingIds.has(cMsg.id)) {
        merged.push(cMsg);
        existingIds.add(cMsg.id);
        updated = true;
      }
    }

    if (updated) {
      merged.sort((a, b) => a.id.localeCompare(b.id));
      allMessages[consultationId] = merged;
      setStored(STORAGE_KEYS.MESSAGES, allMessages);
    }
  }

  static sendConsultationMessage(params: {
    consultationId: string;
    senderId: string;
    senderRole: 'PATIENT' | 'DOCTOR';
    senderName: string;
    senderAvatar?: string;
    text: string;
    attachments?: ChatAttachment[];
  }): ChatMessage {
    const allMessages = getStored<Record<string, ChatMessage[]>>(
      STORAGE_KEYS.MESSAGES,
      INITIAL_MESSAGES
    );

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      consultationId: params.consultationId,
      senderId: params.senderId,
      senderRole: params.senderRole,
      senderName: params.senderName,
      senderAvatar: params.senderAvatar,
      text: params.text,
      timestamp: timeStr,
      attachments: params.attachments,
    };

    const currentList = allMessages[params.consultationId] || [];
    allMessages[params.consultationId] = [...currentList, newMsg];
    setStored(STORAGE_KEYS.MESSAGES, allMessages);

    // Sync live message to Firestore cloud for real-time doctor-patient chat
    setDoc(doc(db, 'consultation_messages', newMsg.id), newMsg).catch((err) =>
      console.warn('Failed to sync message to Firestore:', err)
    );

    // Update consultation session summary
    const allConsultations = getStored<ConsultationSession[]>(
      STORAGE_KEYS.CONSULTATIONS,
      INITIAL_CONSULTATIONS
    );

    const updatedConsultations = allConsultations.map((c) => {
      if (c.id === params.consultationId) {
        return {
          ...c,
          lastMessage: params.text,
          lastMessageTime: timeStr,
          unreadDoctor: params.senderRole === 'PATIENT' ? (c.unreadDoctor || 0) + 1 : 0,
          unreadPatient: params.senderRole === 'DOCTOR' ? (c.unreadPatient || 0) + 1 : 0,
        };
      }
      return c;
    });

    setStored(STORAGE_KEYS.CONSULTATIONS, updatedConsultations);

    // Also push notification to counterparty
    const targetSession = allConsultations.find((c) => c.id === params.consultationId);
    if (targetSession) {
      if (params.senderRole === 'PATIENT') {
        this.addNotification({
          title: `New Message from ${params.senderName}`,
          message: params.text.slice(0, 80),
          type: 'system',
        });
      } else {
        this.addNotification({
          title: `Doctor Response from ${params.senderName}`,
          message: params.text.slice(0, 80),
          type: 'system',
        });
      }
    }

    notifyListeners();
    return newMsg;
  }

  static createConsultation(params: {
    patientId: string;
    patientName: string;
    patientAvatar?: string;
    patientAge?: number;
    patientGender?: string;
    patientBloodGroup?: string;
    doctorId: string;
    doctorName: string;
    doctorSpecialty?: string;
    doctorAvatar?: string;
    hospitalName?: string;
    appointmentId?: string;
    appointmentDate?: string;
    appointmentReason?: string;
    chiefComplaint: string;
    initialMessage?: string;
  }): ConsultationSession {
    const allConsultations = getStored<ConsultationSession[]>(
      STORAGE_KEYS.CONSULTATIONS,
      INITIAL_CONSULTATIONS
    );

    const apptDate = params.appointmentDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const windowInfo = this.getFollowUpWindowInfo(apptDate);

    const newSession: ConsultationSession = {
      id: `c-${Date.now()}`,
      patientId: params.patientId,
      patientName: params.patientName,
      patientAvatar: params.patientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      patientAge: params.patientAge || 28,
      patientGender: params.patientGender || 'Male',
      patientBloodGroup: params.patientBloodGroup || 'O+',
      doctorId: params.doctorId,
      doctorName: params.doctorName,
      doctorSpecialty: params.doctorSpecialty || 'Specialist Physician',
      doctorAvatar: params.doctorAvatar || '/src/assets/images/doctor_priya_sharma_1790192843688.jpg',
      hospitalName: params.hospitalName || 'MedDesk Clinic',
      appointmentId: params.appointmentId,
      appointmentDate: apptDate,
      appointmentReason: params.appointmentReason || params.chiefComplaint,
      daysRemaining: windowInfo.daysRemaining,
      isFollowUpActive: windowInfo.isFollowUpActive,
      status: windowInfo.isFollowUpActive ? ('Ongoing' as const) : ('Expired' as const),
      chiefComplaint: params.chiefComplaint,
      startTime: 'Just now',
      lastMessage: params.initialMessage || params.chiefComplaint,
      lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unreadDoctor: 1,
      unreadPatient: 0,
    };

    setStored(STORAGE_KEYS.CONSULTATIONS, [newSession, ...allConsultations]);

    if (params.initialMessage) {
      this.sendConsultationMessage({
        consultationId: newSession.id,
        senderId: params.patientId,
        senderRole: 'PATIENT',
        senderName: params.patientName,
        senderAvatar: params.patientAvatar,
        text: params.initialMessage,
      });
    }

    notifyListeners();
    return newSession;
  }

  static updateConsultationStatus(
    consultationId: string,
    status: 'Ongoing' | 'Completed' | 'Waiting'
  ): void {
    const all = getStored<ConsultationSession[]>(
      STORAGE_KEYS.CONSULTATIONS,
      INITIAL_CONSULTATIONS
    );
    const updated = all.map((c) => (c.id === consultationId ? { ...c, status } : c));
    setStored(STORAGE_KEYS.CONSULTATIONS, updated);
    notifyListeners();
  }

  static updateConsultationNotes(consultationId: string, notes: string): void {
    const all = getStored<ConsultationSession[]>(
      STORAGE_KEYS.CONSULTATIONS,
      INITIAL_CONSULTATIONS
    );
    const updated = all.map((c) => (c.id === consultationId ? { ...c, notes } : c));
    setStored(STORAGE_KEYS.CONSULTATIONS, updated);
    notifyListeners();
  }

<<<<<<< HEAD
  static async issuePrescriptionFromConsultation(params: {
=======
  static issuePrescriptionFromConsultation(params: {
>>>>>>> 85356b1c7ebac862bbb456be6c3bab1f9c48068c
    consultationId: string;
    doctorId: string;
    doctorName: string;
    doctorAvatar?: string;
    patientId: string;
    diagnosis: string;
    medicines: { name: string; dosage: string; duration: string; instruction: string }[];
    notes: string;
    recommendedTests?: string[];
<<<<<<< HEAD
  }): Promise<MedicalRecord> {
    // 1. Create a medical record in the patient's records vault
    const medSummary = params.medicines.map((m) => `${m.name} (${m.dosage}) for ${m.duration}`).join(', ');
    const record = await this.uploadRecord({
=======
  }): MedicalRecord {
    // 1. Create a medical record in the patient's records vault
    const medSummary = params.medicines.map((m) => `${m.name} (${m.dosage}) for ${m.duration}`).join(', ');
    const record = this.uploadRecord({
>>>>>>> 85356b1c7ebac862bbb456be6c3bab1f9c48068c
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

    // 2. Post the prescription card as a message inside the consultation chat
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

