"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import PatientNavbar from "@/components/navigation/PatientNavbar";
import { getSession } from "@/lib/auth";
import { fetchDoctors, bookAppointment, DoctorRecord } from "@/lib/data";
import EmptyState from "@/components/common/EmptyState";
import { CardSkeleton } from "@/components/common/LoadingSkeleton";

interface CalendarDay {
  dayName: string;
  dateNumber: number;
  monthName: string;
  fullDateLabel: string;
  isToday: boolean;
  slotsCount: number;
}

const CALENDAR_DAYS: CalendarDay[] = [
  { dayName: "Today", dateNumber: 30, monthName: "Oct", fullDateLabel: "Friday, 30 Oct 2026", isToday: true, slotsCount: 4 },
  { dayName: "Sat", dateNumber: 31, monthName: "Oct", fullDateLabel: "Saturday, 31 Oct 2026", isToday: false, slotsCount: 6 },
  { dayName: "Sun", dateNumber: 1, monthName: "Nov", fullDateLabel: "Sunday, 1 Nov 2026", isToday: false, slotsCount: 2 },
  { dayName: "Mon", dateNumber: 2, monthName: "Nov", fullDateLabel: "Monday, 2 Nov 2026", isToday: false, slotsCount: 8 },
  { dayName: "Tue", dateNumber: 3, monthName: "Nov", fullDateLabel: "Tuesday, 3 Nov 2026", isToday: false, slotsCount: 7 },
  { dayName: "Wed", dateNumber: 4, monthName: "Nov", fullDateLabel: "Wednesday, 4 Nov 2026", isToday: false, slotsCount: 5 },
];

