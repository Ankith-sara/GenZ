import { describe, it, expect } from "vitest";
import {
  postJournalEntry,
  recordOrderCommission,
  generateSettlementBatch,
  approveSettlementBatch,
  disburseSettlementBatch,
  runFiveWayReconciliation,
} from "./accounting";

describe("Native ECO Accounting Engine", () => {
  describe("Double-Entry General Ledger (postJournalEntry)", () => {
    it("successfully posts a balanced journal entry", async () => {
      const journal = await postJournalEntry({
        referenceId: "ORD-999001",
        eventType: "order_delivered",
        narration: "Revenue recognition for test order ORD-999001",
        lines: [
          {
            accountId: "2020",
            accountCode: "2020",
            accountName: "Customer Advances",
            debit: 1180,
            credit: 0,
          },
          {
            accountId: "2010",
            accountCode: "2010",
            accountName: "Seller Payables",
            debit: 0,
            credit: 1051,
          },
          {
            accountId: "4010",
            accountCode: "4010",
            accountName: "Marketplace Commission Income",
            debit: 0,
            credit: 100,
          },
          {
            accountId: "2050",
            accountCode: "2050",
            accountName: "Output GST on Commission",
            debit: 0,
            credit: 18,
          },
          {
            accountId: "2030",
            accountCode: "2030",
            accountName: "Statutory GST-TCS",
            debit: 0,
            credit: 10,
          },
          {
            accountId: "2040",
            accountCode: "2040",
            accountName: "Section 194-O TDS",
            debit: 0,
            credit: 1,
          },
        ],
      });

      expect(journal.id).toMatch(/^JRN-\d{6}$/);
      expect(journal.status).toBe("posted");
      expect(journal.totalAmount).toBe(1180);
    });

    it("rejects an unbalanced journal entry", async () => {
      await expect(
        postJournalEntry({
          eventType: "manual_adjustment",
          narration: "Illegal one-sided entry",
          lines: [
            {
              accountId: "1010",
              accountCode: "1010",
              debit: 500,
              credit: 0,
            },
            {
              accountId: "4010",
              accountCode: "4010",
              debit: 0,
              credit: 400,
            },
          ],
        })
      ).rejects.toThrow("Double-entry imbalance");
    });
  });

  describe("Commission Engine Math", () => {
    it("accurately computes 10% commission and 18% GST (Page 48 specification)", async () => {
      const comm = await recordOrderCommission({
        orderId: "ORD-100001",
        orderItemId: "ITEM-100001",
        sellerId: "SELL-TEST-1",
        productName: "Etikoppaka Handcrafted Toy",
        grossValue: 10000,
        commissionRate: 10,
        gstRate: 18,
      });

      expect(comm.id).toMatch(/^COM-\d{6}$/);
      expect(comm.grossValue).toBe(10000);
      expect(comm.commissionAmount).toBe(1000);
      expect(comm.gstAmount).toBe(180);
      expect(comm.totalCommission).toBe(1180);
    });
  });

  describe("Seller Settlement Engine Lifecycle (Page 48 specification)", () => {
    it("generates, approves, and disburses a settlement batch with UTR", async () => {
      const batch = await generateSettlementBatch({
        sellerId: "SELL-TEST-1",
        sellerName: "Etikoppaka Artisans Co-op",
        items: [
          {
            orderId: "ORD-100001",
            orderItemId: "ITEM-100001",
            productName: "Kondapalli Dancing Doll",
            grossAmount: 10000,
            commissionRate: 10,
          },
        ],
      });

      expect(batch.id).toMatch(/^SET-\d{6}$/);
      expect(batch.grossAmount).toBe(10000);
      expect(batch.totalCommission).toBe(1000);
      expect(batch.totalCommissionGst).toBe(180);
      expect(batch.totalTcs).toBe(100); // 1% TCS
      expect(batch.totalTds).toBe(10); // 0.1% TDS
      // 10000 - 1000 - 180 - 100 - 10 = 8710
      expect(batch.netPayable).toBe(8710);
      expect(batch.status).toBe("pending_approval");

      // Checker Admin approves
      const approved = await approveSettlementBatch(batch.id, "admin-user-id");
      expect(approved.status).toBe("approved");

      // Bank UTR disbursement
      const disbursed = await disburseSettlementBatch(batch.id, "UTR20261004123456");
      expect(disbursed.status).toBe("disbursed");
      expect(disbursed.bankUtr).toBe("UTR20261004123456");
    });
  });

  describe("5-Way Reconciliation Engine", () => {
    it("runs reconciliation successfully and audits trial balance equilibrium", async () => {
      const report = await runFiveWayReconciliation();
      expect(report).toBeDefined();
      expect(typeof report.generalLedgerBalanced).toBe("boolean");
      expect(Array.isArray(report.exceptionsGenerated)).toBe(true);
    });
  });
});
