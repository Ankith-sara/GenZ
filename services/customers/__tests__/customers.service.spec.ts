import { describe, it, expect, vi } from "vitest";
import { CustomersService } from "../customers.service";
import { OrdersRepository } from "../../orders/orders.repository";

describe("CustomersService", () => {
  it("retrieves customer orders through the order repository", async () => {
    vi.spyOn(OrdersRepository, "getByCustomerId").mockResolvedValue([]);
    const orders = await CustomersService.getCustomerOrders("cust-123");
    expect(orders).toEqual([]);
    vi.restoreAllMocks();
  });
});
