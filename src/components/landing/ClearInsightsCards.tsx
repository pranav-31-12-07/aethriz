"use client";

import React from "react";
import { ArrowUp, TrendingUp, ShieldCheck, AlertCircle } from "lucide-react";

export default function ClearInsightsCards() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="rounded-[32px] sm:rounded-[40px] bg-[#E4E9EF] p-6 sm:p-12 lg:p-16 border border-white/80 shadow-xl space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-widest bg-white/80 border border-red-200 px-3 py-1 rounded-full">
              CLINICAL CLARITY ENGINE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              No jargon.<br />Just clarity you can act on.
            </h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            AETHRIZ translates complex bio-algorithmic data into clear, color-coded insights — so you immediately understand what matters and what steps to take next.
          </p>
        </div>

        {/* 4 3D Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Elevated */}
          <div className="ae-lift bg-white rounded-3xl p-5 flex flex-col justify-between shadow-sm border border-slate-100/80">
            <div
              aria-hidden="true"
              className="relative h-48 rounded-2xl flex items-center justify-center overflow-hidden"
              style={{
                background: "radial-gradient(circle at 50% 42%, #FFFFFF 0%, #FFEDEB 55%, #FFDCD8 100%)"
              }}
            >
              <div
                className="ae-float-b absolute right-6 top-5 w-16 h-16 rounded-full"
                style={{
                  background: "radial-gradient(circle at 32% 26%, #FFC2C0 0%, #F2343C 30%, #B5111A 70%, #6E0A10 100%)",
                  boxShadow: "0 18px 30px rgba(181,17,26,0.28)"
                }}
              />
              <div
                className="absolute bottom-6 w-24 h-3 rounded-full"
                style={{
                  background: "radial-gradient(ellipse, rgba(140,10,20,0.22), rgba(140,10,20,0) 70%)"
                }}
              />
              <div
                className="ae-float relative w-24 h-24 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.88), rgba(255,255,255,0.45))",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  boxShadow: "0 22px 40px rgba(181,17,26,0.16), inset 0 1px 0 #FFFFFF, inset 0 0 0 1px rgba(255,255,255,0.7)"
                }}
              >
                <svg width="52" height="52" viewBox="0 0 56 56">
                  <defs>
                    <linearGradient id="ae-gE" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#FF8A8E" />
                      <stop offset="1" stopColor="#DC2626" />
                    </linearGradient>
                  </defs>
                  <path d="M28 48C10.5 36.5 6 27.5 6 20a11 11 0 0 1 22-3.2A11 11 0 0 1 50 20c0 7.5-4.5 16.5-22 28z" fill="url(#ae-gE)" />
                  <ellipse cx="17" cy="16" rx="6" ry="3.5" fill="#FFFFFF" opacity="0.45" transform="rotate(-30 17 16)" />
                  <path d="M11 27h8l3-6 5 12 4-9 3 3h11" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="ae-float-c absolute left-3.5 bottom-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 text-[11px] font-bold text-slate-800 shadow-md">
                <ArrowUp className="w-3 h-3 text-red-600" />
                <span>LDL · 142 mg/dL</span>
              </div>
            </div>

            <div className="pt-4 px-1">
              <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                Elevated
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                ApoB &amp; LDL parameters outside target range with immediate clinician steps.
              </p>
            </div>
          </div>

          {/* Card 2: Borderline */}
          <div className="ae-lift bg-white rounded-3xl p-5 flex flex-col justify-between shadow-sm border border-slate-100/80">
            <div
              aria-hidden="true"
              className="relative h-48 rounded-2xl flex items-center justify-center overflow-hidden"
              style={{
                background: "radial-gradient(circle at 50% 42%, #FFFFFF 0%, #FFF4E2 55%, #FFE8C7 100%)"
              }}
            >
              <div
                className="ae-float-b absolute right-6 top-5 w-16 h-16 rounded-full"
                style={{
                  background: "radial-gradient(circle at 32% 26%, #FFE6B8 0%, #F3A93A 32%, #B86A00 72%, #6E3F00 100%)",
                  boxShadow: "0 18px 30px rgba(150,90,0,0.26)",
                  animationDelay: "-3s"
                }}
              />
              <div
                className="absolute bottom-6 w-24 h-3 rounded-full"
                style={{
                  background: "radial-gradient(ellipse, rgba(120,70,0,0.2), rgba(120,70,0,0) 70%)"
                }}
              />
              <div
                className="ae-float relative w-24 h-24 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.88), rgba(255,255,255,0.45))",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  boxShadow: "0 22px 40px rgba(150,90,0,0.16), inset 0 1px 0 #FFFFFF, inset 0 0 0 1px rgba(255,255,255,0.7)",
                  animationDelay: "-1s"
                }}
              >
                <svg width="52" height="52" viewBox="0 0 56 56">
                  <defs>
                    <linearGradient id="ae-gB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#FFD98A" />
                      <stop offset="1" stopColor="#E0851A" />
                    </linearGradient>
                  </defs>
                  <path d="M28 6c2.1 0 3.6 1.1 4.6 2.9l17.3 30.6c2 3.6-.5 8.5-4.7 8.5H10.8c-4.2 0-6.7-4.9-4.7-8.5L23.4 8.9C24.4 7.1 25.9 6 28 6z" fill="url(#ae-gB)" />
                  <ellipse cx="22" cy="18" rx="5" ry="2.6" fill="#FFFFFF" opacity="0.5" transform="rotate(-58 22 18)" />
                  <path d="M28 20v12" stroke="#FFFFFF" strokeWidth="4.2" strokeLinecap="round" />
                  <circle cx="28" cy="39.5" r="2.6" fill="#FFFFFF" />
                </svg>
              </div>
              <div className="ae-float-c absolute left-3.5 bottom-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 text-[11px] font-bold text-slate-800 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>HbA1c · 6.1%</span>
              </div>
            </div>

            <div className="pt-4 px-1">
              <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Borderline
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Early metabolic signals, caught and corrected before progression.
              </p>
            </div>
          </div>

          {/* Card 3: Pattern */}
          <div className="ae-lift bg-white rounded-3xl p-5 flex flex-col justify-between shadow-sm border border-slate-100/80">
            <div
              aria-hidden="true"
              className="relative h-48 rounded-2xl flex items-center justify-center overflow-hidden"
              style={{
                background: "radial-gradient(circle at 50% 42%, #FFFFFF 0%, #EEF0FC 55%, #DFE3F8 100%)"
              }}
            >
              <div
                className="ae-float-b absolute right-6 top-5 w-16 h-16 rounded-full"
                style={{
                  background: "radial-gradient(circle at 32% 26%, #D2D8FF 0%, #6A79E6 32%, #2F3DA8 72%, #1A2270 100%)",
                  boxShadow: "0 18px 30px rgba(40,50,140,0.26)",
                  animationDelay: "-1.5s"
                }}
              />
              <div
                className="absolute bottom-6 w-24 h-3 rounded-full"
                style={{
                  background: "radial-gradient(ellipse, rgba(40,50,140,0.2), rgba(40,50,140,0) 70%)"
                }}
              />
              <div
                className="ae-float relative w-24 h-24 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.88), rgba(255,255,255,0.45))",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  boxShadow: "0 22px 40px rgba(40,50,140,0.16), inset 0 1px 0 #FFFFFF, inset 0 0 0 1px rgba(255,255,255,0.7)",
                  animationDelay: "-2.5s"
                }}
              >
                <svg width="52" height="52" viewBox="0 0 56 56">
                  <defs>
                    <linearGradient id="ae-gP" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#A9B4FF" />
                      <stop offset="1" stopColor="#3E4DB8" />
                    </linearGradient>
                  </defs>
                  <rect x="7" y="32" width="10" height="17" rx="3.5" fill="url(#ae-gP)" opacity="0.55" />
                  <rect x="23" y="23" width="10" height="26" rx="3.5" fill="url(#ae-gP)" opacity="0.75" />
                  <rect x="39" y="13" width="10" height="36" rx="3.5" fill="url(#ae-gP)" />
                  <path d="M12 24L28 15l16-9" fill="none" stroke="#1F2A80" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="24" r="3.4" fill="#FFFFFF" stroke="#1F2A80" strokeWidth="2.2" />
                  <circle cx="28" cy="15" r="3.4" fill="#FFFFFF" stroke="#1F2A80" strokeWidth="2.2" />
                  <circle cx="44" cy="6" r="3.4" fill="#FFFFFF" stroke="#1F2A80" strokeWidth="2.2" />
                </svg>
              </div>
              <div className="ae-float-c absolute left-3.5 bottom-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 text-[11px] font-bold text-slate-800 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <span>Trend across 3 reports</span>
              </div>
            </div>

            <div className="pt-4 px-1">
              <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                Pattern
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Multivariate trajectory linked to circadian sleep and meal timing.
              </p>
            </div>
          </div>

          {/* Card 4: Balanced */}
          <div className="ae-lift bg-white rounded-3xl p-5 flex flex-col justify-between shadow-sm border border-slate-100/80">
            <div
              aria-hidden="true"
              className="relative h-48 rounded-2xl flex items-center justify-center overflow-hidden"
              style={{
                background: "radial-gradient(circle at 50% 42%, #FFFFFF 0%, #E8F6EE 55%, #D3EEDF 100%)"
              }}
            >
              <div
                className="ae-float-b absolute right-6 top-5 w-16 h-16 rounded-full"
                style={{
                  background: "radial-gradient(circle at 32% 26%, #C9F2DA 0%, #4CBC80 32%, #1E7A4C 72%, #0F4A2C 100%)",
                  boxShadow: "0 18px 30px rgba(20,90,50,0.26)",
                  animationDelay: "-4.5s"
                }}
              />
              <div
                className="absolute bottom-6 w-24 h-3 rounded-full"
                style={{
                  background: "radial-gradient(ellipse, rgba(20,90,50,0.2), rgba(20,90,50,0) 70%)"
                }}
              />
              <div
                className="ae-float relative w-24 h-24 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.88), rgba(255,255,255,0.45))",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  boxShadow: "0 22px 40px rgba(20,90,50,0.16), inset 0 1px 0 #FFFFFF, inset 0 0 0 1px rgba(255,255,255,0.7)",
                  animationDelay: "-3.5s"
                }}
              >
                <svg width="52" height="52" viewBox="0 0 56 56">
                  <defs>
                    <linearGradient id="ae-gG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#8BE6B4" />
                      <stop offset="1" stopColor="#1E7A4C" />
                    </linearGradient>
                  </defs>
                  <path d="M28 5l19 6.5V26c0 11.5-8 20-19 24.5C17 46 9 37.5 9 26V11.5z" fill="url(#ae-gG)" />
                  <ellipse cx="19" cy="15" rx="5" ry="2.6" fill="#FFFFFF" opacity="0.5" transform="rotate(-20 19 15)" />
                  <path d="M19 27.5l6 6 12.5-13" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="ae-float-c absolute left-3.5 bottom-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 text-[11px] font-bold text-slate-800 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>TSH · 2.1 in range</span>
              </div>
            </div>

            <div className="pt-4 px-1">
              <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Balanced
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Optimal organ functioning confirmed so you can keep maintaining it.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
