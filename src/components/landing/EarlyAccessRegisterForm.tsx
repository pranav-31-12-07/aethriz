"use client";

import React, { useState } from "react";
import AethrizLogo from "@/components/ui/AethrizLogo/AethrizLogo";
import { ArrowRight, CheckCircle2, Sparkles, Send } from "lucide-react";

export default function EarlyAccessRegisterForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    language: "English",
    message: "",
    updates: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="register" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-white p-8 sm:p-14 lg:p-16 border border-slate-200/80 shadow-2xl">
        
        {/* Glow & 3D Accents */}
        <div
          aria-hidden="true"
          className="ae-glow absolute left-1/2 -top-64 w-[760px] h-[540px] -ml-[380px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(255,211,207,0.85) 0%, rgba(247,224,234,0.45) 40%, rgba(255,255,255,0) 70%)"
          }}
        />
        <div
          aria-hidden="true"
          className="ae-float-b absolute left-[8%] top-28 w-14 h-14 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at 32% 26%, #FFC2C0 0%, #F2343C 30%, #B5111A 70%, #6E0A10 100%)",
            boxShadow: "0 24px 40px rgba(181,17,26,0.28)"
          }}
        />
        <div
          aria-hidden="true"
          className="ae-float-c absolute right-[9%] top-20 w-11 h-11 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at 32% 28%, #8A8D93 0%, #2A2C30 34%, #0E0F11 80%)",
            boxShadow: "0 20px 34px rgba(0,0,0,0.22)"
          }}
        />

        {/* Header */}
        <div className="relative text-center max-w-2xl mx-auto space-y-4 flex flex-col items-center">
          <AethrizLogo size="md" variant="symbol" />
          <p className="text-xs font-mono font-bold text-red-600 uppercase tracking-widest bg-red-50 border border-red-200 px-3 py-1 rounded-full">
            AETHRIZ® EARLY ACCESS INVITATION
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Join the future of<br />health intelligence.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Be among the first to experience AI-powered personalized clinical guidance. Pre-register for exclusive beta onboarding — or connect with our research panel.
          </p>
        </div>

        {submitted ? (
          <div className="relative mt-12 py-10 text-center max-w-md mx-auto space-y-3 bg-red-50/60 rounded-3xl border border-red-200 p-8">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-xl text-slate-900">Registration Confirmed</h3>
            <p className="text-xs text-slate-600 font-medium">
              Thank you, <strong>{formData.name || "Patient"}</strong>. Your priority token has been queued with our medical coordinator. We will reach out via {formData.email || "email"}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative mt-12 max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-700">
              Full Name
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. Rajesh Verma or Patient Name"
                className="h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-red-600 focus:bg-white transition-all font-medium"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-700">
              Email Address
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@domain.com"
                className="h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-red-600 focus:bg-white transition-all font-medium"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-700">
              Phone Number
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-red-600 focus:bg-white transition-all font-medium"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-700">
              Preferred Language
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="h-12 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-red-600 focus:bg-white transition-all font-medium"
              >
                <option>English</option>
                <option>हिन्दी (Hindi)</option>
                <option>ଓଡ଼ିଆ (Odia)</option>
                <option>বাংলা (Bengali)</option>
                <option>తెలుగు (Telugu)</option>
                <option>தமிழ் (Tamil)</option>
                <option>मराठी (Marathi)</option>
                <option>Other Indian Language</option>
              </select>
            </label>

            <label className="sm:col-span-2 flex flex-col gap-1.5 text-xs font-bold text-slate-700">
              Message or Specific Health Focus (Optional)
              <textarea
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Mention any specific cardiovascular, genomic, or dietary interests..."
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-red-600 focus:bg-white transition-all font-medium resize-none"
              />
            </label>

            <label className="sm:col-span-2 flex items-start gap-2.5 text-xs text-slate-600 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={formData.updates}
                onChange={(e) => setFormData({ ...formData, updates: e.target.checked })}
                className="mt-0.5 accent-red-600 rounded"
              />
              <span>Send me early-access updates and beta release notices from AETHRIZ. Unsubscribe anytime.</span>
            </label>

            <div className="sm:col-span-2 flex justify-center pt-2">
              <button
                type="submit"
                className="px-8 py-3.5 rounded-full bg-slate-900 hover:bg-red-600 text-white font-bold text-xs sm:text-sm shadow-xl hover:shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Pre-register for Early Access</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
