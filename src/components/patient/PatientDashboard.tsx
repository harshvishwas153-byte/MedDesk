import React, { useState } from 'react';
import {
  Calendar,
  CalendarCheck,
  FileText,
  Clock,
  MapPin,
  CalendarPlus,
  UserCheck,
  ExternalLink,
  X,
  Phone,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Upload,
  ChevronRight,
  ArrowRight,
  Star,
  Video,
} from 'lucide-react';
import { Appointment, Doctor, MedicalRecord, User, ViewMode } from '../../types';
import { MedicareApiClient } from '../../services/api';
import { AppointmentSlipModal } from './AppointmentSlipModal';
import { EXPERT_CARE_BANNER, DR_SARAH_IMAGE } from '../../data/initialData';

interface PatientDashboardProps {
  currentUser: User;
  onNavigate: (view: ViewMode) => void;
  onSelectDoctorToBook: (doctorId: string) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  currentUser,
  onNavigate,
  onSelectDoctorToBook,
}) => {
  const appointments = MedicareApiClient.getAppointmentsByPatient(currentUser.id);
  const records = MedicareApiClient.getRecords(currentUser.id);
  const doctors = MedicareApiClient.getDoctors();

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Upcoming':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Derive stats
  const upcomingAppointments = appointments.filter((a) => a.status === 'Upcoming');
  const primaryAppointment = upcomingAppointments[0] || appointments[0];

  const currentHour = new Date().getHours();
  const timeGreeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';
  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Patient';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Greeting (Screen 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{timeGreeting}, {firstName}</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Take care of your health today
          </p>
        </div>
      </div>

      {/* 2. Top 4 Action Cards Grid (Screen 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Book Appointment */}
        <button
          onClick={() => onNavigate('patient-book')}
          className="p-3.5 sm:p-4 bg-white hover:bg-rose-50/40 border border-slate-200/90 hover:border-rose-200 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex items-center gap-3 cursor-pointer group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block leading-tight">
              Book Appointment
            </span>
            <span className="text-[10px] text-slate-400">Doctor slots</span>
          </div>
        </button>

        {/* Chat with Doctor */}
        <button
          onClick={() => onNavigate('patient-consultation')}
          className="p-3.5 sm:p-4 bg-white hover:bg-rose-50/40 border border-slate-200/90 hover:border-rose-200 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex items-center gap-3 cursor-pointer group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block leading-tight">
              Chat with Doctor
            </span>
            <span className="text-[10px] text-slate-400">Instant consultation</span>
          </div>
        </button>

        {/* Upload Report */}
        <button
          onClick={() => setIsUploadOpen(true)}
          className="p-3.5 sm:p-4 bg-white hover:bg-rose-50/40 border border-slate-200/90 hover:border-rose-200 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex items-center gap-3 cursor-pointer group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Upload className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block leading-tight">
              Upload Report
            </span>
            <span className="text-[10px] text-slate-400">Add medical files</span>
          </div>
        </button>

        {/* Medical Records */}
        <button
          onClick={() => onNavigate('patient-records')}
          className="p-3.5 sm:p-4 bg-white hover:bg-rose-50/40 border border-slate-200/90 hover:border-rose-200 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex items-center gap-3 cursor-pointer group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block leading-tight">
              Medical Records
            </span>
            <span className="text-[10px] text-slate-400">Prescriptions & reports</span>
          </div>
        </button>
      </div>

      {/* 3. Main Split Grid (Screen 2: Promo & Upcoming on Left, Health Summary & Quick Actions on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Promo Card: Expert Care At Your Fingertips */}
          <div className="relative rounded-3xl overflow-hidden shadow-lg bg-gradient-to-r from-rose-950 via-red-900 to-rose-800 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-rose-900/50">
            <div className="space-y-3 z-10 max-w-md">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                Expert Care <br />
                At Your Fingertips
              </h2>
              <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed">
                Trusted doctors, quick consultation and complete medical support.
              </p>
              <div className="pt-1">
                <button
                  onClick={() => onNavigate('patient-book')}
                  className="px-5 py-2.5 bg-white text-rose-600 hover:bg-rose-50 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Doctor Photo in Promo Banner */}
            <div className="relative w-44 sm:w-56 h-36 sm:h-44 shrink-0 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
              <img
                src={EXPERT_CARE_BANNER}
                alt="Expert Medical Care"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rose-950/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Upcoming Appointment Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Upcoming Appointment</h3>
              <button
                onClick={() => onNavigate('patient-appointments')}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                View All
              </button>
            </div>

            {primaryAppointment ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <img
                    src={primaryAppointment.doctorAvatar || DR_SARAH_IMAGE}
                    alt={primaryAppointment.doctorName}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {primaryAppointment.doctorName || 'Dr. Sarah Johnson'}
                      </h4>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-200">
                        ● Confirmed
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <span>{primaryAppointment.department || 'General Physician'}</span>
                      <span>·</span>
                      <span className="text-amber-500 font-bold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400" /> 4.8
                      </span>
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {primaryAppointment.date || 'Wed, 17 Sep 2026'}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {primaryAppointment.time || '10:00 AM - 10:30 AM'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Join Chat (Red) & View Details (Outline) */}
                <div className="flex sm:flex-col items-stretch sm:items-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                  <button
                    onClick={() => onNavigate('patient-consultation')}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Join Chat</span>
                  </button>
                  <button
                    onClick={() => setSelectedAppointment(primaryAppointment)}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No scheduled appointments.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols on lg: Quick Actions List) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions List Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 mb-2">Quick Actions</h3>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('patient-records')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-rose-50/40 border border-slate-100 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">View Prescriptions</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
              </button>

              <button
                onClick={() => setIsUploadOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-rose-50/40 border border-slate-100 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Upload Report</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('patient-consultation')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-rose-50/40 border border-slate-100 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Text Consultation</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Report Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Upload Medical Report</h4>
              </div>
              <button
                onClick={() => {
                  setIsUploadOpen(false);
                  setUploadSuccess(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {uploadSuccess ? (
                <div className="text-center py-6 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h5 className="font-bold text-slate-900">Report Uploaded Successfully!</h5>
                  <p className="text-xs text-slate-500">
                    Your report has been encrypted and added to your Medical Records.
                  </p>
                  <button
                    onClick={() => {
                      setIsUploadOpen(false);
                      setUploadSuccess(false);
                    }}
                    className="mt-4 px-5 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="border-2 border-dashed border-slate-300 hover:border-rose-400 rounded-2xl p-6 text-center transition-colors cursor-pointer bg-slate-50">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs font-bold text-slate-800 block">
                      Choose PDF, JPG or PNG report
                    </span>
                    <span className="text-[10px] text-slate-400">Up to 15MB · HIPAA Secure</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Report Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Complete Blood Count (CBC) Test"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setIsUploadOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setUploadSuccess(true)}
                      className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
                    >
                      Upload & Save
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Recent Appointments Table matching Screenshot 3 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden block">
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 flex items-center justify-between border-b border-slate-100 sm:border-b-0">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Appointments</h3>
            <p className="text-[11px] text-slate-400 sm:hidden">No horizontal scrolling needed · Tap to inspect</p>
          </div>
          <button
            onClick={() => onNavigate('patient-appointments')}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
          >
            View All ({appointments.length})
          </button>
        </div>

        {/* Mobile Fluid Card View: Zero Horizontal Scroll */}
        <div className="sm:hidden divide-y divide-slate-100">
          {appointments.slice(0, 5).map((apt) => (
            <div
              key={apt.id}
              onClick={() => setSelectedAppointment(apt)}
              className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={apt.doctorAvatar || doctors[0].avatar}
                  alt={apt.doctorName}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{apt.doctorName}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{apt.department} · {apt.date}</p>
                  <p className="text-[10px] text-slate-400">{apt.time}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                    apt.status
                  )}`}
                >
                  {apt.status}
                </span>
                <span className="text-[11px] font-semibold text-rose-600">Details →</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Full Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-xs border-collapse">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50/80 text-slate-500 font-semibold">
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Doctor</th>
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.slice(0, 5).map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-6 font-medium text-slate-800 tabular-nums">
                    {apt.date}
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={apt.doctorAvatar || doctors[0].avatar}
                        alt={apt.doctorName}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <span className="font-semibold text-slate-900">{apt.doctorName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 text-slate-600">{apt.department}</td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                        apt.status
                      )}`}
                    >
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => setSelectedAppointment(apt)}
                      className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 rounded-lg transition-colors cursor-pointer text-xs"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Appointment Details</h4>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedAppointment.doctorAvatar || doctors[0].avatar}
                  alt={selectedAppointment.doctorName}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h5 className="font-bold text-base text-slate-900">
                    {selectedAppointment.doctorName}
                  </h5>
                  <p className="text-xs text-rose-600 font-medium">
                    {selectedAppointment.department}
                  </p>
                  <p className="text-xs text-slate-500">{selectedAppointment.hospital}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Appointment Date</span>
                  <span className="font-bold text-slate-800">{selectedAppointment.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Scheduled Time</span>
                  <span className="font-bold text-slate-800">{selectedAppointment.time}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Reason for Visit</span>
                  <span className="font-bold text-slate-800">{selectedAppointment.reason}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Consultation Fee</span>
                  <span className="font-bold text-slate-800">₹{selectedAppointment.fee}</span>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <div className="font-bold mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Doctor's Instructions
                  </div>
                  <p>{selectedAppointment.notes}</p>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Close
                </button>
                {selectedAppointment.status === 'Upcoming' && (
                  <button
                    onClick={() => {
                      MedicareApiClient.updateAppointmentStatus(
                        selectedAppointment.id,
                        'Cancelled'
                      );
                      setSelectedAppointment(null);
                      window.location.reload();
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
