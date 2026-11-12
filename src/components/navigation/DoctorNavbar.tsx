"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { clearSession, getSession } from "@/lib/auth";
import { fetchDoctorById, fetchAppointments, DoctorRecord, AppointmentRecord } from "@/lib/data";
import { supabase } from "@/lib/supabase";

export type DoctorNavTab = "dashboard" | "patients" | "appointments" | "nexus" | "join";

interface Props {
  activeTab: DoctorNavTab;
}

export default function DoctorNavbar({ activeTab }: Props) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<DoctorRecord | null>(null);
  const [alerts, setAlerts] = useState<AppointmentRecord[]>([]);

  useEffect(() => {
    async function loadDoctorNavbarData() {
      try {
        const session = getSession();
        let targetId = session?.id;

        if (!targetId) {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            targetId = authData.user.id;
          }
        }

        if (targetId) {
          const [doc, apts] = await Promise.all([
            fetchDoctorById(targetId),
            fetchAppointments({ userId: targetId, role: "doctor", status: "confirmed" }),
          ]);
          if (doc) setDoctorProfile(doc);
          if (apts) setAlerts(apts);
        }
      } catch (err) {
        console.warn("[DoctorNavbar] Error loading doctor data:", err);
      }
    }

    loadDoctorNavbarData();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    clearSession();
    router.push("/login");
  };

  const session = getSession();

  // Formatted doctor display values
  const docDisplayName = doctorProfile?.name
    ? doctorProfile.name.startsWith("Dr.")
      ? doctorProfile.name
      : `Dr. ${doctorProfile.name}`
    : session?.name
    ? session.name.startsWith("Dr.")
      ? session.name
      : `Dr. ${session.name}`
    : "Dr. Clinician";

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

  const specialty = doctorProfile?.specialty || session?.specialty || "Clinical Specialist";
  const profileHref = doctorProfile?.id ? `/doctor/profile?id=${doctorProfile.id}` : "/doctor/profile";

  return (
    <header className="sticky top-3 sm:top-4 z-40 px-3 sm:px-6 w-full relative">
      <nav
        aria-label="Doctor Portal Navigation"
        className="relative max-w-[1280px] mx-auto p-2 sm:p-2.5 pl-4 sm:pl-5 flex items-center justify-between gap-3 sm:gap-4 rounded-full border border-slate-200/80 bg-white shadow-[0_4px_24px_rgba(29,31,34,0.04)]"
      >
        {/* Left: Brand Logo & Doctor Portal Tag */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <Link href="/doctor-portal" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 rounded-[9px] overflow-hidden shadow-xs flex-shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/brand/aethriz-hero-logo.png"
                alt="AETHRIZ"
                width={32}
                height={32}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span
              className="font-bold text-[16px] tracking-[0.14em] text-[#1D1F22]"
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
              AETHRIZ
            </span>
          </Link>

          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-[#1D1F22] text-[10px] font-bold text-white tracking-[0.12em] font-mono">
            DOCTOR PORTAL
          </span>
        </div>

        {/* Center Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 text-[13px] font-medium text-[#545B61]">
          <Link
            href="/doctor-portal"
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-white border border-slate-200/90 text-[#1D1F22] font-semibold shadow-2xs"
                : "hover:text-[#1D1F22] hover:bg-slate-50"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/doctor/patients"
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === "patients"
                ? "bg-white border border-slate-200/90 text-[#1D1F22] font-semibold shadow-2xs"
                : "hover:text-[#1D1F22] hover:bg-slate-50"
            }`}
          >
            Patients
          </Link>
          <Link
            href="/doctor/appointments"
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === "appointments"
                ? "bg-white border border-slate-200/90 text-[#1D1F22] font-semibold shadow-2xs"
                : "hover:text-[#1D1F22] hover:bg-slate-50"
            }`}
          >
            Appointments
          </Link>
          <Link
            href="/doctor/nexus"
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === "nexus"
                ? "bg-white border border-slate-200/90 text-[#1D1F22] font-semibold shadow-2xs"
                : "hover:text-[#1D1F22] hover:bg-slate-50"
            }`}
          >
            AI Analysis
          </Link>
          <Link
            href="/doctor/join"
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === "join"
                ? "bg-white border border-slate-200/90 text-[#1D1F22] font-semibold shadow-2xs"
                : "hover:text-[#1D1F22] hover:bg-slate-50"
            }`}
          >
            Join the team
          </Link>
        </div>

        {/* Right Action: Status Pill, Notifications & Doctor Profile with Logout */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Green Status Pill */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Available</span>
          </span>

          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
              className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {alerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E3202B] animate-pulse" />
              )}
            </button>

            {/* Dropdown Notification Menu */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-2xl p-3 z-50 animate-fade-in text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold text-[#1D1F22]">
                  <span>Clinical Alerts</span>
                  <span className={`text-[10px] ${alerts.length > 0 ? "text-[#E3202B] font-semibold" : "text-slate-400"}`}>
                    {alerts.length > 0 ? `${alerts.length} Pending` : "Queue Clear"}
                  </span>
                </div>
                <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                  {alerts.length > 0 ? (
                    alerts.slice(0, 5).map((apt) => (
                      <Link
                        key={apt.id}
                        href="/doctor/appointments"
                        onClick={() => setShowNotifications(false)}
                        className="block p-2.5 rounded-xl bg-rose-50/60 hover:bg-rose-100/70 border border-rose-100 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="block text-[#1D1F22]">{apt.patientName}</strong>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-100 text-[#E3202B] font-bold">
                            {apt.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#475569] mt-0.5">
                          {new Date(apt.appointmentDate).toLocaleDateString([], { month: "short", day: "numeric" })} at{" "}
                          {new Date(apt.appointmentDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {apt.notes ? ` · Note: ${apt.notes}` : ""}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <div className="py-5 text-center text-[#64748B]">
                      <p className="text-xs font-semibold text-[#1D1F22]">No pending clinical alerts</p>
                      <p className="text-[11px] text-[#94A3B8] mt-1">
                        Upcoming consultations booked by patients will appear here in real-time.
                      </p>
                    </div>
                  )}
                </div>
                {alerts.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 text-center">
                    <Link
                      href="/doctor/appointments"
                      onClick={() => setShowNotifications(false)}
                      className="text-[11px] font-bold text-[#E3202B] hover:underline"
                    >
                      View all consultations in calendar →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Doctor Profile Pill: Dynamic initials, name, and specialty */}
          <Link
            href={profileHref}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[#E3202B] text-white flex items-center justify-center font-bold text-xs shadow-xs transition-transform group-hover:scale-105">
              {initials}
            </div>
            <div className="hidden sm:flex flex-col text-left max-w-[150px]">
              <span className="text-xs font-bold leading-tight text-[#1D1F22] group-hover:text-[#E3202B] transition-colors truncate">
                {docDisplayName}
              </span>
              <span className="text-[10px] text-[#64748B] leading-none mt-0.5 truncate">
                {specialty}
              </span>
            </div>
          </Link>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            title="Sign out of doctor portal"
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}
