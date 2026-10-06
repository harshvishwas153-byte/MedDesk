import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Shield,
  Stethoscope,
  Check,
  Menu,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { NotificationItem, User, UserRole, ViewMode } from '../../types';
import { MedicareApiClient } from '../../services/api';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface HeaderProps {
  currentUser: User;
  currentView?: ViewMode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onRoleChange?: (role: UserRole) => void;
  onNavigate: (view: ViewMode) => void;
  onToggleMobileSidebar?: () => void;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onLogout?: () => void;
  onOpenJavaRubric?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentView,
  searchQuery,
  onSearchChange,
  onRoleChange,
  onNavigate,
  onToggleMobileSidebar,
  searchPlaceholder,
  onSearch,
  onLogout,
  onOpenJavaRubric,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadNotifs = () => {
      setNotifications(MedicareApiClient.getNotifications(currentUser));
    };
    loadNotifs();
    const unsubscribe = MedicareApiClient.subscribe(loadNotifs);

    try {
      const q = query(collection(db, 'notifications'));
      const unsubCloud = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          loadNotifs();
        }
      });
      return () => {
        unsubscribe();
        unsubCloud();
      };
    } catch {
      return unsubscribe;
    }
  }, [currentUser]);

  const unreadCount = notifications.filter(
    (n) => !n.read && !n.title.toLowerCase().includes('spring boot')
  ).length;

  const handleMarkAllRead = () => {
    const updated = MedicareApiClient.markAllNotificationsRead(currentUser);
    setNotifications(updated);
  };

  const handleNotifClick = (notif: NotificationItem) => {
    MedicareApiClient.markNotificationRead(notif.id, currentUser);
    setIsNotifOpen(false);
    if (notif.actionView) {
      onNavigate(notif.actionView);
    } else if (notif.type === 'chat') {
      onNavigate(currentUser?.role === 'DOCTOR' ? 'doctor-consultations' : 'patient-consultation');
    } else if (notif.type === 'appointment') {
      onNavigate(currentUser?.role === 'DOCTOR' ? 'doctor-appointments' : 'patient-appointments');
    } else if (notif.type === 'record') {
      onNavigate(currentUser?.role === 'DOCTOR' ? 'doctor-patients' : 'patient-records');
    } else {
      onNavigate('patient-notifications');
    }
  };

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleSubtitle = (user: User) => {
    if (user.role === 'DOCTOR') return 'Cardiologist';
    if (user.role === 'ADMIN') return 'Administrator';
    return 'Patient';
  };

  const getDynamicPlaceholder = () => {
    if (searchPlaceholder) return searchPlaceholder;
    if (currentUser.role === 'ADMIN') return 'Search users, doctors...';
    if (currentUser.role === 'DOCTOR') return 'Search patients, appointments...';
    return 'Search doctors, appointments...';
  };

  const handleRoleSelect = (role: UserRole) => {
    if (onRoleChange) {
      onRoleChange(role);
    } else {
      const switched = MedicareApiClient.switchUserRole(role);
      if (role === 'ADMIN') onNavigate('admin-dashboard');
      else if (role === 'DOCTOR') onNavigate('doctor-dashboard');
      else onNavigate('patient-dashboard');
    }
    setIsProfileMenuOpen(false);
  };

  const handleDoLogout = () => {
    setIsProfileMenuOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      MedicareApiClient.logout();
      onNavigate('landing');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 h-16 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile hamburger & Brand */}
      <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="shrink-0">
          <BrandLogo size="sm" onClick={() => onNavigate('landing')} />
        </div>


      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* PWA Install Button for mobile & desktop */}
        <PWAInstallButton variant="header" />

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <span className="text-xs font-semibold text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`p-3 text-xs transition-colors cursor-pointer hover:bg-rose-50/80 ${
                        notif.read ? 'bg-white' : 'bg-rose-50/40 font-semibold'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{notif.title}</span>
                        <span className="text-[10px] text-slate-400">{notif.time}</span>
                      </div>
                      <p className="mt-1 text-slate-600 text-[11px] leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-slate-100 bg-slate-50/70 text-center">
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    onNavigate('patient-notifications');
                  }}
                  className="w-full py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 rounded-lg transition-colors cursor-pointer"
                >
                  View All Notifications &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge matching screenshot */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2 py-1 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[11px] text-slate-500 block leading-tight">
                {getRoleSubtitle(currentUser)}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Popover */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                <span className="text-xs font-bold text-slate-900 block">{currentUser.name}</span>
                <span className="text-[11px] text-slate-500 font-mono block">
                  {currentUser.email}
                </span>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-rose-50 text-rose-700 rounded-md border border-rose-200">
                  {currentUser.role}
                </span>
              </div>

              {/* Links */}
              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onNavigate(currentUser.role === 'DOCTOR' ? 'doctor-profile' : currentUser.role === 'ADMIN' ? 'admin-dashboard' : 'patient-profile');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg text-left cursor-pointer font-bold"
                >
                  <UserIcon className="w-3.5 h-3.5 text-rose-600" />
                  <span>Personal Profile</span>
                </button>
                <button
                  onClick={handleDoLogout}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg text-left cursor-pointer font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
