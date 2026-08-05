"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ChevronDown, Loader2 } from "lucide-react";
import { updateApplicationStatusDirectly } from "./actions";

export function StatusDropdown({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === status) return;

    const previousStatus = status;
    setStatus(newStatus);

    startTransition(async () => {
      const res = await updateApplicationStatusDirectly(
        applicationId,
        newStatus as "pending" | "approved" | "rejected"
      );
      if (res.error) {
        setStatus(previousStatus);
        toast.error(res.error);
      } else {
        toast.success(`Application status updated to ${newStatus.toUpperCase()}`);
      }
    });
  };

  const getBadgeStyle = (st: string) => {
    switch (st) {
      case "approved":
      case "verified":
        return "border-emerald-300 bg-emerald-50 text-emerald-800 focus:ring-emerald-500 hover:bg-emerald-100";
      case "rejected":
        return "border-red-300 bg-red-50 text-red-800 focus:ring-red-500 hover:bg-red-100";
      case "pending":
      default:
        return "border-amber-300 bg-amber-50 text-amber-800 focus:ring-amber-500 hover:bg-amber-100";
    }
  };

  return (
    <div
      className="relative inline-flex items-center"
      onClick={(e) => e.stopPropagation()}
    >
      <select
        value={status}
        disabled={isPending}
        onChange={(e) => handleStatusChange(e.target.value)}
        className={`font-graphik cursor-pointer appearance-none rounded-full border px-3.5 py-1.5 pr-7 text-xs font-bold tracking-wider uppercase transition-all outline-none focus:ring-2 ${getBadgeStyle(
          status
        )} ${isPending ? "cursor-wait opacity-60" : ""}`}
      >
        <option value="pending" className="bg-white text-black">
          PENDING
        </option>
        <option value="approved" className="bg-white text-black">
          APPROVED
        </option>
        <option value="rejected" className="bg-white text-black">
          REJECTED
        </option>
      </select>
      <div className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2">
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin text-current opacity-70" />
        ) : (
          <ChevronDown className="h-3 w-3 text-current opacity-70" />
        )}
      </div>
    </div>
  );
}
