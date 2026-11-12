"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DoctorNavbar from "@/components/navigation/DoctorNavbar";
import { getSession } from "@/lib/auth";
import { fetchDoctorPatients, PatientCohortRecord } from "@/lib/data";
import EmptyState from "@/components/common/EmptyState";
import { CardSkeleton } from "@/components/common/LoadingSkeleton";

type Severity = "Attention" | "Watch" | "Optimal";

interface Patient {
  id: string;
  name: string;
  avatar: string;
  avatarBg: string;
  gender: string;
  age: number;
  languages: string;
  diet: string;
  severity: Severity;
  flag: string;
  flagColor: string;
  summaryHeadline: string;
  hba1c: {
    value: string;
    trend: string;
    percent: number;
    alert: boolean;
  };
  glucosePeak: {
    value: string;
    label?: string;
    note: string;
    percent: number;
    alert: boolean | "watch";
  };
  vitaminD: {
    value: string;
    label?: string;
    note: string;
    percent: number;
    alert: boolean | "watch";
  };
  glucoseData: { time: string; val: number }[];
  peakCallout: string;
  peakAnalysis: string;
  foodScan: {
    item: string;
    status: string;
    sugar: string;
  };
  sharedNote: string;
  teleconsultTime: string;
}

function mapCohortToPatient(record: PatientCohortRecord, index: number): Patient {
  const initials = record.name
    ? record.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "PT";

  const avatarColors = [
    "bg-rose-100 text-rose-800",
    "bg-purple-100 text-purple-900",
    "bg-emerald-100 text-emerald-800",
    "bg-amber-100 text-amber-800",
    "bg-blue-100 text-blue-800",
  ];
  const avatarBg = avatarColors[index % avatarColors.length];

  let age = 32;
  if (record.dob) {
    const birthYear = new Date(record.dob).getFullYear();
    if (!isNaN(birthYear)) {
      age = Math.max(18, new Date().getFullYear() - birthYear);
    }
  } else if (record.ageGroup) {
    const match = record.ageGroup.match(/\d+/);
    if (match) age = parseInt(match[0], 10);
  }

  let severity: Severity = "Optimal";
  let flag = "Optimal vitals";
  let flagColor = "text-[#10B981]";
  let summaryHeadline = "Telemetry within normal parameters";

  if (record.bp && (record.bp.includes("14") || record.bp.includes("15") || record.bp.includes("16"))) {
    severity = "Attention";
    flag = `BP ${record.bp}`;
    flagColor = "text-[#E3202B]";
    summaryHeadline = "Blood pressure elevation alert";
  } else if (record.medicalHistory) {
    severity = "Watch";
    flag = record.medicalHistory.slice(0, 24);
    flagColor = "text-amber-600";
    summaryHeadline = record.medicalHistory;
  } else if (record.allergies) {
    severity = "Watch";
    flag = `Allergy: ${record.allergies.slice(0, 18)}`;
    flagColor = "text-amber-600";
    summaryHeadline = `Allergies: ${record.allergies}`;
  }

  return {
    id: `AE-${record.id.slice(0, 5).toUpperCase()}`,
    name: record.name,
    avatar: initials,
    avatarBg,
    gender: record.gender || "—",
    age,
    languages: record.language || "English",
    diet: record.diet || "Standard diet",
    severity,
    flag,
    flagColor,
    summaryHeadline,
    hba1c: {
      value: record.bp ? `BP ${record.bp}` : "Normal",
      trend: record.medicalHistory ? `History: ${record.medicalHistory}` : "Baseline vitals active",
      percent: 50,
      alert: severity === "Attention",
    },
    glucosePeak: {
      value: record.weight ? `${record.weight} kg` : "70 kg",
      label: "BODY WEIGHT",
      note: record.height ? `Height: ${record.height} cm` : "Normal BMI",
      percent: 60,
      alert: false,
    },
    vitaminD: {
      value: `${record.sleepHours || 7} h`,
      label: "SLEEP AVERAGE",
      note: "Consistent cycle",
      percent: 75,
      alert: false,
    },
    glucoseData: [
      { time: "6 AM", val: 86 },
      { time: "Breakfast", val: 114 },
      { time: "Lunch", val: 126 },
      { time: "Dinner", val: 138 },
      { time: "Now", val: 102 },
    ],
    peakCallout: record.bp ? `BP ${record.bp}` : "Vitals optimal",
    peakAnalysis: record.medicalHistory
      ? `Registered clinical history: ${record.medicalHistory}. Vitals telemetry actively synced.`
      : "Patient biomarker and vitals telemetry currently within target parameters.",
    foodScan: {
      item: `Diet: ${record.diet || "Balanced"}`,
      status: "Tracked",
      sugar: "Standard",
    },
    sharedNote: `Patient record synced via encrypted health details. Goals: ${record.goals?.join(", ") || "General health"}.`,
    teleconsultTime: "Schedule teleconsult",
  };
}

