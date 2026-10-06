import React from 'react';
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarCheck,
  FileText,
  User as UserIcon,
  Clock,
  Calendar,
  Users,
  Stethoscope,
} from 'lucide-react';
import { UserRole, ViewMode } from '../../types';

interface MobileBottomNavProps {
  currentView: ViewMode;
  userRole: UserRole;
  onNavigate: (view: ViewMode) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  userRole,
  onNavigate,
}) => {
  const getNavItems = () => {
    if (userRole === 'ADMIN') {
      return [
        { id: 'admin-dashboard' as ViewMode, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'admin-users' as ViewMode, label: 'Users', icon: Users },
        { id: 'admin-doctors' as ViewMode, label: 'Doctors', icon: Stethoscope },
        { id: 'admin-appointments' as ViewMode, label: 'Bookings', icon: Calendar },
      ];
    }

    if (userRole === 'DOCTOR') {
      return [
        { id: 'doctor-dashboard' as ViewMode, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'doctor-schedule' as ViewMode, label: 'Schedule', icon: Clock },
        { id: 'doctor-appointments' as ViewMode, label: 'Queue', icon: Calendar },
        { id: 'doctor-patients' as ViewMode, label: 'Patients', icon: Users },
        { id: 'doctor-profile' as ViewMode, label: 'Profile', icon: UserIcon },
      ];
    }

    // Default: Patient
    return [
      { id: 'patient-dashboard' as ViewMode, label: 'Dashboard', icon: LayoutDashboard },
      { id: 'patient-book' as ViewMode, label: 'Book', icon: CalendarPlus, isHighlight: true },
      { id: 'patient-appointments' as ViewMode, label: 'Visits', icon: CalendarCheck },
      { id: 'patient-records' as ViewMode, label: 'Records', icon: FileText },
      { id: 'patient-profile' as ViewMode, label: 'Profile', icon: UserIcon },
    ];
  };

  const navItems = getNavItems();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-lg px-2 pb-safe"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentView === item.id ||
            (item.id === 'patient-book' &&
              (currentView === 'patient-confirmation' || currentView === 'appointment-confirmed'));

          if (item.isHighlight) {
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center justify-center -mt-5 group cursor-pointer focus:outline-none"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                    isActive
                      ? 'bg-rose-600 text-white ring-4 ring-rose-100'
                      : 'bg-rose-500 text-white hover:bg-rose-600'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className={`text-[10px] font-bold mt-1 tracking-tight ${
                    isActive ? 'text-rose-600' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors active:scale-95 cursor-pointer focus:outline-none ${
                isActive ? 'text-rose-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 transition-transform" />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-600 rounded-full"></span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium ${
                  isActive ? 'font-bold text-rose-600' : 'text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
