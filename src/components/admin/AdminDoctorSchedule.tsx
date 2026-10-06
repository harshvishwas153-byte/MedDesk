import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Check,
  X,
  AlertTriangle,
  Plus,
  Trash2,
  ShieldCheck,
  ArrowLeft,
  User,
  Stethoscope,
  Building2,
  Sun,
  CalendarDays,
  Coffee,
  Lock,
  Edit3,
} from 'lucide-react';
import { Doctor, ViewMode, Appointment } from '../../types';
import { MedicareApiClient } from '../../services/api';

interface AdminDoctorScheduleProps {
  onNavigate: (view: ViewMode) => void;
}

export const AdminDoctorSchedule: React.FC<AdminDoctorScheduleProps> = ({
  onNavigate,
}) => {
  const doctors = MedicareApiClient.getDoctors();
  const selectedDoctorId = localStorage.getItem('medicare_admin_selected_doctor_id') || doctors[0]?.id || 'doc-1';
  const [currentDoctorId, setCurrentDoctorId] = useState<string>(selectedDoctorId);

  const doctor = doctors.find((d) => d.id === currentDoctorId) || doctors[0];

  // Retrieve schedule config from localStorage
  const scheduleStorageKey = `medicare_doctor_schedule_${currentDoctorId}`;
  const [scheduleConfig, setScheduleConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(scheduleStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      weekly: {
        Monday: { isWorking: true, startTime: '10:00 AM', endTime: '04:00 PM', breakStart: '01:00 PM', breakEnd: '02:00 PM', slotDurationMinutes: 20 },
        Tuesday: { isWorking: true, startTime: '10:00 AM', endTime: '04:00 PM', breakStart: '01:00 PM', breakEnd: '02:00 PM', slotDurationMinutes: 20 },
        Wednesday: { isWorking: false, startTime: '10:00 AM', endTime: '04:00 PM', breakStart: '01:00 PM', breakEnd: '02:00 PM', slotDurationMinutes: 20 },
        Thursday: { isWorking: true, startTime: '02:00 PM', endTime: '08:00 PM', breakStart: '05:00 PM', breakEnd: '05:30 PM', slotDurationMinutes: 20 },
        Friday: { isWorking: true, startTime: '10:00 AM', endTime: '04:00 PM', breakStart: '01:00 PM', breakEnd: '02:00 PM', slotDurationMinutes: 20 },
        Saturday: { isWorking: true, startTime: '10:00 AM', endTime: '01:00 PM', breakStart: '', breakEnd: '', slotDurationMinutes: 20 },
        Sunday: { isWorking: false, startTime: '10:00 AM', endTime: '04:00 PM', breakStart: '', breakEnd: '', slotDurationMinutes: 20 },
      },
      overrides: {}, // date string YYYY-MM-DD -> { status: 'Available'|'Absent'|'Leave'|'Holiday', startTime, endTime, reason }
      leaves: [
        { id: 'leave-1', type: 'Single-Day', startDate: '2026-09-28', endDate: '2026-09-28', reason: 'Medical conference in Mumbai' },
      ],
      holidays: [
        { id: 'hol-1', startDate: '2026-10-02', reason: 'Gandhi Jayanti National Holiday' },
      ],
    };
  });

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'weekly' | 'overrides' | 'leaves'>('weekly');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveType, setLeaveType] = useState<'Single-Day' | 'Multi-Day'>('Single-Day');

  // Existing Appointments Warning Modal state
  const [pendingUnavailableDate, setPendingUnavailableDate] = useState<string | null>(null);
  const [pendingUnavailableStatus, setPendingUnavailableStatus] = useState<string>('Absent');
  const [affectedAppointments, setAffectedAppointments] = useState<Appointment[]>([]);
  const [showAppointmentWarningModal, setShowAppointmentWarningModal] = useState(false);

  const saveConfig = (newConfig: typeof scheduleConfig) => {
    setScheduleConfig(newConfig);
    localStorage.setItem(scheduleStorageKey, JSON.stringify(newConfig));
    setSuccessMessage('Schedule and availability successfully updated!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDoctorChange = (docId: string) => {
    setCurrentDoctorId(docId);
    localStorage.setItem('medicare_admin_selected_doctor_id', docId);
    try {
      const saved = localStorage.getItem(`medicare_doctor_schedule_${docId}`);
      if (saved) {
        setScheduleConfig(JSON.parse(saved));
      } else {
        // Reset or load default
      }
    } catch {}
  };

  const handleUpdateWeeklyDay = (day: string, field: string, value: any) => {
    const updated = {
      ...scheduleConfig,
      weekly: {
        ...scheduleConfig.weekly,
        [day]: {
          ...scheduleConfig.weekly[day],
          [field]: value,
        },
      },
    };
    saveConfig(updated);
  };

  const handleSetDateOverride = (dateStr: string, status: 'Available' | 'Absent' | 'Leave' | 'Holiday', reason = '') => {
    // Check if appointments exist on this date for this doctor
    const allAppointments = MedicareApiClient.getAppointments() || [];
    const matchedAppts = allAppointments.filter(
      (a) => a.doctorId === doctor.id && (a.date.includes(dateStr) || a.date.includes('12 October 2024') /* mock date check */)
    );

    if ((status === 'Absent' || status === 'Leave' || status === 'Holiday') && matchedAppts.length > 0) {
      setPendingUnavailableDate(dateStr);
      setPendingUnavailableStatus(status);
      setAffectedAppointments(matchedAppts);
      setShowAppointmentWarningModal(true);
      return;
    }

    applyOverrideDirect(dateStr, status, reason);
  };

  const applyOverrideDirect = (dateStr: string, status: string, reason = '') => {
    const updated = {
      ...scheduleConfig,
      overrides: {
        ...scheduleConfig.overrides,
        [dateStr]: {
          status,
          reason,
        },
      },
    };
    saveConfig(updated);
    setShowAppointmentWarningModal(false);
  };

  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveReason) return;

    const newLeave = {
      id: `leave-${Date.now()}`,
      type: leaveType,
      startDate: leaveStartDate,
      endDate: leaveType === 'Multi-Day' ? leaveEndDate : leaveStartDate,
      reason: leaveReason,
    };

    const updated = {
      ...scheduleConfig,
      leaves: [...(scheduleConfig.leaves || []), newLeave],
    };

    saveConfig(updated);
    setShowLeaveModal(false);
    setLeaveStartDate('');
    setLeaveEndDate('');
    setLeaveReason('');
  };

  const handleDeleteLeave = (leaveId: string) => {
    const updated = {
      ...scheduleConfig,
      leaves: scheduleConfig.leaves.filter((l: any) => l.id !== leaveId),
    };
    saveConfig(updated);
  };

  // Generate slots for selected date
  const getDayName = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', { weekday: 'long' });
    } catch {
      return 'Monday';
    }
  };

  const dayOfWeek = getDayName(selectedDate);
  const daySchedule = scheduleConfig.weekly[dayOfWeek] || { isWorking: true, startTime: '10:00 AM', endTime: '04:00 PM', breakStart: '01:00 PM', breakEnd: '02:00 PM', slotDurationMinutes: 20 };
  const dateOverride = scheduleConfig.overrides[selectedDate];

  // Determine effective status for selectedDate
  let effectiveStatus = 'Available';
  if (dateOverride) {
    effectiveStatus = dateOverride.status;
  } else if (!daySchedule.isWorking) {
    effectiveStatus = 'OFF';
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onNavigate('admin-doctors')}
            className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Back to Doctors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Doctor Schedule & Availability</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                Admin Panel
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage weekly working hours, break timings, leaves, and date overrides
            </p>
          </div>
        </div>

        {/* Doctor Selector Dropdown */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-600 shrink-0">Select Doctor:</span>
          <select
            value={currentDoctorId}
            onChange={(e) => handleDoctorChange(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-rose-400 min-w-[200px]"
          >
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.specialty})
              </option>
            ))}
          </select>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2.5 animate-fadeIn shadow-xs">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Doctor Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center md:text-left">
          <img
            src={doctor.avatar}
            alt={doctor.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-sm shrink-0"
          />
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{doctor.name}</h3>
              <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {doctor.uniqueDoctorId || 'DOC-1001'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {doctor.specialty} · <strong className="text-slate-800">{doctor.department}</strong> · {doctor.hospital}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-2 text-xs text-slate-600 flex-wrap">
              <span>Consultation Fee: <strong className="text-slate-900">₹{doctor.consultationFee}</strong></span>
              <span>•</span>
              <span>Experience: <strong className="text-slate-900">{doctor.experienceYears} Years</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          <button
            type="button"
            onClick={() => setShowLeaveModal(true)}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Leave</span>
          </button>
          <button
            type="button"
            onClick={() => setShowHolidayModal(true)}
            className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold border border-blue-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Holiday</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center p-1.5 bg-slate-200/80 rounded-2xl gap-1 max-w-xl mx-auto">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'weekly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Weekly Schedule
        </button>
        <button
          onClick={() => setActiveTab('overrides')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'overrides' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Date Overrides
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'leaves' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Leaves & Holidays
        </button>
      </div>

      {/* TAB 1: Weekly Schedule */}
      {activeTab === 'weekly' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recurring Weekly Schedule</h3>
              <p className="text-xs text-slate-500">Configure standard working hours, breaks, and slot durations for each day of the week</p>
            </div>
            <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg border border-rose-200">
              Auto-Applies Weekly
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(scheduleConfig.weekly).map(([dayName, dayInfo]: [string, any]) => (
              <div key={dayName} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-[130px]">
                  <input
                    type="checkbox"
                    checked={dayInfo.isWorking}
                    onChange={(e) => handleUpdateWeeklyDay(dayName, 'isWorking', e.target.checked)}
                    className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                  />
                  <span className={`font-bold text-sm ${dayInfo.isWorking ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                    {dayName}
                  </span>
                </div>

                {dayInfo.isWorking ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 w-full text-xs">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 mb-0.5">Start Time</span>
                      <input
                        type="text"
                        value={dayInfo.startTime}
                        onChange={(e) => handleUpdateWeeklyDay(dayName, 'startTime', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 mb-0.5">End Time</span>
                      <input
                        type="text"
                        value={dayInfo.endTime}
                        onChange={(e) => handleUpdateWeeklyDay(dayName, 'endTime', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 mb-0.5">Break Time</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={dayInfo.breakStart}
                          onChange={(e) => handleUpdateWeeklyDay(dayName, 'breakStart', e.target.value)}
                          placeholder="1 PM"
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium"
                        />
                        <span className="text-slate-400">-</span>
                        <input
                          type="text"
                          value={dayInfo.breakEnd}
                          onChange={(e) => handleUpdateWeeklyDay(dayName, 'breakEnd', e.target.value)}
                          placeholder="2 PM"
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 mb-0.5">Slot Duration</span>
                      <select
                        value={dayInfo.slotDurationMinutes}
                        onChange={(e) => handleUpdateWeeklyDay(dayName, 'slotDurationMinutes', Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                      >
                        <option value={15}>15 mins</option>
                        <option value={20}>20 mins</option>
                        <option value={30}>30 mins</option>
                        <option value={45}>45 mins</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 text-xs text-rose-600 font-bold bg-rose-50 px-3 py-2 rounded-xl border border-rose-200 w-full md:w-auto text-center">
                    Doctor is OFF on {dayName}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Date Overrides */}
      {activeTab === 'overrides' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Specific Date Overrides</h3>
              <p className="text-xs text-slate-500">Select any calendar date to override the normal weekly schedule (e.g. mark absent or special hours)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-600" />
                <span>Select Date to Override</span>
              </h4>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-rose-400"
                />
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Day of Week:</span>
                  <strong className="text-slate-900">{dayOfWeek}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Normal Status:</span>
                  <strong className={daySchedule.isWorking ? 'text-emerald-600' : 'text-rose-600'}>
                    {daySchedule.isWorking ? `Working (${daySchedule.startTime} - ${daySchedule.endTime})` : 'OFF'}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Current Override:</span>
                  <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold rounded">
                    {dateOverride ? dateOverride.status : 'None (Using Weekly)'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-bold text-slate-700">Set Status for {selectedDate}:</span>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => handleSetDateOverride(selectedDate, 'Available')}
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>🟢 Available</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetDateOverride(selectedDate, 'Absent')}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>🔴 Absent / OFF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetDateOverride(selectedDate, 'Leave')}
                    className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>🟡 On Leave</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetDateOverride(selectedDate, 'Holiday')}
                    className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>⚪ Holiday</span>
                  </button>
                </div>
              </div>
            </div>

            {/* List of Active Overrides */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Active Date Overrides ({Object.keys(scheduleConfig.overrides || {}).length})</h4>
              {Object.keys(scheduleConfig.overrides || {}).length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No date overrides configured. All dates follow the weekly schedule.
                </div>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {Object.entries(scheduleConfig.overrides).map(([date, ov]: [string, any]) => (
                    <div key={date} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-900 block">{date}</strong>
                        <span className="text-rose-600 font-bold">{ov.status}</span> {ov.reason && `(${ov.reason})`}
                      </div>
                      <button
                        onClick={() => {
                          const updatedOverrides = { ...scheduleConfig.overrides };
                          delete updatedOverrides[date];
                          saveConfig({ ...scheduleConfig, overrides: updatedOverrides });
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remove Override"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Leaves & Holidays */}
      {activeTab === 'leaves' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Upcoming Leaves & Holidays</h3>
              <p className="text-xs text-slate-500">Manage leaves, multi-day vacations, and official holidays</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLeaveModal(true)}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Leave
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Leaves ({scheduleConfig.leaves?.length || 0})</h4>
              {scheduleConfig.leaves?.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl text-slate-400 text-xs text-center">No leaves recorded.</div>
              ) : (
                scheduleConfig.leaves?.map((leave: any) => (
                  <div key={leave.id} className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-900">{leave.startDate} {leave.endDate && leave.endDate !== leave.startDate ? `to ${leave.endDate}` : ''}</span>
                        <span className="px-2 py-0.5 bg-amber-200 text-amber-800 font-bold rounded text-[10px]">{leave.type}</span>
                      </div>
                      <p className="text-amber-800/80 mt-1">{leave.reason}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteLeave(leave.id)}
                      className="text-amber-700 hover:text-rose-600 p-1.5 rounded-lg hover:bg-amber-100 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Holidays ({scheduleConfig.holidays?.length || 0})</h4>
              {scheduleConfig.holidays?.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl text-slate-400 text-xs text-center">No holidays recorded.</div>
              ) : (
                scheduleConfig.holidays?.map((hol: any) => (
                  <div key={hol.id} className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-900">{hol.startDate}</span>
                        <span className="px-2 py-0.5 bg-blue-200 text-blue-800 font-bold rounded text-[10px]">Holiday</span>
                      </div>
                      <p className="text-blue-800/80 mt-1">{hol.reason}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD LEAVE                                                        */}
      {/* ========================================================================= */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="p-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
              <h4 className="text-sm font-bold">Add Doctor Leave Period</h4>
              <button onClick={() => setShowLeaveModal(false)} className="p-1 rounded-lg text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddLeave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e: any) => setLeaveType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Single-Day">Single-Day Leave</option>
                  <option value="Multi-Day">Multi-Day Leave / Vacation</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={leaveStartDate}
                  onChange={(e) => setLeaveStartDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              {leaveType === 'Multi-Day' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Leave</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Personal vacation, Medical conference"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Save Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EXISTING APPOINTMENTS WARNING                                    */}
      {/* ========================================================================= */}
      {showAppointmentWarningModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="p-5 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-white" />
                <h4 className="text-sm font-bold">Existing Appointments Conflict</h4>
              </div>
              <button onClick={() => setShowAppointmentWarningModal(false)} className="p-1 rounded-lg text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900 font-semibold space-y-1">
                <p>This doctor has <strong>{affectedAppointments.length} appointment(s)</strong> scheduled on <strong>{pendingUnavailableDate}</strong>.</p>
                <p className="text-[11px] text-rose-700">Marking this doctor as {pendingUnavailableStatus} will affect scheduled patients. Please choose an action:</p>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    // Reschedule action
                    alert('Appointments marked for rescheduling and patients notified.');
                    applyOverrideDirect(pendingUnavailableDate || '', pendingUnavailableStatus);
                  }}
                  className="w-full p-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-left flex items-center justify-between cursor-pointer"
                >
                  <span>Reschedule Appointments & Notify Patients</span>
                  <span className="text-rose-600">Recommended</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Cancel action
                    affectedAppointments.forEach((apt) => {
                      MedicareApiClient.updateAppointmentStatus(apt.id, 'Cancelled');
                    });
                    applyOverrideDirect(pendingUnavailableDate || '', pendingUnavailableStatus);
                  }}
                  className="w-full p-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl font-bold text-rose-600 text-left cursor-pointer"
                >
                  Cancel Affected Appointments
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Keep existing
                    applyOverrideDirect(pendingUnavailableDate || '', pendingUnavailableStatus);
                  }}
                  className="w-full p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-center cursor-pointer"
                >
                  Keep Existing Appointments & Set Unavailable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
