"use client";

import { useTransition } from "react";
import type { InquiryStatus } from "@/types/database";
import { updateInquiryStatus } from "./actions";

const OPTIONS: InquiryStatus[] = ["new", "responded", "closed"];
const LABEL: Record<InquiryStatus, string> = {
  new: "New",
  responded: "Responded",
  closed: "Closed",
};

export function InquiryStatusSelect({
  inquiryId,
  status,
}: {
  inquiryId: string;
  status: InquiryStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) =>
        startTransition(() => {
          updateInquiryStatus(inquiryId, e.target.value as InquiryStatus);
        })
      }
      className="border-input bg-card text-foreground h-9 rounded-[4px] border px-2 text-xs"
    >
      {OPTIONS.map((o) => (
        <option key={o} value={o}>
          {LABEL[o]}
        </option>
      ))}
    </select>
  );
}
