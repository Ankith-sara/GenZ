import type {
  OrderRecord,
  OrderStatus,
  OrderItem,
  PaymentStatus,
  ShippingAddress,
  OrderTrackingEvent,
  OrderDbRow,
} from "@genz/types";
import { createAdminClient } from "./admin";
import { postJournalEntry, recordOrderCommission } from "./accounting";

export interface CreateOrderInput {
  id?: string;
  customerId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: ShippingAddress;
  paymentMethod: "cod" | "online" | "razorpay" | "upi_qr" | string;
  paymentStatus?: PaymentStatus;
  /** Verified gateway payment id (Razorpay `pay_...`). Never taken from the client unverified. */
  paymentGatewayId?: string | null;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  totalAmount: number;
  notes?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mapOrderDbRowToRecord(row: Record<string, unknown> | OrderDbRow): OrderRecord {
  const d = row as Record<string, unknown>;
  const idStr = String(d.id);
  const orderNum = d.order_number ? String(d.order_number) : undefined;
  return {
    id: idStr,
    orderId: idStr,
    orderNumber: orderNum,
    createdAt: String(d.created_at),
    updatedAt: String(d.updated_at),
    customerId: d.customer_id ? String(d.customer_id) : undefined,
    customerName: String(d.customer_name || ""),
    customerEmail: String(d.customer_email || ""),
    customerPhone: d.customer_phone ? String(d.customer_phone) : undefined,
    shippingAddress: d.shipping_address as ShippingAddress,
    paymentMethod: String(d.payment_method || "cod"),
    paymentStatus: (d.payment_status as OrderRecord["paymentStatus"]) || "pending",
    paymentGatewayId: d.payment_gateway_id ? String(d.payment_gateway_id) : null,
    refundedAmount: Number(d.refunded_amount || 0),
    status: (d.status as OrderStatus) || "pending",
    subtotal: Number(d.subtotal || 0),
    tax: Number(d.tax || 0),
    shippingFee: Number(d.shipping_fee || 0),
    totalAmount: Number(d.total_amount || 0),
    items: (d.items as OrderItem[]) || [],
    sellerIds: (d.seller_ids as string[]) || [],
    carrier: d.carrier ? String(d.carrier) : undefined,
    trackingNumber: d.tracking_number ? String(d.tracking_number) : undefined,
    trackingEvents: (d.tracking_events as OrderTrackingEvent[]) || [],
    notes: d.notes ? String(d.notes) : undefined,
  };
}

export async function createOrderRecord(input: CreateOrderInput): Promise<OrderRecord> {
  const timestamp = new Date().toISOString();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const orderId = input.id || `GZ-ORD-${randomSuffix}`;

  // Collect distinct seller IDs
  const sellerIdSet = new Set<string>();
  input.items.forEach((item) => {
    const sid = item.sellerId || item.seller_id;
    if (sid) sellerIdSet.add(sid);
  });
  const sellerIds = Array.from(sellerIdSet);

  const initialEvent: OrderTrackingEvent = {
    status: "placed",
    timestamp,
    title: "Order Placed",
    description:
      input.paymentMethod === "cod"
        ? "Customer successfully placed the order via Cash on Delivery."
        : `Customer successfully placed the order via ${input.paymentMethod.toUpperCase()}.`,
  };

  const newOrder: OrderRecord = {
    id: orderId,
    orderId,
    createdAt: timestamp,
    updatedAt: timestamp,
    customerId: input.customerId || null,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    shippingAddress: input.shippingAddress,
    paymentMethod: input.paymentMethod || "cod",
    paymentStatus:
      input.paymentStatus || (input.paymentMethod === "cod" ? "pending" : "paid"),
    paymentGatewayId: input.paymentGatewayId || null,
    refundedAmount: 0,
    status: "placed",
    subtotal: input.subtotal,
    tax: input.tax,
    shippingFee: input.shippingFee,
    totalAmount: input.totalAmount,
    items: input.items,
    sellerIds,
    trackingEvents: [initialEvent],
    notes: input.notes,
  };

  const supabase = createAdminClient();
  const validCustomerId =
    newOrder.customerId && UUID_REGEX.test(newOrder.customerId)
      ? newOrder.customerId
      : null;

  const row = {
    id: newOrder.id,
    customer_id: validCustomerId,
    customer_name: newOrder.customerName,
    customer_email: newOrder.customerEmail,
    customer_phone: newOrder.customerPhone,
    shipping_address: newOrder.shippingAddress,
    payment_method: newOrder.paymentMethod,
    payment_status: newOrder.paymentStatus,
    status: newOrder.status,
    subtotal: newOrder.subtotal,
    tax: newOrder.tax,
    shipping_fee: newOrder.shippingFee,
    total_amount: newOrder.totalAmount,
    items: newOrder.items,
    seller_ids: newOrder.sellerIds,
    tracking_events: newOrder.trackingEvents,
    notes: newOrder.notes,
    created_at: newOrder.createdAt,
    updated_at: newOrder.updatedAt,
  };

  const rowWithGateway: Partial<OrderDbRow> & typeof row = newOrder.paymentGatewayId
    ? { ...row, payment_gateway_id: newOrder.paymentGatewayId }
    : row;

  let { data, error } = await supabase
    .from("orders")
    .insert(rowWithGateway)
    .select()
    .maybeSingle();

  // Handle environments where payment_gateway_id might not exist
  if (error && newOrder.paymentGatewayId && /payment_gateway_id/i.test(error.message)) {
    console.warn(
      "[OrdersService] orders.payment_gateway_id column missing; retrying without it."
    );
    ({ data, error } = await supabase
      .from("orders")
      .insert(row)
      .select()
      .maybeSingle());
  }

  if (error) {
    throw new Error(`Failed to create order record: ${error.message}`);
  }

  if (data) {
    const insertedRecord = mapOrderDbRowToRecord(data as unknown as OrderDbRow);
    newOrder.orderNumber = insertedRecord.orderNumber;
  }

  // Trigger Native ECO Accounting Integrations
  if (newOrder.paymentStatus === "paid" && newOrder.totalAmount > 0) {
    try {
      await postJournalEntry({
        referenceId: newOrder.id,
        eventType: "order_paid",
        narration: `Payment collection for Order ${newOrder.id} via ${newOrder.paymentMethod.toUpperCase()}`,
        lines: [
          {
            accountId: "1020",
            accountCode: "1020",
            accountName: "Razorpay Gateway Clearing Account",
            debit: newOrder.totalAmount,
            credit: 0,
          },
          {
            accountId: "2020",
            accountCode: "2020",
            accountName: "Customer Advances Account",
            debit: 0,
            credit: newOrder.totalAmount,
          },
        ],
      });

      for (const item of newOrder.items) {
        const itemGross = Number(item.price || 0) * Number(item.quantity || 1);
        if (itemGross > 0) {
          await recordOrderCommission({
            orderId: newOrder.id,
            orderItemId: item.id || `item-${newOrder.id}`,
            sellerId: item.sellerId || item.seller_id || "default-seller",
            sellerName: item.sellerBusinessName,
            productName: item.name || "Handcrafted Product",
            grossValue: itemGross,
            commissionRate: 10,
            gstRate: 18,
          });
        }
      }
    } catch (accErr) {
      console.warn("[OrdersService] Accounting hook notice:", accErr);
    }
  }

  return newOrder;
}

export async function getOrders(filter?: {
  sellerId?: string;
  customerId?: string;
  status?: OrderStatus;
  limit?: number;
  offset?: number;
}): Promise<OrderRecord[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (filter?.status) {
    query = query.eq("status", filter.status);
  }
  if (filter?.customerId) {
    if (!UUID_REGEX.test(filter.customerId)) {
      return [];
    }
    query = query.eq("customer_id", filter.customerId);
  }
  if (filter?.sellerId) {
    query = query.contains("seller_ids", [filter.sellerId]);
  }
  if (typeof filter?.limit === "number") {
    const offset = filter.offset || 0;
    query = query.range(offset, offset + filter.limit - 1);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to retrieve orders: ${error.message}`);
  }

  if (!data || !Array.isArray(data)) {
    return [];
  }

  return (data as unknown as Record<string, unknown>[]).map(mapOrderDbRowToRecord);
}

export async function getOrderById(orderId: string): Promise<OrderRecord | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to retrieve order ${orderId}: ${error.message}`);
  }

