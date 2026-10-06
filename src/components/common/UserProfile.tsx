import React, { useState, useEffect, useRef } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Heart,
  Shield,
  Check,
  Save,
  Bell,
  Lock,
  LogOut,
  ChevronRight,
  Calendar,
  FileText,
  MessageSquare,
  Sparkles,
  Camera,
  Upload,
  Image as ImageIcon,
  Stethoscope,
  Building,
  GraduationCap,
  Clock,
  IndianRupee,
  MapPin,
  AlertCircle,
  RefreshCw,
  X,
  Edit3,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { User, ViewMode, Doctor } from '../../types';
import { MedicareApiClient } from '../../services/api';

interface UserProfileProps {
  currentUser: User;
  onNavigate: (view: ViewMode) => void;
}

const PRESET_PATIENT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&auto=format&fit=crop&q=80',
];

const PRESET_DOCTOR_AVATARS = [
  '/src/assets/images/doctor_priya_sharma_1790192843688.jpg',
  '/src/assets/images/dr_sarah_johnson_1790494049182.jpg',
  '/src/assets/images/dr_marcus_vance_1790494056230.jpg',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594824813583-97992984091d?w=250&auto=format&fit=crop&q=80',
];

export const UserProfile: React.FC<UserProfileProps> = ({
  currentUser,
  onNavigate,
}) => {
  const isDoctor = currentUser.role === 'DOCTOR';
  
  // Find doctor record if user is a doctor
  const getDocRecord = () => {
    return isDoctor
      ? MedicareApiClient.getDoctors().find(
          (d) =>
            d.id === currentUser.id ||
            (d.email && d.email.toLowerCase() === currentUser.email.toLowerCase()) ||
            d.name.toLowerCase().includes(currentUser.name.toLowerCase())
        )
      : undefined;
  };

  const [doctorRecord, setDoctorRecord] = useState<Doctor | undefined>(getDocRecord());
  const [activeTab, setActiveTab] = useState<'profile' | 'doctor-info' | 'notifications'>('profile');
  
  // Common Profile State
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '+91 98765 43210');
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [bloodGroup, setBloodGroup] = useState(currentUser.bloodGroup || 'O+');
  const [gender, setGender] = useState(currentUser.gender || 'Male');
  const [age, setAge] = useState<number>(currentUser.age || 28);
  const [city, setCity] = useState(currentUser.city || 'Bangalore, India');
  const [address, setAddress] = useState(currentUser.address || '74, Richmond Road, Ashok Nagar');
  const [emergencyContactName, setEmergencyContactName] = useState(currentUser.emergencyContactName || 'Rajesh Vishwas (Father)');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(currentUser.emergencyContactPhone || '+91 98111 22334');
  const [allergies, setAllergies] = useState(currentUser.allergies || 'Penicillin, Dust Mites');
  const [medicalConditions, setMedicalConditions] = useState(currentUser.medicalConditions || 'Mild Seasonal Asthma, Normal Blood Pressure');

  // Doctor Specific State
  const [specialty, setSpecialty] = useState(doctorRecord?.specialty || currentUser.specialty || 'Cardiologist');
  const [department, setDepartment] = useState(doctorRecord?.department || currentUser.department || 'Cardiology');
  const [hospital, setHospital] = useState(doctorRecord?.hospital || currentUser.hospital || 'City Care Hospital, Main Campus');
  const [education, setEducation] = useState(doctorRecord?.education || currentUser.education || 'MBBS, MD (General Medicine), DM (Cardiology), FACC');
  const [experienceYears, setExperienceYears] = useState<number>(doctorRecord?.experienceYears || currentUser.experienceYears || 12);
  const [consultationFee, setConsultationFee] = useState<number>(doctorRecord?.consultationFee || currentUser.consultationFee || 800);
  const [about, setAbout] = useState(doctorRecord?.about || currentUser.about || 'Dr. Priya Sharma is a seasoned cardiologist with over a decade of clinical experience in preventative heart care, ECG analysis, and hypertension management.');
  const [availableDays, setAvailableDays] = useState<string[]>(doctorRecord?.availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  
  // Modals & UI State
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  const editSectionRef = useRef<HTMLDivElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if currentUser changes
  useEffect(() => {
    const doc = getDocRecord();
    setDoctorRecord(doc);
    setName(currentUser.name);
    setAvatar(currentUser.avatar);
    setPhone(currentUser.phone || '+91 98765 43210');
    setBloodGroup(currentUser.bloodGroup || 'O+');
    setGender(currentUser.gender || 'Male');
    setAge(currentUser.age || 28);
    setCity(currentUser.city || 'Bangalore, India');
    setAddress(currentUser.address || '74, Richmond Road, Ashok Nagar');
    setEmergencyContactName(currentUser.emergencyContactName || 'Rajesh Vishwas (Father)');
    setEmergencyContactPhone(currentUser.emergencyContactPhone || '+91 98111 22334');
    setAllergies(currentUser.allergies || 'Penicillin, Dust Mites');
    setMedicalConditions(currentUser.medicalConditions || 'Mild Seasonal Asthma, Normal Blood Pressure');

    if (doc || currentUser.specialty) {
      setSpecialty(doc?.specialty || currentUser.specialty || 'Cardiologist');
      setDepartment(doc?.department || currentUser.department || 'Cardiology');
      setHospital(doc?.hospital || currentUser.hospital || 'City Care Hospital, Main Campus');
      setEducation(doc?.education || currentUser.education || 'MBBS, MD, DM, FACC');
      setExperienceYears(doc?.experienceYears || currentUser.experienceYears || 12);
      setConsultationFee(doc?.consultationFee || currentUser.consultationFee || 800);
      setAbout(doc?.about || currentUser.about || 'Clinical Specialist at MedDesk');
      setAvailableDays(doc?.availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    }
  }, [currentUser]);

  const appointments = MedicareApiClient.getAppointmentsByPatient(currentUser.id);
  const records = MedicareApiClient.getRecords(currentUser.id);
  const consultations = MedicareApiClient.getConsultations(currentUser.id, currentUser.role);

  // File Upload to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const newImg = reader.result;
          setAvatar(newImg);
          setShowPhotoModal(false);
          saveProfilePhoto(newImg);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfilePhoto = (newAvatarUrl: string) => {
    setIsSaving(true);
    if (isDoctor) {
      MedicareApiClient.updateDoctorProfile(doctorRecord?.id || currentUser.id, {
        avatar: newAvatarUrl,
      });
    } else {
      MedicareApiClient.updateUserProfile(currentUser.id, {
        avatar: newAvatarUrl,
      });
    }
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    }, 300);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPhotoUrl.trim()) {
      setAvatar(customPhotoUrl.trim());
      saveProfilePhoto(customPhotoUrl.trim());
      setCustomPhotoUrl('');
      setShowPhotoModal(false);
    }
  };

  // Main Save Function
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      if (isDoctor) {
        const updatedDoc = MedicareApiClient.updateDoctorProfile(doctorRecord?.id || currentUser.id, {
          name: name.trim() || currentUser.name,
          avatar,
          phone: phone.trim(),
          specialty: specialty.trim(),
          department: department.trim(),
          hospital: hospital.trim(),
          education: education.trim(),
          experienceYears: Number(experienceYears) || 10,
          consultationFee: Number(consultationFee) || 500,
          about: about.trim(),
          gender,
          bloodGroup,
          availableDays,
        });
        setDoctorRecord(updatedDoc);
      } else {
        MedicareApiClient.updateUserProfile(currentUser.id, {
          name: name.trim() || currentUser.name,
          phone: phone.trim(),
          avatar,
          bloodGroup,
          gender,
          age: Number(age) || 28,
          city: city.trim(),
          address: address.trim(),
          emergencyContactName: emergencyContactName.trim(),
          emergencyContactPhone: emergencyContactPhone.trim(),
          allergies: allergies.trim(),
          medicalConditions: medicalConditions.trim(),
        });
      }

      setTimeout(() => {
        setIsSaving(false);
        setSavedSuccess(true);
        setShowEditDetailsModal(false);
        setTimeout(() => setSavedSuccess(false), 3500);
      }, 300);
    } catch (err) {
      console.error('Save error:', err);
      setIsSaving(false);
    }
  };

  const handleOpenEditDetails = () => {
    setShowEditDetailsModal(true);
  };

  const handleTabClick = (tabId: 'profile' | 'doctor-info' | 'notifications') => {
    setActiveTab(tabId);
    if (editSectionRef.current) {
      editSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const settingsMenuItems = [
    { id: 'profile', label: isDoctor ? 'Doctor Profile & Photo' : 'Personal Information & Photo', icon: UserIcon, desc: 'Name, photo, contact, health vitals' },
    ...(isDoctor ? [{ id: 'doctor-info', label: 'Clinical Practice & Fees', icon: Stethoscope, desc: 'Specialty, hospital, consultation fee' }] : []),
    { id: 'notifications', label: 'Notifications & Reminders', icon: Bell, desc: 'Appointment alerts, live chat notifications' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto overflow-x-hidden pb-12">
      {/* 1. Profile Top Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 text-white flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            
            {/* Avatar with Camera Change Trigger */}
            <div className="relative group">
              <img
                src={avatar}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-white/40 shadow-lg"
              />
              <button
                type="button"
                onClick={() => setShowPhotoModal(true)}
                className="absolute inset-0 rounded-3xl bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-2xs"
                title="Change profile photo"
              >
                <Camera className="w-6 h-6 text-white" />
                <span className="text-[10px] font-bold mt-1">Change</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPhotoModal(true)}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white text-rose-600 shadow-md border-2 border-rose-500 flex items-center justify-center cursor-pointer hover:bg-rose-50 transition-colors"
                title="Edit Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{name}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-bold">
                  {isDoctor ? 'Verified Doctor / OPD' : 'Verified Patient'}
                </span>
              </div>
              
              <p className="text-rose-100 text-xs sm:text-sm mt-1">
                {currentUser.email} {isDoctor && `· ID: ${currentUser.uniqueDoctorId || 'DOC-1001'}`}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-rose-100/90 flex-wrap">
                <span>{phone}</span>
                <span>•</span>
                {isDoctor ? (
                  <>
                    <span>Specialty: <strong className="text-white">{specialty}</strong></span>
                    <span>•</span>
                    <span>Fee: <strong className="text-white">₹{consultationFee}</strong></span>
                  </>
                ) : (
                  <>
                    <span>Blood: <strong className="text-white">{bloodGroup}</strong></span>
                    <span>•</span>
                    <span>Gender: <strong className="text-white">{gender}</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => setShowPhotoModal(true)}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold backdrop-blur-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Camera className="w-4 h-4" />
              <span>Change Photo</span>
            </button>
            
            <button
              type="button"
              onClick={handleOpenEditDetails}
              className="px-5 py-2.5 bg-white text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5 transform active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 bg-rose-50/50 p-4 border-b border-slate-100 text-center">
          <div
            className="cursor-pointer hover:bg-rose-100/40 p-2 rounded-xl transition-colors"
            onClick={() => onNavigate(isDoctor ? 'doctor-appointments' : 'patient-appointments')}
          >
            <div className="text-lg font-extrabold text-slate-900">{isDoctor ? 8 : appointments.length}</div>
            <div className="text-[11px] font-semibold text-slate-500">Appointments</div>
          </div>
          <div
            className="cursor-pointer hover:bg-rose-100/40 p-2 rounded-xl transition-colors"
            onClick={() => onNavigate(isDoctor ? 'doctor-patients' : 'patient-records')}
          >
            <div className="text-lg font-extrabold text-slate-900">{isDoctor ? 5 : records.length}</div>
            <div className="text-[11px] font-semibold text-slate-500">{isDoctor ? 'Patients' : 'Medical Records'}</div>
          </div>
          <div
            className="cursor-pointer hover:bg-rose-100/40 p-2 rounded-xl transition-colors"
            onClick={() => onNavigate(isDoctor ? 'doctor-consultations' : 'patient-consultation')}
          >
            <div className="text-lg font-extrabold text-slate-900">{consultations.length || 4}</div>
            <div className="text-[11px] font-semibold text-slate-500">Live Consultations</div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-between gap-3 animate-fadeIn shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Profile details & photo saved successfully across MedDesk!</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedSuccess(false)}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Settings Menu & Form Split */}
      <div ref={editSectionRef} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Settings Navigation List */}
        <div className="md:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-3 space-y-1">
          <div className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Account & Profile
          </div>
          {settingsMenuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id as any)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200/80 shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[170px]">{item.desc}</div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-rose-600' : 'text-slate-300'}`} />
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100 mt-2">
            <button
              onClick={() => {
                MedicareApiClient.logout();
                onNavigate('landing');
              }}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <LogOut className="w-4 h-4" />
              </div>
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Tab Detail Content Area */}
        <div className="md:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
          
          {/* TAB 1: Personal Profile & Photo */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {isDoctor ? 'Doctor Identity & Personal Details' : 'Personal Information & Vitals'}
                </h3>
                <span className="text-xs text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-lg">
                  {isDoctor ? 'Doctor Mode' : 'Patient Mode'}
                </span>
              </div>

              {/* Photo Change Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-300 shadow-xs shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Profile Picture</h4>
                    <p className="text-[11px] text-slate-500">
                      Upload from device, choose avatar, or enter image link
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPhotoModal(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Update Photo</span>
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {isDoctor ? 'Doctor Name (with prefix)' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Priya Sharma or Harsh Vishwas"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                    <input
                      type="email"
                      value={currentUser.email}
                      disabled
                      className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 text-slate-900 font-medium"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 text-slate-900 font-medium"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {isDoctor ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Primary Specialty</label>
                        <input
                          type="text"
                          value={specialty}
                          onChange={(e) => setSpecialty(e.target.value)}
                          placeholder="e.g. Senior Cardiologist"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 text-slate-900 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Department</label>
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          placeholder="e.g. Cardiology"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 text-slate-900 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Hospital / Clinic Affiliation</label>
                        <input
                          type="text"
                          value={hospital}
                          onChange={(e) => setHospital(e.target.value)}
                          placeholder="e.g. City Care Hospital, Main Campus"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 text-slate-900 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Consultation Fee (₹)</label>
                        <input
                          type="number"
                          value={consultationFee}
                          onChange={(e) => setConsultationFee(Number(e.target.value))}
                          placeholder="800"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 text-slate-900 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Medical Degrees & Qualifications</label>
                      <input
                        type="text"
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        placeholder="e.g. MBBS, MD (Medicine), DM (Cardiology), FACC"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">About Doctor / Clinical Summary</label>
                      <textarea
                        rows={3}
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        placeholder="Brief summary of your clinical practice..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 text-slate-900 font-medium resize-none"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Patient Age (Years)</label>
                        <input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(Number(e.target.value))}
                          placeholder="28"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">City / Region</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Bangalore, Karnataka"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Residential Address</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House / Flat No, Street, Landmark"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                      />
                    </div>

                    <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-200/80 space-y-2.5">
                      <h4 className="font-bold text-rose-900 flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-rose-600" />
                        <span>Emergency Medical Contact</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Emergency Contact Name"
                          value={emergencyContactName}
                          onChange={(e) => setEmergencyContactName(e.target.value)}
                          className="p-2 bg-white border border-slate-200 rounded-xl"
                        />
                        <input
                          type="text"
                          placeholder="Emergency Contact Phone"
                          value={emergencyContactPhone}
                          onChange={(e) => setEmergencyContactPhone(e.target.value)}
                          className="p-2 bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Known Allergies</label>
                      <input
                        type="text"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        placeholder="e.g. Penicillin, Peanuts, Dust"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Chronic Health Conditions</label>
                      <input
                        type="text"
                        value={medicalConditions}
                        onChange={(e) => setMedicalConditions(e.target.value)}
                        placeholder="e.g. Mild Seasonal Asthma, Normal Blood Pressure"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white rounded-xl font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Doctor Clinical Practice & Fees */}
          {activeTab === 'doctor-info' && isDoctor && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Clinical Practice, OPD & Fees</h3>
                <span className="text-xs text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-lg">
                  Doctor Practice Info
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Years of Clinical Experience</label>
                    <input
                      type="number"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">OPD Consultation Fee (₹)</label>
                    <input
                      type="number"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 font-bold text-rose-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Primary Hospital / Clinic Facility</label>
                  <input
                    type="text"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                  />
                </div>


                <div>
                  <label className="block text-slate-700 font-bold mb-1">Specialist Bio / Clinical Overview</label>
                  <textarea
                    rows={4}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white rounded-xl font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Clinical Details...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Clinical Details</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Notification Preferences</h3>
                <span className="text-xs text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-lg">
                  Alerts & Reminders
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { title: '10-Day Post-Visit Chat Alerts', desc: 'Notify immediately when patient/doctor sends a message or report', def: true },
                  { title: 'Appointment Reminders', desc: 'Receive SMS & WhatsApp reminders 2 hours before scheduled slot', def: true },
                  { title: 'Digital Prescription Alerts', desc: 'Instant push notifications whenever an Rx is issued', def: true },
                  { title: 'Emergency SOS Broadcasts', desc: 'Priority notifications for urgent clinical alerts', def: true },
                ].map((n, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900">{n.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{n.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked={n.def} className="w-4 h-4 accent-rose-600 rounded" />
                  </div>
                ))}
              </div>
            </div>
          )}


        </div>
      </div>

      {/* ========================================================================= */}
      {/* EDIT DETAILS MODAL: Opens instantly when user clicks [Edit Details] button */}
      {/* ========================================================================= */}
      {showEditDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-scrollbar">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-fadeIn my-auto max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-600 to-red-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold">
                    {isDoctor ? 'Edit Doctor Information & Practice' : 'Edit Personal & Medical Information'}
                  </h3>
                  <p className="text-[11px] text-rose-100">
                    Update your identity, contact vitals, and profile info
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditDetailsModal(false)}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <div className="p-5 sm:p-6 overflow-y-auto no-scrollbar space-y-4 text-xs flex-1">
              
              {/* Photo Avatar Row */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-300 shadow-2xs"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Profile Photo</span>
                    <span className="text-[11px] text-slate-400">Click button to upload or choose photo</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(true)}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-rose-400 text-rose-600 font-bold rounded-xl text-xs cursor-pointer shadow-2xs"
                >
                  Change Photo
                </button>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {isDoctor ? 'Doctor Name' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Priya Sharma"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-semibold text-slate-900"
                  />
                </div>
              </div>

              {/* Blood & Gender */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-semibold"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-semibold"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {!isDoctor && (
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Age (Years)</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      placeholder="28"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-semibold"
                    />
                  </div>
                )}
              </div>

              {/* Doctor-Specific Details */}
              {isDoctor && (
                <div className="space-y-3.5 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Primary Specialty</label>
                      <input
                        type="text"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        placeholder="e.g. Senior Cardiologist"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">OPD Consultation Fee (₹)</label>
                      <input
                        type="number"
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(Number(e.target.value))}
                        placeholder="800"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 font-bold text-rose-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Hospital / Clinic</label>
                      <input
                        type="text"
                        value={hospital}
                        onChange={(e) => setHospital(e.target.value)}
                        placeholder="e.g. City Care Hospital"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Experience (Years)</label>
                      <input
                        type="number"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(Number(e.target.value))}
                        placeholder="12"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Degrees & Qualifications</label>
                    <input
                      type="text"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      placeholder="e.g. MBBS, MD, DM, FACC"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Doctor Bio</label>
                    <textarea
                      rows={2}
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      placeholder="Clinical experience & focus..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Patient-Specific Details */}
              {!isDoctor && (
                <div className="space-y-3.5 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">City / Location</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Bangalore, Karnataka"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Residential Address</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House / Street / Landmark"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-rose-50/60 rounded-2xl border border-rose-200/80 space-y-2">
                    <label className="block text-rose-900 font-bold">Emergency Contact</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Emergency Contact Name"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        className="p-2 bg-white border border-slate-200 rounded-xl"
                      />
                      <input
                        type="text"
                        placeholder="Emergency Contact Phone"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        className="p-2 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Known Allergies</label>
                    <input
                      type="text"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="e.g. Penicillin, Peanuts"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditDetailsModal(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white rounded-xl font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save All Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHOTO UPLOAD & SELECTION MODAL                                            */}
      {/* ========================================================================= */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-scrollbar">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-fadeIn my-auto">
            <div className="p-5 bg-gradient-to-r from-rose-600 to-red-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Update Profile Photo</h3>
                  <p className="text-[11px] text-rose-100">Upload or select avatar for {name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Option 1: Direct File Upload from PC/Phone */}
              <div>
                <label className="block text-slate-700 font-bold mb-2">1. Upload from Computer or Phone</label>
                <input
                  type="file"
                  ref={modalFileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => modalFileInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-rose-300 hover:border-rose-500 rounded-2xl flex flex-col items-center justify-center gap-1.5 bg-rose-50/40 hover:bg-rose-50 transition-all cursor-pointer group"
                >
                  <Upload className="w-7 h-7 text-rose-600 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-slate-900">Choose Image File (JPG, PNG, WebP)</span>
                  <span className="text-[10px] text-slate-400">Photos will automatically convert and sync across MedDesk</span>
                </button>
              </div>

              {/* Option 2: Choose from Curated Preset Avatars */}
              <div>
                <label className="block text-slate-700 font-bold mb-2">
                  2. Or Pick a Preset {isDoctor ? 'Doctor' : 'Patient'} Avatar
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {(isDoctor ? PRESET_DOCTOR_AVATARS : PRESET_PATIENT_AVATARS).map((imgUrl, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        setAvatar(imgUrl);
                        saveProfilePhoto(imgUrl);
                        setShowPhotoModal(false);
                      }}
                      className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all cursor-pointer group hover:scale-105 ${
                        avatar === imgUrl ? 'border-rose-600 ring-2 ring-rose-500/20' : 'border-slate-200 hover:border-rose-400'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Avatar ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {avatar === imgUrl && (
                        <div className="absolute inset-0 bg-rose-600/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 3: Custom Web Image URL */}
              <form onSubmit={handleApplyCustomUrl} className="space-y-2">
                <label className="block text-slate-700 font-bold">3. Or Paste Direct Image URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={customPhotoUrl}
                    onChange={(e) => setCustomPhotoUrl(e.target.value)}
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                  />
                  <button
                    type="submit"
                    disabled={!customPhotoUrl.trim()}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 text-white rounded-xl font-bold cursor-pointer transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </form>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
