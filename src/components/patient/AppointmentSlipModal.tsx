import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  ShieldCheck,
  User,
  Building2,
  FileCheck,
  QrCode,
  Loader2,
} from 'lucide-react';
import { Appointment, User as PatientUser } from '../../types';
import { exportElementToPdf, generateAppointmentSlipPdf } from '../../utils/pdfGenerator';

interface AppointmentSlipModalProps {
  appointment: Appointment;
  currentUser?: PatientUser | null;
  onClose: () => void;
}

export const AppointmentSlipModal: React.FC<AppointmentSlipModalProps> = ({
  appointment,
  currentUser,
  onClose,
}) => {
  const slipRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Breakdown calculations
  const fee = appointment.fee || 500;
  const docFee = Math.round(fee * 0.8);
  const vitalsFee = Math.round(fee * 0.15);
  const vaultFee = fee - docFee - vitalsFee;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      if (slipRef.current) {
        // High fidelity export of the rendered slip
        await exportElementToPdf(slipRef.current, `MedDesk_Slip_${appointment.id}.pdf`);
      } else {
        // Fallback to programmatic generator
        generateAppointmentSlipPdf(appointment, currentUser);
      }
    } catch (err) {
      console.error('Failed to export DOM to PDF, falling back to programmatic PDF:', err);
      generateAppointmentSlipPdf(appointment, currentUser);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto print:shadow-none print:border-none print:max-w-none print:rounded-none">
        
        {/* Top Modal Action Bar - Hidden in Print */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white text-sm">
              +
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">Official OPD Consultation & Billing Slip</h3>
              <p className="text-[11px] text-slate-400">PDF Reference Slip · {appointment.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-700"
              title="Print Slip"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
              title="Download as Official PDF"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Slip Body */}
        <div className="max-h-[85vh] overflow-y-auto p-4 sm:p-8 print:max-h-none print:overflow-visible print:p-6 bg-slate-100/60">
          <div
            ref={slipRef}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 text-slate-800 font-sans print:border-none print:shadow-none print:p-0"
          >
            {/* Top Red Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700 rounded-full" />

            {/* 1. Header Section matching Template */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
              {/* Brand Logo & Details */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-200 shrink-0">
                  <div className="relative flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                      Med<span className="text-rose-600">Desk</span>
                    </h2>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-md">
                      NABH Accredited
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Better Care, Better Health · Multispecialty Clinical Network
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Reg No: MC-DL-88219 · GSTIN: 07AAACH2412Q1ZX
                  </p>
                </div>
              </div>

              {/* Slip Metadata */}
              <div className="text-left sm:text-right space-y-1">
                <span className="inline-block text-[11px] font-bold tracking-wider uppercase text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                  OPD Consultation & Billing Slip
                </span>
                <p className="text-xs font-mono font-bold text-slate-900">
                  Slip No: SLIP-{appointment.id.toUpperCase()}
                </p>
                <p className="text-[11px] text-slate-500">
                  Date: <strong className="text-slate-700">{appointment.date}</strong> | Time: <strong className="text-slate-700">{appointment.time}</strong>
                </p>
              </div>
            </div>

            {/* 2. Status Ribbon */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50/90 border border-emerald-200/90 rounded-xl text-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Payment Status: PAID & CONFIRMED (CASH ON DESK)
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 hidden sm:inline">
                Token / Booking Ref #{appointment.id}
              </span>
            </div>

            {/* 3. Two Column Patient & Consultation Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Patient Info Card */}
              <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-4 space-y-2.5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/70 text-rose-600">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Patient Information
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-y-1.5 text-xs">
                  <span className="text-slate-400 font-medium">Name:</span>
                  <span className="col-span-2 font-bold text-slate-900">{appointment.patientName}</span>

                  <span className="text-slate-400 font-medium">UHID / ID:</span>
                  <span className="col-span-2 font-mono font-medium text-slate-700">
                    UHID-{appointment.patientId.slice(0, 8).toUpperCase()}
                  </span>

                  <span className="text-slate-400 font-medium">Contact:</span>
                  <span className="col-span-2 font-medium text-slate-700">
                    {currentUser?.phone || '+91 98765 43210'}
                  </span>

                  <span className="text-slate-400 font-medium">Email:</span>
                  <span className="col-span-2 font-medium text-slate-700 truncate">
                    {appointment.patientEmail || currentUser?.email || 'patient@meddesk.com'}
                  </span>

                  <span className="text-slate-400 font-medium">Age / Sex:</span>
                  <span className="col-span-2 font-medium text-slate-700">
                    {currentUser?.gender ? `${currentUser.gender}` : 'Adult'} · Blood: {currentUser?.bloodGroup || 'O+'}
                  </span>
                </div>
              </div>

              {/* Consultation Details Card */}
              <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-4 space-y-2.5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/70 text-rose-600">
                  <Building2 className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Consultation & Doctor Details
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-y-1.5 text-xs">
                  <span className="text-slate-400 font-medium">Doctor:</span>
                  <span className="col-span-2 font-bold text-slate-900">{appointment.doctorName}</span>

                  <span className="text-slate-400 font-medium">Specialty:</span>
                  <span className="col-span-2 font-medium text-slate-700">{appointment.department}</span>

                  <span className="text-slate-400 font-medium">Hospital:</span>
                  <span className="col-span-2 font-medium text-slate-700">{appointment.hospital}</span>

                  <span className="text-slate-400 font-medium">OPD Room:</span>
                  <span className="col-span-2 font-medium text-slate-700">
                    Counter 03 · Consultation Room 204
                  </span>

                  <span className="text-slate-400 font-medium">Appointment:</span>
                  <span className="col-span-2 font-medium text-slate-900 font-semibold">
                    {appointment.date} at {appointment.time}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Itemized Charges Table matching Template */}
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-semibold">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Service / Description</th>
                    <th className="py-2.5 px-3 w-28">Category</th>
                    <th className="py-2.5 px-3 w-14 text-center">Qty</th>
                    <th className="py-2.5 px-3 w-24 text-right">Rate</th>
                    <th className="py-2.5 px-3 w-28 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 text-center font-medium text-slate-500">1</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">Doctor Specialist Consultation</div>
                      <div className="text-[11px] text-slate-500">
                        OPD clinical evaluation and care plan by {appointment.doctorName}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">OPD Clinical</td>
                    <td className="py-3 px-3 text-center font-medium text-slate-700">1</td>
                    <td className="py-3 px-3 text-right text-slate-700 tabular-nums">₹{docFee}.00</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">₹{docFee}.00</td>
                  </tr>

                  <tr className="bg-slate-50/40 hover:bg-slate-50/70">
                    <td className="py-3 px-3 text-center font-medium text-slate-500">2</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">Clinical Vitals & Triage Assessment</div>
                      <div className="text-[11px] text-slate-500">
                        Blood Pressure, SpO2, Heart Rate, Temperature & BMI Screening
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">Diagnostics</td>
                    <td className="py-3 px-3 text-center font-medium text-slate-700">1</td>
                    <td className="py-3 px-3 text-right text-slate-700 tabular-nums">₹{vitalsFee}.00</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">₹{vitalsFee}.00</td>
                  </tr>

                  <tr className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 text-center font-medium text-slate-500">3</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">Digital EHR & Secure Record Archival</div>
                      <div className="text-[11px] text-slate-500">
                        Encrypted cloud health vault storage and e-prescription generation
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">Digital Vault</td>
                    <td className="py-3 px-3 text-center font-medium text-slate-700">1</td>
                    <td className="py-3 px-3 text-right text-slate-700 tabular-nums">₹{vaultFee}.00</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">₹{vaultFee}.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 5. Payment Details Box (Left) & Billing Summary (Right) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Payment Details Box */}
              <div className="sm:col-span-7 bg-slate-50/80 rounded-xl border border-slate-200/80 p-4 space-y-2">
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200/70 text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Payment Verification & Gateway Info
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-y-1.5 text-xs">
                  <span className="text-slate-400 font-medium">Payment Mode:</span>
                  <span className="col-span-2 font-bold text-slate-800">Cash on Desk (Counter Payment)</span>

                  <span className="text-slate-400 font-medium">Receipt ID:</span>
                  <span className="col-span-2 font-mono font-medium text-slate-800 truncate">
                    CSH/MC-{appointment.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase()}-9821
                  </span>

                  <span className="text-slate-400 font-medium">Payment Status:</span>
                  <span className="col-span-2 text-emerald-700 font-bold inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    PAID IN FULL (SUCCESS)
                  </span>

                  <span className="text-slate-400 font-medium">Timestamp:</span>
                  <span className="col-span-2 text-slate-600 font-mono text-[11px]">
                    {appointment.date} · {appointment.time}
                  </span>
                </div>
              </div>

              {/* Billing Summary Box */}
              <div className="sm:col-span-5 bg-slate-50/80 rounded-xl border border-slate-200/80 p-4 space-y-2.5">
                <div className="space-y-1.5 text-xs border-b border-slate-200/70 pb-2">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-800 tabular-nums">₹{fee}.00</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>GST (Healthcare Exempted)</span>
                    <span className="font-semibold text-slate-800 tabular-nums">₹0.00</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Special Privilege Discount</span>
                    <span className="font-semibold tabular-nums">-₹0.00</span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="flex items-center justify-between p-2.5 bg-rose-50 border border-rose-200/80 rounded-lg">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-900">
                    Total Paid
                  </span>
                  <span className="text-base font-extrabold text-rose-600 tabular-nums">
                    ₹{fee}.00
                  </span>
                </div>
              </div>
            </div>

            {/* 6. Important Instructions */}
            <div className="bg-rose-50/70 rounded-xl border border-rose-200/70 p-4 space-y-1.5 text-xs text-rose-950">
              <div className="font-bold uppercase tracking-wider text-[11px] text-rose-700 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4" />
                <span>Important Patient Instructions</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                <li>Please report to the hospital OPD Desk at least 15 minutes before your scheduled appointment time.</li>
                <li>Present this confirmation slip (digital or printed) at Counter 03 for token validation and priority entry.</li>
                <li>Carry prior prescriptions, diagnostic test records, and valid government-issued photo identification.</li>
                <li>Emergency Helpline: <strong>1800-419-5566</strong> | 24x7 Ambulance Dispatch: <strong>108</strong>.</li>
              </ol>
            </div>

            {/* 7. Verification Stamp & Signatures Section */}
            <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-slate-200 text-xs">
              {/* Digital Stamp */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-rose-400 bg-rose-50/60 p-1 flex flex-col items-center justify-center text-center">
                  <QrCode className="w-8 h-8 text-rose-600" />
                  <span className="text-[8px] font-bold text-rose-700 uppercase tracking-tighter">
                    VERIFIED
                  </span>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900">
                    MedDesk Verified Digital Record
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Cryptographically signed with SHA-256
                  </p>
                  <p className="text-[9px] font-mono text-slate-400">
                    UUID: {appointment.id}
                  </p>
                </div>
              </div>

              {/* Authorized Signatory */}
              <div className="text-left sm:text-right space-y-0.5">
                <div className="font-serif italic text-base text-slate-800 font-bold tracking-wide">
                  Dr. A. K. Verma
                </div>
                <div className="text-[11px] font-bold text-slate-900">
                  Medical Superintendent & Billing Officer
                </div>
                <div className="text-[10px] text-slate-500">
                  City Care Multispecialty Hospitals & Research Centre
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 text-center text-[10px] text-slate-400">
              This is an authentic computer-generated clinical consultation slip powered by MedDesk Digital Hospital System. No physical signature is required.
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Valid for clinical follow-up within 7 calendar days</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF Form</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
