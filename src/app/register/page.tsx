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
  savePatientDatabaseProfile,
} from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Account fields (Completely blank upon initial render)
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: Health Profile fields (Completely blank / unselected)
  const [diet, setDiet] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other" | "">("");
  const [sleepHours, setSleepHours] = useState(7);

  // Step 3: Language & Compliance (Completely unselected upon initial render)
  const [language, setLanguage] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);

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

  // Profile completion % based on current step
  const calculateProgress = () => {
    if (currentStep === 1) return 25;
    if (currentStep === 2) return 50;
    if (currentStep === 3) return 75;
    return 100;
  };

  const toggleGoal = (goal: string) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter((g) => g !== goal));
    } else {
      setGoals([...goals, goal]);
    }
  };

  const handleNext = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setStatusMessage("");

    if (currentStep === 1) {
      if (!fullName.trim() || !mobile.trim() || !email.trim() || !password) {
        setErrorMsg("Please fill in all account fields to proceed.");
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
      if (!diet) {
        setErrorMsg("Please select your dietary pattern.");
        return;
      }
      if (goals.length === 0) {
        setErrorMsg("Please select at least one primary health goal.");
        return;
      }
      if (!ageGroup) {
        setErrorMsg("Please select your age cohort.");
        return;
      }
      if (!gender) {
        setErrorMsg("Please select your gender.");
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!language) {
        setErrorMsg("Please select your preferred language.");
        return;
      }
      if (!agreedTerms) {
        setErrorMsg("Please agree to the privacy policy & terms to proceed.");
        return;
      }

      // Dispatch SMS OTP via Supabase with step metadata
      setIsLoading(true);
      const res = await sendPhoneOtp(mobile, {
        name: fullName,
        email: email,
        role: "user",
        diet,
        goals,
        language,
        ageGroup,
        gender,
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

    const userId = res.user?.id || `usr-${Date.now()}`;

    // Explicitly update user_profiles and health_details in the database
    await savePatientDatabaseProfile(userId, {
      fullName,
      email,
      phone: res.formattedPhone || formatToE164(mobile),
      password,
      gender: gender || undefined,
      diet,
      goals,
      ageGroup,
      sleepHours,
      language,
    });

    const newUser: UserProfile = {
      id: userId,
      name: fullName.trim() || "User",
      email: email.trim(),
      phone: res.formattedPhone || formatToE164(mobile),
      role: "patient",
      diet,
      goals,
      language,
    };

    saveSession(newUser);

    setTimeout(() => {
      router.push("/dashboard");
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
                BIO-HEALTH AI
              </span>
            </span>
          </Link>

          {/* Right Action: Sign in */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-[#64748B] font-medium">Have an account?</span>
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

          {/* ============ LEFT COLUMN: STEPPER & LIVE PREVIEW ============ */}
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
                    <p className="text-[11.5px] text-[#64748B]">Name, contact and password</p>
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
                      Health profile
                    </h3>
                    <p className="text-[11.5px] text-[#64748B]">Diet, goals and age</p>
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
                      Preferences
                    </h3>
                    <p className="text-[11.5px] text-[#64748B]">Language & compliance</p>
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
                    ? "bg-[#F8FAFC] border border-slate-200/90 shadow-2xs scale-[1.01]"
                    : "hover:bg-slate-50/80 hover:scale-[1.005]"
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

            {/* Live Profile Telemetry Card */}
            <div
              className="rounded-[28px] p-6 text-white relative overflow-hidden shadow-[0_20px_48px_rgba(29,31,34,0.18)]"
              style={{
                background: "linear-gradient(145deg, #1D1F22 0%, #2A2E33 100%)",
              }}
            >
              {/* Background Glow */}
              <div
                className="absolute -right-8 -top-8 w-36 h-36 rounded-full pointer-events-none opacity-40 blur-2xl"
                style={{
                  background: "radial-gradient(circle, #E3202B 0%, transparent 70%)",
                }}
              />

              {/* Title */}
              <div className="relative z-10 flex items-center justify-between mb-5">
                <span className="text-[10.5px] font-mono tracking-[0.2em] uppercase text-[#E3202B] font-bold flex items-center gap-1.5">
                  Live profile preview
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#E3202B] ae-pulse-glow" />
              </div>

              {/* Live Values */}
              <div className="relative z-10 space-y-3.5 text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-white/60">Phone (E.164)</span>
                  <span className="font-mono font-semibold text-white bg-white/10 px-2.5 py-1 rounded-lg">
                    {mobile ? formatToE164(mobile) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-white/60">Diet</span>
                  <span className="font-semibold text-white bg-white/10 px-2.5 py-1 rounded-lg">
                    {diet || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-white/60">Goals</span>
                  <span className="font-semibold text-white max-w-[170px] truncate text-right">
                    {goals.length > 0 ? goals.join(", ") : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-white/60">Language</span>
                  <span className="font-semibold text-[#FF8A90] font-sans bg-white/10 px-2.5 py-1 rounded-lg">
                    {language || "—"}
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
                  <span>Profile {calculateProgress()}% complete</span>
                  <span className="font-mono text-white/80">Step {currentStep} of 4</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============ RIGHT COLUMN: MULTI-STEP FORM ============ */}
          <div className="lg:col-span-8 bg-white/85 backdrop-blur-xl rounded-[32px] p-6 sm:p-10 border border-white/90 shadow-[0_24px_60px_rgba(29,31,34,0.06),0_2px_8px_rgba(29,31,34,0.03),inset_0_1px_0_rgba(255,255,255,0.9)]">
            
            {/* Toggle Section: User vs Doctor */}
            <RoleToggle activeRole="patient" />

            <form onSubmit={handleNext}>
              {/* STEP 1: ACCOUNT */}
              {currentStep === 1 && (
                <div className="space-y-6 ae-fade-in">
                  <div>
                    <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#E3202B] uppercase">
                      Step 1 of 4 · Patient Account
                    </span>
                    <h2
                      className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1F22] mt-1 mb-2"
                      style={{ fontFamily: "'Inter Tight', sans-serif" }}
                    >
                      Create your health account.
                    </h2>
                    <p className="text-sm text-[#64748B]">
                      Early access is free. Enter your personal details to begin.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#475569] mb-1.5">
                        Full name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
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
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 text-sm text-[#1D1F22] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#E3202B]/20 focus:border-[#E3202B] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a secure password"
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
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    
                    {/* 4-Segment Strength Indicator */}
                    <div className="mt-2.5">
                      <div className="grid grid-cols-4 gap-2.5 h-1.5">
                        <div className={`rounded-full transition-all duration-300 ${strength >= 1 ? "bg-[#E3202B] shadow-[0_0_8px_rgba(227,32,43,0.35)]" : "bg-slate-200"}`} />
                        <div className={`rounded-full transition-all duration-300 ${strength >= 2 ? "bg-[#E3202B] shadow-[0_0_8px_rgba(227,32,43,0.35)]" : "bg-slate-200"}`} />
                        <div className={`rounded-full transition-all duration-300 ${strength >= 3 ? "bg-[#FCA5A5]" : "bg-slate-200"}`} />
                        <div className={`rounded-full transition-all duration-300 ${strength >= 4 ? "bg-emerald-500" : "bg-slate-200"}`} />
                      </div>
                      <p className="text-[11px] text-[#94A3B8] mt-1.5 flex items-center justify-between">
                        <span>Use 8+ characters with a number and a symbol.</span>
                        <span className="font-medium text-[#1D1F22]">
                          {strength >= 4 ? "Strong password" : strength >= 2 ? "Moderate" : strength === 1 ? "Basic" : ""}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: HEALTH PROFILE */}
              {currentStep === 2 && (
                <div className="space-y-6 ae-fade-in">
                  <div>
                    <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#E3202B] uppercase">
                      Step 2 of 4 · Biomarkers & Lifestyle
                    </span>
                    <h2
                      className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1F22] mt-1 mb-2"
                      style={{ fontFamily: "'Inter Tight', sans-serif" }}
                    >
                      Personalize your bio-profile.
                    </h2>
                    <p className="text-sm text-[#64748B]">
                      This trains our multi-organ AI model to deliver culturally precise insights.
                    </p>
                  </div>

                  {/* Dietary Pattern */}
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-2 uppercase tracking-wider">
                      Dietary Pattern
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {["Vegetarian", "Non-Vegetarian", "Vegan", "Jain"].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDiet(d)}
                          className={`p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                            diet === d
                              ? "bg-[#1D1F22] text-white border-[#1D1F22] shadow-xs scale-[1.02]"
                              : "bg-[#F8FAFC] text-[#475569] border-slate-200/90 hover:bg-slate-50"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Health Goals */}
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-2 uppercase tracking-wider">
                      Primary Health Goals (Choose at least one)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        "Blood sugar",
                        "Heart health",
                        "Weight balance",
                        "Liver detox",
                        "Thyroid balance",
                        "Gut & Digestion",
                      ].map((g) => {
                        const isSelected = goals.includes(g);
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => toggleGoal(g)}
                            className={`p-3 rounded-2xl border text-xs font-semibold transition-all text-left flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-[#FFF1F2] text-[#E3202B] border-[#FECDD3] shadow-xs"
                                : "bg-[#F8FAFC] text-[#475569] border-slate-200/90 hover:bg-slate-50"
                            }`}
                          >
                            <span>{g}</span>
                            {isSelected && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Average Nightly Sleep Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
                        Average Nightly Sleep
                      </label>
                      <span className="text-sm font-bold text-[#E3202B] font-mono">{sleepHours} h</span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={10}
                      step={0.5}
                      value={sleepHours}
                      onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                      className="w-full accent-[#E3202B] cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-[#94A3B8] mt-1">
                      <span>4 h</span>
                      <span>Recommended 7–9 h</span>
                      <span>10 h</span>
                    </div>
                  </div>

                  {/* Age Group & Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5 uppercase tracking-wider">
                        Age Cohort
                      </label>
                      <select
                        value={ageGroup}
                        onChange={(e) => setAgeGroup(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 text-sm text-[#1D1F22] focus:outline-none focus:ring-2 focus:ring-[#E3202B]/20 focus:border-[#E3202B] cursor-pointer"
                      >
                        <option value="">Select your age group</option>
                        <option value="18-27 years">18-27 years (Young adult)</option>
                        <option value="28-40 years">28-40 years (Active adult)</option>
                        <option value="41-55 years">41-55 years (Midlife focus)</option>
                        <option value="56+ years">56+ years (Senior vitality)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5 uppercase tracking-wider">
                        Phenotype / Gender
                      </label>
                      <div className="flex rounded-2xl bg-[#F8FAFC] border border-slate-200/90 p-1">
                        {(["Male", "Female", "Other"] as const).map((gn) => (
                          <button
                            key={gn}
                            type="button"
                            onClick={() => setGender(gn)}
                            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                              gender === gn
                                ? "bg-white text-[#1D1F22] shadow-xs"
                                : "text-[#64748B] hover:text-[#1D1F22]"
                            }`}
                          >
                            {gn}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: LANGUAGE & TERMS */}
              {currentStep === 3 && (
                <div className="space-y-6 ae-fade-in">
                  <div>
                    <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#E3202B] uppercase">
                      Step 3 of 4 · Preferences
                    </span>
                    <h2
                      className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1F22] mt-1 mb-2"
                      style={{ fontFamily: "'Inter Tight', sans-serif" }}
                    >
                      Choose your language.
                    </h2>
                    <p className="text-sm text-[#64748B]">
                      AETHRIZ communicates telemetry and clinical actions in your preferred dialect.
                    </p>
                  </div>

                  {/* Languages Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                    {[
                      { code: "hi", name: "Hindi", script: "हिन्दी" },
                      { code: "en", name: "English", script: "English" },
                      { code: "or", name: "Odia", script: "ଓଡ଼ିଆ" },
                      { code: "te", name: "Telugu", script: "తెలుగు" },
                      { code: "bn", name: "Bengali", script: "বাংলা" },
                      { code: "ta", name: "Tamil", script: "தமிழ்" },
                      { code: "mr", name: "Marathi", script: "मराठी" },
                      { code: "gu", name: "Gujarati", script: "ગુજરાતી" },
                      { code: "kn", name: "Kannada", script: "ಕನ್ನಡ" },
                      { code: "ml", name: "Malayalam", script: "മലയാളം" },
                      { code: "pa", name: "Punjabi", script: "ਪੰਜਾਬੀ" },
                      { code: "ur", name: "Urdu", script: "اردو" },
                    ].map((lang) => {
                      const isSelected = language === lang.script;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => setLanguage(lang.script)}
                          className={`p-3 rounded-2xl border text-left flex flex-col transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? "bg-[#1D1F22] text-white border-[#1D1F22] shadow-xs scale-[1.02]"
                              : "bg-[#F8FAFC] text-[#1D1F22] border-slate-200/90 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-xs font-semibold">{lang.name}</span>
                          <span className={`text-sm mt-0.5 ${isSelected ? "text-[#FF8A90]" : "text-[#64748B]"}`}>
                            {lang.script}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Terms Checkbox */}
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-[#E3202B] focus:ring-[#E3202B] border-slate-300 cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-xs text-[#64748B] leading-relaxed cursor-pointer">
                      I agree to the{" "}
                      <span className="font-semibold text-[#1D1F22]">AETHRIZ Bio-Algorithmic Privacy Charter</span> and
                      acknowledge that AI recommendations support health awareness and do not substitute hospital emergency care.
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
                  submitLabel="Verify & Create Account"
                  stepNumber={4}
                  totalSteps={4}
                  statusMessage={statusMessage}
                  onResendOtp={async () => {
                    const res = await sendPhoneOtp(mobile, {
                      name: fullName,
                      email: email,
                      role: "user",
                      diet,
                      goals,
                      language,
                      ageGroup,
                      gender,
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
        © 2026 AETHRIZ AI Healthcare And Advanced Research Private Limited · Privacy & Terms
      </footer>
    </div>
  );
}
