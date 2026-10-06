import React, { useState } from 'react';
import { Search, Calendar, Clock, MapPin, X } from 'lucide-react';
import { Appointment, ViewMode } from '../../types';
import { MedicareApiClient } from '../../services/api';

interface AdminAppointmentManagementProps {
  onNavigate: (view: ViewMode) => void;
}

export const AdminAppointmentManagement: React.FC<AdminAppointmentManagementProps> = ({
  onNavigate,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>(
    MedicareApiClient.getAppointments()
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Upcoming' | 'Completed' | 'Pending' | 'Cancelled'>('All');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const filtered = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(search.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      apt.department.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hospital Appointment Registry</h2>
          <p className="text-xs text-slate-500">
            Real-time appointment ledger synced across all hospital OPD wards
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, doctor, or specialty..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-rose-400 text-slate-800"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 bg-white p-3 rounded-2xl border border-slate-200/90">
        {(['All', 'Upcoming', 'Completed', 'Pending', 'Cancelled'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === s
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                <th className="py-3 px-6">ID & Date</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Attending Doctor</th>
                <th className="py-3 px-4">Facility / Ward</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-6">
                    <span className="font-mono text-slate-400 text-[10px] block">{apt.id}</span>
                    <span className="font-semibold text-slate-800 tabular-nums">
                      {apt.date} · {apt.time}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{apt.patientName}</td>
                  <td className="py-3 px-4 text-slate-700">
                    <div>{apt.doctorName}</div>
                    <div className="text-[11px] text-rose-600 font-medium">{apt.department}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{apt.hospital}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                        apt.status
                      )}`}
                    >
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <button
                      onClick={() => setSelectedAppointment(apt)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 rounded-lg transition-colors cursor-pointer text-xs"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Appointment Audit Log</h4>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Appointment ID:</span>
                <span className="font-mono text-slate-900">{selectedAppointment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Patient:</span>
                <span className="font-bold text-slate-900">{selectedAppointment.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Doctor:</span>
                <span className="font-bold text-slate-900">{selectedAppointment.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="text-slate-900">{selectedAppointment.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hospital:</span>
                <span className="text-slate-900">{selectedAppointment.hospital}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Consultation Fee:</span>
                <span className="font-bold text-slate-900">₹{selectedAppointment.fee}</span>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
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
