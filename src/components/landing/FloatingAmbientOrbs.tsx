"use client";

import React from "react";

/**
 * Ambient, subtle red floating background spheres.
 * Refined to 4 soft ambient orbs per viewport:
 * - 10-18% low opacity
 * - Deep gaussian blur (140px - 180px)
 * - Smaller sizes (240px - 440px)
 * - Positioned away from dense text and dashboard cards
 * - Slow, subtle drift (36s - 48s)
 */
export default function FloatingAmbientOrbs() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* Orb 1: Upper-left perimeter, gentle ambient glow */}
      <div
        className="absolute rounded-full filter blur-[150px] sm:blur-[170px] opacity-[0.16] mix-blend-multiply will-change-transform"
        style={{
          width: "min(34vw, 360px)",
          height: "min(34vw, 360px)",
          top: "-8%",
          left: "-2%",
          background: "radial-gradient(circle, #FF243F 0%, rgba(255, 36, 63, 0.25) 55%, transparent 75%)",
          animation: "orbDrift1 38s ease-in-out infinite",
        }}
      />

      {/* Orb 2: Far right perimeter behind spacious margin */}
      <div
        className="absolute rounded-full filter blur-[160px] sm:blur-[180px] opacity-[0.14] mix-blend-multiply will-change-transform"
        style={{
          width: "min(38vw, 420px)",
          height: "min(38vw, 420px)",
          top: "18%",
          right: "-10%",
          background: "radial-gradient(circle, #E11D48 0%, rgba(225, 29, 72, 0.2) 60%, transparent 80%)",
          animation: "orbDrift2 46s ease-in-out infinite",
          animationDelay: "-12s",
        }}
      />

      {/* Orb 3: Mid-page perimeter on far left */}
      <div
        className="absolute rounded-full filter blur-[140px] sm:blur-[160px] opacity-[0.12] mix-blend-multiply will-change-transform"
        style={{
          width: "min(28vw, 300px)",
          height: "min(28vw, 300px)",
          top: "54%",
          left: "-6%",
          background: "radial-gradient(circle, #FF243F 0%, rgba(255, 60, 80, 0.2) 50%, transparent 75%)",
          animation: "orbDrift3 42s ease-in-out infinite",
          animationDelay: "-20s",
        }}
      />

      {/* Orb 4: Lower page perimeter on bottom right */}
      <div
        className="absolute rounded-full filter blur-[150px] sm:blur-[180px] opacity-[0.15] mix-blend-multiply will-change-transform"
        style={{
          width: "min(36vw, 380px)",
          height: "min(36vw, 380px)",
          top: "78%",
          right: "-4%",
          background: "radial-gradient(circle, #DC2626 0%, rgba(255, 36, 63, 0.22) 55%, transparent 75%)",
          animation: "orbDrift4 48s ease-in-out infinite",
          animationDelay: "-8s",
        }}
      />
    </div>
  );
}
