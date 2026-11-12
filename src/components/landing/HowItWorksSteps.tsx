"use client";

import React, { useEffect, useRef, useState } from "react";
import { Scan, Cpu, Brain, Sparkles, Compass } from "lucide-react";
import SubtleMolecularNetwork from "@/components/landing/SubtleMolecularNetwork";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function HowItWorksSteps() {
  const steps = [
    {
      step: "01",
      title: "SCAN",
      desc: "Share symptoms, daily habits, or health information.",
      icon: Scan,
      hasScanBeam: true
    },
    {
      step: "02",
      title: "ANALYZE",
      desc: "AI reviews your inputs for useful patterns and insights.",
      icon: Cpu,
      hasScanBeam: false
    },
    {
      step: "03",
      title: "INTERPRET",
      desc: "Explore relevant body systems through interactive 3D views.",
      icon: Brain,
      hasScanBeam: false
    },
    {
      step: "04",
      title: "PERSONALIZE",
      desc: "Get practical wellness suggestions tailored to your needs.",
      icon: Sparkles,
      hasScanBeam: false
    }
  ];

  const sectionRef = useRef<HTMLDivElement>(null);
  const [lineWidth, setLineWidth] = useState(0);

  useEffect(() => {
    const currentRef = sectionRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLineWidth(100);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(currentRef);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how"
      ref={sectionRef}
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 overflow-hidden py-4"
    >
      {/* Background subtle molecular network animation */}
      <SubtleMolecularNetwork />

      <ScrollReveal className="text-center space-y-2 max-w-2xl mx-auto relative z-10">
        <span className="text-[10px] font-mono font-bold text-[#FF243F] uppercase tracking-widest bg-red-50 border border-red-200 px-3 py-1 rounded-full">
          DIAGNOSTIC ARCHITECTURE
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111318] tracking-tight leading-tight">
          A clearer path to better-informed care.
        </h2>
        <p className="text-xs sm:text-base text-[#52627A] font-medium">
          A simple journey from health insights to informed next steps.
        </p>
      </ScrollReveal>

      {/* Progressive Connecting Timeline Bar (visible on large screens) */}
      <div className="hidden lg:block relative max-w-5xl mx-auto h-0.5 bg-slate-200/80 -mb-7 z-0">
        <div
          className="h-full bg-gradient-to-r from-red-500 via-rose-500 to-red-600 transition-all duration-1000 ease-out"
          style={{ width: `${lineWidth}%` }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
        {steps.map((s, idx) => (
          <ScrollReveal
            key={s.step}
            delayMs={idx * 120}
            durationMs={700}
            className="h-full"
          >
            <div className="ae-lift group bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-7 min-h-[300px] flex flex-col justify-between shadow-xs hover:shadow-md border border-slate-200/80 hover:border-red-200 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-white to-slate-100 shadow-md border border-slate-100 flex items-center justify-center text-slate-800 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <s.icon className="w-6 h-6 text-slate-800 group-hover:text-red-600 transition-colors" />
                  {s.hasScanBeam && (
                    <span className="ae-scan absolute left-3 right-3 top-7 h-0.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                  )}
                </div>
                <span className="font-mono text-sm font-bold text-red-600 group-hover:scale-110 transition-transform">
                  {s.step}
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-xl text-slate-900 tracking-tight group-hover:text-red-600 transition-colors">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          </ScrollReveal>
        ))}

        {/* 05 Guide Card (Dark Spotlight Card) */}
        <ScrollReveal delayMs={480} durationMs={700} className="h-full">
          <div className="ae-lift group relative overflow-hidden bg-[#1D1F22] text-white rounded-3xl p-6 sm:p-7 min-h-[300px] flex flex-col justify-between border border-slate-800 hover:border-red-500/50 shadow-xl transition-all duration-300">
            <div
              aria-hidden="true"
              className="ae-glow absolute -right-16 -bottom-16 w-56 h-56 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(220,38,38,0.45), rgba(220,38,38,0) 65%)"
              }}
            />

            <div className="relative flex justify-between items-start">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg border border-slate-700 flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-300">
                <Compass className="ae-spin w-6 h-6 text-red-400" />
              </div>
              <span className="font-mono text-sm font-bold text-red-400 group-hover:scale-110 transition-transform">
                05
              </span>
            </div>

            <div className="relative space-y-1.5">
              <h3 className="font-bold text-xl text-white tracking-tight group-hover:text-red-400 transition-colors">
                05. GUIDE
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Connect with healthcare professionals for further guidance.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
