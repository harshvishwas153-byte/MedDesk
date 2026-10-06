import React from 'react';
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarCheck,
  FileText,
  User as UserIcon,
  LogOut,
  Users,
  Stethoscope,
  Calendar,
  Clock,
  X,
  MessageSquare,
  ClipboardList,
  Bell,
  UserCheck,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { MedicareApiClient } from '../../services/api';
import { User, UserRole, ViewMode } from '../../types';

interface SidebarProps {
  currentView: ViewMode;
  userRole?: UserRole;
  currentUser?: User;
  onNavigate: (view: ViewMode) => void;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenJavaRubric?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  userRole,
  currentUser,
  onNavigate,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
  onOpenJavaRubric,
}) => {
  const effectiveRole: UserRole = userRole || currentUser?.role || 'PATIENT';

  const [unreadMsgCount, setUnreadMsgCount] = React.useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = React.useState(0);

  React.useEffect(() => {
    const updateCount = () => {
      if (currentUser) {
        // Consultations
        const consultations = MedicareApiClient.getConsultations(currentUser.id, currentUser.role);
        const count = consultations.reduce((acc, c) => {
          if (currentUser.role === 'PATIENT') {
            return acc + (c.unreadPatient || 0);
          } else if (currentUser.role === 'DOCTOR') {
            return acc + (c.unreadDoctor || 0);
          }
          return acc;
        }, 0);
        setUnreadMsgCount(count);

        // Notifications
        const notifications = MedicareApiClient.getNotifications(currentUser);
        const notifCount = notifications.filter((n) => !n.read).length;
        setUnreadNotificationCount(notifCount);
      } else {
        setUnreadMsgCount(0);
        setUnreadNotificationCount(0);
      }
    };

    updateCount();
    const unsubscribe = MedicareApiClient.subscribe(updateCount);
    return () => unsubscribe();
  }, [currentUser]);

  // Navigation config based on role (Screen 2 Web)
  const getNavItems = () => {
    if (effectiveRole === 'ADMIN') {
      return [
        { id: 'admin-dashboard' as ViewMode, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'admin-users' as ViewMode, label: 'User Management', icon: Users },
        { id: 'admin-doctors' as ViewMode, label: 'Doctor Management', icon: Stethoscope },
        { id: 'admin-appointments' as ViewMode, label: 'Appointment Management', icon: Calendar },
      ];
    }

    if (effectiveRole === 'DOCTOR') {
      return [
        { id: 'doctor-dashboard' as ViewMode, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'doctor-consultations' as ViewMode, label: 'Patient Assistance', icon: MessageSquare, badge: unreadMsgCount > 0 ? String(unreadMsgCount) : 'Live' },
        { id: 'doctor-schedule' as ViewMode, label: 'My Schedule', icon: Clock },
        { id: 'doctor-appointments' as ViewMode, label: 'Appointments', icon: Calendar },
        { id: 'doctor-patients' as ViewMode, label: 'Patient Records', icon: FileText },
        { id: 'patient-notifications' as ViewMode, label: 'Notifications', icon: Bell, badge: unreadNotificationCount > 0 ? String(unreadNotificationCount) : undefined },
        { id: 'doctor-profile' as ViewMode, label: 'My Profile', icon: UserIcon },
      ];
    }

    // Default: Patient matching Screen 2
    return [
      { id: 'patient-dashboard' as ViewMode, label: 'Dashboard', icon: LayoutDashboard },
      { id: 'patient-find-doctors' as ViewMode, label: 'Find Doctors', icon: UserCheck },
      { id: 'patient-appointments' as ViewMode, label: 'Appointments', icon: Calendar },
      { id: 'patient-consultation' as ViewMode, label: 'Text Consultation', icon: MessageSquare, badge: unreadMsgCount > 0 ? String(unreadMsgCount) : undefined },
      { id: 'patient-records' as ViewMode, label: 'Medical Records', icon: FileText },
      { id: 'patient-notifications' as ViewMode, label: 'Notifications', icon: Bell, badge: unreadNotificationCount > 0 ? String(unreadNotificationCount) : undefined },
      { id: 'patient-profile' as ViewMode, label: 'My Profile', icon: UserIcon },
    ];
  };

  const navItems = getNavItems();

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white border-r border-slate-200/90">
      <div className="p-4">
        {/* Mobile Header with close button */}
        <div className="flex items-center justify-between lg:hidden mb-4 pb-3 border-b border-slate-100">
          <BrandLogo size="sm" />
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Card in Sidebar */}
        {currentUser && (
          <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-lg object-cover border border-slate-200"
            />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-900 truncate block">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-rose-600 font-semibold block capitalize">
                {currentUser.role.toLowerCase()}
              </span>
            </div>
          </div>
        )}

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentView === item.id ||
              (item.id === 'patient-dashboard' && currentView === 'patient-dashboard') ||
              (item.id === 'patient-find-doctors' && currentView === 'patient-find-doctors') ||
              (item.id === 'patient-consultation' && currentView === 'patient-consultation') ||
              (item.id === 'patient-settings' && currentView === 'patient-settings');

            return (
              <button
                key={`${item.id}-${item.label}`}
                onClick={() => {
                  onNavigate(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-rose-50 text-rose-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-rose-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {'badge' in item && item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-rose-600 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom section with Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block w-64 shrink-0 self-stretch sticky top-16 h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity"
            onClick={onCloseMobile}
          ></div>
          <div className="relative w-72 max-w-full h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
