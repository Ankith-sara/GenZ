import {
  createOrderRecord,
  getOrderById,
  getOrders,
  updateOrderStatus,
  type CreateOrderInput,
} from "@genz/database/orders";
import type { OrderRecord, OrderStatus } from "@genz/types";

export class OrdersRepository {
  /**
   * Persists a new order record
   */
  static async createOrder(input: CreateOrderInput): Promise<OrderRecord> {
    return createOrderRecord(input);
  }

  /**
   * Retrieves an order by its unique ID
   */
  static async getById(orderId: string): Promise<OrderRecord | null> {
    return getOrderById(orderId);
  }

  /**
   * Retrieves all orders (admin view)
   */
  static async getAll(): Promise<OrderRecord[]> {
    return getOrders();
  }

  /**
   * Retrieves orders for a specific seller
   */
  static async getBySellerId(sellerId: string): Promise<OrderRecord[]> {
    return getOrders({ sellerId });
  }

  /**
   * Retrieves orders for a specific customer
   */
  static async getByCustomerId(customerId: string): Promise<OrderRecord[]> {
    return getOrders({ customerId });
  }

  /**
   * Updates an order's status and tracking metadata
   */
  static async updateStatus(
    orderId: string,
    params: {
      status: OrderStatus;
      carrier?: string;
      trackingNumber?: string;
      note?: string;
    }
  ): Promise<OrderRecord | null> {
    return updateOrderStatus(orderId, params);
  }
}

// Backward-compatibility alias
export { OrdersRepository as OrderRepository };
