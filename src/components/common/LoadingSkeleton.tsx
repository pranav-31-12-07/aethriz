import React from "react";

export function StatsCardSkeleton() {
  return (
    <div className="p-5 rounded-[24px] bg-white border border-slate-200/80 shadow-[0_8px_24px_rgba(29,31,34,0.03)] animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 bg-slate-200 rounded" />
        <div className="h-2 w-2 rounded-full bg-slate-200" />
      </div>
      <div className="my-3 space-y-2">
        <div className="h-8 w-16 bg-slate-200 rounded" />
        <div className="h-3 w-32 bg-slate-100 rounded" />
      </div>
      <div className="h-1 bg-slate-100 rounded-full" />
    </div>
  );
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="p-6 rounded-[28px] bg-white border border-slate-200/80 shadow-[0_8px_24px_rgba(29,31,34,0.03)] animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-4 w-40 bg-slate-200 rounded" />
        <div className="h-3 w-16 bg-slate-100 rounded" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-32 bg-slate-200 rounded" />
                <div className="h-2.5 w-48 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="h-8 w-24 bg-slate-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

