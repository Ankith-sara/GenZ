import type {
  ApiResponse,
  CustomerProfileData,
  CartValidationResult,
  RazorpayOrderResult,
  CustomerOrderView,
  CarrierInfo,
  TrackingValidationResult,
  SellerOverviewData,
  SellerProfileResponse,
  UpdateSellerProfilePayload,
  UpdateStudioPayload,
  UploadDocumentPayload,
  CreateProductPayload,
  UpdateProductPayload,
  QuickUpdateProductPayload,
  AddVariantPayload,
  UpdateOrderStatusPayload,
  CreateReelPayload,
  SellerProductsResponse,
  SellerOrdersResponse,
} from "./types";
import type { Product, Category, OrderRecord, ShippingAddress } from "@genz/types";

export interface ApiClientConfig {
  baseUrl?: string;
  token?: string | null;
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class GenZApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private extraHeaders: Record<string, string> = {};

  constructor(config: ApiClientConfig = {}) {
    const envUrl =
      typeof process !== "undefined"
        ? process.env.NEXT_PUBLIC_API_URL ||
          process.env.API_URL ||
          process.env.API_INTERNAL_URL
        : undefined;

    let resolved = config.baseUrl || envUrl;
    if (!resolved) {
      if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
        throw new Error(
          "[GenZApiClient] NEXT_PUBLIC_API_URL or API_URL must be configured in production."
        );
      }
      resolved = "http://localhost:4000";
    }
    this.baseUrl = resolved.replace(/\/+$/, "");

