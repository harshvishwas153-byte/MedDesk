import React, { useState } from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { User, ViewMode } from '../../types';
import { MedicareApiClient } from '../../services/api';

interface DoctorScheduleProps {
  currentUser: User;
  onNavigate: (view: ViewMode) => void;
}

export const DoctorSchedule: React.FC<DoctorScheduleProps> = ({
  currentUser,
}) => {
  const [activeDate, setActiveDate] = useState<number>(new Date().getDate());
  const [tick, setTick] = useState(0);

  React.useEffect(() => {
    return MedicareApiClient.subscribe(() => {
      setTick((t) => t + 1);
    });
  }, []);

  const [newSlotTime, setNewSlotTime] = useState('05:30 PM');
  const [showAddSlot, setShowAddSlot] = useState(false);

  // Fetch real appointments for this doctor
  const appointments = MedicareApiClient.getAppointmentsByDoctor(currentUser.id || '');

  // Calendar info
  const today = new Date();
  const currentMonthName = today.toLocaleDateString('en-US', { month: 'long' });
  const currentYear = today.getFullYear();
  const daysInMonthCount = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);

  const getDateStr = (dayNum: number) => {
    const monthFormatted = (today.getMonth() + 1).toString().padStart(2, '0');
    const dayFormatted = dayNum.toString().padStart(2, '0');
    return `${currentYear}-${monthFormatted}-${dayFormatted}`;
  };

  // Match real bookings for the selected day
  const getAppointmentsForDay = (dayNum: number) => {
    const monthShort = today.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
    const monthLong = today.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
    
    return appointments.filter((apt) => {
      const dStr = apt.date.toLowerCase();
      // Check if string contains day, month, and year
      const matchesDay = dStr.includes(String(dayNum));
      const matchesMonth = dStr.includes(monthShort) || dStr.includes(monthLong);
      const matchesYear = dStr.includes(String(currentYear));
      return matchesDay && matchesMonth && matchesYear;
    });
  };

  // Generate combined list of slots (base times, custom times, minus deleted, or matched with bookings)
  const getSlotsForDay = (dayNum: number) => {
    const times = MedicareApiClient.getDoctorSlots(currentUser.id || '', getDateStr(dayNum));
    const dayAppointments = getAppointmentsForDay(dayNum);

    return times.map(time => {
      // Find if there is an appointment at this approximate time
      const cleanTime = time.replace(/\s+/g, '').toLowerCase();
      const matchedApt = dayAppointments.find(apt => {
        const aptTimeClean = apt.time.split('-')[0].replace(/\s+/g, '').toLowerCase();
        return aptTimeClean.includes(cleanTime) || cleanTime.includes(aptTimeClean);
      });

      if (matchedApt) {
        return {
          time,
          status: 'Booked' as const,
          patient: matchedApt.patientName,
        };
      }

      return {
        time,
        status: 'Available' as const,
        patient: null,
      };
    });
  };

  const slots = getSlotsForDay(activeDate);

  const handleAddSlot = () => {
    if (!newSlotTime.trim()) return;
    const currentSlots = MedicareApiClient.getDoctorSlots(currentUser.id || '', getDateStr(activeDate));
    if (!currentSlots.includes(newSlotTime.trim())) {
      MedicareApiClient.saveDoctorSlots(currentUser.id || '', getDateStr(activeDate), [...currentSlots, newSlotTime.trim()]);
    }
    setShowAddSlot(false);
  };

  const handleRemoveSlot = (timeToRemove: string) => {
    const currentSlots = MedicareApiClient.getDoctorSlots(currentUser.id || '', getDateStr(activeDate));
    MedicareApiClient.saveDoctorSlots(
      currentUser.id || '',
      getDateStr(activeDate),
      currentSlots.filter((t) => t !== timeToRemove)
    );
  };

  // Previous month trailing spaces
  const trailingDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Clinical Schedule & Slots</h2>
          <p className="text-xs text-slate-500">
            Configure consultation hours, OPD availability, and view daily queue for {currentUser.name}
          </p>
        </div>

        <button
          onClick={() => setShowAddSlot(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Slot</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar picker */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              {currentMonthName} {currentYear}
            </h3>
            <span className="text-xs font-semibold text-rose-600">
              {currentUser.role === 'DOCTOR' ? 'Doctor Schedule' : 'Schedule'}
            </span>
          </div>

          <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400 py-1">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs mt-1">
            {trailingDays.map((_, i) => (
              <span key={`trail-${i}`} className="p-2 text-slate-200 font-mono text-[11px]"></span>
            ))}

            {daysInMonth.map((day) => {
              const isSelected = day === activeDate;
              const hasBookings = getAppointmentsForDay(day).length > 0;
              return (
                <button
                  key={day}
                  onClick={() => setActiveDate(day)}
                  className={`h-8 w-8 mx-auto rounded-full flex flex-col items-center justify-center font-medium transition-all text-xs cursor-pointer relative ${
                    isSelected
                      ? 'bg-rose-600 text-white font-bold shadow-md'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{day}</span>
                  {hasBookings && (
                    <span className={`w-1 h-1 rounded-full absolute bottom-1 ${isSelected ? 'bg-white' : 'bg-rose-500'}`}></span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span className="font-bold block text-slate-800 mb-1">Schedule Rule:</span>
            Default consultation length is 30 minutes. 15 minutes break between morning and afternoon shifts.
          </div>
        </div>

        {/* Slots for selected day */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Slots for {activeDate} {currentMonthName} {currentYear}
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {slots.filter((s) => s.status === 'Booked').length} Booked / {slots.length} Total
              </span>
            </div>

            <div className="space-y-2.5">
              {slots.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No active consultation slots configured for this day.
                </div>
              ) : (
                slots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block font-mono">
                          {slot.time}
                        </span>
                        {slot.patient ? (
                          <span className="text-[11px] text-slate-500">
                            Booked by <strong className="text-slate-800">{slot.patient}</strong>
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-medium">
                            Available for booking
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          slot.status === 'Booked'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {slot.status}
                      </span>

                      <button
                        onClick={() => handleRemoveSlot(slot.time)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Remove Slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {showAddSlot && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              <input
                type="text"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                placeholder="e.g. 05:30 PM"
                className="p-2 text-xs bg-white border border-slate-200 rounded-lg outline-none text-slate-800 font-mono"
              />
              <button
                onClick={handleAddSlot}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Save Slot
              </button>
              <button
                onClick={() => setShowAddSlot(false)}
                className="px-3 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
