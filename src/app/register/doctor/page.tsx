"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { saveSession, UserProfile } from "@/lib/auth";
import RoleToggle from "@/components/auth/RoleToggle";
import MobileOtpSection from "@/components/auth/MobileOtpSection";
import {
  sendPhoneOtp,
  verifyPhoneOtp,
  formatToE164,
  saveDoctorDatabaseProfile,
} from "@/lib/supabase";

export default function DoctorRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Account credentials (Completely blank upon initial render)
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: Medical Credentials (Completely blank upon initial render)
  const [medicalRegNo, setMedicalRegNo] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [hospital, setHospital] = useState("");
  const [experience, setExperience] = useState("");
  const [qualification, setQualification] = useState("");

  // Step 3: Clinical Practice & Compliance (Completely blank upon initial render)
  const [languages, setLanguages] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [agreedClinicalTerms, setAgreedClinicalTerms] = useState(false);

  // Step 4: Mobile OTP (Blank)
  const [otp, setOtp] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
    return Math.max(score, 1);
  };

  const strength = getPasswordStrength();

  // Progress %
  const calculateProgress = () => {
    if (currentStep === 1) return 25;
    if (currentStep === 2) return 50;
    if (currentStep === 3) return 75;
    return 100;
  };

  const toggleLanguage = (langScript: string) => {
    if (languages.includes(langScript)) {
      setLanguages(languages.filter((l) => l !== langScript));
    } else {
      setLanguages([...languages, langScript]);
    }
  };

  const handleNext = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setStatusMessage("");

    if (currentStep === 1) {
      if (!fullName.trim() || !mobile.trim() || !email.trim() || !password) {
        setErrorMsg("Please fill in all clinical account credentials.");
        return;
      }
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters.");
        return;
      }

      // Check if email already exists (One Email One User rule)
      setIsLoading(true);
      try {
        const checkRes = await fetch("/api/auth/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });
        const checkData = await checkRes.json();
        if (checkData?.exists) {
          setIsLoading(false);
          setErrorMsg("An account with this email already exists. Please sign in instead.");
          return;
        }
      } catch {
        // Proceed if check fails
      }
      setIsLoading(false);

      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!medicalRegNo.trim()) {
        setErrorMsg("Please enter your Medical Council Registration / License Number.");
        return;
      }
      if (!qualification.trim()) {
        setErrorMsg("Please enter your highest medical qualification.");
        return;
      }
      if (!specialty) {
        setErrorMsg("Please select your primary clinical specialization.");
        return;
      }
      if (!hospital.trim()) {
        setErrorMsg("Please enter your hospital or clinic affiliation.");
        return;
      }
      if (!experience) {
        setErrorMsg("Please select your clinical experience level.");
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (languages.length === 0) {
        setErrorMsg("Please select at least one consultation language.");
        return;
      }
      if (!agreedClinicalTerms) {
        setErrorMsg("Please consent to Telemedicine Practice Guidelines and ABDM standards to proceed.");
        return;
      }

      // Dispatch SMS OTP via Supabase with metadata
      const doctorName = fullName.trim().startsWith("Dr.")
        ? fullName.trim()
        : `Dr. ${fullName.trim()}`;

      setIsLoading(true);
      const res = await sendPhoneOtp(mobile, {
        name: doctorName,
        email: email,
        role: "doctor",
        specialty,
        medicalRegNo,
        hospital,
        qualification,
        experience,
        languages,
      });
      setIsLoading(false);

      if (!res.success) {
        setErrorMsg(res.error || "Failed to dispatch verification code.");
        return;
      }

      if (res.message) {
        setStatusMessage(res.message);
      }

      // Advance to Step 4: Mobile OTP verification
      setCurrentStep(4);
    } else if (currentStep === 4) {
      await handleVerifyOtp();
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMsg("");
    if (!otp || otp.length < 6) {
      setErrorMsg("Please enter the 6-digit OTP code sent to your mobile.");
      return;
    }

    setIsLoading(true);

    // Verify SMS code via Supabase
    const res = await verifyPhoneOtp(mobile, otp);

    if (!res.success) {
      setIsLoading(false);
      setErrorMsg(res.error || "Invalid verification code. Please check and try again.");
      return;
    }

    const userId = res.user?.id || `doc-${Date.now()}`;
    const doctorName = fullName.trim().startsWith("Dr.")
      ? fullName.trim()
      : `Dr. ${fullName.trim()}`;

    // Explicitly update doctor_profiles and user_profiles in database
    await saveDoctorDatabaseProfile(userId, {
      fullName: doctorName,
      email: email.trim(),
      phone: res.formattedPhone || formatToE164(mobile),
      password,
      medicalRegNo,
      specialty,
      hospital,
      experience,
      qualification,
      languages,
      bio,
    });

    const newDoctor: UserProfile = {
      id: userId,
      name: doctorName,
      email: email.trim(),
      phone: res.formattedPhone || formatToE164(mobile),
      role: "doctor",
      specialty,
      medicalRegNo,
      hospital,
      experience,
      qualification,
      bio,
      language: languages.join(", "),
    };

    saveSession(newDoctor);

    setTimeout(() => {
      router.push("/doctor-portal");
    }, 800);
  };

  const handleBack = () => {
    setErrorMsg("");
    setStatusMessage("");
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1D1F22] font-sans antialiased selection:bg-[#E3202B] selection:text-white flex flex-col justify-between">
      {/* ============ TOP FLOATING NAVBAR ============ */}
      <header className="sticky top-4 z-40 px-4 sm:px-6">
        <nav
          aria-label="Main"
          className="relative max-w-[1280px] mx-auto p-2 sm:p-2.5 pl-4 sm:pl-5 flex items-center justify-between gap-4 rounded-full border border-slate-200/80 bg-white shadow-[0_4px_24px_rgba(29,31,34,0.04)]"
        >
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-[10px] overflow-hidden shadow-xs flex-shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/brand/aethriz-hero-logo.png"
                alt="AETHRIZ logo"
                width={36}
                height={36}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span className="flex flex-col leading-none">
              <span
                className="font-semibold text-[17px] tracking-[0.14em] text-[#1D1F22]"
                style={{ fontFamily: "'Inter Tight', sans-serif" }}
              >
                AETHRIZ
              </span>
              <span className="text-[9px] tracking-[0.22em] text-[#C8161F] mt-[2px] font-mono">
                CLINICAL PORTAL
              </span>
            </span>
          </Link>

          {/* Right Action: Sign in */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-[#64748B] font-medium">Already verified?</span>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold text-white shadow-[0_8px_20px_rgba(14,15,17,0.22)] hover:opacity-95 transition-all cursor-pointer"
              style={{
                background: "linear-gradient(180deg, #32363A 0%, #1D1F22 100%)",
              }}
            >
              <span>Sign in</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* ============ MAIN SPLIT CONTENT ============ */}
      <main className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ============ LEFT COLUMN: CLINICAL STEPPER & VERIFICATION CARD ============ */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Stepper Card */}
            <div className="bg-white/85 backdrop-blur-xl rounded-[28px] p-3 border border-white/90 shadow-[0_16px_40px_rgba(29,31,34,0.05)] space-y-1.5">
              {/* Step 1 Item */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between transition-all duration-200 cursor-pointer ${
                  currentStep === 1
                    ? "bg-[#F8FAFC] border border-slate-200/90 shadow-2xs scale-[1.01]"
                    : "hover:bg-slate-50/80 hover:scale-[1.005]"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      currentStep === 1
                        ? "bg-[#1D1F22] text-white shadow-xs"
                        : "bg-[#F1F5F9] text-[#1D1F22]"
                    }`}
                  >
                    01
                  </span>
                  <div>
                    <h3 className={`text-sm font-semibold leading-tight ${currentStep === 1 ? "text-[#1D1F22]" : "text-[#475569]"}`}>
                      Account
                    </h3>
                    <p className="text-[11.5px] text-[#64748B]">Doctor credentials & contact</p>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={currentStep === 1 ? "text-[#E3202B]" : "text-[#94A3B8]"}>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* Step 2 Item */}
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between transition-all duration-200 cursor-pointer ${
                  currentStep === 2
                    ? "bg-[#F8FAFC] border border-slate-200/90 shadow-2xs scale-[1.01]"
                    : "hover:bg-slate-50/80 hover:scale-[1.005]"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      currentStep === 2
                        ? "bg-[#1D1F22] text-white shadow-xs"
                        : "bg-[#F1F5F9] text-[#1D1F22]"
                    }`}
                  >
                    02
                  </span>
                  <div>
                    <h3 className={`text-sm font-semibold leading-tight ${currentStep === 2 ? "text-[#1D1F22]" : "text-[#475569]"}`}>
                      Medical License
                    </h3>
                    <p className="text-[11.5px] text-[#64748B]">MCI / NMC & specialization</p>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={currentStep === 2 ? "text-[#E3202B]" : "text-[#94A3B8]"}>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* Step 3 Item */}
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between transition-all duration-200 cursor-pointer ${
                  currentStep === 3
                    ? "bg-[#F8FAFC] border border-slate-200/90 shadow-2xs scale-[1.01]"
                    : "hover:bg-slate-50/80 hover:scale-[1.005]"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      currentStep === 3
                        ? "bg-[#1D1F22] text-white shadow-xs"
                        : "bg-[#F1F5F9] text-[#1D1F22]"
                    }`}
                  >
                    03
                  </span>
                  <div>
                    <h3 className={`text-sm font-semibold leading-tight ${currentStep === 3 ? "text-[#1D1F22]" : "text-[#475569]"}`}>
                      Telemedicine
                    </h3>
                    <p className="text-[11.5px] text-[#64748B]">Practice bio & compliance</p>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={currentStep === 3 ? "text-[#E3202B]" : "text-[#94A3B8]"}>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* Step 4 Item: Mobile Verification */}
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between transition-all duration-200 cursor-pointer ${
                  currentStep === 4
                    ? "bg-[#E3202B] text-white shadow-xs"
                    : "bg-[#F1F5F9] text-[#1D1F22]"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      currentStep === 4
                        ? "bg-[#E3202B] text-white shadow-xs"
                        : "bg-[#F1F5F9] text-[#1D1F22]"
                    }`}
                  >
                    04
                  </span>
                  <div>
                    <h3 className={`text-sm font-semibold leading-tight ${currentStep === 4 ? "text-[#1D1F22]" : "text-[#475569]"}`}>
                      Verification
                    </h3>
                    <p className="text-[11.5px] text-[#64748B]">Supabase SMS code</p>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={currentStep === 4 ? "text-[#E3202B]" : "text-[#94A3B8]"}>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* Live Doctor Profile Telemetry Card */}
            <div
              className="rounded-[28px] p-6 text-white relative overflow-hidden shadow-[0_20px_48px_rgba(29,31,34,0.18)]"
              style={{
                background: "linear-gradient(145deg, #18191B 0%, #26292D 100%)",
              }}
            >
              {/* Red Glow */}
              <div
                className="absolute -right-8 -top-8 w-36 h-36 rounded-full pointer-events-none opacity-40 blur-2xl"
                style={{
                  background: "radial-gradient(circle, #E3202B 0%, transparent 70%)",
                }}
              />

              {/* Title */}
              <div className="relative z-10 flex items-center justify-between mb-5">
                <span className="text-[10.5px] font-mono tracking-[0.2em] uppercase text-[#E3202B] font-bold flex items-center gap-1.5">
                  Clinical Credentials
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] ae-pulse-glow" />
              </div>

              {/* Live Values */}
              <div className="relative z-10 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-white/60">Doctor</span>
                  <span className="font-semibold text-white bg-white/10 px-2 py-0.5 rounded-lg max-w-[170px] truncate text-right">
                    {fullName ? (fullName.trim().startsWith("Dr.") ? fullName.trim() : `Dr. ${fullName.trim()}`) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-white/60">Phone (E.164)</span>
                  <span className="font-mono font-semibold text-white bg-white/10 px-2 py-0.5 rounded-lg">
                    {mobile ? formatToE164(mobile) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-white/60">Specialty</span>
                  <span className="font-semibold text-[#FF8A90] max-w-[170px] truncate text-right">
                    {specialty || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-white/60">License / Reg</span>
                  <span className="font-mono text-xs text-white/90 max-w-[170px] truncate text-right">
                    {medicalRegNo || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-white/60">Hospital</span>
                  <span className="font-medium text-white/80 max-w-[170px] truncate text-right">
                    {hospital || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-white/60">Experience</span>
                  <span className="font-mono text-emerald-400">
                    {experience || "—"}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative z-10 mt-5 pt-1">
                <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#FF6B6F] via-[#E3202B] to-[#FF4A52] transition-all duration-500 ease-out shadow-[0_0_12px_rgba(227,32,43,0.6)]"
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-white/60">
                  <span>Verification {calculateProgress()}% complete</span>
                  <span className="font-mono text-white/80">Step {currentStep} of 4</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============ RIGHT COLUMN: DOCTOR MULTI-STEP FORM ============ */}
          <div className="lg:col-span-8 bg-white/85 backdrop-blur-xl rounded-[32px] p-6 sm:p-10 border border-white/90 shadow-[0_24px_60px_rgba(29,31,34,0.06),0_2px_8px_rgba(29,31,34,0.03),inset_0_1px_0_rgba(255,255,255,0.9)]">
            
            {/* Toggle Section: User vs Doctor */}
            <RoleToggle activeRole="doctor" />

            <form onSubmit={handleNext}>
              {/* STEP 1: DOCTOR ACCOUNT */}
              {currentStep === 1 && (
                <div className="space-y-6 ae-fade-in">
                  <div>
                    <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#E3202B] uppercase">
                      Step 1 of 4 · Clinician Registration
                    </span>
                    <h2
                      className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1F22] mt-1 mb-2"
                      style={{ fontFamily: "'Inter Tight', sans-serif" }}
                    >
                      Join the AETHRIZ Medical Network.
                    </h2>
                    <p className="text-sm text-[#64748B]">
                      Deliver biomarker telemetry-informed care and AI diagnostic copilot support.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#475569] mb-1.5">
                        Doctor full name (with title)
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Dr. Full Name"
                        required
                        className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 text-sm text-[#1D1F22] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#E3202B]/20 focus:border-[#E3202B] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#475569] mb-1.5">
                        Mobile number (E.164 SMS OTP)
                      </label>
                      <div className="flex rounded-2xl bg-[#F8FAFC] border border-slate-200/90 overflow-hidden focus-within:ring-2 focus-within:ring-[#E3202B]/20 focus-within:border-[#E3202B]">
                        <span className="px-3.5 py-3 text-xs font-medium text-[#64748B] bg-slate-100/70 border-r border-slate-200 flex items-center gap-1 font-mono">
                          <span>+91</span>
                        </span>
                        <input
                          type="tel"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="Enter 10-digit mobile number"
                          required
                          className="w-full px-4 py-3 bg-transparent text-sm text-[#1D1F22] placeholder:text-[#94A3B8] focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1.5">
                      Professional or hospital email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="doctor@hospital.org"
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 text-sm text-[#1D1F22] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#E3202B]/20 focus:border-[#E3202B] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1.5">
                      Portal password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a strong password"
                        required
                        className="w-full px-4 py-3 pr-12 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 text-sm text-[#1D1F22] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#E3202B]/20 focus:border-[#E3202B] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>

                    <div className="mt-2.5">
                      <div className="grid grid-cols-4 gap-2.5 h-1.5">
                        <div className={`rounded-full transition-all duration-300 ${strength >= 1 ? "bg-[#E3202B] shadow-[0_0_8px_rgba(227,32,43,0.35)]" : "bg-slate-200"}`} />
                        <div className={`rounded-full transition-all duration-300 ${strength >= 2 ? "bg-[#E3202B] shadow-[0_0_8px_rgba(227,32,43,0.35)]" : "bg-slate-200"}`} />
                        <div className={`rounded-full transition-all duration-300 ${strength >= 3 ? "bg-[#FCA5A5]" : "bg-slate-200"}`} />
                        <div className={`rounded-full transition-all duration-300 ${strength >= 4 ? "bg-emerald-500" : "bg-slate-200"}`} />
                      </div>
                      <p className="text-[11px] text-[#94A3B8] mt-1.5 flex items-center justify-between">
                        <span>Use 8+ characters with uppercase, numbers and symbols.</span>
                        <span className="font-medium text-[#1D1F22]">
                          {strength >= 4 ? "Compliant password" : strength >= 2 ? "Moderate" : strength === 1 ? "Basic" : ""}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: MEDICAL CREDENTIALS */}
              {currentStep === 2 && (
                <div className="space-y-6 ae-fade-in">
                  <div>
                    <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#E3202B] uppercase">
                      Step 2 of 4 · License & Practice
                    </span>
                    <h2
                      className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1F22] mt-1 mb-2"
                      style={{ fontFamily: "'Inter Tight', sans-serif" }}
                    >
                      Medical registration & specialty.
                    </h2>
                    <p className="text-sm text-[#64748B]">
                      Verified practitioners gain instant access to patient electronic records and AI triage queues.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5 uppercase tracking-wider">
                        Medical Council Reg / License No.
                      </label>
                      <input
                        type="text"
                        value={medicalRegNo}
                        onChange={(e) => setMedicalRegNo(e.target.value)}
                        placeholder="e.g. MCI-12345 or State Council"
                        required
                        className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 text-sm text-[#1D1F22] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#E3202B]/20 focus:border-[#E3202B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5 uppercase tracking-wider">
                        Highest Qualification
                      </label>
                      <input
                        type="text"
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        placeholder="e.g. MBBS, MD, MS, DNB, DM"
                        required
                        className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 text-sm text-[#1D1F22] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#E3202B]/20 focus:border-[#E3202B]"
                      />
                    </div>
                  </div>

                  {/* Primary Specialization */}
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1.5 uppercase tracking-wider">
                      Primary Clinical Specialization
                    </label>
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 text-sm text-[#1D1F22] focus:outline-none focus:ring-2 focus:ring-[#E3202B]/20 focus:border-[#E3202B] cursor-pointer"
                    >
                      <option value="">Select your primary specialization</option>
                      <option value="Endocrinology & Metabolic Health">Endocrinology & Metabolic Health</option>
                      <option value="Cardiology & Cardiovascular Medicine">Cardiology & Cardiovascular Medicine</option>
                      <option value="Internal Medicine & Diabetology">Internal Medicine & Diabetology</option>
                      <option value="Neurology & Cognitive Health">Neurology & Cognitive Health</option>
                      <option value="Gastroenterology & Hepatology">Gastroenterology & Hepatology</option>
                      <option value="Pulmonology & Respiratory Care">Pulmonology & Respiratory Care</option>
                      <option value="Nephrology & Renal Health">Nephrology & Renal Health</option>
                      <option value="Family Medicine & General Practice">Family Medicine & General Practice</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5 uppercase tracking-wider">
                        Primary Hospital / Clinic
                      </label>
                      <input
                        type="text"
                        value={hospital}
                        onChange={(e) => setHospital(e.target.value)}
                        placeholder="Hospital or clinic affiliation"
                        required
                        className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 text-sm text-[#1D1F22] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#E3202B]/20 focus:border-[#E3202B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5 uppercase tracking-wider">
                        Clinical Experience
                      </label>
                      <select
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 text-sm text-[#1D1F22] focus:outline-none focus:ring-2 focus:ring-[#E3202B]/20 focus:border-[#E3202B] cursor-pointer"
                      >
                        <option value="">Select clinical experience level</option>
                        <option value="1-3 years">1–3 years (Resident / Fellow)</option>
                        <option value="4-7 years">4–7 years (Specialist)</option>
                        <option value="8-12 years">8–12 years (Senior Consultant)</option>
                        <option value="12+ years">12+ years (Chief / Veteran)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: PRACTICE DETAILS & COMPLIANCE */}
              {currentStep === 3 && (
                <div className="space-y-6 ae-fade-in">
                  <div>
                    <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#E3202B] uppercase">
                      Step 3 of 4 · Telemedicine & Compliance
                    </span>
                    <h2
                      className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1F22] mt-1 mb-2"
                      style={{ fontFamily: "'Inter Tight', sans-serif" }}
                    >
                      Consultation languages & bio.
                    </h2>
                    <p className="text-sm text-[#64748B]">
                      AETHRIZ pairs you with patients communicating in your chosen languages.
                    </p>
                  </div>

                  {/* Consultation Languages */}
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-2 uppercase tracking-wider">
                      Consultation Languages (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { name: "English", script: "English" },
                        { name: "Hindi", script: "हिन्दी" },
                        { name: "Odia", script: "ଓଡ଼ିଆ" },
                        { name: "Telugu", script: "తెలుగు" },
                        { name: "Bengali", script: "বাংলা" },
                        { name: "Tamil", script: "தமிழ்" },
                        { name: "Marathi", script: "मराठी" },
                        { name: "Kannada", script: "ಕನ್ನಡ" },
                      ].map((item) => {
                        const isSelected = languages.includes(item.script);
                        return (
                          <button
                            key={item.script}
                            type="button"
                            onClick={() => toggleLanguage(item.script)}
                            className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#1D1F22] text-white border-[#1D1F22] shadow-xs"
                                : "bg-[#F8FAFC] text-[#475569] border-slate-200/90 hover:bg-slate-50"
                            }`}
                          >
                            <span>{item.name}</span>
                            {isSelected && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Clinical Focus / Bio */}
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1.5 uppercase tracking-wider">
                      Clinical Focus & Practice Summary
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder="Brief overview of clinical interests and consultation style..."
                      className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 text-sm text-[#1D1F22] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#E3202B]/20 focus:border-[#E3202B]"
                    />
                  </div>

                  {/* Clinical Terms & Telemedicine Compliance Checkbox */}
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="docTerms"
                      checked={agreedClinicalTerms}
                      onChange={(e) => setAgreedClinicalTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-[#E3202B] focus:ring-[#E3202B] border-slate-300 cursor-pointer"
                    />
                    <label htmlFor="docTerms" className="text-xs text-[#64748B] leading-relaxed cursor-pointer">
                      I certify that my medical registration is active, and I agree to practice under the{" "}
                      <span className="font-semibold text-[#1D1F22]">National Medical Commission (NMC) Telemedicine Practice Guidelines</span> and
                      abide by ABDM health records privacy rules.
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 4: MOBILE OTP SECTION (SHARED COMPONENT) */}
              {currentStep === 4 && (
                <MobileOtpSection
                  mobile={mobile}
                  otp={otp}
                  setOtp={setOtp}
                  onVerify={handleVerifyOtp}
                  onBack={handleBack}
                  onEditMobile={() => setCurrentStep(1)}
                  isLoading={isLoading}
                  submitLabel="Verify & Register as Doctor"
                  stepNumber={4}
                  totalSteps={4}
                  statusMessage={statusMessage}
                  onResendOtp={async () => {
                    const docName = fullName.trim().startsWith("Dr.")
                      ? fullName.trim()
                      : `Dr. ${fullName.trim()}`;
                    const res = await sendPhoneOtp(mobile, {
                      name: docName,
                      email: email,
                      role: "doctor",
                      specialty,
                      medicalRegNo,
                      hospital,
                      qualification,
                      experience,
                      languages,
                    });
                    if (res.message) setStatusMessage(res.message);
                  }}
                />
              )}

              {/* Error Banner */}
              {errorMsg && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium ae-fade-in">
                  {errorMsg}
                </div>
              )}

              {/* Action Buttons for Steps 1, 2, 3 */}
              {currentStep < 4 && (
                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="px-6 py-2.5 rounded-full text-xs font-semibold text-[#475569] bg-[#ECEFF3] hover:bg-[#E2E8F0] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="py-3 px-8 rounded-full text-xs font-semibold text-white shadow-[0_10px_24px_rgba(29,31,34,0.18)] hover:opacity-95 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                    style={{
                      background: "linear-gradient(180deg, #32363A 0%, #1D1F22 100%)",
                    }}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : currentStep === 3 ? (
                      <>
                        <span>Send SMS OTP & Verify</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="text-center py-4 text-xs text-[#94A3B8]">
        © 2026 AETHRIZ AI Healthcare And Advanced Research Private Limited · Clinical Provider Portal
      </footer>
    </div>
  );
}
