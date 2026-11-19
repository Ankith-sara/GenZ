import { vi } from "vitest";

const mockProducts = [
  {
    id: "prod-1",
    name: "Handcrafted Etikoppaka Wooden Toy Train",
    category: "Toys",
    price_inr: 499,
    status: "published",
    seller_id: "fab03143-9d65-47cf-bdc0-53db548b1005",
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-2",
    name: "Kondapalli Traditional Dancing Doll",
    category: "Crafts",
    price_inr: 799,
    status: "published",
    seller_id: "seller-kondapalli",
    created_at: new Date().toISOString(),
  },
];

export function createMockSupabaseClient() {
  const createChainable = (initialData: any = null) => {
    const chain: any = {
      select: vi.fn().mockImplementation(() => chain),
      eq: vi.fn().mockImplementation(() => chain),
      ilike: vi.fn().mockImplementation(() => chain),
      or: vi.fn().mockImplementation(() => chain),
      gte: vi.fn().mockImplementation(() => chain),
      lte: vi.fn().mockImplementation(() => chain),
      contains: vi.fn().mockImplementation(() => chain),
      order: vi.fn().mockImplementation(() => chain),
      limit: vi.fn().mockImplementation(() => chain),
      range: vi.fn().mockImplementation((from: number, to: number) => {
        const dataArr = Array.isArray(initialData) ? initialData : mockProducts;
        const slice = dataArr.slice(from, to + 1);
        return Promise.resolve({
          data: slice,
          count: dataArr.length,
          error: null,
        });
      }),
      maybeSingle: vi.fn().mockImplementation(() => {
        const item = Array.isArray(initialData)
          ? initialData[0] || null
          : (initialData ?? mockProducts[0]);
        return Promise.resolve({
          data: item,
          error: null,
        });
      }),
      single: vi.fn().mockImplementation(() => {
        const item = Array.isArray(initialData)
          ? initialData[0] || null
          : (initialData ?? mockProducts[0]);
        return Promise.resolve({
          data: item,
          error: item ? null : { message: "Row not found" },
        });
      }),
      insert: vi.fn().mockImplementation((payload: any) => {
        const inserted = Array.isArray(payload)
          ? payload.map((p, i) => ({ id: `new-${i}`, ...p }))
          : { id: "new-prod-1", ...payload };
        return {
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: inserted, error: null }),
            maybeSingle: vi.fn().mockResolvedValue({ data: inserted, error: null }),
            then: vi
              .fn()
              .mockImplementation((resolve) =>
                resolve({ data: inserted, error: null })
              ),
          }),
          then: vi
            .fn()
            .mockImplementation((resolve) => resolve({ data: inserted, error: null })),
        };
      }),
      update: vi.fn().mockImplementation((payload: any) => {
        return {
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi
                .fn()
                .mockResolvedValue({
                  data: { id: "updated-1", ...payload },
                  error: null,
                }),
              maybeSingle: vi
                .fn()
                .mockResolvedValue({
                  data: { id: "updated-1", ...payload },
                  error: null,
                }),
              then: vi
                .fn()
                .mockImplementation((resolve) =>
                  resolve({ data: { id: "updated-1", ...payload }, error: null })
                ),
            }),
            then: vi
              .fn()
              .mockImplementation((resolve) =>
                resolve({ data: { id: "updated-1", ...payload }, error: null })
              ),
          }),
          then: vi
            .fn()
            .mockImplementation((resolve) =>
              resolve({ data: { id: "updated-1", ...payload }, error: null })
            ),
        };
      }),
      upsert: vi.fn().mockImplementation((payload: any) => {
        return {
          select: vi.fn().mockReturnValue({
            single: vi
              .fn()
              .mockResolvedValue({
                data: { id: "upserted-1", ...payload },
                error: null,
              }),
            maybeSingle: vi
              .fn()
              .mockResolvedValue({
                data: { id: "upserted-1", ...payload },
                error: null,
              }),
            then: vi
              .fn()
              .mockImplementation((resolve) =>
                resolve({ data: { id: "upserted-1", ...payload }, error: null })
              ),
          }),
          then: vi
            .fn()
            .mockImplementation((resolve) =>
              resolve({ data: { id: "upserted-1", ...payload }, error: null })
            ),
        };
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
          then: vi.fn().mockImplementation((resolve) => resolve({ error: null })),
        }),
        then: vi.fn().mockImplementation((resolve) => resolve({ error: null })),
      }),
      then: vi.fn().mockImplementation((resolve) => {
        const dataArr = initialData !== null ? initialData : mockProducts;
        resolve({
          data: dataArr,
          count: Array.isArray(dataArr) ? dataArr.length : 1,
          error: null,
        });
      }),
    };
    return chain;
  };

  const defaultChain = createChainable();

  return {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === "products") return defaultChain;
      if (table === "product_categories") {
        return createChainable([
          {
            id: "cat-1",
            name: "Toys",
            slug: "toys",
            description: "Traditional handmade toys",
            is_active: true,
            created_at: new Date().toISOString(),
          },
          {
            id: "cat-2",
            name: "Crafts",
            slug: "crafts",
            description: "Authentic artisanal crafts",
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ]);
      }
      if (table === "orders") {
        return createChainable([
          {
            id: "GZ-ORD-100001",
            order_number: "GZ-100001",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            customer_id: "customer-456",
            customer_name: "Pooja Reddy",
            customer_email: "pooja@example.com",
            customer_phone: "9876543210",
            shipping_address: {
              recipientName: "Pooja Reddy",
              phone: "9876543210",
              addressLine: "Plot 12, Jubilee Hills",
              city: "Hyderabad",
              state: "Telangana",
              pincode: "500033",
            },
            payment_method: "upi_qr",
            payment_status: "paid",
            status: "placed",
            subtotal: 500,
            tax: 90,
            shipping_fee: 50,
            total_amount: 640,
            items: [
              {
                id: "item-1",
                productId: "prod-1",
                name: "Handcrafted Etikoppaka Wooden Toy Train",
                price: 500,
                quantity: 1,
                sellerId: "seller-456",
                seller_id: "seller-456",
              },
            ],
            seller_ids: ["seller-456"],
            tracking_events: [],
          },
        ]);
      }
      if (
        table === "product_variants" ||
        table === "product_images" ||
        table === "reels" ||
        table === "seller_documents" ||
        table === "payments"
      ) {
        return createChainable([]);
      }
      if (table === "seller_profiles") {
        return createChainable([
          {
            id: "fab03143-9d65-47cf-bdc0-53db548b1005",
            business_name: "Etikoppaka Heritage Lacquer Toys",
            city: "Etikoppaka",
            state: "Andhra Pradesh",
            established_year: 1984,
            description: "Authentic lacquer toys",
            status: "verified",
          },
        ]);
      }
      if (table === "profiles") {
        return createChainable([
          {
            id: "user-1",
            full_name: "Artisan Maker",
            avatar_url: "/avatar.png",
            role: "seller",
          },
        ]);
      }
      if (table === "seller_applications") {
        return createChainable([
          {
            id: "app-1",
            business_name: "Etikoppaka Heritage Lacquer Toys",
            full_name: "Polumuri Nageswara Rao",
            status: "approved",
            form_data: {
              business_name: "Etikoppaka Heritage Lacquer Toys",
              gst_number: "37AAAAA0000A1Z5",
              city: "Etikoppaka",
              state: "Andhra Pradesh",
              pincode: "531055",
              years_in_business: 40,
            },
          },
        ]);
      }
      return defaultChain;
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      admin: {
        getUserById: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    },
  };
}
