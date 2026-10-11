import fs from "fs";
import path from "path";
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

// Persistent storage path shared across all apps in the monorepo
function getStoragePath(): string {
  // Isolate tests so vitest runs never pollute production/real orders-store.json
  const filename =
    process.env.NODE_ENV === "test" || process.env.VITEST
      ? "test-orders-store.json"
      : "orders-store.json";

  const primaryDir = path.resolve(process.cwd(), "packages/database/src/storage");
  if (fs.existsSync(primaryDir)) {
    return path.join(primaryDir, filename);
  }

  // When running inside an app directory like apps/web, apps/seller, apps/admin
  const altDir = path.resolve(process.cwd(), "../../packages/database/src/storage");
  if (fs.existsSync(altDir)) {
    return path.join(altDir, filename);
  }

  const __dirnameDir = path.resolve(__dirname, "storage");
  if (fs.existsSync(__dirnameDir)) {
    return path.join(__dirnameDir, filename);
  }

  try {
    fs.mkdirSync(primaryDir, { recursive: true });
    return path.join(primaryDir, filename);
  } catch {
    return path.resolve(process.cwd(), filename);
  }
}

function readLocalOrders(): OrderRecord[] {
  try {
    const filePath = getStoragePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data) as OrderRecord[];
    }
  } catch (err) {
    console.warn("[OrdersService] Local store read error:", err);
  }
  return [];
}

function writeLocalOrders(orders: OrderRecord[]): void {
  try {
    const filePath = getStoragePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(orders, null, 2), "utf8");
  } catch (err) {
    console.error("[OrdersService] Local store write error:", err);
  }
}

export async function createOrderRecord(input: CreateOrderInput): Promise<OrderRecord> {
  const timestamp = new Date().toISOString();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const orderId = `GZ-ORD-${randomSuffix}`;

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
    description: "Customer successfully placed the order via Cash on Delivery.",
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

  // Try saving to Supabase
  try {
    const supabase = createAdminClient();
    const row = {
      id: newOrder.id,
      customer_id: newOrder.customerId,
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
    let { error } = await supabase.from("orders").insert(rowWithGateway);

    // Databases without migration 0026 have no payment_gateway_id column yet.
    // Keep the order (the payment id is still recorded in notes) instead of losing it.
    if (error && newOrder.paymentGatewayId && /payment_gateway_id/i.test(error.message)) {
      console.warn(
        "[OrdersService] orders.payment_gateway_id missing; apply migration 0026. Retrying without it."
      );
      ({ error } = await supabase.from("orders").insert(row));
    }

    if (error) {
      console.warn("[OrdersService] Supabase insert notice:", error.message);
    }
  } catch (err) {
    console.warn("[OrdersService] Supabase insert fallback notice:", err);
  }

  // Always write to local resilient store for real-time monorepo sync
  const currentOrders = readLocalOrders();
  const updatedOrders = [
    newOrder,
    ...currentOrders.filter((o) => o.id !== newOrder.id),
  ];
  writeLocalOrders(updatedOrders);

  // Trigger Native ECO Accounting Integrations
  if (newOrder.paymentStatus === "paid" && newOrder.totalAmount > 0) {
    try {
      // 1. Post double-entry journal for gateway collection:
      // Debit:  1020 Razorpay Gateway Clearing Account
      // Credit: 2020 Customer Advances Account
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

      // 2. Record commission accrual for each order item
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
}): Promise<OrderRecord[]> {
  let orders: OrderRecord[] = [];

  let querySucceeded = false;

  // Try Supabase first (primary source of truth)
  try {
    const supabase = createAdminClient();
    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter?.status) {
      query = query.eq("status", filter.status);
    }
    if (filter?.customerId) {
      query = query.eq("customer_id", filter.customerId);
    }

    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      querySucceeded = true;
      orders = (data as unknown as Record<string, unknown>[]).map((d) => ({
        id: String(d.id),
        orderId: String(d.id),
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
        subtotal: Number(d.subtotal),
        tax: Number(d.tax),
        shippingFee: Number(d.shipping_fee),
        totalAmount: Number(d.total_amount),
        items: (d.items as OrderItem[]) || [],
        sellerIds: (d.seller_ids as string[]) || [],
        carrier: d.carrier ? String(d.carrier) : undefined,
        trackingNumber: d.tracking_number ? String(d.tracking_number) : undefined,
        trackingEvents: (d.tracking_events as OrderTrackingEvent[]) || [],
        notes: d.notes ? String(d.notes) : undefined,
      }));
    }
  } catch {
    // Supabase unavailable or network error
  }

  // Only fall back to local store if Supabase query failed (e.g. offline, mock test runner)
  if (!querySucceeded || (process.env.VITEST && orders.length === 0)) {
    orders = readLocalOrders();
  }

  // Apply filters
  if (filter?.sellerId) {
    orders = orders.filter(
      (o) => o.sellerIds && o.sellerIds.includes(filter.sellerId!)
    );
  }
  if (filter?.customerId) {
    orders = orders.filter((o) => o.customerId === filter.customerId);
  }
  if (filter?.status) {
    orders = orders.filter((o) => o.status === filter.status);
  }

  return orders;
}

