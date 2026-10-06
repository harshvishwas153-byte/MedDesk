import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Calendar,
  FileText,
  MessageSquare,
  ShieldAlert,
  Search,
  Filter,
  Clock,
  Sparkles,
} from 'lucide-react';
import { NotificationItem, User, ViewMode } from '../../types';
import { MedicareApiClient } from '../../services/api';

import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface NotificationsPageProps {
  currentUser?: User;
  onNavigate: (view: ViewMode) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'appointment' | 'record' | 'consultation' | 'system'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleMarkAllRead = () => {
    const updated = MedicareApiClient.markAllNotificationsRead(currentUser);
    setNotifications(updated);
  };

  const handleMarkRead = (id: string) => {
    const list = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    MedicareApiClient.markNotificationRead?.(id, currentUser);
    setNotifications(list);
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    handleMarkRead(notif.id);
    if (notif.actionView) {
      onNavigate(notif.actionView);
    } else if (notif.type === 'chat') {
      onNavigate(currentUser?.role === 'DOCTOR' ? 'doctor-consultations' : 'patient-consultation');
    } else if (notif.type === 'appointment') {
      onNavigate(currentUser?.role === 'DOCTOR' ? 'doctor-appointments' : 'patient-appointments');
    } else if (notif.type === 'record') {
      onNavigate(currentUser?.role === 'DOCTOR' ? 'doctor-patients' : 'patient-records');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications
    .filter((n) => !n.title.toLowerCase().includes('spring boot'))
    .filter((n) => {
      const matchesTab =
        activeTab === 'all'
          ? true
          : activeTab === 'appointment'
          ? n.type === 'appointment'
          : activeTab === 'record'
          ? n.type === 'record'
          : activeTab === 'consultation'
          ? n.type === 'system' && n.title.toLowerCase().includes('message')
          : n.type === 'system';

      const matchesQuery =
        searchQuery.trim() === '' ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesQuery;
    });

  const getIcon = (type: string, title: string) => {
    if (type === 'appointment' || title.toLowerCase().includes('appointment')) {
      return <Calendar className="w-5 h-5 text-rose-600" />;
    }
    if (type === 'record' || title.toLowerCase().includes('record') || title.toLowerCase().includes('lab')) {
      return <FileText className="w-5 h-5 text-purple-600" />;
    }
    if (title.toLowerCase().includes('message') || title.toLowerCase().includes('consultation')) {
      return <MessageSquare className="w-5 h-5 text-teal-600" />;
    }
    return <ShieldAlert className="w-5 h-5 text-amber-600" />;
  };

  const getIconBg = (type: string, title: string) => {
    if (type === 'appointment' || title.toLowerCase().includes('appointment')) {
      return 'bg-rose-50 border-rose-200/80';
    }
    if (type === 'record' || title.toLowerCase().includes('record')) {
      return 'bg-purple-50 border-purple-200/80';
    }
    if (title.toLowerCase().includes('message') || title.toLowerCase().includes('consultation')) {
      return 'bg-teal-50 border-teal-200/80';
    }
    return 'bg-amber-50 border-amber-200/80';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-bold text-white bg-rose-600 rounded-full shadow-xs">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Stay informed on appointment reminders, medical reports, doctor messages & system updates.
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 border border-slate-200/80"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Rounded Rectangle Category Switcher */}
        <div className="flex items-center p-1.5 bg-slate-100/90 border border-slate-200/90 rounded-2xl gap-1 text-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Notifications ({filteredNotifications.length})
          </button>

          <button
            onClick={() => setActiveTab('appointment')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'appointment'
                ? 'bg-white text-rose-700 shadow-xs border border-rose-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-rose-600" />
            <span>Appointments</span>
          </button>

          <button
            onClick={() => setActiveTab('record')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'record'
                ? 'bg-white text-purple-700 shadow-xs border border-purple-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>Records & Labs</span>
          </button>

          <button
            onClick={() => setActiveTab('consultation')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'consultation'
                ? 'bg-white text-teal-700 shadow-xs border border-teal-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
            <span>Messages</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200/90 rounded-2xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 bg-white border border-slate-200/90 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No notifications found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? `No alerts matching "${searchQuery}"`
                : 'You have read all notifications in this category.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                notif.read
                  ? 'bg-white border-slate-200/80 hover:border-slate-300'
                  : 'bg-rose-50/40 border-rose-200/90 shadow-2xs hover:border-rose-300'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {/* Category Icon */}
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${getIconBg(
                    notif.type,
                    notif.title
                  )}`}
                >
                  {getIcon(notif.type, notif.title)}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">{notif.title}</span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
                    )}
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pr-2">{notif.message}</p>
                </div>
              </div>

              {!notif.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkRead(notif.id);
                  }}
                  className="px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                  title="Mark as Read"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mark Read</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
