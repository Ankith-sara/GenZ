import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { clsx } from "clsx";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  changeType?: "increase" | "decrease" | "neutral";
  description?: string;
  icon?: React.ReactNode;
  sparklineData?: number[];
  href?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  description,
  icon,
  sparklineData = [0, 2, 1, 4, 3, 6, 5],
  className,
}: MetricCardProps) {
  const isPositive = changeType === "increase";
  const isNegative = changeType === "decrease";

  const sparklinePath = useMemo(() => {
    if (!sparklineData || sparklineData.length === 0) return "";
    const max = Math.max(...sparklineData, 1);
    const min = Math.min(...sparklineData, 0);
    const range = max - min || 1;

    return sparklineData
      .map((val, idx) => {
        const x = (idx * 64) / Math.max(sparklineData.length - 1, 1);
        const y = 16 - ((val - min) / range) * 12;
        return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  }, [sparklineData]);

  return (
    <div
      className={clsx(
        "group relative flex flex-col justify-between rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-2xs transition-all duration-200 select-none hover:border-black/30 hover:shadow-xs",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold tracking-wider text-[#73736E] uppercase">
            {title}
          </span>
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E5E0] bg-[#FAF7F0] text-[#52524E] transition-colors group-hover:bg-black group-hover:text-white">
              {icon}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <span className="text-2xl font-bold tracking-tight text-[#1A1A18] sm:text-3xl">
            {value}
          </span>

          {change !== undefined && (
            <span
              className={clsx(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] font-bold",
                isPositive &&
                  "border border-emerald-200/60 bg-emerald-50 text-emerald-700",
                isNegative && "border border-rose-200/60 bg-rose-50 text-rose-700",
                !isPositive &&
                  !isNegative &&
                  "border border-neutral-200 bg-neutral-100 text-neutral-600"
              )}
            >
              {isPositive && <TrendingUp className="h-3 w-3" />}
              {isNegative && <TrendingDown className="h-3 w-3" />}
              {!isPositive && !isNegative && <Minus className="h-3 w-3" />}
              <span>{change}</span>
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#F0F0EC] pt-3">
        {description ? (
          <span className="max-w-[140px] truncate text-[11px] text-[#8C8C85]">
            {description}
          </span>
        ) : (
          <span className="text-[11px] text-[#8C8C85]">vs previous 7 days</span>
        )}

        {sparklinePath && (
          <div className="h-5 w-16 shrink-0 opacity-70 transition-opacity group-hover:opacity-100">
            <svg viewBox="0 0 64 20" className="h-full w-full overflow-hidden">
              <path
                d={sparklinePath}
                fill="none"
                stroke={isNegative ? "#E11D48" : isPositive ? "#10B981" : "#73736E"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