  if (data) {
    return mapOrderDbRowToRecord(data as unknown as OrderDbRow);
  }

  // Fallback check by order_number
  try {
    const { data: numData, error: numError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderId)
      .maybeSingle();

    if (!numError && numData) {
      return mapOrderDbRowToRecord(numData as unknown as OrderDbRow);
    }
  } catch {
    // Ignore if column is not yet present
  }

  return null;
}

export async function updateOrderStatus(
  orderId: string,
  update: {
    status: OrderStatus;
    carrier?: string;
    trackingNumber?: string;
    note?: string;
  }
): Promise<OrderRecord | null> {
  const existing = await getOrderById(orderId);
  if (!existing) {
    return null;
  }

  const timestamp = new Date().toISOString();
  let eventTitle = `Order Status: ${update.status.toUpperCase()}`;
  let eventDesc = update.note || `Status updated to ${update.status}.`;

  if (update.status === "processing") {
    eventTitle = "Order in Processing";
    eventDesc = "The maker is preparing and packing the ordered items.";
  } else if (update.status === "shipped") {
    eventTitle = "Shipped / In Transit";
    eventDesc =
      update.carrier && update.trackingNumber
        ? `Package handed over to ${update.carrier}. Tracking AWB: ${update.trackingNumber}`
        : "Package dispatched to courier service.";
  } else if (update.status === "delivered") {
    eventTitle = "Order Delivered";
    eventDesc = "Package successfully delivered to the customer address.";
  } else if (update.status === "cancelled") {
    eventTitle = "Order Cancelled";
    eventDesc = update.note || "Order was cancelled.";
  }

  const newEvent: OrderTrackingEvent = {
    status: update.status,
    timestamp,
    title: eventTitle,
    description: eventDesc,
  };

  const updatedOrder: OrderRecord = {
    ...existing,
    status: update.status,
    carrier: update.carrier !== undefined ? update.carrier : existing.carrier,
    trackingNumber:
      update.trackingNumber !== undefined
        ? update.trackingNumber
        : existing.trackingNumber,
    paymentStatus: update.status === "delivered" ? "paid" : existing.paymentStatus,
    updatedAt: timestamp,
    trackingEvents: [...(existing.trackingEvents || []), newEvent],
  };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({
      status: updatedOrder.status,
      carrier: updatedOrder.carrier,
      tracking_number: updatedOrder.trackingNumber,
      payment_status: updatedOrder.paymentStatus,
      tracking_events: updatedOrder.trackingEvents,
      updated_at: updatedOrder.updatedAt,
    })
    .eq("id", existing.id);

  if (error) {
    throw new Error(`Failed to update order ${orderId}: ${error.message}`);
  }

  // Revenue recognition journal on delivery
  if (update.status === "delivered" && updatedOrder.totalAmount > 0) {
    try {
      const gross = updatedOrder.totalAmount;
      const comm = Math.round(((gross * 10) / 100) * 100) / 100;
      const commGst = Math.round(((comm * 18) / 100) * 100) / 100;
      const tcs = Math.round(((gross * 1) / 100) * 100) / 100;
      const tds = Math.round(((gross * 0.1) / 100) * 100) / 100;
      const sellerNet = Math.round((gross - comm - commGst - tcs - tds) * 100) / 100;

      await postJournalEntry({
        referenceId: updatedOrder.id,
        eventType: "order_delivered",
        narration: `Revenue & Seller Liability Recognition on Delivery of Order ${updatedOrder.id}`,
        lines: [
          {
            accountId: "2020",
            accountCode: "2020",
            accountName: "Customer Advances Account",
            debit: gross,
            credit: 0,
          },
          {
            accountId: "2010",
            accountCode: "2010",
            accountName: "Seller Payables Clearing Account",
            debit: 0,
            credit: sellerNet,
          },
          {
            accountId: "4010",
            accountCode: "4010",
            accountName: "Marketplace Commission Income",
            debit: 0,
            credit: comm,
          },
          {
            accountId: "2050",
            accountCode: "2050",
            accountName: "Output GST on Commission Payable",
            debit: 0,
            credit: commGst,
          },
          {
            accountId: "2030",
            accountCode: "2030",
            accountName: "Statutory GST-TCS Payable",
            debit: 0,
            credit: tcs,
          },
          {
            accountId: "2040",
            accountCode: "2040",
            accountName: "Section 194-O TDS Payable",
            debit: 0,
            credit: tds,
          },
        ],
      });
    } catch (accErr) {
      console.warn("[OrdersService] Delivery accounting hook notice:", accErr);
    }
  }

  return updatedOrder;
}

export function paymentStatusAfterRefunds(
  current: PaymentStatus,
  totalAmount: number,
  refundedAmount: number
): PaymentStatus {
  if (refundedAmount <= 0) return current;
  if (refundedAmount + 0.005 >= totalAmount) return "refunded";
  return "partially_refunded";
}

export async function applyOrderRefundTotals(
  orderId: string,
  refundedAmount: number
): Promise<OrderRecord | null> {
  const order = await getOrderById(orderId);
  if (!order) return null;

  const rounded = Math.round(refundedAmount * 100) / 100;
  const paymentStatus = paymentStatusAfterRefunds(
    order.paymentStatus,
    order.totalAmount,
    rounded
  );
  const updatedAt = new Date().toISOString();

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({
      refunded_amount: rounded,
      payment_status: paymentStatus,
      updated_at: updatedAt,
    })
    .eq("id", order.id);

  if (error) {
    throw new Error(
      `Failed to apply refund totals to order ${orderId}: ${error.message}`
    );
  }

  return {
    ...order,
    refundedAmount: rounded,
    paymentStatus,
    updatedAt,
  };
}
