"use client";

import React from "react";
import { Zap, Globe2, Target, Cpu } from "lucide-react";

export default function DeepLearningStatsGlobe() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-[#121316] text-white p-8 sm:p-14 lg:p-16 border border-white/10 shadow-2xl">
        {/* Background Ambient Radial Glow */}
        <div
          aria-hidden="true"
          className="ae-glow absolute -right-36 -top-44 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(220,38,38,0.45) 0%, rgba(220,38,38,0) 65%)"
          }}
        />

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Details */}
          <div className="flex-1 min-w-0 space-y-4">
            <p className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
              <span className="ae-pulse w-2 h-2 rounded-full bg-red-500" />
              Precise by design
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.08] text-white">
              Deep learning, built for<br className="hidden sm:inline" /> real-world health data.
            </h2>
            <p className="max-w-lg text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Our neural inference engines are engineered for clinical-grade health biomarker synthesis — fast enough to feel instant (40ms), and trained to understand patients in their native tongue.
            </p>
          </div>

          {/* Right: 3D Rotating Neural Globe */}
          <div
            aria-hidden="true"
            className="flex-none w-[280px] sm:w-[360px] h-[340px] sm:h-[380px] relative flex items-center justify-center select-none"
            style={{ perspective: "900px" }}
          >
            <div
              className="ae-glow absolute w-[280px] sm:w-[320px] h-[280px] sm:h-[320px] rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(220,38,38,0.38) 0%, rgba(220,38,38,0) 65%)"
              }}
            />

            {/* 3D Wireframe Globe */}
            <div className="ae-globe relative w-56 sm:w-64 h-56 sm:h-64" style={{ transformStyle: "preserve-3d" }}>
              <span className="absolute inset-0 rounded-full border border-white/25 [transform:rotateY(0deg)]">
                <span className="absolute top-1/2 -left-1.5 w-2.5 h-2.5 -mt-1.5 rounded-full bg-red-500 shadow-[0_0_12px_#DC2626]" />
              </span>
              <span className="absolute inset-0 rounded-full border border-white/20 [transform:rotateY(30deg)]" />
              <span className="absolute inset-0 rounded-full border border-white/25 [transform:rotateY(60deg)]">
                <span className="absolute top-[22%] right-[8%] w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#FFFFFF]" />
              </span>
              <span className="absolute inset-0 rounded-full border border-white/20 [transform:rotateY(90deg)]" />
              <span className="absolute inset-0 rounded-full border border-white/25 [transform:rotateY(120deg)]">
                <span className="absolute bottom-[16%] left-[12%] w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#DC2626]" />
              </span>
              <span className="absolute inset-0 rounded-full border border-white/20 [transform:rotateY(150deg)]" />
              <span className="absolute inset-0 rounded-full border border-white/35 [transform:rotateX(90deg)]">
                <span className="absolute top-1/2 -right-1.5 w-2.5 h-2.5 -mt-1.5 rounded-full bg-white shadow-[0_0_12px_#FFFFFF]" />
              </span>

              {/* Orbital rings */}
              <span className="absolute left-4 top-4 right-4 bottom-4 rounded-full border border-white/15 [transform:rotateX(90deg)_translateZ(60px)]" />
              <span className="absolute left-4 top-4 right-4 bottom-4 rounded-full border border-white/15 [transform:rotateX(90deg)_translateZ(-60px)]" />
              <span className="absolute left-10 top-10 right-10 bottom-10 rounded-full border border-white/10 [transform:rotateX(90deg)_translateZ(95px)]" />
              <span className="absolute left-10 top-10 right-10 bottom-10 rounded-full border border-white/10 [transform:rotateX(90deg)_translateZ(-95px)]" />
            </div>

            {/* Glowing Nucleus Sphere */}
            <div
              className="ae-float absolute w-24 h-24 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle at 32% 26%, #FFC2C0 0%, #F2343C 28%, #B5111A 68%, #5E080D 100%)",
                boxShadow: "0 0 60px rgba(220,38,38,0.65), inset -10px -12px 22px rgba(0,0,0,0.3)"
              }}
            />
            <div
              className="absolute left-1/2 top-1/2 w-7 h-4 -mt-9 -ml-7 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(ellipse, rgba(255,255,255,0.85), rgba(255,255,255,0) 70%)",
                transform: "rotate(-30deg)"
              }}
            />

            {/* Dashed Orbital Aura */}
            <div className="ae-ring absolute w-72 sm:w-80 h-72 sm:h-80 rounded-full border border-dashed border-red-500/40 pointer-events-none" />

            {/* Floating Model Inference Badge */}
            <div
              className="ae-float-c absolute right-0 bottom-6 inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-mono font-bold text-slate-200 border border-white/20 shadow-xl"
              style={{
                background: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)"
              }}
            >
              <span className="ae-pulse w-2 h-2 rounded-full bg-red-500" />
              <span>Model inference · 40ms</span>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards Underneath */}
        <div className="relative mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="ae-lift p-6 sm:p-7 rounded-3xl bg-white/[0.06] border border-white/10 space-y-2">
            <Target className="w-6 h-6 text-red-400" />
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              98.9<span className="text-2xl text-red-400 font-bold">%</span>
            </div>
            <div className="text-xs sm:text-sm text-slate-300 font-medium">model accuracy<sup>1</sup></div>
          </div>

          <div className="ae-lift p-6 sm:p-7 rounded-3xl bg-white/[0.06] border border-white/10 space-y-2">
            <Globe2 className="w-6 h-6 text-red-400" />
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              22<span className="text-2xl text-red-400 font-bold">+</span>
            </div>
            <div className="text-xs sm:text-sm text-slate-300 font-medium">languages supported</div>
          </div>

          <div className="ae-lift p-6 sm:p-7 rounded-3xl bg-white/[0.06] border border-white/10 space-y-2">
            <Zap className="w-6 h-6 text-red-400" />
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              40<span className="text-2xl text-red-400 font-bold">ms</span>
            </div>
            <div className="text-xs sm:text-sm text-slate-300 font-medium">inference latency</div>
          </div>
        </div>

        <p className="mt-6 text-[11px] text-slate-400 font-mono">
          1. Reported accuracy of up to 98.9% in applicable validated multi-modal model benchmarks (Ref: AAHAAR/NTC/2026-27/02).
        </p>
      </div>
    </section>
  );
}
