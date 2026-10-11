import { describe, it, expect } from "vitest";
import { buildRefundJournalLines } from "./accounting";
import { paymentStatusAfterRefunds } from "./orders";

const totals = (lines: { debit: number; credit: number }[]) => ({
  debit: Math.round(lines.reduce((s, l) => s + l.debit, 0) * 100) / 100,
  credit: Math.round(lines.reduce((s, l) => s + l.credit, 0) * 100) / 100,
});

describe("buildRefundJournalLines", () => {
  it("returns customer advances to the gateway before delivery", () => {
    const lines = buildRefundJournalLines({ amount: 1050, method: "razorpay", afterDelivery: false });
    expect(lines).toEqual([
      expect.objectContaining({ accountCode: "2020", debit: 1050, credit: 0 }),
      expect.objectContaining({ accountCode: "1020", debit: 0, credit: 1050 }),
    ]);
  });

  it("pays manual refunds from the bank account", () => {
    const lines = buildRefundJournalLines({ amount: 99.99, method: "manual", afterDelivery: false });
    expect(lines[1]).toMatchObject({ accountCode: "1010", credit: 99.99 });
  });

  it("reverses the delivery split for returns and stays balanced", () => {
    for (const amount of [1, 333.33, 1015, 12345.67]) {
      const lines = buildRefundJournalLines({ amount, method: "razorpay", afterDelivery: true });
      const t = totals(lines);
      expect(t.debit).toBe(t.credit);
      expect(t.credit).toBe(amount);
      expect(lines.map((l) => l.accountCode)).toEqual(["2010", "4010", "2050", "2030", "2040", "1020"]);
    }
  });

  it("rejects non-positive amounts", () => {
    expect(() => buildRefundJournalLines({ amount: 0, method: "manual", afterDelivery: false })).toThrow();
  });
});

describe("paymentStatusAfterRefunds", () => {
  it("derives refunded / partially_refunded", () => {
    expect(paymentStatusAfterRefunds("paid", 1000, 0)).toBe("paid");
    expect(paymentStatusAfterRefunds("paid", 1000, 400)).toBe("partially_refunded");
    expect(paymentStatusAfterRefunds("partially_refunded", 1000, 1000)).toBe("refunded");
  });
});
