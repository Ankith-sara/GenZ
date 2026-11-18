import { CustomersService } from "@genz/services/customers";
import { RefundsService, getCustomerOrderActions } from "@genz/services/refunds";
import { OrdersRepository } from "@genz/services/orders";
import { NotFoundError, ValidationError } from "../../common/errors";

export class OrdersModuleService {
  static async listCustomerOrders(customerId: string) {
    const orders = await CustomersService.getOrdersForViewer(customerId);
    const refunds = await RefundsService.getRefundsForOrders(orders.map((o) => o.id));
    const now = new Date();

    const views = orders.map((order) => {
      const orderRefunds = refunds.filter((r) => r.orderId === order.id);
      return {
        order,
        refunds: orderRefunds.map((r) => ({
          id: r.id,
          amount: r.amount,
          type: r.type,
          status: r.status,
          method: r.method,
          adminNote: r.adminNote,
          createdAt: r.createdAt,
          processedAt: r.processedAt,
        })),
        actions: getCustomerOrderActions(order, orderRefunds, now),
      };
    });

    return { orders: views };
  }

  static async getOrderDetails(customerId: string, orderId: string) {
    const order = await OrdersRepository.getById(orderId);

    // Strict IDOR protection: return 404 for non-existent or other customer's order
    if (!order || !order.customerId || order.customerId !== customerId) {
      throw new NotFoundError(`Order "${orderId}" was not found.`);
    }

    const refunds = await RefundsService.getRefundsForOrders([order.id]);
    const actions = getCustomerOrderActions(order, refunds, new Date());

    return {
      order,
      refunds,
      actions,
    };
  }

  static async cancelOrder(customerId: string, orderId: string, reason?: string) {
    const result = await RefundsService.cancelOrderByCustomer({
      orderId,
      userId: customerId,
      reason: reason || null,
    });

    if (!result.success) {
      throw new ValidationError(result.error || "Could not cancel the order.");
    }

    return {
      message: result.refund
        ? "Order cancelled. Your refund request has been initiated."
        : "Order cancelled successfully.",
      order: result.order,
      refund: result.refund,
    };
  }

  static async requestReturn(customerId: string, orderId: string, reason: string) {
    const result = await RefundsService.requestReturn({
      orderId,
      userId: customerId,
      reason,
    });

    if (!result.success) {
      throw new ValidationError(result.error || "Could not request return for this order.");
    }

    return {
      message: "Return requested successfully. Pickup will be arranged.",
      order: result.order,
      refund: result.refund,
    };
  }
}

