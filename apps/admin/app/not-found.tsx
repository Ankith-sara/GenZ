import React from "react";
import Link from "next/link";
import { AlertCircle, LayoutDashboard, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@genz/ui";

const ICON_STROKE = 1.75;
const PRESSABLE =
  "cursor-pointer transition-all duration-150 ease-out active:scale-[0.98]";
const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]/20 focus-visible:ring-offset-1";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mx-auto max-w-md space-y-6">
        {/* Visual Error Badge */}
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 shadow-xs">
          <AlertCircle className="h-8 w-8" strokeWidth={ICON_STROKE} />
        </div>

        {/* Text Heading */}
        <div className="space-y-2">
          <span className="font-mono text-xs font-semibold tracking-wider text-rose-600 uppercase">
            Error 404
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-[#171717] sm:text-3xl">
            Page Not Found
          </h1>
          <p className="text-xs text-[#737373] sm:text-sm">
            The requested administrative route or page does not exist or has been relocated.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-center">
          <Link href="/dashboard">
            <Button
              className={`h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#171717] px-4 text-xs font-medium text-white shadow-xs hover:bg-[#262626] sm:w-auto ${PRESSABLE} ${FOCUS_RING}`}
            >
              <LayoutDashboard className="h-4 w-4" strokeWidth={ICON_STROKE} />
              <span>Admin Dashboard</span>
            </Button>
          </Link>

          <Link href="/dashboard/products">
            <Button
              variant="outline"
              className={`h-9 w-full items-center justify-center gap-2 rounded-lg border-[#E5E5E5] bg-white px-4 text-xs font-medium text-[#171717] hover:bg-[#F5F5F4] sm:w-auto ${PRESSABLE} ${FOCUS_RING}`}
            >
              <ShoppingBag className="h-4 w-4 text-[#737373]" strokeWidth={ICON_STROKE} />
              <span>Product Catalog</span>
            </Button>
          </Link>
        </div>

        {/* Secondary Link */}
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#737373] hover:text-[#171717] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to main control panel</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
