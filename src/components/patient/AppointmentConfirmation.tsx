import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  HeartPulse,
  Download,
  CalendarCheck2,
  ArrowRight,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Appointment, User, ViewMode } from '../../types';
import { generateAppointmentSlipPdf } from '../../utils/pdfGenerator';
import { AppointmentSlipModal } from './AppointmentSlipModal';

interface AppointmentConfirmationProps {
  appointment: Appointment;
  currentUser?: User | null;
  onNavigate: (view: ViewMode) => void;
}

export const AppointmentConfirmation: React.FC<AppointmentConfirmationProps> = ({
  appointment,
  currentUser,
  onNavigate,
}) => {
  const [showSlipModal, setShowSlipModal] = useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#E11D48', '#0EA5E9', '#10B981'],
      });
    } catch {
      // Ignore if confetti not supported
    }
  }, []);

  const handleDownloadSlip = () => {
    generateAppointmentSlipPdf(appointment, currentUser);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden text-center p-8 sm:p-10 space-y-8">
        {/* Success Icon Checkmark (Screen 6) */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-200">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Title and subtitle (Screen 6) */}
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Appointment Confirmed!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Your appointment has been successfully scheduled.
          </p>
        </div>

        {/* Summary Card (Screen 6) */}
        <div className="bg-slate-50 rounded-3xl border border-slate-200/90 p-6 text-left space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-200/70">
            <img
              src={appointment.doctorAvatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
              alt={appointment.doctorName}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-2xs"
            />
            <div>
              <h4 className="text-base font-bold text-slate-900">{appointment.doctorName}</h4>
              <p className="text-xs text-rose-600 font-semibold">{appointment.department}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">Date</span>
                <span className="font-bold text-slate-900">{appointment.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">Time</span>
                <span className="font-bold text-slate-900">{appointment.time}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">Type</span>
                <span className="font-bold text-slate-900">Text Consultation</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-4 h-4 text-center font-bold text-slate-400">₹</span>
              <div>
                <span className="text-slate-400 block text-[10px]">Consultation Fee</span>
                <span className="font-bold text-slate-900">₹{appointment.fee || 500}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons (Screen 6: Add to Calendar & Go to Dashboard) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              const text = `Appointment with ${appointment.doctorName} on ${appointment.date} at ${appointment.time}`;
              const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}`;
              window.open(googleCalUrl, '_blank');
            }}
            className="w-full sm:w-1/2 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-2xl shadow-2xs transition-colors cursor-pointer text-center"
          >
            Add to Calendar
          </button>

          <button
            onClick={() => onNavigate('patient-dashboard')}
            className="w-full sm:w-1/2 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer text-center"
          >
            Go to Dashboard
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 pt-1 text-xs">
          <button
            onClick={() => setShowSlipModal(true)}
            className="text-rose-600 font-semibold hover:underline cursor-pointer flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View OPD Slip</span>
          </button>
          <span className="text-slate-300">·</span>
          <button
            onClick={handleDownloadSlip}
            className="text-slate-500 font-semibold hover:text-slate-800 cursor-pointer flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Official OPD Consultation Slip Modal (matching template reference) */}
      {showSlipModal && (
        <AppointmentSlipModal
          appointment={appointment}
          currentUser={currentUser}
          onClose={() => setShowSlipModal(false)}
        />
      )}
    </div>
  );
};
