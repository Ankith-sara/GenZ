"use server";

import { revalidatePath } from "next/cache";
import {
  getEmployeeForSession,
  hasPermission,
  requireRole,
} from "@genz/database/authorization";
import { withRateLimit } from "@genz/utils/rate-limiter";
import { RefundsService } from "@genz/services/refunds";
import {
  adminInitiateRefundSchema,
  approveRefundSchema,
  rejectRefundSchema,
} from "@genz/validation";

export interface RefundAdminActionState {
  success?: boolean;
  error?: string;
  message?: string;
}

const FORBIDDEN = "You do not have permission to manage refunds.";

/**
 * Admins, or staff whose employee record grants orders:write. requireRole("admin")
 * also admits internal employees, so the module permission is checked as well.
 */
async function requireRefundManager() {
  const session = await requireRole("admin");
  if (session.profile?.role === "admin") return session;
  const { employee } = await getEmployeeForSession();
  return hasPermission(employee, "orders:write") ? session : null;
}

function str(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t === "" ? undefined : t;
}

function num(formData: FormData, key: string): number | undefined {
  const v = str(formData, key);
  return v === undefined ? undefined : Number(v);
}

function revalidate() {
  revalidatePath("/dashboard/refunds");
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/finance");
}

export async function approveRefundAction(
  _prev: RefundAdminActionState,
  formData: FormData
): Promise<RefundAdminActionState> {
  const session = await requireRefundManager();
  if (!session) return { error: FORBIDDEN };

  return withRateLimit(
    { endpointType: "user", actionName: "admin_approve_refund", identifier: session.userId },
    async (): Promise<RefundAdminActionState> => {
      const parsed = approveRefundSchema.safeParse({
        refundId: str(formData, "refundId"),
        amount: num(formData, "amount"),
        manualReference: str(formData, "manualReference"),
        adminNote: str(formData, "adminNote"),
      });
      if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message || "Invalid request." };
      }

      const res = await RefundsService.approveRefund({
        refundId: parsed.data.refundId,
        adminId: session.userId,
        amount: parsed.data.amount,
        manualReference: parsed.data.manualReference,
        adminNote: parsed.data.adminNote,
      });
      revalidate();
      if (!res.success) return { error: res.error || "Refund failed." };
      return {
        success: true,
        message:
          res.refund?.status === "processed"
            ? "Refund processed."
            : "Refund sent to Razorpay. It will be marked processed when Razorpay confirms.",
      };
    }
  );
}

export async function rejectRefundAction(
  _prev: RefundAdminActionState,
  formData: FormData
): Promise<RefundAdminActionState> {
  const session = await requireRefundManager();
  if (!session) return { error: FORBIDDEN };

  return withRateLimit(
    { endpointType: "user", actionName: "admin_reject_refund", identifier: session.userId },
    async (): Promise<RefundAdminActionState> => {
      const parsed = rejectRefundSchema.safeParse({
        refundId: str(formData, "refundId"),
        adminNote: str(formData, "adminNote") ?? "",
      });
      if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message || "Invalid request." };
      }

      const res = await RefundsService.rejectRefund({
        refundId: parsed.data.refundId,
        adminId: session.userId,
        adminNote: parsed.data.adminNote,
      });
      revalidate();
      if (!res.success) return { error: res.error || "Could not reject the refund." };
      return { success: true, message: "Refund request rejected." };
    }
  );
}

export async function initiateRefundAction(
  _prev: RefundAdminActionState,
  formData: FormData
): Promise<RefundAdminActionState> {
  const session = await requireRefundManager();
  if (!session) return { error: FORBIDDEN };

  return withRateLimit(
    { endpointType: "user", actionName: "admin_initiate_refund", identifier: session.userId },
    async (): Promise<RefundAdminActionState> => {
      const parsed = adminInitiateRefundSchema.safeParse({
        orderId: str(formData, "orderId"),
        amount: num(formData, "amount"),
        reason: str(formData, "reason") ?? "",
        manualReference: str(formData, "manualReference"),
        adminNote: str(formData, "adminNote"),
      });
      if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message || "Invalid request." };
      }

      const res = await RefundsService.initiateAdminRefund({
        orderId: parsed.data.orderId,
        amount: parsed.data.amount,
        reason: parsed.data.reason,
        adminId: session.userId,
        manualReference: parsed.data.manualReference,
        adminNote: parsed.data.adminNote,
      });
      revalidate();
      if (!res.success) return { error: res.error || "Refund failed." };
      return {
        success: true,
        message:
          res.refund?.status === "processed"
            ? `Refund processed for ${parsed.data.orderId}.`
            : `Refund sent to Razorpay for ${parsed.data.orderId}.`,
      };
    }
  );
}
