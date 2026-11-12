"use client";

import React from "react";
import RedDnaHelixVisual from "./RedDnaHelixVisual";
import { Dna, Activity, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function DnaIntelligenceSection() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ScrollReveal durationMs={800}>
        <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-white border border-[#E5E7EB] shadow-xl p-8 sm:p-12 lg:p-16">
        
        {/* Subtle red ambient glow in the top-right corner */}
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at 70% 30%, rgba(255, 36, 63, 0.08) 0%, rgba(255, 36, 63, 0) 70%)"
          }}
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Scientific Narrative & Clinical Points */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200/80 text-[10px] font-mono font-bold text-[#FF243F] uppercase tracking-wider">
              <Dna className="w-3.5 h-3.5" />
              <span>THE SCIENCE BEHIND AETHRIZ</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111318] tracking-tight leading-[1.12]">
              Understanding Health<br className="hidden sm:inline" /> Through Intelligence.
            </h2>

            <p className="text-sm sm:text-base text-[#52627A] font-normal leading-relaxed max-w-xl">
              From biological patterns to personalized health insights, AETHRIZ connects intelligent technology with the complexity of human health.
            </p>

            {/* 3 Scientific Supporting Indicators (Subtle & Professional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#111318]">
                  <Activity className="w-4 h-4 text-[#FF243F]" />
                  <span>Genomic &amp; Biomarker Mapping</span>
                </div>
                <p className="text-[11px] text-[#52627A] leading-relaxed">
                  Deep-learning synthesis of ApoB, glycemic excursions, and longitudinal metabolic trends.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#111318]">
                  <ShieldCheck className="w-4 h-4 text-[#FF243F]" />
                  <span>Clinical Decision Support</span>
                </div>
                <p className="text-[11px] text-[#52627A] leading-relaxed">
                  Evidence-based algorithmic guidance reviewed by certified physicians and specialists.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/health-analysis"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#FF243F] hover:text-[#C8161F] transition-colors group"
              >
                <span>Explore the AI Health Risk Analysis Engine</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Signature 3D Red Rotating DNA Helix */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <div className="relative w-full max-w-[340px] rounded-3xl bg-[#F7F8FA]/80 border border-[#E5E7EB]/80 p-2 overflow-hidden shadow-inner">
              <RedDnaHelixVisual />
            </div>
          </div>

        </div>
      </div>
      </ScrollReveal>
    </section>
  );
}
