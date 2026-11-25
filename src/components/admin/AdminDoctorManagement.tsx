<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import {
  Search,
  Star,
=======
import React, { useState } from 'react';
import {
  Search,
  Star,
  MapPin,
  Stethoscope,
>>>>>>> origin/main
  Plus,
  X,
  KeyRound,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
<<<<<<< HEAD
  CalendarDays,
  Trash2,
  AlertTriangle,
  Edit3,
} from 'lucide-react';
import { Doctor, ViewMode } from '../../types';
import { DoctorScheduleConfig, MedicareApiClient } from '../../services/api';
=======
  UserCheck,
  Building2,
  Clock,
  Calendar,
  CalendarDays,
  Sparkles,
  Phone,
  Mail,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Doctor, ViewMode } from '../../types';
import { MedicareApiClient } from '../../services/api';
>>>>>>> origin/main

interface AdminDoctorManagementProps {
  onNavigate: (view: ViewMode) => void;
}

const DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Orthopedics & Joint Care',
  'Pediatrics & Child Care',
  'Neurology',
  'Ophthalmology',
  'ENT Specialist',
  'Gynecology & Obstetrics',
  'Psychiatry',
];

<<<<<<< HEAD
function createDefaultScheduleConfig(): DoctorScheduleConfig {
  return {
    weekly: {
      Monday: { isWorking: true, startTime: '10:00 AM', endTime: '04:00 PM', breakStart: '01:00 PM', breakEnd: '02:00 PM', slotDurationMinutes: 20 },
      Tuesday: { isWorking: true, startTime: '10:00 AM', endTime: '04:00 PM', breakStart: '01:00 PM', breakEnd: '02:00 PM', slotDurationMinutes: 20 },
      Wednesday: { isWorking: true, startTime: '10:00 AM', endTime: '04:00 PM', breakStart: '01:00 PM', breakEnd: '02:00 PM', slotDurationMinutes: 20 },
      Thursday: { isWorking: true, startTime: '10:00 AM', endTime: '04:00 PM', breakStart: '01:00 PM', breakEnd: '02:00 PM', slotDurationMinutes: 20 },
      Friday: { isWorking: true, startTime: '10:00 AM', endTime: '04:00 PM', breakStart: '01:00 PM', breakEnd: '02:00 PM', slotDurationMinutes: 20 },
      Saturday: { isWorking: true, startTime: '10:00 AM', endTime: '01:00 PM', breakStart: '', breakEnd: '', slotDurationMinutes: 20 },
      Sunday: { isWorking: false, startTime: '10:00 AM', endTime: '04:00 PM', breakStart: '', breakEnd: '', slotDurationMinutes: 20 },
    },
    overrides: {},
    leaves: [],
    holidays: [],
  };
}

function generateSecureInitialPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$';
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

=======
>>>>>>> origin/main
export const AdminDoctorManagement: React.FC<AdminDoctorManagementProps> = ({
  onNavigate,
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>(MedicareApiClient.getDoctors());
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
<<<<<<< HEAD
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
=======
>>>>>>> origin/main

  // Add Doctor Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for new doctor
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Cardiology');
  const [specialty, setSpecialty] = useState('Cardiologist');
  const [hospital, setHospital] = useState('MedDesk Hospital, Noida');
  const [experienceYears, setExperienceYears] = useState('8');
  const [consultationFee, setConsultationFee] = useState('800');
  const [education, setEducation] = useState('MBBS, MD');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 98765 00000');
  const [about, setAbout] = useState('');
  const [uniqueDoctorId, setUniqueDoctorId] = useState('');
<<<<<<< HEAD
  const [initialPassword, setInitialPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);

  // One-time modal with newly issued credentials (shown only immediately after creation or reset)
  const [issuedCredentials, setIssuedCredentials] = useState<{
    title: string;
    name: string;
    uniqueDoctorId: string;
    temporaryPassword: string;
    department: string;
  } | null>(null);

  // Edit Doctor & Reset Password modal
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    specialty: '',
    department: 'General Medicine',
    hospital: '',
    experienceYears: '5',
    consultationFee: '500',
    education: '',
    phone: '',
    about: '',
    resetPasswordInput: '',
  });
=======
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);

  // Success modal with generated credentials
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    uniqueDoctorId: string;
    loginPassword: string;
    email: string;
    department: string;
  } | null>(null);

  // Credentials inspection modal
  const [inspectCredentialsDoctor, setInspectCredentialsDoctor] = useState<Doctor | null>(null);
>>>>>>> origin/main

  // Delete doctor confirmation state
  const [deleteConfirmDoctor, setDeleteConfirmDoctor] = useState<Doctor | null>(null);

