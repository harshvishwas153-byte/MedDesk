import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  FileText,
  Plus,
  User,
  Stethoscope,
  Pill,
  X,
  Download,
  Check,
  Paperclip,
  Upload,
  ArrowLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  User as UserType,
  Doctor,
  ConsultationSession,
  ChatMessage,
  ViewMode,
  MedicalRecord,
  ChatAttachment,
} from '../../types';
import { MedicareApiClient } from '../../services/api';
import { generateMedicalRecordPdf } from '../../utils/pdfGenerator';

import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface DoctorConsultationProps {
  currentUser: UserType;
  onNavigate: (view: ViewMode) => void;
}

export const DoctorConsultation: React.FC<DoctorConsultationProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [consultations, setConsultations] = useState<ConsultationSession[]>([]);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string>('c-1');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  // Mobile/Tablet view toggle: 'list' or 'chat'
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  // Modals
  const [showSendReportModal, setShowSendReportModal] = useState(false);
  const [showNewConsultModal, setShowNewConsultModal] = useState(false);

  // Send Report / Prescription Form State
  const [docAttachmentType, setDocAttachmentType] = useState<'prescription' | 'report'>('prescription');
  const [rxDiagnosis, setRxDiagnosis] = useState('');
  const [rxMedName, setRxMedName] = useState('Paracetamol 650mg');
  const [rxDosage, setRxDosage] = useState('1 Tablet (1-0-1)');
  const [rxDuration, setRxDuration] = useState('3 Days');
  const [rxInstruction, setRxInstruction] = useState('After meals');
  const [rxNotes, setRxNotes] = useState('Maintain proper hydration. Rest for 24-48 hours.');

  // New Consultation Form State
  const [newPatientName, setNewPatientName] = useState('Harsh Vishwas');
  const [newComplaint, setNewComplaint] = useState('Report Review & Follow-up');
  const [newInitMessage, setNewInitMessage] = useState('Hello! I reviewed your recent report. Let me know if you are experiencing any symptoms.');

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Sync data
  const loadData = () => {
    const list = MedicareApiClient.getConsultations(currentUser.id, currentUser.role);
    setConsultations(list);

    if (list.length > 0) {
      const active = list.find((c) => c.id === selectedConsultationId) || list[0];
      if (active) {
        setSelectedConsultationId((prev) => (list.some((c) => c.id === prev) ? prev : active.id));
        const msgs = MedicareApiClient.getConsultationMessages(active.id);
        setMessages(msgs);
      }
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = MedicareApiClient.subscribe(loadData);

    try {
      const q = query(collection(db, 'consultations'));
      const unsubCloud = onSnapshot(q, () => {
        loadData();
      });
      return () => {
        unsubscribe();
        unsubCloud();
      };
    } catch {
      return () => unsubscribe();
    }
  }, [currentUser]);

  const activeConsultation =
    consultations.find((c) => c.id === selectedConsultationId) || consultations[0];

  useEffect(() => {
    const targetId = activeConsultation?.id || selectedConsultationId;
    if (!targetId) return;

    setMessages(MedicareApiClient.getConsultationMessages(targetId));

    try {
      const q = query(
        collection(db, 'consultation_messages'),
        where('consultationId', '==', targetId)
      );
      const unsubMsgs = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const cloudMsgs: ChatMessage[] = snapshot.docs.map((doc) => doc.data() as ChatMessage);
          MedicareApiClient.mergeConsultationMessages(targetId, cloudMsgs);
          setMessages(MedicareApiClient.getConsultationMessages(targetId));
        }
      });
      return () => unsubMsgs();
    } catch {}
  }, [selectedConsultationId, activeConsultation?.id]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
    const t1 = setTimeout(scrollToBottom, 60);
    const t2 = setTimeout(scrollToBottom, 200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [messages, selectedConsultationId, activeConsultation?.id]);

  const filteredConsultations = consultations.filter((c) => {
    return (
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.appointmentReason && c.appointmentReason.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSelectPatient = (id: string) => {
    setSelectedConsultationId(id);
    const msgs = MedicareApiClient.getConsultationMessages(id);
    setMessages(msgs);
    setMobileView('chat');
    setTimeout(() => {
      chatInputRef.current?.focus();
      scrollToBottom();
    }, 100);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConsultation) return;

    const messageText = inputText.trim();
    setInputText('');

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const optimisticMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      consultationId: activeConsultation.id,
      senderId: currentUser.id,
      senderRole: 'DOCTOR',
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: messageText,
      timestamp: timeStr,
    };

    // 1. INSTANT optimistic state update (0ms delay!)
    setMessages((prev) => {
      if (prev.some((m) => m.id === optimisticMsg.id || (m.text === messageText && m.timestamp === timeStr))) {
        return prev;
      }
      return [...prev, optimisticMsg];
    });

    // 2. Immediate scroll to bottom
    scrollToBottom();

    // 3. Persist asynchronously in background
    setTimeout(() => {
      MedicareApiClient.sendConsultationMessage({
        consultationId: activeConsultation.id,
        senderId: currentUser.id,
        senderRole: 'DOCTOR',
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        text: messageText,
      });
    }, 0);
  };

<<<<<<< HEAD
  const handleSendPrescriptionOrReport = async (e: React.FormEvent) => {
=======
  const handleSendPrescriptionOrReport = (e: React.FormEvent) => {
>>>>>>> 85356b1c7ebac862bbb456be6c3bab1f9c48068c
    e.preventDefault();
    if (!activeConsultation) return;

    if (docAttachmentType === 'prescription') {
      if (!rxDiagnosis.trim()) return;

<<<<<<< HEAD
      try {
        await MedicareApiClient.issuePrescriptionFromConsultation({
          consultationId: activeConsultation.id,
          doctorId: currentUser.id,
          doctorName: currentUser.name,
          doctorAvatar: currentUser.avatar,
          patientId: activeConsultation.patientId,
          diagnosis: rxDiagnosis.trim(),
          medicines: [
            {
              name: rxMedName,
              dosage: rxDosage,
              duration: rxDuration,
              instruction: rxInstruction,
            },
          ],
          notes: rxNotes.trim(),
        });
      } catch (err) {
        console.error(err);
        return;
      }
    } else {
      try {
        // General Report / Clinical Summary
        const record = await MedicareApiClient.uploadRecord({
          patientId: activeConsultation.patientId,
          title: rxDiagnosis || 'Doctor Clinical Advice',
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          category: 'Consultations',
          fileType: 'PDF',
          fileSize: '1.2 MB',
          doctorName: currentUser.name,
          facility: 'MedDesk Clinic',
          notes: rxNotes || 'Doctor shared clinical summary',
        });

        MedicareApiClient.sendConsultationMessage({
          consultationId: activeConsultation.id,
          senderId: currentUser.id,
          senderRole: 'DOCTOR',
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          text: `📄 Attached Clinical Summary: ${rxDiagnosis || 'Clinical Advice'}`,
          attachments: [
            {
              type: 'report',
              title: rxDiagnosis || 'Doctor Clinical Summary',
              fileName: 'Clinical_Summary.pdf',
              fileType: 'PDF',
              fileSize: '1.2 MB',
              recordId: record.id,
              notes: rxNotes,
            },
          ],
        });
      } catch (err) {
        console.error(err);
        return;
      }
=======
      MedicareApiClient.issuePrescriptionFromConsultation({
        consultationId: activeConsultation.id,
        doctorId: currentUser.id,
        doctorName: currentUser.name,
        doctorAvatar: currentUser.avatar,
        patientId: activeConsultation.patientId,
        diagnosis: rxDiagnosis.trim(),
        medicines: [
          {
            name: rxMedName,
            dosage: rxDosage,
            duration: rxDuration,
            instruction: rxInstruction,
          },
        ],
        notes: rxNotes.trim(),
      });
    } else {
      // General Report / Clinical Summary
      const record = MedicareApiClient.uploadRecord({
        patientId: activeConsultation.patientId,
        title: rxDiagnosis || 'Doctor Clinical Advice',
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        category: 'Consultations',
        fileType: 'PDF',
        fileSize: '1.2 MB',
        doctorName: currentUser.name,
        facility: 'MedDesk Clinic',
        notes: rxNotes || 'Doctor shared clinical summary',
      });

      MedicareApiClient.sendConsultationMessage({
        consultationId: activeConsultation.id,
        senderId: currentUser.id,
        senderRole: 'DOCTOR',
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        text: `📄 Attached Clinical Summary: ${rxDiagnosis || 'Clinical Advice'}`,
        attachments: [
          {
            type: 'report',
            title: rxDiagnosis || 'Doctor Clinical Summary',
            fileName: 'Clinical_Summary.pdf',
            fileType: 'PDF',
            fileSize: '1.2 MB',
            recordId: record.id,
            notes: rxNotes,
          },
        ],
      });
>>>>>>> 85356b1c7ebac862bbb456be6c3bab1f9c48068c
    }

    setShowSendReportModal(false);
    setRxDiagnosis('');
  };

  const handleCreateNewConsult = (e: React.FormEvent) => {
    e.preventDefault();
    const users = MedicareApiClient.getUsers().filter((u) => u.role === 'PATIENT');
    const targetPatient = users.find((u) => u.name === newPatientName) || users[0];

    const newSession = MedicareApiClient.createConsultation({
      patientId: targetPatient ? targetPatient.id : 'usr-1',
      patientName: targetPatient ? targetPatient.name : newPatientName,
      patientAvatar: targetPatient?.avatar,
      patientAge: 28,
      patientGender: targetPatient?.gender || 'Male',
      patientBloodGroup: targetPatient?.bloodGroup || 'O+',
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      doctorSpecialty: 'Specialist Physician',
      doctorAvatar: currentUser.avatar,
      chiefComplaint: newComplaint,
      initialMessage: newInitMessage,
      appointmentDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      appointmentReason: newComplaint,
    });

    setShowNewConsultModal(false);
    setSelectedConsultationId(newSession.id);
    setMobileView('chat');
  };

  const handleDownloadAttachment = (att: ChatAttachment) => {
    if (!activeConsultation) return;

    if (att.recordId) {
      const records = MedicareApiClient.getRecords(activeConsultation.patientId);
      const rec = records.find((r: MedicalRecord) => r.id === att.recordId);
      if (rec) {
        generateMedicalRecordPdf(rec, currentUser);
        return;
      }
    }

    // Fallback PDF generation
    const dummyRecord: MedicalRecord = {
      id: `rec-${Date.now()}`,
      patientId: activeConsultation.patientId,
      title: att.title,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      category: 'Test Reports',
      fileType: att.fileType || 'PDF',
      fileSize: att.fileSize || '1.8 MB',
      doctorName: currentUser.name,
      facility: 'MedDesk Clinic',
      notes: att.notes || att.details || 'Medical report shared via live chat',
    };
    generateMedicalRecordPdf(dummyRecord, currentUser);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-3 overflow-x-hidden">
      {/* 2-Column Responsive Layout without visible scrollbars / sliding bars */}
      <div className="flex h-[calc(100vh-7.5rem)] min-h-[580px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden overflow-x-hidden">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: Patient Roster List                           */}
        {/* Visible always on md+, on mobile only when mobileView==='list' */}
        {/* ========================================================= */}
        <div
          className={`w-full md:w-80 lg:w-96 flex-col border-r border-slate-200 bg-slate-50/60 shrink-0 h-full overflow-x-hidden ${
            mobileView === 'list' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Header & Search */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white space-y-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <span>Visited Patients</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                    {filteredConsultations.length}
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Click on any patient to view reports & chat
                </p>
              </div>

              <button
                onClick={() => setShowNewConsultModal(true)}
                className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
                title="Message new patient"
              >
                <Plus className="w-4 h-4" />
                <span className="text-[11px] font-bold pr-1">New</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient name or symptom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800"
              />
            </div>
          </div>

          {/* Patient Cards List */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-2 no-scrollbar">
            {filteredConsultations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                <User className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-600">No patients found</p>
                <p className="text-[11px]">Patients who visited your clinic will appear here.</p>
              </div>
            ) : (
              filteredConsultations.map((c) => {
                const isSelected = activeConsultation?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectPatient(c.id)}
                    className={`w-full p-3.5 rounded-2xl flex items-start gap-3 transition-all cursor-pointer text-left border ${
                      isSelected
                        ? 'bg-white shadow-md border-rose-400 ring-2 ring-rose-500/20'
                        : 'bg-white/80 hover:bg-white hover:shadow-xs border-slate-200/80'
                    }`}
                  >
                    {/* Patient Avatar & Status Dot */}
                    <div className="relative shrink-0 mt-0.5">
                      <img
                        src={c.patientAvatar}
                        alt={c.patientName}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>

                    {/* Patient Summary Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black text-slate-900 truncate">
                          {c.patientName}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 shrink-0">
                          {c.lastMessageTime || 'Today'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] px-1.5 py-0.2 bg-rose-50 text-rose-700 font-bold rounded shrink-0">
                          {c.patientBloodGroup || 'O+'}
                        </span>
                        <span className="text-[11px] text-rose-600 font-semibold truncate">
                          {c.appointmentReason || c.chiefComplaint}
                        </span>
                      </div>

                      {/* Last Message Preview */}
                      <p className="text-[11px] text-slate-500 truncate mt-1">
                        {c.lastMessage || 'No messages yet'}
                      </p>

                      {/* 10-Day Follow-Up Window Pill */}
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px]">
                        <span className="text-slate-400 font-medium truncate">
                          Visit: {c.appointmentDate || 'Recent'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] flex items-center gap-1 shrink-0 ${
                            c.isFollowUpActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{c.isFollowUpActive ? `${c.daysRemaining}d Left` : 'Expired'}</span>
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 self-center md:hidden" />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Active Chat Conversation & Report Viewer     */}
        {/* Visible always on md+, on mobile only when mobileView==='chat' */}
        {/* ========================================================= */}
        <div
          className={`flex-1 flex-col h-full bg-white min-w-0 overflow-x-hidden ${
            mobileView === 'chat' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {activeConsultation ? (
            <>
              {/* Pinned Top Chat Header */}
              <div className="p-3 sm:p-4 border-b border-slate-200 flex items-center justify-between gap-2 sm:gap-3 bg-white shrink-0 overflow-hidden">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setMobileView('list')}
                    className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer shrink-0"
                    title="Back to patient list"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative shrink-0">
                    <img
                      src={activeConsultation.patientAvatar}
                      alt={activeConsultation.patientName}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl object-cover border border-slate-200"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                        {activeConsultation.patientName}
                      </h3>
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold shrink-0">
                        {activeConsultation.patientGender} · {activeConsultation.patientAge}y · {activeConsultation.patientBloodGroup}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500 truncate mt-0.5">
                      <span className="truncate">Reason: {activeConsultation.appointmentReason || activeConsultation.chiefComplaint}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="text-emerald-600 font-bold shrink-0 hidden sm:inline">
                        Visit: {activeConsultation.appointmentDate} ({activeConsultation.daysRemaining}d left)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <button
                    onClick={() => setShowSendReportModal(true)}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 border border-rose-200"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Attach Rx / Report</span>
                    <span className="sm:hidden text-[11px]">Attach</span>
                  </button>

                  <button
                    onClick={() => onNavigate('doctor-patients')}
                    className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                    title="View Patient Records Vault"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Container */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 space-y-3.5 bg-slate-50/50 min-h-0 no-scrollbar select-text"
              >
                {/* 10-Day Follow-Up Banner */}
                <div className="text-center my-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] sm:text-[11px] font-semibold max-w-full truncate">
                    🟢 Active 10-Day Follow-Up with {activeConsultation.patientName} (Visit: {activeConsultation.appointmentDate})
                  </span>
                </div>

                {messages.map((m) => {
                  const isDoctor = m.senderRole === 'DOCTOR';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isDoctor ? 'items-end' : 'items-start'} max-w-full`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                        <span className="font-bold text-slate-700">
                          {isDoctor ? 'You (Doctor)' : m.senderName}
                        </span>
                        <span>•</span>
                        <span>{m.timestamp}</span>
                      </div>

                      <div
                        className={`max-w-[90%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm shadow-2xs leading-relaxed break-words overflow-hidden ${
                          isDoctor
                            ? 'bg-rose-600 text-white rounded-tr-xs'
                            : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/90'
                        }`}
                      >
                        <p className="whitespace-pre-line break-words">{m.text}</p>

                        {/* Report & Prescription Attachments */}
                        {m.attachments &&
                          m.attachments.map((att, idx) => (
                            <div
                              key={idx}
                              className={`mt-2.5 p-2.5 sm:p-3 rounded-2xl text-xs transition-all max-w-full overflow-hidden ${
                                isDoctor
                                  ? 'bg-white/10 text-white border border-white/20'
                                  : 'bg-rose-50/70 text-slate-900 border border-rose-200'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                      isDoctor ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'
                                    }`}
                                  >
                                    <FileText className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="font-bold block truncate text-xs">
                                      {att.title}
                                    </span>
                                    <span
                                      className={`text-[10px] block truncate ${
                                        isDoctor ? 'text-rose-200' : 'text-slate-500'
                                      }`}
                                    >
                                      {att.fileSize || 'PDF'} · {att.fileType || 'Medical Report'}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleDownloadAttachment(att)}
                                  className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shrink-0 ${
                                    isDoctor
                                      ? 'bg-white text-rose-700 hover:bg-rose-50'
                                      : 'bg-rose-600 text-white hover:bg-rose-700'
                                  }`}
                                  title="View / Download Report"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>View Report</span>
                                </button>
                              </div>

                              {att.medicines && (
                                <div className="mt-2.5 pt-2 border-t border-white/20 space-y-1 text-[11px]">
                                  {att.medicines.map((med, mIdx) => (
                                    <div
                                      key={mIdx}
                                      className="flex items-center justify-between bg-black/10 p-1.5 rounded-lg gap-2 text-[10px] sm:text-[11px]"
                                    >
                                      <span className="font-bold truncate">{med.name}</span>
                                      <span className="shrink-0">{med.dosage} ({med.duration})</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Chat Input Bar */}
              <div className="p-2.5 sm:p-4 border-t border-slate-200 bg-white shrink-0 overflow-x-hidden">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSendReportModal(true)}
                    className="p-2 sm:p-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-2xl border border-slate-200 transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                    title="Send prescription or report"
                  >
                    <Paperclip className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs font-bold">Attach</span>
                  </button>

                  <input
                    ref={chatInputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Type message to ${activeConsultation.patientName}...`}
                    className="flex-1 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm outline-none focus:border-rose-400 focus:bg-white transition-all text-slate-800 min-w-0"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2 sm:p-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 text-white rounded-2xl shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No patient chat selected</p>
              <p className="text-xs text-slate-400 mt-1">Select a patient from the list to start messaging.</p>
            </div>
          )}
        </div>
      </div>

      {/* Attach Prescription / Report Modal for Doctor */}
      {showSendReportModal && activeConsultation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-fadeIn">
            <div className="p-5 bg-gradient-to-r from-rose-600 to-red-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Attach Rx / Medical Report</h3>
                  <p className="text-[11px] text-rose-100">
                    Recipient: {activeConsultation.patientName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSendReportModal(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendPrescriptionOrReport} className="p-6 space-y-4 text-xs">
              <div className="flex items-center p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setDocAttachmentType('prescription')}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                    docAttachmentType === 'prescription'
                      ? 'bg-white text-rose-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Digital Prescription (Rx)
                </button>
                <button
                  type="button"
                  onClick={() => setDocAttachmentType('report')}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                    docAttachmentType === 'report'
                      ? 'bg-white text-rose-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Clinical Report Summary
                </button>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {docAttachmentType === 'prescription' ? 'Diagnosis *' : 'Report Title *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mild Viral Pharyngitis"
                  value={rxDiagnosis}
                  onChange={(e) => setRxDiagnosis(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              {docAttachmentType === 'prescription' && (
                <div className="space-y-2">
                  <label className="block text-slate-700 font-bold">Prescribed Medicine</label>
                  <input
                    type="text"
                    required
                    placeholder="Medicine Name (e.g. Paracetamol 650mg)"
                    value={rxMedName}
                    onChange={(e) => setRxMedName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Dosage (1-0-1)"
                      value={rxDosage}
                      onChange={(e) => setRxDosage(e.target.value)}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <input
                      type="text"
                      placeholder="Duration (3 Days)"
                      value={rxDuration}
                      onChange={(e) => setRxDuration(e.target.value)}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <input
                      type="text"
                      placeholder="After food"
                      value={rxInstruction}
                      onChange={(e) => setRxInstruction(e.target.value)}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">Instructions / Notes</label>
                <textarea
                  rows={2}
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSendReportModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Patient</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Consultation Modal for Doctor */}
      {showNewConsultModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
            <div className="p-5 bg-gradient-to-r from-rose-600 to-red-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">New Message to Patient</h3>
                  <p className="text-[11px] text-rose-100">Reach out to a registered patient</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewConsultModal(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewConsult} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Patient</label>
                <select
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-bold"
                >
                  <option value="Harsh Vishwas">Harsh Vishwas (Primary · O+)</option>
                  <option value="Neha Singh">Neha Singh (AB+)</option>
                  <option value="Amit Kumar">Amit Kumar (A+)</option>
                  <option value="Rohan Verma">Rohan Verma (B+)</option>
                  <option value="Sneha Patel">Sneha Patel (O-)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Consultation Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab Report Follow-up"
                  value={newComplaint}
                  onChange={(e) => setNewComplaint(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Opening Message</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Type your message..."
                  value={newInitMessage}
                  onChange={(e) => setNewInitMessage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewConsultModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Start Conversation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
