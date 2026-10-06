import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Stethoscope,
  User as UserIcon,
  ArrowLeft,
  CheckCircle,
  Phone,
  UserCheck,
  KeyRound,
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { LOGIN_HEART_IMAGE } from '../../data/initialData';
import { User, UserRole, ViewMode } from '../../types';
import { MedicareApiClient } from '../../services/api';

interface LoginPageProps {
  initialMode?: 'login' | 'signup';
  onLoginSuccess: (user: User, targetView: ViewMode) => void;
  onNavigate: (view: ViewMode) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialMode = 'login',
  onLoginSuccess,
  onNavigate,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode);

  // Login Mode Selection: Patient vs Doctor ID Login vs Hospital Admin
  const [loginRoleTab, setLoginRoleTab] = useState<'patient' | 'doctor' | 'admin'>('patient');

  // Admin Login State
  const [adminEmailInput, setAdminEmailInput] = useState('admin@meddesk.org');
  const [adminPasswordInput, setAdminPasswordInput] = useState('admin123');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');

  // Patient Login State
  const [email, setEmail] = useState('harshvishwas153@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginActiveOtp, setLoginActiveOtp] = useState('');
  const [loginEnteredOtp, setLoginEnteredOtp] = useState('');
  const [loginResendCountdown, setLoginResendCountdown] = useState(0);
  const [isLoginSendingOtp, setIsLoginSendingOtp] = useState(false);
  const [loginOtpError, setLoginOtpError] = useState('');

  // Doctor ID Login State (Admin-issued credentials)
  const [doctorIdInput, setDoctorIdInput] = useState('');
  const [doctorPasswordInput, setDoctorPasswordInput] = useState('');
  const [showDoctorPassword, setShowDoctorPassword] = useState(false);
  const [doctorLoginError, setDoctorLoginError] = useState('');

  // Sign Up State (Patients only - Doctors are created by Admin)
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupShowPassword, setSignupShowPassword] = useState(false);

  // Email OTP Verification State (Sign Up)
  const [otpSent, setOtpSent] = useState(false);
  const [activeOtp, setActiveOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (initialMode) {
      setAuthMode(initialMode);
    }
  }, [initialMode]);

  // Resend Countdown Timer for Sign Up OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Resend Countdown Timer for Login OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loginResendCountdown > 0) {
      timer = setTimeout(() => setLoginResendCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [loginResendCountdown]);

  const handleRoleQuickLogin = (role: UserRole) => {
    const user = MedicareApiClient.switchUserRole(role);
    if (role === 'ADMIN') {
      onLoginSuccess(user, 'admin-dashboard');
    } else if (role === 'DOCTOR') {
      onLoginSuccess(user, 'doctor-dashboard');
    } else {
      onLoginSuccess(user, 'patient-dashboard');
    }
  };

  const handleSendOtp = () => {
    setError('');
    setOtpError('');
    setOtpSuccessMsg('');

    const emailTrimmed = signupEmail.trim();
    if (!emailTrimmed) {
      setError('Please enter your email address first to receive the OTP');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setError('Please enter a valid email address (e.g. name@domain.com)');
      return;
    }

    setIsSendingOtp(true);
    setTimeout(() => {
      const { otp } = MedicareApiClient.sendEmailOtp(emailTrimmed);
      setActiveOtp(otp);
      setOtpSent(true);
      setIsSendingOtp(false);
      setResendCountdown(30);
      setOtpSuccessMsg(`Verification code sent to ${emailTrimmed}! Use demo code: ${otp}`);
    }, 350);
  };

  const handleVerifyOtp = () => {
    setOtpError('');
    const code = enteredOtp.trim();
    if (!code) {
      setOtpError('Please enter the 6-digit OTP code');
      return;
    }

    const isValid = MedicareApiClient.verifyEmailOtp(signupEmail, code);
    if (isValid || code === activeOtp) {
      setIsEmailVerified(true);
      setOtpError('');
      setOtpSuccessMsg('Email verified successfully! You can now complete registration.');
    } else {
      setOtpError('Invalid OTP code. Please enter the correct code or click Resend.');
    }
  };

  const handleSendLoginOtp = () => {
    setError('');
    setLoginOtpError('');
    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setError('Please enter your email address first');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoginSendingOtp(true);
    setTimeout(() => {
      const { otp } = MedicareApiClient.sendEmailOtp(emailTrimmed);
      setLoginActiveOtp(otp);
      setLoginOtpSent(true);
      setIsLoginSendingOtp(false);
      setLoginResendCountdown(30);
    }, 350);
  };

  const handleVerifyLoginOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoginOtpError('');
    const code = loginEnteredOtp.trim();
    if (!code) {
      setLoginOtpError('Please enter the 6-digit OTP code');
      return;
    }

    const isValid = MedicareApiClient.verifyEmailOtp(email, code);
    if (isValid || code === loginActiveOtp) {
      const users = MedicareApiClient.getUsers();
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        MedicareApiClient.setCurrentUser(found);
        if (found.role === 'ADMIN') onLoginSuccess(found, 'admin-dashboard');
        else if (found.role === 'DOCTOR') onLoginSuccess(found, 'doctor-dashboard');
        else onLoginSuccess(found, 'patient-dashboard');
      } else {
        const defaultUser = users[0];
        MedicareApiClient.setCurrentUser(defaultUser);
        onLoginSuccess(defaultUser, 'patient-dashboard');
      }
    } else {
      setLoginOtpError('Invalid OTP code. Please check the code or click Resend.');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    if (!adminEmailInput.trim()) {
      setAdminLoginError('Please enter administrator email address');
      return;
    }
    if (!adminPasswordInput) {
      setAdminLoginError('Please enter administrator password');
      return;
    }

    const adminUser = MedicareApiClient.switchUserRole('ADMIN');
    onLoginSuccess(adminUser, 'admin-dashboard');
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address or Doctor ID');
      return;
    }

    // Auto-detect if user entered a Doctor ID (e.g. DOC-1001)
    if (cleanEmail.toUpperCase().startsWith('DOC-')) {
      const res = MedicareApiClient.loginDoctorWithUniqueId(cleanEmail, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user, 'doctor-dashboard');
        return;
      } else {
        setError(res.error || 'Invalid Doctor ID or password.');
        return;
      }
    }

    // Match user by email
    const users = MedicareApiClient.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail.toLowerCase());

    if (found) {
      MedicareApiClient.setCurrentUser(found);
      if (found.role === 'ADMIN') {
        onLoginSuccess(found, 'admin-dashboard');
      } else if (found.role === 'DOCTOR') {
        onLoginSuccess(found, 'doctor-dashboard');
      } else {
        onLoginSuccess(found, 'patient-dashboard');
      }
    } else {
      // Check if this matches a provisioned doctor email
      const docMatch = MedicareApiClient.getDoctorByUniqueId(cleanEmail);
      if (docMatch) {
        const res = MedicareApiClient.loginDoctorWithUniqueId(
          docMatch.uniqueDoctorId || docMatch.id,
          password
        );
        if (res.success && res.user) {
          onLoginSuccess(res.user, 'doctor-dashboard');
          return;
        }
      }

      // Default to Harsh Vishwas patient
      const defaultUser = users[0];
      MedicareApiClient.setCurrentUser(defaultUser);
      onLoginSuccess(defaultUser, 'patient-dashboard');
    }
  };

  // Dedicated Doctor ID Login Handler
  const handleDoctorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setDoctorLoginError('');
    setError('');

    const cleanId = doctorIdInput.trim();
    if (!cleanId) {
      setDoctorLoginError('Please enter your Unique Doctor ID (e.g. DOC-1001)');
      return;
    }
    if (!doctorPasswordInput) {
      setDoctorLoginError('Please enter your admin-issued password');
      return;
    }

    const res = MedicareApiClient.loginDoctorWithUniqueId(cleanId, doctorPasswordInput);
    if (res.success && res.user) {
      onLoginSuccess(res.user, 'doctor-dashboard');
    } else {
      setDoctorLoginError(
        res.error || 'Invalid Unique Doctor ID or password. Please verify with Hospital Administration.'
      );
    }
  };

  // Public Sign Up Handler (strictly Patients only)
  const handleFormSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!signupName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!signupEmail.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!isEmailVerified) {
      setError('Please verify your email address with the OTP before creating your account');
      return;
    }
    if (!signupPassword) {
      setError('Please enter a password');
      return;
    }
    if (signupPassword.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const newUser = MedicareApiClient.registerUser({
        name: signupName.trim(),
        email: signupEmail.trim(),
        role: 'PATIENT', // Always PATIENT for public signups to prevent false doctors
        phone: signupPhone.trim() || '+91 98765 43210',
      });
      onLoginSuccess(newUser, 'patient-dashboard');
    } catch {
      setError('Failed to create account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8">
      {/* Top Header Row with in-flow Back button */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-3 px-1">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
        <span className="text-[11px] text-slate-400 font-medium">MedDesk Secure Healthcare Portal</span>
      </div>

      {/* Main Login/Signup Card */}
      <div className="w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Form Column */}
        <div className="lg:col-span-6 p-5 sm:p-7 lg:p-9 flex flex-col justify-between">
          <div>
            {/* Brand & Security Status */}
            <div className="flex items-center justify-between mb-3">
              <BrandLogo size="md" onClick={() => onNavigate('landing')} />
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                HIPAA Secure
              </span>
            </div>

            {/* Segmented Mode Switcher: Log In vs Sign Up */}
            <div className="flex p-1.5 bg-slate-100/90 border border-slate-200/90 rounded-2xl mb-4 text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError('');
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                  authMode === 'login'
                    ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setError('');
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                  authMode === 'signup'
                    ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign Up (Patient)
              </button>
            </div>

            {/* Title & subtitle */}
            <div className="mb-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {authMode === 'login'
                  ? loginRoleTab === 'doctor'
                    ? 'Doctor Clinical Portal'
                    : loginRoleTab === 'admin'
                    ? 'Hospital Administration Portal'
                    : 'Welcome Back'
                  : 'Create Patient Account'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {authMode === 'login'
                  ? loginRoleTab === 'doctor'
                    ? 'Sign in using your Admin-Issued Unique Doctor ID & password'
                    : loginRoleTab === 'admin'
                    ? 'Hospital command center to add verified doctors, manage staff & appointments'
                    : 'Login to access your appointments and health records'
                  : 'Register with verified email to book appointments & manage records'}
              </p>
            </div>

            {error && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                <span>{error}</span>
              </div>
            )}

            {/* 1. LOGIN FORM */}
            {authMode === 'login' && (
              <>
                {/* Segmented Login Type: Patient/User vs Unique Doctor ID vs Hospital Admin */}
                <div className="grid grid-cols-3 p-1.5 bg-slate-100/90 border border-slate-200/90 rounded-2xl mb-4 text-xs font-semibold gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginRoleTab('patient');
                      setError('');
                      setDoctorLoginError('');
                      setAdminLoginError('');
                    }}
                    className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      loginRoleTab === 'patient'
                        ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200/60'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5 text-purple-600" />
                    <span>Patient</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginRoleTab('doctor');
                      setError('');
                      setDoctorLoginError('');
                      setAdminLoginError('');
                    }}
                    className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      loginRoleTab === 'doctor'
                        ? 'bg-white text-teal-900 shadow-xs font-bold border border-teal-200/80 ring-1 ring-teal-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                    <span>Doctor ID</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginRoleTab('admin');
                      setError('');
                      setDoctorLoginError('');
                      setAdminLoginError('');
                    }}
                    className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      loginRoleTab === 'admin'
                        ? 'bg-white text-rose-900 shadow-xs font-bold border border-rose-200/80 ring-1 ring-rose-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-rose-600" />
                    <span>Admin</span>
                  </button>
                </div>

                {/* A. HOSPITAL ADMIN LOGIN VIEW */}
                {loginRoleTab === 'admin' ? (
                  <form onSubmit={handleAdminLogin} className="space-y-3 animate-in fade-in duration-200">
                    {adminLoginError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{adminLoginError}</span>
                      </div>
                    )}

                    {/* Admin Email or ID */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Administrator Email
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={adminEmailInput}
                          onChange={(e) => setAdminEmailInput(e.target.value)}
                          placeholder="admin@meddesk.org"
                          required
                          className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Admin Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Admin Master Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showAdminPassword ? 'text' : 'password'}
                          value={adminPasswordInput}
                          onChange={(e) => setAdminPasswordInput(e.target.value)}
                          placeholder="admin123"
                          required
                          className="w-full pl-10 pr-10 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-slate-800 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                        >
                          {showAdminPassword ? <EyeOff className="w-4 h-4 text-rose-600" /> : <Eye className="w-4 h-4 text-slate-500" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full mt-2 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Sign In to Admin Command Center</span>
                    </button>
                  </form>
                ) : loginRoleTab === 'doctor' ? (
                  <form onSubmit={handleDoctorLogin} className="space-y-3 animate-in fade-in duration-200">
                    {doctorLoginError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{doctorLoginError}</span>
                      </div>
                    )}

                    {/* Unique Doctor ID Input */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Unique Doctor ID (Admin Issued)
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={doctorIdInput}
                          onChange={(e) => {
                            setDoctorIdInput(e.target.value.toUpperCase());
                            setDoctorLoginError('');
                          }}
                          placeholder="e.g. DOC-1001"
                          required
                          className="w-full pl-10 pr-4 py-2 font-mono font-bold text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-slate-900 tracking-wider uppercase"
                        />
                      </div>
                    </div>

                    {/* Doctor Password Input */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Doctor Password (Given by Admin)
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showDoctorPassword ? 'text' : 'password'}
                          value={doctorPasswordInput}
                          onChange={(e) => {
                            setDoctorPasswordInput(e.target.value);
                            setDoctorLoginError('');
                          }}
                          placeholder="Enter doctor password"
                          required
                          className="w-full pl-10 pr-10 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => setShowDoctorPassword(!showDoctorPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        >
                          {showDoctorPassword ? (
                            <EyeOff className="w-4 h-4 text-teal-600" />
                          ) : (
                            <Eye className="w-4 h-4 text-slate-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Doctor Login Button */}
                    <button
                      type="submit"
                      className="w-full mt-2 py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>Sign In as Doctor</span>
                    </button>
                  </form>
                ) : (
                  /* B. PATIENT LOGIN (Password or Email OTP) */
                  <>
                    <div className="flex items-center gap-1.5 mb-3.5 p-1.5 bg-slate-100/90 border border-slate-200/90 rounded-2xl text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMethod('password');
                          setError('');
                          setLoginOtpError('');
                        }}
                        className={`flex-1 py-2 rounded-xl font-semibold transition-all cursor-pointer text-center ${
                          loginMethod === 'password'
                            ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200/60'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Password Login
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMethod('otp');
                          setError('');
                          setLoginOtpError('');
                        }}
                        className={`flex-1 py-2 rounded-xl font-semibold transition-all cursor-pointer text-center ${
                          loginMethod === 'otp'
                            ? 'bg-white text-rose-600 shadow-xs font-bold border border-rose-200/60'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Email OTP Login
                      </button>
                    </div>

                    {loginMethod === 'password' ? (
                      <form onSubmit={handleFormLogin} className="space-y-3">
                        {/* Email Address Input */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Email Address or Doctor ID
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="you@email.com or DOC-1001"
                              required
                              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-slate-800"
                            />
                          </div>
                        </div>

                        {/* Password Input */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-semibold text-slate-700">Password</label>
                            <button
                              type="button"
                              onClick={() => setShowForgotPassword(true)}
                              className="text-xs font-medium text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                            >
                              Forgot Password?
                            </button>
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter your password"
                              required
                              className="w-full pl-10 pr-10 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-slate-800"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setShowPassword((prev) => !prev);
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors focus:outline-none"
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                              title={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4 text-rose-600" />
                              ) : (
                                <Eye className="w-4 h-4 text-slate-500 hover:text-slate-700" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Login Button */}
                        <button
                          type="submit"
                          className="w-full mt-1.5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                        >
                          Log In
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyLoginOtp} className="space-y-3">
                        {/* Email with Send OTP Button */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Email Address
                          </label>
                          <div className="relative flex items-center">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                setLoginOtpSent(false);
                              }}
                              placeholder="Enter your registered email"
                              required
                              className="w-full pl-10 pr-28 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-slate-800"
                            />
                            <button
                              type="button"
                              onClick={handleSendLoginOtp}
                              disabled={isLoginSendingOtp || loginResendCountdown > 0}
                              className={`absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                                loginResendCountdown > 0
                                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed text-[11px]'
                                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                              }`}
                            >
                              {isLoginSendingOtp ? (
                                <span>Sending...</span>
                              ) : loginResendCountdown > 0 ? (
                                <span>{loginResendCountdown}s</span>
                              ) : loginOtpSent ? (
                                <>
                                  <RefreshCw className="w-3 h-3" />
                                  <span>Resend</span>
                                </>
                              ) : (
                                <>
                                  <Send className="w-3 h-3" />
                                  <span>Send OTP</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* OTP input field */}
                        {loginOtpSent ? (
                          <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl space-y-2.5 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <KeyRound className="w-3.5 h-3.5 text-rose-600" />
                                <span>Enter 6-Digit OTP</span>
                              </label>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Sent to {email}
                              </span>
                            </div>

                            <div className="relative">
                              <input
                                type="text"
                                maxLength={6}
                                value={loginEnteredOtp}
                                onChange={(e) => {
                                  setLoginEnteredOtp(e.target.value.replace(/\D/g, ''));
                                  setLoginOtpError('');
                                }}
                                placeholder="Enter 6-digit OTP"
                                required
                                className="w-full px-3 py-2 text-center text-sm font-bold tracking-widest font-mono bg-white border border-slate-300 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none text-slate-900"
                              />
                            </div>

                            {/* Demo OTP Preview */}
                            <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-lg border border-rose-100">
                              <span className="text-slate-600">
                                Demo Code: <strong className="font-mono text-rose-600 tracking-wider">{loginActiveOtp}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setLoginEnteredOtp(loginActiveOtp);
                                  setLoginOtpError('');
                                }}
                                className="text-rose-600 hover:text-rose-700 hover:underline font-bold cursor-pointer text-xs"
                              >
                                Auto-fill
                              </button>
                            </div>

                            {loginOtpError && (
                              <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {loginOtpError}
                              </p>
                            )}

                            <button
                              type="submit"
                              className="w-full mt-1.5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Verify & Log In</span>
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                            Click <strong>Send OTP</strong> above to receive a 6-digit verification code.
                          </p>
                        )}
                      </form>
                    )}
                  </>
                )}

                {/* Switch to Signup text */}
                <p className="text-center text-xs text-slate-500 mt-2.5">
                  Don't have a patient account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setError('');
                    }}
                    className="font-bold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    Register as Patient
                  </button>
                </p>


              </>
            )}

            {/* 2. SIGN UP FORM (PUBLIC SELF-REGISTRATION FOR PATIENTS ONLY) */}
            {authMode === 'signup' && (
              <form onSubmit={handleFormSignup} className="space-y-2.5">

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      required
                      className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-slate-800"
                    />
                  </div>
                </div>

                {/* Email Address with Send OTP & Phone Number */}
                <div className="space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Email Address
                      </label>
                      {isEmailVerified ? (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Email Verified
                        </span>
                      ) : (
                        <span className="text-[10px] text-rose-500 font-medium">
                          OTP verification required
                        </span>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={signupEmail}
                        disabled={isEmailVerified}
                        onChange={(e) => {
                          setSignupEmail(e.target.value);
                          if (isEmailVerified) {
                            setIsEmailVerified(false);
                            setOtpSent(false);
                          }
                        }}
                        placeholder="you@email.com"
                        required
                        className={`w-full pl-10 pr-28 py-2 text-xs sm:text-sm bg-slate-50 border rounded-xl outline-none transition-all text-slate-800 ${
                          isEmailVerified
                            ? 'border-emerald-300 bg-emerald-50/40 text-emerald-900 font-medium'
                            : 'border-slate-200 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isEmailVerified || isSendingOtp || resendCountdown > 0}
                        className={`absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                          isEmailVerified
                            ? 'bg-emerald-100 text-emerald-700 cursor-default'
                            : resendCountdown > 0
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed text-[11px]'
                            : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                        }`}
                      >
                        {isEmailVerified ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Verified</span>
                          </>
                        ) : isSendingOtp ? (
                          <span>Sending...</span>
                        ) : resendCountdown > 0 ? (
                          <span>{resendCountdown}s</span>
                        ) : otpSent ? (
                          <>
                            <RefreshCw className="w-3 h-3" />
                            <span>Resend OTP</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>Send OTP</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* OTP Verification Box */}
                  {otpSent && !isEmailVerified && (
                    <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-rose-600" />
                          <span>Enter Email OTP</span>
                        </label>
                        <span className="text-[10px] text-slate-500">
                          Sent to <strong className="font-mono text-slate-700">{signupEmail}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            maxLength={6}
                            value={enteredOtp}
                            onChange={(e) => {
                              setEnteredOtp(e.target.value.replace(/\D/g, ''));
                              setOtpError('');
                            }}
                            placeholder="Enter 6-digit OTP"
                            className="w-full px-3 py-2 text-center text-sm font-bold tracking-widest font-mono bg-white border border-slate-300 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none text-slate-900 shadow-2xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verify</span>
                        </button>
                      </div>

                      {/* Demo OTP Preview */}
                      <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-lg border border-rose-100">
                        <span className="text-slate-600">
                          Demo OTP: <strong className="font-mono text-rose-600 font-bold tracking-wider">{activeOtp}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEnteredOtp(activeOtp);
                            setOtpError('');
                          }}
                          className="text-rose-600 hover:text-rose-700 hover:underline font-bold cursor-pointer text-xs"
                        >
                          Auto-fill
                        </button>
                      </div>

                      {otpError && (
                        <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {otpError}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Verified State Confirmation */}
                  {isEmailVerified && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Email <strong>{signupEmail}</strong> is verified</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEmailVerified(false);
                          setOtpSent(false);
                          setEnteredOtp('');
                        }}
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 underline font-semibold cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  )}

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        placeholder="+91 98765..."
                        className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Password & Confirm Password in grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={signupShowPassword ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Create password"
                        required
                        className="w-full pl-10 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setSignupShowPassword((prev) => !prev);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer transition-colors focus:outline-none"
                        aria-label={signupShowPassword ? 'Hide password' : 'Show password'}
                        title={signupShowPassword ? 'Hide password' : 'Show password'}
                      >
                        {signupShowPassword ? (
                          <EyeOff className="w-3.5 h-3.5 text-rose-600" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-slate-500 hover:text-slate-700" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={signupShowPassword ? 'text' : 'password'}
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        required
                        className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Sign Up Submit Button */}
                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  Create Patient Account & Sign In
                </button>
              </form>
            )}

            {/* Forgot Password Modal */}
            {showForgotPassword && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
                  <h3 className="text-base font-bold text-slate-900 mb-1">Password Recovery</h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Enter your email to receive recovery instructions.
                  </p>

                  {resetSent ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 text-center mb-4">
                      Password reset link sent to <strong>{email}</strong>!
                    </div>
                  ) : (
                    <div className="space-y-3 mb-4">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                      />
                      <button
                        type="button"
                        onClick={() => setResetSent(true)}
                        className="w-full py-2 bg-rose-600 text-white font-semibold text-xs rounded-xl shadow-xs"
                      >
                        Send Reset Link
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetSent(false);
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Art/Info Column */}
        <div className="hidden lg:flex lg:col-span-6 bg-slate-900 relative flex-col justify-between p-8 text-white">
          <img
            src={LOGIN_HEART_IMAGE}
            alt="MedDesk Medical Portal"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Top Brand Quote */}
          <div className="relative z-10">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-semibold text-rose-300 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              NABH & JCI Accredited Hospital System
            </span>
          </div>

          {/* Bottom Footer */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
              <span>© 2026 MedDesk Healthcare</span>
              <span>24/7 Support: 1800-MED-DESK</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
