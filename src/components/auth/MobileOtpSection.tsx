"use client";

import React, { useState, useEffect } from "react";
import { formatToE164, sendPhoneOtp } from "@/lib/supabase";

interface MobileOtpSectionProps {
  mobile: string;
  otp: string;
  setOtp: (val: string) => void;
  onVerify: () => void;
  onBack: () => void;
  onEditMobile: () => void;
  isLoading: boolean;
  submitLabel?: string;
  stepNumber?: number;
  totalSteps?: number;
  onResendOtp?: () => Promise<void>;
  statusMessage?: string;
}

export default function MobileOtpSection({
  mobile,
  otp,
  setOtp,
  onVerify,
  onBack,
  onEditMobile,
  isLoading,
  submitLabel = "Verify & Complete Registration",
  stepNumber = 4,
  totalSteps = 4,
  onResendOtp,
  statusMessage,
}: MobileOtpSectionProps) {
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [resendNotice, setResendNotice] = useState("");
  const [isResending, setIsResending] = useState(false);

  const formattedE164 = formatToE164(mobile);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    setResendNotice("");

    if (onResendOtp) {
      await onResendOtp();
    } else {
      const res = await sendPhoneOtp(mobile);
      if (res.success) {
        setResendNotice(res.message || "A new OTP code has been dispatched.");
      } else {
        setResendNotice(res.error || "Failed to dispatch OTP. Please retry.");
      }
    }

    setIsResending(false);
    setCountdown(30);
    setCanResend(false);
    setTimeout(() => setResendNotice(""), 6000);
  };

  return (
    <div className="space-y-6 ae-fade-in">
      {/* Step Header */}
      <div>
        <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#E3202B] uppercase">
          Step {stepNumber} of {totalSteps} · SMS Verification
        </span>
        <h2
          className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1F22] mt-1 mb-2"
          style={{ fontFamily: "'Inter Tight', sans-serif" }}
        >
          Verify your mobile number.
        </h2>
        <p className="text-sm text-[#64748B]">
          Enter the 6-digit verification code sent to your phone number.
        </p>
      </div>

      {/* Target Mobile Badge with E.164 formatting & Edit Option */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#1D1F22]">
            <svg
              className="w-5 h-5 text-[#E3202B]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </div>
          <div>
            <span className="text-[11px] text-[#64748B] block">Recipient Phone Number:</span>
            <span className="font-mono font-semibold text-sm text-[#1D1F22]">
              {formattedE164 || "Phone not provided"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onEditMobile}
          className="text-xs font-semibold text-[#E3202B] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <span>Edit number</span>
        </button>
      </div>

      {/* OTP Input Field */}
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-2 uppercase tracking-wider">
          Enter 6-Digit SMS Code
        </label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="• • • • • •"
            required
            autoFocus
            className="w-full px-5 py-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 text-center font-mono font-bold text-xl sm:text-2xl tracking-[0.5em] text-[#1D1F22] placeholder:text-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#E3202B]/20 focus:border-[#E3202B] transition-all"
          />
        </div>
      </div>

      {/* Status or Error Notifications */}
      {statusMessage && (
        <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700 font-medium ae-fade-in flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
          <span>{statusMessage}</span>
        </div>
      )}

      {resendNotice && (
        <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-[#1D1F22] font-medium ae-fade-in">
          {resendNotice}
        </div>
      )}

      {/* Resend Notice or Timer */}
      <div className="flex items-center justify-between text-xs text-[#64748B]">
        <span>Didn&apos;t receive the code?</span>
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="font-semibold text-[#E3202B] hover:underline cursor-pointer disabled:opacity-50"
          >
            {isResending ? "Dispatching SMS..." : "Resend OTP via SMS"}
          </button>
        ) : (
          <span className="font-mono text-[#94A3B8]">
            Resend in {countdown}s
          </span>
        )}
      </div>

      {/* Action Buttons: Back & Complete */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="px-6 py-2.5 rounded-full text-xs font-semibold text-[#475569] bg-[#ECEFF3] hover:bg-[#E2E8F0] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onVerify}
          disabled={isLoading || otp.length < 6}
          className="py-3 px-8 rounded-full text-xs font-semibold text-white shadow-[0_10px_24px_rgba(29,31,34,0.18)] hover:opacity-95 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(180deg, #32363A 0%, #1D1F22 100%)",
          }}
        >
          {isLoading ? (
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <>
              <span>{submitLabel}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
