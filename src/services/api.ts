import { INITIAL_DOCTORS } from '../data/initialData';
import {
  Appointment,
  ChatAttachment,
  ChatMessage,
  ConsultationSession,
  Doctor,
  MedicalRecord,
  NotificationItem,
  User,
  UserRole,
} from '../types';

export interface BillingSlip {
  invoiceId: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  department: string;
  hospital: string;
  doctorFee: number;
  vitalsFee: number;
  vaultFee: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMode: string;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  transactionRef: string;
  paymentTimestamp: string;
}

export interface BookedSlotEntry {
  doctorId: string;
  date: string;
  time: string;
}

export interface DoctorScheduleConfig {
  weekly: Record<
    string,
    {
      isWorking: boolean;
      startTime: string;
      endTime: string;
      breakStart: string;
      breakEnd: string;
      slotDurationMinutes: number;
    }
  >;
  overrides: Record<
    string,
    {
      status: 'Available' | 'Absent' | 'Leave' | 'Holiday';
      reason?: string;
    }
  >;
  leaves: Array<{
    id: string;
    type: 'Single-Day' | 'Multi-Day';
    startDate: string;
    endDate: string;
    reason: string;
  }>;
  holidays: Array<{
    id: string;
    startDate: string;
    reason: string;
  }>;
}

interface AppMemoryStore {
  initialized: boolean;
  adminClaimed: boolean;
  currentUser: User | null;
  users: User[];
  doctors: Doctor[];
  appointments: Appointment[];
  billingSlips: BillingSlip[];
  records: MedicalRecord[];
  consultations: ConsultationSession[];
  messages: Record<string, ChatMessage[]>;
  notifications: NotificationItem[];
  doctorSlots: Record<string, string[]>;
  doctorSchedules: Record<string, DoctorScheduleConfig>;
  bookedSlots: BookedSlotEntry[];
  adminSelectedDoctorId: string | null;
}

