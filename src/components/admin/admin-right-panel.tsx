"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Profile {
  id: string;
  role: "buyer" | "manufacturer" | "admin";
  full_name: string | null;
  city: string | null;
  last_active_at: string | null;
  created_at: string;
}

interface AdminRightPanelProps {
  profiles?: Profile[];
  pendingCount?: number;
}

export function AdminRightPanel({
  profiles = [],
  pendingCount = 0,
}: AdminRightPanelProps) {
  const [selectedDate, setSelectedDate] = useState<number>(2);

  const getOnlineState = (dateStr: string | null) => {
    if (!dateStr) return { label: "Offline", color: "bg-neutral-300 text-neutral-600" };
    const date = new Date(dateStr);
    const now = new Date();
    const diffMins = (now.getTime() - date.getTime()) / (1000 * 60);
    if (diffMins <= 15)
      return { label: "Online Now", color: "bg-emerald-500 text-white" };
    if (diffMins <= 1440)
      return { label: "Active Today", color: "bg-amber-400 text-amber-950" };
    return { label: "Offline", color: "bg-neutral-300 text-neutral-600" };
  };

  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const activeEventDays = [2, 5, 8, 12, 15, 19, 22, 28];

  return (
    <aside className="border-ash space-y-6 rounded-3xl border bg-white p-4 shadow-xs">
      {/* Month Calendar Widget */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="font-nantes text-ink-black text-base font-bold">
            August 2026
          </span>
          <div className="flex items-center gap-1">
            <button className="rounded-lg p-1 hover:bg-[#FAF7F0]">
              <ChevronLeft className="text-smoke h-4 w-4" />
            </button>
            <button className="rounded-lg p-1 hover:bg-[#FAF7F0]">
              <ChevronRight className="text-smoke h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border-ash/80 rounded-2xl border bg-[#FAF7F0] p-3">
          <div className="font-graphik text-smoke mb-2 grid grid-cols-7 text-center text-[10px] font-semibold uppercase">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          <div className="font-graphik grid grid-cols-7 gap-1 text-center text-xs">
            {calendarDays.map((day) => {
              const hasEvent = activeEventDays.includes(day);
              const isSelected = selectedDate === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg font-medium transition-all ${
                    isSelected
                      ? "bg-ink-black font-bold text-white shadow-xs"
                      : "text-ink-black hover:bg-white"
                  }`}
                >
                  {day}
                  {hasEvent && !isSelected && (
                    <span className="bg-brand-yellow-dark absolute bottom-1 h-1 w-1 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Active Sessions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="font-graphik text-smoke text-xs font-semibold tracking-wider uppercase">
            Live Active Sessions
          </span>
          <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            ● Live
          </span>
        </div>

        <div className="space-y-2.5">
          {profiles.slice(0, 4).map((usr) => {
            const state = getOnlineState(usr.last_active_at || usr.created_at);
            return (
              <div
                key={usr.id}
                className="border-ash/70 flex items-center justify-between rounded-xl border bg-[#FAF7F0] p-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="bg-brand-yellow/40 font-nantes text-ink-black flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold">
                    {(usr.full_name || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="font-graphik text-ink-black block text-xs leading-tight font-semibold">
                      {usr.full_name || "Anonymous User"}
                    </span>
                    <span className="font-graphik text-smoke block text-[10px] capitalize">
                      {usr.role} • {usr.city || "India"}
                    </span>
                  </div>
                </div>

                <span className={`h-2 w-2 rounded-full ${state.color.split(" ")[0]}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Operational Checklist */}
      <div className="border-ash/80 space-y-3 rounded-2xl border bg-[#FAF7F0] p-4">
        <span className="font-graphik text-smoke block text-xs font-semibold tracking-wider uppercase">
          Fulfillment Tasks Queue
        </span>
        <div className="font-graphik space-y-2 text-xs">
          <label className="text-ink-black flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              defaultChecked
              className="border-ash text-brand-yellow-dark rounded"
            />
            <span>Review pending GST audits ({pendingCount})</span>
          </label>
          <label className="text-ink-black flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              defaultChecked
              className="border-ash text-brand-yellow-dark rounded"
            />
            <span>Verify catalog B2C prices</span>
          </label>
          <label className="text-ink-black flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="border-ash text-brand-yellow-dark rounded"
            />
            <span>Export weekly buyer inquiries</span>
          </label>
        </div>
      </div>
    </aside>
  );
}