export async function getOrderById(orderId: string): Promise<OrderRecord | null> {
  const all = await getOrders();
  const match = all.find((o) => o.id === orderId || o.orderId === orderId);
  return match || null;
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
  const allOrders = readLocalOrders();
  // The local store only holds orders created on this machine; fall back to the
  // primary store so production updates keep the real customer, items and history.
  const existing =
    allOrders.find((o) => o.id === orderId || o.orderId === orderId) ||
    (await getOrderById(orderId));

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

  const updatedOrder: OrderRecord = existing
    ? {
        ...existing,
        status: update.status,
        carrier: update.carrier !== undefined ? update.carrier : existing.carrier,
        trackingNumber:
          update.trackingNumber !== undefined
            ? update.trackingNumber
            : existing.trackingNumber,
        updatedAt: timestamp,
        trackingEvents: [...(existing.trackingEvents || []), newEvent],
      }
    : {
        id: orderId,
        orderId,
        createdAt: timestamp,
        updatedAt: timestamp,
        customerName: "Customer",
        customerEmail: "",
        shippingAddress: {
          recipientName: "Customer",
          phone: "",
          addressLine: "",
          city: "",
          state: "",
          pincode: "",
        },
        paymentMethod: "cod",
        paymentStatus: update.status === "delivered" ? "paid" : "pending",
        status: update.status,
        subtotal: 0,
        tax: 0,
        shippingFee: 0,
        totalAmount: 0,
        items: [],
        sellerIds: [],
        carrier: update.carrier,
        trackingNumber: update.trackingNumber,
        trackingEvents: [newEvent],
      };

  if (update.status === "delivered") {
    updatedOrder.paymentStatus = "paid";
  }

  // Update Supabase
  try {
    const supabase = createAdminClient();
    await supabase
      .from("orders")
      .update({
        status: updatedOrder.status,
        carrier: updatedOrder.carrier,
        tracking_number: updatedOrder.trackingNumber,
        payment_status: updatedOrder.paymentStatus,
        tracking_events: updatedOrder.trackingEvents,
        updated_at: updatedOrder.updatedAt,
      })
      .eq("id", orderId);
  } catch (err) {
    console.warn("[OrdersService] Supabase update notice:", err);
  }

  // Update local resilient store
  const updatedList = allOrders.map((o) => (o.id === orderId ? updatedOrder : o));
  if (!allOrders.some((o) => o.id === orderId)) {
    updatedList.unshift(updatedOrder);
  }
  writeLocalOrders(updatedList);

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

/**
 * Derives the order payment status from the processed refund total.
 * Mirrors the `sync_order_refund_totals` trigger in migration 0026.
 */
export function paymentStatusAfterRefunds(
  current: PaymentStatus,
  totalAmount: number,
  refundedAmount: number
): PaymentStatus {
  if (refundedAmount <= 0) return current;
  if (refundedAmount + 0.005 >= totalAmount) return "refunded";
  return "partially_refunded";
}

/**
 * Records the processed refund total on an order (Supabase + local store).
 * The database trigger performs the same roll-up; writing it here as well keeps
 * the local fallback store consistent.
 */
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

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("orders")
      .update({
        refunded_amount: rounded,
        payment_status: paymentStatus,
        updated_at: updatedAt,
      })
      .eq("id", orderId);
    if (error) {
      console.warn("[OrdersService] Refund totals update notice:", error.message);
    }
  } catch (err) {
    console.warn("[OrdersService] Refund totals update fallback notice:", err);
  }

  const updated: OrderRecord = {
    ...order,
    refundedAmount: rounded,
    paymentStatus,
    updatedAt,
  };
  const local = readLocalOrders();
  if (local.some((o) => o.id === orderId)) {
    writeLocalOrders(local.map((o) => (o.id === orderId ? updated : o)));
  }
  return updated;
}
