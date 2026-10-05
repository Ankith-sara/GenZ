"use server";

import { requireRole } from "@/features/auth/lib/require-role";
import { withRateLimit } from "@/lib/rate-limiter";
import {
  approveSettlementBatch,
  disburseSettlementBatch,
  generateSettlementBatch,
  runFiveWayReconciliation,
  resolveReconciliationException,
} from "@genz/database/accounting";
import { revalidatePath } from "next/cache";

export async function approveSettlementAction(batchId: string) {
  const session = await requireRole("admin");
  const adminId = session.user?.id || session.profile?.id;

  const result = await withRateLimit(
    {
      endpointType: "user",
      actionName: "approve_settlement",
      identifier: adminId,
    },
    async () => {
      try {
        const batch = await approveSettlementBatch(batchId, adminId);
        revalidatePath("/dashboard/finance");
        return { success: true as const, batch };
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to approve settlement batch";
        return { success: false as const, error: msg };
      }
    }
  );

  if ("error" in result && !("success" in result)) {
    return { success: false as const, error: result.error };
  }
  return result;
}

export async function disburseSettlementAction(batchId: string, bankUtr: string) {
  const session = await requireRole("admin");
  const adminId = session.user?.id || session.profile?.id;

  if (!bankUtr || bankUtr.trim().length < 6) {
    return {
      success: false as const,
      error: "A valid Bank UTR reference number is required for disbursement.",
    };
  }

  const result = await withRateLimit(
    {
      endpointType: "user",
      actionName: "disburse_settlement",
      identifier: adminId,
    },
    async () => {
      try {
        const batch = await disburseSettlementBatch(batchId, bankUtr.trim());
        revalidatePath("/dashboard/finance");
        return { success: true as const, batch };
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to disburse settlement batch";
        return { success: false as const, error: msg };
      }
    }
  );

  if ("error" in result && !("success" in result)) {
    return { success: false as const, error: result.error };
  }
  return result;
}

export async function runReconciliationAction() {
  const session = await requireRole("admin");
  const adminId = session.user?.id || session.profile?.id;

  const result = await withRateLimit(
    {
      endpointType: "user",
      actionName: "run_reconciliation",
      identifier: adminId,
    },
    async () => {
      try {
        const report = await runFiveWayReconciliation();
        revalidatePath("/dashboard/finance");
        return { success: true as const, report };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Reconciliation run failed";
        return { success: false as const, error: msg };
      }
    }
  );

  if ("error" in result && !("success" in result)) {
    return { success: false as const, error: result.error };
  }
  return result;
}

export async function resolveExceptionAction(exceptionId: string, notes?: string) {
  const session = await requireRole("admin");
  const adminId = session.user?.id || session.profile?.id;

  const result = await withRateLimit(
    {
      endpointType: "user",
      actionName: "resolve_exception",
      identifier: adminId,
    },
    async () => {
      try {
        await resolveReconciliationException(exceptionId, notes);
        revalidatePath("/dashboard/finance");
        return { success: true as const };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to resolve exception";
        return { success: false as const, error: msg };
      }
    }
  );

  if ("error" in result && !("success" in result)) {
    return { success: false as const, error: result.error };
  }
  return result;
}

export async function generateSettlementAction(params: {
  sellerId: string;
  sellerName: string;
  sellerBankName?: string;
  sellerAccountNumber?: string;
  sellerIfsc?: string;
  notes?: string;
  items: {
    orderId: string;
    orderItemId: string;
    productName: string;
    grossAmount: number;
    commissionRate?: number;
  }[];
}) {
  const session = await requireRole("admin");
  const adminId = session.user?.id || session.profile?.id;

  const result = await withRateLimit(
    {
      endpointType: "user",
      actionName: "generate_settlement",
      identifier: adminId,
    },
    async () => {
      try {
        const batch = await generateSettlementBatch({
          ...params,
          makerAdminId: adminId,
        });
        revalidatePath("/dashboard/finance");
        return { success: true as const, batch };
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to generate settlement batch";
        return { success: false as const, error: msg };
      }
    }
  );

  if ("error" in result && !("success" in result)) {
    return { success: false as const, error: result.error };
  }
  return result;
}
