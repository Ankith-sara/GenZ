import type {
  Product,
  Category,
  OrderRecord,
  ShippingAddress,
  RefundRecord,
} from "@genz/types";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface CustomerProfileData {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  city: string | null;
  avatarUrl: string | null;
  role: string;
  addresses: ShippingAddress[];
  createdAt?: string;
}

export interface ValidatedCartItem {
  productId: string;
  variantId?: string;
  name: string;
  category: string;
  coverImage?: string;
  sellerId: string;
  price: number;
  quantity: number;
  lineTotal: number;
  available: boolean;
  unavailabilityReason?: string;
}

export interface CartValidationResult {
  valid: boolean;
  itemCount: number;
  items: ValidatedCartItem[];
  pricing: {
    subtotal: number;
    tax: number;
    shippingFee: number;
    total: number;
  };
}

export interface RazorpayOrderResult {
  success: boolean;
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  verifiedTotalInr: number;
}

export interface CustomerOrderView {
  order: OrderRecord;
  refunds: Array<{
    id: string;
    amount: number;
    type: string;
    status: string;
    method: string;
    adminNote?: string | null;
    createdAt?: string;
    processedAt?: string | null;
  }>;
  actions: {
    canCancel: boolean;
    cancelReason?: string;
    canReturn: boolean;
    returnReason?: string;
    hasOpenRefund: boolean;
  };
}

export interface CarrierInfo {
  id: string;
  displayName: string;
  trackingUrlTemplate?: string;
}

export interface TrackingValidationResult {
  valid: boolean;
  carrierDisplayName: string;
  trackingUrl?: string;
  error?: string;
}

// -------------------------------------------------------------
// Seller API Types
// -------------------------------------------------------------
export interface SellerOverviewData {
  storeName: string;
  isVerified: boolean;
  productCount: number;
  totalOrdersCount: number;
  pendingOrdersCount: number;
  deliveredOrdersCount: number;
  documentCount: number;
  totalRevenue: number;
  sellerProfile: Record<string, unknown> | null;
  recentProducts: Product[];
  recentOrders: OrderRecord[];
}

export interface SellerProfileResponse {
  profile: Record<string, unknown> | null;
  user: {
    avatar_url?: string | null;
    full_name?: string | null;
  } | null;
}

export interface UpdateSellerProfilePayload {
  business_name: string;
  gst_number?: string;
  factory_address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  description?: string | null;
  established_year?: number | null;
}

export interface UpdateStudioPayload {
  maker_name?: string;
  craft_title?: string;
  bio?: string;
  how_it_started?: string;
  materials_and_technique?: string;
  vision?: string;
  milestones?: Array<{
    year: string;
    title: string;
    desc: string;
  }>;
}

export interface UploadDocumentPayload {
  document_type: string;
  file_url: string;
  document_number?: string | null;
  file_name?: string | null;
  file_size?: number | null;
}

export interface CreateProductPayload {
  name: string;
  category?: string;
  description?: string;
  price_inr: number;
  materials?: string[];
  sku?: string | null;
  inventory_count?: number;
  low_stock_threshold?: number;
  track_inventory?: boolean;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  is_best_seller?: boolean;
  primary_image_url?: string | null;
  image_urls?: string[];
  variants?: Array<{
    title: string;
    sku?: string | null;
    price_inr?: number | null;
    inventory_count?: number;
    attributes?: Record<string, unknown>;
  }>;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}

export interface QuickUpdateProductPayload {
  price_inr?: number;
  inventory_count?: number;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  is_best_seller?: boolean;
}

export interface AddVariantPayload {
  title: string;
  sku?: string | null;
  price_inr?: number | null;
  inventory_count?: number;
  attributes?: Record<string, unknown>;
}

export interface UpdateOrderStatusPayload {
  status: "placed" | "processing" | "shipped" | "delivered" | "cancelled";
  carrier?: string;
  trackingNumber?: string;
  note?: string;
}

export interface CreateReelPayload {
  product_id?: string | null;
  video_url: string;
  thumbnail_url?: string | null;
  title?: string | null;
  caption?: string | null;
}

export interface SellerProductsResponse {
  products: Product[];
  totalCount: number;
  limit: number;
  offset: number;
}

export interface SellerOrdersResponse {
  orders: OrderRecord[];
  totalCount: number;
  limit: number;
  offset: number;
}


