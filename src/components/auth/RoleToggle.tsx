"use client";

import React from "react";
import Link from "next/link";

interface RoleToggleProps {
  activeRole: "patient" | "doctor";
}

export default function RoleToggle({ activeRole }: RoleToggleProps) {
  return (
    <div className="w-full flex flex-col items-center mb-6 sm:mb-8">
      <div className="text-[11px] font-semibold tracking-wider uppercase text-[#64748B] mb-2 flex items-center gap-1.5">
        <span>Select Account Type</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#E3202B]" />
      </div>

      <div className="inline-flex p-1 rounded-2xl bg-slate-100/90 border border-slate-200/90 shadow-2xs">
        <Link
          href="/register"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeRole === "patient"
              ? "bg-white text-[#1D1F22] shadow-xs scale-[1.01]"
              : "text-[#64748B] hover:text-[#1D1F22]"
          }`}
        >
          <svg
            className={`w-4 h-4 ${activeRole === "patient" ? "text-[#E3202B]" : "text-[#64748B]"}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Patient / User</span>
        </Link>

        <Link
          href="/register/doctor"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeRole === "doctor"
              ? "bg-white text-[#1D1F22] shadow-xs scale-[1.01]"
              : "text-[#64748B] hover:text-[#1D1F22]"
          }`}
        >
          <svg
            className={`w-4 h-4 ${activeRole === "doctor" ? "text-[#E3202B]" : "text-[#64748B]"}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
            <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
            <circle cx="20" cy="10" r="2" />
          </svg>
          <span>Doctor / Clinician</span>
        </Link>
      </div>
    </div>
  );
}

