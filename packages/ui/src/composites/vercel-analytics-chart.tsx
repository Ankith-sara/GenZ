"use client";

import { useState } from "react";

export interface DailyDataPoint {
  date: string;
  fullDate: string;
  pageViews: number;
  uniqueVisitors: number;
  isDashed?: boolean;
}

interface VercelAnalyticsChartProps {
  dailyData: DailyDataPoint[];
  totalVisitors: number;
  totalPageViews: number;
}

export function VercelAnalyticsChart({
  dailyData,
  totalVisitors,
  totalPageViews,
}: VercelAnalyticsChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<"visitors" | "pageViews">("visitors");

  const width = 760;
  const height = 220;
  const paddingLeft = 45;
  const paddingRight = 35;
  const paddingTop = 25;
  const paddingBottom = 45;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Dynamic scaling based on selected tab and actual data
  const getTabConfig = () => {
    if (selectedTab === "pageViews") {
      const maxPV = Math.max(...dailyData.map((d) => d.pageViews), 1);
      const ceilMax = Math.ceil(maxPV / 10) * 10 || 10;
      const step = Math.max(Math.round(ceilMax / 4), 1);
      const ticks = Array.from({ length: 5 }, (_, i) => step * (4 - i)).concat([0]);
      // Deduplicate ticks
      const uniqueTicks = [...new Set(ticks)].sort((a, b) => b - a);
      return {
        maxVal: ceilMax,
        ticks: uniqueTicks,
        label: "Page Views",
        getVal: (d: DailyDataPoint) => d.pageViews,
      };
    }
    // visitors
    const maxV = Math.max(...dailyData.map((d) => d.uniqueVisitors), 1);
    const ceilMax = Math.ceil(maxV / 5) * 5 || 5;
    const step = Math.max(Math.round(ceilMax / 3), 1);
    const ticks = Array.from({ length: 4 }, (_, i) => step * (3 - i)).concat([0]);
    const uniqueTicks = [...new Set(ticks)].sort((a, b) => b - a);
    return {
      maxVal: ceilMax,
      ticks: uniqueTicks,
      label: "Visitors",
      getVal: (d: DailyDataPoint) => d.uniqueVisitors,
    };
  };

  const config = getTabConfig();

  const points = dailyData.map((d, i) => {
    const val = config.getVal(d);
    const x =
      paddingLeft +
      (dailyData.length > 1 ? (i / (dailyData.length - 1)) * chartW : chartW / 2);
    const y = paddingTop + chartH - (val / config.maxVal) * chartH;
    return { ...d, val, x, y };
  });

  // Separate solid vs dashed segments
  const solidPoints = points.filter((p) => !p.isDashed);
  const solidPath = solidPoints.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`),
    ""
  );

  const lastSolid = solidPoints[solidPoints.length - 1];
  const dashedPoints = points.filter((p) => p.isDashed);
  const dashedPath =
    lastSolid && dashedPoints.length > 0
      ? `M ${lastSolid.x},${lastSolid.y} L ${dashedPoints[0].x},${dashedPoints[0].y}`
      : "";

  // Fill area
  const allPathPoints = points.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`),
    ""
  );
  const fillPath =
    points.length > 0
      ? `${allPathPoints} L ${points[points.length - 1].x},${height - paddingBottom} L ${points[0].x},${height - paddingBottom} Z`
      : "";

  const activePoint = activeIndex !== null ? points[activeIndex] : null;

  // Empty state
  if (dailyData.length === 0) {
    return (
      <div className="w-full overflow-hidden rounded-3xl border border-[#E5E5E0] bg-white p-12 text-center font-sans text-black shadow-xs select-none">
        <p className="font-graphik text-sm text-[#73736E]">No analytics data yet.</p>
        <p className="font-graphik mt-2 text-xs text-[#8C8C85]">
          Page views will appear here as real visitors browse your site.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-[#E5E5E0] bg-white font-sans text-black shadow-xs select-none">
      {/* TAB HEADERS */}
      <div className="flex border-b border-[#E5E5E0] bg-[#FAF7F0]">
        <button
          onClick={() => setSelectedTab("visitors")}
          className={`relative flex-1 border-r border-[#E5E5E0] p-4 text-left transition-colors sm:p-5 ${
            selectedTab === "visitors" ? "bg-white" : "hover:bg-white/60"
          }`}
        >
          {selectedTab === "visitors" && (
            <div className="absolute top-0 right-0 left-0 h-0.5 bg-black" />
          )}
          <p className="text-xs font-semibold tracking-wider text-[#73736E] uppercase">
            Unique Visitors
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-black">
              {totalVisitors}
            </span>
          </div>
        </button>

        <button
          onClick={() => setSelectedTab("pageViews")}
          className={`relative flex-1 p-4 text-left transition-colors sm:p-5 ${
            selectedTab === "pageViews" ? "bg-white" : "hover:bg-white/60"
          }`}
        >
          {selectedTab === "pageViews" && (
            <div className="absolute top-0 right-0 left-0 h-0.5 bg-black" />
          )}
          <p className="text-xs font-semibold tracking-wider text-[#73736E] uppercase">
            Page Views
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-black">
              {totalPageViews}
            </span>
          </div>
        </button>
      </div>

      {/* GRAPH CANVAS */}
      <div className="relative bg-white p-4 sm:p-6">
        <div className="relative h-[220px] w-full">
          <svg
            className="h-full w-full overflow-visible"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const mouseX = ((e.clientX - rect.left) / rect.width) * width;
              let closestIdx = 0;
              let minDist = Infinity;
              points.forEach((pt, idx) => {
                const dist = Math.abs(mouseX - pt.x);
                if (dist < minDist) {
                  minDist = dist;
                  closestIdx = idx;
                }
              });
              setActiveIndex(closestIdx);
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0070F3" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#0070F3" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Y-Axis Grid Lines & Tick Labels */}
            {config.ticks.map((val) => {
              const lineY = paddingTop + chartH - (val / config.maxVal) * chartH;
              return (
                <g key={val}>
                  <line
                    x1={paddingLeft}
                    y1={lineY}
                    x2={width - paddingRight}
                    y2={lineY}
                    stroke="#E5E5E0"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={lineY + 4}
                    fill="#8C8C85"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="600"
                    textAnchor="end"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Fill Area */}
            {fillPath && <path d={fillPath} fill="url(#chartFill)" />}

            {/* Solid Line */}
            {solidPath && (
              <path
                d={solidPath}
                fill="none"
                stroke="#0070F3"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Dashed Line (today / in-progress) */}
            {dashedPath && (
              <path
                d={dashedPath}
                fill="none"
                stroke="#0070F3"
                strokeWidth="3"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
            )}

            {/* Crosshair & Active Point */}
            {activePoint && (
              <>
                <line
                  x1={activePoint.x}
                  y1={paddingTop}
                  x2={activePoint.x}
                  y2={height - paddingBottom}
                  stroke="#1A1A18"
                  strokeWidth="1.5"
                />
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="5"
                  fill="#0070F3"
                  stroke="#1A1A18"
                  strokeWidth="2"
                />
              </>
            )}
          </svg>

          {/* Floating Tooltip */}
          {activePoint && (
            <div
              className="pointer-events-none absolute z-20 transition-all duration-100 ease-out"
              style={{
                left: `${(activePoint.x / width) * 100}%`,
                top: `${(activePoint.y / height) * 100}%`,
                transform: "translate(12px, -35px)",
              }}
            >
              <div className="min-w-[140px] space-y-1 rounded-xl border border-[#E5E5E0] bg-white/95 p-3 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="h-2 w-2 rounded-full bg-[#0070F3]" />
                  <span className="font-medium text-[#73736E]">{config.label}</span>
                  <span className="ml-auto font-mono text-sm font-bold text-black">
                    {activePoint.val}
                  </span>
                </div>
                <p className="pl-3.5 font-mono text-[11px] text-[#8C8C85]">
                  {activePoint.fullDate}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* X-Axis Date Labels */}
        <div className="relative mt-1 flex justify-between border-t border-[#E5E5E0] px-4 pt-3 font-mono text-xs text-[#73736E]">
          {points.map((pt, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div key={idx} className="relative flex flex-col items-center">
                <span
                  className={`transition-colors ${isActive ? "font-bold text-black" : ""}`}
                >
                  {pt.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
