"use client";

import React from "react";

export default function LanguageMarquee() {
  const languages = [
    "English", "हिन्दी", "বাংলা", "తెలుగు", "मराठी", "தமிழ்", 
    "ગુજરાતી", "ಕನ್ನಡ", "മലയാളം", "ଓଡ଼ିଆ", "ਪੰਜਾਬੀ", "অসমীয়া", "اردو"
  ];

  return (
    <section aria-label="Languages supported" className="py-6 sm:py-8 w-full overflow-hidden select-none">
      <p className="mb-4 text-center text-xs sm:text-sm font-medium text-slate-500">
        Built for every community in Bharat — 22+ languages supported
      </p>
      <div 
        className="overflow-hidden"
        style={{
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
          maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)"
        }}
      >
        <div className="ae-marquee flex w-max gap-10 sm:gap-14 pr-10 sm:pr-14 text-xl sm:text-2xl font-bold text-slate-400/80 tracking-tight whitespace-nowrap">
          {languages.map((lang, idx) => (
            <span key={`l1-${idx}`} className="hover:text-red-600 transition-colors cursor-default">
              {lang}
            </span>
          ))}
          {languages.map((lang, idx) => (
            <span key={`l2-${idx}`} className="hover:text-red-600 transition-colors cursor-default">
              {lang}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
