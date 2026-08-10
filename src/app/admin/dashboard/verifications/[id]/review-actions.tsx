"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Key,
  RefreshCw,
  Copy,
  Check,
  Send,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { Textarea } from "@/components/ui/atoms/textarea";
import { Input } from "@/components/ui/atoms/input";
import {
  approveSeller,
  rejectSeller,
  generatePasswordAction,
  type ReviewState,
} from "../actions";
import type { VerificationStatus, ApplicationStatus } from "@/types/database";

export function ReviewActions({
  sellerId,
  status,
  defaultEmail,
  businessName,
}: {
  sellerId: string;
  status: VerificationStatus | ApplicationStatus | string;
  defaultEmail?: string;
  businessName?: string;
}) {
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Credentials form state
  const [email, setEmail] = useState(defaultEmail || "");
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const [rejectState, rejectAction, isRejectPending] = useActionState<
    ReviewState,
    FormData
  >(rejectSeller, {});

  const [approveState, approveAction, isApprovePending] = useActionState<
    ReviewState,
    FormData
  >(approveSeller, {});

  useEffect(() => {
    if (approveState?.error) {
      toast.error(approveState.error);
    }
  }, [approveState?.error]);

  useEffect(() => {
    if (approveState?.success) {
      toast.success("Seller application approved successfully!");
    }
  }, [approveState?.success]);

  useEffect(() => {
    if (rejectState?.error) {
      toast.error(rejectState.error);
    }
  }, [rejectState?.error]);

  // Initialize random password
  const generateNewPassword = async () => {
    const newPass = await generatePasswordAction();
    setPassword(newPass);
  };

  const handleOpenApproveForm = async () => {
    if (!password) {
      await generateNewPassword();
    }
    setShowApproveForm(true);
    setShowRejectForm(false);
  };

  const handleCopyCredentials = () => {
    if (!approveState?.credentials) return;
    const text = `GenZ Seller Account Approved\nEmail: ${approveState.credentials.email}\nPassword: ${approveState.credentials.password}\nLogin URL: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Credentials copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  if (approveState?.success && approveState.credentials) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6">
        <div className="flex items-center gap-3 text-emerald-800">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
          <div>
            <h3 className="font-nantes text-lg font-bold">
              Seller Application Approved!
            </h3>
            <p className="font-graphik text-xs text-emerald-700">
              Account created & profile verified for{" "}
              <strong className="font-semibold">{businessName}</strong>.
            </p>
          </div>
        </div>

        {/* Credentials Card */}
        <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
            <span className="font-graphik flex items-center gap-1.5 text-xs font-bold tracking-wider text-black uppercase">
              <Key className="h-3.5 w-3.5 text-[#C8A951]" /> Generated Credentials
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyCredentials}
              className="h-8 gap-1.5 text-xs font-semibold"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Credentials
                </>
              )}
            </Button>
          </div>

          <div className="mt-3 space-y-2 font-mono text-xs">
            <div className="flex flex-col justify-between gap-1 rounded-lg bg-[#FAF7F0] p-3 sm:flex-row sm:items-center">
              <span className="text-[#73736E]">Email Address:</span>
              <span className="font-bold text-black">
                {approveState.credentials.email}
              </span>
            </div>
            <div className="flex flex-col justify-between gap-1 rounded-lg bg-[#FAF7F0] p-3 sm:flex-row sm:items-center">
              <span className="text-[#73736E]">Password:</span>
              <span className="font-bold tracking-wide text-black">
                {approveState.credentials.password}
              </span>
            </div>
          </div>

          {approveState.credentials.emailSent ? (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Email notification with login credentials sent to seller.</span>
            </div>
          ) : (
            <div className="mt-3 space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>Warning: Email Dispatch Failed</span>
              </div>
              <p className="text-[11px] text-amber-800">
                {approveState.credentials.emailError
                  ? `Reason: ${approveState.credentials.emailError}.`
                  : "Credentials generated."}{" "}
                Please copy the credentials above and manually share them with the
                seller.
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <Link
            href="/admin/dashboard/verifications"
            className="font-graphik inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            Back to Applications Queue <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  if (status === "verified" || status === "approved") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="font-graphik flex items-center gap-2 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          This application has been approved and verified.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={handleOpenApproveForm}
          className="gap-2 bg-black text-white hover:bg-neutral-800"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          Approve &amp; Provision Credentials
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setShowRejectForm((s) => !s);
            setShowApproveForm(false);
          }}
          className="gap-2"
        >
          <XCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
          Request Changes / Reject
        </Button>
      </div>

      {/* Approval Credentials Modal Form */}
      {showApproveForm && (
        <form
          action={approveAction}
          className="rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-sm"
        >
          <input type="hidden" name="applicationId" value={sellerId} />

          <div className="mb-4 flex items-center gap-2 border-b border-[#E5E5E0] pb-3">
            <Key className="h-4 w-4 text-[#C8A951]" />
            <h3 className="font-nantes text-base font-bold text-black">
              Provision Seller Credentials
            </h3>
          </div>

          <p className="font-graphik text-smoke mb-4 text-xs">
            Create or confirm login credentials for{" "}
            <strong className="text-black">{businessName}</strong>.
          </p>

          <div className="max-w-md space-y-4">
            <div>
              <label className="font-graphik mb-1 block text-xs font-semibold tracking-wider text-black uppercase">
                Seller Login Email
              </label>
              <Input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="font-mono text-xs"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="font-graphik text-xs font-semibold tracking-wider text-black uppercase">
                  Login Password
                </label>
                <button
                  type="button"
                  onClick={generateNewPassword}
                  className="font-graphik flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:underline"
                >
                  <RefreshCw className="h-3 w-3" /> Auto-Generate New
                </button>
              </div>
              <Input
                type="text"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter custom password or use auto-generated"
                required
                className="font-mono text-xs tracking-wide"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="sendEmail"
                name="sendEmail"
                defaultChecked
                className="h-4 w-4 rounded border-[#E5E5E0] text-black focus:ring-black"
              />
              <label
                htmlFor="sendEmail"
                className="font-graphik flex cursor-pointer items-center gap-1.5 text-xs text-black"
              >
                <Send className="text-smoke h-3.5 w-3.5" /> Send welcome email with
                login credentials
              </label>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 border-t border-[#E5E5E0] pt-4">
            <Button
              type="submit"
              disabled={isApprovePending}
              className="bg-black text-white hover:bg-neutral-800"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isApprovePending
                ? "Creating Account…"
                : "Approve Application & Provision Account"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowApproveForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Rejection Form */}
      {showRejectForm && (
        <form
          action={rejectAction}
          className="max-w-md rounded-2xl border border-red-200 bg-red-50/50 p-6"
        >
          <input type="hidden" name="sellerId" value={sellerId} />
          <h4 className="font-graphik mb-2 text-xs font-bold tracking-wider text-red-800 uppercase">
            Rejection Reason
          </h4>
          <Textarea
            name="reason"
            rows={3}
            placeholder="Explain what details or documents need to change before approval..."
            required
            className="bg-white text-xs"
          />
          <div className="mt-4 flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={isRejectPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isRejectPending ? "Sending…" : "Confirm Rejection"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowRejectForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
