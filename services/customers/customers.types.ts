import type { ShippingAddress, OrderRecord } from "@genz/types";

export interface CustomerProfile {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  addresses: ShippingAddress[];
  createdAt?: string;
}

export interface UpdateCustomerProfileInput {
  fullName?: string;
  phone?: string;
  addresses?: ShippingAddress[];
}
