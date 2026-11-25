<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
=======
import React, { useState } from 'react';
>>>>>>> origin/main
import {
  FileText,
  Upload,
  Download,
<<<<<<< HEAD
  X,
  Trash2,
  AlertCircle,
=======
  Eye,
  Plus,
  X,
  FileCheck,
  Calendar,
  Building,
  CheckCircle,
  FileSpreadsheet,
>>>>>>> origin/main
} from 'lucide-react';
import { MedicalRecord, User } from '../../types';
import { MedicareApiClient } from '../../services/api';
import { generateMedicalRecordPdf } from '../../utils/pdfGenerator';

interface MedicalHistoryProps {
  currentUser: User;
}

export const MedicalHistory: React.FC<MedicalHistoryProps> = ({
  currentUser,
}) => {
  const [records, setRecords] = useState<MedicalRecord[]>(
    MedicareApiClient.getRecords(currentUser.id)
  );
  const [selectedFilter, setSelectedFilter] = useState<
    'All Records' | 'Prescriptions' | 'Test Reports' | 'Consultations'
  >('All Records');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<
    'Prescriptions' | 'Test Reports' | 'Consultations'
  >('Test Reports');
  const [newDoctorName, setNewDoctorName] = useState('Dr. Priya Sharma');
  const [newNotes, setNewNotes] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
<<<<<<< HEAD
  const [selectedFileType, setSelectedFileType] = useState('PDF');
  const [selectedFileSize, setSelectedFileSize] = useState('1.4 MB');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const sync = () => setRecords(MedicareApiClient.getRecords(currentUser.id));
    sync();
    return MedicareApiClient.subscribe(sync);
  }, [currentUser.id]);
=======
>>>>>>> origin/main

  // Filter records
  const filteredRecords = records.filter((rec) => {
    if (selectedFilter === 'All Records') return true;
    return rec.category === selectedFilter;
  });

  const handleDownload = (rec: MedicalRecord) => {
    generateMedicalRecordPdf(rec, currentUser);
  };

