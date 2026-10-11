"use client";

import React, { useState, useTransition } from "react";
import { PageHeader } from "@genz/ui";
import { Button } from "@genz/ui";
import { Bell, Info, Lock, KeyRound, ShieldCheck, AlertCircle } from "lucide-react";
import { requestSellerPasswordReset } from "./actions";

interface SellerSettingsClientProps {
  userId: string;
  userEmail: string;
  fullName: string;
  avatarUrl: string | null;
  businessProfile?: Record<string, unknown> | null;
}

export function SellerSettingsClient({ userEmail }: SellerSettingsClientProps) {
  const [passwordMsg, setPasswordMsg] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [isSending, startSending] = useTransition();

  const handlePasswordResetRequest = () => {
    setPasswordMsg(null);
    startSending(async () => {
      try {
        const result = await requestSellerPasswordReset();
        if ("error" in result) {
          setPasswordMsg({ kind: "error", text: result.error });
        } else {
          setPasswordMsg({
            kind: "success",
            text: `A password reset link has been sent to ${result.email}. Check your inbox and spam folder.`,
          });
        }
      } catch {
        setPasswordMsg({
          kind: "error",
          text: "We couldn't send the reset link. Please try again.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account security and notification preferences."
        breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Settings" }]}
      />

      {passwordMsg && (
        <div
          role="status"
          className={
            passwordMsg.kind === "success"
              ? "border-primary/20 bg-primary-container/60 text-on-primary-container flex items-center gap-3 rounded-2xl border p-4 text-xs shadow-2xs"
              : "border-error/20 bg-error-container/60 text-on-error-container flex items-center gap-3 rounded-2xl border p-4 text-xs shadow-2xs"
          }
        >
          {passwordMsg.kind === "success" ? (
            <KeyRound className="text-primary h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="text-error h-4 w-4 shrink-0" />
          )}
          <span className="font-semibold">{passwordMsg.text}</span>
        </div>
      )}

      {/* 1. SECURITY & PASSWORD RESET CARD */}
      <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 space-y-4 rounded-2xl border p-5 sm:p-6">
        <div className="border-outline-variant/40 flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-on-surface h-5 w-5" />
            <h3 className="text-on-surface text-sm font-bold">
              Security &amp; Authentication
            </h3>
          </div>
        </div>

        <div className="border-outline-variant/50 bg-surface-container-low flex items-center justify-between rounded-xl border p-4 text-xs">
          <div className="space-y-0.5">
            <span className="text-on-surface block font-bold">Password Reset</span>
            <span className="text-on-surface-variant block text-[11px]">
              Send a password reset link to your login email address ({userEmail})
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handlePasswordResetRequest}
            disabled={isSending}
            className="border-outline-variant hover:bg-surface-container text-on-surface h-8 rounded-full text-xs font-semibold"
          >
            <Lock className="mr-1.5 h-3.5 w-3.5" />
            <span>{isSending ? "Sending…" : "Reset Password"}</span>
          </Button>
        </div>
      </div>

      {/* 2. NOTIFICATION PREFERENCES CARD (not yet configurable) */}
      <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 space-y-4 rounded-2xl border p-5 sm:p-6">
        <div className="border-outline-variant/40 flex items-center gap-2 border-b pb-3">
          <Bell className="text-on-surface h-5 w-5" />
          <h3 className="text-on-surface text-sm font-bold">
            Email &amp; Order Notification Preferences
          </h3>
        </div>

        <div className="border-outline-variant/50 bg-surface-container-low flex items-start gap-3 rounded-xl border p-4 text-xs">
          <Info className="text-on-surface-variant mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-on-surface-variant leading-relaxed">
            Notification preferences can&apos;t be changed from the dashboard yet. Order
            and account emails are currently sent to {userEmail || "your login email"}.
            To change what you receive, please contact GenZ seller support.
          </p>
        </div>
      </div>
    </div>
  );
}
