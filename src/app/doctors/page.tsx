"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import PatientNavbar from "@/components/navigation/PatientNavbar";
import { fetchDoctors, DoctorRecord } from "@/lib/data";
import EmptyState from "@/components/common/EmptyState";
import { CardSkeleton } from "@/components/common/LoadingSkeleton";

const SPECIALTY_OPTIONS = [
  "All",
  "Endocrinology",
  "Cardiology",
  "Nutrition",
  "Thyroid",
  "General Physician",
] as const;

export default function FindDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All");
  const [selectedMode, setSelectedMode] = useState<"All" | "Video" | "In-clinic">("All");
  const [selectedCity, setSelectedCity] = useState("Bengaluru, KA");
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [sortBy, setSortBy] = useState<"soonest" | "rating" | "fee">("soonest");

  useEffect(() => {
    async function loadDoctors() {
      setIsLoading(true);
      const data = await fetchDoctors({ verifiedOnly: true });
      setDoctors(data);
      setIsLoading(false);
    }
    loadDoctors();
  }, []);

  // Filtering doctors based on search, specialty, and consultation mode
  const filteredDoctors = useMemo(() => {
    return doctors
      .filter((doc) => {
        // Specialty filter
        if (selectedSpecialty !== "All" && !doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())) {
          return false;
        }

        // Mode filter
        if (selectedMode === "Video" && !doc.hasVideo) {
          return false;
        }
        if (selectedMode === "In-clinic" && !doc.hasClinic) {
          return false;
        }

        // Search query (name, specialty, condition, language, location)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = doc.name.toLowerCase().includes(q);
          const matchesSpecialty = doc.specialty.toLowerCase().includes(q);
          const matchesLanguages = doc.languages.some((l) => l.toLowerCase().includes(q));
          const matchesLocation = doc.location.toLowerCase().includes(q);
          const matchesBio = doc.bio.toLowerCase().includes(q);

          return matchesName || matchesSpecialty || matchesLanguages || matchesLocation || matchesBio;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "fee") return a.consultFee - b.consultFee;
        return b.experience - a.experience;
      });
  }, [doctors, searchQuery, selectedSpecialty, selectedMode, sortBy]);

  // Helper for initials
  const getInitials = (name: string) => {
    const clean = name.replace(/^Dr\.\s*/i, "").trim();
    const parts = clean.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return clean.slice(0, 2).toUpperCase() || "DR";
  };

  return (
    <div className="min-h-screen bg-[#F4F5F8] text-[#1D1F22] font-sans antialiased selection:bg-[#E3202B] selection:text-white pb-24 relative overflow-x-hidden">
      {/* Signature Ambient Red Navbar Glow */}
      <div className="ae-top-nav-glow" />
      {/* ============ STANDARD PATIENT NAVBAR ============ */}
      <PatientNavbar activeTab="doctors" />

      {/* ============ MAIN VIEWPORT CONTAINER ============ */}
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">

        {/* ============ BREADCRUMB & HEADER WITH MODE TOGGLE ============ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#64748B]">Care · Verified Doctors</p>
            <h1
              className="text-4xl sm:text-5xl font-light tracking-tight text-[#1D1F22] mt-1"
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
              Find the right doctor.
            </h1>
          </div>

          {/* Mode Switcher Pill: All | Video | In-clinic */}
          <div className="flex items-center bg-[#E5E7EB]/70 p-1 rounded-full text-xs font-medium shadow-inner self-start md:self-auto">
            <button
              type="button"
              onClick={() => setSelectedMode("All")}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${selectedMode === "All"
                  ? "bg-white text-[#1D1F22] font-semibold shadow-xs"
                  : "text-[#64748B] hover:text-[#1D1F22]"
                }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSelectedMode("Video")}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${selectedMode === "Video"
                  ? "bg-white text-[#1D1F22] font-semibold shadow-xs"
                  : "text-[#64748B] hover:text-[#1D1F22]"
                }`}
            >
              Video
            </button>
            <button
              type="button"
              onClick={() => setSelectedMode("In-clinic")}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${selectedMode === "In-clinic"
                  ? "bg-white text-[#1D1F22] font-semibold shadow-xs"
                  : "text-[#64748B] hover:text-[#1D1F22]"
                }`}
            >
              In-clinic
            </button>
          </div>
        </div>

        {/* ============ SEARCH BAR & LOCATION PILL ============ */}
        <div className="relative flex items-center bg-white rounded-full p-2 pl-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(29,31,34,0.03)] focus-within:border-slate-400 focus-within:shadow-[0_6px_24px_rgba(29,31,34,0.06)] transition-all">
          <svg
            className="w-5 h-5 text-[#94A3B8] flex-shrink-0 mr-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor name, specialty, condition (e.g. HbA1c, thyroid, lipids)..."
            className="w-full bg-transparent text-xs sm:text-sm text-[#1D1F22] placeholder:text-[#94A3B8] focus:outline-none pr-3"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 mr-2 transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          {/* Location Selector Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCityPicker(!showCityPicker)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#475569] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex-shrink-0"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{selectedCity}</span>
            </button>

            {/* City Selector Dropdown */}
            {showCityPicker && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 ae-fade-in text-xs">
                <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider text-[#94A3B8]">
                  Select Your City
                </div>
                {["Bengaluru, KA", "Mumbai, MH", "Delhi NCR", "Hyderabad, TS", "Pune, MH", "Kolkata, WB"].map(
                  (city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setSelectedCity(city);
                        setShowCityPicker(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-between ${selectedCity === city
                          ? "bg-slate-100 font-bold text-[#1D1F22]"
                          : "hover:bg-slate-50 text-[#475569]"
                        }`}
                    >
                      <span>{city}</span>
                      {selectedCity === city && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E3202B]" />
                      )}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* ============ SPECIALTY FILTER PILLS ============ */}
        <div className="flex flex-wrap items-center gap-2">
          {SPECIALTY_OPTIONS.map((spec) => {
            const isActive = selectedSpecialty === spec;
            return (
              <button
                key={spec}
                type="button"
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${isActive
                    ? "bg-[#18191E] text-white shadow-xs"
                    : "bg-white text-[#475569] hover:bg-slate-100 border border-slate-200/80"
                  }`}
              >
                {spec}
              </button>
            );
          })}
        </div>

        {/* ============ DOCTOR CARDS GRID HEADER ============ */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm font-semibold text-[#1D1F22]">
            {filteredDoctors.length} {filteredDoctors.length === 1 ? "verified doctor" : "verified doctors"} in database
          </p>

          <div className="flex items-center gap-1 text-xs text-[#64748B]">
            <span>Sorted by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-medium text-[#1D1F22] focus:outline-none cursor-pointer"
            >
              <option value="soonest">experience</option>
              <option value="rating">highest rated</option>
              <option value="fee">consult fee</option>
            </select>
          </div>
        </div>

        {/* ============ CONTENT AREA: SKELETON, CARDS OR EMPTY STATE ============ */}
        {isLoading ? (
          <CardSkeleton rows={3} />
        ) : filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDoctors.map((doc) => {
              const initials = getInitials(doc.name);
              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-[26px] p-5 sm:p-6 border border-slate-200/80 shadow-[0_8px_30px_rgba(29,31,34,0.03)] hover:shadow-[0_12px_36px_rgba(29,31,34,0.07)] transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Card Header: Avatar & Info */}
                    <div className="flex items-start gap-3.5">
                      <Link
                        href={`/doctor/profile?id=${doc.id}`}
                        className="relative flex-shrink-0 group-hover:scale-105 transition-transform"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E3202B] flex items-center justify-center font-bold text-base shadow-2xs">
                          {initials}
                        </div>
                        {doc.verificationStatus === "verified" && (
                          <span
                            title="Admin Verified Doctor"
                            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white"
                          >
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <Link
                            href={`/doctor/profile?id=${doc.id}`}
                            className="font-semibold text-base text-[#1D1F22] truncate hover:text-[#E3202B] transition-colors"
                          >
                            {doc.name}
                          </Link>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${doc.verificationStatus === "verified"
                                ? "text-emerald-700 bg-emerald-50 border border-emerald-200/80"
                                : "text-amber-700 bg-amber-50 border border-amber-200/80"
                              }`}
                          >
                            {doc.verificationStatus === "verified" ? (
                              <>
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Verified
                              </>
                            ) : (
                              "Unverified"
                            )}
                          </span>
                        </div>

                        <p className="text-xs text-[#64748B] mt-0.5">
                          {doc.specialty} · {doc.experience} yrs exp
                        </p>

                        <div className="flex items-center gap-1.5 text-xs text-[#1D1F22] font-semibold mt-1">
                          <span className="text-amber-500">★</span>
                          <span>{doc.rating}</span>
                          <span className="text-[#94A3B8] font-normal font-mono text-[11px]">
                            {doc.registrationNo ? `Reg: ${doc.registrationNo}` : "Licensed Specialist"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bio or Qualifications */}
                    {doc.bio && (
                      <p className="text-xs text-[#475569] mt-3 line-clamp-2 leading-relaxed">
                        {doc.bio}
                      </p>
                    )}

                    {/* Language Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-4">
                      {doc.languages.map((lang) => (
                        <span
                          key={lang}
                          className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F8FAFC] text-[#475569] border border-slate-200/60"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>

                    {/* Next Available Slot & Modalities */}
                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[11px] text-[#94A3B8] block">Location</span>
                        <span className="font-semibold text-slate-700 truncate max-w-[150px] block">
                          {doc.location}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[#64748B]">
                        <span
                          className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600"
                          title="Teleconsultation available"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="23 7 16 12 23 17 23 7" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Consultation Fee & Action CTAs */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-base font-bold text-[#1D1F22]">
                        ₹{doc.consultFee}
                      </span>
                      <span className="text-[11px] text-[#64748B]"> / consult</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/doctor/profile?id=${doc.id}`}
                        className="px-3.5 py-1.5 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1D1F22] text-xs font-semibold transition-all cursor-pointer"
                      >
                        Profile
                      </Link>
                      <Link
                        href={`/booking?doctor=${doc.id}`}
                        className="px-4 py-1.5 rounded-full bg-[#18191E] hover:bg-[#2A2B32] text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <span>Book</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No verified doctors found"
            description={
              searchQuery || selectedSpecialty !== "All"
                ? "No doctors matched your current specialty or search criteria. Try resetting filters."
                : "No verified doctors currently registered in the database. When doctors join and get verified through the clinician portal, they will automatically appear here."
            }
            actionText={
              searchQuery || selectedSpecialty !== "All"
                ? "Reset Filters"
                : "Are you a doctor? Register here"
            }
            actionHref={
              searchQuery || selectedSpecialty !== "All"
                ? undefined
                : "/register/doctor"
            }
            onActionClick={
              searchQuery || selectedSpecialty !== "All"
                ? () => {
                  setSearchQuery("");
                  setSelectedSpecialty("All");
                  setSelectedMode("All");
                }
                : undefined
            }
          />
        )}
      </main>
    </div>
  );
}