<<<<<<< HEAD
=======
  const handleDeleteDoctorConfirm = () => {
    if (!deleteConfirmDoctor) return;
    const updated = MedicareApiClient.deleteDoctor(deleteConfirmDoctor.id);
    setDoctors(updated);
    setDeleteConfirmDoctor(null);
  };

>>>>>>> origin/main
  // Multi-Doctor Holiday Modal State
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [selectedDoctorIdsForHoliday, setSelectedDoctorIdsForHoliday] = useState<string[]>([]);
  const [occasionReason, setOccasionReason] = useState('');
  const [holidayStartDate, setHolidayStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [holidayEndDate, setHolidayEndDate] = useState('');
  const [modalDoctorSearch, setModalDoctorSearch] = useState('');
  const [holidaySuccessMsg, setHolidaySuccessMsg] = useState<string | null>(null);

<<<<<<< HEAD
  useEffect(() => {
    return MedicareApiClient.subscribe(() => {
      setDoctors(MedicareApiClient.getDoctors());
    });
  }, []);

  const handleDeleteDoctorConfirm = async () => {
    if (!deleteConfirmDoctor) return;
    setActionError(null);
    setIsSubmitting(true);
    try {
      const updated = await MedicareApiClient.deleteDoctor(deleteConfirmDoctor.id);
      setDoctors(updated);
      setDeleteConfirmDoctor(null);
    } catch (err) {
      setActionError((err as Error).message || 'Failed to delete doctor.');
    } finally {
      setIsSubmitting(false);
    }
  };

=======
>>>>>>> origin/main
  const handleToggleSelectDoctor = (id: string) => {
    setSelectedDoctorIdsForHoliday((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id]
    );
  };

  const handleSelectAllDoctors = () => {
    setSelectedDoctorIdsForHoliday(doctors.map((d) => d.id));
  };

  const handleDeselectAllDoctors = () => {
    setSelectedDoctorIdsForHoliday([]);
  };

<<<<<<< HEAD
  const handleApplyBulkHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDoctorIdsForHoliday.length === 0 || !occasionReason.trim() || !holidayStartDate) {
      return;
    }

    setActionError(null);
    setIsSubmitting(true);
    const startDate = holidayStartDate;
    const endDate = holidayEndDate || holidayStartDate;

    try {
      await Promise.all(
        selectedDoctorIdsForHoliday.map(async (docId) => {
          const existing = MedicareApiClient.getDoctorSchedule(docId);
          const scheduleConfig: DoctorScheduleConfig = existing
            ? {
                ...existing,
                overrides: { ...(existing.overrides || {}) },
                holidays: [...(existing.holidays || [])],
                leaves: [...(existing.leaves || [])],
              }
            : createDefaultScheduleConfig();

          const newHol = {
            id: `hol-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            startDate,
            reason: occasionReason.trim(),
          };
          scheduleConfig.holidays = [newHol, ...scheduleConfig.holidays];

          const start = new Date(startDate);
          const end = new Date(endDate);
          for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
            const dateStr = dt.toISOString().split('T')[0];
            scheduleConfig.overrides[dateStr] = {
              status: 'Holiday',
              reason: occasionReason.trim(),
            };
          }

          await MedicareApiClient.saveDoctorSchedule(docId, scheduleConfig);
        })
      );

      const count = selectedDoctorIdsForHoliday.length;
      setHolidaySuccessMsg(
        `Holiday "${occasionReason.trim()}" successfully declared for ${count} doctor${
          count > 1 ? 's' : ''
        } on ${holidayStartDate}${
          holidayEndDate && holidayEndDate !== holidayStartDate ? ' to ' + holidayEndDate : ''
        }.`
      );
      setIsHolidayModalOpen(false);
      setOccasionReason('');
      setTimeout(() => setHolidaySuccessMsg(null), 5000);
    } catch (err) {
      setActionError((err as Error).message || 'Failed to apply bulk holiday.');
    } finally {
      setIsSubmitting(false);
    }
=======
  const handleApplyBulkHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDoctorIdsForHoliday.length === 0 || !occasionReason.trim() || !holidayStartDate) return;

    const startDate = holidayStartDate;
    const endDate = holidayEndDate || holidayStartDate;

    selectedDoctorIdsForHoliday.forEach((docId) => {
      const storageKey = `medicare_doctor_schedule_${docId}`;
      let scheduleConfig;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          scheduleConfig = JSON.parse(saved);
        }
      } catch {}

      if (!scheduleConfig) {
        scheduleConfig = {
          weekly: {
            Monday: { isWorking: true, startTime: '10:00 AM', endTime: '04:00 PM', slotDurationMinutes: 20 },
            Tuesday: { isWorking: true, startTime: '10:00 AM', endTime: '04:00 PM', slotDurationMinutes: 20 },
            Wednesday: { isWorking: true, startTime: '10:00 AM', endTime: '04:00 PM', slotDurationMinutes: 20 },
            Thursday: { isWorking: true, startTime: '10:00 AM', endTime: '04:00 PM', slotDurationMinutes: 20 },
            Friday: { isWorking: true, startTime: '10:00 AM', endTime: '04:00 PM', slotDurationMinutes: 20 },
            Saturday: { isWorking: true, startTime: '10:00 AM', endTime: '01:00 PM', slotDurationMinutes: 20 },
            Sunday: { isWorking: false, startTime: '10:00 AM', endTime: '04:00 PM', slotDurationMinutes: 20 },
          },
          overrides: {},
          leaves: [],
          holidays: [],
        };
      }

      const newHol = {
        id: `hol-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        startDate,
        endDate,
        reason: occasionReason.trim(),
      };

      scheduleConfig.holidays = [newHol, ...(scheduleConfig.holidays || [])];
      if (!scheduleConfig.overrides) scheduleConfig.overrides = {};

      const start = new Date(startDate);
      const end = new Date(endDate);
      for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        const dateStr = dt.toISOString().split('T')[0];
        scheduleConfig.overrides[dateStr] = {
          status: 'Holiday',
          reason: occasionReason.trim(),
        };
      }

      localStorage.setItem(storageKey, JSON.stringify(scheduleConfig));
    });

    const count = selectedDoctorIdsForHoliday.length;
    setHolidaySuccessMsg(
      `Holiday "${occasionReason.trim()}" successfully declared for ${count} doctor${count > 1 ? 's' : ''} on ${holidayStartDate}${holidayEndDate && holidayEndDate !== holidayStartDate ? ' to ' + holidayEndDate : ''}.`
    );
    setIsHolidayModalOpen(false);
    setOccasionReason('');

    setTimeout(() => setHolidaySuccessMsg(null), 5000);
>>>>>>> origin/main
  };

  const generateRandomCredentials = () => {
    const existingIds = new Set(
      doctors
        .map((d) => d.uniqueDoctorId?.trim().toUpperCase())
        .filter((id): id is string => Boolean(id))
    );
    let counter = 1001;
    while (existingIds.has(`DOC-${counter}`)) {
      counter++;
    }
<<<<<<< HEAD
    setUniqueDoctorId(`DOC-${counter}`);
    setInitialPassword(generateSecureInitialPassword());
  };

  const handleOpenAddModal = () => {
    setActionError(null);
=======
    const id = `DOC-${counter}`;
    const pass = `Doctor@${counter}`;
    setUniqueDoctorId(id);
    setLoginPassword(pass);
  };

  const handleOpenAddModal = () => {
>>>>>>> origin/main
    generateRandomCredentials();
    setName('');
    setEmail('');
    setAbout('');
    setEducation('MBBS, MD');
    setIsAddModalOpen(true);
  };

  const handleCopy = (text: string, idKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idKey);
    setTimeout(() => setCopiedId(null), 2000);
  };

