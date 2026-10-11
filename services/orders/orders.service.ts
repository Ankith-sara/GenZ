import type { OrderRecord, OrderStatus } from "@genz/types";
import { OrdersRepository } from "./orders.repository";
import { CustomerNotificationsService } from "../notifications/notifications.service";
import { RefundsService } from "../refunds/refunds.service";
import type {
  CreateOrderDomainInput,
  TransitionOrderStatusInput,
  TransitionOrderStatusResult,
} from "./orders.types";

export const ALLOWED_ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export class OrdersService {
  /**
   * Checks if an order status transition is valid according to business rules
   */
  static isAllowedTransition(from: OrderStatus, to: OrderStatus): boolean {
    const allowed = ALLOWED_ORDER_STATUS_TRANSITIONS[from];
    return Boolean(allowed && allowed.includes(to));
  }

  /**
   * Creates a new order record
   */
  static async createOrder(input: CreateOrderDomainInput): Promise<OrderRecord> {
    if (!input.items || input.items.length === 0) {
      throw new Error("Cannot create an order with zero items");
    }
    if (input.totalAmount < 0) {
      throw new Error("Order total amount cannot be negative");
    }

    return OrdersRepository.createOrder(input);
  }

  /**
   * Retrieves an order by ID
   */
  static async getOrder(orderId: string): Promise<OrderRecord | null> {
    return OrdersRepository.getById(orderId);
  }

  /**
   * Retrieves all orders
   */
  static async getAllOrders(): Promise<OrderRecord[]> {
    return OrdersRepository.getAll();
  }

  /**
   * Retrieves orders for a specific seller
   */
  static async getSellerOrders(sellerId: string): Promise<OrderRecord[]> {
    return OrdersRepository.getBySellerId(sellerId);
  }

  /**
   * Transitions an order status with complete role verification and state machine checks.
   */
  static async transitionStatus(
    input: TransitionOrderStatusInput
  ): Promise<TransitionOrderStatusResult> {
    const { orderId, newStatus, actorUserId, actorRole, carrier, trackingNumber, note } =
      input;

    const order = await OrdersRepository.getById(orderId);
    if (!order) {
      return { success: false, error: "Order not found." };
    }

    // Role-based authorization
    if (actorRole === "seller") {
      const hasSellerItem =
        (order.sellerIds && order.sellerIds.includes(actorUserId)) ||
        (order.items || []).some(
          (item) => (item.sellerId || item.seller_id) === actorUserId
        );

      if (!hasSellerItem) {
        return {
          success: false,
          error: "Unauthorized: You do not have permission to modify this order.",
        };
      }
    } else if (actorRole !== "admin") {
      return {
        success: false,
        error: "Unauthorized: Only sellers or administrators can change order status.",
      };
    }

    // State machine check
    if (!this.isAllowedTransition(order.status, newStatus)) {
      return {
        success: false,
        error: `Invalid transition: Cannot change order status from "${order.status}" to "${newStatus}".`,
      };
    }

    // Fulfillment prerequisite: tracking details required when moving to shipped
    if (newStatus === "shipped") {
      if (!carrier?.trim() || !trackingNumber?.trim()) {
        return {
          success: false,
          error:
            "Carrier partner and tracking number are required when marking an order as shipped.",
        };
      }
    }

    const updated = await OrdersRepository.updateStatus(orderId, {
      status: newStatus,
      carrier: carrier?.trim(),
      trackingNumber: trackingNumber?.trim(),
      note: note?.trim(),
    });

    if (updated) {
      await this.afterStatusChange(updated, newStatus, actorUserId, actorRole, note);
    }

    return {
      success: true,
      order: updated,
    };
  }

  /**
   * Side effects of a seller/admin status change. Never throws: the status
   * change has already been saved and must be reported as successful.
   * - Cancelling a paid order opens a refund request for the customer.
   * - The customer is emailed for shipped / delivered / cancelled.
   */
  private static async afterStatusChange(
    order: OrderRecord,
    newStatus: OrderStatus,
    actorUserId: string,
    actorRole: "buyer" | "seller" | "admin",
    note?: string
  ): Promise<void> {
    try {
      if (newStatus === "cancelled" && actorRole !== "buyer") {
        await RefundsService.ensureCancellationRefund(order, actorUserId, actorRole);
      }
      if (newStatus === "shipped" || newStatus === "delivered" || newStatus === "cancelled") {
        await CustomerNotificationsService.sendOrderStatusUpdate(
          order,
          newStatus,
          newStatus === "cancelled" ? note?.trim() || null : null
        );
      }
    } catch (err) {
      console.error(`[OrdersService] Post-status hooks failed for ${order.id}:`, err);
    }
  }
}

// Backward-compatibility alias
export { OrdersService as OrderService };