export default function DoctorPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<"All" | Severity>("All");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [flaggedPatients, setFlaggedPatients] = useState<Record<string, boolean>>({});
  const [signedOffReports, setSignedOffReports] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [teleconsultModal, setTeleconsultModal] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session && session.role === "patient") {
      router.push("/dashboard");
      return;
    }

    async function loadPatients() {
      setIsLoading(true);
      try {
        const cohort = await fetchDoctorPatients();
        const mapped = cohort.map(mapCohortToPatient);
        setPatients(mapped);
        if (mapped.length > 0) {
          setSelectedPatientId(mapped[0].id);
        }
      } catch (err) {
        console.error("Failed to load patients:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadPatients();
  }, [router]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Filtered patients list
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchSeverity = filterSeverity === "All" || p.severity === filterSeverity;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.flag.toLowerCase().includes(q) ||
        p.diet.toLowerCase().includes(q);
      return matchSeverity && matchQuery;
    });
  }, [patients, searchQuery, filterSeverity]);

  const selectedPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  const counts = useMemo(() => {
    return {
      all: patients.length,
      attention: patients.filter((p) => p.severity === "Attention").length,
      watch: patients.filter((p) => p.severity === "Watch").length,
      optimal: patients.filter((p) => p.severity === "Optimal").length,
    };
  }, [patients]);

  const toggleFlag = (id: string) => {
    if (!selectedPatient) return;
    setFlaggedPatients((prev) => {
      const next = !prev[id];
      showToast(next ? `Flagged ${selectedPatient.name} for priority clinical review.` : `Removed flag for ${selectedPatient.name}.`);
      return { ...prev, [id]: next };
    });
  };

  const handleSignOff = (id: string) => {
    setSignedOffReports((prev) => ({ ...prev, [id]: true }));
    showToast(`Signed off AI analysis report for ${selectedPatient.name}. Verified.`);
  };

  const handleDownload = () => {
    showToast(`Downloading clinical PDF dossier for ${selectedPatient.name}...`);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F8] text-[#1D1F22] font-sans antialiased selection:bg-[#E3202B] selection:text-white pb-20 relative overflow-x-hidden">
      
      {/* ============ STANDARD DOCTOR NAVBAR ============ */}
      <DoctorNavbar activeTab="patients" />

      {/* ============ MAIN CONTAINER ============ */}
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        
        {/* ============ SUBHEADER: BREADCRUMB & TITLE ============ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#64748B]">
              Doctor portal · Patients
            </p>
            <h1
              className="text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight text-[#1D1F22] mt-1"
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
              Your patients.
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
            <span className="w-2 h-2 rounded-full bg-[#E3202B] animate-ping" />
            <span>Sorted by AI triage priority</span>
          </div>
        </div>

        {/* ============ SEARCH & FILTER BAR ============ */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Input Box */}
          <div className="relative flex-1 max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID or condition"
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white border border-slate-200/80 shadow-2xs text-xs sm:text-sm text-[#1D1F22] placeholder:text-slate-400 focus:outline-hidden focus:border-[#E3202B] focus:ring-2 focus:ring-red-100 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterSeverity("All")}
              className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
                filterSeverity === "All"
                  ? "bg-[#1D1F22] text-white shadow-xs"
                  : "bg-white text-[#64748B] hover:text-[#1D1F22] border border-slate-200/80"
              }`}
            >
              <span>All</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterSeverity === "All" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                {counts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterSeverity("Attention")}
              className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
                filterSeverity === "Attention"
                  ? "bg-[#E3202B] text-white shadow-xs"
                  : "bg-white text-[#64748B] hover:text-[#1D1F22] border border-slate-200/80"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E3202B]" />
              <span>Attention</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterSeverity === "Attention" ? "bg-white/20 text-white" : "bg-red-50 text-[#E3202B]"}`}>
                {counts.attention}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterSeverity("Watch")}
              className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
                filterSeverity === "Watch"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-white text-[#64748B] hover:text-[#1D1F22] border border-slate-200/80"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Watch</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterSeverity === "Watch" ? "bg-white/20 text-white" : "bg-amber-50 text-amber-700"}`}>
                {counts.watch}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterSeverity("Optimal")}
              className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
                filterSeverity === "Optimal"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-[#64748B] hover:text-[#1D1F22] border border-slate-200/80"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Optimal</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterSeverity === "Optimal" ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700"}`}>
                {counts.optimal}
              </span>
            </button>
          </div>
        </div>

        {/* ============ MAIN 2-COLUMN GRID ============ */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 space-y-3">
              <CardSkeleton rows={3} />
            </div>
            <div className="lg:col-span-7 bg-white rounded-[28px] p-6 border border-slate-200/80">
              <CardSkeleton rows={2} />
            </div>
          </div>
        ) : patients.length === 0 ? (
          <div className="bg-white rounded-[28px] p-8 sm:p-12 border border-slate-200/80 shadow-[0_8px_30px_rgba(29,31,34,0.03)]">
            <EmptyState
              icon={
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
              title="No registered patients yet"
              description="Your registered patient cohort and their real-time biomarker telemetry will automatically appear here once patients join."
              actionText="Patient Registration Portal"
              actionHref="/register"
            />
          </div>
        ) : selectedPatient ? (
          
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ============ LEFT COLUMN: PATIENT CARDS DIRECTORY (5 COLS) ============ */}
          <div className="lg:col-span-5 space-y-3">
            {filteredPatients.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80">
                <p className="text-sm font-semibold text-[#1D1F22]">No patients found</p>
                <p className="text-xs text-[#64748B] mt-1">Try relaxing your search terms or filter criteria.</p>
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); setFilterSeverity("All"); }}
                  className="mt-3 text-xs text-[#E3202B] font-semibold hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filteredPatients.map((patient) => {
                const isSelected = patient.id === selectedPatient.id;
                const isFlagged = !!flaggedPatients[patient.id];

                return (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`rounded-[22px] p-4 transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-white border-2 border-red-200/90 shadow-[0_12px_28px_rgba(227,32,43,0.08)] ring-2 ring-red-100/60 scale-[1.01]"
                        : "bg-white/80 hover:bg-white border border-slate-200/70 hover:shadow-xs hover:border-slate-300"
                    }`}
                  >
                    {/* Top Row: Avatar, Name, Metadata & Severity Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`w-11 h-11 rounded-full ${patient.avatarBg} font-bold text-sm flex items-center justify-center flex-shrink-0`}>
                            {patient.avatar}
                          </div>
                          <span
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                              patient.severity === "Attention"
                                ? "bg-[#E3202B]"
                                : patient.severity === "Watch"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-[#1D1F22]">
                              {patient.name}
                            </h3>
                            {isFlagged && (
                              <span className="text-[10px] text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded-full font-bold">
                                Flagged
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#64748B]">
                            {patient.age} y · {patient.gender} · {patient.languages} · {patient.id}
                          </p>
                        </div>
                      </div>

                      {/* Severity Pill */}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          patient.severity === "Attention"
                            ? "bg-red-50 text-[#E3202B] border-red-200/80"
                            : patient.severity === "Watch"
                            ? "bg-amber-50 text-amber-800 border-amber-200/80"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                        }`}
                      >
                        {patient.severity}
                      </span>
                    </div>

                    {/* Bottom Row: Diet on Left, Condition on Right */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[#64748B] text-[11px] font-medium truncate max-w-[55%]">
                        {patient.diet}
                      </span>
                      <span className={`text-[11px] font-bold ${patient.flagColor}`}>
                        {patient.flag}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ============ RIGHT COLUMN: DETAILED PATIENT TELEMETRY PANE (7 COLS) ============ */}
          <div className="lg:col-span-7 bg-white rounded-[28px] p-6 sm:p-7 border border-slate-200/80 shadow-[0_16px_40px_rgba(29,31,34,0.05)] space-y-6">
            
            {/* Header: Avatar, Name, Condition Headline, and Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-full ${selectedPatient.avatarBg} font-bold text-base flex items-center justify-center flex-shrink-0`}>
                  {selectedPatient.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-[#1D1F22]">
                      {selectedPatient.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-[#E3202B] border border-rose-200/60">
                      {selectedPatient.summaryHeadline}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {selectedPatient.id} · {selectedPatient.age} y · {selectedPatient.gender} · {selectedPatient.languages} · {selectedPatient.diet}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Download PDF & Flag Patient */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleDownload}
                  title="Download clinical report PDF"
                  className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-[#1D1F22] border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => toggleFlag(selectedPatient.id)}
                  title={flaggedPatients[selectedPatient.id] ? "Remove flag" : "Flag for urgent review"}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                    flaggedPatients[selectedPatient.id]
                      ? "bg-red-50 border-red-300 text-red-600"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-red-600 border-slate-200/80"
                  }`}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={flaggedPatients[selectedPatient.id] ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 3 Biomarker Metric Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              {/* Metric 1: HBA1C */}
              <div className="p-4 rounded-2xl bg-[#FCFDFE] border border-slate-200/70 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-bold">
                  HBA1C
                </span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold ${selectedPatient.hba1c.alert ? "text-[#E3202B]" : "text-[#1D1F22]"}`}>
                    {selectedPatient.hba1c.value}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B]">
                  {selectedPatient.hba1c.trend}
                </p>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full ${selectedPatient.hba1c.alert ? "bg-[#E3202B]" : "bg-emerald-500"}`}
                    style={{ width: `${selectedPatient.hba1c.percent}%` }}
                  />
                </div>
              </div>

              {/* Metric 2: GLUCOSE PEAK */}
              <div className="p-4 rounded-2xl bg-[#FCFDFE] border border-slate-200/70 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-bold">
                  {selectedPatient.glucosePeak.label || "GLUCOSE PEAK"}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold ${selectedPatient.glucosePeak.alert === true ? "text-[#E3202B]" : selectedPatient.glucosePeak.alert === "watch" ? "text-amber-600" : "text-[#1D1F22]"}`}>
                    {selectedPatient.glucosePeak.value}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B]">
                  {selectedPatient.glucosePeak.note}
                </p>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full ${selectedPatient.glucosePeak.alert === true ? "bg-[#E3202B]" : selectedPatient.glucosePeak.alert === "watch" ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${selectedPatient.glucosePeak.percent}%` }}
                  />
                </div>
              </div>

              {/* Metric 3: VITAMIN D */}
              <div className="p-4 rounded-2xl bg-[#FCFDFE] border border-slate-200/70 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-bold">
                  {selectedPatient.vitaminD.label || "VITAMIN D"}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold ${selectedPatient.vitaminD.alert === true ? "text-[#E3202B]" : selectedPatient.vitaminD.alert === "watch" ? "text-amber-600" : "text-[#1D1F22]"}`}>
                    {selectedPatient.vitaminD.value}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B]">
                  {selectedPatient.vitaminD.note}
                </p>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full ${selectedPatient.vitaminD.alert === true ? "bg-[#E3202B]" : selectedPatient.vitaminD.alert === "watch" ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${selectedPatient.vitaminD.percent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Continuous Glucose Monitoring (CGM) Graph Card */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/70 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#1D1F22] flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E3202B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  <span>Glucose · last 24 h</span>
                </span>
                <span className="text-[#E3202B] font-bold">
                  Evening spike
                </span>
              </div>

              {/* CGM SVG Curve Chart */}
              <div className="relative w-full h-36 select-none">
                <svg viewBox="0 0 540 140" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="glucoseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E3202B" stopOpacity="0.32" />
                      <stop offset="60%" stopColor="#E3202B" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#E3202B" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Target Zone Shading: 70 - 140 mg/dL */}
                  <rect
                    x="20"
                    y="45"
                    width="500"
                    height="60"
                    fill="#10B981"
                    fillOpacity="0.05"
                    rx="4"
                  />
                  <line
                    x1="20"
                    y1="45"
                    x2="520"
                    y2="45"
                    stroke="#10B981"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    strokeOpacity="0.35"
                  />
                  <line
                    x1="20"
                    y1="105"
                    x2="520"
                    y2="105"
                    stroke="#10B981"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    strokeOpacity="0.35"
                  />

                  {/* Fill Under Curve */}
                  <path
                    d="M 25 102 C 60 102, 90 98, 120 86 C 145 76, 175 78, 205 92 C 235 102, 265 65, 305 78 C 340 92, 385 104, 435 22 C 465 24, 495 56, 520 62 L 520 120 L 25 120 Z"
                    fill="url(#glucoseGrad)"
                  />

                  {/* Glucose Line Path */}
                  <path
                    d="M 25 102 C 60 102, 90 98, 120 86 C 145 76, 175 78, 205 92 C 235 102, 265 65, 305 78 C 340 92, 385 104, 435 22 C 465 24, 495 56, 520 62"
                    fill="none"
                    stroke="#E3202B"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />

                  {/* Key Points */}
                  <circle cx="25" cy="102" r="3.5" fill="#E3202B" />
                  <circle cx="120" cy="86" r="3.5" fill="#E3202B" />
                  <circle cx="305" cy="78" r="3.5" fill="#E3202B" />
                  <circle cx="520" cy="62" r="3.5" fill="#E3202B" />

                  {/* Peak Marker Dot (Dinner 168 mg/dL) */}
                  <circle cx="435" cy="22" r="10" fill="#E3202B" fillOpacity="0.2" className="animate-ping" />
                  <circle cx="435" cy="22" r="5" fill="#E3202B" stroke="#FFFFFF" strokeWidth="2" />
                </svg>

                {/* X-axis labels */}
                <div className="flex justify-between text-[10px] font-semibold text-[#94A3B8] px-2 mt-1">
                  <span>6 AM</span>
                  <span>Breakfast</span>
                  <span>Lunch</span>
                  <span>Dinner</span>
                  <span>Now</span>
                </div>
              </div>

              {/* Callout Banner Below Graph */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2.5 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-[#1D1F22] text-white font-mono text-[11px] font-semibold flex-shrink-0">
                  {selectedPatient.peakCallout}
                </span>
                <span className="text-[#64748B] font-medium leading-relaxed">
                  {selectedPatient.peakAnalysis}
                </span>
              </div>
            </div>

            {/* Split Telemetry Cards: AI Food Scan & AETHRIZ Summary Shared */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Card 1: AI Food Scan */}
              <div className="p-4 rounded-2xl bg-[#FCFDFE] border border-slate-200/70 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200/60 text-[#E3202B] flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-[#1D1F22]">AI food scan</span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-red-50 text-[#E3202B] border border-red-200/80">
                      {selectedPatient.foodScan.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                    {selectedPatient.foodScan.item}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[9px] font-mono text-[#94A3B8] uppercase block">ADDED SUGAR</span>
                  <span className="text-xs font-bold text-[#E3202B]">{selectedPatient.foodScan.sugar}</span>
                </div>
              </div>

              {/* Card 2: AETHRIZ summary shared */}
              <div className="p-4 rounded-2xl bg-[#FCFDFE] border border-slate-200/70 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E3202B] to-[#991B1B] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l2.5 6.5L21 11l-5 4.5L17.5 22 12 18.5 6.5 22 8 15.5 3 11l6.5-2.5z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-[#1D1F22] block">AETHRIZ summary shared</span>
                  <p className="text-[11px] text-[#64748B] mt-0.5 leading-tight">
                    {selectedPatient.sharedNote}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Action Buttons: Join Teleconsult & Sign Off AI Report */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTeleconsultModal(true)}
                className="sm:col-span-8 py-3 px-6 rounded-full text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(227,32,43,0.28)] hover:opacity-95 active:scale-98 transition-all cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #E3202B 0%, #C41822 100%)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                <span>{selectedPatient.teleconsultTime}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSignOff(selectedPatient.id)}
                className={`sm:col-span-4 py-3 px-4 rounded-full text-xs sm:text-sm font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  signedOffReports[selectedPatient.id]
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : "bg-[#F4F5F8] text-[#1D1F22] hover:bg-slate-200/80 border-slate-200/80"
                }`}
              >
                {signedOffReports[selectedPatient.id] ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Signed off</span>
                  </>
                ) : (
                  <span>Sign off AI report</span>
                )}
              </button>
            </div>
          </div>
        </div>
      
        ) : null}
        </main>

      {/* ============ TELECONSULT POPUP MODAL ============ */}
      {teleconsultModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-base font-bold text-[#1D1F22]">Encrypted Teleconsult Room</h3>
              </div>
              <button
                type="button"
                onClick={() => setTeleconsultModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#1D1F22] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="relative aspect-video rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center text-center p-4">
              <div className="space-y-2 z-10 text-white">
                <div className="w-16 h-16 rounded-full bg-white/10 mx-auto flex items-center justify-center text-xl font-bold border border-white/20">
                  {selectedPatient.avatar}
                </div>
                <p className="text-sm font-semibold">{selectedPatient.name}</p>
                <p className="text-xs text-slate-400">Waiting in patient waiting room · Telehealth HD enabled</p>
              </div>

              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/50 text-[10px] text-white font-mono backdrop-blur-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>AES-256 GCM Live</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#64748B]">
              <p className="font-semibold text-[#1D1F22]">Pre-consult note:</p>
              <p className="mt-0.5">{selectedPatient.peakAnalysis}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTeleconsultModal(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setTeleconsultModal(false);
                  showToast(`Connected to video room with ${selectedPatient.name}.`);
                }}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-[#E3202B] text-white shadow-xs hover:opacity-95"
              >
                Start Consultation Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1D1F22] text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-[#E3202B]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
