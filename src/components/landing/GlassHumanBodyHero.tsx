"use client";

import React from "react";
import Link from "next/link";
import { Activity, Sparkles, Heart } from "lucide-react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

export default function GlassHumanBodyHero() {
  return (
    <div className="relative w-full max-w-[560px] h-[580px] sm:h-[620px] flex items-center justify-center select-none" style={{ perspective: "1200px" }}>
      {/* Background radial glow */}
      <div
        className="ae-glow absolute w-[360px] sm:w-[520px] h-[360px] sm:h-[520px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 45%, rgba(255,196,190,0.65) 0%, rgba(233,228,245,0.45) 40%, rgba(241,245,249,0) 70%)"
        }}
      />

      {/* 3D Orbiting Gyroscopic Rings */}
      <div
        className="ae-ring absolute w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] rounded-full pointer-events-none border border-slate-900/10"
        style={{ boxShadow: "0 0 0 16px rgba(255,255,255,0.18)" }}
      />
      <div
        className="ae-ring2 absolute w-[280px] sm:w-[400px] h-[280px] sm:h-[400px] rounded-full pointer-events-none border border-dashed border-red-600/30"
      />

      {/* Scanner Platform Pedestal with Ripple Waves */}
      <div className="absolute left-1/2 bottom-3 sm:bottom-4 w-[320px] sm:w-[420px] h-[90px] sm:h-[110px] -ml-[160px] sm:-ml-[210px] pointer-events-none">
        <div
          className="absolute inset-0 rounded-[50%]"
          style={{
            background: "radial-gradient(ellipse, rgba(255,255,255,0.98) 0%, rgba(255,214,210,0.55) 45%, rgba(255,214,210,0) 72%)",
            boxShadow: "0 34px 60px rgba(29,31,34,0.12)"
          }}
        />
        <div className="absolute left-[16%] right-[16%] top-[16%] bottom-[16%] rounded-[50%] border-[1.5px] border-red-600/50 bg-white/35" />
        <div className="ae-plat absolute left-[16%] right-[16%] top-[16%] bottom-[16%] rounded-[50%] border-[1.5px] border-red-600/55" />
        <div
          className="ae-plat absolute left-[16%] right-[16%] top-[16%] bottom-[16%] rounded-[50%] border-[1.5px] border-red-600/55"
          style={{ animationDelay: "-1.8s" }}
        />
      </div>

      {/* Swaying 3D Glass Human Body Silhouette */}
      <div
        className="ae-sway2 absolute left-1/2 bottom-[52px] sm:bottom-[60px] w-[210px] sm:w-[238px] h-[456px] sm:h-[516px] -ml-[105px] sm:-ml-[119px] z-10 cursor-pointer group"
        title="Interactive 3D Physiological Model — Click to Open Body Explorer"
      >
        <Link href="/body-explorer" className="block w-full h-full relative" aria-label="Open 3D Human Body Explorer">
          <svg viewBox="0 0 240 520" width="100%" height="100%" className="overflow-visible filter drop-shadow-[0_24px_36px_rgba(220,38,38,0.22)]">
            <defs>
              <linearGradient id="ae-glass" gradientUnits="userSpaceOnUse" x1="30" y1="0" x2="210" y2="0">
                <stop offset="0" stopColor="#EEE8F1" />
                <stop offset="0.3" stopColor="#FFFFFF" />
                <stop offset="0.52" stopColor="#FDFBFD" />
                <stop offset="0.8" stopColor="#F0E9F3" />
                <stop offset="1" stopColor="#E6DEEA" />
              </linearGradient>
              <linearGradient id="ae-shade" gradientUnits="userSpaceOnUse" x1="30" y1="0" x2="210" y2="0">
                <stop offset="0" stopColor="#8C6E96" stopOpacity="0.28" />
                <stop offset="0.36" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="0.64" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="1" stopColor="#8C6E96" stopOpacity="0.32" />
              </linearGradient>
              <linearGradient id="ae-beamG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#DC2626" stopOpacity="0" />
                <stop offset="0.5" stopColor="#DC2626" stopOpacity="0.35" />
                <stop offset="1" stopColor="#DC2626" stopOpacity="0" />
              </linearGradient>
              <radialGradient id="ae-glowR">
                <stop offset="0" stopColor="#FF3B43" stopOpacity="0.65" />
                <stop offset="1" stopColor="#FF3B43" stopOpacity="0" />
              </radialGradient>
              <clipPath id="ae-bclip">
                <ellipse cx="120" cy="40" rx="22" ry="27" />
                <path d="M110 64 C110 74 110 80 108 86 C96 90 84 93 74 99 C66 103 63 114 67 126 C71 138 76 152 77 166 C79 186 86 200 87 214 C88 228 80 240 79 256 C77 278 80 302 84 330 C87 352 87 364 86 376 C84 398 84 420 89 446 C92 462 94 472 94 482 C88 488 80 493 82 498 C86 503 100 503 106 500 C108 494 107 486 108 478 C110 450 112 420 111 396 C110 384 111 376 112 368 C114 340 117 310 120 288 C123 310 126 340 128 368 C129 376 130 384 129 396 C128 420 130 450 132 478 C133 486 132 494 134 500 C140 503 154 503 158 498 C160 493 152 488 146 482 C146 472 148 462 151 446 C156 420 156 398 154 376 C153 364 153 352 156 330 C160 302 163 278 161 256 C160 240 152 228 153 214 C154 200 161 186 163 166 C164 152 169 138 173 126 C177 114 174 103 166 99 C156 93 144 90 132 86 C130 80 130 74 130 64 Z" />
                <path d="M72 100 C62 104 56 116 56 132 C55 160 52 180 50 200 C47 225 43 250 40 280 C37 290 33 300 34 312 C35 322 41 326 45 322 C49 316 48 306 50 294 C54 270 58 244 62 218 C64 204 66 196 68 184 C70 170 74 152 76 138 Z" />
                <path d="M168 100 C178 104 184 116 184 132 C185 160 188 180 190 200 C193 225 197 250 200 280 C203 290 207 300 206 312 C205 322 199 326 195 322 C191 316 192 306 190 294 C186 270 182 244 178 218 C176 204 174 196 172 184 C170 170 166 152 164 138 Z" />
              </clipPath>
            </defs>

            {/* Frosted Glass Silhouette */}
            <g opacity="0.95" fill="url(#ae-glass)">
              <path d="M72 100 C62 104 56 116 56 132 C55 160 52 180 50 200 C47 225 43 250 40 280 C37 290 33 300 34 312 C35 322 41 326 45 322 C49 316 48 306 50 294 C54 270 58 244 62 218 C64 204 66 196 68 184 C70 170 74 152 76 138 Z" />
              <path d="M168 100 C178 104 184 116 184 132 C185 160 188 180 190 200 C193 225 197 250 200 280 C203 290 207 300 206 312 C205 322 199 326 195 322 C191 316 192 306 190 294 C186 270 182 244 178 218 C176 204 174 196 172 184 C170 170 166 152 164 138 Z" />
              <path d="M110 64 C110 74 110 80 108 86 C96 90 84 93 74 99 C66 103 63 114 67 126 C71 138 76 152 77 166 C79 186 86 200 87 214 C88 228 80 240 79 256 C77 278 80 302 84 330 C87 352 87 364 86 376 C84 398 84 420 89 446 C92 462 94 472 94 482 C88 488 80 493 82 498 C86 503 100 503 106 500 C108 494 107 486 108 478 C110 450 112 420 111 396 C110 384 111 376 112 368 C114 340 117 310 120 288 C123 310 126 340 128 368 C129 376 130 384 129 396 C128 420 130 450 132 478 C133 486 132 494 134 500 C140 503 154 503 158 498 C160 493 152 488 146 482 C146 472 148 462 151 446 C156 420 156 398 154 376 C153 364 153 352 156 330 C160 302 163 278 161 256 C160 240 152 228 153 214 C154 200 161 186 163 166 C164 152 169 138 173 126 C177 114 174 103 166 99 C156 93 144 90 132 86 C130 80 130 74 130 64 Z" />
              <ellipse cx="120" cy="40" rx="22" ry="27" />
            </g>

            {/* Interior Internal Anatomy Clipped */}
            <g clipPath="url(#ae-bclip)">
              <rect x="0" y="0" width="240" height="520" fill="url(#ae-shade)" />

              {/* Holographic Tomography Contour Lines */}
              <g fill="none" stroke="rgba(150,120,165,0.18)" strokeWidth="0.8">
                <path d="M20 110 Q120 118 220 110" />
                <path d="M20 132 Q120 140 220 132" />
                <path d="M20 154 Q120 162 220 154" />
                <path d="M20 176 Q120 184 220 176" />
                <path d="M20 198 Q120 206 220 198" />
                <path d="M20 220 Q120 228 220 220" />
                <path d="M20 242 Q120 250 220 242" />
                <path d="M20 264 Q120 272 220 264" />
                <path d="M20 300 Q120 308 220 300" />
                <path d="M20 336 Q120 344 220 336" />
                <path d="M20 372 Q120 380 220 372" />
                <path d="M20 408 Q120 416 220 408" />
                <path d="M20 444 Q120 452 220 444" />
                <path d="M20 26 Q120 34 220 26" />
                <path d="M20 50 Q120 58 220 50" />
              </g>

              {/* Pulmonary Lungs */}
              <ellipse cx="104" cy="142" rx="15" ry="27" fill="rgba(255,160,170,0.22)" stroke="rgba(220,38,38,0.2)" />
              <ellipse cx="136" cy="142" rx="15" ry="27" fill="rgba(255,160,170,0.22)" stroke="rgba(220,38,38,0.2)" />

              {/* Skeletal Ribcage & Vertebral Column */}
              <g fill="none" stroke="rgba(160,115,140,0.36)" strokeWidth="1.4" strokeLinecap="round">
                <path d="M120 108 V172" strokeWidth="2.2" />
                <path d="M118 114 C106 113 94 117 88 128" />
                <path d="M122 114 C134 113 146 117 152 128" />
                <path d="M118 125 C105 124 93 129 87 141" />
                <path d="M122 125 C135 124 147 129 153 141" />
                <path d="M118 136 C105 136 93 141 88 154" />
                <path d="M122 136 C135 136 147 141 152 154" />
                <path d="M118 147 C106 148 95 153 90 166" />
                <path d="M122 147 C134 148 145 153 150 166" />
                <path d="M118 158 C108 160 99 166 95 177" />
                <path d="M122 158 C132 160 141 166 145 177" />
                <path d="M98 252 C104 270 136 270 142 252" />
                <path d="M92 104 C100 100 110 102 116 106" />
                <path d="M148 104 C140 100 130 102 124 106" />
              </g>

              {/* Spinal Column Vertebrae */}
              <g fill="rgba(160,115,140,0.38)">
                <circle cx="120" cy="184" r="2.4" />
                <circle cx="120" cy="193" r="2.4" />
                <circle cx="120" cy="202" r="2.4" />
                <circle cx="120" cy="211" r="2.4" />
                <circle cx="120" cy="220" r="2.4" />
                <circle cx="120" cy="229" r="2.4" />
                <circle cx="120" cy="238" r="2.4" />
                <circle cx="120" cy="247" r="2.4" />
              </g>

              {/* Major Vascular Pathways (Aorta, Femoral, Carotid) */}
              <g fill="none" stroke="rgba(220,38,38,0.25)" strokeWidth="1">
                <path d="M128 158 C126 190 118 220 112 252 C104 300 100 360 98 440" />
                <path d="M128 158 C134 196 138 230 130 258 C140 300 142 360 142 440" />
                <path d="M118 112 C96 116 74 118 64 150 C58 190 52 240 44 300" />
                <path d="M122 112 C144 116 166 118 176 150 C182 190 188 240 196 300" />
              </g>

              {/* Cerebral Cortex Silhouette */}
              <path
                d="M106 34 C110 26 118 26 120 32 C122 26 132 26 134 34 C138 40 132 48 126 46 C122 52 116 52 114 46 C106 48 102 40 106 34 Z"
                fill="rgba(255,140,150,0.26)"
                stroke="rgba(220,38,38,0.36)"
                strokeWidth="1"
              />
              <path
                d="M112 36 C116 34 118 38 122 36 M120 42 C124 40 128 44 130 40"
                fill="none"
                stroke="rgba(220,38,38,0.35)"
                strokeWidth="0.9"
              />

              {/* Hepatic/Stomach Node */}
              <ellipse cx="110" cy="200" rx="12" ry="8" fill="rgba(243,169,58,0.35)" />

              {/* Bio-Photonic Organ Glows */}
              <circle cx="120" cy="38" r="24" fill="url(#ae-glowR)" />
              <circle cx="128" cy="150" r="26" fill="url(#ae-glowR)" />
              <circle cx="110" cy="200" r="20" fill="url(#ae-glowR)" opacity="0.75" />

              {/* Pulsating Beating Heart (ae-beat) */}
              <path
                className="ae-beat"
                d="M128 160 C118 153 114 148 114 143 A6 6 0 0 1 128 139 A6 6 0 0 1 142 143 C142 148 138 153 128 160 Z"
                fill="#DC2626"
              />

              {/* Sweeping Laser Scan Beam */}
              <rect className="ae-beam" x="0" y="-60" width="240" height="60" fill="url(#ae-beamG)" />
            </g>

            {/* Specular Rim Lights */}
            <g fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1.4">
              <path
                d="M110 64 C110 74 110 80 108 86 C96 90 84 93 74 99 C66 103 63 114 67 126 C71 138 76 152 77 166 C79 186 86 200 87 214 C88 228 80 240 79 256 C77 278 80 302 84 330 C87 352 87 364 86 376 C84 398 84 420 89 446 C92 462 94 472 94 482 C88 488 80 493 82 498 C86 503 100 503 106 500 C108 494 107 486 108 478 C110 450 112 420 111 396 C110 384 111 376 112 368 C114 340 117 310 120 288 C123 310 126 340 128 368 C129 376 130 384 129 396 C128 420 130 450 132 478 C133 486 132 494 134 500 C140 503 154 503 158 498 C160 493 152 488 146 482 C146 472 148 462 151 446 C156 420 156 398 154 376 C153 364 153 352 156 330 C160 302 163 278 161 256 C160 240 152 228 153 214 C154 200 161 186 163 166 C164 152 169 138 173 126 C177 114 174 103 166 99 C156 93 144 90 132 86 C130 80 130 74 130 64"
                stroke="rgba(170,135,165,0.45)"
                strokeWidth="1"
              />
              <ellipse cx="120" cy="40" rx="22" ry="27" stroke="rgba(170,135,165,0.45)" strokeWidth="1" />
              <path d="M104 22 Q98 36 102 54" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
              <path d="M82 112 Q76 170 86 222" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
              <path d="M90 280 Q86 330 92 380" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
            </g>
          </svg>

          {/* Hotspots: Head & Cardiac Center */}
          <span className="ae-hot" style={{ left: "50%", top: "6.9%" }} title="Cerebral Hemodynamics: Active" />
          <span className="ae-hot" style={{ left: "45.8%", top: "38.5%", animationDelay: "0.8s" }} title="Myocardial Contractility: 72 BPM" />

          {/* Sweeping Laser Ring */}
          <div
            className="ae-scanring absolute -left-12 -right-12 top-0 h-11 rounded-[50%] pointer-events-none"
            style={{
              border: "2px solid rgba(220,38,38,0.85)",
              boxShadow: "0 0 24px rgba(220,38,38,0.55), inset 0 0 20px rgba(220,38,38,0.25)"
            }}
          />
        </Link>
      </div>

      {/* Floating 3D Spherical Accents */}
      <div
        className="ae-float absolute top-[220px] left-6 w-5 h-5 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle at 32% 28%, #FFB0AE 0%, #DC2626 40%, #8E0C14 100%)",
          animationDelay: "-3s"
        }}
      />
      <div
        className="ae-float-c absolute bottom-[160px] left-8 w-9 h-9 rounded-full pointer-events-none shadow-xl"
        style={{
          background: "radial-gradient(circle at 32% 28%, #8A8D93 0%, #2A2C30 34%, #0E0F11 80%)"
        }}
      />
      <div
        className="ae-float-b absolute top-[280px] right-4 w-4 h-4 rounded-full pointer-events-none shadow-md"
        style={{
          background: "radial-gradient(circle at 32% 28%, #FFFFFF 0%, #E2DDE3 50%, #B5ADB7 100%)"
        }}
      />

      {/* =========================================================================
          4 FLOATING GLASS TELEMETRY CARDS (From Reference Design)
          ========================================================================= */}

      {/* 1. Health Score Card (Top-Left) */}
      <div
        className="ae-float-c hidden sm:flex absolute top-6 -left-4 w-52 items-center gap-3.5 p-3.5 rounded-2xl z-20"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.88), rgba(255,255,255,0.55))",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.92)",
          boxShadow: "0 22px 46px rgba(29,31,34,0.10), inset 0 1px 0 #FFFFFF"
        }}
      >
        <div className="relative shrink-0 w-12 h-12">
          <svg width="48" height="48" viewBox="0 0 54 54">
            <defs>
              <linearGradient id="ae-scoreG" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#FF7A80" />
                <stop offset="1" stopColor="#DC2626" />
              </linearGradient>
            </defs>
            <circle cx="27" cy="27" r="22" fill="none" stroke="#F3E3E5" strokeWidth="5.5" />
            <circle
              cx="27"
              cy="27"
              r="22"
              fill="none"
              stroke="url(#ae-scoreG)"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeDasharray="138.2"
              strokeDashoffset="19.4"
              transform="rotate(-90 27 27)"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-bold text-base text-gray-900 tracking-tight">
            <AnimatedCounter end={86} duration={1200} />
          </span>
        </div>
        <div className="text-xs leading-tight">
          <div className="font-bold text-gray-900">Health Score</div>
          <div className="text-[11px] text-gray-500">Updated today</div>
          <div className="mt-1 inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
            +4 this month
          </div>
        </div>
      </div>

      {/* 2. Live Heart Rate & ECG Card (Top-Right) */}
      <div
        className="ae-float-b absolute top-14 -right-2 sm:-right-6 w-48 p-3.5 rounded-2xl z-20"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.88), rgba(255,255,255,0.55))",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.92)",
          boxShadow: "0 22px 46px rgba(29,31,34,0.10), inset 0 1px 0 #FFFFFF"
        }}
      >
        <div className="flex justify-between items-center text-xs">
          <span className="inline-flex items-center gap-1.5 font-bold text-gray-900">
            <span className="w-6 h-6 rounded-lg bg-red-100/80 flex items-center justify-center text-red-600">
              <Heart className="w-3.5 h-3.5 fill-current" />
            </span>
            Heart Rate
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 font-mono">
            <span className="ae-pulse w-1.5 h-1.5 rounded-full bg-red-600" />
            LIVE
          </span>
        </div>
        <div className="mt-2 font-black text-2xl text-gray-900 tracking-tight leading-none">
          <AnimatedCounter end={72} duration={1000} /> <span className="text-xs font-normal text-gray-500">bpm</span>
        </div>
        <svg width="100%" height="30" viewBox="0 0 168 34" preserveAspectRatio="none" className="mt-1.5 block">
          <path
            className="ae-ecg"
            d="M0 18 H38 L44 18 L48 6 L53 30 L58 10 L62 18 H96 L102 18 L106 6 L111 30 L116 10 L120 18 H168"
            fill="none"
            stroke="#DC2626"
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* 3. Post-Meal Glucose Curve Card (Bottom-Right) */}
      <div
        className="ae-float-c hidden sm:block absolute top-[340px] -right-4 sm:-right-8 w-54 p-3.5 rounded-2xl z-20"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.88), rgba(255,255,255,0.55))",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.92)",
          boxShadow: "0 22px 46px rgba(29,31,34,0.10), inset 0 1px 0 #FFFFFF",
          animationDelay: "-2.5s"
        }}
      >
        <div className="flex justify-between items-center gap-2">
          <span className="font-bold text-xs text-gray-900 whitespace-nowrap">Post-Meal Glucose</span>
          <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold">
            Borderline
          </span>
        </div>
        <svg width="100%" height="42" viewBox="0 0 184 48" preserveAspectRatio="none" className="mt-2 block">
          <defs>
            <linearGradient id="ae-sparkG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#DC2626" stopOpacity="0.25" />
              <stop offset="1" stopColor="#DC2626" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 38 C20 36 30 33 44 29 C60 25 66 12 84 14 C100 16 108 30 124 26 C140 22 152 10 184 8 L184 48 L0 48 Z"
            fill="url(#ae-sparkG)"
          />
          <path
            d="M0 38 C20 36 30 33 44 29 C60 25 66 12 84 14 C100 16 108 30 124 26 C140 22 152 10 184 8"
            fill="none"
            stroke="#DC2626"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="180" cy="8.4" r="3.6" fill="#FFFFFF" stroke="#DC2626" strokeWidth="2" />
        </svg>
        <div className="mt-1 flex items-center gap-1.5 text-gray-500 text-[10px]">
          <Activity className="w-3 h-3 text-red-600" />
          <span>Pattern detected after meals</span>
        </div>
      </div>

      {/* 4. Multilingual Localized Intelligence Badge (Bottom-Left) */}
      <div
        className="ae-float absolute bottom-6 -left-2 sm:-left-6 flex items-center gap-2.5 p-2.5 sm:p-3 rounded-2xl z-20"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.88), rgba(255,255,255,0.55))",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.92)",
          boxShadow: "0 22px 46px rgba(29,31,34,0.10), inset 0 1px 0 #FFFFFF",
          animationDelay: "-1.5s"
        }}
      >
        <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-bold shadow-sm">
          अ
        </span>
        <div className="text-xs leading-tight">
          <span className="font-bold text-gray-900">हिन्दी में समझाएँ</span>
          <br />
          <span className="text-[11px] text-gray-500 font-medium">Explained in 22+ languages</span>
        </div>
      </div>
    </div>
  );
}