<<<<<<< HEAD
  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setActionError(null);
    setIsSubmitting(true);
    const finalUniqueId =
      uniqueDoctorId.trim().toUpperCase() || `DOC-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalEmail =
      email.trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@meddesk.com`;

    try {
      const res = await MedicareApiClient.addDoctor({
        name: name.trim().startsWith('Dr.') ? name.trim() : `Dr. ${name.trim()}`,
        specialty: specialty.trim() || department,
        department,
        hospital: hospital.trim() || 'MedDesk Hospital, Noida',
        experienceYears: Number(experienceYears) || 5,
        consultationFee: Number(consultationFee) || 600,
        education: education.trim() || 'MBBS, MD',
        about: about.trim() || `${name} is an experienced medical specialist in ${department}.`,
        email: finalEmail,
        phone: phone.trim() || '+91 98765 00000',
        uniqueDoctorId: finalUniqueId,
        password: initialPassword.trim() || undefined,
      });

      setDoctors(MedicareApiClient.getDoctors());
      setIsAddModalOpen(false);
      setIssuedCredentials({
        title: 'Doctor Account Provisioned!',
        name: res.doctor.name,
        uniqueDoctorId: res.doctor.uniqueDoctorId || finalUniqueId,
        temporaryPassword: res.temporaryPassword,
        department: res.doctor.department,
      });
    } catch (err) {
      setActionError((err as Error).message || 'Failed to provision doctor account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (doc: Doctor) => {
    setActionError(null);
    setEditingDoctor(doc);
    setEditForm({
      name: doc.name,
      specialty: doc.specialty,
      department: doc.department,
      hospital: doc.hospital,
      experienceYears: String(doc.experienceYears),
      consultationFee: String(doc.consultationFee),
      education: doc.education,
      phone: doc.phone || '',
      about: doc.about,
      resetPasswordInput: '',
    });
  };

  const handleSaveDoctorEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;
    setActionError(null);
    setIsSubmitting(true);
    try {
      await MedicareApiClient.updateDoctorProfile(editingDoctor.id, {
        name: editForm.name.trim(),
        specialty: editForm.specialty.trim(),
        department: editForm.department,
        hospital: editForm.hospital.trim(),
        experienceYears: Number(editForm.experienceYears) || editingDoctor.experienceYears,
        consultationFee: Number(editForm.consultationFee) || editingDoctor.consultationFee,
        education: editForm.education.trim(),
        phone: editForm.phone.trim(),
        about: editForm.about.trim(),
      });
      setDoctors(MedicareApiClient.getDoctors());
      setEditingDoctor(null);
    } catch (err) {
      setActionError((err as Error).message || 'Failed to update doctor profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetDoctorPassword = async () => {
    if (!editingDoctor) return;
    setActionError(null);
    setIsSubmitting(true);
    try {
      const res = await MedicareApiClient.resetDoctorPassword(
        editingDoctor.id,
        editForm.resetPasswordInput.trim() || undefined
      );
      const targetDoc = editingDoctor;
      setEditingDoctor(null);
      setIssuedCredentials({
        title: 'Doctor Password Reset',
        name: targetDoc.name,
        uniqueDoctorId:
          res.uniqueDoctorId ||
          targetDoc.uniqueDoctorId ||
          `DOC-${targetDoc.id.replace('doc-', '').toUpperCase()}`,
        temporaryPassword: res.temporaryPassword,
        department: targetDoc.department,
      });
    } catch (err) {
      setActionError((err as Error).message || 'Failed to reset doctor password.');
    } finally {
      setIsSubmitting(false);
    }
=======
  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalUniqueId = uniqueDoctorId.trim().toUpperCase() || `DOC-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalPassword = loginPassword.trim() || `Doctor@${finalUniqueId.replace('DOC-', '')}`;
    const finalEmail = email.trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@meddesk.com`;

    const newDoc = MedicareApiClient.addDoctor({
      name: name.trim().startsWith('Dr.') ? name.trim() : `Dr. ${name.trim()}`,
      specialty: specialty.trim() || department,
      department,
      hospital: hospital.trim() || 'MedDesk Hospital, Noida',
      experienceYears: Number(experienceYears) || 5,
      consultationFee: Number(consultationFee) || 600,
      education: education.trim() || 'MBBS, MD',
      about: about.trim() || `${name} is an experienced medical specialist in ${department}.`,
      email: finalEmail,
      phone: phone.trim() || '+91 98765 00000',
      uniqueDoctorId: finalUniqueId,
      loginPassword: finalPassword,
    });

    setDoctors(MedicareApiClient.getDoctors());
    setIsAddModalOpen(false);

    // Show credential distribution dialog
    setCreatedCredentials({
      name: newDoc.name,
      uniqueDoctorId: finalUniqueId,
      loginPassword: finalPassword,
      email: finalEmail,
      department: newDoc.department,
    });
>>>>>>> origin/main
  };

  const filtered = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase()) ||
      d.department.toLowerCase().includes(search.toLowerCase()) ||
      (d.uniqueDoctorId && d.uniqueDoctorId.toLowerCase().includes(search.toLowerCase())) ||
      d.hospital.toLowerCase().includes(search.toLowerCase())
  );

