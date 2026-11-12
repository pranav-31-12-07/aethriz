"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import PatientNavbar from "@/components/navigation/PatientNavbar";
import DoctorNavbar from "@/components/navigation/DoctorNavbar";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { fetchDoctorById, DoctorRecord } from "@/lib/data";
import EmptyState from "@/components/common/EmptyState";
import { CardSkeleton } from "@/components/common/LoadingSkeleton";

interface DoctorFullProfile {
  id: string;
  name: string;
  initials: string;
  specialtyTag: string;
  headline: string;
  qualifications: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  hospitalName: string;
  languages: string[];
  modalities: string;
  nextAvailable: string;
  videoFee: number;
  clinicFee: number;
  clinicAddress: string;
  isAiMatch: boolean;
  bio: string;
  focusAreas: string[];
  medicalCollege: string;
  institute: string;
  registrationNumber: string;
  fellowship: string;
  verificationStatus: string;
}

function DoctorProfileInner() {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("id");
  const [doctorRecord, setDoctorRecord] = useState<DoctorRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [consultFormat, setConsultFormat] = useState<"video" | "clinic">("video");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [isDoctorSession, setIsDoctorSession] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session?.role === "doctor") {
      setIsDoctorSession(true);
    }

    async function loadDoctor() {
      setIsLoading(true);
      try {
        let targetId = doctorId || (session?.role === "doctor" ? session.id : "");
        if (!targetId) {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            targetId = authData.user.id;
          }
        }
        if (targetId) {
          const doc = await fetchDoctorById(targetId);
          setDoctorRecord(doc);
          if (doc) {
            const { data: authData } = await supabase.auth.getUser();
            if (authData?.user?.id === doc.userId || session?.id === doc.userId || session?.id === doc.id) {
              setIsDoctorSession(true);
            }
          }
        } else {
          setDoctorRecord(null);
        }
      } catch (err) {
        console.error("Failed to load doctor profile:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDoctor();
  }, [doctorId]);

  const doctor: DoctorFullProfile | null = doctorRecord ? {
    id: doctorRecord.id,
    name: doctorRecord.name,
    initials: doctorRecord.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "DR",
    specialtyTag: doctorRecord.specialty,
    headline: `${doctorRecord.specialty} · ${doctorRecord.experience} years clinical practice`,
    qualifications: `${doctorRecord.qualification || "Licensed Medical Practitioner"} · ${doctorRecord.experience} yrs in practice`,
    experienceYears: doctorRecord.experience,
    rating: doctorRecord.rating || 4.9,
    reviewCount: doctorRecord.reviewCount || 0,
    hospitalName: doctorRecord.location || "AETHRIZ Clinical Care Hub",
    languages: doctorRecord.languages?.length ? doctorRecord.languages : ["English", "हिन्दी"],
    modalities: doctorRecord.hasClinic ? "Video & in-clinic" : "Video consultation",
    nextAvailable: "Available for booking",
    videoFee: doctorRecord.consultFee || 800,
    clinicFee: doctorRecord.clinicFee || 1000,
    clinicAddress: doctorRecord.location || "Clinical Care Hub",
    isAiMatch: true,
    bio: doctorRecord.bio || `${doctorRecord.name} is a specialist in ${doctorRecord.specialty} with ${doctorRecord.experience} years of clinical experience.`,
    focusAreas: [doctorRecord.specialty, "Preventive healthcare", "Lifestyle medicine", "Clinical diagnostics"],
    medicalCollege: doctorRecord.qualification || "Medical Qualification",
    institute: doctorRecord.location || "Clinical Medical Board",
    registrationNumber: doctorRecord.registrationNo
      ? `Reg. no. ${doctorRecord.registrationNo} · ${doctorRecord.verificationStatus === "verified" ? "Verified" : "Unverified"}`
      : doctorRecord.verificationStatus === "verified"
      ? "Verified practitioner"
      : "Unverified · Pending Admin Review",
    fellowship: `${doctorRecord.specialty} Specialist`,
    verificationStatus: doctorRecord.verificationStatus,
  } : null;

  const activeFee = doctor ? (consultFormat === "video" ? doctor.videoFee : doctor.clinicFee) : 800;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setMessageText("");
      setShowMessageModal(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F8] text-[#1D1F22] font-sans antialiased selection:bg-[#E3202B] selection:text-white pb-24 relative overflow-x-hidden">
      {/* Signature Ambient Red Navbar Glow */}
      <div className="ae-top-nav-glow" />
      {/* Context-aware Navbar: Doctor portal for doctors, Patient navbar for patients/public */}
      {isDoctorSession ? (
        <DoctorNavbar activeTab="dashboard" />
      ) : (
        <PatientNavbar activeTab="doctors" />
      )}

      {/* ============ MAIN VIEWPORT CONTAINER ============ */}
      <main className="max-w-[1060px] mx-auto px-4 sm:px-6 pt-5 sm:pt-7 space-y-6">
        
        {/* ============ BREADCRUMB & BACK NAVIGATION ============ */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Link
              href={isDoctorSession ? "/doctor-portal" : "/doctors"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 text-[#1D1F22] hover:bg-slate-50 transition-all font-semibold shadow-2xs"
            >
              <span>←</span>
              <span>{isDoctorSession ? "Back to Doctor Portal" : "Back to doctors"}</span>
            </Link>
            <span className="text-[#94A3B8]">
              Doctors / <span className="text-[#475569] font-medium">{doctor?.name || "Specialist"}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <span
              className={`w-2 h-2 rounded-full ${
                doctor?.verificationStatus === "verified"
                  ? "bg-emerald-500"
                  : doctor?.verificationStatus === "rejected"
                  ? "bg-red-500"
                  : "bg-amber-500"
              }`}
            />
            <span>
              {doctor?.verificationStatus === "verified"
                ? "Verified Clinical Specialist"
                : doctor?.verificationStatus === "rejected"
                ? "Verification Declined"
                : "Unverified · Pending Admin Approval"}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <CardSkeleton rows={3} />
            <CardSkeleton rows={2} />
          </div>
        ) : !doctor || (!isDoctorSession && doctor.verificationStatus !== "verified") ? (
          <div className="bg-white rounded-[32px] p-8 sm:p-14 border border-slate-200/80 shadow-xs">
            <EmptyState
              icon={
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
              title={!doctor ? "Doctor Profile Not Found" : "Doctor Verification Pending"}
              description="This specialist profile is currently unverified or unavailable for public booking until approved by an administrator."
              actionText="Browse Verified Doctors"
              actionHref="/doctors"
            />
          </div>
        ) : (
          <>
            {/* ============ HERO DOCTOR CARD MATCHING EXACT MOCKUP ============ */}
        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-200/80 shadow-[0_12px_36px_rgba(29,31,34,0.04)] relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          {/* Subtle Ambient Red Glow */}
          <div
            className="absolute -top-12 -left-12 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(255,100,105,0.18) 0%, transparent 70%)",
              filter: "blur(28px)",
            }}
          />

          {/* Left: Avatar & Doctor Headline */}
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            
            {/* Large 3D Avatar Squircle with Orbit & Badge */}
            <div className="relative flex-shrink-0 self-center sm:self-auto">
              {/* Soft Pink Outer Halo */}
              <div
                className="w-32 h-32 sm:w-36 sm:h-36 rounded-[28px] flex items-center justify-center shadow-[0_12px_28px_rgba(227,32,43,0.12)] border border-[#F6C6CC]/80"
                style={{
                  background: "linear-gradient(135deg, #FFE8EB 0%, #FFD6DC 50%, #FFC9D1 100%)",
                }}
              >
                <span className="text-4xl sm:text-5xl font-light text-[#1D1F22] tracking-tight">
                  {doctor.initials}
                </span>
              </div>

              {/* Decorative Red Dot on Left Orbit */}
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#E3202B]" />

              {/* Registration Verification Bottom Pill */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#18191E] text-white text-[10px] font-semibold whitespace-nowrap shadow-md flex items-center gap-1.5 border border-white/20">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    doctor.verificationStatus === "verified"
                      ? "bg-emerald-400"
                      : doctor.verificationStatus === "rejected"
                      ? "bg-red-400"
                      : "bg-amber-400"
                  }`}
                />
                <span>
                  {doctor.verificationStatus === "verified"
                    ? "Verified"
                    : doctor.verificationStatus === "rejected"
                    ? "Declined"
                    : "Unverified"}
                </span>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="space-y-2 mt-2 sm:mt-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1
                  className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1F22]"
                  style={{ fontFamily: "'Inter Tight', sans-serif" }}
                >
                  {doctor.name}
                </h1>
                {doctor.isAiMatch && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-[#E3202B] bg-[#FFF1F2] border border-red-200/90 shadow-2xs">
                    AI match for your profile
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-[#E3202B]">
                {doctor.headline}
              </p>

              <p className="text-xs text-[#64748B]">
                {doctor.qualifications} · <span className="text-amber-500 font-bold">★ {doctor.rating}</span> ({doctor.reviewCount} reviews)
              </p>

              {/* 3 Information Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#475569]">
                <span className="px-3 py-1 rounded-full bg-[#F8FAFC] border border-slate-200/80 font-medium flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{doctor.experienceYears}+ years experience</span>
                </span>

                <span className="px-3 py-1 rounded-full bg-[#F8FAFC] border border-slate-200/80 font-medium flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                  </svg>
                  <span>{doctor.hospitalName}</span>
                </span>

                <span className="px-3 py-1 rounded-full bg-[#F8FAFC] border border-slate-200/80 font-medium flex items-center gap-1.5">
                  <span className="font-serif">文</span>
                  <span>{doctor.languages.join(", ")}</span>
                </span>
              </div>

              {/* Modality Pill */}
              <div className="pt-1">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-[#E3202B] bg-[#FFF1F2] border border-red-200/70">
                  {doctor.modalities}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Next Available Quick Card */}
          <div className="relative z-10 w-full lg:w-64 bg-[#FAFAFA] rounded-2xl p-5 border border-slate-200/70 flex flex-col justify-between space-y-4 flex-shrink-0">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 uppercase tracking-wider font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>NEXT AVAILABLE</span>
              </div>
              <h4 className="text-lg font-bold text-[#1D1F22] mt-1">
                {doctor.nextAvailable}
              </h4>
            </div>

            <div className="space-y-2">
              {doctor.verificationStatus === "verified" ? (
                <Link
                  href={`/booking?doctor=${doctor.id}&type=${consultFormat}`}
                  className="w-full py-3 px-4 rounded-full bg-[#E3202B] hover:bg-[#C8161F] text-white text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Book consultation</span>
                  <span>→</span>
                </Link>
              ) : (
                <span className="w-full py-3 px-4 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-not-allowed">
                  <span>Booking Locked · Unverified</span>
                </span>
              )}

              <button
                type="button"
                onClick={() => setShowMessageModal(true)}
                className="w-full text-center text-xs text-[#64748B] hover:text-[#1D1F22] transition-colors py-1 cursor-pointer"
              >
                Message care team
              </button>
            </div>
          </div>
        </div>

        {/* ============ TWO-COLUMN DETAILS SECTION ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ============ LEFT COLUMN: CLINICAL BIO & CREDENTIALS (7 COLS) ============ */}
          <div className="lg:col-span-7 bg-white rounded-[28px] p-6 sm:p-7 border border-slate-200/80 shadow-[0_8px_30px_rgba(29,31,34,0.03)] space-y-6">
            
            {/* Header: About Doctor */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-50 text-[#E3202B] flex items-center justify-center">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <h3 className="font-bold text-base text-[#1D1F22]">
                  About {doctor.name}
                </h3>
              </div>

              <span className="text-[10px] font-mono tracking-widest text-[#94A3B8] uppercase font-bold">
                CLINICAL BIO
              </span>
            </div>

            {/* Bio Text */}
            <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
              {doctor.bio}
            </p>

            {/* Specialties & Focus Areas */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#94A3B8] font-bold">
                SPECIALTIES & FOCUS AREAS
              </h4>

              <div className="flex flex-wrap items-center gap-2">
                {doctor.focusAreas.map((area) => (
                  <span
                    key={area}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#F8FAFC] border border-slate-200/80 text-[#1D1F22] flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E3202B]" />
                    <span>{area}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Education & Registration */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#94A3B8] font-bold">
                EDUCATION & REGISTRATION
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. MBBS */}
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-[#E3202B] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#1D1F22]">Primary Qualification</h5>
                    <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                      {doctor.qualifications}
                    </p>
                  </div>
                </div>

                {/* 2. MD / Specialisation */}
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-[#E3202B] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#1D1F22]">
                      MD / DM - {doctor.specialtyTag}
                    </h5>
                    <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                      {doctor.hospitalName}
                    </p>
                  </div>
                </div>

                {/* 3. Council Reg */}
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-[#E3202B] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#1D1F22]">State Medical Council</h5>
                    <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                      {doctor.registrationNumber}
                    </p>
                  </div>
                </div>

                {/* 4. Fellowship */}
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-[#E3202B] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#1D1F22]">Clinical Experience</h5>
                    <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                      {doctor.experienceYears}+ Years Clinical Practice · {doctor.modalities}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Callout */}
            <div className="p-3.5 rounded-2xl bg-[#FFF8F8] border border-red-100 flex items-center gap-3 text-xs text-[#64748B]">
              <span className="text-[#E3202B] flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <p className="leading-snug">
                Patient reviews are shown only with consent. Your visits stay private between you and your doctor.
              </p>
            </div>
          </div>

          {/* ============ RIGHT COLUMN: DIRECT BOOKING & CONSULTATION (5 COLS) ============ */}
          <div className="lg:col-span-5 bg-white rounded-[28px] p-6 sm:p-7 border border-slate-200/80 shadow-[0_8px_30px_rgba(29,31,34,0.03)] space-y-5">
            
            {/* Header: Consultation & Direct Booking */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-50 text-[#E3202B] flex items-center justify-center">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h3 className="font-bold text-base text-[#1D1F22]">Consultation</h3>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                DIRECT BOOKING
              </span>
            </div>

            {/* Formats Selection */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#94A3B8] font-bold block">
                FORMAT
              </span>

              {/* Option 1: Video Consultation */}
              <div
                onClick={() => setConsultFormat("video")}
                className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  consultFormat === "video"
                    ? "bg-white border-2 border-[#E3202B] shadow-xs ring-2 ring-red-100"
                    : "bg-[#F8FAFC] border border-slate-200/80 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      consultFormat === "video" ? "bg-red-50 text-[#E3202B]" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-bold text-[#1D1F22]">Video consultation</h5>
                      <span className="px-2 py-0.2 rounded-full text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      20–30 min · encrypted · ₹{doctor.videoFee}
                    </p>
                  </div>
                </div>

                {/* Radio Circle */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    consultFormat === "video"
                      ? "border-[#E3202B]"
                      : "border-slate-300"
                  }`}
                >
                  {consultFormat === "video" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E3202B]" />
                  )}
                </div>
              </div>

              {/* Option 2: In-clinic Visit */}
              <div
                onClick={() => setConsultFormat("clinic")}
                className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  consultFormat === "clinic"
                    ? "bg-white border-2 border-[#E3202B] shadow-xs ring-2 ring-red-100"
                    : "bg-[#F8FAFC] border border-slate-200/80 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      consultFormat === "clinic" ? "bg-red-50 text-[#E3202B]" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-[#1D1F22]">In-clinic visit</h5>
                    <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                      30–45 min · {doctor.clinicAddress} · ₹{doctor.clinicFee}
                    </p>
                  </div>
                </div>

                {/* Radio Circle */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    consultFormat === "clinic"
                      ? "border-[#E3202B]"
                      : "border-slate-300"
                  }`}
                >
                  {consultFormat === "clinic" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E3202B]" />
                  )}
                </div>
              </div>
            </div>

            {/* Before Your Visit Checklist */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#94A3B8] font-bold block mb-2">
                BEFORE YOUR VISIT
              </span>

              <div className="flex items-center gap-2 text-xs text-[#475569]">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Your AETHRIZ health summary is shared automatically</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#475569]">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Upload reports, scans or prescriptions ahead of time</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#475569]">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Short intake questions in your language</span>
              </div>
            </div>

            {/* Price & Payment Summary */}
            <div className="pt-4 border-t border-slate-100 flex items-end justify-between">
              <div>
                <span className="text-xs font-bold text-[#1D1F22] block capitalize">
                  {consultFormat === "video" ? "Video consultation" : "In-clinic visit"}
                </span>
                <span className="text-[10.5px] text-[#64748B] block mt-0.5">
                  Accepted: UPI · Cards · [INSURANCE PARTNERS]
                </span>
              </div>

              <div className="text-right">
                <span className="text-3xl font-extrabold text-[#1D1F22]">
                  ₹{activeFee}
                </span>
              </div>
            </div>

            {/* Choose a slot CTA Button */}
            {doctor.verificationStatus === "verified" ? (
              <Link
                href={`/booking?doctor=${doctor.id}&type=${consultFormat}`}
                className="w-full py-3.5 rounded-full bg-[#18191E] hover:bg-black text-white text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Choose a slot & book</span>
                <span>→</span>
              </Link>
            ) : (
              <span className="w-full py-3.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-not-allowed">
                <span>Awaiting Admin Verification</span>
              </span>
            )}

            {/* Cancellation Note */}
            <p className="text-center text-[11px] text-[#94A3B8]">
              Free cancellation up to 4 hours before
            </p>
          </div>

        </div>

        {/* ============ FOOTER DISCLAIMER ============ */}
        <p className="text-center text-xs text-[#94A3B8] pt-4">
          Profiles are shown for booking. For emergencies, go to the nearest hospital or call 112.
        </p>

      
          </>
        )}
      </main>

      {/* ============ QUICK MESSAGE CARE TEAM MODAL ============ */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs ae-fade-in">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative">
            <button
              type="button"
              onClick={() => setShowMessageModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-2 cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-[#1D1F22]">
              Message Care Team for {doctor?.name || "Specialist"}
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              Have a pre-booking question about appointment slots or test report requirements?
            </p>

            <form onSubmit={handleSendMessage} className="mt-4 space-y-4">
              <textarea
                rows={4}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Ask your question (e.g., Do I need to re-test fasting glucose before this consult?)..."
                required
                className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs text-[#1D1F22] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#E3202B]"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#64748B] hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={messageSent}
                  className="px-5 py-2.5 rounded-full bg-[#18191E] text-white text-xs font-semibold hover:bg-black transition-all"
                >
                  {messageSent ? "Sent to Care Team ✓" : "Send Question →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DoctorProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F5F8] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-red-200 border-t-[#E3202B] animate-spin" />
        </div>
      }
    >
      <DoctorProfileInner />
    </Suspense>
  );
}
