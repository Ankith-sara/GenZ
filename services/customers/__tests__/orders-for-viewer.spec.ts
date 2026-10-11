import { describe, it, expect, vi } from "vitest";
import type { OrderRecord } from "@genz/types";
import { selectOrdersForViewer } from "../customers.service";

const make = (id: string, customerId: string | null): OrderRecord => ({
  id,
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
  customerId,
  customerName: `Customer ${id}`,
  customerEmail: `${id}@example.com`,
  customerPhone: "9999999999",
  shippingAddress: {
    recipientName: "X",
    phone: "9999999999",
    addressLine: "Somewhere",
    city: "City",
    state: "State",
    pincode: "500001",
  },
  paymentMethod: "cod",
  paymentStatus: "pending",
  status: "placed",
  subtotal: 100,
  tax: 0,
  shippingFee: 0,
  totalAmount: 100,
  items: [],
  sellerIds: [],
  trackingEvents: [],
});

describe("selectOrdersForViewer (buyer orders page data selection)", () => {
  it("returns nothing for guests and never queries orders", async () => {
    const fetch = vi.fn(async () => [make("a", "user-1")]);
    expect(await selectOrdersForViewer(null, fetch)).toEqual([]);
    expect(await selectOrdersForViewer(undefined, fetch)).toEqual([]);
    expect(await selectOrdersForViewer("", fetch)).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("queries only by the viewer's own customer id", async () => {
    const fetch = vi.fn(async () => [make("a", "user-1")]);
    const result = await selectOrdersForViewer("user-1", fetch);
    expect(fetch).toHaveBeenCalledWith("user-1");
    expect(result.map((o) => o.id)).toEqual(["a"]);
  });

  it("drops other customers' and guest orders even if the upstream query returns them", async () => {
    const fetch = vi.fn(async () => [
      make("mine", "user-1"),
      make("theirs", "user-2"),
      make("guest", null),
    ]);
    const result = await selectOrdersForViewer("user-1", fetch);
    expect(result.map((o) => o.id)).toEqual(["mine"]);
  });

  it("shows an empty list (no recent-orders fallback) when the user has no orders", async () => {
    const fetch = vi.fn(async () => [] as OrderRecord[]);
    expect(await selectOrdersForViewer("user-3", fetch)).toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