<<<<<<< HEAD
  const portalLoginUrl = typeof window !== 'undefined' ? window.location.origin : '';

=======
>>>>>>> origin/main
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header Row with Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Doctor Directory & Governance</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-rose-600" />
              Admin Provisioned Only
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
<<<<<<< HEAD
            Doctors cannot self-register to ensure clinical safety. Admin issues unique Doctor IDs and resets credentials.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
=======
            Doctors cannot self-register to ensure clinical safety. Admin issues unique Doctor IDs & passwords.
          </p>
        </div>

        <div className="flex items-center gap-3">
>>>>>>> origin/main
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, department..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-rose-400 text-slate-800"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              if (selectedDoctorIdsForHoliday.length === 0) {
                setSelectedDoctorIdsForHoliday(doctors.map((d) => d.id));
              }
              setIsHolidayModalOpen(true);
            }}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Mark Holiday</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Doctor</span>
          </button>
        </div>
      </div>

<<<<<<< HEAD
      {actionError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-rose-500 hover:text-rose-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

=======
>>>>>>> origin/main
      {holidaySuccessMsg && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold rounded-2xl flex items-center gap-2.5 animate-fadeIn shadow-xs">
          <CalendarDays className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{holidaySuccessMsg}</span>
        </div>
      )}

<<<<<<< HEAD
      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((doc) => {
          const docUniqueId =
            doc.uniqueDoctorId || `DOC-${doc.id.replace('doc-', '').toUpperCase()}`;
=======


      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((doc) => {
          const docUniqueId = doc.uniqueDoctorId || `DOC-${doc.id.replace('doc-', '').toUpperCase()}`;
          const docPassword = doc.loginPassword || `Doctor@${docUniqueId.replace('DOC-', '')}`;
>>>>>>> origin/main

          return (
            <div
              key={doc.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
<<<<<<< HEAD
                      <h4
                        onClick={() => setSelectedDoctor(doc)}
                        className="text-sm font-bold text-slate-900 truncate hover:text-rose-600 cursor-pointer"
                      >
                        {doc.name}
                      </h4>
=======
                      <h4 className="text-sm font-bold text-slate-900 truncate">{doc.name}</h4>
                      {/* Doctor ID Badge with Copy */}
>>>>>>> origin/main
                      <button
                        type="button"
                        onClick={() => handleCopy(docUniqueId, `id-${doc.id}`)}
                        className="px-2 py-0.5 text-[10px] font-mono font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                        title="Click to copy unique doctor ID"
                      >
                        {copiedId === `id-${doc.id}` ? (
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-2.5 h-2.5 text-rose-500" />
                        )}
                        <span>{docUniqueId}</span>
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-rose-600 truncate">{doc.specialty}</p>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{doc.rating}</span>
                      <span className="text-slate-400 font-normal">({doc.reviewsCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                  {doc.about}
                </p>

                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-semibold text-slate-800">{doc.department}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Consultation Tariff:</span>
                    <span className="font-bold text-rose-600 tabular-nums">
                      ₹{doc.consultationFee}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Experience:</span>
                    <span className="font-semibold text-slate-800">{doc.experienceYears}+ years</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-400">Login ID:</span>
                    <span className="font-mono font-bold text-slate-900">{docUniqueId}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <button
                  type="button"
<<<<<<< HEAD
                  onClick={() => openEditModal(doc)}
                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3 text-rose-600" />
                  <span>Edit & Reset</span>
=======
                  onClick={() => setInspectCredentialsDoctor(doc)}
                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3 text-rose-600" />
                  <span>Credentials</span>
>>>>>>> origin/main
                </button>

                <button
                  type="button"
                  onClick={() => {
<<<<<<< HEAD
                    MedicareApiClient.setAdminSelectedDoctorId(doc.id);
=======
                    localStorage.setItem('medicare_admin_selected_doctor_id', doc.id);
>>>>>>> origin/main
                    onNavigate('admin-doctor-schedule');
                  }}
                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
<<<<<<< HEAD
                  <span>Schedule</span>
=======
                  <span>Schedule & Availability</span>
>>>>>>> origin/main
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteConfirmDoctor(doc)}
                  className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                  title="Delete Doctor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Remove Doctor Record?</h4>
<<<<<<< HEAD
                <p className="text-xs text-slate-500">
                  This action will remove the doctor from the active directory.
                </p>
=======
                <p className="text-xs text-slate-500">This action will remove the doctor from active directory.</p>
>>>>>>> origin/main
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
<<<<<<< HEAD
              <p>
                <span className="font-semibold text-slate-700">Doctor Name:</span>{' '}
                {deleteConfirmDoctor.name}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Department:</span>{' '}
                {deleteConfirmDoctor.department}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Unique ID:</span>{' '}
                {deleteConfirmDoctor.uniqueDoctorId || deleteConfirmDoctor.id}
              </p>
=======
              <p><span className="font-semibold text-slate-700">Doctor Name:</span> {deleteConfirmDoctor.name}</p>
              <p><span className="font-semibold text-slate-700">Department:</span> {deleteConfirmDoctor.department}</p>
              <p><span className="font-semibold text-slate-700">Unique ID:</span> {deleteConfirmDoctor.uniqueDoctorId || deleteConfirmDoctor.id}</p>
>>>>>>> origin/main
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmDoctor(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
<<<<<<< HEAD
                disabled={isSubmitting}
                onClick={handleDeleteDoctorConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Removing...' : 'Delete Doctor'}</span>
=======
                onClick={handleDeleteDoctorConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Doctor</span>
>>>>>>> origin/main
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Add Doctor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Provision Clinical Doctor Account</h4>
                <p className="text-[11px] text-slate-500">
                  Assign doctor credentials & clinical department
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="p-6 space-y-4">
              {/* Unique Doctor Credentials Box */}
              <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-rose-600" />
                    Admin-Generated Doctor Credentials
                  </span>
                  <button
                    type="button"
                    onClick={generateRandomCredentials}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Unique Doctor ID
                    </label>
                    <input
                      type="text"
                      value={uniqueDoctorId}
                      onChange={(e) => setUniqueDoctorId(e.target.value.toUpperCase())}
                      placeholder="e.g. DOC-1008"
                      required
                      className="w-full px-3 py-1.5 font-mono font-bold text-xs bg-white border border-slate-300 rounded-lg focus:border-rose-500 outline-none text-rose-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
<<<<<<< HEAD
                      Initial Login Password
=======
                      Doctor Login Password
>>>>>>> origin/main
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
<<<<<<< HEAD
                        value={initialPassword}
                        onChange={(e) => setInitialPassword(e.target.value)}
                        placeholder="Auto-generated if blank"
                        minLength={6}
=======
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="e.g. Doctor@1008"
                        required
>>>>>>> origin/main
                        className="w-full pl-3 pr-8 py-1.5 font-mono text-xs bg-white border border-slate-300 rounded-lg focus:border-rose-500 outline-none text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
<<<<<<< HEAD
                  Credentials are stored securely via server-side hashing and displayed once upon creation.
=======
                  Doctor will use this <strong>Unique Doctor ID</strong> and <strong>Password</strong> to access the clinical portal.
>>>>>>> origin/main
                </p>
              </div>

              {/* Full Name & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Doctor Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Kavita Reddy"
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      setSpecialty(e.target.value.split('&')[0].trim());
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-none"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Specialty & Hospital */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specialty Designation
                  </label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g. Senior Cardiologist"
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Affiliated Hospital
                  </label>
                  <input
                    type="text"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    placeholder="MedDesk Hospital, Noida"
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-none"
                  />
                </div>
              </div>

              {/* Experience, Tariff & Education */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Experience (Yrs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Consultation Fee (₹)
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Education
                  </label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="MBBS, MD"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-none"
                  />
                </div>
              </div>

              {/* Doctor Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Doctor Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@meddesk.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-none"
                  />
                </div>
              </div>

              {/* About */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Bio / About
                </label>
                <textarea
                  rows={2}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Specialization background and focus areas..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
<<<<<<< HEAD
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Provisioning...' : 'Provision Doctor Account'}</span>
=======
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Provision Doctor Account</span>
>>>>>>> origin/main
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

<<<<<<< HEAD
      {/* 2. One-Time Modal: Newly Issued / Reset Doctor Credentials */}
      {issuedCredentials && (
=======
      {/* 2. Success Modal: Created Doctor Credentials Card to hand off to doctor */}
      {createdCredentials && (
>>>>>>> origin/main
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6" />
              </div>
<<<<<<< HEAD
              <h4 className="text-base font-bold text-slate-900">{issuedCredentials.title}</h4>
              <p className="text-xs text-slate-500 mt-1">
                Provide these login credentials to <strong>{issuedCredentials.name}</strong>. For security, this password will not be shown again.
              </p>

=======
              <h4 className="text-base font-bold text-slate-900">Doctor Account Provisioned!</h4>
              <p className="text-xs text-slate-500 mt-1">
                Provide these unique login credentials to <strong>{createdCredentials.name}</strong>.
              </p>

              {/* Credentials Card */}
>>>>>>> origin/main
              <div className="my-5 p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Unique Doctor ID:</span>
                  <span className="font-mono text-sm font-bold text-rose-600">
<<<<<<< HEAD
                    {issuedCredentials.uniqueDoctorId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Temporary Password:</span>
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {issuedCredentials.temporaryPassword}
=======
                    {createdCredentials.uniqueDoctorId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Doctor Password:</span>
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {createdCredentials.loginPassword}
>>>>>>> origin/main
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Assigned Department:</span>
                  <span className="text-xs font-semibold text-slate-700">
<<<<<<< HEAD
                    {issuedCredentials.department}
=======
                    {createdCredentials.department}
>>>>>>> origin/main
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
<<<<<<< HEAD
                      `MedDesk Doctor Portal Credentials:\nDoctor: ${issuedCredentials.name}\nDoctor ID: ${issuedCredentials.uniqueDoctorId}\nTemporary Password: ${issuedCredentials.temporaryPassword}\nLogin at: ${portalLoginUrl}`,
                      'issued-card'
=======
                      `MedDesk Doctor Portal Credentials:\nDoctor: ${createdCredentials.name}\nDoctor ID: ${createdCredentials.uniqueDoctorId}\nPassword: ${createdCredentials.loginPassword}\nLogin at: https://ais-dev-pc2xeplawv67a6d6h6q26e-421796633930.asia-southeast1.run.app`,
                      'created-card'
>>>>>>> origin/main
                    )
                  }
                  className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
<<<<<<< HEAD
                  {copiedId === 'issued-card' ? (
=======
                  {copiedId === 'created-card' ? (
>>>>>>> origin/main
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Credentials</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
<<<<<<< HEAD
                  onClick={() => setIssuedCredentials(null)}
=======
                  onClick={() => setCreatedCredentials(null)}
>>>>>>> origin/main
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

<<<<<<< HEAD
      {/* 3. Edit Doctor & Reset Password Modal */}
      {editingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Edit Doctor & Credentials</h4>
                <p className="text-[11px] text-slate-500">
                  Update directory details or issue a fresh temporary password
                </p>
              </div>
              <button
                onClick={() => setEditingDoctor(null)}
=======
      {/* 3. Inspect Doctor Credentials Modal */}
      {inspectCredentialsDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-rose-600" />
                <h4 className="text-xs font-bold text-slate-900">Doctor Access Credentials</h4>
              </div>
              <button
                onClick={() => setInspectCredentialsDoctor(null)}
>>>>>>> origin/main
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

<<<<<<< HEAD
            <form onSubmit={handleSaveDoctorEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Specialty</label>
                  <input
                    type="text"
                    required
                    value={editForm.specialty}
                    onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hospital</label>
                  <input
                    type="text"
                    required
                    value={editForm.hospital}
                    onChange={(e) => setEditForm({ ...editForm, hospital: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Exp (Yrs)</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.experienceYears}
                    onChange={(e) => setEditForm({ ...editForm, experienceYears: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fee (₹)</label>
                  <input
                    type="number"
                    step="50"
                    value={editForm.consultationFee}
                    onChange={(e) => setEditForm({ ...editForm, consultationFee: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Bio</label>
                <textarea
                  rows={2}
                  value={editForm.about}
                  onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                />
              </div>

              {/* Password Reset Box */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-rose-600" />
                    Reset Doctor Password
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {editingDoctor.uniqueDoctorId || editingDoctor.id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    minLength={6}
                    value={editForm.resetPasswordInput}
                    onChange={(e) => setEditForm({ ...editForm, resetPasswordInput: e.target.value })}
                    placeholder="Optional custom password (auto-generated if blank)"
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-rose-400"
                  />
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleResetDoctorPassword}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold rounded-lg cursor-pointer shrink-0"
                  >
                    Reset Password
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDoctor(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold rounded-xl cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
=======
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={inspectCredentialsDoctor.avatar}
                  alt={inspectCredentialsDoctor.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h5 className="font-bold text-xs text-slate-900">{inspectCredentialsDoctor.name}</h5>
                  <p className="text-[11px] text-rose-600 font-semibold">
                    {inspectCredentialsDoctor.specialty}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Unique Doctor ID:</span>
                  <span className="font-mono font-bold text-rose-700">
                    {inspectCredentialsDoctor.uniqueDoctorId || `DOC-${inspectCredentialsDoctor.id.replace('doc-', '').toUpperCase()}`}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Login Password:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {inspectCredentialsDoctor.loginPassword || `Doctor@${(inspectCredentialsDoctor.uniqueDoctorId || inspectCredentialsDoctor.id).replace(/[^0-9]/g, '') || '123'}`}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Registered Email:</span>
                  <span className="text-slate-700 font-medium truncate max-w-[170px]">
                    {inspectCredentialsDoctor.email || 'doctor@meddesk.com'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const id = inspectCredentialsDoctor.uniqueDoctorId || `DOC-${inspectCredentialsDoctor.id.replace('doc-', '').toUpperCase()}`;
                  const pass = inspectCredentialsDoctor.loginPassword || `Doctor@${id.replace('DOC-', '')}`;
                  handleCopy(
                    `Doctor ID: ${id}\nPassword: ${pass}\nDoctor: ${inspectCredentialsDoctor.name}`,
                    'inspect-copy'
                  );
                }}
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedId === 'inspect-copy' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Credentials Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Login Credentials</span>
                  </>
                )}
              </button>
            </div>
>>>>>>> origin/main
          </div>
        </div>
      )}

<<<<<<< HEAD
      {/* 4. Doctor Clinical Profile Modal */}
=======
      {/* 4. Schedule Modal */}
>>>>>>> origin/main
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Doctor Clinical Profile</h4>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedDoctor.avatar}
                  alt={selectedDoctor.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-base text-slate-900">{selectedDoctor.name}</h5>
                    <span className="font-mono text-xs font-bold text-rose-600 px-2 py-0.5 bg-rose-50 rounded border border-rose-200">
                      {selectedDoctor.uniqueDoctorId}
                    </span>
                  </div>
                  <p className="text-xs text-rose-600 font-semibold">{selectedDoctor.specialty}</p>
                  <p className="text-xs text-slate-500">{selectedDoctor.education}</p>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-900 block mb-1.5">
                  Available Consultation Slots
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDoctor.timeSlots.map((slot) => (
                    <span
                      key={slot}
                      className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-mono font-medium text-slate-700"
                    >
                      {slot}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <span className="font-bold text-slate-800 block">Affiliated Hospital</span>
                <span className="text-slate-600">{selectedDoctor.hospital}</span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Declare Bulk Holiday Modal */}
      {isHolidayModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Declare Holiday / Occasion
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select multiple doctors to mark a holiday on a particular occasion
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHolidayModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyBulkHoliday} className="space-y-4">
<<<<<<< HEAD
=======
              {/* Occasion / Reason */}
>>>>>>> origin/main
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Occasion / Holiday Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={occasionReason}
                  onChange={(e) => setOccasionReason(e.target.value)}
                  placeholder="e.g. Diwali Festival, Annual Hospital Day, Medical Conference"
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 outline-none text-slate-900 font-medium"
                />
              </div>

<<<<<<< HEAD
=======
              {/* Date Selection */}
>>>>>>> origin/main
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={holidayStartDate}
                    onChange={(e) => setHolidayStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 outline-none text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date <span className="text-slate-400 font-normal">(Optional for single day)</span>
                  </label>
                  <input
                    type="date"
                    value={holidayEndDate}
                    min={holidayStartDate}
                    onChange={(e) => setHolidayEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 outline-none text-slate-800"
                  />
                </div>
              </div>

<<<<<<< HEAD
=======
              {/* Select Doctors Section */}
>>>>>>> origin/main
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Select Doctors</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                      {selectedDoctorIdsForHoliday.length} of {doctors.length} Selected
                    </span>
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={handleSelectAllDoctors}
                      className="text-amber-700 hover:underline font-semibold cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleDeselectAllDoctors}
                      className="text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

<<<<<<< HEAD
=======
                {/* Filter search inside modal */}
>>>>>>> origin/main
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={modalDoctorSearch}
                    onChange={(e) => setModalDoctorSearch(e.target.value)}
                    placeholder="Search doctor by name or department..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-none"
                  />
                </div>

<<<<<<< HEAD
=======
                {/* Scrollable list of doctors with checkboxes */}
>>>>>>> origin/main
                <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1.5 bg-slate-50/50">
                  {doctors
                    .filter(
                      (d) =>
                        d.name.toLowerCase().includes(modalDoctorSearch.toLowerCase()) ||
                        d.department.toLowerCase().includes(modalDoctorSearch.toLowerCase()) ||
                        (d.uniqueDoctorId &&
                          d.uniqueDoctorId.toLowerCase().includes(modalDoctorSearch.toLowerCase()))
                    )
                    .map((d) => {
                      const isSelected = selectedDoctorIdsForHoliday.includes(d.id);
<<<<<<< HEAD
                      const dUniqueId =
                        d.uniqueDoctorId || `DOC-${d.id.replace('doc-', '').toUpperCase()}`;
=======
                      const dUniqueId = d.uniqueDoctorId || `DOC-${d.id.replace('doc-', '').toUpperCase()}`;
>>>>>>> origin/main

                      return (
                        <label
                          key={d.id}
<<<<<<< HEAD
=======
                          onClick={() => handleToggleSelectDoctor(d.id)}
>>>>>>> origin/main
                          className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-50/90 border-amber-300 shadow-2xs'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
<<<<<<< HEAD
                              onChange={() => handleToggleSelectDoctor(d.id)}
=======
                              onChange={() => {}}
>>>>>>> origin/main
                              className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 accent-amber-600"
                            />
                            <img
                              src={d.avatar}
                              alt={d.name}
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{d.name}</p>
                              <p className="text-[10px] text-slate-500 truncate">{d.department}</p>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-600 bg-slate-100 rounded">
                            {dUniqueId}
                          </span>
                        </label>
                      );
                    })}
                </div>
              </div>

<<<<<<< HEAD
=======
              {/* Submit Buttons */}
>>>>>>> origin/main
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsHolidayModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
<<<<<<< HEAD
                  disabled={
                    isSubmitting ||
                    selectedDoctorIdsForHoliday.length === 0 ||
                    !occasionReason.trim()
                  }
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Saving...'
                      : `Mark Holiday (${selectedDoctorIdsForHoliday.length})`}
                  </span>
=======
                  disabled={selectedDoctorIdsForHoliday.length === 0 || !occasionReason.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>Mark Holiday ({selectedDoctorIdsForHoliday.length})</span>
>>>>>>> origin/main
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
