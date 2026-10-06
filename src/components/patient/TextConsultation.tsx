import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  FileText,
  X,
  CheckCircle2,
  Download,
  Pill,
  Stethoscope,
  Plus,
  Search,
  Upload,
  Clock,
  ArrowLeft,
  Calendar,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import {
  Doctor,
  User as UserType,
  ViewMode,
  ConsultationSession,
  ChatMessage,
  MedicalRecord,
  ChatAttachment,
} from '../../types';
import { MedicareApiClient } from '../../services/api';
import { generateMedicalRecordPdf } from '../../utils/pdfGenerator';

import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface TextConsultationProps {
  currentUser: UserType;
  onNavigate: (view: ViewMode) => void;
}

export const TextConsultation: React.FC<TextConsultationProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [consultations, setConsultations] = useState<ConsultationSession[]>([]);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string>('c-1');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  // Modals
  const [showSendReportModal, setShowSendReportModal] = useState(false);

  // Send Report Form State
  const [reportSendMode, setReportSendMode] = useState<'existing' | 'upload'>('existing');
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [customReportTitle, setCustomReportTitle] = useState('');
  const [customReportCategory, setCustomReportCategory] = useState<'Test Reports' | 'Prescriptions' | 'Consultations'>('Test Reports');
  const [reportNote, setReportNote] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userRecords = MedicareApiClient.getRecords(currentUser.id);

  const loadData = () => {
    const list = MedicareApiClient.getConsultations(currentUser.id, 'PATIENT');
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
      c.doctorName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.doctorSpecialty.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (c.appointmentReason || '').toLowerCase().includes(searchFilter.toLowerCase())
    );
  });

  const handleSelectDoctor = (id: string) => {
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

    if (!activeConsultation.isFollowUpActive) return;

    const messageText = inputText.trim();
    setInputText('');

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const optimisticMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      consultationId: activeConsultation.id,
      senderId: currentUser.id,
      senderRole: 'PATIENT',
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
        senderRole: 'PATIENT',
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        text: messageText,
      });
    }, 0);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      if (!customReportTitle) {
        setCustomReportTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

<<<<<<< HEAD
  const handleSendReport = async (e: React.FormEvent) => {
=======
  const handleSendReport = (e: React.FormEvent) => {
>>>>>>> 85356b1c7ebac862bbb456be6c3bab1f9c48068c
    e.preventDefault();
    if (!activeConsultation) return;

    let attachment: ChatAttachment;

    if (reportSendMode === 'existing') {
      const rec = userRecords.find((r: MedicalRecord) => r.id === selectedRecordId) || userRecords[0];
      if (!rec) return;

      attachment = {
        type: 'report',
        title: rec.title,
        fileName: `${rec.title.replace(/\s+/g, '_')}.pdf`,
        fileType: rec.fileType || 'PDF',
        fileSize: rec.fileSize || '1.8 MB',
        recordId: rec.id,
        notes: reportNote || rec.notes,
      };
    } else {
      if (!customReportTitle.trim()) return;

<<<<<<< HEAD
      try {
        // Save as new medical record in patient's vault
        const newRec = await MedicareApiClient.uploadRecord({
          patientId: currentUser.id,
          title: customReportTitle.trim(),
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          category: customReportCategory,
          fileType: 'PDF',
          fileSize: '2.1 MB',
          doctorName: activeConsultation.doctorName,
          facility: activeConsultation.hospitalName || 'MedDesk Diagnostic Center',
          notes: reportNote || 'Uploaded via Doctor-Patient Live Chat',
        });

        attachment = {
          type: 'report',
          title: newRec.title,
          fileName: `${newRec.title.replace(/\s+/g, '_')}.pdf`,
          fileType: 'PDF',
          fileSize: '2.1 MB',
          recordId: newRec.id,
          notes: reportNote,
        };
      } catch (err) {
        console.error(err);
        return;
      }
=======
      // Save as new medical record in patient's vault
      const newRec = MedicareApiClient.uploadRecord({
        patientId: currentUser.id,
        title: customReportTitle.trim(),
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        category: customReportCategory,
        fileType: 'PDF',
        fileSize: '2.1 MB',
        doctorName: activeConsultation.doctorName,
        facility: activeConsultation.hospitalName || 'MedDesk Diagnostic Center',
        notes: reportNote || 'Uploaded via Doctor-Patient Live Chat',
      });

      attachment = {
        type: 'report',
        title: newRec.title,
        fileName: `${newRec.title.replace(/\s+/g, '_')}.pdf`,
        fileType: 'PDF',
        fileSize: '2.1 MB',
        recordId: newRec.id,
        notes: reportNote,
      };
>>>>>>> 85356b1c7ebac862bbb456be6c3bab1f9c48068c
    }

    const messageText = reportNote.trim()
      ? `📄 Shared Medical Report: ${attachment.title}\n"${reportNote.trim()}"`
      : `📄 Shared Medical Report: ${attachment.title}`;

    MedicareApiClient.sendConsultationMessage({
      consultationId: activeConsultation.id,
      senderId: currentUser.id,
      senderRole: 'PATIENT',
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: messageText,
      attachments: [attachment],
    });

    setMessages(MedicareApiClient.getConsultationMessages(activeConsultation.id));

    setShowSendReportModal(false);
    setSelectedRecordId('');
    setCustomReportTitle('');
    setSelectedFileName('');
    setReportNote('');
  };

  const handleDownloadAttachment = (att: ChatAttachment) => {
    if (att.recordId) {
      const rec = userRecords.find((r: MedicalRecord) => r.id === att.recordId);
      if (rec) {
        generateMedicalRecordPdf(rec, currentUser);
        return;
      }
    }

    // Fallback generate mock record PDF
    const dummyRecord: MedicalRecord = {
      id: `rec-${Date.now()}`,
      patientId: currentUser.id,
      title: att.title,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      category: 'Test Reports',
      fileType: att.fileType || 'PDF',
      fileSize: att.fileSize || '1.5 MB',
      doctorName: activeConsultation?.doctorName || 'Dr. Priya Sharma',
      facility: activeConsultation?.hospitalName || 'MedDesk Health Center',
      notes: att.notes || att.details || 'Medical Report shared in consultation',
    };
    generateMedicalRecordPdf(dummyRecord, currentUser);
  };

  if (consultations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        {/* Policy Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <Clock className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <h3 className="text-sm font-black flex items-center gap-2">
                <span>10-Day Post-Appointment Doctor Chat</span>
              </h3>
              <p className="text-xs text-rose-200 mt-0.5">
                Ask questions, discuss symptoms, and send reports to doctors you have visited for up to 10 days.
              </p>
            </div>
          </div>
        </div>

        {/* Empty State Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-5 shadow-sm max-w-xl mx-auto my-6">
          <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto text-rose-600 shadow-2xs">
            <Stethoscope className="w-8 h-8 text-rose-600" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-slate-900">No Consulted Doctors Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              You haven't visited any doctors yet. Book an appointment with a doctor to activate your 10-day post-visit text chat and report sharing!
            </p>
          </div>
          <button
            onClick={() => onNavigate('patient-book')}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-2 hover:scale-105"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Doctor Appointment</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-3 overflow-x-hidden">
      {/* Policy Banner */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
            <Clock className="w-5 h-5 text-rose-300" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-black flex items-center gap-2 flex-wrap">
              <span>10-Day Post-Appointment Doctor Chat</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                ACTIVE
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-rose-200 mt-0.5 truncate">
              Ask questions, discuss symptoms, and send reports to doctors you have visited for up to 10 days.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('patient-find-doctors')}
          className="px-3.5 py-2 bg-white text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Book New Doctor Visit</span>
        </button>
      </div>

      {/* 2-Column Responsive Chat Layout */}
      <div className="flex h-[calc(100vh-12rem)] min-h-[560px] bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden overflow-x-hidden">
        {/* Left Column: List of Visited Doctors */}
        <div
          className={`w-full md:w-80 lg:w-96 flex-col border-r border-slate-200 bg-slate-50/50 shrink-0 h-full overflow-x-hidden ${
            mobileView === 'list' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white space-y-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs sm:text-sm font-extrabold text-slate-900">Your Visited Doctors</h2>
                <p className="text-[11px] text-slate-400">Select doctor to ask questions or send reports</p>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-bold">
                {consultations.length} Consulted
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search visited doctor or concern..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800"
              />
            </div>
          </div>

          {/* Visited Doctors List */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-2 no-scrollbar">
            {filteredConsultations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs space-y-3">
                <Stethoscope className="w-8 h-8 mx-auto text-slate-300" />
                <p>No visited doctors found.</p>
                <button
                  onClick={() => onNavigate('patient-find-doctors')}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold cursor-pointer"
                >
                  Book Doctor Appointment
                </button>
              </div>
            ) : (
              filteredConsultations.map((c) => {
                const isSelected = selectedConsultationId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectDoctor(c.id)}
                    className={`p-3.5 rounded-2xl flex flex-col gap-2 transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-white shadow-md border-rose-300 ring-2 ring-rose-500/10'
                        : 'bg-white/80 hover:bg-white border-slate-200/80 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={c.doctorAvatar}
                            alt={c.doctorName}
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                          />
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                              c.isFollowUpActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {c.doctorName}
                          </h4>
                          <span className="text-[11px] text-slate-500 truncate block">
                            {c.doctorSpecialty}
                          </span>
                          <span className="text-[10px] text-rose-600 font-semibold truncate block mt-0.5">
                            Visit: {c.appointmentDate || 'Recent'} ({c.appointmentReason || c.chiefComplaint})
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 self-center md:hidden" />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                      <span className="text-slate-400 truncate max-w-[140px]">
                        {c.lastMessage || 'No messages'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                          c.isFollowUpActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {c.isFollowUpActive ? `🟢 ${c.daysRemaining}d Left` : '10d Expired'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation Stream */}
        <div
          className={`flex-1 flex-col h-full bg-white min-w-0 overflow-x-hidden ${
            mobileView === 'chat' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {activeConsultation ? (
            <>
              {/* Chat Top Bar */}
              <div className="p-3 sm:p-4 border-b border-slate-200 flex items-center justify-between gap-2 sm:gap-3 bg-white shrink-0 overflow-hidden">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setMobileView('list')}
                    className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer shrink-0"
                    title="Back to doctors list"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative shrink-0">
                    <img
                      src={activeConsultation.doctorAvatar}
                      alt={activeConsultation.doctorName}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl object-cover border border-slate-200"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate flex items-center gap-1.5">
                      {activeConsultation.doctorName}
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold shrink-0">
                        Verified
                      </span>
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500 truncate">
                      <span className="truncate">{activeConsultation.doctorSpecialty}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="text-emerald-700 font-bold shrink-0 hidden sm:inline">
                        Visit: {activeConsultation.appointmentDate} ({activeConsultation.daysRemaining}d left)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  {activeConsultation.isFollowUpActive ? (
                    <button
                      onClick={() => setShowSendReportModal(true)}
                      className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 border border-rose-200"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Send Report</span>
                      <span className="sm:hidden text-[11px]">Report</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate('patient-find-doctors')}
                      className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Re-book</span>
                    </button>
                  )}

                  <button
                    onClick={() => onNavigate('patient-records')}
                    className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                    title="View My Health Records Vault"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 space-y-3.5 bg-slate-50/50 min-h-0 no-scrollbar select-text"
              >
                {/* 10-Day Follow-Up Banner */}
                <div className="text-center my-1">
                  {activeConsultation.isFollowUpActive ? (
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] sm:text-[11px] font-semibold max-w-full truncate">
                      🟢 10-Day Post-Visit Consultation Active ({activeConsultation.daysRemaining} Days Remaining)
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] sm:text-[11px] font-semibold max-w-full truncate">
                      ⏳ 10-Day Window expired. Book a new appointment to ask questions.
                    </span>
                  )}
                </div>

                {messages.map((m) => {
                  const isPatient = m.senderRole === 'PATIENT';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isPatient ? 'items-end' : 'items-start'} max-w-full`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                        <span className="font-bold text-slate-700">
                          {isPatient ? 'You' : m.senderName}
                        </span>
                        <span>•</span>
                        <span>{m.timestamp}</span>
                      </div>

                      <div
                        className={`max-w-[90%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm shadow-2xs leading-relaxed break-words overflow-hidden ${
                          isPatient
                            ? 'bg-rose-600 text-white rounded-tr-xs'
                            : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/90'
                        }`}
                      >
                        <p className="whitespace-pre-line break-words">{m.text}</p>

                        {/* Medical Report / Prescription Attachments */}
                        {m.attachments &&
                          m.attachments.map((att, idx) => (
                            <div
                              key={idx}
                              className={`mt-2.5 p-2.5 sm:p-3 rounded-2xl text-xs transition-all max-w-full overflow-hidden ${
                                isPatient
                                  ? 'bg-white/10 text-white border border-white/20'
                                  : 'bg-rose-50/70 text-slate-900 border border-rose-200'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                      isPatient ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'
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
                                        isPatient ? 'text-rose-200' : 'text-slate-500'
                                      }`}
                                    >
                                      {att.fileSize || 'PDF'} · {att.fileType || 'Medical Report'}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleDownloadAttachment(att)}
                                  className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shrink-0 ${
                                    isPatient
                                      ? 'bg-white text-rose-700 hover:bg-rose-50'
                                      : 'bg-rose-600 text-white hover:bg-rose-700'
                                  }`}
                                  title="Download / Preview Report"
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
                {activeConsultation.isFollowUpActive ? (
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSendReportModal(true)}
                      className="p-2 sm:p-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-2xl border border-slate-200 transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                      title="Attach & send a medical report"
                    >
                      <Paperclip className="w-4 h-4" />
                      <span className="hidden sm:inline text-xs font-bold">Attach Report</span>
                    </button>

                    <input
                      ref={chatInputRef}
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`Ask ${activeConsultation.doctorName} anything...`}
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
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-800">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="truncate">10-Day post-visit window for this appointment has expired.</span>
                    </div>
                    <button
                      onClick={() => onNavigate('patient-find-doctors')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Book New Visit
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <Stethoscope className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No doctor selected</p>
              <p className="text-xs text-slate-400 mt-1">Select a doctor from the list to start messaging.</p>
            </div>
          )}
        </div>
      </div>

      {/* Send Report Modal */}
      {showSendReportModal && activeConsultation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-rose-600 to-red-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Paperclip className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Send Medical Report to Doctor</h3>
                  <p className="text-[11px] text-rose-100">
                    Recipient: {activeConsultation.doctorName}
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

            <form onSubmit={handleSendReport} className="p-6 space-y-4 text-xs">
              {/* Tab Selector: Existing vs Upload New */}
              <div className="flex items-center p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setReportSendMode('existing')}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                    reportSendMode === 'existing'
                      ? 'bg-white text-rose-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  From My Medical Vault ({userRecords.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReportSendMode('upload')}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                    reportSendMode === 'upload'
                      ? 'bg-white text-rose-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upload New File
                </button>
              </div>

              {reportSendMode === 'existing' ? (
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Select Report from Your Health Records
                  </label>
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1 no-scrollbar">
                    {userRecords.length === 0 ? (
                      <p className="text-slate-400 p-4 text-center">
                        No saved records found. Switch to "Upload New File".
                      </p>
                    ) : (
                      userRecords.map((r: MedicalRecord) => {
                        const isSelected =
                          selectedRecordId === r.id ||
                          (!selectedRecordId && userRecords[0]?.id === r.id);
                        return (
                          <div
                            key={r.id}
                            onClick={() => setSelectedRecordId(r.id)}
                            className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-400'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileText className={`w-4 h-4 ${isSelected ? 'text-rose-600' : 'text-slate-400'}`} />
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 block truncate text-xs">
                                  {r.title}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {r.category} · {r.date} · {r.fileSize}
                                </span>
                              </div>
                            </div>
                            <input
                              type="radio"
                              name="selected_report"
                              checked={isSelected}
                              onChange={() => setSelectedRecordId(r.id)}
                              className="accent-rose-600"
                            />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Choose PDF / Image File</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-4 border-2 border-dashed border-slate-200 hover:border-rose-400 rounded-2xl flex flex-col items-center justify-center gap-1.5 bg-slate-50/50 hover:bg-rose-50/30 transition-all cursor-pointer"
                    >
                      <Upload className="w-6 h-6 text-rose-600" />
                      <span className="font-bold text-slate-700">
                        {selectedFileName || 'Click to select report (PDF, PNG, JPG)'}
                      </span>
                      <span className="text-[10px] text-slate-400">Max file size 10MB</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Report Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CBC Blood Test Report"
                      value={customReportTitle}
                      onChange={(e) => setCustomReportTitle(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Report Category</label>
                    <select
                      value={customReportCategory}
                      onChange={(e) => setCustomReportCategory(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    >
                      <option value="Test Reports">Diagnostic / Test Report</option>
                      <option value="Prescriptions">Prescription</option>
                      <option value="Consultations">Clinical Summary</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Message / Question for Doctor (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Doctor, please check my platelet count and let me know if any medicines are required."
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
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
                  <span>Send Report to Doctor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
