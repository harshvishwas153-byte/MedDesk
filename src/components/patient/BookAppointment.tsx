import React, { useState, useEffect } from 'react';
import {
  Search,
  Star,
  Calendar,
  Clock,
  MapPin,
  Check,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Building,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { Appointment, Doctor, User } from '../../types';
import { MedicareApiClient } from '../../services/api';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface BookAppointmentProps {
  currentUser: User;
  preSelectedDoctorId?: string;
  onBookingSuccess: (appointment: Appointment) => void;
  onCancel: () => void;
}

export const BookAppointment: React.FC<BookAppointmentProps> = ({
  currentUser,
  preSelectedDoctorId,
  onBookingSuccess,
  onCancel,
}) => {
  const doctors: Doctor[] = MedicareApiClient.getDoctors();

  // Stepper state: 1 = Select Doctor, 2 = Date & Time, 3 = Confirm Details
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(preSelectedDoctorId ? 2 : 1);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    preSelectedDoctorId || doctors[0].id
  );

  // Appointments state with live cloud sync
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    MedicareApiClient.getAppointments()
  );
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');

  // Booking fields
  const [currentCalendarDate, setCurrentCalendarDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'short' });
    const monthShort = now.toLocaleDateString('en-US', { month: 'short' });
    return `${dayName}, ${now.getDate()} ${monthShort} ${now.getFullYear()}`;
  });
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [reason, setReason] = useState('Routine Checkup & Clinical Consultation');
  const [paymentMethod, setPaymentMethod] = useState<'clinic' | 'online'>('clinic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  useEffect(() => {
    const loadApts = () => {
      setAppointments(MedicareApiClient.getAppointments());
    };
    loadApts();
    const unsubLocal = MedicareApiClient.subscribe(loadApts);

    try {
      const q = query(collection(db, 'appointments'));
      const unsubCloud = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          loadApts();
        }
      });
      return () => {
        unsubLocal();
        unsubCloud();
      };
    } catch {
      return () => unsubLocal();
    }
  }, []);

  const handlePrevMonth = () => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    setCurrentCalendarDate((prev) => {
      const prevMonth = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      if (prevMonth < currentMonthStart) return prev;
      return prevMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const checkDoctorAvailabilityForDate = (year: number, month: number, day: number) => {
    const dateObj = new Date(year, month, day);
    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const monthFormatted = (month + 1).toString().padStart(2, '0');
    const dayFormatted = day.toString().padStart(2, '0');
    const dateStr = `${year}-${monthFormatted}-${dayFormatted}`;

    try {
      const saved = localStorage.getItem(`medicare_doctor_schedule_${selectedDoctor.id}`);
      if (saved) {
        const config = JSON.parse(saved);
        if (config.overrides && config.overrides[dateStr]) {
          const ov = config.overrides[dateStr];
          if (ov.status !== 'Available') return false;
        }
        if (config.weekly && config.weekly[weekday]) {
          if (!config.weekly[weekday].isWorking) return false;
        }
        if (config.leaves) {
          const onLeave = config.leaves.some((l: any) => dateStr >= l.startDate && dateStr <= (l.endDate || l.startDate));
          if (onLeave) return false;
        }
        if (config.holidays) {
          const isHol = config.holidays.some((h: any) => h.startDate === dateStr);
          if (isHol) return false;
        }
      }
    } catch {}
    return true;
  };

  // Filtered doctor list
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept =
      selectedDepartment === 'All' || doc.department === selectedDepartment;
    const matchesLoc =
      selectedLocation === 'All' || doc.hospital === selectedLocation;

    return matchesSearch && matchesDept && matchesLoc;
  });

  const availableDates = [
    '12 October 2024',
    '13 October 2024',
    '14 October 2024',
    '15 October 2024',
    '16 October 2024',
  ];

  const normalizeDateString = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    }
    return dateStr.trim().toLowerCase();
  };

  const ALL_TIME_SLOTS = MedicareApiClient.getDoctorSlots(
    selectedDoctor.id,
    normalizeDateString(selectedDate)
  );

  const isSlotBooked = (slotTime: string) => {
    const normSelectedDate = normalizeDateString(selectedDate);
    const normSlot = slotTime.trim().toLowerCase();

    return appointments.some((app) => {
      if (app.status === 'Cancelled') return false;
      const docMatch =
        app.doctorId === selectedDoctor.id ||
        app.doctorName.toLowerCase().includes(selectedDoctor.name.toLowerCase()) ||
        selectedDoctor.name.toLowerCase().includes(app.doctorName.toLowerCase());

      const dateMatch = normalizeDateString(app.date) === normSelectedDate;
      const timeMatch = app.time.trim().toLowerCase() === normSlot;

      return docMatch && dateMatch && timeMatch;
    });
  };

  const unbookedSlots = ALL_TIME_SLOTS.filter((s) => !isSlotBooked(s));
  const areAllSlotsBooked = unbookedSlots.length === 0;

  useEffect(() => {
    if (isSlotBooked(selectedTime)) {
      if (unbookedSlots.length > 0) {
        setSelectedTime(unbookedSlots[0]);
      }
    }
  }, [selectedDate, selectedDoctorId, appointments]);

  const handleSelectDoctorAndContinue = (docId: string) => {
    setSelectedDoctorId(docId);
    setBookingError(null);
    setCurrentStep(2);
  };

  const handleConfirmBooking = () => {
    setBookingError(null);

    if (isSlotBooked(selectedTime)) {
      setBookingError(`The time slot '${selectedTime}' on ${selectedDate} is already booked. Please choose another slot.`);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const booked = MedicareApiClient.bookAppointment({
          doctorId: selectedDoctor.id,
          patientId: currentUser.id,
          patientName: currentUser.name,
          date: selectedDate,
          time: selectedTime,
          reason: reason || 'Consultation',
        });

        setIsSubmitting(false);
        onBookingSuccess(booked);
      } catch (err: any) {
        setIsSubmitting(false);
        setBookingError(err.message || 'Failed to book appointment. Slot may have been taken.');
      }
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Book an Appointment</h2>
        <p className="text-xs text-slate-500">
          Schedule a consultation with our verified clinical specialists
        </p>
      </div>

      {/* Stepper Header matching Screenshot 6 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep >= 1
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              1
            </div>
            <span
              className={`text-xs font-semibold ${
                currentStep === 1 ? 'text-slate-900' : 'text-slate-500'
              }`}
            >
              Select Doctor
            </span>
          </div>

          <div
            className={`flex-1 h-0.5 mx-4 ${
              currentStep > 1 ? 'bg-rose-600' : 'bg-slate-200'
            }`}
          ></div>

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep >= 2
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              2
            </div>
            <span
              className={`text-xs font-semibold ${
                currentStep === 2 ? 'text-slate-900' : 'text-slate-500'
              }`}
            >
              Choose Date & Time
            </span>
          </div>

          <div
            className={`flex-1 h-0.5 mx-4 ${
              currentStep > 2 ? 'bg-rose-600' : 'bg-slate-200'
            }`}
          ></div>

          {/* Step 3 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep === 3
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              3
            </div>
            <span
              className={`text-xs font-semibold ${
                currentStep === 3 ? 'text-slate-900' : 'text-slate-500'
              }`}
            >
              Confirm Details
            </span>
          </div>
        </div>
      </div>

      {/* STEP 1: Select Doctor matching Screenshot 6 */}
      {currentStep === 1 && (
        <div className="space-y-4">
          {/* Filters Bar matching Screenshot 6 */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctors..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 text-slate-800"
              />
            </div>

            {/* Select Department Dropdown */}
            <div className="sm:col-span-4">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                aria-label="Filter doctors by medical department"
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 text-slate-700 cursor-pointer"
              >
                <option value="All">Select Department (All)</option>
                <option value="Cardiology">Cardiology</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Dermatology">Dermatology</option>
              </select>
            </div>

            {/* Location Dropdown */}
            <div className="sm:col-span-3">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                aria-label="Filter doctors by hospital location"
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 text-slate-700 cursor-pointer"
              >
                <option value="All">Location (All)</option>
                <option value="City Care Hospital">City Care Hospital</option>
                <option value="HealthCare Hospital">HealthCare Hospital</option>
                <option value="LifeLine Hospital">LifeLine Hospital</option>
              </select>
            </div>
          </div>

          {/* Doctor Cards matching Screenshot 6 */}
          <div className="space-y-3">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Doctor Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{doc.name}</h4>
                    <p className="text-xs text-rose-600 font-semibold">{doc.specialty}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{doc.hospital}</p>
                  </div>
                </div>

                {/* Rating & Fee & Action */}
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span className="font-bold text-slate-800">{doc.rating}</span>
                    <span className="text-slate-400">({doc.reviewsCount} reviews)</span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900 tabular-nums">
                      ₹{doc.consultationFee}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectDoctorAndContinue(doc.id)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    View Slots
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Choose Date & Time (Screen 5) */}
      {currentStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Doctor Profile Card (Screen 5) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-start gap-4">
              <img
                src={selectedDoctor.avatar}
                alt={selectedDoctor.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
              />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">{selectedDoctor.name}</h3>
                <p className="text-xs text-rose-600 font-semibold">{selectedDoctor.specialty}</p>
                <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{selectedDoctor.rating}</span>
                  <span className="text-slate-400 font-normal">({selectedDoctor.reviewsCount} reviews)</span>
                </div>
                <div className="pt-1 text-sm font-extrabold text-slate-900">
                  ₹{selectedDoctor.consultationFee} <span className="text-xs text-slate-400 font-normal">Consultation Fee</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>{selectedDoctor.experienceYears}+ Years Experience</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 text-center font-bold text-rose-600">🗣</span>
                <span>English, Hindi</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>{selectedDoctor.hospital}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-900 block mb-1">About</span>
              <p className="text-xs text-slate-500 leading-relaxed">
                {selectedDoctor.about}
              </p>
            </div>

            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline block pt-1 cursor-pointer"
            >
              ← Choose another doctor
            </button>
          </div>

          {/* Right Column: Date, Time Slots, Consultation Type & Continue (Screen 5) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
            {/* Select Date with Interactive September 2026 Calendar Grid */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-900 block">Select Date</span>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                {(() => {
                  const currentYear = currentCalendarDate.getFullYear();
                  const currentMonth = currentCalendarDate.getMonth();
                  const monthNameLabel = currentCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  const firstDayOfWeekIndex = new Date(currentYear, currentMonth, 1).getDay();
                  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                  const emptyStartSlots = Array.from({ length: firstDayOfWeekIndex }, (_, i) => i);
                  const calendarDaysArray = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

                  return (
                    <>
                      <div className="flex items-center justify-between font-bold text-xs text-slate-800 mb-3">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-lg cursor-pointer transition-colors text-slate-700 font-bold"
                          title="Previous Month"
                        >
                          ‹
                        </button>
                        <span className="font-extrabold text-slate-900">{monthNameLabel}</span>
                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-lg cursor-pointer transition-colors text-slate-700 font-bold"
                          title="Next Month"
                        >
                          ›
                        </button>
                      </div>

                      {/* Days of week */}
                      <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 mb-2">
                        <span>Su</span>
                        <span>Mo</span>
                        <span>Tu</span>
                        <span>We</span>
                        <span>Th</span>
                        <span>Fr</span>
                        <span>Sa</span>
                      </div>

                      {/* Days numbers */}
                      <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {emptyStartSlots.map((i) => (
                          <span key={`empty-${i}`} className="py-1 text-slate-300"></span>
                        ))}
                        {calendarDaysArray.map((day) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);

                          const dateObj = new Date(currentYear, currentMonth, day);
                          dateObj.setHours(0, 0, 0, 0);

                          const isPastDate = dateObj.getTime() < today.getTime();
                          const isAvailable = checkDoctorAvailabilityForDate(currentYear, currentMonth, day);
                          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                          const monthShort = dateObj.toLocaleDateString('en-US', { month: 'short' });
                          const dateFormatted = `${dayName}, ${day} ${monthShort} ${currentYear}`;
                          const isSelected = selectedDate === dateFormatted;

                          if (isPastDate) {
                            return (
                              <div
                                key={day}
                                className="h-8 w-8 mx-auto rounded-full flex items-center justify-center font-normal text-slate-300 bg-slate-100/50 cursor-not-allowed text-xs"
                                title="Past date - Cannot book appointment"
                              >
                                {day}
                              </div>
                            );
                          }

                          if (!isAvailable) {
                            return (
                              <div
                                key={day}
                                className="h-8 w-8 mx-auto rounded-full flex items-center justify-center font-bold bg-rose-50 text-rose-600 cursor-not-allowed opacity-70 text-xs border border-rose-200"
                                title="Doctor not available / Weekly Off"
                              >
                                ❌
                              </div>
                            );
                          }

                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => setSelectedDate(dateFormatted)}
                              className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center font-medium transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-rose-600 text-white font-bold shadow-xs'
                                  : 'text-slate-700 hover:bg-rose-50 hover:text-rose-600 font-semibold'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Booking Error Banner if double booking occurs */}
            {bookingError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Select Time Slot */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 block">Select Time Slot</span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {unbookedSlots.length} of {ALL_TIME_SLOTS.length} slots available
                </span>
              </div>

              {areAllSlotsBooked ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900">
                  <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold">No Time Slots Available</h4>
                    <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                      All time slots for <strong>{selectedDoctor.name}</strong> on <strong>{selectedDate}</strong> have been booked by other patients. Please select another date on the calendar.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ALL_TIME_SLOTS.map((slot) => {
                    const booked = isSlotBooked(slot);
                    const isSelected = selectedTime === slot && !booked;

                    if (booked) {
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled
                          className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-xs font-semibold text-center cursor-not-allowed flex items-center justify-between opacity-75"
                          title="This slot is already booked by another patient"
                        >
                          <span className="line-through">{slot}</span>
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded-md">
                            Booked
                          </span>
                        </button>
                      );
                    }

                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-rose-600 border-rose-600 text-white shadow-xs font-bold ring-2 ring-rose-500/20'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-rose-50 hover:border-rose-300'
                        }`}
                      >
                        <span>{slot}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Consultation Type */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-900 block">Consultation Type</span>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-rose-200 bg-rose-50/40">
                  <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">In-Clinic Visit</span>
                    <span className="text-[11px] text-slate-500">Visit at hospital OPD counter</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleConfirmBooking}
              disabled={isSubmitting || areAllSlotsBooked || isSlotBooked(selectedTime)}
              className={`w-full py-3.5 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 ${
                areAllSlotsBooked || isSlotBooked(selectedTime)
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-rose-600 hover:bg-rose-700 hover:shadow-lg cursor-pointer'
              }`}
            >
              {isSubmitting
                ? 'Scheduling...'
                : areAllSlotsBooked
                ? 'No Slots Available for this Date'
                : 'Continue'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Confirm Details */}
      {currentStep === 3 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
          <div className="text-center pb-2">
            <h3 className="text-base font-bold text-slate-900">Review Booking Details</h3>
            <p className="text-xs text-slate-500">
              Please verify your appointment schedule before confirming.
            </p>
          </div>

          {/* Summary Box matching clinical style */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Specialist Doctor</span>
                <span className="font-bold text-slate-900 text-sm">{selectedDoctor.name}</span>
                <span className="text-slate-500 block text-xs">
                  {selectedDoctor.specialty} · {selectedDoctor.education}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Clinical Facility</span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedDoctor.hospital}
                </span>
                <span className="text-slate-500 block text-xs">Main OPD Wing, Counter 3</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Appointment Date</span>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-rose-600" />
                  {selectedDate}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Scheduled Time</span>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  {selectedTime}
                </span>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                <span className="text-slate-400 block text-[11px]">Reason for Consultation</span>
                <span className="font-medium text-slate-800">{reason}</span>
              </div>
            </div>
          </div>

          {/* Fee & Payment Method */}
          <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-rose-900 block">Total Consultation Fee</span>
              <span className="text-2xl font-extrabold text-rose-700 tabular-nums">
                ₹{selectedDoctor.consultationFee}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'clinic'}
                  onChange={() => setPaymentMethod('clinic')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span>Pay at Hospital Desk</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span>Pay Online (UPI / Card)</span>
              </label>
            </div>
          </div>

          {/* Navigation & Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <button
              onClick={handleConfirmBooking}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Confirming...' : 'Schedule Appointment'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
