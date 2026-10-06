import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  FileText,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Star,
  CheckCircle2,
  Clock,
  MapPin,
  Heart,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Search,
  MessageSquare,
  Building2,
  FlaskConical,
  Stethoscope,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { PWAInstallButton } from '../common/PWAInstallButton';
import {
  HERO_DOCTOR_IMAGE,
  DR_RAHUL_IMAGE,
  DR_NEHA_IMAGE,
  DR_VIKRAM_IMAGE,
  HOSPITAL_HERO_IMAGE,
} from '../../data/initialData';
import { Doctor, ViewMode } from '../../types';
import { MedicareApiClient } from '../../services/api';

const BEST_DOCTORS_CAROUSEL = [
  {
    id: 'doc-1',
    name: 'Dr. Priya Sharma',
    role: 'Chief Cardiologist · AIIMS New Delhi',
    specialty: 'Cardiology',
    hospital: 'City Care Hospital',
    rating: 4.8,
    reviewsCount: 120,
    experience: '12+ Yrs Exp',
    image: HERO_DOCTOR_IMAGE,
    tag: 'Heart Specialist',
    fee: '₹800',
  },
  {
    id: 'doc-4',
    name: 'Dr. Vikram Malhotra',
    role: 'Senior Orthopedic Surgeon · PGI',
    specialty: 'Orthopedics & Joint Care',
    hospital: 'Apex Health Institute',
    rating: 4.9,
    reviewsCount: 142,
    experience: '15+ Yrs Exp',
    image: DR_VIKRAM_IMAGE,
    tag: 'Joint Replacement',
    fee: '₹900',
  },
  {
    id: 'doc-2',
    name: 'Dr. Rahul Mehta',
    role: 'Chief Physician · KEM Hospital Mumbai',
    specialty: 'Internal Medicine & Diabetology',
    hospital: 'HealthCare Hospital',
    rating: 4.6,
    reviewsCount: 98,
    experience: '9+ Yrs Exp',
    image: DR_RAHUL_IMAGE,
    tag: 'Internal Medicine',
    fee: '₹500',
  },
  {
    id: 'doc-3',
    name: 'Dr. Neha Verma',
    role: 'Consultant Dermatologist · CMC Vellore',
    specialty: 'Clinical Dermatology & Aesthetics',
    hospital: 'LifeLine Hospital',
    rating: 4.7,
    reviewsCount: 75,
    experience: '8+ Yrs Exp',
    image: DR_NEHA_IMAGE,
    tag: 'Skin & Trichology',
    fee: '₹700',
  },
];

