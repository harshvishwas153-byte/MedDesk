import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Star,
  Clock,
  Calendar,
  ChevronDown,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Doctor, ViewMode } from '../../types';
import { MedicareApiClient } from '../../services/api';
import { FIND_DOCTORS_BANNER } from '../../data/initialData';

interface FindDoctorsProps {
  onNavigate: (view: ViewMode) => void;
  onSelectDoctorToBook: (doctorId: string) => void;
}

export const FindDoctors: React.FC<FindDoctorsProps> = ({
  onNavigate,
  onSelectDoctorToBook,
}) => {
  const doctors: Doctor[] = MedicareApiClient.getDoctors();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDoctorForProfile, setSelectedDoctorForProfile] = useState<Doctor | null>(null);

  const specialties = [
    'All',
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
  ];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSpecialty =
      selectedSpecialty === 'All' ||
      doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()) ||
      doc.department.toLowerCase().includes(selectedSpecialty.toLowerCase());

    const matchesSearch =
      searchQuery === '' ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSpecialty && matchesSearch;
  });

  const handleBookDoctor = (doctorId: string) => {
    onSelectDoctorToBook(doctorId);
    onNavigate('patient-book');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">


      {/* Search Bar for Doctors */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-rose-600 ml-2 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search doctors by name, specialty, or hospital..."
          className="w-full text-xs sm:text-sm font-medium bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Specialty Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {specialties.map((spec) => {
          const isActive = selectedSpecialty === spec;
          return (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {spec}
            </button>
          );
        })}
      </div>

      {/* 2. Banner: "Find the Right Doctor For Your Health" (Screen 4) */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm bg-gradient-to-r from-rose-900 via-rose-800 to-red-700 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-rose-900/40">
        <div className="space-y-2 max-w-lg z-10 text-center md:text-left">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold text-rose-100 uppercase tracking-wider inline-block">
            Verified Healthcare Specialists
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Find the Right Doctor <br />
            For Your Health
          </h2>
          <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed">
            Over 500+ board-certified physicians, surgeons, and specialists ready for in-clinic visits and text consultations.
          </p>
        </div>

        <div className="relative w-full md:w-80 h-36 sm:h-40 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl shrink-0">
          <img
            src={FIND_DOCTORS_BANNER}
            alt="Medical Team"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-rose-950/60 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* 3. Doctors Cards List (Screen 4) */}
      <div className="space-y-4">
        {filteredDoctors.map((doc, index) => {
          const isAvailableToday = index % 2 === 0;

          return (
            <div
              key={doc.id}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              {/* Doctor Info */}
              <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
                <img
                  src={doc.avatar}
                  alt={doc.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                />

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                      {doc.name}
                    </h3>
                  </div>

                  <p className="text-xs font-semibold text-rose-600">
                    {doc.specialty}
                  </p>

                  <p className="text-xs text-slate-500 font-medium">
                    {doc.education}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{doc.rating}</span>
                      <span className="text-slate-400 font-normal">({doc.reviewsCount} reviews)</span>
                    </span>

                    <span className="text-slate-300">·</span>

                    <span className="text-slate-600 font-medium">
                      {doc.experienceYears}+ years experience
                    </span>
                  </div>
                </div>
              </div>

              {/* Availability, Time Slots & Actions */}
              <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <div className="space-y-2 w-full sm:w-auto">
                  {/* Availability badge */}
                  <div className="flex items-center justify-between lg:justify-end gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {isAvailableToday ? 'Available Today' : 'Available Tomorrow'}
                      <ChevronDown className="w-3 h-3 text-emerald-600" />
                    </span>
                  </div>

                  {/* Time slot chips */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {doc.timeSlots.slice(0, 3).map((slot) => (
                      <span
                        key={slot}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Buttons: View Profile & Book Appointment */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedDoctorForProfile(doc)}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    View Profile
                  </button>

                  <button
                    onClick={() => handleBookDoctor(doc.id)}
                    className="flex-1 sm:flex-initial px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-center"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredDoctors.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <Search className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">No doctors found</h4>
            <p className="text-xs text-slate-500">
              Try adjusting your specialty filter or search term.
            </p>
          </div>
        )}
      </div>

      {/* Doctor Profile Modal */}
      {selectedDoctorForProfile && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedDoctorForProfile.avatar}
                  alt={selectedDoctorForProfile.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                />
                <div>
                  <h4 className="font-bold text-base text-slate-900">
                    {selectedDoctorForProfile.name}
                  </h4>
                  <p className="text-xs text-rose-600 font-semibold">
                    {selectedDoctorForProfile.specialty}
                  </p>
                  <p className="text-xs text-slate-500">{selectedDoctorForProfile.hospital}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoctorForProfile(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  About the Doctor
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedDoctorForProfile.about}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Experience</span>
                  <span className="font-bold text-slate-800">
                    {selectedDoctorForProfile.experienceYears}+ Years
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Consultation Fee</span>
                  <span className="font-bold text-slate-800">
                    ₹{selectedDoctorForProfile.consultationFee}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Rating</span>
                  <span className="font-bold text-amber-500 flex items-center gap-1">
                    ★ {selectedDoctorForProfile.rating} ({selectedDoctorForProfile.reviewsCount} reviews)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Education</span>
                  <span className="font-bold text-slate-800">
                    {selectedDoctorForProfile.education}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedDoctorForProfile(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const id = selectedDoctorForProfile.id;
                    setSelectedDoctorForProfile(null);
                    handleBookDoctor(id);
                  }}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