const DEFAULT_SLOTS = [
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

const DEFAULT_STORE: AppMemoryStore = {
  initialized: false,
  adminClaimed: true,
  currentUser: null,
  users: [],
  doctors: INITIAL_DOCTORS,
  appointments: [],
  billingSlips: [],
  records: [],
  consultations: [],
  messages: {},
  notifications: [],
  doctorSlots: {},
  doctorSchedules: {},
  bookedSlots: [],
  adminSelectedDoctorId: null,
};

let store: AppMemoryStore = { ...DEFAULT_STORE };
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

function normalizeDateKey(dateStr: string): string {
  if (!dateStr) return '';
  const cleaned = dateStr.replace(/^[A-Za-z]+,\s*/, '');
  const d = new Date(cleaned);
  if (!Number.isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return dateStr.trim().toLowerCase();
}

export class MedicareApiClient {
  private static authToken: string | null = null;
  private static initPromise: Promise<void> | null = null;

  static subscribe(listener: ChangeListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  private static async apiFetch<T = unknown>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    };
    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await res.json().catch(() => ({}))
      : {};

    if (!res.ok) {
      const msg =
        (data && typeof data.message === 'string' && data.message) ||
        `Request failed (${res.status})`;
      throw new Error(msg);
    }
    return data as T;
  }

  static async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }
    this.initPromise = this.refreshBootstrap().finally(() => {
      this.initPromise = null;
    });
    return this.initPromise;
  }

  static async refreshBootstrap(): Promise<void> {
    try {
      const data = await this.apiFetch<{
        authenticated: boolean;
        adminClaimed?: boolean;
        user?: User;
        doctors?: Doctor[];
        users?: User[];
        appointments?: Appointment[];
        billingSlips?: BillingSlip[];
        records?: MedicalRecord[];
        consultations?: ConsultationSession[];
        messages?: Record<string, ChatMessage[]>;
        notifications?: NotificationItem[];
        doctorSlots?: Record<string, string[]>;
        doctorSchedules?: Record<string, DoctorScheduleConfig>;
        bookedSlots?: BookedSlotEntry[];
      }>('/api/bootstrap');

      store = {
        ...store,
        initialized: true,
        adminClaimed: Boolean(data.adminClaimed),
        currentUser: data.authenticated && data.user ? data.user : null,
        doctors: Array.isArray(data.doctors) ? data.doctors : store.doctors,
        users: data.authenticated && Array.isArray(data.users) ? data.users : [],
        appointments:
          data.authenticated && Array.isArray(data.appointments) ? data.appointments : [],
        billingSlips:
          data.authenticated && Array.isArray(data.billingSlips) ? data.billingSlips : [],
        records: data.authenticated && Array.isArray(data.records) ? data.records : [],
        consultations:
          data.authenticated && Array.isArray(data.consultations) ? data.consultations : [],
        messages: data.authenticated && data.messages ? data.messages : {},
        notifications:
          data.authenticated && Array.isArray(data.notifications) ? data.notifications : [],
        doctorSlots: data.doctorSlots || {},
        doctorSchedules: data.doctorSchedules || {},
        bookedSlots: Array.isArray(data.bookedSlots) ? data.bookedSlots : [],
      };
      notifyListeners();
    } catch (err) {
      console.warn('Failed to load bootstrap state:', err);
      store = { ...store, initialized: true };
      notifyListeners();
    }
  }

  // ==========================================
  // AUTH & SESSION
  // ==========================================
  static isInitialized(): boolean {
    return store.initialized;
  }

  static isAdminClaimed(): boolean {
    return store.adminClaimed;
  }

  static getCurrentUser(): User | null {
    return store.currentUser;
  }

  static async adminSetup(password: string, name?: string): Promise<User> {
    const res = await this.apiFetch<{ user: User; token: string }>('/api/auth/admin-setup', {
      method: 'POST',
      body: JSON.stringify({ password, name }),
    });
    this.authToken = res.token || null;
    store = { ...store, adminClaimed: true, currentUser: res.user };
    await this.refreshBootstrap();
    return res.user;
  }

  static async login(params: {
    identifier: string;
    password: string;
    role?: UserRole;
  }): Promise<User> {
    const res = await this.apiFetch<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    this.authToken = res.token || null;
    store = { ...store, currentUser: res.user };
    await this.refreshBootstrap();
    return res.user;
  }

  static async registerUser(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    gender?: string;
    bloodGroup?: string;
    avatar?: string;
  }): Promise<User> {
    const res = await this.apiFetch<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.authToken = res.token || null;
    store = { ...store, currentUser: res.user };
    await this.refreshBootstrap();
    return res.user;
  }

  static async logout(): Promise<void> {
    try {
      await this.apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors during logout cleanup
    }
    this.authToken = null;
    store = {
      ...store,
      currentUser: null,
      users: [],
      appointments: [],
      billingSlips: [],
      records: [],
      consultations: [],
      messages: {},
      notifications: [],
    };
    notifyListeners();
  }

  // ==========================================
  // USERS & PATIENTS
  // ==========================================
  static getUsers(): User[] {
    return store.users;
  }

  static async createUser(data: {
    name: string;
    email: string;
    role: 'PATIENT' | 'DOCTOR';
    password?: string;
    phone?: string;
    gender?: string;
    bloodGroup?: string;
  }): Promise<{ user: User; temporaryPassword?: string }> {
    const res = await this.apiFetch<{ user: User; temporaryPassword?: string }>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    store = { ...store, users: [res.user, ...store.users] };
    notifyListeners();
    return res;
  }

  static async updateUserProfile(userId: string, data: Partial<User>): Promise<User> {
    const res = await this.apiFetch<{ user: User }>(`/api/users/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const updatedUser = res.user;
    store = {
      ...store,
      users: store.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
      currentUser:
        store.currentUser && store.currentUser.id === updatedUser.id
          ? updatedUser
          : store.currentUser,
      appointments: store.appointments.map((a) =>
        a.patientId === updatedUser.id
          ? { ...a, patientName: updatedUser.name, patientAvatar: updatedUser.avatar }
          : a
      ),
      consultations: store.consultations.map((c) =>
        c.patientId === updatedUser.id
          ? {
              ...c,
              patientName: updatedUser.name,
              patientAvatar: updatedUser.avatar,
              patientBloodGroup: updatedUser.bloodGroup,
            }
          : c
      ),
    };
    notifyListeners();
    return updatedUser;
  }

  static async toggleUserStatus(userId: string): Promise<User[]> {
    const res = await this.apiFetch<{ users: User[] }>(
      `/api/users/${encodeURIComponent(userId)}/status`,
      { method: 'PUT' }
    );
    store = { ...store, users: res.users };
    notifyListeners();
    return res.users;
  }

  // ==========================================
  // DOCTORS DIRECTORY & MANAGEMENT
  // ==========================================
  static getDoctors(): Doctor[] {
    return store.doctors;
  }

  static getDoctorById(id: string): Doctor | undefined {
    return store.doctors.find((d) => d.id === id);
  }

  static getDoctorByUniqueId(uniqueId: string): Doctor | undefined {
    const clean = uniqueId.trim().toUpperCase();
    return store.doctors.find(
      (d) =>
        (d.uniqueDoctorId && d.uniqueDoctorId.toUpperCase() === clean) ||
        d.id.toUpperCase() === clean ||
        (d.email && d.email.toUpperCase() === clean)
    );
  }

  static resolveDoctorIdForUser(userOrId: User | string): string | undefined {
    const userId = typeof userOrId === 'string' ? userOrId : userOrId.id;
    const userObj =
      typeof userOrId === 'string'
        ? store.users.find((u) => u.id === userOrId) ||
          (store.currentUser?.id === userOrId ? store.currentUser : undefined)
        : userOrId;

    const match = store.doctors.find(
      (d) =>
        d.id === userId ||
        `usr_${d.id}` === userId ||
        (userObj?.uniqueDoctorId &&
          d.uniqueDoctorId &&
          userObj.uniqueDoctorId.toUpperCase() === d.uniqueDoctorId.toUpperCase()) ||
        (userObj?.email && d.email && userObj.email.toLowerCase() === d.email.toLowerCase()) ||
        (userObj?.name && d.name.toLowerCase() === userObj.name.toLowerCase())
    );
    return match?.id;
  }

  static async addDoctor(data: {
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
    password?: string;
    avatar?: string;
    availableDays?: string[];
    timeSlots?: string[];
  }): Promise<{ doctor: Doctor; user: User; temporaryPassword: string }> {
    const res = await this.apiFetch<{
      doctor: Doctor;
      user: User;
      temporaryPassword: string;
    }>('/api/doctors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    store = {
      ...store,
      doctors: [res.doctor, ...store.doctors],
      users: [res.user, ...store.users],
    };
    notifyListeners();
    return res;
  }

  static async updateDoctorProfile(
    doctorIdOrUserId: string,
    data: Partial<Doctor> & Partial<User>
  ): Promise<Doctor> {
    const resolvedId = this.resolveDoctorIdForUser(doctorIdOrUserId) || doctorIdOrUserId;
    const res = await this.apiFetch<{ doctor: Doctor }>(
      `/api/doctors/${encodeURIComponent(resolvedId)}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    const updatedDoc = res.doctor;
    store = {
      ...store,
      doctors: store.doctors.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)),
      users: store.users.map((u) =>
        u.id === `usr_${updatedDoc.id}` ||
        (updatedDoc.uniqueDoctorId && u.uniqueDoctorId === updatedDoc.uniqueDoctorId)
          ? {
              ...u,
              name: updatedDoc.name,
              phone: updatedDoc.phone,
              avatar: updatedDoc.avatar,
              specialty: updatedDoc.specialty,
              department: updatedDoc.department,
              hospital: updatedDoc.hospital,
              education: updatedDoc.education,
              experienceYears: updatedDoc.experienceYears,
              consultationFee: updatedDoc.consultationFee,
              about: updatedDoc.about,
            }
          : u
      ),
      currentUser:
        store.currentUser &&
        (store.currentUser.id === `usr_${updatedDoc.id}` ||
          (updatedDoc.uniqueDoctorId &&
            store.currentUser.uniqueDoctorId === updatedDoc.uniqueDoctorId))
          ? {
              ...store.currentUser,
              name: updatedDoc.name,
              phone: updatedDoc.phone,
              avatar: updatedDoc.avatar,
              specialty: updatedDoc.specialty,
              department: updatedDoc.department,
              hospital: updatedDoc.hospital,
              education: updatedDoc.education,
              experienceYears: updatedDoc.experienceYears,
              consultationFee: updatedDoc.consultationFee,
              about: updatedDoc.about,
            }
          : store.currentUser,
      appointments: store.appointments.map((a) =>
        a.doctorId === updatedDoc.id
          ? {
              ...a,
              doctorName: updatedDoc.name,
              doctorAvatar: updatedDoc.avatar,
              department: updatedDoc.department,
              hospital: updatedDoc.hospital,
            }
          : a
      ),
    };
    notifyListeners();
    return updatedDoc;
  }

  static async resetDoctorPassword(
    doctorId: string,
    password?: string
  ): Promise<{ doctorId: string; uniqueDoctorId?: string; temporaryPassword: string }> {
    return this.apiFetch(`/api/doctors/${encodeURIComponent(doctorId)}/reset-password`, {
      method: 'POST',
      body: JSON.stringify(password ? { password } : {}),
    });
  }

  static async deleteDoctor(id: string): Promise<Doctor[]> {
    const res = await this.apiFetch<{ doctors: Doctor[] }>(
      `/api/doctors/${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    );
    store = {
      ...store,
      doctors: res.doctors,
      users: store.users.filter((u) => u.id !== `usr_${id}`),
    };
    notifyListeners();
    return res.doctors;
  }

  // ==========================================
  // APPOINTMENTS & BILLING SLIPS
  // ==========================================
  static getAppointments(): Appointment[] {
    return store.appointments;
  }

  static getAppointmentsByPatient(patientId: string): Appointment[] {
    return store.appointments.filter((a) => a.patientId === patientId);
  }

  static getAppointmentsByDoctor(doctorIdOrUserId: string): Appointment[] {
    const resolvedDocId = this.resolveDoctorIdForUser(doctorIdOrUserId);
    return store.appointments.filter(
      (a) => a.doctorId === doctorIdOrUserId || (resolvedDocId && a.doctorId === resolvedDocId)
    );
  }

  static getBookedSlotsForDoctor(doctorId: string, date: string): BookedSlotEntry[] {
    const targetNorm = normalizeDateKey(date);
    const seen = new Set<string>();
    const results: BookedSlotEntry[] = [];

    for (const slot of store.bookedSlots) {
      if (slot.doctorId === doctorId && normalizeDateKey(slot.date) === targetNorm) {
        const key = `${slot.doctorId}|${normalizeDateKey(slot.date)}|${slot.time.trim().toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push(slot);
        }
      }
    }
    for (const apt of store.appointments) {
      if (
        apt.status !== 'Cancelled' &&
        apt.doctorId === doctorId &&
        normalizeDateKey(apt.date) === targetNorm
      ) {
        const key = `${apt.doctorId}|${normalizeDateKey(apt.date)}|${apt.time.trim().toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push({ doctorId: apt.doctorId, date: apt.date, time: apt.time });
        }
      }
    }
    return results;
  }

  static async bookAppointment(data: {
    doctorId: string;
    patientId?: string;
    patientName?: string;
    date: string;
    time: string;
    reason: string;
    paymentMethod?: 'clinic' | 'online';
    consultationType?: 'In-Clinic' | 'Video/Online';
  }): Promise<Appointment> {
    const res = await this.apiFetch<{
      appointment: Appointment;
      slip?: BillingSlip;
      consultation?: ConsultationSession;
      notification?: NotificationItem;
    }>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const newApt = res.appointment;
    const nextBookedSlots = [
      ...store.bookedSlots,
      { doctorId: newApt.doctorId, date: newApt.date, time: newApt.time },
    ];
    const nextConsultations = res.consultation
      ? [
          res.consultation,
          ...store.consultations.filter((c) => c.id !== res.consultation!.id),
        ]
      : store.consultations;

    store = {
      ...store,
      appointments: [newApt, ...store.appointments],
      billingSlips: res.slip ? [res.slip, ...store.billingSlips] : store.billingSlips,
      consultations: nextConsultations,
      notifications: res.notification
        ? [res.notification, ...store.notifications]
        : store.notifications,
      bookedSlots: nextBookedSlots,
    };
    notifyListeners();
    return newApt;
  }

  static async updateAppointment(
    appointmentId: string,
    payload: {
      status?: Appointment['status'];
      notes?: string;
      prescription?: string;
    }
  ): Promise<Appointment> {
    const res = await this.apiFetch<{ appointment: Appointment }>(
      `/api/appointments/${encodeURIComponent(appointmentId)}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
    const updatedApt = res.appointment;
    const nextAppointments = store.appointments.map((a) =>
      a.id === updatedApt.id ? updatedApt : a
    );
    const nextBookedSlots =
      updatedApt.status === 'Cancelled'
        ? store.bookedSlots.filter(
            (s) =>
              !(
                s.doctorId === updatedApt.doctorId &&
                normalizeDateKey(s.date) === normalizeDateKey(updatedApt.date) &&
                s.time.trim().toLowerCase() === updatedApt.time.trim().toLowerCase()
              )
          )
        : store.bookedSlots;

    store = {
      ...store,
      appointments: nextAppointments,
      bookedSlots: nextBookedSlots,
    };
    notifyListeners();
    return updatedApt;
  }

  static async updateAppointmentStatus(
    appointmentId: string,
    status: Appointment['status']
  ): Promise<Appointment[]> {
    await this.updateAppointment(appointmentId, { status });
    return store.appointments;
  }

  static getBillingSlip(appointmentId: string): BillingSlip | undefined {
    return store.billingSlips.find((s) => s.appointmentId === appointmentId);
  }

  static async fetchBillingSlip(
    appointmentId: string
  ): Promise<{ slip: BillingSlip; appointment: Appointment }> {
    const res = await this.apiFetch<{ slip: BillingSlip; appointment: Appointment }>(
      `/api/slip/${encodeURIComponent(appointmentId)}`
    );
    if (res.slip && !store.billingSlips.some((s) => s.appointmentId === appointmentId)) {
      store = { ...store, billingSlips: [res.slip, ...store.billingSlips] };
    }
    return res;
  }

  // ==========================================
  // MEDICAL RECORDS VAULT
  // ==========================================
  static getRecords(patientId?: string): MedicalRecord[] {
    if (!patientId) return store.records;
    return store.records.filter((r) => r.patientId === patientId);
  }

  static async uploadRecord(record: Omit<MedicalRecord, 'id'>): Promise<MedicalRecord> {
    const res = await this.apiFetch<{ record: MedicalRecord }>('/api/records', {
      method: 'POST',
      body: JSON.stringify(record),
    });
    const newRec = res.record;
    store = { ...store, records: [newRec, ...store.records] };
    notifyListeners();
    return newRec;
  }

  static async deleteRecord(recordId: string): Promise<void> {
    await this.apiFetch(`/api/records/${encodeURIComponent(recordId)}`, {
      method: 'DELETE',
    });
    store = { ...store, records: store.records.filter((r) => r.id !== recordId) };
    notifyListeners();
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  static getNotifications(user?: User): NotificationItem[] {
    const list = store.notifications;
    if (!user) return list;
    return list.filter((n) => {
      if (n.recipientId) {
        return n.recipientId === user.id;
      }
      if (n.recipientRole && n.recipientRole !== 'ALL') {
        return n.recipientRole === user.role;
      }
      return true;
    });
  }

  static async markNotificationRead(id: string, user?: User): Promise<NotificationItem[]> {
    store = {
      ...store,
      notifications: store.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    };
    notifyListeners();
    try {
      await this.apiFetch(`/api/notifications/${encodeURIComponent(id)}/read`, {
        method: 'PUT',
      });
    } catch (err) {
      console.warn('Failed to mark notification read:', err);
    }
    return this.getNotifications(user);
  }

  static async markAllNotificationsRead(user?: User): Promise<NotificationItem[]> {
    store = {
      ...store,
      notifications: store.notifications.map((n) => {
        if (!user || user.role === 'ADMIN') return { ...n, read: true };
        const isTarget =
          n.recipientId === user.id || n.recipientRole === user.role || !n.recipientId;
        return isTarget ? { ...n, read: true } : n;
      }),
    };
    notifyListeners();
    try {
      await this.apiFetch('/api/notifications/read-all', { method: 'PUT' });
    } catch (err) {
      console.warn('Failed to mark all notifications read:', err);
    }
    return this.getNotifications(user);
  }

  // ==========================================
  // CONSULTATIONS & 10-DAY POST-VISIT CHAT
  // ==========================================
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
      if (Number.isNaN(parsed.getTime())) {
        return { daysRemaining: 7, isFollowUpActive: true, label: '7 days left in follow-up' };
      }
      const now = new Date();
      if (parsed.getTime() > now.getTime()) {
        return {
          daysRemaining: 10,
          isFollowUpActive: true,
          label: '10 days left (Upcoming visit)',
        };
      }
      const daysPassed = Math.floor((now.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24));
      const remaining = 10 - daysPassed;
      if (remaining > 0) {
        return {
          daysRemaining: remaining,
          isFollowUpActive: true,
          label: `${remaining} day${remaining === 1 ? '' : 's'} remaining in 10-day window`,
        };
      }
      return {
        daysRemaining: 0,
        isFollowUpActive: false,
        label: '10-Day Follow-Up Expired',
      };
    } catch {
      return { daysRemaining: 7, isFollowUpActive: true, label: '7 days left in follow-up' };
    }
  }

  static getConsultations(userId?: string, role?: UserRole): ConsultationSession[] {
    const refreshed = store.consultations.map((c) => {
      const win = this.getFollowUpWindowInfo(c.appointmentDate);
      return {
        ...c,
        daysRemaining: win.daysRemaining,
        isFollowUpActive: win.isFollowUpActive,
        status: win.isFollowUpActive ? ('Ongoing' as const) : ('Expired' as const),
      };
    });

    if (!userId || !role || role === 'ADMIN') return refreshed;
    if (role === 'PATIENT') {
      return refreshed.filter((c) => c.patientId === userId);
    }
    const resolvedDocId = this.resolveDoctorIdForUser(userId);
    return refreshed.filter(
      (c) => c.doctorId === userId || (resolvedDocId && c.doctorId === resolvedDocId)
    );
  }

  static getConsultationById(id: string): ConsultationSession | undefined {
    return this.getConsultations().find((c) => c.id === id);
  }

  static getConsultationMessages(consultationId: string): ChatMessage[] {
    return store.messages[consultationId] || [];
  }

  static async sendConsultationMessage(params: {
    consultationId: string;
    senderId: string;
    senderRole: 'PATIENT' | 'DOCTOR';
    senderName: string;
    senderAvatar?: string;
    text: string;
    attachments?: ChatAttachment[];
  }): Promise<ChatMessage> {
    const res = await this.apiFetch<{ message: ChatMessage }>(
      `/api/consultations/${encodeURIComponent(params.consultationId)}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({
          text: params.text,
          attachments: params.attachments,
        }),
      }
    );
    const savedMsg = res.message;
    const prevMsgs = store.messages[params.consultationId] || [];
    store = {
      ...store,
      messages: {
        ...store.messages,
        [params.consultationId]: [...prevMsgs, savedMsg],
      },
      consultations: store.consultations.map((c) =>
        c.id === params.consultationId
          ? {
              ...c,
              lastMessage: savedMsg.text,
              lastMessageTime: savedMsg.timestamp,
            }
          : c
      ),
    };
    notifyListeners();
    return savedMsg;
  }

  static async createConsultation(params: {
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
  }): Promise<ConsultationSession> {
    const res = await this.apiFetch<{ consultation: ConsultationSession }>('/api/consultations', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    const session = res.consultation;
    const initialMsgs: ChatMessage[] = params.initialMessage
      ? [
          {
            id: `msg-${Date.now()}`,
            consultationId: session.id,
            senderId: store.currentUser?.id || params.doctorId,
            senderRole: store.currentUser?.role === 'DOCTOR' ? 'DOCTOR' : 'PATIENT',
            senderName: store.currentUser?.name || params.doctorName,
            senderAvatar: store.currentUser?.avatar || params.doctorAvatar,
            text: params.initialMessage,
            timestamp: session.lastMessageTime || 'Just now',
          },
        ]
      : [];
    store = {
      ...store,
      consultations: [session, ...store.consultations],
      messages: initialMsgs.length
        ? { ...store.messages, [session.id]: initialMsgs }
        : store.messages,
    };
    notifyListeners();
    return session;
  }

  static async updateConsultationStatus(
    consultationId: string,
    status: 'Ongoing' | 'Completed' | 'Waiting'
  ): Promise<void> {
    const res = await this.apiFetch<{ consultation: ConsultationSession }>(
      `/api/consultations/${encodeURIComponent(consultationId)}`,
      {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }
    );
    store = {
      ...store,
      consultations: store.consultations.map((c) =>
        c.id === consultationId ? { ...c, ...res.consultation } : c
      ),
    };
    notifyListeners();
  }

  static async updateConsultationNotes(consultationId: string, notes: string): Promise<void> {
    const res = await this.apiFetch<{ consultation: ConsultationSession }>(
      `/api/consultations/${encodeURIComponent(consultationId)}`,
      {
        method: 'PUT',
        body: JSON.stringify({ notes }),
      }
    );
    store = {
      ...store,
      consultations: store.consultations.map((c) =>
        c.id === consultationId ? { ...c, ...res.consultation } : c
      ),
    };
    notifyListeners();
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
    const medSummary = params.medicines
      .map((m) => `${m.name} (${m.dosage}) for ${m.duration}`)
      .join(', ');
    const record = await this.uploadRecord({
      patientId: params.patientId,
      title: `Prescription - ${params.doctorName}`,
      date: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      category: 'Prescriptions',
      fileType: 'PDF',
      fileSize: '1.4 MB',
      doctorName: params.doctorName,
      facility: 'MedDesk Digital OPD',
      notes: `Diagnosis: ${params.diagnosis}. Rx: ${medSummary}. Instructions: ${params.notes}`,
    });

    await this.sendConsultationMessage({
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

    return record;
  }

  // ==========================================
  // DOCTOR SLOTS & SCHEDULE CONFIGURATION
  // ==========================================
  static getDoctorSlots(doctorId: string, dateStr: string): string[] {
    const key = `${doctorId}_${dateStr}`;
    return store.doctorSlots[key] || DEFAULT_SLOTS;
  }

  static async saveDoctorSlots(
    doctorId: string,
    dateStr: string,
    slots: string[]
  ): Promise<void> {
    const key = `${doctorId}_${dateStr}`;
    await this.apiFetch(`/api/doctor-slots/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ slots }),
    });
    store = {
      ...store,
      doctorSlots: {
        ...store.doctorSlots,
        [key]: slots,
      },
    };
    notifyListeners();
  }

  static getDoctorSchedule(doctorId: string): DoctorScheduleConfig | null {
    return store.doctorSchedules[doctorId] || null;
  }

  static async saveDoctorSchedule(
    doctorId: string,
    schedule: DoctorScheduleConfig
  ): Promise<void> {
    await this.apiFetch(`/api/doctor-schedule/${encodeURIComponent(doctorId)}`, {
      method: 'PUT',
      body: JSON.stringify({ schedule }),
    });
    store = {
      ...store,
      doctorSchedules: {
        ...store.doctorSchedules,
        [doctorId]: schedule,
      },
    };
    notifyListeners();
  }

  static getAdminSelectedDoctorId(): string | null {
    return store.adminSelectedDoctorId;
  }

  static setAdminSelectedDoctorId(id: string): void {
    store = { ...store, adminSelectedDoctorId: id };
    notifyListeners();
  }
}
