import fs from "fs";
import path from "path";
import type { OrderRecord, OrderStatus, OrderItem, ShippingAddress, OrderTrackingEvent } from "@genz/types";
import { createAdminClient } from "./admin";

export interface CreateOrderInput {
  customerId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: ShippingAddress;
  paymentMethod: "cod" | "online" | string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  totalAmount: number;
  notes?: string;
}

// Persistent storage path shared across all apps in the monorepo
function getStoragePath(): string {
  // Use project root / packages / database / src / storage
  const storageDir = path.resolve(process.cwd(), "packages/database/src/storage");
  if (!fs.existsSync(storageDir)) {
    // Fallback: search relative to this file or current working directory
    try {
      fs.mkdirSync(storageDir, { recursive: true });
    } catch {
      // In Next.js standalone or sub-app cwd
      const altDir = path.resolve(process.cwd(), "../../packages/database/src/storage");
      if (!fs.existsSync(altDir)) {
        try {
          fs.mkdirSync(altDir, { recursive: true });
          return path.join(altDir, "orders-store.json");
        } catch {
          // fallback to tmp or current dir
          return path.resolve(process.cwd(), "orders-store.json");
        }
      }
      return path.join(altDir, "orders-store.json");
    }
  }
  return path.join(storageDir, "orders-store.json");
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
    paymentStatus: input.paymentMethod === "cod" ? "pending" : "paid",
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
    const { error } = await supabase.from("orders").insert({
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
    });

    if (error) {
      console.warn("[OrdersService] Supabase insert notice:", error.message);
    }
  } catch (err) {
    console.warn("[OrdersService] Supabase insert fallback notice:", err);
  }

  // Always write to local resilient store for real-time monorepo sync
  const currentOrders = readLocalOrders();
  const updatedOrders = [newOrder, ...currentOrders.filter((o) => o.id !== newOrder.id)];
  writeLocalOrders(updatedOrders);

  return newOrder;
}

export async function getOrders(filter?: {
  sellerId?: string;
  customerId?: string;
  status?: OrderStatus;
}): Promise<OrderRecord[]> {
  let orders: OrderRecord[] = [];

  // Try Supabase first
  try {
    const supabase = createAdminClient();
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

    if (filter?.status) {
      query = query.eq("status", filter.status);
    }
    if (filter?.customerId) {
      query = query.eq("customer_id", filter.customerId);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      orders = data.map((d: any) => ({
        id: d.id,
        orderId: d.id,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        customerId: d.customer_id,
        customerName: d.customer_name,
        customerEmail: d.customer_email,
        customerPhone: d.customer_phone,
        shippingAddress: d.shipping_address,
        paymentMethod: d.payment_method,
        paymentStatus: d.payment_status,
        status: d.status,
        subtotal: Number(d.subtotal),
        tax: Number(d.tax),
        shippingFee: Number(d.shipping_fee),
        totalAmount: Number(d.total_amount),
        items: d.items || [],
        sellerIds: d.seller_ids || [],
        carrier: d.carrier,
        trackingNumber: d.tracking_number,
        trackingEvents: d.tracking_events || [],
        notes: d.notes,
      }));
    }
  } catch (err) {
    // Supabase unavailable or table pending migration
  }

  // If Supabase returned nothing or errored, load from local resilient store
  if (orders.length === 0) {
    orders = readLocalOrders();
  } else {
    // Merge any newer local store orders
    const local = readLocalOrders();
    const map = new Map<string, OrderRecord>();
    orders.forEach((o) => map.set(o.id, o));
    local.forEach((o) => {
      if (!map.has(o.id)) map.set(o.id, o);
    });
    orders = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Apply filters
  if (filter?.sellerId) {
    orders = orders.filter((o) => o.sellerIds && o.sellerIds.includes(filter.sellerId!));
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
  const existing = allOrders.find((o) => o.id === orderId || o.orderId === orderId);

  const timestamp = new Date().toISOString();
  let eventTitle = `Order Status: ${update.status.toUpperCase()}`;
  let eventDesc = update.note || `Status updated to ${update.status}.`;

  if (update.status === "processing") {
    eventTitle = "Order in Processing";
    eventDesc = "The maker is preparing and packing the ordered items.";
  } else if (update.status === "shipped") {
    eventTitle = "Shipped / In Transit";
    eventDesc = update.carrier && update.trackingNumber
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
        trackingNumber: update.trackingNumber !== undefined ? update.trackingNumber : existing.trackingNumber,
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
    await supabase.from("orders").update({
      status: updatedOrder.status,
      carrier: updatedOrder.carrier,
      tracking_number: updatedOrder.trackingNumber,
      payment_status: updatedOrder.paymentStatus,
      tracking_events: updatedOrder.trackingEvents,
      updated_at: updatedOrder.updatedAt,
    }).eq("id", orderId);
  } catch (err) {
    console.warn("[OrdersService] Supabase update notice:", err);
  }

  // Update local resilient store
  const updatedList = allOrders.map((o) => (o.id === orderId ? updatedOrder : o));
  if (!allOrders.some((o) => o.id === orderId)) {
    updatedList.unshift(updatedOrder);
  }
  writeLocalOrders(updatedList);

  return updatedOrder;
}