    this.token = config.token || null;
    this.extraHeaders = config.headers || {};
  }

  /** Returns a cloned client scoped with a specific Bearer token */
  withToken(token: string | null): GenZApiClient {
    return new GenZApiClient({
      baseUrl: this.baseUrl,
      token,
      headers: { ...this.extraHeaders },
    });
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const headers = new Headers(options.headers || {});

    // Set JSON content type by default unless body is FormData
    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }

    // Attach Bearer token if present
    if (this.token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }

    // Attach extra headers
    for (const [key, val] of Object.entries(this.extraHeaders)) {
      if (!headers.has(key)) headers.set(key, val);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    let json: ApiResponse<T>;
    try {
      json = await response.json();
    } catch {
      if (!response.ok) {
        throw new ApiError(
          response.status,
          "NETWORK_ERROR",
          `API request failed with HTTP ${response.status}`
        );
      }
      return null as unknown as T;
    }

    if (!json.success || !response.ok) {
      const err = json.error || {
        code: "API_ERROR",
        message: json.message || "An error occurred with the API request",
      };
      throw new ApiError(response.status, err.code, err.message, err.details);
    }

    return json.data;
  }

  // -------------------------------------------------------------
  // 1. Health & Status
  // -------------------------------------------------------------
  async health(): Promise<{ status: string; uptime: number; service: string }> {
    return this.request("/health");
  }

  async ready(): Promise<{ status: string; database: string }> {
    return this.request("/ready");
  }

  // -------------------------------------------------------------
  // 2. Authentication
  // -------------------------------------------------------------
  auth = {
    me: async () => {
      return this.request<{ user: any; profile: any }>("/v1/auth/me");
    },
    login: async (email: string, pass: string) => {
      return this.request<{ session: any; user: any }>("/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password: pass }),
      });
    },
    sendOtp: async (email: string, password?: string) => {
      return this.request<{ message: string }>("/v1/auth/otp/send", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    },
    verifyLoginOtp: async (email: string, token: string) => {
      return this.request<{ session: any; user: any }>("/v1/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify({ email, token }),
      });
    },
    signup: async (email: string, fullName: string, password?: string) => {
      return this.request<{ message: string; user: any }>("/v1/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, fullName, password }),
      });
    },
    verifySignupOtp: async (email: string, token: string) => {
      return this.request<{ session: any; user: any }>("/v1/auth/signup/verify", {
        method: "POST",
        body: JSON.stringify({ email, token }),
      });
    },
    sendPasswordReset: async (email: string) => {
      return this.request<{ message: string }>("/v1/auth/password/reset-request", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    },
    resetPasswordWithOtp: async (email: string, token: string, newPass: string) => {
      return this.request<{ message: string }>("/v1/auth/password/reset", {
        method: "POST",
        body: JSON.stringify({ email, token, password: newPass }),
      });
    },
    updatePassword: async (newPass: string) => {
      return this.request<{ message: string }>("/v1/auth/password/update", {
        method: "POST",
        body: JSON.stringify({ password: newPass }),
      });
    },
    logout: async () => {
      return this.request<{ message: string }>("/v1/auth/logout", {
        method: "POST",
      });
    },
  };

  // -------------------------------------------------------------
  // 3. Customer Profile & Addresses
  // -------------------------------------------------------------
  customers = {
    getProfile: async () => {
      const res = await this.request<{ profile: CustomerProfileData }>(
        "/v1/customers/profile"
      );
      return res.profile;
    },
    updateProfile: async (updates: {
      fullName?: string;
      phone?: string;
      city?: string;
    }) => {
      const res = await this.request<{ profile: CustomerProfileData }>(
        "/v1/customers/profile",
        {
          method: "PATCH",
          body: JSON.stringify(updates),
        }
      );
      return res.profile;
    },
    uploadAvatar: async (formData: FormData) => {
      return this.request<{ avatarUrl: string }>("/v1/customers/profile/avatar", {
        method: "POST",
        body: formData,
      });
    },
    listAddresses: async () => {
      const res = await this.request<{ addresses: ShippingAddress[] }>(
        "/v1/customers/addresses"
      );
      return res.addresses;
    },
    addAddress: async (address: Omit<ShippingAddress, "id"> & { id?: string }) => {
      const res = await this.request<{ addresses: ShippingAddress[] }>(
        "/v1/customers/addresses",
        {
          method: "POST",
          body: JSON.stringify(address),
        }
      );
      return res.addresses;
    },
    updateAddress: async (addressId: string, updates: Partial<ShippingAddress>) => {
      const res = await this.request<{ addresses: ShippingAddress[] }>(
        `/v1/customers/addresses/${encodeURIComponent(addressId)}`,
        {
          method: "PUT",
          body: JSON.stringify(updates),
        }
      );
      return res.addresses;
    },
    deleteAddress: async (addressId: string) => {
      const res = await this.request<{ addresses: ShippingAddress[] }>(
        `/v1/customers/addresses/${encodeURIComponent(addressId)}`,
        {
          method: "DELETE",
        }
      );
      return res.addresses;
    },
    setDefaultAddress: async (addressId: string) => {
      const res = await this.request<{ addresses: ShippingAddress[] }>(
        `/v1/customers/addresses/${encodeURIComponent(addressId)}/default`,
        {
          method: "POST",
        }
      );
      return res.addresses;
    },
  };

  // -------------------------------------------------------------
  // 4. Catalog, Categories & Search
  // -------------------------------------------------------------
  catalog = {
    listProducts: async (
      params: {
        q?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        page?: number;
        limit?: number;
      } = {}
    ) => {
      const searchParams = new URLSearchParams();
      if (params.q) searchParams.set("q", params.q);
      if (params.category) searchParams.set("category", params.category);
      if (params.minPrice !== undefined)
        searchParams.set("minPrice", String(params.minPrice));
      if (params.maxPrice !== undefined)
        searchParams.set("maxPrice", String(params.maxPrice));
      if (params.page !== undefined) searchParams.set("page", String(params.page));
      if (params.limit !== undefined) searchParams.set("limit", String(params.limit));

      const query = searchParams.toString();
      return this.request<{
        products: Product[];
        totalCount: number;
        page: number;
        limit: number;
        hasMore: boolean;
      }>(`/v1/catalog/products${query ? `?${query}` : ""}`);
    },
    getProductDetails: async (productId: string) => {
      return this.request<{
        product: Product;
        seller: any;
        variants: any[];
        images: any[];
        reels: any[];
      }>(`/v1/catalog/products/${encodeURIComponent(productId)}`);
    },
    getFeatured: async () => {
      return this.request<{
        products: Product[];
        sellers: any[];
      }>("/v1/catalog/featured");
    },
  };

  categories = {
    list: async () => {
      const res = await this.request<{ categories: Category[] }>("/v1/categories");
      return res.categories;
    },
  };

  search = {
    searchProducts: async (params: { q?: string; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params.q) searchParams.set("q", params.q);
      if (params.limit) searchParams.set("limit", String(params.limit));
      const query = searchParams.toString();
      return this.request<{
        products: Product[];
        categories: string[];
        totalMatches: number;
      }>(`/v1/search${query ? `?${query}` : ""}`);
    },
  };

  // -------------------------------------------------------------
  // 5. Cart & Validation
  // -------------------------------------------------------------
  cart = {
    validate: async (
      items: Array<{ productId: string; variantId?: string; quantity: number }>
    ) => {
      return this.request<CartValidationResult>("/v1/cart/validate", {
        method: "POST",
        body: JSON.stringify({ items }),
      });
    },
  };

  // -------------------------------------------------------------
  // 6. Payments
  // -------------------------------------------------------------
  payments = {
    createRazorpayOrder: async (params: {
      items: Array<{ productId: string; variantId?: string; quantity: number }>;
      receipt?: string;
      notes?: Record<string, string>;
    }) => {
      return this.request<RazorpayOrderResult>("/v1/payments/razorpay/order", {
        method: "POST",
        body: JSON.stringify(params),
      });
    },
    verifyRazorpayPayment: async (params: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }) => {
      return this.request<{ verified: boolean; reason?: string }>(
        "/v1/payments/razorpay/verify",
        {
          method: "POST",
          body: JSON.stringify(params),
        }
      );
    },
  };

  // -------------------------------------------------------------
  // 7. Checkout
  // -------------------------------------------------------------
  checkout = {
    createOrder: async (input: {
      items: Array<{ productId: string; variantId?: string; quantity: number }>;
      shippingAddress: ShippingAddress;
      guestEmail?: string;
      payment:
        | {
            method: "razorpay";
            razorpayOrderId: string;
            razorpayPaymentId: string;
            razorpaySignature: string;
          }
        | { method: "upi_qr"; utr: string; payerAccount?: string }
        | { method: "cod" };
      notes?: string;
    }) => {
      const res = await this.request<{ order: OrderRecord }>("/v1/checkout/orders", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return res.order;
    },
  };

  // -------------------------------------------------------------
  // 8. Orders & Shipping
  // -------------------------------------------------------------
  orders = {
    list: async () => {
      const res = await this.request<{ orders: CustomerOrderView[] }>("/v1/orders");
      return res.orders;
    },
    getDetails: async (orderId: string) => {
      return this.request<CustomerOrderView>(
        `/v1/orders/${encodeURIComponent(orderId)}`
      );
    },
    cancel: async (orderId: string, reason?: string) => {
      return this.request<{ message: string; order: OrderRecord; refund?: any }>(
        `/v1/orders/${encodeURIComponent(orderId)}/cancel`,
        {
          method: "POST",
          body: JSON.stringify({ reason }),
        }
      );
    },
    requestReturn: async (orderId: string, reason: string) => {
      return this.request<{ message: string; order: OrderRecord; refund?: any }>(
        `/v1/orders/${encodeURIComponent(orderId)}/return`,
        {
          method: "POST",
          body: JSON.stringify({ reason }),
        }
      );
    },
  };

  shipping = {
    getCarriers: async () => {
      const res = await this.request<{ carriers: CarrierInfo[] }>(
        "/v1/shipping/carriers"
      );
      return res.carriers;
    },
    track: async (carrier: string, trackingNumber: string) => {
      const query = new URLSearchParams({ carrier, trackingNumber }).toString();
      return this.request<TrackingValidationResult>(`/v1/shipping/track?${query}`);
    },
  };

  // -------------------------------------------------------------
  // 9. Support & Engagement
  // -------------------------------------------------------------
  support = {
    contact: async (input: {
      name: string;
      email: string;
      reason: string;
      message: string;
    }) => {
      return this.request<{ message: string }>("/v1/support/contact", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    newsletter: async (email: string) => {
      return this.request<{ message: string }>("/v1/support/newsletter", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    },
    waitlist: async (input: {
      name: string;
      email: string;
      role: string;
      city?: string;
      phone?: string;
    }) => {
      return this.request<{ message: string }>("/v1/support/waitlist", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    trackPageView: async (input: {
      path: string;
      referrer?: string;
      user_agent?: string;
    }) => {
      return this.request<{ ok: boolean }>("/v1/support/analytics/track", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
  };

  // -------------------------------------------------------------
  // 10. Sellers (Dashboard, Profile, Catalog, Orders, Documents)
  // -------------------------------------------------------------
  sellers = {
    getPublicProfile: async (sellerId: string) => {
      return this.request<{
        profile: any;
        products: Product[];
        reels: any[];
      }>(`/v1/sellers/${encodeURIComponent(sellerId)}/public-profile`);
    },
    getOverview: async () => {
      return this.request<SellerOverviewData>("/v1/sellers/me/overview");
    },
    getProfile: async () => {
      return this.request<SellerProfileResponse>("/v1/sellers/me/profile");
    },
    updateProfile: async (payload: UpdateSellerProfilePayload) => {
      return this.request<{ success: boolean; message: string }>(
        "/v1/sellers/me/profile",
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
    },
    submitForVerification: async () => {
      return this.request<{ success: boolean; status: string }>(
        "/v1/sellers/me/verify",
        {
          method: "POST",
        }
      );
    },
    updateStudio: async (payload: UpdateStudioPayload) => {
      return this.request<{ success: boolean; studio: Record<string, unknown> }>(
        "/v1/sellers/me/profile/studio",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
    },
    updateAvatar: async (avatarUrl: string) => {
      return this.request<{ avatarUrl: string }>("/v1/sellers/me/avatar", {
        method: "POST",
        body: JSON.stringify({ avatarUrl }),
      });
    },
    removeAvatar: async () => {
      return this.request<{ success: boolean }>("/v1/sellers/me/avatar", {
        method: "DELETE",
      });
    },
    updateCover: async (coverUrl: string) => {
      return this.request<{ coverUrl: string }>("/v1/sellers/me/cover", {
        method: "POST",
        body: JSON.stringify({ coverUrl }),
      });
    },
    listDocuments: async () => {
      const res = await this.request<{ documents: any[] }>("/v1/sellers/me/documents");
      return res.documents;
    },
    uploadDocument: async (payload: UploadDocumentPayload) => {
      const res = await this.request<{ document: any }>("/v1/sellers/me/documents", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.document;
    },
    deleteDocument: async (documentId: string) => {
      return this.request<{ success: boolean }>(
        `/v1/sellers/me/documents/${encodeURIComponent(documentId)}`,
        { method: "DELETE" }
      );
    },
    listProducts: async (
      params: {
        status?: "draft" | "published" | "archived" | "all";
        search?: string;
        category?: string;
        limit?: number;
        offset?: number;
      } = {}
    ) => {
      const query = new URLSearchParams();
      if (params.status) query.set("status", params.status);
      if (params.search) query.set("search", params.search);
      if (params.category) query.set("category", params.category);
      if (params.limit !== undefined) query.set("limit", String(params.limit));
      if (params.offset !== undefined) query.set("offset", String(params.offset));
      const qs = query.toString();
      return this.request<SellerProductsResponse>(
        `/v1/sellers/me/products${qs ? `?${qs}` : ""}`
      );
    },
    getProduct: async (productId: string) => {
      const res = await this.request<{ product: Product }>(
        `/v1/sellers/me/products/${encodeURIComponent(productId)}`
      );
      return res.product;
    },
    createProduct: async (payload: CreateProductPayload) => {
      const res = await this.request<{ product: Product }>("/v1/sellers/me/products", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.product;
    },
    updateProduct: async (productId: string, payload: UpdateProductPayload) => {
      const res = await this.request<{ product: Product }>(
        `/v1/sellers/me/products/${encodeURIComponent(productId)}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
      return res.product;
    },
    setProductStatus: async (
      productId: string,
      status: "draft" | "published" | "archived"
    ) => {
      return this.request<{ success: boolean; productId: string; status: string }>(
        `/v1/sellers/me/products/${encodeURIComponent(productId)}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }
      );
    },
    quickUpdateProduct: async (
      productId: string,
      payload: QuickUpdateProductPayload
    ) => {
      const res = await this.request<{ product: Product }>(
        `/v1/sellers/me/products/${encodeURIComponent(productId)}/quick-update`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        }
      );
      return res.product;
    },
    deleteProduct: async (productId: string) => {
      return this.request<{ success: boolean; message: string }>(
        `/v1/sellers/me/products/${encodeURIComponent(productId)}`,
        { method: "DELETE" }
      );
    },
    addVariant: async (productId: string, payload: AddVariantPayload) => {
      const res = await this.request<{ variant: any }>(
        `/v1/sellers/me/products/${encodeURIComponent(productId)}/variants`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      return res.variant;
    },
    deleteVariant: async (productId: string, variantId: string) => {
      return this.request<{ success: boolean }>(
        `/v1/sellers/me/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}`,
        { method: "DELETE" }
      );
    },
    listOrders: async (
      params: {
        status?:
          "placed" | "processing" | "shipped" | "delivered" | "cancelled" | "all";
        search?: string;
        limit?: number;
        offset?: number;
      } = {}
    ) => {
      const query = new URLSearchParams();
      if (params.status) query.set("status", params.status);
      if (params.search) query.set("search", params.search);
      if (params.limit !== undefined) query.set("limit", String(params.limit));
      if (params.offset !== undefined) query.set("offset", String(params.offset));
      const qs = query.toString();
      return this.request<SellerOrdersResponse>(
        `/v1/sellers/me/orders${qs ? `?${qs}` : ""}`
      );
    },
    getOrder: async (orderId: string) => {
      const res = await this.request<{ order: OrderRecord }>(
        `/v1/sellers/me/orders/${encodeURIComponent(orderId)}`
      );
      return res.order;
    },
    updateOrderStatus: async (orderId: string, payload: UpdateOrderStatusPayload) => {
      return this.request<{
        success: boolean;
        error?: string;
        order?: OrderRecord | null;
      }>(`/v1/sellers/me/orders/${encodeURIComponent(orderId)}/status`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    listReels: async (productId?: string) => {
      const qs = productId ? `?product_id=${encodeURIComponent(productId)}` : "";
      const res = await this.request<{ reels: any[] }>(`/v1/sellers/me/reels${qs}`);
      return res.reels;
    },
    createReel: async (payload: CreateReelPayload) => {
      const res = await this.request<{ reel: any }>("/v1/sellers/me/reels", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.reel;
    },
  };
}

export const apiClient = new GenZApiClient();
