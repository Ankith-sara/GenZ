import React from "react";
import { ShieldCheck, FileCheck } from "lucide-react";

interface TaxComplianceCardProps {
  gstRate: string;
  onChangeGstRate: (val: string) => void;
  hsnCode: string;
  onChangeHsnCode: (val: string) => void;
  countryOfOrigin: string;
  onChangeCountryOfOrigin: (val: string) => void;
}

const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]/20 focus-visible:ring-offset-1";

export function TaxComplianceCard({
  gstRate,
  onChangeGstRate,
  hsnCode,
  onChangeHsnCode,
  countryOfOrigin,
  onChangeCountryOfOrigin,
}: TaxComplianceCardProps) {
  return (
    <div id="tax-compliance" className="space-y-4 rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-xs">
      <div className="border-b border-[#E5E5E5] pb-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#171717]">
          <ShieldCheck className="h-4 w-4 text-[#737373]" />
          <span>Tax & Compliance</span>
        </h2>
        <p className="mt-0.5 text-xs text-[#737373]">
          Manage Indian GST tax classification, HSN codes, and regulatory origin declarations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-[#171717]">
            GST Tax SlaB (%)
          </label>
          <select
            value={gstRate}
            onChange={(e) => onChangeGstRate(e.target.value)}
            className={`mt-1.5 h-9 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-xs text-[#171717] ${FOCUS_RING}`}
          >
            <option value="18">18% Standard GST</option>
            <option value="12">12% Reduced GST</option>
            <option value="5">5% Apparel & Essentials</option>
            <option value="28">28% Luxury & Electronics</option>
            <option value="0">0% Exempted</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#171717]">
            HSN / SAC Code
          </label>
          <input
            type="text"
            value={hsnCode}
            onChange={(e) => onChangeHsnCode(e.target.value)}
            placeholder="e.g. 61091000"
            className={`mt-1.5 h-9 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 font-mono text-xs text-[#171717] placeholder-[#A3A3A3] ${FOCUS_RING}`}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#171717]">
            Country of Origin
          </label>
          <input
            type="text"
            value={countryOfOrigin}
            onChange={(e) => onChangeCountryOfOrigin(e.target.value)}
            placeholder="India"
            className={`mt-1.5 h-9 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-xs text-[#171717] placeholder-[#A3A3A3] ${FOCUS_RING}`}
          />
        </div>
      </div>

      {/* Compliance Verification Note */}
      <div className="flex items-center justify-between rounded-lg border border-[#E5E5E5] bg-[#FAFAF9] p-3 text-xs">
        <div className="flex items-center gap-2 text-[#737373]">
          <FileCheck className="h-4 w-4 text-[#047857]" />
          <span>GSTIN & BIS Safety Compliance Status</span>
        </div>
        <span className="rounded bg-[#ECFDF5] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#047857]">
          VERIFIED COMPLIANT
        </span>
      </div>
    </div>
  );
}
