/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Appointment, User, ViewMode } from './types';
=======
import { Appointment, User, UserRole, ViewMode } from './types';
>>>>>>> origin/main
import { MedicareApiClient } from './services/api';

// Common Components
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { UserProfile } from './components/common/UserProfile';
<<<<<<< HEAD
=======
import { JavaRubricModal } from './components/common/JavaRubricModal';
>>>>>>> origin/main

// Landing & Auth
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';

// Patient Views
import { PatientDashboard } from './components/patient/PatientDashboard';
import { FindDoctors } from './components/patient/FindDoctors';
import { BookAppointment } from './components/patient/BookAppointment';
import { AppointmentConfirmation } from './components/patient/AppointmentConfirmation';
import { TextConsultation } from './components/patient/TextConsultation';
import { MedicalHistory } from './components/patient/MedicalHistory';
import { MyAppointments } from './components/patient/MyAppointments';
import { NotificationsPage } from './components/patient/NotificationsPage';

// Doctor Views
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { DoctorSchedule } from './components/doctor/DoctorSchedule';
import { DoctorPatients } from './components/doctor/DoctorPatients';
import { DoctorConsultation } from './components/doctor/DoctorConsultation';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminUserManagement } from './components/admin/AdminUserManagement';
import { AdminDoctorManagement } from './components/admin/AdminDoctorManagement';
import { AdminDoctorSchedule } from './components/admin/AdminDoctorSchedule';
import { AdminAppointmentManagement } from './components/admin/AdminAppointmentManagement';

<<<<<<< HEAD
function getDefaultDashboardForRole(role: User['role']): ViewMode {
  if (role === 'ADMIN') return 'admin-dashboard';
  if (role === 'DOCTOR') return 'doctor-dashboard';
  return 'patient-dashboard';
}

