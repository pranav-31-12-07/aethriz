"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function FaqAccordionSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Is the AETHRIZ AI Health Analysis free to try?",
      a: "Every new registered patient can access one free comprehensive AI health scan, subject to the platform's actual access policy."
    },
    {
      q: "How accurate is the AI Food & Nutrition Scanner?",
      a: "Our food vision model is designed to recognize regional dishes and estimate calories, macronutrients, glycemic indicators, and potential allergens. Results are estimates and should not replace professional nutritional advice."
    },
    {
      q: "How does the Doctor AI Review Queue safeguard patient safety?",
      a: "AETHRIZ follows a human-in-the-loop approach. AI-generated insights support clinical review, while diagnoses and treatment decisions remain with qualified healthcare professionals."
    },
    {
      q: "How can doctors join the AETHRIZ Clinician Network?",
      a: "Physicians can register using their medical qualifications, license information, and clinic details. Credentials must undergo administrative verification."
    }
  ];

  return (
    <section id="faq" className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <ScrollReveal className="text-center space-y-2">
        <span className="text-[10px] font-mono font-bold text-[#FF243F] uppercase tracking-widest bg-red-50 border border-red-200 px-3 py-1 rounded-full">
          COMMON QUESTIONS
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111318] tracking-tight">
          Clinical AI &amp; Telehealth FAQs
        </h2>
      </ScrollReveal>

      <div className="space-y-3 pt-2">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <ScrollReveal
              key={idx}
              delayMs={idx * 100}
              durationMs={600}
            >
              <div
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-red-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex justify-between items-center gap-4 px-6 py-5 text-left font-bold text-sm sm:text-base text-slate-900 hover:text-red-600 transition-colors cursor-pointer group"
                  aria-expanded={isOpen}
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">{faq.q}</span>
                  <span
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isOpen ? "bg-[#FF243F] text-white rotate-45 shadow-sm" : "bg-slate-100 text-slate-700 group-hover:bg-red-50 group-hover:text-red-600"
                    }`}
                  >
                    <Plus className="w-4 h-4 transition-transform duration-300" />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-50 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
