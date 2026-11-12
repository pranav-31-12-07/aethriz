"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck, FileCheck, ArrowUpRight } from "lucide-react";
import AethrizLogo from "@/components/ui/AethrizLogo/AethrizLogo";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function Footer() {
  return (
    <footer className="bg-[#111318] text-gray-400 text-xs border-t border-gray-800 pt-16 pb-12 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          {/* Column 1 & 2: Corporate Identity & Address */}
          <div className="lg:col-span-2 space-y-4">
            {/* Official Corporate Logo */}
            <AethrizLogo href="/" size="md" variant="full" theme="dark" />

            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              AETHRIZ is an AI-assisted healthcare intelligence platform bringing together health insights, nutritional intelligence, interactive anatomical exploration, and healthcare connectivity.
            </p>

            {/* Official Registered Corporate Info */}
            <div className="space-y-2 pt-2 text-[11px] font-mono text-gray-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Aethriz AI Healthcare And Advanced Research Private Limited</strong><br />
                  1st Floor, Jagabandhu Lane, Darkhapatna, Cuttack, Odisha - 753013, India
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                <a href="tel:+917852982003" className="hover:text-white transition-colors">
                  +91 7852982003
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                <a href="mailto:aethriz.ai@gmail.com" className="hover:text-white transition-colors">
                  aethriz.ai@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="#top" className="hover:text-red-400 transition-colors flex items-center justify-between">
                  <span>Overview</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </Link>
              </li>
              <li>
                <Link href="#how" className="hover:text-red-400 transition-colors flex items-center justify-between">
                  <span>How It Works</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </Link>
              </li>
              <li>
                <Link href="#modules" className="hover:text-red-400 transition-colors flex items-center justify-between">
                  <span>Platform Modules</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-red-400 transition-colors flex items-center justify-between">
                  <span>FAQs</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Get Started */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Get Started
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/signup" className="hover:text-red-400 transition-colors flex items-center justify-between">
                  <span>Register as Patient</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-red-400 transition-colors flex items-center justify-between">
                  <span>Login</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </Link>
              </li>
              <li>
                <Link href="#contact-section" className="hover:text-red-400 transition-colors flex items-center justify-between">
                  <span>Contact Us</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#top" className="hover:text-red-400 transition-colors flex items-center justify-between">
                  <span>Medical Disclaimer</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </a>
              </li>
              <li>
                <a href="#top" className="hover:text-red-400 transition-colors flex items-center justify-between">
                  <span>Privacy Policy</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </a>
              </li>
              <li>
                <a href="#top" className="hover:text-red-400 transition-colors flex items-center justify-between">
                  <span>Terms of Service</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar with Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-4">
          <div className="max-w-xl text-left">
            <p className="text-[11px] text-gray-400">
              <strong>Disclaimer:</strong> AETHRIZ supports health awareness and informed decisions. It does not replace qualified medical professionals, diagnosis, or emergency care.
            </p>
            <p className="mt-1 text-gray-500">&copy; 2026 AETHRIZ. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-5 font-mono text-[10px]">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              HIPAA Safe Harbor Certified
            </span>
            <span className="flex items-center gap-1 text-gray-400">
              <FileCheck className="w-3.5 h-3.5" />
              ISO 27001
            </span>
            <span className="text-red-400 font-bold">
              24+ Language Engine
            </span>
          </div>
        </div>

        {/* Giant Reference Design Watermark Wordmark */}
        <div 
          aria-hidden="true" 
          className="relative mt-8 sm:mt-12 text-center whitespace-nowrap font-black select-none pointer-events-none overflow-hidden"
          style={{
            fontSize: "clamp(80px, 18vw, 240px)",
            lineHeight: 0.8,
            letterSpacing: "-0.05em",
            height: "0.62em"
          }}
        >
          <span 
            className="inline-block"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 50%, rgba(17,19,24,0) 95%)",
              WebkitBackgroundClip: "text",
              color: "transparent"
            }}
          >
            AETHR
            <span className="relative inline-block">
              I
              <span 
                className="ae-float absolute left-1/2 bottom-full rounded-full"
                style={{
                  width: "0.14em",
                  height: "0.14em",
                  margin: "0 0 0.02em -0.07em",
                  background: "radial-gradient(circle at 32% 26%, #FFC2C0 0%, #DC2626 30%, #B5111A 70%, #6E0A10 100%)",
                  boxShadow: "0 0.04em 0.08em rgba(220,38,38,0.4)"
                }}
              />
            </span>
            Z
          </span>
        </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
