import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  MessageSquare,
  Save,
  AlertCircle,
} from 'lucide-react';
import { Appointment, User, ViewMode } from '../../types';
import { MedicareApiClient } from '../../services/api';

interface DoctorDashboardProps {
  currentUser: User;
  onNavigate: (view: ViewMode) => void;
}

function parseAppointmentDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const cleaned = dateStr.replace(/^[A-Za-z]+,\s*/, '');
  const d = new Date(cleaned);
  return Number.isNaN(d.getTime()) ? null : d;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [doctorAppointments, setDoctorAppointments] = useState<Appointment[]>(() =>
    MedicareApiClient.getAppointmentsByDoctor(currentUser.id)
  );
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const now = new Date();
  const [activeYear, setActiveYear] = useState<number>(now.getFullYear());
  const [activeMonth, setActiveMonth] = useState<number>(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<number>(now.getDate());
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [prescriptionText, setPrescriptionText] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [mobileTab, setMobileTab] = useState<'queue' | 'overview' | 'schedule'>('queue');

  useEffect(() => {
    const sync = () => {
      setDoctorAppointments(MedicareApiClient.getAppointmentsByDoctor(currentUser.id));
    };
    sync();
    return MedicareApiClient.subscribe(sync);
  }, [currentUser.id]);

  const isSameDay = (dateStr: string, targetDate: Date): boolean => {
    const parsed = parseAppointmentDate(dateStr);
    if (!parsed) return false;
    return (
      parsed.getFullYear() === targetDate.getFullYear() &&
      parsed.getMonth() === targetDate.getMonth() &&
      parsed.getDate() === targetDate.getDate()
    );
  };

  const todayDate = new Date();
  const todayAppointments = doctorAppointments.filter(
    (apt) => apt.status !== 'Cancelled' && isSameDay(apt.date, todayDate)
  );

  const todayOpdCount = todayAppointments.length;
  const uniquePatients = new Set(doctorAppointments.map((apt) => apt.patientId));
  const totalPatientsCount = uniquePatients.size;
  const pendingCount = doctorAppointments.filter(
    (apt) => apt.status === 'Pending' || apt.status === 'Upcoming'
  ).length;
  const completedCount = doctorAppointments.filter(
    (apt) => apt.status === 'Completed'
  ).length;

  const openConsultModal = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setClinicalNotes(apt.notes || '');
    setPrescriptionText(apt.prescription || '');
    setModalError(null);
  };

  const handleSaveConsultation = async (newStatus?: Appointment['status']) => {
    if (!selectedAppointment) return;
    setModalError(null);
    setIsUpdating(true);
    try {
      const updated = await MedicareApiClient.updateAppointment(selectedAppointment.id, {
        status: newStatus ?? selectedAppointment.status,
        notes: clinicalNotes.trim(),
        prescription: prescriptionText.trim(),
      });
      setSelectedAppointment(updated);
      if (newStatus) {
        setSelectedAppointment(null);
      }
    } catch (err) {
      setModalError((err as Error).message || 'Failed to update appointment.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Upcoming':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const daysInActiveMonth = new Date(activeYear, activeMonth + 1, 0).getDate();
  const firstDayOffset = new Date(activeYear, activeMonth, 1).getDay();
  const currentMonthLabel = new Date(activeYear, activeMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    if (activeMonth === 0) {
      setActiveMonth(11);
      setActiveYear((y) => y - 1);
    } else {
      setActiveMonth((m) => m - 1);
    }
    setSelectedDate(1);
  };

  const handleNextMonth = () => {
    if (activeMonth === 11) {
      setActiveMonth(0);
      setActiveYear((y) => y + 1);
    } else {
      setActiveMonth((m) => m + 1);
    }
    setSelectedDate(1);
  };

  const bookedCountByDay = useMemo(() => {
    const counts = new Map<number, number>();
    for (const apt of doctorAppointments) {
      if (apt.status === 'Cancelled') continue;
      const d = parseAppointmentDate(apt.date);
      if (d && d.getFullYear() === activeYear && d.getMonth() === activeMonth) {
        const day = d.getDate();
        counts.set(day, (counts.get(day) || 0) + 1);
      }
    }
    return counts;
  }, [doctorAppointments, activeYear, activeMonth]);

  const selectedDayAppointments = doctorAppointments.filter((apt) => {
    if (apt.status === 'Cancelled') return false;
    return isSameDay(apt.date, new Date(activeYear, activeMonth, selectedDate));
  });

  const selectedDateFormatted = new Date(activeYear, activeMonth, selectedDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const nextUpcomingToday = todayAppointments.find(
    (a) => a.status === 'Upcoming' || a.status === 'Pending'
  );

  // Show today's queue, or upcoming appointments if none today
  const queueAppointments =
    todayAppointments.length > 0
      ? todayAppointments
      : doctorAppointments.filter((a) => a.status !== 'Cancelled').slice(0, 8);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile Tab Segmented Switcher */}
      <div className="md:hidden flex items-center p-1 bg-slate-200/80 rounded-xl gap-1">
        <button
          onClick={() => setMobileTab('queue')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            mobileTab === 'queue'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          OPD Queue ({queueAppointments.length})
        </button>
        <button
          onClick={() => setMobileTab('overview')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            mobileTab === 'overview'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setMobileTab('schedule')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            mobileTab === 'schedule'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Schedule
        </button>
      </div>

      {/* Stat Cards Row */}
      <div className={`${mobileTab === 'overview' ? 'grid' : 'hidden md:grid'} grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-5`}>
        <div
          onClick={() => onNavigate('doctor-appointments')}
          className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 block mb-0.5 sm:mb-1 truncate">
              Today&apos;s OPD
            </span>
            <span className="text-xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">{todayOpdCount}</span>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('doctor-patients')}
          className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 block mb-0.5 sm:mb-1 truncate">Total Patients</span>
            <span className="text-xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">{totalPatientsCount}</span>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 block mb-0.5 sm:mb-1 truncate">
              Active Queue
            </span>
            <span className="text-xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">{pendingCount}</span>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 block mb-0.5 sm:mb-1 truncate">Completed</span>
            <span className="text-xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">{completedCount}</span>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Appointments Queue & Interactive Schedule Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <div
          className={`lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between ${
            mobileTab === 'queue' ? 'block' : 'hidden md:flex'
          }`}
        >
          <div>
            <div className="p-4 sm:p-6 pb-3 sm:pb-4 flex items-center justify-between border-b border-slate-100 sm:border-b-0">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {todayAppointments.length > 0 ? "Today's Appointments" : 'OPD Appointment Queue'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {currentUser.department || 'General'} OPD · {currentUser.hospital || 'MedDesk Clinical Network'}
                </p>
              </div>
              <button
                onClick={() => onNavigate('doctor-schedule')}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                Manage Slots
              </button>
            </div>

            {/* Mobile Fluid Cards */}
            <div className="sm:hidden divide-y divide-slate-100">
              {queueAppointments.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-medium text-xs">
                  No appointments scheduled yet.
                </div>
              ) : (
                queueAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => openConsultModal(apt)}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">{apt.patientName}</span>
                        <span className="text-[10px] font-mono text-slate-400 tabular-nums">{apt.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{apt.date} · {apt.reason}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                          apt.status
                        )}`}
                      >
                        {apt.status}
                      </span>
                      <button className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 rounded-lg text-xs">
                        Consult
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[540px] text-left text-xs border-collapse">
                <thead>
                  <tr className="border-y border-slate-200 bg-slate-50/80 text-slate-500 font-semibold">
                    <th className="py-3 px-5">Schedule</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {queueAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 font-medium">
                        No appointments scheduled yet.
                      </td>
                    </tr>
                  ) : (
                    queueAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-slate-900 tabular-nums">
                          <div>{apt.time}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{apt.date}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {apt.patientName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{apt.reason}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                              apt.status
                            )}`}
                          >
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onNavigate('doctor-consultations')}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold border border-rose-200 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1"
                              title="Assist patient via live consultation"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Assist</span>
                            </button>
                            <button
                              onClick={() => openConsultModal(apt)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 rounded-lg transition-colors cursor-pointer text-xs"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              {nextUpcomingToday
                ? `Next consult today: ${nextUpcomingToday.time} (${nextUpcomingToday.patientName})`
                : 'No pending consults remaining today'}
            </span>
            <button
              onClick={() => onNavigate('doctor-schedule')}
              className="text-rose-600 font-semibold hover:underline cursor-pointer"
            >
              Configure Slot Timings →
            </button>
          </div>
        </div>

        {/* Right Column: Live Schedule Calendar Widget */}
        <div
          className={`lg:col-span-5 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between ${
            mobileTab === 'schedule' ? 'block' : 'hidden md:flex'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">My Schedule</h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-800">{currentMonthLabel}</span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400 py-1">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: firstDayOffset }, (_, i) => (
                  <span key={`empty-${i}`} className="p-2" />
                ))}

                {Array.from({ length: daysInActiveMonth }, (_, i) => i + 1).map((day) => {
                  const isSelected = day === selectedDate;
                  const hasAppointments = (bookedCountByDay.get(day) || 0) > 0;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDate(day)}
                      className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center font-medium transition-all text-xs cursor-pointer relative ${
                        isSelected
                          ? 'bg-rose-600 text-white font-bold shadow-md'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {day}
                      {hasAppointments && !isSelected && (
                        <span className="absolute bottom-1 w-1 h-1 bg-rose-500 rounded-full"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Selected Date</span>
              <span className="font-bold text-slate-800">{selectedDateFormatted}</span>
            </div>
            <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-semibold text-[11px]">
              {selectedDayAppointments.length > 0
                ? `${selectedDayAppointments.length} Consultation${selectedDayAppointments.length === 1 ? '' : 's'} Booked`
                : 'Available for Booking'}
            </span>
          </div>
        </div>
      </div>

      {/* Consultation Modal for Doctor */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Patient Consultation</h4>
                <p className="text-[11px] text-slate-500">
                  {selectedAppointment.patientName} · {selectedAppointment.date} at {selectedAppointment.time}
                </p>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Chief Complaint:</span>
                  <span className="font-bold text-slate-800">{selectedAppointment.reason}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-rose-600">{selectedAppointment.status}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Diagnosis & Notes
                </label>
                <textarea
                  rows={3}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Record ECG rhythm, blood pressure reading, and assessment..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prescription / Medications
                </label>
                <input
                  type="text"
                  value={prescriptionText}
                  onChange={(e) => setPrescriptionText(e.target.value)}
                  placeholder="e.g. Tab Metoprolol 25mg 1-0-0, Tab Aspirin 75mg 0-1-0"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isUpdating || selectedAppointment.status === 'Cancelled'}
                    onClick={() => handleSaveConsultation('Completed')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Save & Mark Completed
                  </button>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleSaveConsultation()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Notes
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
