"use client";

import React from "react";
import { Target, Eye } from "lucide-react";

export default function MissionVisionSection() {
  return (
    <section id="mission" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="space-y-1">
        <span className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-widest bg-red-50 border border-red-200 px-3 py-1 rounded-full">
          PURPOSE &amp; GOVERNANCE
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Mission &amp; vision for Bharat.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Mission Card */}
        <div
          className="ae-lift relative overflow-hidden rounded-[32px] sm:rounded-[40px] p-8 sm:p-12 min-h-[380px] flex flex-col justify-between gap-10 border border-red-100 shadow-lg"
          style={{
            background: "linear-gradient(150deg, #FFE1DE 0%, #F7E6EE 100%)"
          }}
        >
          {/* 3D Animated Spherical Accents */}
          <div
            aria-hidden="true"
            className="absolute right-6 sm:right-10 top-6 sm:top-10 w-32 sm:w-36 h-32 sm:h-36 pointer-events-none"
            style={{ perspective: "500px" }}
          >
            <div className="ae-ring absolute -inset-4 rounded-full border border-red-600/30" />
            <div
              className="ae-float absolute inset-4 rounded-full"
              style={{
                background: "radial-gradient(circle at 32% 26%, #FFC2C0 0%, #F2343C 30%, #B5111A 70%, #6E0A10 100%)",
                boxShadow: "0 30px 50px rgba(181,17,26,0.30), inset -8px -10px 18px rgba(0,0,0,0.2)"
              }}
            />
          </div>

          <div className="relative">
            <span className="inline-flex items-center gap-2 font-mono text-xs font-bold text-red-600 tracking-wider">
              <Target className="w-4 h-4" />
              OUR MISSION
            </span>
          </div>

          <div className="relative space-y-3">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              A healthier Bharat.
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed max-w-md">
              To make intelligent, personalized and understandable healthcare accessible to every person in Bharat — using AI and deep learning to turn clinical health data into better everyday decisions.
            </p>
          </div>
        </div>

        {/* Vision Card */}
        <div
          className="ae-lift relative overflow-hidden rounded-[32px] sm:rounded-[40px] p-8 sm:p-12 min-h-[380px] flex flex-col justify-between gap-10 bg-white border border-slate-200/80 shadow-lg"
        >
          {/* 3D Animated Obsidian Spherical Accents */}
          <div
            aria-hidden="true"
            className="absolute right-6 sm:right-10 top-6 sm:top-10 w-32 sm:w-36 h-32 sm:h-36 pointer-events-none"
            style={{ perspective: "500px" }}
          >
            <div className="ae-ring2 absolute -inset-4 rounded-full border border-dashed border-slate-900/25" />
            <div
              className="ae-float-b absolute inset-4 rounded-full"
              style={{
                background: "radial-gradient(circle at 32% 26%, #8A8D93 0%, #2A2C30 34%, #0E0F11 80%)",
                boxShadow: "0 30px 50px rgba(0,0,0,0.25)"
              }}
            />
            <div
              className="ae-float-c absolute right-0 bottom-1 w-7 h-7 rounded-full"
              style={{
                background: "radial-gradient(circle at 32% 28%, #FFB0AE, #DC2626 45%, #8E0C14)"
              }}
            />
          </div>

          <div className="relative">
            <span className="inline-flex items-center gap-2 font-mono text-xs font-bold text-slate-600 tracking-wider">
              <Eye className="w-4 h-4 text-red-600" />
              OUR VISION
            </span>
          </div>

          <div className="relative space-y-3">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Powered by intelligence.
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-md">
              A future where everyone understands their personal health baseline and acts before small anomalies become chronic diagnoses — where bio-algorithmic intelligence augments clinician decision-making.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