function isViewPermittedForUser(view: ViewMode, user: User): boolean {
  if (view === 'landing' || view === 'login' || view === 'signup') return true;
  if (view === 'patient-notifications') {
    return user.role === 'PATIENT' || user.role === 'DOCTOR' || user.role === 'ADMIN';
  }
  if (view.startsWith('admin-')) return user.role === 'ADMIN';
  if (view.startsWith('doctor-')) return user.role === 'DOCTOR';
  if (view.startsWith('patient-') || view === 'appointment-confirmed') {
    return user.role === 'PATIENT';
  }
  return true;
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(MedicareApiClient.getCurrentUser());
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(!MedicareApiClient.isInitialized());
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
=======
export default function App() {
  // Navigation & session state
  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(MedicareApiClient.getCurrentUser());
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isJavaRubricOpen, setIsJavaRubricOpen] = useState(false);
>>>>>>> origin/main

  const [selectedDoctorIdToBook, setSelectedDoctorIdToBook] = useState<string | undefined>(
    undefined
  );
  const [lastBookedAppointment, setLastBookedAppointment] = useState<Appointment | null>(null);

<<<<<<< HEAD
  useEffect(() => {
    const unsubscribe = MedicareApiClient.subscribe(() => {
      setCurrentUser(MedicareApiClient.getCurrentUser());
      setIsBootstrapping(!MedicareApiClient.isInitialized());
    });
    MedicareApiClient.init().then(() => {
      const restored = MedicareApiClient.getCurrentUser();
      if (restored) {
        setCurrentUser(restored);
      }
      setIsBootstrapping(false);
=======
  // Initialize live Firestore database sync and subscribe to real-time updates
  useEffect(() => {
    MedicareApiClient.initFirestore();
    const unsubscribe = MedicareApiClient.subscribe(() => {
      setCurrentUser(MedicareApiClient.getCurrentUser());
>>>>>>> origin/main
    });
    return unsubscribe;
  }, []);

<<<<<<< HEAD
=======
  // Navigation dispatcher with auth enforcement
>>>>>>> origin/main
  const handleNavigate = (view: ViewMode) => {
    const publicViews: ViewMode[] = ['landing', 'login', 'signup'];
    const activeUser = MedicareApiClient.getCurrentUser();

    if (!publicViews.includes(view) && !activeUser) {
      setCurrentView('login');
      setIsMobileSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

<<<<<<< HEAD
    if (activeUser && !isViewPermittedForUser(view, activeUser)) {
      setCurrentView(getDefaultDashboardForRole(activeUser.role));
      setIsMobileSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

=======
>>>>>>> origin/main
    setCurrentView(view);
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

<<<<<<< HEAD
  const handleLoginSuccess = (user: User, targetView: ViewMode) => {
    setCurrentUser(user);
    setCurrentView(
      isViewPermittedForUser(targetView, user)
        ? targetView
        : getDefaultDashboardForRole(user.role)
    );
  };

  const handleLogout = async () => {
    await MedicareApiClient.logout();
    setLastBookedAppointment(null);
    setSelectedDoctorIdToBook(undefined);
    setCurrentView('landing');
  };

  const handleStartBooking = (doctorId?: string) => {
    setSelectedDoctorIdToBook(doctorId);
    const activeUser = MedicareApiClient.getCurrentUser();
    if (!activeUser) {
      setCurrentView('login');
      return;
    }
    if (activeUser.role !== 'PATIENT') {
      setCurrentView(getDefaultDashboardForRole(activeUser.role));
      return;
    }
    setCurrentView('patient-book');
  };

=======
  // Role Switcher
  const handleRoleChange = (newRole: UserRole) => {
    const user = MedicareApiClient.switchUserRole(newRole);
    setCurrentUser(user);

    if (newRole === 'ADMIN') {
      setCurrentView('admin-dashboard');
    } else if (newRole === 'DOCTOR') {
      setCurrentView('doctor-dashboard');
    } else {
      setCurrentView('patient-dashboard');
    }
  };

  // Login handler
  const handleLoginSuccess = (user: User, targetView: ViewMode) => {
    setCurrentUser(user);
    setCurrentView(targetView);
  };

  // Logout handler
  const handleLogout = () => {
    MedicareApiClient.logout();
    setCurrentView('landing');
  };

  // Start booking appointment from doctor card or button
  const handleStartBooking = (doctorId?: string) => {
    setSelectedDoctorIdToBook(doctorId);
    setCurrentView('patient-book');
  };

  // Booking confirmed handler
>>>>>>> origin/main
  const handleBookingSuccess = (appointment: Appointment) => {
    setLastBookedAppointment(appointment);
    setCurrentView('appointment-confirmed');
  };

  const renderAppContent = () => {
<<<<<<< HEAD
=======
    // 1. Full-screen Landing Page (Screenshot 1)
>>>>>>> origin/main
    if (currentView === 'landing') {
      return (
        <LandingPage
          onNavigate={handleNavigate}
          onBookAppointment={handleStartBooking}
<<<<<<< HEAD
          onSelectDoctorToBook={setSelectedDoctorIdToBook}
=======
          onOpenJavaRubric={() => setIsJavaRubricOpen(true)}
>>>>>>> origin/main
        />
      );
    }

<<<<<<< HEAD
=======
    // 2. Full-screen Login/Signup Page
>>>>>>> origin/main
    if (currentView === 'login' || currentView === 'signup') {
      return (
        <LoginPage
          initialMode={currentView === 'signup' ? 'signup' : 'login'}
          onLoginSuccess={handleLoginSuccess}
          onNavigate={handleNavigate}
        />
      );
    }

<<<<<<< HEAD
    if (isBootstrapping && !currentUser) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Loading clinical session...</p>
          </div>
        </div>
      );
    }

=======
    // 3. Authenticated App Shell with Header, Sidebar, and View Content
>>>>>>> origin/main
    if (!currentUser) {
      return (
        <LoginPage
          initialMode="login"
          onLoginSuccess={handleLoginSuccess}
          onNavigate={handleNavigate}
        />
      );
    }

<<<<<<< HEAD
    const effectiveView = isViewPermittedForUser(currentView, currentUser)
      ? currentView
      : getDefaultDashboardForRole(currentUser.role);

    const confirmationAppointment =
      lastBookedAppointment ||
      MedicareApiClient.getAppointmentsByPatient(currentUser.id)[0] ||
      null;

    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <Header
          currentUser={currentUser}
          currentView={effectiveView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNavigate={handleNavigate}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onLogout={handleLogout}
        />

        <div className="flex-1 flex w-full">
          <Sidebar
            currentUser={currentUser}
            currentView={effectiveView}
=======
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          currentView={currentView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRoleChange={handleRoleChange}
          onNavigate={handleNavigate}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenJavaRubric={() => setIsJavaRubricOpen(true)}
        />

        <div className="flex-1 flex w-full">
          {/* Left Sidebar (Desktop & Mobile Drawer) */}
          <Sidebar
            currentUser={currentUser}
            currentView={currentView}
>>>>>>> origin/main
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
<<<<<<< HEAD
          />

          <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-8 pb-24 lg:pb-12">
            {/* Patient Views */}
            {effectiveView === 'patient-dashboard' && (
=======
            onOpenJavaRubric={() => setIsJavaRubricOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-8 pb-24 lg:pb-12">
            {/* Patient Views */}
            {currentView === 'patient-dashboard' && (
>>>>>>> origin/main
              <PatientDashboard
                currentUser={currentUser}
                onNavigate={handleNavigate}
                onSelectDoctorToBook={handleStartBooking}
              />
            )}

<<<<<<< HEAD
            {effectiveView === 'patient-find-doctors' && (
=======
            {currentView === 'patient-find-doctors' && (
>>>>>>> origin/main
              <FindDoctors
                onNavigate={handleNavigate}
                onSelectDoctorToBook={handleStartBooking}
              />
            )}

<<<<<<< HEAD
            {effectiveView === 'patient-book' && (
=======
            {currentView === 'patient-book' && (
>>>>>>> origin/main
              <BookAppointment
                currentUser={currentUser}
                preSelectedDoctorId={selectedDoctorIdToBook}
                onBookingSuccess={handleBookingSuccess}
                onCancel={() => handleNavigate('patient-dashboard')}
              />
            )}

<<<<<<< HEAD
            {(effectiveView === 'appointment-confirmed' || effectiveView === 'patient-confirmation') &&
              (confirmationAppointment ? (
                <AppointmentConfirmation
                  appointment={confirmationAppointment}
                  currentUser={currentUser}
                  onNavigate={handleNavigate}
                />
              ) : (
                <MyAppointments currentUser={currentUser} onNavigate={handleNavigate} />
              ))}

            {effectiveView === 'patient-consultation' && (
              <TextConsultation currentUser={currentUser} onNavigate={handleNavigate} />
            )}

            {effectiveView === 'patient-records' && <MedicalHistory currentUser={currentUser} />}

            {effectiveView === 'patient-appointments' && (
              <MyAppointments currentUser={currentUser} onNavigate={handleNavigate} />
            )}

            {effectiveView === 'patient-notifications' && (
              <NotificationsPage currentUser={currentUser} onNavigate={handleNavigate} />
            )}

            {(effectiveView === 'patient-profile' ||
              effectiveView === 'patient-settings' ||
              effectiveView === 'doctor-profile') && (
              <UserProfile currentUser={currentUser} onNavigate={handleNavigate} />
            )}

            {/* Doctor Views */}
            {effectiveView === 'doctor-dashboard' && (
              <DoctorDashboard currentUser={currentUser} onNavigate={handleNavigate} />
            )}

            {effectiveView === 'doctor-schedule' && (
              <DoctorSchedule currentUser={currentUser} onNavigate={handleNavigate} />
            )}

            {effectiveView === 'doctor-appointments' && (
              <DoctorDashboard currentUser={currentUser} onNavigate={handleNavigate} />
            )}

            {effectiveView === 'doctor-consultations' && (
              <DoctorConsultation currentUser={currentUser} onNavigate={handleNavigate} />
            )}

            {effectiveView === 'doctor-patients' && (
              <DoctorPatients onNavigate={handleNavigate} />
            )}

            {/* Admin Views */}
            {effectiveView === 'admin-dashboard' && (
              <AdminDashboard onNavigate={handleNavigate} />
            )}

            {effectiveView === 'admin-users' && (
              <AdminUserManagement onNavigate={handleNavigate} />
            )}

            {effectiveView === 'admin-doctors' && (
              <AdminDoctorManagement onNavigate={handleNavigate} />
            )}

            {effectiveView === 'admin-doctor-schedule' && (
              <AdminDoctorSchedule onNavigate={handleNavigate} />
            )}

            {effectiveView === 'admin-appointments' && (
              <AdminAppointmentManagement onNavigate={handleNavigate} />
=======
            {(currentView === 'appointment-confirmed' || currentView === 'patient-confirmation') && (
              <AppointmentConfirmation
                appointment={lastBookedAppointment || {
                  id: 'apt-101',
                  patientId: currentUser.id,
                  patientName: currentUser.name,
                  patientEmail: currentUser.email,
                  doctorId: 'doc-sarah',
                  doctorName: 'Dr. Sarah Johnson',
                  doctorAvatar: '/src/assets/images/dr_sarah_johnson_1790494049182.jpg',
                  department: 'General Medicine',
                  date: 'Wed, 17 Sep 2026',
                  time: '10:00 AM - 10:30 AM',
                  status: 'Upcoming',
                  reason: 'General health checkup and fatigue consultation',
                  hospital: 'City Care Hospital, Block B, Floor 2',
                  fee: 500,
                  consultationType: 'In-Clinic',
                }}
                currentUser={currentUser}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'patient-consultation' && (
              <TextConsultation
                currentUser={currentUser}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'patient-records' && (
              <MedicalHistory
                currentUser={currentUser}
              />
            )}

            {currentView === 'patient-appointments' && (
              <MyAppointments
                currentUser={currentUser}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'patient-notifications' && (
              <NotificationsPage
                currentUser={currentUser}
                onNavigate={handleNavigate}
              />
            )}

            {(currentView === 'patient-profile' || currentView === 'patient-settings' || currentView === 'doctor-profile') && (
              <UserProfile
                currentUser={currentUser}
                onNavigate={handleNavigate}
              />
            )}

            {/* Doctor Views */}
            {currentView === 'doctor-dashboard' && (
              <DoctorDashboard
                currentUser={currentUser}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'doctor-schedule' && (
              <DoctorSchedule
                currentUser={currentUser}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'doctor-appointments' && (
              <DoctorDashboard
                currentUser={currentUser}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'doctor-consultations' && (
              <DoctorConsultation
                currentUser={currentUser}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'doctor-patients' && (
              <DoctorPatients
                onNavigate={handleNavigate}
              />
            )}

            {/* Admin Views */}
            {currentView === 'admin-dashboard' && (
              <AdminDashboard
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'admin-users' && (
              <AdminUserManagement
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'admin-doctors' && (
              <AdminDoctorManagement
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'admin-doctor-schedule' && (
              <AdminDoctorSchedule
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'admin-appointments' && (
              <AdminAppointmentManagement
                onNavigate={handleNavigate}
              />
>>>>>>> origin/main
            )}
          </main>
        </div>

<<<<<<< HEAD
        <MobileBottomNav
          currentView={effectiveView}
=======
        {/* Mobile Bottom Navigation Bar (Screens < lg) */}
        <MobileBottomNav
          currentView={currentView}
>>>>>>> origin/main
          userRole={currentUser.role}
          onNavigate={handleNavigate}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {renderAppContent()}
<<<<<<< HEAD
      <OfflineIndicator />
=======

      {/* Connectivity Drop Alert */}
      <OfflineIndicator />

      {/* Java Web Project & Rubric 2 Compliance Hub Modal */}
      {isJavaRubricOpen && (
        <JavaRubricModal onClose={() => setIsJavaRubricOpen(false)} />
      )}
>>>>>>> origin/main
    </div>
  );
}
