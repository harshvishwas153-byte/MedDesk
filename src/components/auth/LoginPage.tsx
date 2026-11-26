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
  Phone,
  UserCheck,
  KeyRound,
  AlertCircle,
  ShieldCheck,
  Loader2,
  Droplets,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { LOGIN_HEART_IMAGE } from '../../data/initialData';
import { User, ViewMode } from '../../types';
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
  const [loginRoleTab, setLoginRoleTab] = useState<'patient' | 'doctor' | 'admin'>('patient');
  const [adminClaimed, setAdminClaimed] = useState<boolean>(() =>
    MedicareApiClient.isAdminClaimed()
  );

  // Admin Login / First-Run Setup State
  const [adminNameInput, setAdminNameInput] = useState('Hospital Administrator');
  const [adminEmailInput, setAdminEmailInput] = useState('admin@meddesk.com');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminConfirmPasswordInput, setAdminConfirmPasswordInput] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');

  // Patient Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Doctor ID Login State
  const [doctorIdInput, setDoctorIdInput] = useState('');
  const [doctorPasswordInput, setDoctorPasswordInput] = useState('');
  const [showDoctorPassword, setShowDoctorPassword] = useState(false);
  const [doctorLoginError, setDoctorLoginError] = useState('');

  // Patient Sign Up State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupGender, setSignupGender] = useState('Female');
  const [signupBloodGroup, setSignupBloodGroup] = useState('O+');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupShowPassword, setSignupShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    if (initialMode) {
      setAuthMode(initialMode);
    }
  }, [initialMode]);

  useEffect(() => {
    setAdminClaimed(MedicareApiClient.isAdminClaimed());
    return MedicareApiClient.subscribe(() => {
      setAdminClaimed(MedicareApiClient.isAdminClaimed());
    });
  }, []);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    setError('');

    if (!adminPasswordInput) {
      setAdminLoginError('Please enter administrator password.');
      return;
    }

    if (!adminClaimed) {
      if (adminPasswordInput.length < 6) {
        setAdminLoginError('Administrator password must be at least 6 characters.');
        return;
      }
      if (adminPasswordInput !== adminConfirmPasswordInput) {
        setAdminLoginError('Passwords do not match.');
        return;
      }
      setIsSubmitting(true);
      try {
        const adminUser = await MedicareApiClient.adminSetup(
          adminPasswordInput,
          adminNameInput.trim() || 'Hospital Administrator'
        );
        onLoginSuccess(adminUser, 'admin-dashboard');
      } catch (err) {
        setAdminLoginError((err as Error).message || 'Failed to configure administrator account.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!adminEmailInput.trim()) {
      setAdminLoginError('Please enter administrator email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const adminUser = await MedicareApiClient.login({
        identifier: adminEmailInput.trim(),
        password: adminPasswordInput,
        role: 'ADMIN',
      });
      onLoginSuccess(adminUser, 'admin-dashboard');
    } catch (err) {
      setAdminLoginError((err as Error).message || 'Invalid administrator credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address or Doctor ID.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isDocId = cleanEmail.toUpperCase().startsWith('DOC-');
      const user = await MedicareApiClient.login({
        identifier: cleanEmail,
        password,
        role: isDocId ? 'DOCTOR' : undefined,
      });

      if (user.role === 'ADMIN') onLoginSuccess(user, 'admin-dashboard');
      else if (user.role === 'DOCTOR') onLoginSuccess(user, 'doctor-dashboard');
      else onLoginSuccess(user, 'patient-dashboard');
    } catch (err) {
      setError((err as Error).message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDoctorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setDoctorLoginError('');
    setError('');

    const cleanId = doctorIdInput.trim();
    if (!cleanId) {
      setDoctorLoginError('Please enter your Unique Doctor ID (e.g. DOC-1001) or work email.');
      return;
    }
    if (!doctorPasswordInput) {
      setDoctorLoginError('Please enter your admin-issued password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await MedicareApiClient.login({
        identifier: cleanId,
        password: doctorPasswordInput,
        role: 'DOCTOR',
      });
      onLoginSuccess(user, 'doctor-dashboard');
    } catch (err) {
      setDoctorLoginError(
        (err as Error).message ||
          'Invalid Unique Doctor ID or password. Please verify with Hospital Administration.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!signupName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newUser = await MedicareApiClient.registerUser({
        name: signupName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        phone: signupPhone.trim() || '+91 98765 43210',
        gender: signupGender,
        bloodGroup: signupBloodGroup,
      });
      onLoginSuccess(newUser, 'patient-dashboard');
    } catch (err) {
      setError((err as Error).message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8">
      {/* Top Header Row */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-3 px-1">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
        <span className="text-[11px] text-slate-400 font-medium">
          MedDesk Secure Healthcare Portal
        </span>
      </div>

      {/* Main Login/Signup Card */}
      <div className="w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Form Column */}
        <div className="lg:col-span-6 p-5 sm:p-7 lg:p-9 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <BrandLogo size="md" onClick={() => onNavigate('landing')} />
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
                    ? adminClaimed
                      ? 'Hospital Administration Portal'
                      : 'First-Time Administrator Setup'
                    : 'Welcome Back'
                  : 'Create Patient Account'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {authMode === 'login'
                  ? loginRoleTab === 'doctor'
                    ? 'Sign in using your Admin-Issued Unique Doctor ID & password'
                    : loginRoleTab === 'admin'
                    ? adminClaimed
                      ? 'Sign in to manage clinical staff, schedules, and hospital operations'
                      : 'Set up the primary hospital administrator password to claim governance'
                    : 'Login to access your appointments and health records'
                  : 'Create your encrypted patient portal profile to book visits and store reports'}
              </p>
            </div>

            {error && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. LOGIN FORM */}
            {authMode === 'login' && (
              <>
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

                {/* A. HOSPITAL ADMIN LOGIN OR FIRST-RUN SETUP */}
                {loginRoleTab === 'admin' ? (
                  <form onSubmit={handleAdminSubmit} className="space-y-3">
                    {adminLoginError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{adminLoginError}</span>
                      </div>
                    )}

                    {!adminClaimed ? (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Administrator Display Name
                        </label>
                        <div className="relative">
                          <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={adminNameInput}
                            onChange={(e) => setAdminNameInput(e.target.value)}
                            placeholder="Hospital Administrator"
                            required
                            className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-slate-800"
                          />
                        </div>
                      </div>
                    ) : (
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
                            placeholder="admin@meddesk.com"
                            required
                            className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-slate-800"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {adminClaimed ? 'Administrator Password' : 'Create Admin Password (min 6 chars)'}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showAdminPassword ? 'text' : 'password'}
                          value={adminPasswordInput}
                          onChange={(e) => setAdminPasswordInput(e.target.value)}
                          placeholder="Enter administrator password"
                          required
                          className="w-full pl-10 pr-10 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        >
                          {showAdminPassword ? (
                            <EyeOff className="w-4 h-4 text-rose-600" />
                          ) : (
                            <Eye className="w-4 h-4 text-slate-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    {!adminClaimed && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Confirm Admin Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type={showAdminPassword ? 'text' : 'password'}
                            value={adminConfirmPasswordInput}
                            onChange={(e) => setAdminConfirmPasswordInput(e.target.value)}
                            placeholder="Repeat administrator password"
                            required
                            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-slate-800"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                      <span>
                        {adminClaimed
                          ? 'Sign In to Admin Command Center'
                          : 'Initialize Admin & Enter Portal'}
                      </span>
                    </button>
                  </form>
                ) : loginRoleTab === 'doctor' ? (
                  <form onSubmit={handleDoctorLogin} className="space-y-3">
                    {doctorLoginError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{doctorLoginError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Unique Doctor ID or Clinical Email
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={doctorIdInput}
                          onChange={(e) => {
                            setDoctorIdInput(e.target.value);
                            setDoctorLoginError('');
                          }}
                          placeholder="e.g. DOC-1001"
                          required
                          className="w-full pl-10 pr-4 py-2 font-mono font-bold text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Doctor Password (Admin Issued)
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

                    <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                      Doctors receive their Unique ID and temporary password from Hospital Administration.
                    </p>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Stethoscope className="w-4 h-4" />
                      )}
                      <span>Sign In as Doctor</span>
                    </button>
                  </form>
                ) : (
                  /* B. PATIENT LOGIN */
                  <form onSubmit={handleFormLogin} className="space-y-3">
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-rose-600" />
                          ) : (
                            <Eye className="w-4 h-4 text-slate-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-1.5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Log In</span>
                    </button>
                  </form>
                )}

                <p className="text-center text-xs text-slate-500 mt-3">
                  Don&apos;t have a patient account?{' '}
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

            {/* 2. PATIENT SIGN UP FORM */}
            {authMode === 'signup' && (
              <form onSubmit={handleFormSignup} className="space-y-2.5">
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
                      placeholder="e.g. Aarav Sharma"
                      required
                      className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="you@email.com"
                      required
                      className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={signupGender}
                      onChange={(e) => setSignupGender(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-none text-slate-800"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Blood Group
                    </label>
                    <div className="relative">
                      <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-rose-500" />
                      <select
                        value={signupBloodGroup}
                        onChange={(e) => setSignupBloodGroup(e.target.value)}
                        className="w-full pl-8 pr-2 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-none text-slate-800"
                      >
                        {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="tel"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        placeholder="+91 98765..."
                        className="w-full pl-8 pr-2 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-none text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password (min 6 chars)
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
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      >
                        {signupShowPassword ? (
                          <EyeOff className="w-3.5 h-3.5 text-rose-600" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Create Patient Account & Sign In</span>
                </button>
              </form>
            )}

            {/* Forgot Password Modal */}
            {showForgotPassword && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Account Access Recovery</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    For patient or physician security, password resets are verified by Hospital Administration. Contact{' '}
                    <span className="font-semibold text-slate-900">help@meddesk.org</span> or call{' '}
                    <span className="font-semibold text-slate-900">1800-MED-DESK</span>. Doctors can request an instant temporary password from the Admin portal.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl cursor-pointer"
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

          <div className="relative z-10">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-semibold text-rose-300 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              NABH & JCI Accredited Hospital System
            </span>
          </div>

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
