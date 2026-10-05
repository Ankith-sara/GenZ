import { requireRole } from "@/features/auth/lib/require-role";
import {
  getAccountsList,
  getJournalsList,
  getTrialBalance,
  getSellerCommissions,
  getSettlementBatches,
  getFinancialOverview,
  getReconciliationExceptions,
} from "@genz/database/accounting";
import { getPlatformSellersFromDatabase } from "@genz/database/crm";
import { FinanceClient } from "@/features/finance";

export const metadata = {
  title: "Finance & ECO Accounting Core | GenZ Admin",
  description:
    "Native ECO revenue recognition, settlement engine, and 5-way reconciliation hub.",
};

export default async function FinancePage() {
  await requireRole("admin");

  const [
    accounts,
    journals,
    trialBalance,
    commissions,
    settlements,
    overview,
    exceptions,
    sellers,
  ] = await Promise.all([
    getAccountsList(),
    getJournalsList(),
    getTrialBalance(),
    getSellerCommissions(),
    getSettlementBatches(),
    getFinancialOverview(),
    getReconciliationExceptions(),
    getPlatformSellersFromDatabase(),
  ]);

  return (
    <FinanceClient
      overview={overview}
      accounts={accounts}
      journals={journals}
      commissions={commissions}
      settlements={settlements}
      exceptions={exceptions}
      trialBalance={trialBalance}
      sellers={sellers}
    />
  );
}
