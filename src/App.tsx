/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Appointment, User, UserRole, ViewMode } from './types';
import { MedicareApiClient } from './services/api';

// Common Components
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { UserProfile } from './components/common/UserProfile';
import { JavaRubricModal } from './components/common/JavaRubricModal';

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

export default function App() {
  // Navigation & session state
  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(MedicareApiClient.getCurrentUser());
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isJavaRubricOpen, setIsJavaRubricOpen] = useState(false);

  const [selectedDoctorIdToBook, setSelectedDoctorIdToBook] = useState<string | undefined>(
    undefined
  );
  const [lastBookedAppointment, setLastBookedAppointment] = useState<Appointment | null>(null);

  // Initialize live Firestore database sync and subscribe to real-time updates
  useEffect(() => {
    MedicareApiClient.initFirestore();
    const unsubscribe = MedicareApiClient.subscribe(() => {
      setCurrentUser(MedicareApiClient.getCurrentUser());
    });
    return unsubscribe;
  }, []);

  // Navigation dispatcher with auth enforcement
  const handleNavigate = (view: ViewMode) => {
    const publicViews: ViewMode[] = ['landing', 'login', 'signup'];
    const activeUser = MedicareApiClient.getCurrentUser();

    if (!publicViews.includes(view) && !activeUser) {
      setCurrentView('login');
      setIsMobileSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentView(view);
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
  const handleBookingSuccess = (appointment: Appointment) => {
    setLastBookedAppointment(appointment);
    setCurrentView('appointment-confirmed');
  };

  const renderAppContent = () => {
    // 1. Full-screen Landing Page (Screenshot 1)
    if (currentView === 'landing') {
      return (
        <LandingPage
          onNavigate={handleNavigate}
          onBookAppointment={handleStartBooking}
          onOpenJavaRubric={() => setIsJavaRubricOpen(true)}
        />
      );
    }

    // 2. Full-screen Login/Signup Page
    if (currentView === 'login' || currentView === 'signup') {
      return (
        <LoginPage
          initialMode={currentView === 'signup' ? 'signup' : 'login'}
          onLoginSuccess={handleLoginSuccess}
          onNavigate={handleNavigate}
        />
      );
    }

    // 3. Authenticated App Shell with Header, Sidebar, and View Content
    if (!currentUser) {
      return (
        <LoginPage
          initialMode="login"
          onLoginSuccess={handleLoginSuccess}
          onNavigate={handleNavigate}
        />
      );
    }

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
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            onOpenJavaRubric={() => setIsJavaRubricOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-8 pb-24 lg:pb-12">
            {/* Patient Views */}
            {currentView === 'patient-dashboard' && (
              <PatientDashboard
                currentUser={currentUser}
                onNavigate={handleNavigate}
                onSelectDoctorToBook={handleStartBooking}
              />
            )}

            {currentView === 'patient-find-doctors' && (
              <FindDoctors
                onNavigate={handleNavigate}
                onSelectDoctorToBook={handleStartBooking}
              />
            )}

            {currentView === 'patient-book' && (
              <BookAppointment
                currentUser={currentUser}
                preSelectedDoctorId={selectedDoctorIdToBook}
                onBookingSuccess={handleBookingSuccess}
                onCancel={() => handleNavigate('patient-dashboard')}
              />
            )}

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
            )}
          </main>
        </div>

        {/* Mobile Bottom Navigation Bar (Screens < lg) */}
        <MobileBottomNav
          currentView={currentView}
          userRole={currentUser.role}
          onNavigate={handleNavigate}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {renderAppContent()}

      {/* Connectivity Drop Alert */}
      <OfflineIndicator />

      {/* Java Web Project & Rubric 2 Compliance Hub Modal */}
      {isJavaRubricOpen && (
        <JavaRubricModal onClose={() => setIsJavaRubricOpen(false)} />
      )}
    </div>
  );
}
