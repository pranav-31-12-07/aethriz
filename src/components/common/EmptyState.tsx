import React from "react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionText,
  actionHref,
  onActionClick,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`p-8 sm:p-12 rounded-[28px] bg-white border border-slate-200/80 shadow-[0_4px_20px_rgba(29,31,34,0.03)] text-center flex flex-col items-center justify-center ae-fade-in ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 text-[#64748B] flex items-center justify-center mb-4">
        {icon || (
          <svg
            className="w-7 h-7 text-[#94A3B8]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        )}
      </div>

      <h3
        className="text-lg font-semibold tracking-tight text-[#1D1F22] mb-1.5"
        style={{ fontFamily: "'Inter Tight', sans-serif" }}
      >
        {title}
      </h3>
      <p className="text-xs text-[#64748B] max-w-md leading-relaxed mb-6">
        {description}
      </p>

      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white shadow-[0_8px_20px_rgba(14,15,17,0.2)] hover:opacity-95 transition-all cursor-pointer active:scale-95"
          style={{
            background: "linear-gradient(180deg, #32363A 0%, #1D1F22 100%)",
          }}
        >
          <span>{actionText}</span>
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
        </Link>
      )}

      {actionText && !actionHref && onActionClick && (
        <button
          type="button"
          onClick={onActionClick}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white shadow-[0_8px_20px_rgba(14,15,17,0.2)] hover:opacity-95 transition-all cursor-pointer active:scale-95"
          style={{
            background: "linear-gradient(180deg, #32363A 0%, #1D1F22 100%)",
          }}
        >
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}

