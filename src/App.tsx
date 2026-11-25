/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Appointment, User, ViewMode } from './types';
import { MedicareApiClient } from './services/api';

// Common Components
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { UserProfile } from './components/common/UserProfile';

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

  const [selectedDoctorIdToBook, setSelectedDoctorIdToBook] = useState<string | undefined>(
    undefined
  );
  const [lastBookedAppointment, setLastBookedAppointment] = useState<Appointment | null>(null);

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
    });
    return unsubscribe;
  }, []);

  const handleNavigate = (view: ViewMode) => {
    const publicViews: ViewMode[] = ['landing', 'login', 'signup'];
    const activeUser = MedicareApiClient.getCurrentUser();

    if (!publicViews.includes(view) && !activeUser) {
      setCurrentView('login');
      setIsMobileSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (activeUser && !isViewPermittedForUser(view, activeUser)) {
      setCurrentView(getDefaultDashboardForRole(activeUser.role));
      setIsMobileSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentView(view);
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const handleBookingSuccess = (appointment: Appointment) => {
    setLastBookedAppointment(appointment);
    setCurrentView('appointment-confirmed');
  };

  const renderAppContent = () => {
    if (currentView === 'landing') {
      return (
        <LandingPage
          onNavigate={handleNavigate}
          onBookAppointment={handleStartBooking}
          onSelectDoctorToBook={setSelectedDoctorIdToBook}
        />
      );
    }

    if (currentView === 'login' || currentView === 'signup') {
      return (
        <LoginPage
          initialMode={currentView === 'signup' ? 'signup' : 'login'}
          onLoginSuccess={handleLoginSuccess}
          onNavigate={handleNavigate}
        />
      );
    }

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

    if (!currentUser) {
      return (
        <LoginPage
          initialMode="login"
          onLoginSuccess={handleLoginSuccess}
          onNavigate={handleNavigate}
        />
      );
    }

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
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />

          <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-8 pb-24 lg:pb-12">
            {/* Patient Views */}
            {effectiveView === 'patient-dashboard' && (
              <PatientDashboard
                currentUser={currentUser}
                onNavigate={handleNavigate}
                onSelectDoctorToBook={handleStartBooking}
              />
            )}

            {effectiveView === 'patient-find-doctors' && (
              <FindDoctors
                onNavigate={handleNavigate}
                onSelectDoctorToBook={handleStartBooking}
              />
            )}

            {effectiveView === 'patient-book' && (
              <BookAppointment
                currentUser={currentUser}
                preSelectedDoctorId={selectedDoctorIdToBook}
                onBookingSuccess={handleBookingSuccess}
                onCancel={() => handleNavigate('patient-dashboard')}
              />
            )}

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
            )}
          </main>
        </div>

        <MobileBottomNav
          currentView={effectiveView}
          userRole={currentUser.role}
          onNavigate={handleNavigate}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {renderAppContent()}
      <OfflineIndicator />
    </div>
  );
}
