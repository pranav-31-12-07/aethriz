"use client";

import React from "react";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { 
  Activity, 
  Heart, 
  Scan, 
  Stethoscope, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight, 
  Sparkles 
} from "lucide-react";

export default function PlatformModulesSection() {
  const modules = [
    {
      id: "01",
      title: "Patient Dashboard",
      desc: "Your health overview, daily habits, and upcoming appointments.",
      cta: "Register to Access",
      href: "/signup",
      icon: Activity,
      accent: "text-[#FF243F]",
      badge: "Patient Care",
      diagram: (
        // Subtle wellness index indicator
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-mono font-bold text-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Wellness: 82/100</span>
        </div>
      )
    },
    {
      id: "02",
      title: "Health Risk Analysis",
      desc: "Review wellness indicators and explore personalized lifestyle guidance.",
      cta: "Free Clinical Scan",
      href: "/health-analysis",
      icon: Heart,
      accent: "text-rose-600",
      badge: "Biomarker Engine",
      diagram: (
        // Minimal molecular / biomarker node diagram (fine lines and small nodes)
        <svg width="44" height="24" viewBox="0 0 44 24" fill="none" className="opacity-80">
          <line x1="8" y1="12" x2="22" y2="6" stroke="#E5E7EB" strokeWidth="1.2" />
          <line x1="22" y1="6" x2="36" y2="14" stroke="#E5E7EB" strokeWidth="1.2" />
          <line x1="8" y1="12" x2="22" y2="18" stroke="#E5E7EB" strokeWidth="1.2" />
          <line x1="22" y1="18" x2="36" y2="14" stroke="#E5E7EB" strokeWidth="1.2" />
          <circle cx="8" cy="12" r="3" fill="#FF243F" />
          <circle cx="22" cy="6" r="2.5" fill="#52627A" />
          <circle cx="22" cy="18" r="2.5" fill="#52627A" />
          <circle cx="36" cy="14" r="3" fill="#10B981" />
        </svg>
      )
    },
    {
      id: "03",
      title: "AI Food Scanner",
      desc: "Scan meals and explore nutrition, ingredients, and allergen information.",
      cta: "Scan Meal Image",
      href: "/food-scanner",
      icon: Scan,
      accent: "text-emerald-600",
      badge: "Optical LiDAR",
      diagram: (
        // Minimal optical reticle
        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>LiDAR CV: 98.4%</span>
        </div>
      )
    },
    {
      id: "04",
      title: "3D Body Explorer",
      desc: "Explore body systems and learn about organs with an interactive 3D view.",
      cta: "Explore Anatomy",
      href: "/body-explorer",
      icon: Heart,
      accent: "text-purple-600",
      badge: "WebGL Anatomy",
      diagram: (
        // Minimal human body silhouette diagram
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-600">
          <circle cx="12" cy="4" r="2" />
          <path d="M12 6v8M8 8l4 1.5 4-1.5M9.5 20l2.5-6 2.5 6" />
        </svg>
      )
    },
    {
      id: "05",
      title: "Doctor Directory",
      desc: "Discover specialists across Cardiology, Orthopedics, Endocrinology, and Neurology. Find doctors and book consultations.",
      cta: "Browse Specialists",
      href: "/doctors",
      icon: Stethoscope,
      accent: "text-blue-600",
      badge: "Medical Faculty",
      diagram: (
        <span className="text-[10px] font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
          Stanford &bull; AIIMS
        </span>
      )
    },
    {
      id: "06",
      title: "Clinician & Doctor Portal",
      desc: "Physician triage dashboard, AI review queue, research pipeline metrics, and telehealth support.",
      cta: "Access Doctor Portal",
      href: "/doctor-portal",
      icon: ShieldCheck,
      accent: "text-teal-600",
      badge: "Telehealth Queue",
      diagram: (
        <span className="text-[10px] font-mono text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
          Human-in-the-Loop
        </span>
      )
    }
  ];

  return (
    <section id="modules" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <ScrollReveal className="space-y-2 max-w-2xl">
        <span className="text-[10px] font-mono font-bold text-[#FF243F] uppercase tracking-widest bg-red-50 border border-red-200 px-3 py-1 rounded-full">
          ONE CONNECTED EXPERIENCE
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111318] tracking-tight leading-tight">
          Your Health Toolkit
        </h2>
        <p className="text-xs sm:text-base text-[#52627A] font-medium leading-relaxed">
          One connected platform for everyday health support.
        </p>
      </ScrollReveal>

      {/* 6 Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((m, idx) => (
          <ScrollReveal
            key={m.id}
            delayMs={(idx % 3) * 120}
            durationMs={650}
            className="h-full"
          >
            <Link
              href={m.href}
              className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-[#E5E7EB] hover:border-[#FF243F]/50 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full"
            >
              <div className="space-y-4">
                {/* Card Top: Icon + Diagram / Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <m.icon className={`w-5 h-5 ${m.accent}`} />
                  </div>
                  <div>{m.diagram}</div>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{m.id}</span>
                    <h3 className="text-lg font-bold text-[#111318] group-hover:text-[#FF243F] transition-colors">
                      {m.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#52627A] font-medium leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </div>

              {/* CTA Link at Bottom */}
              <div className="pt-6 mt-6 border-t border-[#E5E7EB]/80 flex items-center justify-between text-xs font-bold text-[#FF243F]">
                <span>{m.cta}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
