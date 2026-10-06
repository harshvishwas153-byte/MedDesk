import React, { useState } from 'react';
import { Search, User as UserIcon, FileText, Phone, Mail, ChevronRight, X } from 'lucide-react';
import { MedicalRecord, User, ViewMode } from '../../types';
import { MedicareApiClient } from '../../services/api';

interface DoctorPatientsProps {
  onNavigate: (view: ViewMode) => void;
}

export const DoctorPatients: React.FC<DoctorPatientsProps> = ({
  onNavigate,
}) => {
  const users = MedicareApiClient.getUsers().filter((u) => u.role === 'PATIENT');
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Patient Clinical Directory</h2>
          <p className="text-xs text-slate-500">
            View patient health dossiers, historical consultation records, and vital stats
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-rose-400 text-slate-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((patient) => (
          <div
            key={patient.id}
            onClick={() => setSelectedPatient(patient)}
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center gap-3 mb-4">
              <img
                src={patient.avatar}
                alt={patient.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900">{patient.name}</h4>
                <span className="text-[11px] text-slate-400 font-mono block">
                  {patient.email}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Blood Group</span>
                <span className="font-semibold text-slate-800">{patient.bloodGroup || 'O+'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Status</span>
                <span className="font-semibold text-emerald-600">{patient.status}</span>
              </div>
            </div>

            <div className="mt-4 pt-2 text-right">
              <span className="text-xs font-semibold text-rose-600 hover:underline inline-flex items-center gap-1">
                <span>View Full Dossier</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Patient Dossier Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Patient Medical Profile</h4>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedPatient.avatar}
                  alt={selectedPatient.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <h5 className="font-bold text-base text-slate-900">{selectedPatient.name}</h5>
                  <p className="text-xs text-slate-500 font-mono">{selectedPatient.email}</p>
                  <p className="text-xs text-rose-600 font-medium">
                    Phone: {selectedPatient.phone || '+91 98765 43210'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl text-xs text-center">
                <div>
                  <span className="text-slate-400 block text-[10px]">Blood Type</span>
                  <span className="font-bold text-slate-800">
                    {selectedPatient.bloodGroup || 'O+'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Gender</span>
                  <span className="font-bold text-slate-800">
                    {selectedPatient.gender || 'Male'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Account State</span>
                  <span className="font-bold text-emerald-600">{selectedPatient.status}</span>
                </div>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-xs text-rose-900">
                <div className="font-bold mb-1">Clinical History Notes</div>
                <p>
                  Patient has routine checkups for mild seasonal viral and cardiovascular review.
                  Normal blood sugar and stable baseline ECG.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