<<<<<<< HEAD
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['pdf', 'png', 'jpg', 'jpeg'].includes(ext)) {
      setUploadError('Unsupported file type. Please select a PDF, PNG, or JPG file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds the 10 MB limit.');
      return;
    }
    setSelectedFileName(file.name);
    setSelectedFileType(ext.toUpperCase());
    const mb = file.size / (1024 * 1024);
    setSelectedFileSize(mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`);
    if (!newTitle.trim()) {
      setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      await MedicareApiClient.deleteRecord(recordId);
      setSelectedRecord(null);
    } catch (err) {
      setUploadError((err as Error).message || 'Failed to delete medical record.');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    if (!newTitle.trim()) {
      setUploadError('Please provide a document title.');
      return;
    }

    setIsSubmitting(true);
    try {
      await MedicareApiClient.uploadRecord({
        patientId: currentUser.id,
        title: newTitle.trim(),
=======
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    try {
      const newRec = await MedicareApiClient.uploadRecord({
        patientId: currentUser.id,
        title: newTitle,
>>>>>>> origin/main
        date: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        category: newCategory,
<<<<<<< HEAD
        fileType: selectedFileType || 'PDF',
        fileSize: selectedFileSize || '1.4 MB',
        doctorName: newDoctorName.trim() || currentUser.name,
        facility: 'City Care Hospital Labs',
        notes: newNotes.trim() || 'Routine clinical report uploaded by patient.',
      });

=======
        fileType: 'PDF',
        fileSize: '1.4 MB',
        doctorName: newDoctorName,
        facility: 'City Care Hospital Labs',
        notes: newNotes || 'Routine clinical report uploaded by patient.',
      });

      setRecords([newRec, ...records]);
>>>>>>> origin/main
      setShowUploadModal(false);
      setNewTitle('');
      setNewNotes('');
      setSelectedFileName('');
<<<<<<< HEAD
      setSelectedFileType('PDF');
      setSelectedFileSize('1.4 MB');
    } catch (err) {
      setUploadError((err as Error).message || 'Failed to upload medical document.');
    } finally {
      setIsSubmitting(false);
=======
    } catch (err) {
      console.error(err);
>>>>>>> origin/main
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header (Screen 8) */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          My Medical Records
        </h2>

        {/* Upload Report Button (Screen 8) */}
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-2xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Report</span>
        </button>
      </div>

<<<<<<< HEAD
      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {(['All Records', 'Prescriptions', 'Test Reports', 'Consultations'] as const).map((tab) => {
          const isActive = selectedFilter === tab;
          const label =
            tab === 'All Records'
              ? 'All'
              : tab === 'Test Reports'
              ? 'Lab & Diagnostics'
              : tab;
=======
      {/* Filter Chips (Screen 8: All, Prescriptions, Lab Tests, Imaging, Others) */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Prescriptions', 'Lab Tests', 'Imaging', 'Others'].map((tab) => {
          const isActive =
            (tab === 'All' && selectedFilter === 'All Records') ||
            (tab === 'Prescriptions' && selectedFilter === 'Prescriptions') ||
            (tab === 'Lab Tests' && selectedFilter === 'Test Reports') ||
            (tab === 'Imaging' && selectedFilter === 'Consultations') ||
            (tab === 'Others' && false);
>>>>>>> origin/main

          return (
            <button
              key={tab}
<<<<<<< HEAD
              onClick={() => setSelectedFilter(tab)}
=======
              onClick={() => {
                if (tab === 'All') setSelectedFilter('All Records');
                else if (tab === 'Prescriptions') setSelectedFilter('Prescriptions');
                else if (tab === 'Lab Tests') setSelectedFilter('Test Reports');
                else if (tab === 'Imaging') setSelectedFilter('Consultations');
              }}
>>>>>>> origin/main
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
<<<<<<< HEAD
              {label}
=======
              {tab}
>>>>>>> origin/main
            </button>
          );
        })}
      </div>

      {/* Record Cards List (Screen 8) */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 text-xs">
            No medical records found.
          </div>
        ) : (
          filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-4"
            >
              {/* Document Icon & Info */}
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                  <FileText className="w-5 h-5 text-rose-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {rec.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {rec.date}
                  </span>
                </div>
              </div>

              {/* View Button (Screen 8) */}
              <button
                onClick={() => setSelectedRecord(rec)}
                className="px-4 sm:px-5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                View
              </button>
            </div>
          ))
        )}
      </div>

      {/* Record Preview Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedRecord.title}</h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {selectedRecord.category} · {selectedRecord.date}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Specialist Physician</span>
                  <span className="font-bold text-slate-800">{selectedRecord.doctorName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Diagnostic Center</span>
                  <span className="font-bold text-slate-800">{selectedRecord.facility}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Format & File Size</span>
                  <span className="font-mono text-slate-800">
                    {selectedRecord.fileType} ({selectedRecord.fileSize})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Storage Engine</span>
                  <span className="text-slate-700 font-medium">HIPAA Encrypted Cloud Vault</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-900 block mb-1">
                  Clinical Examination & Findings
                </span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed font-sans">
                  {selectedRecord.notes}
                </div>
              </div>

<<<<<<< HEAD
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDeleteRecord(selectedRecord.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
=======
              <div className="pt-2 flex items-center justify-end border-t border-slate-100">
>>>>>>> origin/main
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(selectedRecord)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Record Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Upload Medical Document</h4>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
<<<<<<< HEAD
              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

=======
>>>>>>> origin/main
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Thyroid Panel (TSH, T3, T4)"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
<<<<<<< HEAD
                  onChange={(e) => setNewCategory(e.target.value as MedicalRecord['category'])}
=======
                  onChange={(e) => setNewCategory(e.target.value as any)}
>>>>>>> origin/main
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                >
                  <option value="Test Reports">Test Reports</option>
                  <option value="Prescriptions">Prescriptions</option>
                  <option value="Consultations">Consultations</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Referring Doctor
                </label>
                <input
                  type="text"
                  value={newDoctorName}
                  onChange={(e) => setNewDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Priya Sharma"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
<<<<<<< HEAD
                  Select File (PDF, JPG, PNG · max 10MB)
=======
                  Select File (PDF, JPG, PNG)
>>>>>>> origin/main
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-rose-400 rounded-xl p-4 text-center cursor-pointer bg-slate-50">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs text-slate-600 block font-medium">
<<<<<<< HEAD
                    {selectedFileName || 'Click to select report'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
=======
                    {selectedFileName || 'Click to select report or drag & drop'}
                  </span>
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFileName(e.target.files[0].name);
                      }
                    }}
>>>>>>> origin/main
                    className="hidden"
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    className="inline-block mt-2 px-3 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    Browse Local File
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Notes / Key Values
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Add any specific observations or lab remarks..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
<<<<<<< HEAD
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadError(null);
                  }}
=======
                  onClick={() => setShowUploadModal(false)}
>>>>>>> origin/main
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
<<<<<<< HEAD
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-2xs"
                >
                  {isSubmitting ? 'Saving...' : 'Upload & Secure'}
=======
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs"
                >
                  Upload & Secure
>>>>>>> origin/main
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
