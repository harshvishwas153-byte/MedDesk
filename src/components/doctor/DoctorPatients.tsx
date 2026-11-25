import React, { useState, useEffect } from 'react';
import { Search, FileText, ChevronRight, X, Plus, AlertCircle, Users } from 'lucide-react';
import { MedicalRecord, User, ViewMode } from '../../types';
import { MedicareApiClient } from '../../services/api';

interface DoctorPatientsProps {
  onNavigate: (view: ViewMode) => void;
}

export const DoctorPatients: React.FC<DoctorPatientsProps> = () => {
  const [users, setUsers] = useState<User[]>(() =>
    MedicareApiClient.getUsers().filter((u) => u.role === 'PATIENT')
  );
  const [records, setRecords] = useState<MedicalRecord[]>(() => MedicareApiClient.getRecords());
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);

  const [showAddRecord, setShowAddRecord] = useState(false);
  const [recordTitle, setRecordTitle] = useState('');
  const [recordCategory, setRecordCategory] = useState<MedicalRecord['category']>('Consultations');
  const [recordNotes, setRecordNotes] = useState('');
  const [recordError, setRecordError] = useState<string | null>(null);
  const [isSavingRecord, setIsSavingRecord] = useState(false);

  useEffect(() => {
    const sync = () => {
      setUsers(MedicareApiClient.getUsers().filter((u) => u.role === 'PATIENT'));
      setRecords(MedicareApiClient.getRecords());
    };
    sync();
    return MedicareApiClient.subscribe(sync);
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const patientRecords = selectedPatient
    ? records.filter((r) => r.patientId === selectedPatient.id)
    : [];

  const handleAddClinicalRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setRecordError(null);
    if (!recordTitle.trim() || !recordNotes.trim()) {
      setRecordError('Title and clinical findings are required.');
      return;
    }

    const currentDoc = MedicareApiClient.getCurrentUser();
    setIsSavingRecord(true);
    try {
      await MedicareApiClient.uploadRecord({
        patientId: selectedPatient.id,
        title: recordTitle.trim(),
        date: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        category: recordCategory,
        fileType: 'PDF',
        fileSize: '1.2 MB',
        doctorName: currentDoc?.name || 'Attending Physician',
        facility: currentDoc?.hospital || 'MedDesk Clinical OPD',
        notes: recordNotes.trim(),
      });
      setRecordTitle('');
      setRecordNotes('');
      setShowAddRecord(false);
    } catch (err) {
      setRecordError((err as Error).message || 'Failed to save clinical record.');
    } finally {
      setIsSavingRecord(false);
    }
  };

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

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
          <Users className="w-9 h-9 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-800">No Registered Patients Found</p>
          <p className="text-xs text-slate-500">
            Patients who register on the portal or book appointments will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((patient) => (
            <div
              key={patient.id}
              onClick={() => {
                setSelectedPatient(patient);
                setShowAddRecord(false);
                setRecordError(null);
              }}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={patient.avatar}
                  alt={patient.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{patient.name}</h4>
                  <span className="text-[11px] text-slate-400 font-mono block truncate">
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
      )}

      {/* Patient Dossier Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h4 className="text-sm font-bold text-slate-900">Patient Medical Profile</h4>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
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
                    Phone: {selectedPatient.phone || 'Not specified'}
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
                    {selectedPatient.gender || 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Account State</span>
                  <span className="font-bold text-emerald-600">{selectedPatient.status}</span>
                </div>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-xs text-rose-900 space-y-1.5">
                <div className="font-bold">Allergies, Conditions & Emergency Contact</div>
                <p>
                  <strong>Allergies:</strong> {selectedPatient.allergies || 'None reported'}
                </p>
                <p>
                  <strong>Conditions:</strong> {selectedPatient.medicalConditions || 'No chronic conditions logged'}
                </p>
                {(selectedPatient.emergencyContactName || selectedPatient.emergencyContactPhone) && (
                  <p>
                    <strong>Emergency Contact:</strong> {selectedPatient.emergencyContactName || 'Contact'}{' '}
                    {selectedPatient.emergencyContactPhone ? `(${selectedPatient.emergencyContactPhone})` : ''}
                  </p>
                )}
              </div>

              {/* Clinical Records Section */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    EHR Health Records ({patientRecords.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddRecord((v) => !v)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg border border-rose-200 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddRecord ? 'Cancel' : 'Add Clinical Record'}</span>
                  </button>
                </div>

                {showAddRecord && (
                  <form onSubmit={handleAddClinicalRecord} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                    {recordError && (
                      <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{recordError}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        value={recordTitle}
                        onChange={(e) => setRecordTitle(e.target.value)}
                        placeholder="Record title (e.g. ECG Evaluation)"
                        className="p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-rose-400"
                      />
                      <select
                        value={recordCategory}
                        onChange={(e) => setRecordCategory(e.target.value as MedicalRecord['category'])}
                        className="p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-rose-400"
                      >
                        <option value="Consultations">Consultations</option>
                        <option value="Prescriptions">Prescriptions</option>
                        <option value="Test Reports">Test Reports</option>
                      </select>
                    </div>
                    <textarea
                      rows={2}
                      required
                      value={recordNotes}
                      onChange={(e) => setRecordNotes(e.target.value)}
                      placeholder="Clinical observations, vitals, or summary..."
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-rose-400"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSavingRecord}
                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-bold rounded-lg cursor-pointer"
                      >
                        {isSavingRecord ? 'Saving...' : 'Save to Vault'}
                      </button>
                    </div>
                  </form>
                )}

                {patientRecords.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-xl">
                    No records archived for this patient yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {patientRecords.map((rec) => (
                      <div key={rec.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-rose-600" />
                            {rec.title}
                          </span>
                          <span className="text-[10px] text-slate-400">{rec.date}</span>
                        </div>
                        <p className="text-slate-600 mt-1">{rec.notes}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
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
