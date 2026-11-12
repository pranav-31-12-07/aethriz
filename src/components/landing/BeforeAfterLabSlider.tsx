"use client";

import React, { useState } from "react";
import { FileText, Sparkles, Droplets, Sun, Heart, CheckCircle2, Sliders, ArrowLeftRight } from "lucide-react";

export default function BeforeAfterLabSlider() {
  const [reveal, setReveal] = useState(50);

  return (
    <section id="services" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Container Card */}
      <div className="relative rounded-[32px] sm:rounded-[40px] overflow-hidden bg-[#E9EDF1] shadow-2xl shadow-slate-900/5 select-none border border-white/60">
        
        {/* =========================================================================
            BEFORE LAYER (Base Flow)
            ========================================================================= */}
        <div className="p-6 sm:p-10 lg:p-12 font-mono text-slate-600">
          <div className="flex justify-between items-center h-10">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 font-sans text-xs font-bold text-slate-700 tracking-wider shadow-xs border border-slate-200">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              BEFORE · RAW CONFUSING LAB REPORT
            </span>
          </div>

          <div className="mt-6 grid grid-cols-5 sm:grid-cols-5 gap-2 h-9 items-center border-b border-slate-300 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            <span className="col-span-2">Test Name</span>
            <span className="text-center sm:text-left">Result</span>
            <span className="hidden sm:block">Ref. Range</span>
            <span className="text-right">Flag</span>
          </div>

          {/* Test 1 */}
          <div className="grid grid-cols-5 gap-2 py-4 sm:py-5 items-center border-b border-slate-300/80 text-xs sm:text-sm font-semibold text-slate-800">
            <span className="col-span-2">HBA1C (GLYCATED HB)</span>
            <span className="text-center sm:text-left text-red-600 font-bold">6.1 %</span>
            <span className="hidden sm:block text-slate-500">4.0 – 5.6</span>
            <span className="text-right font-black text-red-600 bg-red-100/70 px-2 py-0.5 rounded-md justify-self-end text-xs">H</span>
          </div>

          {/* Test 2 */}
          <div className="grid grid-cols-5 gap-2 py-4 sm:py-5 items-center border-b border-slate-300/80 text-xs sm:text-sm font-semibold text-slate-800">
            <span className="col-span-2">25-OH VITAMIN D</span>
            <span className="text-center sm:text-left text-amber-600 font-bold">18.2 ng/mL</span>
            <span className="hidden sm:block text-slate-500">30 – 100</span>
            <span className="text-right font-black text-amber-600 bg-amber-100/70 px-2 py-0.5 rounded-md justify-self-end text-xs">L</span>
          </div>

          {/* Test 3 */}
          <div className="grid grid-cols-5 gap-2 py-4 sm:py-5 items-center border-b border-slate-300/80 text-xs sm:text-sm font-semibold text-slate-800">
            <span className="col-span-2">LDL-C (DIRECT CHOLESTEROL)</span>
            <span className="text-center sm:text-left text-red-600 font-bold">142 mg/dL</span>
            <span className="hidden sm:block text-slate-500">&lt; 100</span>
            <span className="text-right font-black text-red-600 bg-red-100/70 px-2 py-0.5 rounded-md justify-self-end text-xs">H</span>
          </div>

          {/* Test 4 */}
          <div className="grid grid-cols-5 gap-2 py-4 sm:py-5 items-center text-xs sm:text-sm font-semibold text-slate-800">
            <span className="col-span-2">TSH (3RD GEN THYROID)</span>
            <span className="text-center sm:text-left text-emerald-600 font-bold">2.1 µIU/mL</span>
            <span className="hidden sm:block text-slate-500">0.4 – 4.0</span>
            <span className="text-right text-slate-400 font-mono text-xs">—</span>
          </div>
        </div>

        {/* =========================================================================
            AFTER LAYER (Clipped & Revealed via Slider)
            ========================================================================= */}
        <div
          className="absolute inset-0 bg-white p-6 sm:p-10 lg:p-12 font-sans"
          style={{ clipPath: `inset(0 0 0 ${reveal}%)` }}
        >
          <div className="flex justify-end items-center h-10">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-red-600 font-bold text-xs tracking-wider border border-red-200">
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              AFTER · WITH AETHRIZ BIO-AI INTELLIGENCE
            </span>
          </div>

          <div className="mt-6 h-9 border-b border-slate-100 flex items-center text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            WHAT IT ACTUALLY MEANS FOR YOUR BODY
          </div>

          {/* Insight 1 */}
          <div className="flex items-center gap-3 sm:gap-4 py-3.5 sm:py-4 border-b border-slate-100">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Droplets className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs sm:text-sm text-slate-900">Blood sugar is slightly above ideal</div>
              <div className="text-[11px] sm:text-xs text-slate-500">Small, steady meal swaps calibrated to your daily diet.</div>
            </div>
            <span className="shrink-0 px-2.5 sm:px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] sm:text-xs font-bold">
              Borderline
            </span>
          </div>

          {/* Insight 2 */}
          <div className="flex items-center gap-3 sm:gap-4 py-3.5 sm:py-4 border-b border-slate-100">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Sun className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs sm:text-sm text-slate-900">Vitamin D is critically low</div>
              <div className="text-[11px] sm:text-xs text-slate-500">Targeted nutrition & morning sunlight schedule matched to your routine.</div>
            </div>
            <span className="shrink-0 px-2.5 sm:px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] sm:text-xs font-bold">
              Low
            </span>
          </div>

          {/* Insight 3 */}
          <div className="flex items-center gap-3 sm:gap-4 py-3.5 sm:py-4 border-b border-slate-100">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs sm:text-sm text-slate-900">LDL cholesterol is elevated</div>
              <div className="text-[11px] sm:text-xs text-slate-500">Recommended for tele-cardiology review — lifestyle habits to begin now.</div>
            </div>
            <span className="shrink-0 px-2.5 sm:px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] sm:text-xs font-bold">
              Elevated
            </span>
          </div>

          {/* Insight 4 */}
          <div className="flex items-center gap-3 sm:gap-4 py-3.5 sm:py-4">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs sm:text-sm text-slate-900">Thyroid axis is well-balanced</div>
              <div className="text-[11px] sm:text-xs text-slate-500">Cellular energy and endocrine equilibrium are optimal. Keep it up.</div>
            </div>
            <span className="shrink-0 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] sm:text-xs font-bold">
              Balanced
            </span>
          </div>
        </div>

        {/* Divider Handle */}
        <div
          aria-hidden="true"
          className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none z-30 shadow-md"
          style={{ left: `${reveal}%`, marginLeft: "-1px" }}
        >
          <div className="absolute top-1/2 left-1/2 w-12 sm:w-14 h-12 sm:h-14 -mt-6 sm:-mt-7 -ml-6 sm:-ml-7 rounded-full bg-white shadow-2xl flex items-center justify-center text-slate-900 border border-slate-100">
            <ArrowLeftRight className="w-5 h-5 text-red-600" />
          </div>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold shadow-lg">
            Drag to reveal
          </div>
        </div>

        {/* Invisible Range Input for Full-Card Drag Interaction */}
        <input
          type="range"
          min="0"
          max="100"
          value={reveal}
          onChange={(e) => setReveal(Number(e.target.value))}
          aria-label="Drag to compare your raw lab report with AETHRIZ view"
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40 m-0"
        />
      </div>

      {/* 4 Feature Pillars Underneath (From Reference Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-red-600 border border-slate-100">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Personalized</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Recommendations built around your specific biomarker labs, routine, dietary habits, and genomic profile.
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-red-600 border border-slate-100">
            <span className="font-bold text-base">अ/A</span>
          </div>
          <h3 className="font-bold text-lg text-slate-900">Multilingual</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            AI-powered healthcare accessible across 22+ Indian and global languages, explained in your regional mother tongue.
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-red-600 border border-slate-100">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Predictive</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Deep-learning algorithms read subtle longitudinal shifts to flag potential cardio-metabolic risks proactively.
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-red-600 border border-slate-100">
            <Sliders className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Adaptive</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Clinical guidance that evolves continuously with your sleep debt, glucose responses, and lifestyle — never one-size-fits-all.
          </p>
        </div>
      </div>
    </section>
  );
}
