"use server";

import { createClient } from "@genz/database";
import { createAdminClient } from "@genz/database/admin";
import { createOrderRecord, type CreateOrderInput } from "@genz/database/orders";

import { sendSellerOrderNotificationEmail } from "@genz/utils/resend";
import type { OrderRecord } from "@genz/types";

export interface PlaceOrderResult {
  success: boolean;
  order?: OrderRecord;
  error?: string;
}

export async function placeOrderAction(
  input: CreateOrderInput
): Promise<PlaceOrderResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const order = await createOrderRecord({
      ...input,
      customerId: user?.id || null,
      paymentMethod: input.paymentMethod || "upi_qr",
      notes: input.notes,
    });

    // Group items by seller to dispatch notification emails
    const sellerGroups: Record<string, typeof input.items> = {};
    input.items.forEach((item) => {
      const sId = item.sellerId || item.seller_id;
      if (sId) {
        if (!sellerGroups[sId]) sellerGroups[sId] = [];
        sellerGroups[sId].push(item);
      }
    });

    // Dispatch seller notification emails asynchronously
    const adminClient = createAdminClient();

    for (const [sellerId, sellerItems] of Object.entries(sellerGroups)) {
      try {
        // Try getting seller email from seller_applications or profiles
        let sellerEmail = "";
        let sellerName = sellerItems[0]?.sellerBusinessName || "Maker";

        const { data: appData } = await adminClient
          .from("seller_applications")
          .select("email, full_name, business_name")
          .eq("id", sellerId)
          .maybeSingle();

        if (appData?.email) {
          sellerEmail = appData.email;
          sellerName = appData.business_name || appData.full_name || sellerName;
        } else {
          // Check auth users list
          const { data: userData } = await adminClient.auth.admin.getUserById(sellerId);
          if (userData?.user?.email) {
            sellerEmail = userData.user.email;
          }
        }

        if (sellerEmail) {
          const sellerTotal = sellerItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          await sendSellerOrderNotificationEmail({
            to: sellerEmail,
            sellerName,
            orderId: order.id,
            items: sellerItems.map((i) => ({
              name: i.name || i.product_name || "Handcrafted Product",
              quantity: i.quantity,
              price: i.price,
            })),
            totalAmount: sellerTotal,
            customerName: input.customerName,
            customerPhone: input.customerPhone,
            shippingAddress: input.shippingAddress,
            paymentMethod: input.notes
              ? `UPI QR Payment (UTR: ${input.notes})`
              : "UPI QR Code Payment",
          });
        }
      } catch (emailErr) {
        console.warn(
          `[PlaceOrder] Email dispatch notice for seller ${sellerId}:`,
          emailErr
        );
      }
    }

    return { success: true, order };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to place order";
    console.error("[PlaceOrder] Error:", err);
    return { success: false, error: errorMsg };
  }
}
