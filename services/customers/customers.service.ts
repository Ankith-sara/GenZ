import { createAdminClient } from "@genz/database/admin";
import { OrdersRepository } from "../orders/orders.repository";
import type { OrderRecord, ShippingAddress } from "@genz/types";
import type {
  CustomerProfile,
  UpdateCustomerProfileInput,
} from "./customers.types";

export class CustomersService {
  /**
   * Retrieves a customer profile including stored shipping addresses from user metadata
   */
  static async getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
    const admin = createAdminClient();
    const { data: authUser, error: authError } =
      await admin.auth.admin.getUserById(customerId);

    if (authError || !authUser?.user) return null;

    const { data: profileData } = await admin
      .from("profiles")
      .select("full_name, phone, created_at")
      .eq("id", customerId)
      .maybeSingle();

    const addresses =
      (authUser.user.user_metadata?.addresses as ShippingAddress[]) || [];

    return {
      id: customerId,
      email: authUser.user.email || "",
      fullName: profileData?.full_name || (authUser.user.user_metadata?.full_name as string),
      phone: profileData?.phone || (authUser.user.user_metadata?.phone as string),
      addresses,
      createdAt: profileData?.created_at,
    };
  }

  /**
   * Adds or updates saved addresses in customer metadata
   */
  static async saveCustomerAddress(
    customerId: string,
    newAddress: ShippingAddress
  ): Promise<ShippingAddress[]> {
    const admin = createAdminClient();
    const { data: authUser } = await admin.auth.admin.getUserById(customerId);
    if (!authUser?.user) {
      throw new Error("Customer not found");
    }

    const currentAddresses =
      (authUser.user.user_metadata?.addresses as ShippingAddress[]) || [];

    // Append new address
    const updatedAddresses = [...currentAddresses, newAddress];

    await admin.auth.admin.updateUserById(customerId, {
      user_metadata: {
        ...authUser.user.user_metadata,
        addresses: updatedAddresses,
      },
    });

    return updatedAddresses;
  }

  /**
   * Retrieves all orders placed by this customer
   */
  static async getCustomerOrders(customerId: string): Promise<OrderRecord[]> {
    return OrdersRepository.getByCustomerId(customerId);
  }

  /** Orders the current viewer may see on the buyer orders page. */
  static async getOrdersForViewer(viewerUserId: string | null | undefined): Promise<OrderRecord[]> {
    return selectOrdersForViewer(viewerUserId, (id) => OrdersRepository.getByCustomerId(id));
  }
}

/**
 * Data selection for the buyer orders page. Guests get nothing, and a
 * signed-in user only ever gets orders whose customerId is their own id —
 * re-checked here so a broad or failing upstream query can never leak other
 * customers' orders. There is deliberately no "recent orders" fallback.
 */
export async function selectOrdersForViewer(
  viewerUserId: string | null | undefined,
  fetchByCustomerId: (customerId: string) => Promise<OrderRecord[]>
): Promise<OrderRecord[]> {
  if (!viewerUserId) return [];
  const orders = await fetchByCustomerId(viewerUserId);
  return (orders || []).filter((o) => Boolean(o.customerId) && o.customerId === viewerUserId);
}

// Backward-compatibility alias
export { CustomersService as CustomerService };
