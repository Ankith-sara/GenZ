import React from "react";

export function TableSkeleton({
  rows = 5,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="w-full animate-pulse space-y-3">
      <div className="flex h-10 w-full items-center justify-between rounded-xl bg-neutral-200/60 px-4" />
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div
          key={rIdx}
          className="flex h-14 w-full items-center justify-between gap-4 rounded-xl border border-neutral-100 bg-neutral-50 px-4"
        >
          {Array.from({ length: columns }).map((_, cIdx) => (
            <div key={cIdx} className="h-4 flex-1 rounded bg-neutral-200/70" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 rounded bg-neutral-200" />
        <div className="h-8 w-8 rounded-lg bg-neutral-100" />
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <div className="h-8 w-20 rounded bg-neutral-200" />
        <div className="h-5 w-12 rounded bg-neutral-100" />
      </div>
      <div className="mt-4 border-t border-neutral-100 pt-3">
        <div className="h-3 w-32 rounded bg-neutral-200" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="h-5 w-48 rounded bg-neutral-200" />
        <div className="h-8 w-32 rounded-lg bg-neutral-100" />
      </div>
      <div className="h-64 w-full rounded-xl bg-neutral-100/70" />
    </div>
  );
}
