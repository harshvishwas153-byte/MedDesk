import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CalendarPlus,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  X,
  Download,
  MessageSquare,
} from 'lucide-react';
import { Appointment, User, ViewMode } from '../../types';
import { MedicareApiClient } from '../../services/api';
import { generateAppointmentSlipPdf } from '../../utils/pdfGenerator';
import { AppointmentSlipModal } from './AppointmentSlipModal';

interface MyAppointmentsProps {
  currentUser: User;
  onNavigate: (view: ViewMode) => void;
}

export const MyAppointments: React.FC<MyAppointmentsProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>(
    MedicareApiClient.getAppointmentsByPatient(currentUser.id)
  );
  const [filter, setFilter] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled'>('All');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const filtered = appointments.filter((a) => {
    if (filter === 'All') return true;
    return a.status === filter;
  });

  const handleCancel = (id: string) => {
    const updated = MedicareApiClient.updateAppointmentStatus(id, 'Cancelled');
    setAppointments(updated.filter((a) => a.patientId === currentUser.id));
    if (selectedAppointment && selectedAppointment.id === id) {
      setSelectedAppointment(null);
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'Upcoming':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Appointments</h2>
          <p className="text-xs text-slate-500">
            View upcoming schedule and comprehensive clinical consultation history
          </p>
        </div>

        <button
          onClick={() => onNavigate('patient-book')}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['All', 'Upcoming', 'Completed', 'Cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filter === tab
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 text-xs">
            No appointments found under "{filter}".
          </div>
        ) : (
          filtered.map((apt) => (
            <div
              key={apt.id}
              className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
            >
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <img
                  src={apt.doctorAvatar}
                  alt={apt.doctorName}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{apt.doctorName}</h4>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                        apt.status
                      )}`}
                    >
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-xs text-rose-600 font-medium truncate">{apt.department}</p>
                  <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-[11px] sm:text-xs text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {apt.date}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {apt.time}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[140px] sm:max-w-none">{apt.hospital}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100">
                <span className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                  ₹{apt.fee}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('patient-consultation')}
                    className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    title="Ask doctor questions & share reports (10-day post-visit window)"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ask Doctor</span>
                  </button>

                  <button
                    onClick={() => setSelectedAppointment(apt)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    title="View Reference Consultation & Billing Slip"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                    <span>Slip</span>
                  </button>

                  <button
                    onClick={() => generateAppointmentSlipPdf(apt, currentUser)}
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    title="Download Official PDF Slip"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>

                  {apt.status === 'Upcoming' && (
                    <button
                      onClick={() => handleCancel(apt.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Official OPD Consultation Slip Modal (matching template reference) */}
      {selectedAppointment && (
        <AppointmentSlipModal
          appointment={selectedAppointment}
          currentUser={currentUser}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
};