interface LandingPageProps {
  onNavigate: (view: ViewMode) => void;
  onBookAppointment?: (doctorId?: string) => void;
  onSelectDoctorToBook?: (doctorId: string) => void;
  onOpenJavaRubric?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onBookAppointment,
  onSelectDoctorToBook,
  onOpenJavaRubric,
}) => {
  const doctors: Doctor[] = MedicareApiClient.getDoctors();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handleNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % BEST_DOCTORS_CAROUSEL.length);
  }, []);

  const handlePrevSlide = useCallback(() => {
    setCurrentSlide(
      (prev) => (prev - 1 + BEST_DOCTORS_CAROUSEL.length) % BEST_DOCTORS_CAROUSEL.length
    );
  }, []);

  // Automatic sliding timer every 4 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      handleNextSlide();
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused, handleNextSlide]);

  const handleDoctorClick = (docId: string) => {
    if (onSelectDoctorToBook) {
      onSelectDoctorToBook(docId);
    }
    onNavigate('patient-book');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* 1. Top Bar */}
      <header className="w-full shrink-0 sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-4">
          {/* Brand */}
          <BrandLogo size="md" onClick={() => onNavigate('landing')} />

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => onNavigate('patient-find-doctors')}
              className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Search Doctors"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="hidden sm:block">
              <PWAInstallButton variant="header" />
            </div>
            <button
              onClick={() => onNavigate('login')}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => onNavigate('patient-book')}
              className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Book</span>
              <span className="hidden sm:inline"> Appointment</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section (Screen 1) */}
      <section id="home" className="w-full shrink-0 relative pt-8 sm:pt-12 pb-10 sm:pb-16 bg-gradient-to-b from-rose-50/20 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Your Health <br />
                Our <span className="text-rose-600">Priority</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Quality healthcare, trusted doctors and seamless care — all in one place.
              </p>



              {/* 6 Quick Feature Cards Grid below search */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3 pt-2">
                <button
                  onClick={() => onNavigate('patient-book')}
                  className="p-3 sm:p-3.5 bg-white hover:bg-rose-50/50 border border-slate-200/90 hover:border-rose-200 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Calendar className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">
                    Book Appointment
                  </span>
                </button>

                <button
                  onClick={() => onNavigate('patient-consultation')}
                  className="p-3 sm:p-3.5 bg-white hover:bg-rose-50/50 border border-slate-200/90 hover:border-rose-200 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">
                    Text Consultation
                  </span>
                </button>

                <button
                  onClick={() => onNavigate('patient-find-doctors')}
                  className="p-3 sm:p-3.5 bg-white hover:bg-rose-50/50 border border-slate-200/90 hover:border-rose-200 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <UserCheck className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">
                    Find Doctors
                  </span>
                </button>

                <button
                  onClick={() => onNavigate('patient-records')}
                  className="p-3 sm:p-3.5 bg-white hover:bg-rose-50/50 border border-slate-200/90 hover:border-rose-200 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <FileText className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">
                    Medical Records
                  </span>
                </button>

                <button
                  onClick={() => onNavigate('patient-records')}
                  className="p-3 sm:p-3.5 bg-white hover:bg-rose-50/50 border border-slate-200/90 hover:border-rose-200 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <FlaskConical className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">
                    Lab Tests
                  </span>
                </button>

                <button
                  onClick={() => onNavigate('patient-find-doctors')}
                  className="p-3 sm:p-3.5 bg-white hover:bg-rose-50/50 border border-slate-200/90 hover:border-rose-200 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Stethoscope className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">
                    Specialists
                  </span>
                </button>
              </div>
            </div>

            {/* Right Hero Image (Hospital Corridor with Healthcare Team & MedDesk Logo) */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-lg aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
                <img
                  src={HOSPITAL_HERO_IMAGE}
                  alt="MedDesk Hospital Facility"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Bottom Stats Banner (Screen 1) */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <UserCheck className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">500+</div>
                <div className="text-xs font-medium text-slate-500">Expert Doctors</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">20+</div>
                <div className="text-xs font-medium text-slate-500">Departments</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">50K+</div>
                <div className="text-xs font-medium text-slate-500">Happy Patients</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">24/7</div>
                <div className="text-xs font-medium text-slate-500">Medical Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 3. Featured Doctors Carousel Section */}
      <section id="doctors" className="w-full shrink-0 py-12 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Top Medical Specialists</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Our Best Doctors</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                Consult with verified clinical leaders and experienced specialists across multiple departments.
              </p>
            </div>
            <button
              onClick={() => onNavigate('patient-find-doctors')}
              className="text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
            >
              <span>View All Doctors</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col items-center">
            {/* Soft decorative glow behind the card */}
            <div className="relative w-full flex flex-col items-center">
              <div
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className="relative w-80 sm:w-96 max-w-full aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-950 group select-none"
              >
                {/* Horizontal sliding track */}
                <div
                  className="flex w-full h-full transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {BEST_DOCTORS_CAROUSEL.map((doc) => (
                    <div key={doc.id} className="w-full h-full shrink-0 relative">
                      <img
                        src={doc.image}
                        alt={doc.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top"
                      />
                      {/* Vignette gradients for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-900/40 pointer-events-none" />

                      {/* Top Left Tag badge */}
                      <div className="absolute top-3.5 left-3.5 z-20">
                        <span className="px-3 py-1 text-[11px] font-bold text-white bg-slate-900/80 backdrop-blur-md rounded-full border border-white/20 shadow-md flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {doc.tag}
                        </span>
                      </div>

                      {/* Top Right Experience badge */}
                      <div className="absolute top-3.5 right-3.5 z-20">
                        <span className="px-2.5 py-1 text-[11px] font-semibold text-white bg-rose-600/90 backdrop-blur-md rounded-full shadow-md">
                          {doc.experience}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Left navigation arrow button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevSlide();
                  }}
                  aria-label="Previous Doctor"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-white/85 hover:bg-white text-slate-800 shadow-lg flex items-center justify-center backdrop-blur-xs transition-all hover:scale-110 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
                </button>

                {/* Right navigation arrow button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextSlide();
                  }}
                  aria-label="Next Doctor"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-white/85 hover:bg-white text-slate-800 shadow-lg flex items-center justify-center backdrop-blur-xs transition-all hover:scale-110 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
                </button>

                {/* Floating active doctor information badge */}
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 z-20 bg-white/95 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center justify-between transition-all">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
                      <Heart className="w-4 sm:w-5 h-4 sm:h-5 text-rose-500 fill-rose-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {BEST_DOCTORS_CAROUSEL[currentSlide].name}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                        {BEST_DOCTORS_CAROUSEL[currentSlide].role}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{BEST_DOCTORS_CAROUSEL[currentSlide].rating}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDoctorClick(BEST_DOCTORS_CAROUSEL[currentSlide].id)}
                      className="mt-1 text-[10px] sm:text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                    >
                      Book Slot →
                    </button>
                  </div>
                </div>
              </div>

              {/* Slider pagination dots & auto-play status */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {BEST_DOCTORS_CAROUSEL.map((doc, idx) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Show ${doc.name}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      currentSlide === idx ? 'w-7 bg-rose-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
                <span className="text-[11px] text-slate-500 font-medium ml-1.5 flex items-center gap-1">
                  <span>{currentSlide + 1}</span>
                  <span className="text-slate-400">/</span>
                  <span>{BEST_DOCTORS_CAROUSEL.length}</span>
                </span>
                <span className="text-[10px] text-slate-400 ml-2 hidden sm:inline">
                  {isPaused ? '(Paused on hover)' : '• Auto-sliding'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 4 Feature Cards */}
      <section id="services" className="w-full shrink-0 py-10 sm:py-14 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Book Appointments */}
            <div
              onClick={() => onNavigate('patient-book')}
              className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50 hover:bg-rose-50/30 hover:border-rose-200 transition-all cursor-pointer group shadow-2xs"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Book Appointments</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Easily schedule appointments with top doctors
              </p>
            </div>

            {/* Card 2: Access Medical Records */}
            <div
              onClick={() => onNavigate('patient-records')}
              className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50 hover:bg-teal-50/30 hover:border-teal-200 transition-all cursor-pointer group shadow-2xs"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Access Medical Records</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                View your medical history anytime, anywhere
              </p>
            </div>

            {/* Card 3: Trusted Doctors */}
            <div
              onClick={() => {
                const el = document.getElementById('doctors');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50 hover:bg-purple-50/30 hover:border-purple-200 transition-all cursor-pointer group shadow-2xs"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Trusted Doctors</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect with experienced and verified doctors
              </p>
            </div>

            {/* Card 4: Secure & Reliable */}
            <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50 hover:bg-blue-50/30 hover:border-blue-200 transition-all group shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Secure & Reliable</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your data is safe with us with encrypted medical vaults
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Doctors Showcase Section */}
      <section id="doctors" className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Our Specialists
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Consult With Experienced Clinicians
              </h2>
            </div>
            <button
              onClick={() => onNavigate('patient-book')}
              className="mt-4 md:mt-0 text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View all doctors</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mb-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{doc.rating}</span>
                        <span className="text-slate-400 font-normal">
                          ({doc.reviewsCount} reviews)
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{doc.name}</h4>
                      <p className="text-xs text-rose-600 font-medium">{doc.specialty}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-4 leading-relaxed line-clamp-2">
                    {doc.about}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doc.hospital}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doc.experienceYears}+ Yrs Exp</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Consultation Fee</span>
                    <span className="text-base font-bold text-slate-900">₹{doc.consultationFee}</span>
                  </div>
                  <button
                    onClick={() => handleDoctorClick(doc.id)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
                  >
                    View Slots
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Contact / Footer */}
      <footer id="contact" className="mt-auto bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <BrandLogo size="md" light={true} />
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Hospital & Patient Care Management Ecosystem providing comprehensive healthcare at your fingertips.
              </p>
            </div>

            <div>
              <h5 className="text-slate-200 font-semibold mb-3">Quick Navigation</h5>
              <ul className="space-y-2 text-[11px]">
                <li>
                  <button onClick={() => onNavigate('patient-dashboard')} className="hover:text-white">
                    Patient Dashboard
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('doctor-dashboard')} className="hover:text-white">
                    Doctor Portal
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('admin-dashboard')} className="hover:text-white">
                    Hospital Admin
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('patient-book')} className="hover:text-white">
                    Book Appointment
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-slate-200 font-semibold mb-3">Hospital Network</h5>
              <ul className="space-y-2 text-[11px]">
                <li>City Care Hospital, Delhi</li>
                <li>HealthCare Hospital, Mumbai</li>
                <li>LifeLine Hospital, Bengaluru</li>
                <li>Emergency OPD 24x7: 1800-MEDDESK</li>
              </ul>
            </div>

            <div>
              <h5 className="text-slate-200 font-semibold mb-3">Emergency & Support</h5>
              <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                Dedicated medical emergency dispatch, ambulance support, and patient grievance assistance 24/7.
              </p>
              <div className="space-y-1 text-[11px]">
                <div className="text-rose-400 font-semibold">Toll-Free: 1800-MEDDESK</div>
                <div className="text-slate-300">Ambulance: 108</div>
                <div className="text-slate-400">help@meddesk.org</div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© 2024-2026 MedDesk Inc. All rights reserved.</p>
            <p className="text-slate-500">
              Designed according to MedDesk Clinical Suite Design Specifications.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
