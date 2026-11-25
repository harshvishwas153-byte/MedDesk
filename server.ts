import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';
export type AppointmentStatus = 'Upcoming' | 'Completed' | 'Pending' | 'Cancelled';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  gender?: string;
  bloodGroup?: string;
  status: 'Active' | 'Inactive';
  uniqueDoctorId?: string;
  passwordHash?: string;
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
  createdAt?: string;
}

interface StoredDoctor {
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
  uniqueDoctorId?: string;
}

interface StoredAppointment {
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
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
  fee: number;
  consultationType?: 'In-Clinic' | 'Video/Online';
  notes?: string;
  prescription?: string;
  createdAt?: string;
}

interface StoredBillingSlip {
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

interface StoredRecord {
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

interface StoredDatabase {
  users: StoredUser[];
  doctors: StoredDoctor[];
  appointments: StoredAppointment[];
  billingSlips: StoredBillingSlip[];
  records: StoredRecord[];
  notifications: Array<Record<string, unknown>>;
  consultations: Array<Record<string, unknown>>;
  messages: Record<string, Array<Record<string, unknown>>>;
  doctorSlots: Record<string, string[]>;
  doctorSchedules: Record<string, Record<string, unknown>>;
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

function createSeedDatabase(): StoredDatabase {
  const doctors: StoredDoctor[] = [
    {
      id: 'doc-sarah',
      name: 'Dr. Sarah Johnson',
      specialty: 'General Physician',
      department: 'General Medicine',
      hospital: 'MedDesk Hospital, Noida',
      rating: 4.9,
      reviewsCount: 320,
      consultationFee: 500,
      avatar: '/src/assets/images/dr_sarah_johnson_1790494049182.jpg',
      experienceYears: 8,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: ['10:00 AM', '10:30 AM', '11:00 AM', '04:00 PM', '04:30 PM'],
      about: 'Dr. Sarah Johnson is a highly experienced General Physician specializing in preventive care, lifestyle diseases and chronic condition management.',
      education: 'MBBS, MD - General Medicine',
      email: 'sarah.johnson@meddesk.com',
      phone: '+91 98877 66554',
      uniqueDoctorId: 'DOC-1001',
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
      avatar: '/src/assets/images/dr_amit_verma_1790494063279.jpg',
      experienceYears: 7,
      availableDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: ['11:00 AM', '12:00 PM', '02:00 PM', '03:30 PM'],
      about: 'Senior Cardiologist specializing in preventive cardiology, echocardiography, blood pressure management, and cardiovascular wellness.',
      education: 'MBBS, DM (Cardiology)',
      email: 'amit.verma@meddesk.com',
      phone: '+91 96655 44332',
      uniqueDoctorId: 'DOC-1002',
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
      avatar: '/src/assets/images/doctor_priya_sharma_1790192843688.jpg',
      experienceYears: 6,
      availableDays: ['Tuesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: ['10:00 AM', '11:00 AM', '12:00 PM', '04:00 PM'],
      about: 'Consultant Dermatologist and Trichologist specializing in clinical dermatology, skin rejuvenation, acne, and allergy care.',
      education: 'MBBS, MD (Dermatology)',
      email: 'priya.sharma@meddesk.com',
      phone: '+91 97788 55441',
      uniqueDoctorId: 'DOC-1003',
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
      avatar: '/src/assets/images/doctor_vikram_ortho_1790327638427.jpg',
      experienceYears: 15,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: ['10:00 AM', '11:00 AM', '01:00 PM', '03:30 PM', '05:00 PM'],
      about: 'Senior Consultant Orthopedic & Joint Replacement Surgeon with extensive expertise in arthroscopy, sports trauma, and knee care.',
      education: 'MS - Orthopedics, PGI · Fellow Joint Replacement (UK)',
      email: 'vikram.malhotra@meddesk.com',
      phone: '+91 95544 33221',
      uniqueDoctorId: 'DOC-1004',
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
      avatar: '/src/assets/images/doctor_rahul_mehta_1790192856312.jpg',
      experienceYears: 9,
      availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      timeSlots: ['09:30 AM', '11:00 AM', '02:00 PM', '04:30 PM'],
      about: 'Specialist in pediatric wellness, newborn care, childhood immunizations, and developmental health.',
      education: 'MBBS, MD - Pediatrics',
      email: 'rahul.mehta@meddesk.com',
      phone: '+91 94433 22110',
      uniqueDoctorId: 'DOC-1005',
    },
  ];

  const users: StoredUser[] = [
    {
      id: 'usr-3',
      name: 'Hospital Administrator',
      email: 'admin@meddesk.com',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      phone: '+91 91234 56789',
      gender: 'Male',
      status: 'Active',
    },
    ...doctors.map((d) => ({
      id: `usr_${d.id}`,
      name: d.name,
      email: d.email || `${d.id}@meddesk.com`,
      role: 'DOCTOR' as UserRole,
      avatar: d.avatar,
      phone: d.phone,
      status: 'Active' as const,
      uniqueDoctorId: d.uniqueDoctorId,
      specialty: d.specialty,
      department: d.department,
      hospital: d.hospital,
      education: d.education,
      experienceYears: d.experienceYears,
      consultationFee: d.consultationFee,
      about: d.about,
    })),
  ];

  return {
    users,
    doctors,
    appointments: [],
    billingSlips: [],
    records: [],
    notifications: [],
    consultations: [],
    messages: {},
    doctorSlots: {},
    doctorSchedules: {},
  };
}

function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(plain, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

function verifyPassword(plain: string, storedHash?: string): boolean {
  if (!plain || !storedHash) return false;
  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, expectedHex] = parts;
  const expected = Buffer.from(expectedHex, 'hex');
  const actual = crypto.scryptSync(plain, salt, 64);
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}

function sanitizeText(input: unknown, maxLen = 2000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLen);
}

function sanitizeAvatar(input: unknown, fallback: string): string {
  if (typeof input !== 'string') return fallback;
  const trimmed = input.trim();
  if (/^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) {
    return trimmed.slice(0, 500000);
  }
  if (/^(https?:\/\/|\/src\/assets\/|\/assets\/)/i.test(trimmed)) {
    return sanitizeText(trimmed, 500);
  }
  return fallback;
}

function isValidEmail(email: string): boolean {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
}

function normalizeDateKey(dateStr: string): string {
  const parsed = new Date(dateStr);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return dateStr.trim().toLowerCase();
}

function sanitizeUser(u: StoredUser): Omit<StoredUser, 'passwordHash'> {
  const { passwordHash: _removed, ...safe } = u;
  return safe;
}

function computeFollowUpWindow(dateStr?: string) {
  if (!dateStr) {
    return { daysRemaining: 10, isFollowUpActive: true };
  }
  const cleaned = dateStr.replace(/^[A-Za-z]+,\s*/, '');
  const parsed = new Date(cleaned);
  if (Number.isNaN(parsed.getTime())) {
    return { daysRemaining: 7, isFollowUpActive: true };
  }
  const now = new Date();
  if (parsed.getTime() > now.getTime()) {
    return { daysRemaining: 10, isFollowUpActive: true };
  }
  const daysPassed = Math.floor((now.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24));
  const remaining = Math.max(0, 10 - daysPassed);
  return { daysRemaining: remaining, isFollowUpActive: remaining > 0 };
}

function buildBillingSlip(apt: StoredAppointment, paymentMethod?: string): StoredBillingSlip {
  const total = Number(apt.fee) || 500;
  const doctorFee = Number((total * 0.8).toFixed(2));
  const vitalsFee = Number((total * 0.15).toFixed(2));
  const vaultFee = Number((total - doctorFee - vitalsFee).toFixed(2));
  const isClinic = paymentMethod === 'clinic';

  return {
    invoiceId: `INV-${apt.id}`,
    appointmentId: apt.id,
    patientId: apt.patientId,
    patientName: apt.patientName,
    doctorName: apt.doctorName,
    department: apt.department,
    hospital: apt.hospital,
    doctorFee,
    vitalsFee,
    vaultFee,
    discountAmount: 0,
    taxAmount: 0,
    totalAmount: total,
    paymentMode: isClinic ? 'Pay at Clinic Counter' : 'UPI / Online Gateway',
    paymentStatus: isClinic ? 'PENDING' : 'PAID',
    transactionRef: isClinic ? `OPD/MC-${apt.id}` : `UPI/MC-${apt.id}-9821`,
    paymentTimestamp: new Date().toISOString(),
  };
}

export interface ServerOptions {
  dbPath?: string;
  adminPasscode?: string;
}

export function createApp(options: ServerOptions = {}) {
  const dbPath = options.dbPath || path.join(__dirname, 'data', 'meddesk-db.json');
  const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
  const envAdminPasscode = (options.adminPasscode ?? process.env.ADMIN_PASSCODE ?? '').trim();

  let writeChain = Promise.resolve();
  const withWriteLock = <T>(fn: () => Promise<T> | T): Promise<T> => {
    const next = writeChain.then(fn, fn);
    writeChain = next.then(
      () => undefined,
      () => undefined
    );
    return next;
  };

  function ensureDbLoaded(): StoredDatabase {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(dbPath)) {
      const seed = createSeedDatabase();
      fs.writeFileSync(dbPath, JSON.stringify(seed, null, 2), 'utf8');
      return seed;
    }
    const raw = fs.readFileSync(dbPath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<StoredDatabase>;
    const seed = createSeedDatabase();
    return {
      users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : seed.users,
      doctors: Array.isArray(parsed.doctors) && parsed.doctors.length > 0 ? parsed.doctors : seed.doctors,
      appointments: Array.isArray(parsed.appointments) ? parsed.appointments : [],
      billingSlips: Array.isArray(parsed.billingSlips) ? parsed.billingSlips : [],
      records: Array.isArray(parsed.records) ? parsed.records : [],
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
      consultations: Array.isArray(parsed.consultations) ? parsed.consultations : [],
      messages: parsed.messages && typeof parsed.messages === 'object' ? parsed.messages : {},
      doctorSlots: parsed.doctorSlots && typeof parsed.doctorSlots === 'object' ? parsed.doctorSlots : {},
      doctorSchedules: parsed.doctorSchedules && typeof parsed.doctorSchedules === 'object' ? parsed.doctorSchedules : {},
    };
  }

  function persistDb(dbState: StoredDatabase): void {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tmpPath = `${dbPath}.${process.pid}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(dbState, null, 2), 'utf8');
    fs.renameSync(tmpPath, dbPath);
  }

  function signToken(user: StoredUser): string {
    const payloadObj = {
      sub: user.id,
      role: user.role,
      exp: Date.now() + 24 * 60 * 60 * 1000,
    };
    const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
    const sig = crypto.createHmac('sha256', sessionSecret).update(payload).digest('base64url');
    return `${payload}.${sig}`;
  }

  function verifyToken(token: string): { sub: string; role: UserRole; exp: number } | null {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payload, sig] = parts;
    const expectedSig = crypto.createHmac('sha256', sessionSecret).update(payload).digest('base64url');
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    try {
      const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
        sub: string;
        role: UserRole;
        exp: number;
      };
      if (!decoded.sub || Date.now() > decoded.exp) return null;
      return decoded;
    } catch {
      return null;
    }
  }

  function extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7).trim();
    }
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      const pairs = cookieHeader.split(';');
      for (const pair of pairs) {
        const [rawName, ...rest] = pair.trim().split('=');
        if (rawName === 'meddesk_session') {
          return decodeURIComponent(rest.join('='));
        }
      }
    }
    return null;
  }

  function resolveSessionUser(req: Request, dbState: StoredDatabase): StoredUser | null {
    const token = extractToken(req);
    if (!token) return null;
    const claims = verifyToken(token);
    if (!claims) return null;
    const user = dbState.users.find((u) => u.id === claims.sub);
    if (!user || user.status === 'Inactive') return null;
    return user;
  }

  function setSessionCookie(res: Response, token: string): void {
    const secure = process.env.NODE_ENV === 'production' || Boolean(process.env.APP_URL?.startsWith('https'));
    const parts = [
      `meddesk_session=${encodeURIComponent(token)}`,
      'Path=/',
      'HttpOnly',
      `Max-Age=${24 * 60 * 60}`,
      secure ? 'SameSite=None; Secure; Partitioned' : 'SameSite=Lax',
    ];
    res.setHeader('Set-Cookie', parts.join('; '));
  }

  function clearSessionCookie(res: Response): void {
    res.setHeader('Set-Cookie', 'meddesk_session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax');
  }

  interface AuthedRequest extends Request {
    currentUser?: StoredUser;
  }

  function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
    const dbState = ensureDbLoaded();
    const user = resolveSessionUser(req, dbState);
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Authentication required. Please sign in.' });
      return;
    }
    req.currentUser = user;
    next();
  }

  function isAdminClaimed(dbState: StoredDatabase): boolean {
    if (envAdminPasscode.length >= 6) return true;
    const admins = dbState.users.filter((u) => u.role === 'ADMIN');
    return admins.some((a) => Boolean(a.passwordHash));
  }

  function findDoctorForUser(user: StoredUser, dbState: StoredDatabase): StoredDoctor | undefined {
    return dbState.doctors.find(
      (d) =>
        user.id === `usr_${d.id}` ||
        (user.uniqueDoctorId && d.uniqueDoctorId && user.uniqueDoctorId.toUpperCase() === d.uniqueDoctorId.toUpperCase()) ||
        (user.email && d.email && user.email.toLowerCase() === d.email.toLowerCase())
    );
  }

  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'meddesk-api', timestamp: new Date().toISOString() });
  });

  app.get('/api/auth/bootstrap-status', (_req, res) => {
    const dbState = ensureDbLoaded();
    res.json({ adminClaimed: isAdminClaimed(dbState) });
  });

  app.post('/api/auth/admin-setup', async (req, res) => {
    try {
      const result = await withWriteLock(() => {
        const dbState = ensureDbLoaded();
        if (isAdminClaimed(dbState)) {
          return { status: 409, body: { status: 'error', message: 'Administrator password is already configured.' } };
        }
        const password = typeof req.body?.password === 'string' ? req.body.password : '';
        if (password.length < 6 || password.length > 128) {
          return { status: 400, body: { status: 'error', message: 'Admin password must be between 6 and 128 characters.' } };
        }
        const name = sanitizeText(req.body?.name, 100) || 'Hospital Administrator';
        let admin = dbState.users.find((u) => u.role === 'ADMIN');
        if (!admin) {
          admin = {
            id: 'usr-3',
            name,
            email: 'admin@meddesk.com',
            role: 'ADMIN',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
            phone: '+91 91234 56789',
            gender: 'Male',
            status: 'Active',
          };
          dbState.users.push(admin);
        } else {
          admin.name = name;
        }
        admin.passwordHash = hashPassword(password);
        persistDb(dbState);
        const token = signToken(admin);
        return { status: 201, token, body: { status: 'success', user: sanitizeUser(admin), token } };
      });
      if (result.token) setSessionCookie(res, result.token);
      res.status(result.status).json(result.body);
    } catch (err) {
      res.status(500).json({ status: 'error', message: (err as Error).message });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const result = await withWriteLock(() => {
        const dbState = ensureDbLoaded();
        const name = sanitizeText(req.body?.name, 100);
        const email = sanitizeText(req.body?.email, 160).toLowerCase();
        const password = typeof req.body?.password === 'string' ? req.body.password : '';
        const phone = sanitizeText(req.body?.phone, 24);
        const gender = sanitizeText(req.body?.gender, 20) || 'Other';
        const bloodGroup = sanitizeText(req.body?.bloodGroup, 10) || 'O+';

        if (!name) return { status: 400, body: { status: 'error', message: 'Full name is required.' } };
        if (!isValidEmail(email)) return { status: 400, body: { status: 'error', message: 'Valid email address is required.' } };
        if (password.length < 6 || password.length > 128) {
          return { status: 400, body: { status: 'error', message: 'Password must be between 6 and 128 characters.' } };
        }
        if (dbState.users.some((u) => u.email.toLowerCase() === email)) {
          return { status: 409, body: { status: 'error', message: 'An account with this email already exists.' } };
        }

        const newUser: StoredUser = {
          id: `usr_${crypto.randomUUID().slice(0, 8)}`,
          name,
          email,
          role: 'PATIENT',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          phone: phone || '+91 98765 43210',
          gender,
          bloodGroup,
          status: 'Active',
          passwordHash: hashPassword(password),
          createdAt: new Date().toISOString(),
        };

        dbState.users.unshift(newUser);
        dbState.notifications.unshift({
          id: `notif-${Date.now()}`,
          title: `Welcome to MedDesk, ${newUser.name}!`,
          message: 'Your patient account is active in the healthcare portal.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          type: 'system',
          recipientId: newUser.id,
          recipientRole: 'PATIENT',
          createdAt: new Date().toISOString(),
        });
        persistDb(dbState);

        const token = signToken(newUser);
        return { status: 201, token, body: { status: 'success', user: sanitizeUser(newUser), token } };
      });
      if (result.token) setSessionCookie(res, result.token);
      res.status(result.status).json(result.body);
    } catch (err) {
      res.status(500).json({ status: 'error', message: (err as Error).message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const dbState = ensureDbLoaded();
      const rawIdentifier = sanitizeText(req.body?.identifier || req.body?.email || req.body?.doctorId, 160);
      const password = typeof req.body?.password === 'string' ? req.body.password : '';
      const requestedRole = sanitizeText(req.body?.role, 20).toUpperCase() as UserRole | '';

      if (!rawIdentifier || !password) {
        res.status(400).json({ status: 'error', message: 'Credentials and password are required.' });
        return;
      }

      if (requestedRole === 'ADMIN') {
        const admin = dbState.users.find(
          (u) =>
            u.role === 'ADMIN' &&
            (u.email.toLowerCase() === rawIdentifier.toLowerCase() || rawIdentifier.toLowerCase() === 'admin')
        );
        if (!admin) {
          res.status(401).json({ status: 'error', message: 'Invalid administrator credentials.' });
          return;
        }
        const envMatch =
          envAdminPasscode.length > 0 &&
          password.length === envAdminPasscode.length &&
          crypto.timingSafeEqual(Buffer.from(password), Buffer.from(envAdminPasscode));
        const hashMatch = verifyPassword(password, admin.passwordHash);
        if (!envMatch && !hashMatch) {
          res.status(401).json({ status: 'error', message: 'Invalid administrator password.' });
          return;
        }
        const token = signToken(admin);
        setSessionCookie(res, token);
        res.json({ status: 'success', user: sanitizeUser(admin), token });
        return;
      }

      const lowerId = rawIdentifier.toLowerCase();
      const upperId = rawIdentifier.toUpperCase();
      const user = dbState.users.find(
        (u) =>
          u.email.toLowerCase() === lowerId ||
          (u.uniqueDoctorId && u.uniqueDoctorId.toUpperCase() === upperId)
      );

      if (!user || !verifyPassword(password, user.passwordHash)) {
        res.status(401).json({ status: 'error', message: 'Invalid credentials or password.' });
        return;
      }
      if (requestedRole && user.role !== requestedRole) {
        res.status(403).json({ status: 'error', message: `This account does not have ${requestedRole} portal access.` });
        return;
      }
      if (user.status === 'Inactive') {
        res.status(403).json({ status: 'error', message: 'Account is deactivated. Contact hospital administration.' });
        return;
      }

      const token = signToken(user);
      setSessionCookie(res, token);
      res.json({ status: 'success', user: sanitizeUser(user), token });
    } catch (err) {
      res.status(500).json({ status: 'error', message: (err as Error).message });
    }
  });

  app.get('/api/auth/session', (req, res) => {
    const dbState = ensureDbLoaded();
    const user = resolveSessionUser(req, dbState);
    if (!user) {
      res.json({ authenticated: false, adminClaimed: isAdminClaimed(dbState) });
      return;
    }
    res.json({ authenticated: true, user: sanitizeUser(user), adminClaimed: isAdminClaimed(dbState) });
  });

  app.post('/api/auth/logout', (_req, res) => {
    clearSessionCookie(res);
    res.json({ status: 'success', message: 'Logged out.' });
  });
  app.get('/api/auth/logout', (_req, res) => {
    clearSessionCookie(res);
    res.json({ status: 'success', message: 'Logged out.' });
  });

  // Public + Session-Scoped Bootstrap State
  app.get('/api/bootstrap', (req, res) => {
    const dbState = ensureDbLoaded();
    const currentUser = resolveSessionUser(req, dbState);
    const bookedSlots = dbState.appointments
      .filter((a) => a.status !== 'Cancelled')
      .map((a) => ({ doctorId: a.doctorId, date: a.date, time: a.time }));

    if (!currentUser) {
      res.json({
        authenticated: false,
        adminClaimed: isAdminClaimed(dbState),
        doctors: dbState.doctors,
        doctorSlots: dbState.doctorSlots,
        doctorSchedules: dbState.doctorSchedules,
        bookedSlots,
      });
      return;
    }

    const isAdmin = currentUser.role === 'ADMIN';
    const isDoctor = currentUser.role === 'DOCTOR';
    const currentDoc = isDoctor ? findDoctorForUser(currentUser, dbState) : undefined;

    const users = isAdmin
      ? dbState.users.map(sanitizeUser)
      : isDoctor
      ? dbState.users.filter((u) => u.role === 'PATIENT' || u.id === currentUser.id).map(sanitizeUser)
      : [sanitizeUser(currentUser)];

    const appointments = isAdmin
      ? dbState.appointments
      : isDoctor
      ? dbState.appointments.filter((a) => a.doctorId === currentDoc?.id || a.doctorId === currentUser.id)
      : dbState.appointments.filter((a) => a.patientId === currentUser.id);

    const records = isAdmin || isDoctor
      ? dbState.records
      : dbState.records.filter((r) => r.patientId === currentUser.id);

    const consultations = (
      isAdmin
        ? dbState.consultations
        : isDoctor
        ? dbState.consultations.filter((c) => c.doctorId === currentDoc?.id || c.doctorId === currentUser.id)
        : dbState.consultations.filter((c) => c.patientId === currentUser.id)
    ).map((c) => {
      const win = computeFollowUpWindow(typeof c.appointmentDate === 'string' ? c.appointmentDate : undefined);
      return {
        ...c,
        id: String(c.id ?? ''),
        daysRemaining: win.daysRemaining,
        isFollowUpActive: win.isFollowUpActive,
        status: win.isFollowUpActive ? 'Ongoing' : 'Expired',
      };
    });

    const consultationIds = new Set(consultations.map((c) => c.id));
    const messages: Record<string, Array<Record<string, unknown>>> = {};
    for (const cid of consultationIds) {
      if (dbState.messages[cid]) {
        messages[cid] = dbState.messages[cid];
      }
    }

    const notifications = dbState.notifications.filter((n) => {
      if (isAdmin) return true;
      if (n.recipientId && n.recipientId === currentUser.id) return true;
      if (n.recipientRole === currentUser.role || n.recipientRole === 'ALL') return true;
      return !n.recipientId && !n.recipientRole;
    });

    res.json({
      authenticated: true,
      adminClaimed: isAdminClaimed(dbState),
      user: sanitizeUser(currentUser),
      doctors: dbState.doctors,
      users,
      appointments,
      billingSlips: isAdmin
        ? dbState.billingSlips
        : dbState.billingSlips.filter((s) => appointments.some((a) => a.id === s.appointmentId)),
      records,
      consultations,
      messages,
      notifications,
      doctorSlots: dbState.doctorSlots,
      doctorSchedules: dbState.doctorSchedules,
      bookedSlots,
    });
  });

  // Public Doctors Catalog
  app.get('/api/doctors', (_req, res) => {
    const dbState = ensureDbLoaded();
    res.json(dbState.doctors);
  });

  app.post('/api/doctors', requireAuth, async (req: AuthedRequest, res) => {
    if (req.currentUser?.role !== 'ADMIN') {
      res.status(403).json({ status: 'error', message: 'Only administrators can register doctors.' });
      return;
    }
    try {
      const result = await withWriteLock(() => {
        const dbState = ensureDbLoaded();
        const name = sanitizeText(req.body?.name, 100);
        const specialty = sanitizeText(req.body?.specialty, 100);
        const department = sanitizeText(req.body?.department, 100);
        const hospital = sanitizeText(req.body?.hospital, 150) || 'MedDesk Hospital';
        const email = sanitizeText(req.body?.email, 160).toLowerCase();
        const phone = sanitizeText(req.body?.phone, 24) || '+91 98765 00000';
        const education = sanitizeText(req.body?.education, 200) || 'MBBS, MD';
        const about = sanitizeText(req.body?.about, 1000) || `${name} is a specialist in ${department}.`;
        const consultationFee = Number(req.body?.consultationFee);
        const experienceYears = Number(req.body?.experienceYears) || 5;

        if (!name || !specialty || !department || !isValidEmail(email)) {
          return { status: 400, body: { status: 'error', message: 'Valid name, email, specialty, and department are required.' } };
        }
        if (Number.isNaN(consultationFee) || consultationFee <= 0 || consultationFee > 100000) {
          return { status: 400, body: { status: 'error', message: 'Consultation fee must be greater than 0.' } };
        }
        if (dbState.users.some((u) => u.email.toLowerCase() === email)) {
          return { status: 409, body: { status: 'error', message: 'An account with this email already exists.' } };
        }

        const existingIds = new Set(
          dbState.doctors.map((d) => d.uniqueDoctorId?.toUpperCase()).filter((x): x is string => Boolean(x))
        );
        let uniqueDoctorId = sanitizeText(req.body?.uniqueDoctorId, 30).toUpperCase();
        if (!uniqueDoctorId || existingIds.has(uniqueDoctorId)) {
          let counter = 1001;
          while (existingIds.has(`DOC-${counter}`)) counter++;
          uniqueDoctorId = `DOC-${counter}`;
        }

        const rawPassword =
          typeof req.body?.password === 'string' && req.body.password.trim().length >= 6
            ? req.body.password.trim()
            : `Doc!${crypto.randomBytes(4).toString('hex')}`;

        const docId = `doc-${crypto.randomUUID().slice(0, 8)}`;
        const newDoctor: StoredDoctor = {
          id: docId,
          name,
          specialty,
          department,
          hospital,
          rating: 5.0,
          reviewsCount: 1,
          consultationFee,
          avatar:
            sanitizeText(req.body?.avatar, 500) ||
            '/src/assets/images/doctor_priya_sharma_1790192843688.jpg',
          experienceYears,
          availableDays: Array.isArray(req.body?.availableDays)
            ? req.body.availableDays
            : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          timeSlots: Array.isArray(req.body?.timeSlots)
            ? req.body.timeSlots
            : ['10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
          about,
          education,
          email,
          phone,
          uniqueDoctorId,
        };

        const newDoctorUser: StoredUser = {
          id: `usr_${docId}`,
          name,
          email,
          role: 'DOCTOR',
          avatar: newDoctor.avatar,
          phone,
          status: 'Active',
          uniqueDoctorId,
          passwordHash: hashPassword(rawPassword),
          specialty,
          department,
          hospital,
          education,
          experienceYears,
          consultationFee,
          about,
          createdAt: new Date().toISOString(),
        };

        dbState.doctors.unshift(newDoctor);
        dbState.users.unshift(newDoctorUser);
        persistDb(dbState);

        return {
          status: 201,
          body: {
            status: 'success',
            doctor: newDoctor,
            user: sanitizeUser(newDoctorUser),
            temporaryPassword: rawPassword,
          },
        };
      });
      res.status(result.status).json(result.body);
    } catch (err) {
      res.status(500).json({ status: 'error', message: (err as Error).message });
    }
  });

  app.put('/api/doctors/:id', requireAuth, async (req: AuthedRequest, res) => {
    try {
      const doctorId = req.params.id;
      const result = await withWriteLock(() => {
        const dbState = ensureDbLoaded();
        const idx = dbState.doctors.findIndex((d) => d.id === doctorId);
        if (idx === -1) {
          return { status: 404, body: { status: 'error', message: 'Doctor not found.' } };
        }
        const existingDoc = dbState.doctors[idx];
        const caller = req.currentUser!;
        const isOwningDoctor =
          caller.role === 'DOCTOR' &&
          (caller.id === `usr_${existingDoc.id}` ||
            (caller.uniqueDoctorId && caller.uniqueDoctorId === existingDoc.uniqueDoctorId));
        if (caller.role !== 'ADMIN' && !isOwningDoctor) {
          return { status: 403, body: { status: 'error', message: 'Forbidden to modify this doctor profile.' } };
        }

        const fee = req.body?.consultationFee !== undefined ? Number(req.body.consultationFee) : existingDoc.consultationFee;
        if (Number.isNaN(fee) || fee <= 0 || fee > 100000) {
          return { status: 400, body: { status: 'error', message: 'Consultation fee must be greater than 0.' } };
        }

        const updatedDoc: StoredDoctor = {
          ...existingDoc,
          name: req.body?.name ? sanitizeText(req.body.name, 100) : existingDoc.name,
          specialty: req.body?.specialty ? sanitizeText(req.body.specialty, 100) : existingDoc.specialty,
          department: req.body?.department ? sanitizeText(req.body.department, 100) : existingDoc.department,
          hospital: req.body?.hospital ? sanitizeText(req.body.hospital, 150) : existingDoc.hospital,
          education: req.body?.education !== undefined ? sanitizeText(req.body.education, 200) : existingDoc.education,
          about: req.body?.about !== undefined ? sanitizeText(req.body.about, 1000) : existingDoc.about,
          phone: req.body?.phone !== undefined ? sanitizeText(req.body.phone, 24) : existingDoc.phone,
          avatar: req.body?.avatar ? sanitizeAvatar(req.body.avatar, existingDoc.avatar) : existingDoc.avatar,
          experienceYears:
            req.body?.experienceYears !== undefined ? Number(req.body.experienceYears) : existingDoc.experienceYears,
          consultationFee: fee,
          availableDays: Array.isArray(req.body?.availableDays) ? req.body.availableDays : existingDoc.availableDays,
          timeSlots: Array.isArray(req.body?.timeSlots) ? req.body.timeSlots : existingDoc.timeSlots,
        };

        dbState.doctors[idx] = updatedDoc;
        dbState.users = dbState.users.map((u) =>
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
        );

        dbState.appointments = dbState.appointments.map((a) =>
          a.doctorId === updatedDoc.id
            ? {
                ...a,
                doctorName: updatedDoc.name,
                doctorAvatar: updatedDoc.avatar,
                department: updatedDoc.department,
                hospital: updatedDoc.hospital,
              }
            : a
        );
        persistDb(dbState);

        return { status: 200, body: { status: 'success', doctor: updatedDoc } };
      });
      res.status(result.status).json(result.body);
    } catch (err) {
      res.status(500).json({ status: 'error', message: (err as Error).message });
    }
  });

  app.post('/api/doctors/:id/reset-password', requireAuth, async (req: AuthedRequest, res) => {
    if (req.currentUser?.role !== 'ADMIN') {
      res.status(403).json({ status: 'error', message: 'Only administrators can reset doctor passwords.' });
      return;
    }
    try {
      const doctorId = req.params.id;
      const result = await withWriteLock(() => {
        const dbState = ensureDbLoaded();
        const doc = dbState.doctors.find((d) => d.id === doctorId || d.uniqueDoctorId === doctorId);
        if (!doc) {
          return { status: 404, body: { status: 'error', message: 'Doctor not found.' } };
        }
        const provided = typeof req.body?.password === 'string' ? req.body.password.trim() : '';
        if (provided && (provided.length < 6 || provided.length > 128)) {
          return { status: 400, body: { status: 'error', message: 'Password must be between 6 and 128 characters.' } };
        }
        const tempPassword = provided || `Doc!${crypto.randomBytes(4).toString('hex')}`;
        const newHash = hashPassword(tempPassword);

        let userUpdated = false;
        dbState.users = dbState.users.map((u) => {
          if (
            u.id === `usr_${doc.id}` ||
            (doc.uniqueDoctorId && u.uniqueDoctorId === doc.uniqueDoctorId) ||
            (doc.email && u.email.toLowerCase() === doc.email.toLowerCase())
          ) {
            userUpdated = true;
            return { ...u, passwordHash: newHash };
          }
          return u;
        });
        if (!userUpdated) {
          dbState.users.unshift({
            id: `usr_${doc.id}`,
            name: doc.name,
            email: doc.email || `${doc.id}@meddesk.com`,
            role: 'DOCTOR',
            avatar: doc.avatar,
            phone: doc.phone,
            status: 'Active',
            uniqueDoctorId: doc.uniqueDoctorId,
            passwordHash: newHash,
          });
        }
        persistDb(dbState);

        return {
          status: 200,
          body: {
            status: 'success',
            doctorId: doc.id,
            uniqueDoctorId: doc.uniqueDoctorId,
            temporaryPassword: tempPassword,
          },
        };
      });
      res.status(result.status).json(result.body);
    } catch (err) {
      res.status(500).json({ status: 'error', message: (err as Error).message });
    }
  });

  app.delete('/api/doctors/:id', requireAuth, async (req: AuthedRequest, res) => {
    if (req.currentUser?.role !== 'ADMIN') {
      res.status(403).json({ status: 'error', message: 'Only administrators can delete doctors.' });
      return;
    }
    try {
      const doctorId = req.params.id;
      const result = await withWriteLock(() => {
        const dbState = ensureDbLoaded();
        const target = dbState.doctors.find((d) => d.id === doctorId || d.uniqueDoctorId === doctorId);
        if (!target) {
          return { status: 404, body: { status: 'error', message: 'Doctor not found.' } };
        }
        dbState.doctors = dbState.doctors.filter((d) => d.id !== target.id);
        dbState.users = dbState.users.filter(
          (u) => u.id !== `usr_${target.id}` && u.uniqueDoctorId !== target.uniqueDoctorId
        );
        persistDb(dbState);
        return { status: 200, body: { status: 'success', doctors: dbState.doctors } };
      });
      res.status(result.status).json(result.body);
    } catch (err) {
      res.status(500).json({ status: 'error', message: (err as Error).message });
    }
  });

  // Users & Patients Directory
  const listUsersHandler = (req: AuthedRequest, res: Response) => {
    const dbState = ensureDbLoaded();
    const caller = req.currentUser!;
    if (caller.role === 'ADMIN') {
      res.json(dbState.users.map(sanitizeUser));
      return;
    }
    if (caller.role === 'DOCTOR') {
      res.json(dbState.users.filter((u) => u.role === 'PATIENT').map(sanitizeUser));
      return;
    }
    res.json([sanitizeUser(caller)]);
  };

  app.get('/api/users', requireAuth, listUsersHandler);
  app.get('/api/patients', requireAuth, listUsersHandler);

  const createUserHandler = async (req: AuthedRequest, res: Response) => {
    if (req.currentUser?.role !== 'ADMIN') {
      res.status(403).json({ status: 'error', message: 'Only administrators can create user accounts.' });
      return;
    }
    try {
      const result = await withWriteLock(() => {
        const dbState = ensureDbLoaded();
        const name = sanitizeText(req.body?.name, 100);
        const email = sanitizeText(req.body?.email, 160).toLowerCase();
        const roleInput = sanitizeText(req.body?.role, 20).toUpperCase();
        const role: UserRole = roleInput === 'DOCTOR' ? 'DOCTOR' : 'PATIENT';
        const password = typeof req.body?.password === 'string' && req.body.password.trim().length >= 6
          ? req.body.password.trim()
          : `User!${crypto.randomBytes(4).toString('hex')}`;

        if (!name || !isValidEmail(email)) {
          return { status: 400, body: { status: 'error', message: 'Valid name and email are required.' } };
        }
        if (dbState.users.some((u) => u.email.toLowerCase() === email)) {
          return { status: 409, body: { status: 'error', message: 'Email address is already registered.' } };
        }

        const newUser: StoredUser = {
          id: `usr_${crypto.randomUUID().slice(0, 8)}`,
          name,
          email,
          role,
          avatar:
            role === 'DOCTOR'
              ? '/src/assets/images/doctor_priya_sharma_1790192843688.jpg'
              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          phone: sanitizeText(req.body?.phone, 24) || '+91 98765 43210',
          gender: sanitizeText(req.body?.gender, 20) || 'Other',
          bloodGroup: sanitizeText(req.body?.bloodGroup, 10) || 'O+',
          allergies: sanitizeText(req.body?.allergies, 255),
          medicalConditions: sanitizeText(req.body?.medicalConditions, 255),
          emergencyContactName: sanitizeText(req.body?.emergencyContactName, 100),
          emergencyContactPhone: sanitizeText(req.body?.emergencyContactPhone, 24),
          status: 'Active',
          passwordHash: hashPassword(password),
          createdAt: new Date().toISOString(),
        };

        dbState.users.unshift(newUser);
        persistDb(dbState);
        return { status: 201, body: { status: 'success', user: sanitizeUser(newUser), temporaryPassword: password } };
      });
      res.status(result.status).json(result.body);
    } catch (err) {
      res.status(500).json({ status: 'error', message: (err as Error).message });
    }
  };

  app.post('/api/users', requireAuth, createUserHandler);
  app.post('/api/patients', requireAuth, createUserHandler);

  app.put('/api/users/:id', requireAuth, async (req: AuthedRequest, res) => {
    try {
      const targetId = req.params.id;
      const caller = req.currentUser!;
      if (caller.role !== 'ADMIN' && caller.id !== targetId) {
        res.status(403).json({ status: 'error', message: 'You may only update your own profile.' });
        return;
      }

      const result = await withWriteLock(() => {
        const dbState = ensureDbLoaded();
        const idx = dbState.users.findIndex((u) => u.id === targetId);
        if (idx === -1) {
          return { status: 404, body: { status: 'error', message: 'User not found.' } };
        }
        const existing = dbState.users[idx];
        const nextStatus =
          caller.role === 'ADMIN' && (req.body?.status === 'Active' || req.body?.status === 'Inactive')
            ? req.body.status
            : existing.status;

        const updated: StoredUser = {
          ...existing,
          name: req.body?.name ? sanitizeText(req.body.name, 100) : existing.name,
          phone: req.body?.phone !== undefined ? sanitizeText(req.body.phone, 24) : existing.phone,
          gender: req.body?.gender !== undefined ? sanitizeText(req.body.gender, 20) : existing.gender,
          bloodGroup: req.body?.bloodGroup !== undefined ? sanitizeText(req.body.bloodGroup, 10) : existing.bloodGroup,
          address: req.body?.address !== undefined ? sanitizeText(req.body.address, 250) : existing.address,
          city: req.body?.city !== undefined ? sanitizeText(req.body.city, 100) : existing.city,
          dateOfBirth: req.body?.dateOfBirth !== undefined ? sanitizeText(req.body.dateOfBirth, 30) : existing.dateOfBirth,
          allergies: req.body?.allergies !== undefined ? sanitizeText(req.body.allergies, 255) : existing.allergies,
          medicalConditions:
            req.body?.medicalConditions !== undefined
              ? sanitizeText(req.body.medicalConditions, 255)
              : existing.medicalConditions,
          emergencyContactName:
            req.body?.emergencyContactName !== undefined
              ? sanitizeText(req.body.emergencyContactName, 100)
              : existing.emergencyContactName,
          emergencyContactPhone:
            req.body?.emergencyContactPhone !== undefined
              ? sanitizeText(req.body.emergencyContactPhone, 24)
              : existing.emergencyContactPhone,
          avatar: req.body?.avatar ? sanitizeAvatar(req.body.avatar, existing.avatar) : existing.avatar,
          status: nextStatus,
        };

        dbState.users[idx] = updated;
        dbState.appointments = dbState.appointments.map((a) =>
          a.patientId === updated.id ? { ...a, patientName: updated.name, patientAvatar: updated.avatar } : a
        );
        dbState.consultations = dbState.consultations.map((c) =>
          c.patientId === updated.id
            ? { ...c, patientName: updated.name, patientAvatar: updated.avatar, patientBloodGroup: updated.bloodGroup }
            : c
        );
        persistDb(dbState);
        return { status: 200, body: { status: 'success', user: sanitizeUser(updated) } };
      });
      res.status(result.status).json(result.body);
    } catch (err) {
      res.status(500).json({ status: 'error', message: (err as Error).message });
    }
  });

  app.put('/api/users/:id/status', requireAuth, async (req: AuthedRequest, res) => {
    if (req.currentUser?.role !== 'ADMIN') {
      res.status(403).json({ status: 'error', message: 'Only administrators can toggle account status.' });
      return;
    }
    try {
      const targetId = req.params.id;
      const result = await withWriteLock(() => {
        const dbState = ensureDbLoaded();
        const idx = dbState.users.findIndex((u) => u.id === targetId);
        if (idx === -1) return { status: 404, body: { status: 'error', message: 'User not found.' } };
        if (targetId === req.currentUser!.id) {
          return { status: 400, body: { status: 'error', message: 'Cannot deactivate your own active admin session.' } };
        }
        const nextStatus: 'Active' | 'Inactive' = dbState.users[idx].status === 'Active' ? 'Inactive' : 'Active';
        dbState.users[idx].status = nextStatus;
        persistDb(dbState);
        return { status: 200, body: { status: 'success', user: sanitizeUser(dbState.users[idx]), users: dbState.users.map(sanitizeUser) } };
      });
      res.status(result.status).json(result.body);
    } catch (err) {
      res.status(500).json({ status: 'error', message: (err as Error).message });
    }
  });

  // Appointments & Atomic Slot Conflict Prevention
  app.get('/api/appointments/booked-slots', (req, res) => {
    const dbState = ensureDbLoaded();
    const doctorId = sanitizeText(req.query.doctorId, 64);
    const date = sanitizeText(req.query.date, 40);
    const normDate = date ? normalizeDateKey(date) : '';

    const slots = dbState.appointments
      .filter((a) => {
        if (a.status === 'Cancelled') return false;
        if (doctorId && a.doctorId !== doctorId) return false;
        if (normDate && normalizeDateKey(a.date) !== normDate) return false;
        return true;
      })
      .map((a) => ({ doctorId: a.doctorId, date: a.date, time: a.time }));

    res.json(slots);
  });

  app.get('/api/appointments', requireAuth, (req: AuthedRequest, res) => {
    const dbState = ensureDbLoaded();
    const caller = req.currentUser!;
    if (caller.role === 'ADMIN') {
      res.json(dbState.appointments);
      return;
    }
    if (caller.role === 'DOCTOR') {
      const doc = findDoctorForUser(caller, dbState);
      res.json(dbState.appointments.filter((a) => a.doctorId === doc?.id || a.doctorId === caller.id));
      return;
    }
    res.json(dbState.appointments.filter((a) => a.patientId === caller.id));
  });

  app.post('/api/appointments', requireAuth, async (req: AuthedRequest, res) => {
    try {
      const caller = req.currentUser!;
      const result = await withWriteLock(() => {
        const dbState = ensureDbLoaded();
        const doctorId = sanitizeText(req.body?.doctorId, 64);
        const date = sanitizeText(req.body?.date, 40);
        const time = sanitizeText(req.body?.time, 30);
        const reason = sanitizeText(req.body?.reason, 255) || 'General Health Consultation';
        const paymentMethod = req.body?.paymentMethod === 'clinic' ? 'clinic' : 'online';
        const consultationType = req.body?.consultationType === 'Video/Online' ? 'Video/Online' : 'In-Clinic';

        if (!doctorId || !date || !time) {
          return { status: 400, body: { status: 'error', message: 'Doctor, date, and time slot are required.' } };
        }

        const doctor = dbState.doctors.find((d) => d.id === doctorId);
        if (!doctor) {
          return { status: 404, body: { status: 'error', message: 'Selected doctor was not found.' } };
        }

        const patientId =
          caller.role === 'ADMIN' && req.body?.patientId ? sanitizeText(req.body.patientId, 64) : caller.id;
        const patientUser = dbState.users.find((u) => u.id === patientId) || caller;

        const targetDateNorm = normalizeDateKey(date);
        const targetTimeNorm = time.toLowerCase();

        const conflict = dbState.appointments.some((a) => {
          if (a.status === 'Cancelled') return false;
          return (
            a.doctorId === doctor.id &&
            normalizeDateKey(a.date) === targetDateNorm &&
            a.time.trim().toLowerCase() === targetTimeNorm
          );
        });

        if (conflict) {
          return {
            status: 409,
            body: {
              status: 'error',
              message: `The time slot '${time}' on ${date} is already booked. Please choose another slot.`,
            },
          };
        }

        const newAppointment: StoredAppointment = {
          id: `apt-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
          patientId: patientUser.id,
          patientName: patientUser.name,
          patientEmail: patientUser.email,
          patientAvatar: patientUser.avatar,
          doctorId: doctor.id,
          doctorName: doctor.name,
          doctorAvatar: doctor.avatar,
          department: doctor.department,
          hospital: doctor.hospital,
          date,
          time,
          reason,
          status: 'Upcoming',
          fee: Number(doctor.consultationFee) || 500,
          consultationType,
          createdAt: new Date().toISOString(),
        };

        const slip = buildBillingSlip(newAppointment, paymentMethod);
        dbState.appointments.unshift(newAppointment);
        dbState.billingSlips.unshift(slip);

        const win = computeFollowUpWindow(date);
        const existingConsIdx = dbState.consultations.findIndex(
          (c) => c.patientId === patientUser.id && c.doctorId === doctor.id
        );
        let consultation: Record<string, unknown>;
        if (existingConsIdx >= 0) {
          consultation = {
            ...dbState.consultations[existingConsIdx],
            appointmentId: newAppointment.id,
            appointmentDate: date,
            appointmentReason: reason,
            daysRemaining: win.daysRemaining,
            isFollowUpActive: win.isFollowUpActive,
            status: win.isFollowUpActive ? 'Ongoing' : 'Expired',
            chiefComplaint: `${reason} (Visit: ${date})`,
          };
          dbState.consultations[existingConsIdx] = consultation;
        } else {
          consultation = {
            id: `c-${Date.now()}`,
            patientId: patientUser.id,
            patientName: patientUser.name,
            patientAvatar: patientUser.avatar,
            patientGender: patientUser.gender || 'Other',
            patientBloodGroup: patientUser.bloodGroup || 'O+',
            doctorId: doctor.id,
            doctorName: doctor.name,
            doctorSpecialty: doctor.specialty,
            doctorAvatar: doctor.avatar,
            hospitalName: doctor.hospital,
            appointmentId: newAppointment.id,
            appointmentDate: date,
            appointmentReason: reason,
            daysRemaining: win.daysRemaining,
            isFollowUpActive: win.isFollowUpActive,
            status: win.isFollowUpActive ? 'Ongoing' : 'Expired',
            chiefComplaint: `${reason} (Visit: ${date})`,
            startTime: `${date}, ${time}`,
            lastMessage: 'Appointment confirmed. Post-visit follow-up chat is active for 10 days.',
            lastMessageTime: 'Just now',
            unreadDoctor: 0,
            unreadPatient: 1,
          };
          dbState.consultations.unshift(consultation);
        }

        const notif = {
          id: `notif-${Date.now()}`,
          title: 'Appointment Confirmed',
          message: `Booked ${doctor.name} on ${date} at ${time}.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          type: 'appointment',
          recipientId: patientUser.id,
          recipientRole: 'PATIENT',
          actionView: 'patient-appointments',
          createdAt: new Date().toISOString(),
        };
        dbState.notifications.unshift(notif);
        persistDb(dbState);

        return {
          status: 201,
          body: { status: 'success', appointment: newAppointment, slip, consultation, notification: notif },
        };
      });
      res.status(result.status).json(result.body);
    } catch (err) {
      res.status(500).json({ status: 'error', message: (err as Error).message });
    }
  });

  app.put('/api/appointments/:id', requireAuth, async (req: AuthedRequest, res) => {
    try {
      const appointmentId = req.params.id;
      const caller = req.currentUser!;
      const result = await withWriteLock(() => {
        const dbState = ensureDbLoaded();
        const idx = dbState.appointments.findIndex((a) => a.id === appointmentId);
        if (idx === -1) {
          return { status: 404, body: { status: 'error', message: 'Appointment not found.' } };
        }
        const existing = dbState.appointments[idx];
        const doc = caller.role === 'DOCTOR' ? findDoctorForUser(caller, dbState) : undefined;
        const ownsAsPatient = existing.patientId === caller.id;
        const ownsAsDoctor = Boolean(doc && existing.doctorId === doc.id) || existing.doctorId === caller.id;
        const isAdmin = caller.role === 'ADMIN';

        if (!isAdmin && !ownsAsPatient && !ownsAsDoctor) {
          return { status: 403, body: { status: 'error', message: 'Forbidden to modify this appointment.' } };
        }

        const validStatuses: AppointmentStatus[] = ['Upcoming', 'Completed', 'Pending', 'Cancelled'];
        const requestedStatus = req.body?.status as AppointmentStatus | undefined;
        if (requestedStatus !== undefined) {
          if (!validStatuses.includes(requestedStatus)) {
            return { status: 400, body: { status: 'error', message: 'Invalid appointment status.' } };
          }
          if (existing.status === 'Cancelled' && requestedStatus !== 'Cancelled') {
            return { status: 400, body: { status: 'error', message: 'Cancelled appointments cannot be reopened.' } };
          }
          if (ownsAsPatient && !isAdmin && !ownsAsDoctor && requestedStatus !== 'Cancelled') {
            return { status: 403, body: { status: 'error', message: 'Patients can only cancel their own appointments.' } };
          }
        }

        const hasClinicalUpdate = req.body?.notes !== undefined || req.body?.prescription !== undefined;
        if (hasClinicalUpdate && !isAdmin && !ownsAsDoctor) {
          return { status: 403, body: { status: 'error', message: 'Only the attending doctor or admin can save clinical notes.' } };
        }

        const updated: StoredAppointment = {
          ...existing,
          status: requestedStatus ?? existing.status,
          notes: req.body?.notes !== undefined ? sanitizeText(req.body.notes, 3000) : existing.notes,
          prescription:
            req.body?.prescription !== undefined ? sanitizeText(req.body.prescription, 3000) : existing.prescription,
        };
        dbState.appointments[idx] = updated;
        persistDb(dbState);
        return { status: 200, body: { status: 'success', appointment: updated } };
      });
      res.status(result.status).json(result.body);
    } catch (err) {
      res.status(500).json({ status: 'error', message: (err as Error).message });
    }
  });

  // Billing Slip Lookup
  app.get('/api/slip/:appointmentId', requireAuth, (req: AuthedRequest, res) => {
    const dbState = ensureDbLoaded();
    const caller = req.currentUser!;
    const appointmentId = req.params.appointmentId;
    const apt = dbState.appointments.find((a) => a.id === appointmentId);
    if (!apt) {
      res.status(404).json({ status: 'error', message: 'Appointment not found.' });
      return;
    }
    const doc = caller.role === 'DOCTOR' ? findDoctorForUser(caller, dbState) : undefined;
    const allowed =
      caller.role === 'ADMIN' ||
      apt.patientId === caller.id ||
      (doc && apt.doctorId === doc.id) ||
      apt.doctorId === caller.id;
    if (!allowed) {
      res.status(403).json({ status: 'error', message: 'Forbidden to access this billing slip.' });
      return;
    }
    const slip = dbState.billingSlips.find((s) => s.appointmentId === appointmentId) || buildBillingSlip(apt);
    res.json({ status: 'success', slip, appointment: apt });
  });

  // Medical Records EHR Vault
  app.get('/api/records', requireAuth, (req: AuthedRequest, res) => {
    const dbState = ensureDbLoaded();
    const caller = req.currentUser!;
    const requestedPatientId = sanitizeText(req.query.patientId, 64);
    const isClinicalOrAdmin = caller.role === 'DOCTOR' || caller.role === 'ADMIN';

    if (requestedPatientId) {
      if (!isClinicalOrAdmin && requestedPatientId !== caller.id) {
        res.status(403).json({ status: 'error', message: 'Access denied to another patient’s records.' });
        return;
      }
      res.json(dbState.records.filter((r) => r.patientId === requestedPatientId));
      return;
    }
    res.json(isClinicalOrAdmin ? dbState.records : dbState.records.filter((r) => r.patientId === caller.id));
  });

  app.post('/api/records', requireAuth, async (req: AuthedRequest, res) => {
    try {
      const caller = req.currentUser!;
      const result = await withWriteLock(() => {
        const dbState = ensureDbLoaded();
        const isClinicalOrAdmin = caller.role === 'DOCTOR' || caller.role === 'ADMIN';
        const patientId =
          isClinicalOrAdmin && req.body?.patientId ? sanitizeText(req.body.patientId, 64) : caller.id;

        const title = sanitizeText(req.body?.title, 150);
        const category = req.body?.category as StoredRecord['category'];
        const date = sanitizeText(req.body?.date, 30) || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        const notes = sanitizeText(req.body?.notes, 2000);
        const validCategories = ['Prescriptions', 'Test Reports', 'Consultations'];

        if (!title || !validCategories.includes(category) || !notes) {
          return { status: 400, body: { status: 'error', message: 'Title, valid category, and clinical notes are required.' } };
        }

        const newRecord: StoredRecord = {
          id: `rec-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
          patientId,
          title,
          date,
          category,
          fileType: sanitizeText(req.body?.fileType, 20) || 'PDF',
          fileSize: sanitizeText(req.body?.fileSize, 20) || '1.4 MB',
          doctorName: sanitizeText(req.body?.doctorName, 100) || caller.name,
          facility: sanitizeText(req.body?.facility, 150) || 'MedDesk Digital Health Vault',
          notes,
          downloadUrl: sanitizeText(req.body?.downloadUrl, 500),
        };

        dbState.records.unshift(newRecord);
        dbState.notifications.unshift({
          id: `notif-${Date.now()}`,
          title: 'Medical Record Added',
          message: `Record "${newRecord.title}" saved to health vault.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          type: 'record',
          recipientId: patientId,
          recipientRole: 'PATIENT',
          actionView: 'patient-records',
          createdAt: new Date().toISOString(),
        });
        persistDb(dbState);
        return { status: 201, body: { status: 'success', record: newRecord } };
      });
      res.status(result.status).json(result.body);
    } catch (err) {
      res.status(500).json({ status: 'error', message: (err as Error).message });
    }
  });

  app.delete('/api/records/:id', requireAuth, async (req: AuthedRequest, res) => {
    try {
      const recordId = req.params.id;
      const caller = req.currentUser!;
      const result = await withWriteLock(() => {
        const dbState = ensureDbLoaded();
        const existing = dbState.records.find((r) => r.id === recordId);
        if (!existing) {
          return { status: 404, body: { status: 'error', message: 'Medical record not found.' } };
        }
        if (caller.role !== 'ADMIN' && caller.role !== 'DOCTOR' && existing.patientId !== caller.id) {
          return { status: 403, body: { status: 'error', message: 'Forbidden to delete this record.' } };
        }
        dbState.records = dbState.records.filter((r) => r.id !== recordId);
        persistDb(dbState);
        return { status: 200, body: { status: 'success' } };
      });
      res.status(result.status).json(result.body);
    } catch (err) {
      res.status(500).json({ status: 'error', message: (err as Error).message });
    }
  });

  // Doctor Time Slots
  app.get('/api/doctor-slots/:key', (req, res) => {
    const dbState = ensureDbLoaded();
    res.json({ slots: dbState.doctorSlots[req.params.key] || DEFAULT_SLOTS });
  });

  app.put('/api/doctor-slots/:key', requireAuth, async (req: AuthedRequest, res) => {
    const caller = req.currentUser!;
    if (caller.role !== 'ADMIN' && caller.role !== 'DOCTOR') {
      res.status(403).json({ status: 'error', message: 'Only doctors or administrators can manage time slots.' });
      return;
    }
    try {
      const key = sanitizeText(req.params.key, 120);
      const slots = Array.isArray(req.body?.slots)
        ? req.body.slots.map((s: unknown) => sanitizeText(s, 30)).filter(Boolean)
        : [];
      await withWriteLock(() => {
        const dbState = ensureDbLoaded();
        dbState.doctorSlots[key] = slots;
        persistDb(dbState);
      });
      res.json({ status: 'success', key, slots });
    } catch (err) {
      res.status(500).json({ status: 'error', message: (err as Error).message });
    }
  });

  app.get('/api/doctor-schedule/:doctorId', (req, res) => {
    const dbState = ensureDbLoaded();
    res.json({ schedule: dbState.doctorSchedules[req.params.doctorId] || null });
  });

  app.put('/api/doctor-schedule/:doctorId', requireAuth, async (req: AuthedRequest, res) => {
    const caller = req.currentUser!;
    if (caller.role !== 'ADMIN' && caller.role !== 'DOCTOR') {
      res.status(403).json({ status: 'error', message: 'Only administrators or doctors can update schedules.' });
      return;
    }
    try {
      const doctorId = sanitizeText(req.params.doctorId, 64);
      const schedule = req.body?.schedule && typeof req.body.schedule === 'object' ? req.body.schedule : {};
      await withWriteLock(() => {
        const dbState = ensureDbLoaded();
        dbState.doctorSchedules[doctorId] = schedule;
        persistDb(dbState);
      });
      res.json({ status: 'success', doctorId, schedule });
    } catch (err) {
      res.status(500).json({ status: 'error', message: (err as Error).message });
    }
  });

  // Consultations & Messages
  app.get('/api/consultations', requireAuth, (req: AuthedRequest, res) => {
    const dbState = ensureDbLoaded();
    const caller = req.currentUser!;
    const doc = caller.role === 'DOCTOR' ? findDoctorForUser(caller, dbState) : undefined;
    const filtered = dbState.consultations.filter((c) => {
      if (caller.role === 'ADMIN') return true;
      if (caller.role === 'DOCTOR') return c.doctorId === doc?.id || c.doctorId === caller.id;
      return c.patientId === caller.id;
    });
    res.json(filtered);
  });

  app.post('/api/consultations', requireAuth, async (req: AuthedRequest, res) => {
    try {
      const caller = req.currentUser!;
      const result = await withWriteLock(() => {
        const dbState = ensureDbLoaded();
        const doctor =
          caller.role === 'DOCTOR'
            ? findDoctorForUser(caller, dbState)
            : dbState.doctors.find((d) => d.id === sanitizeText(req.body?.doctorId, 64));
        const patientId =
          caller.role === 'PATIENT'
            ? caller.id
            : sanitizeText(req.body?.patientId, 64) || caller.id;
        const patient = dbState.users.find((u) => u.id === patientId) || caller;
        const chiefComplaint = sanitizeText(req.body?.chiefComplaint, 255) || 'Clinical Follow-up';
        const initialMessage = sanitizeText(req.body?.initialMessage, 2000);
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr =
          sanitizeText(req.body?.appointmentDate, 40) ||
          new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

        const session = {
          id: `c-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
          patientId: patient.id,
          patientName: sanitizeText(req.body?.patientName, 100) || patient.name,
          patientAvatar: patient.avatar,
          patientGender: patient.gender || 'Other',
          patientBloodGroup: patient.bloodGroup || 'O+',
          doctorId: doctor?.id || caller.id,
          doctorName: doctor?.name || sanitizeText(req.body?.doctorName, 100) || caller.name,
          doctorSpecialty: doctor?.specialty || sanitizeText(req.body?.doctorSpecialty, 100) || 'Specialist Physician',
          doctorAvatar: doctor?.avatar || caller.avatar,
          hospitalName: doctor?.hospital || 'MedDesk Clinic',
          appointmentDate: dateStr,
          appointmentReason: sanitizeText(req.body?.appointmentReason, 255) || chiefComplaint,
          daysRemaining: 10,
          isFollowUpActive: true,
          status: 'Ongoing',
          chiefComplaint,
          startTime: `${dateStr}, ${nowStr}`,
          lastMessage: initialMessage || 'Consultation started',
          lastMessageTime: nowStr,
          unreadDoctor: 0,
          unreadPatient: caller.role === 'DOCTOR' ? 1 : 0,
        };
        dbState.consultations.unshift(session);
        if (initialMessage) {
          dbState.messages[session.id] = [
            {
              id: `msg-${Date.now()}`,
              consultationId: session.id,
              senderId: caller.id,
              senderRole: caller.role === 'DOCTOR' ? 'DOCTOR' : 'PATIENT',
              senderName: caller.name,
              senderAvatar: caller.avatar,
              text: initialMessage,
              timestamp: nowStr,
            },
          ];
        }
        persistDb(dbState);
        return { status: 201, body: { status: 'success', consultation: session } };
      });
      res.status(result.status).json(result.body);
    } catch (err) {
      res.status(500).json({ status: 'error', message: (err as Error).message });
    }
  });

  app.post('/api/consultations/:id/messages', requireAuth, async (req: AuthedRequest, res) => {
    try {
      const consultationId = req.params.id;
      const caller = req.currentUser!;
      const result = await withWriteLock(() => {
        const dbState = ensureDbLoaded();
        const consIdx = dbState.consultations.findIndex((c) => c.id === consultationId);
        if (consIdx === -1) {
          return { status: 404, body: { status: 'error', message: 'Consultation not found.' } };
        }
        const cons = dbState.consultations[consIdx];
        const doc = caller.role === 'DOCTOR' ? findDoctorForUser(caller, dbState) : undefined;
        const allowed =
          caller.role === 'ADMIN' ||
          cons.patientId === caller.id ||
          (doc && cons.doctorId === doc.id) ||
          cons.doctorId === caller.id;
        if (!allowed) {
          return { status: 403, body: { status: 'error', message: 'Not a participant in this consultation.' } };
        }

        const text = sanitizeText(req.body?.text, 2000);
        if (!text) {
          return { status: 400, body: { status: 'error', message: 'Message text cannot be empty.' } };
        }

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newMsg = {
          id: `msg-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
          consultationId,
          senderId: caller.id,
          senderRole: caller.role === 'DOCTOR' ? 'DOCTOR' : 'PATIENT',
          senderName: caller.name,
          senderAvatar: caller.avatar,
          text,
          timestamp: timeStr,
          attachments: Array.isArray(req.body?.attachments) ? req.body.attachments : undefined,
        };

        const currentMsgs = dbState.messages[consultationId] || [];
        dbState.messages[consultationId] = [...currentMsgs, newMsg];
        dbState.consultations[consIdx] = {
          ...cons,
          lastMessage: text,
          lastMessageTime: timeStr,
        };
        persistDb(dbState);
        return { status: 201, body: { status: 'success', message: newMsg } };
      });
      res.status(result.status).json(result.body);
    } catch (err) {
      res.status(500).json({ status: 'error', message: (err as Error).message });
    }
  });

  app.put('/api/consultations/:id', requireAuth, async (req: AuthedRequest, res) => {
    try {
      const consultationId = req.params.id;
      const caller = req.currentUser!;
      const result = await withWriteLock(() => {
        const dbState = ensureDbLoaded();
        const idx = dbState.consultations.findIndex((c) => c.id === consultationId);
        if (idx === -1) return { status: 404, body: { status: 'error', message: 'Consultation not found.' } };
        const cons = dbState.consultations[idx];
        const doc = caller.role === 'DOCTOR' ? findDoctorForUser(caller, dbState) : undefined;
        if (caller.role !== 'ADMIN' && cons.doctorId !== doc?.id && cons.doctorId !== caller.id && cons.patientId !== caller.id) {
          return { status: 403, body: { status: 'error', message: 'Forbidden.' } };
        }
        dbState.consultations[idx] = {
          ...cons,
          status: req.body?.status ? sanitizeText(req.body.status, 30) : cons.status,
          notes: req.body?.notes !== undefined ? sanitizeText(req.body.notes, 2000) : cons.notes,
        };
        persistDb(dbState);
        return { status: 200, body: { status: 'success', consultation: dbState.consultations[idx] } };
      });
      res.status(result.status).json(result.body);
    } catch (err) {
      res.status(500).json({ status: 'error', message: (err as Error).message });
    }
  });

  // Notifications
  app.put('/api/notifications/:id/read', requireAuth, async (req: AuthedRequest, res) => {
    try {
      const notifId = req.params.id;
      await withWriteLock(() => {
        const dbState = ensureDbLoaded();
        dbState.notifications = dbState.notifications.map((n) => (n.id === notifId ? { ...n, read: true } : n));
        persistDb(dbState);
      });
      res.json({ status: 'success' });
    } catch (err) {
      res.status(500).json({ status: 'error', message: (err as Error).message });
    }
  });

  app.put('/api/notifications/read-all', requireAuth, async (req: AuthedRequest, res) => {
    try {
      const caller = req.currentUser!;
      await withWriteLock(() => {
        const dbState = ensureDbLoaded();
        dbState.notifications = dbState.notifications.map((n) => {
          if (caller.role === 'ADMIN' || n.recipientId === caller.id || n.recipientRole === caller.role) {
            return { ...n, read: true };
          }
          return n;
        });
        persistDb(dbState);
      });
      res.json({ status: 'success' });
    } catch (err) {
      res.status(500).json({ status: 'error', message: (err as Error).message });
    }
  });

  return app;
}

async function startServer() {
  const app = createApp();
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.use((_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`MedDesk server listening on http://0.0.0.0:${port}`);
  });
}

const isEntrypoint = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isEntrypoint) {
  startServer().catch((err) => {
    console.error('Failed to start MedDesk server:', err);
    process.exit(1);
  });
}