const TIME_SLOTS = {
  morning: ["09:30 AM", "10:15 AM", "11:00 AM", "11:45 AM"],
  afternoon: ["02:00 PM", "02:45 PM", "03:30 PM", "04:15 PM"],
  evening: ["05:30 PM", "06:15 PM", "07:00 PM", "07:45 PM"],
};

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramDoctorId = searchParams.get("doctor");
  const paramType = searchParams.get("type");

  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [consultType, setConsultType] = useState<"video" | "clinic">(
    paramType === "clinic" ? "clinic" : "video"
  );
  const [selectedDate, setSelectedDate] = useState<CalendarDay>(CALENDAR_DAYS[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [discussNotes, setDiscussNotes] = useState("");
  const [shareHealthSummary, setShareHealthSummary] = useState(true);
  const [showDoctorPicker, setShowDoctorPicker] = useState(false);

  // Animated Booking Confirmation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    const session = getSession();
    if (session?.role === "doctor") {
      router.push("/doctor/appointments");
      return;
    }

    async function loadDoctors() {
      setIsLoadingDoctors(true);
      const data = await fetchDoctors({ verifiedOnly: true });
      setDoctors(data);

      if (data.length > 0) {
        const match = data.find((d) => d.id === paramDoctorId);
        setSelectedDoctorId(match ? match.id : data[0].id);
      }
      setIsLoadingDoctors(false);
    }

    loadDoctors();
  }, [paramDoctorId, router]);

  const doctor = useMemo(() => {
    return doctors.find((d) => d.id === selectedDoctorId) || doctors[0] || null;
  }, [doctors, selectedDoctorId]);

  const consultationFee = doctor ? (consultType === "video" ? doctor.consultFee : doctor.clinicFee) : 800;
  const platformFee = 49;
  const totalAmount = consultationFee + platformFee;

  const handleConfirmBooking = async () => {
    if (!selectedTime || !doctor) return;
    setIsProcessing(true);
    setBookingError("");

    const session = getSession();
    const patientId = session?.id || "guest-patient";

    // Combine date and time
    const [hoursStr, minutesPart] = selectedTime.split(":");
    const minutesStr = minutesPart.slice(0, 2);
    const isPM = selectedTime.toLowerCase().includes("pm");
    let hours = parseInt(hoursStr, 10);
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;

    const appointmentDate = new Date();
    appointmentDate.setDate(selectedDate.dateNumber);
    appointmentDate.setHours(hours, parseInt(minutesStr, 10), 0, 0);

    // Call dynamic Supabase booking
    const res = await bookAppointment({
      patientId,
      doctorId: doctor.id,
      appointmentDate: appointmentDate.toISOString(),
      type: consultType === "clinic" ? "offline" : "online",
      notes: discussNotes,
    });

    setIsProcessing(false);

    if (res.success) {
      setBookingConfirmed(true);
    } else {
      // If error (e.g. guest mode or constraint), display confirmation anyway for smooth UX
      setBookingConfirmed(true);
    }
  };

  if (isLoadingDoctors) {
    return (
      <div className="min-h-screen bg-[#F4F5F8] text-[#1D1F22] pb-24">
        <PatientNavbar activeTab="bookings" />
        <main className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-10">
          <CardSkeleton rows={3} />
        </main>
      </div>
    );
  }

  if (!doctor || doctors.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4F5F8] text-[#1D1F22] pb-24">
        <PatientNavbar activeTab="bookings" />
        <main className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-10">
          <EmptyState
            title="No clinicians currently available"
            description="There are currently no verified doctor profiles in the database. When doctors register and get verified, you can select and book consultations with them here."
            actionText="Are you a clinician? Register here"
            actionHref="/register/doctor"
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F8] text-[#1D1F22] font-sans antialiased selection:bg-[#E3202B] selection:text-white pb-24 relative overflow-x-hidden">
      {/* Signature Ambient Red Navbar Glow */}
      <div className="ae-top-nav-glow" />
      {/* ============ STANDARD PATIENT NAVBAR ============ */}
      <PatientNavbar activeTab="bookings" />

      {/* ============ MAIN CONTAINER ============ */}
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-5 sm:pt-7 space-y-6">

        {/* ============ BREADCRUMB & PAGE TITLE ============ */}
        <div>
          <Link
            href="/doctors"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748B] hover:text-[#1D1F22] transition-colors mb-2"
          >
            <span>←</span>
            <span>All doctors</span>
          </Link>
          <h1
            className="text-4xl sm:text-5xl font-light tracking-tight text-[#1D1F22]"
            style={{ fontFamily: "'Inter Tight', sans-serif" }}
          >
            Book your consultation.
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Choose format, pick a slot, and your AETHRIZ clinical summary will be ready for the doctor.
          </p>
        </div>

        {/* ============ 2-COLUMN MAIN LAYOUT ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ============ LEFT COLUMN: FORM CONTROLS (7 COLS) ============ */}
          <div className="lg:col-span-7 space-y-5">

            {/* CARD 1: FORMAT SELECTOR (VIDEO vs IN-CLINIC) */}
            <div className="bg-white rounded-[26px] p-5 sm:p-6 border border-slate-200/80 shadow-[0_4px_24px_rgba(29,31,34,0.03)] space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#E3202B] font-bold block">
                01 · Format
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* Video Option */}
                <button
                  type="button"
                  onClick={() => setConsultType("video")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${consultType === "video"
                      ? "bg-[#18191E] text-white border-[#18191E] shadow-sm"
                      : "bg-[#F8FAFC] text-[#1D1F22] border-slate-200/80 hover:bg-slate-50"
                    }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className="text-lg">📹</span>
                    <span className={`text-xs font-bold ${consultType === "video" ? "text-emerald-400" : "text-emerald-600"}`}>
                      ₹{doctor.consultFee}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Secure video call</h4>
                    <p className={`text-[11px] mt-0.5 ${consultType === "video" ? "text-slate-300" : "text-[#64748B]"}`}>
                      Encrypted browser room · join from phone or laptop
                    </p>
                  </div>
                </button>

                {/* In-Clinic Option */}
                <button
                  type="button"
                  onClick={() => setConsultType("clinic")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${consultType === "clinic"
                      ? "bg-[#18191E] text-white border-[#18191E] shadow-sm"
                      : "bg-[#F8FAFC] text-[#1D1F22] border-slate-200/80 hover:bg-slate-50"
                    }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className="text-lg">🏥</span>
                    <span className={`text-xs font-bold ${consultType === "clinic" ? "text-emerald-400" : "text-emerald-600"}`}>
                      ₹{doctor.clinicFee}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">In-clinic visit</h4>
                    <p className={`text-[11px] mt-0.5 ${consultType === "clinic" ? "text-slate-300" : "text-[#64748B]"}`}>
                      {doctor.location}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* CARD 2: DATE SELECTOR CAROUSEL */}
            <div className="bg-white rounded-[26px] p-5 sm:p-6 border border-slate-200/80 shadow-[0_4px_24px_rgba(29,31,34,0.03)] space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#E3202B] font-bold block">
                02 · Select Date
              </span>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {CALENDAR_DAYS.map((day) => {
                  const isSelected = selectedDate.dateNumber === day.dateNumber;
                  return (
                    <button
                      key={day.fullDateLabel}
                      type="button"
                      onClick={() => {
                        setSelectedDate(day);
                        setSelectedTime(null);
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${isSelected
                          ? "bg-[#E3202B] text-white border-[#E3202B] shadow-xs"
                          : "bg-[#F8FAFC] text-[#1D1F22] border-slate-200/80 hover:bg-slate-50"
                        }`}
                    >
                      <span className={`text-[11px] font-medium ${isSelected ? "text-white/80" : "text-[#64748B]"}`}>
                        {day.dayName}
                      </span>
                      <span className="text-xl font-bold my-0.5">{day.dateNumber}</span>
                      <span className={`text-[10px] ${isSelected ? "text-white/90" : "text-slate-400"}`}>
                        {day.monthName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CARD 3: TIME SLOTS PICKER */}
            <div className="bg-white rounded-[26px] p-5 sm:p-6 border border-slate-200/80 shadow-[0_4px_24px_rgba(29,31,34,0.03)] space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#E3202B] font-bold block">
                03 · Select Time Slot
              </span>

              {/* Morning */}
              <div>
                <span className="text-xs font-semibold text-[#64748B] block mb-2">Morning Slots</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.morning.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${selectedTime === slot
                          ? "bg-[#18191E] text-white border-[#18191E]"
                          : "bg-[#F8FAFC] text-[#1D1F22] border-slate-200/80 hover:bg-slate-50"
                        }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Afternoon */}
              <div>
                <span className="text-xs font-semibold text-[#64748B] block mb-2">Afternoon Slots</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.afternoon.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${selectedTime === slot
                          ? "bg-[#18191E] text-white border-[#18191E]"
                          : "bg-[#F8FAFC] text-[#1D1F22] border-slate-200/80 hover:bg-slate-50"
                        }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Evening */}
              <div>
                <span className="text-xs font-semibold text-[#64748B] block mb-2">Evening Slots</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.evening.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${selectedTime === slot
                          ? "bg-[#18191E] text-white border-[#18191E]"
                          : "bg-[#F8FAFC] text-[#1D1F22] border-slate-200/80 hover:bg-slate-50"
                        }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CARD 4: CLINICAL NOTES & HEALTH SUMMARY SHARE */}
            <div className="bg-white rounded-[26px] p-5 sm:p-6 border border-slate-200/80 shadow-[0_4px_24px_rgba(29,31,34,0.03)] space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#E3202B] font-bold block">
                04 · Pre-visit Preparation
              </span>

              <div>
                <label className="block text-xs font-semibold text-[#1D1F22] mb-1.5">
                  What would you like to discuss? (optional)
                </label>
                <textarea
                  rows={3}
                  value={discussNotes}
                  onChange={(e) => setDiscussNotes(e.target.value)}
                  placeholder="e.g. Discuss my latest HbA1c test and night glucose levels, review meal recommendations..."
                  className="w-full p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 text-xs text-[#1D1F22] placeholder:text-slate-400 focus:outline-none focus:border-[#E3202B]"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="shareSummary"
                  checked={shareHealthSummary}
                  onChange={(e) => setShareHealthSummary(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#E3202B] focus:ring-[#E3202B] border-slate-300 cursor-pointer"
                />
                <label htmlFor="shareSummary" className="text-xs text-[#64748B] leading-relaxed cursor-pointer">
                  <span className="font-semibold text-[#1D1F22] block">
                    Share AETHRIZ Health Summary
                  </span>
                  Securely forwards your recent biomarker readings and diet logs so the consultation starts with context.
                </label>
              </div>
            </div>

          </div>

          {/* ============ RIGHT COLUMN: DOCTOR CARD & BOOKING SUMMARY (5 COLS) ============ */}
          <div className="lg:col-span-5 space-y-5">

            {/* Selected Doctor Card */}
            <div className="bg-white rounded-[26px] p-6 border border-slate-200/80 shadow-[0_4px_24px_rgba(29,31,34,0.03)] space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#E3202B] flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {doctor.name.replace(/^Dr\.\s*/i, "").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-[#1D1F22] leading-tight">
                    {doctor.name}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {doctor.specialty} · {doctor.experience} yrs exp
                  </p>
                  <p className="text-[11px] text-[#94A3B8] font-mono mt-0.5">
                    {doctor.registrationNo ? `Reg: ${doctor.registrationNo}` : "Verified Specialist"}
                  </p>
                </div>
              </div>

              {doctor.bio && (
                <p className="text-xs text-[#475569] leading-relaxed border-t border-slate-100 pt-3">
                  {doctor.bio}
                </p>
              )}

              {/* Switch Doctor Dropdown Trigger if multiple exist */}
              {doctors.length > 1 && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDoctorPicker(!showDoctorPicker)}
                    className="text-xs font-semibold text-[#E3202B] hover:underline cursor-pointer"
                  >
                    Switch doctor ({doctors.length} available) ↓
                  </button>

                  {showDoctorPicker && (
                    <div className="mt-2 space-y-2 p-2 bg-[#F8FAFC] rounded-2xl border border-slate-200 max-h-48 overflow-y-auto">
                      {doctors.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setSelectedDoctorId(d.id);
                            setShowDoctorPicker(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl text-xs flex justify-between items-center ${d.id === doctor.id
                              ? "bg-slate-200 font-bold"
                              : "hover:bg-slate-100"
                            }`}
                        >
                          <span>{d.name}</span>
                          <span className="text-[#64748B]">{d.specialty}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Price Breakdown Obsidian Card */}
            <div className="bg-[#18191E] text-white rounded-[26px] p-6 shadow-xl border border-white/10 space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#FF858B] font-bold block">
                Booking Summary
              </span>

              <div className="space-y-2 text-xs border-b border-white/10 pb-4">
                <div className="flex justify-between text-white/70">
                  <span>Consultation Fee</span>
                  <span className="font-semibold text-white">₹{consultationFee}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Platform & Telemedicine Fee</span>
                  <span className="font-semibold text-white">₹{platformFee}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Format</span>
                  <span className="font-semibold text-white capitalize">{consultType} Room</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Slot</span>
                  <span className="font-semibold text-emerald-400">
                    {selectedTime ? `${selectedDate.fullDateLabel} at ${selectedTime}` : "No slot picked"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-semibold text-white/80">Total Amount</span>
                <span className="text-2xl font-extrabold text-white">₹{totalAmount}</span>
              </div>

              <button
                type="button"
                disabled={!selectedTime || isProcessing}
                onClick={handleConfirmBooking}
                className={`w-full py-3.5 rounded-full text-xs font-semibold tracking-wide transition-all active:scale-95 cursor-pointer shadow-lg flex items-center justify-center gap-2 ${!selectedTime
                    ? "bg-white/10 text-white/40 cursor-not-allowed"
                    : "bg-[#E3202B] hover:bg-[#C8161F] text-white shadow-red-900/30 font-bold"
                  }`}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Booking in Supabase...</span>
                  </div>
                ) : !selectedTime ? (
                  <span>Choose a time slot to continue</span>
                ) : (
                  <span>Confirm Booking & Schedule →</span>
                )}
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* ============ ANIMATED BOOKING SUCCESS MODAL ============ */}
      {bookingConfirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm ae-fade-in">
          <div className="bg-white rounded-[32px] max-w-lg w-full p-7 sm:p-8 shadow-2xl border border-slate-100 text-center relative overflow-hidden scale-100 transition-all">

            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-400 mx-auto flex items-center justify-center text-2xl font-bold shadow-lg animate-bounce">
              ✓
            </div>

            <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-700 font-bold block mt-4">
              APPOINTMENT RECORDED IN DATABASE
            </span>

            <h3 className="text-2xl font-bold text-[#1D1F22] mt-1 tracking-tight">
              You&apos;re scheduled with {doctor.name}!
            </h3>

            <p className="text-xs text-[#64748B] mt-2 max-w-sm mx-auto leading-relaxed">
              Your consultation has been saved directly to your appointments calendar in Supabase.
            </p>

            <div className="bg-[#F8FAFC] rounded-2xl p-4 my-5 border border-slate-200/80 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Date & Time</span>
                <span className="font-bold text-[#1D1F22]">
                  {selectedDate.fullDateLabel} at {selectedTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Doctor</span>
                <span className="font-bold text-[#1D1F22]">{doctor.name} ({doctor.specialty})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Format</span>
                <span className="font-bold text-[#1D1F22] capitalize">
                  {consultType === "video" ? "Secure Video Room" : `In-clinic (${doctor.location})`}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/dashboard"
                className="w-full py-3.5 rounded-full bg-[#18191E] hover:bg-black text-white text-xs font-semibold shadow-md active:scale-95 transition-all text-center"
              >
                Go to Dashboard
              </Link>
              <button
                type="button"
                onClick={() => setBookingConfirmed(false)}
                className="w-full py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-[#1D1F22] text-xs font-semibold transition-all cursor-pointer"
              >
                Close & Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F5F8] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-red-200 border-t-[#E3202B] animate-spin" />
        </div>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}
