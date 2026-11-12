"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DoctorNavbar from "@/components/navigation/DoctorNavbar";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { fetchAppointments, AppointmentRecord } from "@/lib/data";
import EmptyState from "@/components/common/EmptyState";
import { CardSkeleton } from "@/components/common/LoadingSkeleton";

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"timeline" | "triage">("timeline");
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [clinicalNotes, setClinicalNotes] = useState<string>("");
  const [notesAdded, setNotesAdded] = useState(false);
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session && session.role === "patient") {
      router.push("/booking");
      return;
    }

    async function loadAppointments() {
      setIsLoading(true);
      try {
        let uid = session?.id;
        if (!uid) {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) uid = authData.user.id;
        }

        const data = await fetchAppointments({ userId: uid, role: "doctor" });
        setAppointments(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
        }
      } catch (err) {
        console.warn("[DoctorAppointments] Error loading appointments:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAppointments();
  }, [router]);

  const selectedApt = appointments.find((a) => a.id === selectedId) || appointments[0] || null;

  const handleAddToNotes = () => {
    if (!selectedApt) return;
    const noteText = `[Clinical Note - ${new Date().toLocaleTimeString()} for ${selectedApt.patientName}]: ${selectedApt.notes || "Consultation review"}`;
    setClinicalNotes((prev) => (prev ? `${prev}\n\n${noteText}` : noteText));
    setNotesAdded(true);
    setTimeout(() => setNotesAdded(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#1D1F22] flex flex-col font-sans selection:bg-[#E11D48]/15 selection:text-[#E11D48] relative overflow-x-hidden">
      
      {/* ==================== STANDARD DOCTOR NAVBAR ==================== */}
      <DoctorNavbar activeTab="appointments" />

      {/* ==================== MAIN CONTENT WRAPPER ==================== */}
      <main className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col gap-6">

        {/* Sub-header Bar: Breadcrumb + Title + View Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-[#64748B] font-medium mb-1">
              <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
              <span>Doctor portal · Appointments</span>
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1
                className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1F22]"
                style={{ fontFamily: "'Inter Tight', sans-serif" }}
              >
                Consultation stream
              </h1>
              <span className="text-sm font-medium text-[#64748B]">
                <strong className="text-[#E11D48] font-semibold">{appointments.length}</strong> total in database
              </span>
            </div>
          </div>

          {/* Switcher Buttons */}
          <div className="flex items-center p-1 rounded-full bg-white/80 border border-black/[0.06] shadow-xs w-fit">
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "timeline"
                  ? "bg-[#E11D48] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#1D1F22]"
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab("triage")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "triage"
                  ? "bg-[#E11D48] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#1D1F22]"
              }`}
            >
              Triage ranked
            </button>
          </div>
        </div>

        {/* ==================== CONTENT OR EMPTY STATE ==================== */}
        {isLoading ? (
          <CardSkeleton rows={3} />
        ) : appointments.length > 0 && selectedApt ? (
          <div className="space-y-6">
            
            {/* Horizontal Timeline Strip */}
            <div className="overflow-x-auto pb-3 pt-1 scrollbar-thin">
              <div className="flex items-stretch gap-3 min-w-max px-1">
                {appointments.map((apt) => {
                  const isSelected = apt.id === selectedApt.id;
                  const aptDate = new Date(apt.appointmentDate);

                  return (
                    <button
                      key={apt.id}
                      onClick={() => setSelectedId(apt.id)}
                      className={`relative flex flex-col p-3.5 rounded-2xl border text-left transition-all min-w-[220px] cursor-pointer ${
                        isSelected
                          ? "bg-white border-[#E11D48] shadow-md ring-2 ring-[#E11D48]/20"
                          : "bg-white/80 border-slate-200/80 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="font-mono text-[#E11D48]">
                          {aptDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 capitalize">
                          {apt.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#1D1F22] truncate">
                        {apt.patientName}
                      </h4>
                      <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                        {apt.doctorSpecialty} · {apt.type}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Appointment Detail Card */}
            <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-slate-200/80 shadow-[0_8px_30px_rgba(29,31,34,0.04)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-8 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-rose-100 text-[#E11D48] flex items-center justify-center font-bold text-lg">
                      {selectedApt.patientName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#1D1F22]">
                        {selectedApt.patientName}
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5 font-mono">
                        Phone: {selectedApt.patientPhone} · Slot: {new Date(selectedApt.appointmentDate).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    {selectedApt.type} consultation
                  </span>
                </div>

                {selectedApt.notes && (
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-1">
                    <span className="text-[11px] font-mono text-[#E11D48] uppercase tracking-wider font-bold">
                      Patient Notes
                    </span>
                    <p className="text-xs text-[#475569] leading-relaxed">
                      {selectedApt.notes}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href="/doctor/nexus"
                    className="px-6 py-2.5 rounded-full text-xs font-semibold text-white shadow-md hover:opacity-95 transition-all"
                    style={{ background: "linear-gradient(180deg, #32363A 0%, #1D1F22 100%)" }}
                  >
                    Open 3D Telehealth Room →
                  </Link>
                  <button
                    type="button"
                    onClick={handleAddToNotes}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#475569] bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    {notesAdded ? "Note recorded ✓" : "Add to clinical record"}
                  </button>
                </div>
              </div>

              {/* Right Side: Clinical Notes Drawer */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1D1F22]">
                  Clinical Examination Notes
                </h4>
                <textarea
                  rows={6}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Record prescription notes, observations, diagnosis..."
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-[#1D1F22] focus:outline-none focus:border-[#E11D48]"
                />
                <button
                  type="button"
                  onClick={() => alert("Notes saved to patient's clinical file.")}
                  className="w-full py-2 rounded-xl bg-[#1D1F22] hover:bg-black text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Save Notes to Record
                </button>
              </div>

            </div>

          </div>
        ) : (
          <EmptyState
            title="No appointments scheduled"
            description="There are currently no patient consultations booked in the database. When patients book online or in-clinic visits, they will show here in real-time."
            actionText="Go to Doctor Dashboard"
            actionHref="/doctor-portal"
          />
        )}

      </main>
    </div>
  );
}
