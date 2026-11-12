"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, UserProfile } from "@/lib/auth";
import DoctorNavbar from "@/components/navigation/DoctorNavbar";
import {
  fetchDoctorPortalStats,
  fetchAppointments,
  fetchDoctorPatients,
  fetchDoctorById,
  AppointmentRecord,
  PatientCohortRecord,
  DoctorRecord,
} from "@/lib/data";
import { supabase } from "@/lib/supabase";
import EmptyState from "@/components/common/EmptyState";
import { StatsCardSkeleton, CardSkeleton } from "@/components/common/LoadingSkeleton";

export default function DoctorPortalPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserProfile | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorRecord | null>(null);
  const [stats, setStats] = useState({
    activePatients: 0,
    todayConsults: 0,
    reportsToSignOff: 0,
    aiInsightsReady: 0,
  });
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [patients, setPatients] = useState<PatientCohortRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (s && s.role === "patient") {
      router.push("/dashboard");
      return;
    }
    setSession(s);

    async function loadDashboardData() {
      setIsLoading(true);
      try {
        let activeUid = s?.id;
        if (!activeUid) {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            activeUid = authData.user.id;
          }
        }

        const [statsData, apptsData, patientsData, docData] = await Promise.all([
          fetchDoctorPortalStats(activeUid),
          fetchAppointments({ userId: activeUid, role: "doctor" }),
          fetchDoctorPatients(),
          activeUid ? fetchDoctorById(activeUid) : Promise.resolve(null),
        ]);

        setStats(statsData);
        setAppointments(apptsData);
        setPatients(patientsData);
        if (docData) setDoctorProfile(docData);
      } catch (err) {
        console.warn("[DoctorPortal] Error loading dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  // Determine time-of-day greeting
  const currentHour = new Date().getHours();
  const timeGreeting =
    currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";

  const doctorDisplayName = doctorProfile?.name
    ? doctorProfile.name.startsWith("Dr.")
      ? doctorProfile.name
      : `Dr. ${doctorProfile.name}`
    : session?.name
      ? session.name.startsWith("Dr.")
        ? session.name
        : `Dr. ${session.name}`
      : "Doctor";

  const doctorSpecialty =
    doctorProfile?.specialty || session?.specialty || "General Medicine";
  const doctorQualification = doctorProfile?.qualification || "Medical Practitioner";
  const doctorLocation = doctorProfile?.location || "Consultation Portal";

  const initials = doctorProfile?.name
    ? doctorProfile.name
      .replace(/^Dr\.?\s*/i, "")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "DR"
    : session?.name
      ? session.name
        .replace(/^Dr\.?\s*/i, "")
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "DR"
      : "DR";

  const isVerified = doctorProfile?.verificationStatus === "verified";
  const isDeclined = doctorProfile?.verificationStatus === "rejected";

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#1D1F22] font-sans antialiased selection:bg-[#E3202B] selection:text-white pb-14 relative overflow-x-hidden">
      {/* Signature Ambient Red Navbar Glow */}
      <div className="ae-top-nav-glow" />

      {/* ============ STANDARD DOCTOR NAVBAR ============ */}
      <DoctorNavbar activeTab="dashboard" />

      {/* ============ MAIN DOCTOR DASHBOARD CONTAINER ============ */}
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">

        {/* ============ ADMIN VERIFICATION STATUS BANNER ============ */}
        {!isLoading && doctorProfile && !isVerified && (
          <div
            className={`rounded-2xl p-4 sm:p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDeclined
                ? "bg-red-50/90 border-red-200 text-red-900"
                : "bg-amber-50/90 border-amber-200 text-amber-950"
              }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${isDeclined ? "bg-red-600" : "bg-amber-500 animate-pulse"
                  }`}
              />
              <div>
                <p className="text-sm font-bold">
                  {isDeclined
                    ? "Verification Status: Declined by Administrator"
                    : "Verification Status: Unverified (Pending Admin Approval)"}
                </p>
                <p className="text-xs opacity-85 mt-0.5">
                  {isDeclined
                    ? "Your medical practitioner verification request was declined. Please contact aethriz.ai@gmail.com to appeal or update your registration details."
                    : "Your doctor account is currently marked as Unverified. Patients will be able to discover and book you with a Verified badge once an Administrator accepts your request."}
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider self-start sm:self-center flex-shrink-0 ${isDeclined
                  ? "bg-red-100 text-red-800 border border-red-300"
                  : "bg-amber-100 text-amber-900 border border-amber-300"
                }`}
            >
              {isDeclined ? "Declined" : "Unverified"}
            </span>
          </div>
        )}

        {/* ============ SUBHEADER: GREETING & TRIAGE RADAR ============ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#E3202B] border border-red-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E3202B] ae-pulse-glow" />
                AI triage live
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Database synced
              </span>
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-[40px] font-semibold tracking-tight text-[#1D1F22] mt-1"
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
              {timeGreeting}, {doctorDisplayName}.
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              {doctorSpecialty} · {doctorQualification} · {doctorLocation}
            </p>
            <div className="text-xs font-semibold text-[#1D1F22] mt-2 flex flex-wrap items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#E3202B] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>
                Today: {stats.todayConsults} scheduled {stats.todayConsults === 1 ? "consultation" : "consultations"} · {stats.reportsToSignOff} reports in database.
              </span>
              <Link href="/doctor/nexus" className="text-[#E3202B] hover:underline font-bold ml-1">
                View triage queue →
              </Link>
            </div>
          </div>

          {/* Right Top Status Cards */}
          <div className="flex items-center gap-3">
            <div className="p-3 px-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-wider text-[#E3202B] font-bold">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                <span>Live Status</span>
              </div>
              <p className="text-xs font-bold text-[#1D1F22] mt-0.5">
                {stats.todayConsults > 0 ? `${stats.todayConsults} active bookings` : "Queue clear"}
              </p>
            </div>

            <div className="p-3 px-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-[10.5px] font-mono uppercase tracking-wider text-[#64748B] font-bold">
                ABDM Standards
              </div>
              <p className="text-xs font-bold text-emerald-600 mt-0.5">Compliant</p>
            </div>
          </div>
        </div>

        {/* ============ 4 TOP METRIC CARDS (DYNAMIC SUPABASE COUNTS) ============ */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className="p-5 rounded-[24px] bg-white border border-slate-200/80 shadow-[0_8px_24px_rgba(29,31,34,0.03)] flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
                <span>REGISTERED PATIENTS</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-[#1D1F22]">{stats.activePatients}</span>
                  <span className="text-xs text-[#64748B]">cohort</span>
                </div>
                <span className="text-xs font-semibold text-[#64748B]">Real-time database count</span>
              </div>
              <div className="h-1 rounded-full bg-slate-100 overflow-hidden mt-1">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: stats.activePatients > 0 ? "100%" : "0%" }} />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-5 rounded-[24px] bg-white border border-slate-200/80 shadow-[0_8px_24px_rgba(29,31,34,0.03)] flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
                <span>TODAY&apos;S BOOKINGS</span>
                <span className="text-[#E3202B]">⏰</span>
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-[#1D1F22]">{stats.todayConsults}</span>
                  <span className="text-xs text-[#64748B]">sessions</span>
                </div>
                <span className="text-xs font-semibold text-[#E3202B]">
                  {stats.todayConsults > 0 ? "Upcoming consultations pending" : "No bookings today"}
                </span>
              </div>
              <div className="h-1 rounded-full bg-slate-100 overflow-hidden mt-1">
                <div className="h-full bg-[#E3202B] rounded-full" style={{ width: stats.todayConsults > 0 ? "60%" : "0%" }} />
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-5 rounded-[24px] bg-white border border-slate-200/80 shadow-[0_8px_24px_rgba(29,31,34,0.03)] flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
                <span>HEALTH PROFILES</span>
                <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-[#1D1F22]">{stats.reportsToSignOff}</span>
                  <span className="text-xs text-[#64748B]">synced</span>
                </div>
                <span className="text-xs text-[#64748B]">Health profiles recorded</span>
              </div>
              <div className="h-1 rounded-full bg-slate-100 overflow-hidden mt-1">
                <div className="h-full bg-slate-400 rounded-full" style={{ width: stats.reportsToSignOff > 0 ? "80%" : "0%" }} />
              </div>
            </div>

            {/* Metric 4 */}
            <div className="p-5 rounded-[24px] bg-white border border-slate-200/80 shadow-[0_8px_24px_rgba(29,31,34,0.03)] flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
                <span>TRIAGE ALERTS</span>
                <svg className="w-3.5 h-3.5 text-[#E3202B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-[#1D1F22]">{stats.aiInsightsReady}</span>
                  <span className="text-xs text-[#64748B]">flagged</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#E3202B]">
                  <span>{stats.aiInsightsReady > 0 ? "Active triage queue" : "All optimal"}</span>
                </div>
              </div>
              <div className="h-1 rounded-full bg-slate-100 overflow-hidden mt-1">
                <div className="h-full bg-[#E3202B] rounded-full" style={{ width: stats.aiInsightsReady > 0 ? "100%" : "0%" }} />
              </div>
            </div>
          </div>
        )}

        {/* ============ 2-COLUMN MAIN CONTENT ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* ============ LEFT COLUMN: CONSULTATIONS & FEED (8 COLS) ============ */}
          <div className="lg:col-span-8 space-y-5">

            {/* CARD: UPCOMING CONSULTATIONS */}
            <div className="p-6 rounded-[28px] bg-white border border-slate-200/80 shadow-[0_8px_24px_rgba(29,31,34,0.03)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#E3202B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                  <h3 className="text-sm font-semibold text-[#1D1F22]">Upcoming consultations</h3>
                  <span className="text-xs text-[#64748B] hidden sm:inline">· Bookings scheduled with you</span>
                </div>
                <span className="text-xs font-semibold text-[#64748B]">
                  {appointments.length} {appointments.length === 1 ? "booking" : "bookings"}
                </span>
              </div>

              {isLoading ? (
                <CardSkeleton rows={2} />
              ) : appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#E3202B] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {apt.patientName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#1D1F22]">{apt.patientName}</h4>
                            <span className="text-[11px] text-[#64748B] font-mono">{apt.patientPhone}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                              {apt.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#E3202B] font-semibold mt-0.5">
                            {new Date(apt.appointmentDate).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} at{" "}
                            {new Date(apt.appointmentDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {apt.notes ? ` · Note: ${apt.notes}` : ""}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/doctor/nexus"
                        className="px-4 py-2 rounded-full text-xs font-semibold text-white shadow-xs hover:opacity-95 text-center cursor-pointer flex-shrink-0"
                        style={{ background: "linear-gradient(180deg, #32363A 0%, #1D1F22 100%)" }}
                      >
                        Open teleconsult
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No consultations scheduled"
                  description="There are currently no patient consultations booked with you. When patients book online or in-clinic visits through your profile, they will appear here in real-time."
                  actionText="View Appointment Schedule"
                  actionHref="/doctor/appointments"
                  className="p-6 sm:p-8"
                />
              )}
            </div>

            {/* CARD: AI PATIENT ANALYSIS FEED */}
            <div className="p-6 rounded-[28px] bg-white border border-slate-200/80 shadow-[0_8px_24px_rgba(29,31,34,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#1D1F22]">Patient cohort summaries</h3>
                  <p className="text-[11.5px] text-[#64748B]">Real patient records synced from user_profiles & health_details</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>

              {isLoading ? (
                <CardSkeleton rows={2} />
              ) : patients.length > 0 ? (
                <div className="space-y-3">
                  {patients.map((pt) => (
                    <div key={pt.id} className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1D1F22]">{pt.name}</span>
                          <span className="text-[11px] text-[#64748B] font-mono">{pt.phone}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-[#475569]">
                            {pt.gender} · {pt.language}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#94A3B8]">
                          {pt.updatedAt ? new Date(pt.updatedAt).toLocaleDateString() : "Recent"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                          <span className="text-[11px] text-[#64748B]">Diet Pattern</span>
                          <p className="text-xs font-bold text-[#1D1F22] truncate">{pt.diet || "—"}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                          <span className="text-[11px] text-[#64748B]">Primary Goals</span>
                          <p className="text-xs font-bold text-[#E3202B] truncate">
                            {pt.goals.length > 0 ? pt.goals.join(", ") : "—"}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                          <span className="text-[11px] text-[#64748B]">Sleep Hours</span>
                          <p className="text-xs font-bold text-slate-700">{pt.sleepHours ? `${pt.sleepHours} hrs` : "—"}</p>
                        </div>
                      </div>

                      {pt.medicalHistory && (
                        <p className="text-xs text-[#475569]">
                          Medical history / notes: {pt.medicalHistory}
                        </p>
                      )}

                      <Link
                        href="/doctor/nexus"
                        className="block w-full py-2.5 rounded-xl text-center text-xs font-semibold text-white cursor-pointer hover:opacity-95 transition-all shadow-xs"
                        style={{ background: "linear-gradient(180deg, #32363A 0%, #1D1F22 100%)" }}
                      >
                        Open in 3D Nexus Scanner
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No registered patients yet"
                  description="When patients register through the portal and submit their health profiles, their data will appear here for clinical triage."
                  actionText="Patient Directory"
                  actionHref="/doctor/patients"
                  className="p-6 sm:p-8"
                />
              )}
            </div>

          </div>

          {/* ============ RIGHT COLUMN: DOCTOR PROFILE & ACTIONS (4 COLS) ============ */}
          <div className="lg:col-span-4 space-y-5">

            {/* DOCTOR CREDENTIALS & PRACTICE CARD (FETCHED DYNAMICALLY FROM DB) */}
            <div className="p-6 rounded-[28px] bg-white border border-slate-200/80 shadow-[0_8px_24px_rgba(29,31,34,0.03)] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#64748B] font-bold">
                  Your Doctor Profile
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${isVerified
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : isDeclined
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isVerified
                        ? "bg-emerald-500"
                        : isDeclined
                          ? "bg-red-500"
                          : "bg-amber-500"
                      }`}
                  />
                  <span>
                    {isVerified ? "Verified Practitioner" : isDeclined ? "Declined" : "Unverified"}
                  </span>
                </span>
              </div>

              {/* Doctor Avatar + Name + Specialization */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#E3202B] text-white flex items-center justify-center font-bold text-base shadow-xs flex-shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#1D1F22] truncate">
                    {doctorDisplayName}
                  </h3>
                  <p className="text-xs font-semibold text-[#E3202B] truncate">
                    {doctorSpecialty}
                  </p>
                  <p className="text-[11px] text-[#64748B] truncate">
                    {doctorQualification}
                  </p>
                </div>
              </div>

              {/* Practice Highlights Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80">
                  <span className="text-[10px] font-mono uppercase text-[#64748B]">Registration</span>
                  <p className="text-xs font-bold text-[#1D1F22] truncate mt-0.5">
                    {doctorProfile?.registrationNo
                      ? `${doctorProfile.registrationNo}`
                      : isVerified
                        ? "Verified"
                        : "Unverified"}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80">
                  <span className="text-[10px] font-mono uppercase text-[#64748B]">Experience</span>
                  <p className="text-xs font-bold text-[#1D1F22] truncate mt-0.5">
                    {doctorProfile?.experience ? `${doctorProfile.experience} Years` : "Experienced"}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80">
                  <span className="text-[10px] font-mono uppercase text-[#64748B]">Video Consult</span>
                  <p className="text-xs font-bold text-emerald-700 truncate mt-0.5">
                    ₹{doctorProfile?.consultFee || 800}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80">
                  <span className="text-[10px] font-mono uppercase text-[#64748B]">In-Clinic Visit</span>
                  <p className="text-xs font-bold text-[#1D1F22] truncate mt-0.5">
                    ₹{doctorProfile?.clinicFee || 1000}
                  </p>
                </div>
              </div>

              {/* Location & Languages */}
              <div className="space-y-1.5 text-xs text-[#475569] pt-1">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#E3202B] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="truncate">{doctorLocation}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-serif font-bold text-slate-500">文</span>
                  <span className="truncate">
                    {doctorProfile?.languages && doctorProfile.languages.length > 0
                      ? doctorProfile.languages.join(", ")
                      : "English, हिन्दी"}
                  </span>
                </div>
              </div>

              {/* Bio summary */}
              {doctorProfile?.bio && (
                <p className="text-[11.5px] text-[#64748B] line-clamp-3 leading-relaxed border-t border-slate-100 pt-2">
                  {doctorProfile.bio}
                </p>
              )}

              {/* Link to View / Edit Full Profile */}
              <Link
                href={doctorProfile?.id ? `/doctor/profile?id=${doctorProfile.id}` : "/doctor/profile"}
                className="block w-full py-2.5 rounded-xl text-center text-xs font-semibold text-[#1D1F22] bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer shadow-2xs"
              >
                View Public Profile →
              </Link>
            </div>

            {/* CLINICIAN QUICK ACTIONS */}
            <div className="p-6 rounded-[28px] bg-white border border-slate-200/80 shadow-[0_8px_24px_rgba(29,31,34,0.03)] space-y-4">
              <h3 className="text-sm font-semibold text-[#1D1F22]">Clinician Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/doctor/appointments"
                  className="block p-3 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-[#1D1F22] transition-colors"
                >
                  📅 Manage Appointment Schedule →
                </Link>
                <Link
                  href="/doctor/patients"
                  className="block p-3 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-[#1D1F22] transition-colors"
                >
                  👥 View Patient Cohort →
                </Link>
                <Link
                  href="/doctor/nexus"
                  className="block p-3 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-[#1D1F22] transition-colors"
                >
                  🫀 Launch 3D Nexus Scanner →
                </Link>
                <Link
                  href="/stories"
                  className="block p-3 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-[#1D1F22] transition-colors"
                >
                  ✍ Publish Medical Article →
                </Link>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
