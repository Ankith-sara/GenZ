export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  error?: string;
  id?: string;
}

export interface SellerApprovalEmailParams {
  to: string;
  fullName: string;
  businessName: string;
  password: string;
  siteUrl?: string;
}

export async function sendResendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "[Resend] API key missing (RESEND_API_KEY environment variable is not set)."
    );
    return {
      success: false,
      error: "RESEND_API_KEY is not configured in environment variables.",
    };
  }

  const from =
    options.from ||
    process.env.RESEND_FROM_EMAIL ||
    "GenZ Online <onboarding@genzonline.in>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    const body = (await res.json().catch(() => null)) as {
      id?: string;
      message?: string;
      error?: string;
    } | null;

    if (!res.ok) {
      const errorMsg =
        body?.message || body?.error || `Resend HTTP ${res.status}: ${res.statusText}`;
      console.error("[Resend] API dispatch error:", errorMsg);
      return { success: false, error: errorMsg };
    }

    return { success: true, id: body?.id };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Failed to connect to Resend API";
    console.error("[Resend] Exception during email dispatch:", err);
    return { success: false, error: errorMsg };
  }
}

export async function sendSellerApprovalEmail(
  params: SellerApprovalEmailParams
): Promise<SendEmailResult> {
  const siteUrl =
    params.siteUrl ||
    process.env.NEXT_PUBLIC_SELLER_URL ||
    "https://seller.genzonline.in";

  const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #FAF7F0; border-radius: 16px;">
      <h1 style="font-size: 24px; color: #1A1A18; margin-bottom: 8px;">Welcome to GenZ, ${params.fullName}!</h1>
      <p style="font-size: 14px; color: #52524E; line-height: 1.6;">
        Your seller registration application for <strong>${params.businessName}</strong> has been approved.
      </p>
      <div style="background: white; border: 1px solid #E5E5E0; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="font-size: 12px; color: #73736E; text-transform: uppercase; font-weight: 600; letter-spacing: 0.1em; margin-bottom: 12px;">Your Account Login Credentials</p>
        <p style="font-size: 14px; margin: 4px 0;"><strong>Login URL:</strong> <a href="${siteUrl}/login">${siteUrl}/login</a></p>
        <p style="font-size: 14px; margin: 4px 0;"><strong>Email:</strong> ${params.to}</p>
        <p style="font-size: 14px; margin: 4px 0;"><strong>Password:</strong> <code style="background: #F0F0EC; padding: 2px 8px; border-radius: 4px; font-size: 13px;">${params.password}</code></p>
      </div>
      <p style="font-size: 13px; color: #8C8C85;">Please change your password after logging in for security.</p>
      <a href="${siteUrl}/login" style="display: inline-block; background: #1A1A18; color: #FFFFFF; padding: 12px 24px; text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 8px; margin-top: 16px;">Sign In to Dashboard</a>
    </div>
  `;

  return sendResendEmail({
    to: params.to,
    subject: "Your GenZ Seller Account Approved!",
    html,
  });
}

export interface SellerOrderNotificationEmailParams {
  to: string;
  sellerName: string;
  orderId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  customerName: string;
  customerPhone?: string;
  shippingAddress: {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod?: string;
  dashboardUrl?: string;
}

export async function sendSellerOrderNotificationEmail(
  params: SellerOrderNotificationEmailParams
): Promise<SendEmailResult> {
  const dashboardUrl =
    params.dashboardUrl ||
    process.env.NEXT_PUBLIC_SELLER_URL ||
    "http://localhost:4252";

  const itemsRows = params.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #E5E5E0;">
        <td style="padding: 10px 0; font-size: 14px; color: #1A1A18;"><strong>${item.name}</strong></td>
        <td style="padding: 10px 0; font-size: 14px; color: #52524E; text-align: center;">x${item.quantity}</td>
        <td style="padding: 10px 0; font-size: 14px; color: #1A1A18; text-align: right; font-weight: 600;">₹${(item.price * item.quantity).toLocaleString("en-IN")}</td>
      </tr>
    `
    )
    .join("");

  const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #FAF7F0; border-radius: 16px;">
      <div style="margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; color: #D97706; text-transform: uppercase;">GenZ Online Marketplace</span>
        <span style="background: #FEF3C7; color: #92400E; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px;">Cash on Delivery</span>
      </div>

      <h1 style="font-size: 22px; color: #1A1A18; margin: 0 0 8px 0;">New Order Placed! 🎉</h1>
      <p style="font-size: 14px; color: #52524E; line-height: 1.6; margin: 0 0 20px 0;">
        Hello <strong>${params.sellerName}</strong>, a customer has placed a new Cash on Delivery order for your crafted products.
      </p>

      <div style="background: white; border: 1px solid #E5E5E0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E5E5E0; padding-bottom: 12px; margin-bottom: 12px;">
          <div>
            <span style="font-size: 11px; color: #73736E; text-transform: uppercase; font-weight: 600;">Order ID</span>
            <p style="font-size: 15px; font-weight: 700; color: #1A1A18; margin: 2px 0 0 0;">${params.orderId}</p>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 11px; color: #73736E; text-transform: uppercase; font-weight: 600;">Payment</span>
            <p style="font-size: 14px; font-weight: 600; color: #D97706; margin: 2px 0 0 0;">COD (₹${params.totalAmount.toLocaleString("en-IN")})</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
          <thead>
            <tr style="border-bottom: 1px solid #E5E5E0;">
              <th style="font-size: 11px; color: #73736E; text-align: left; padding-bottom: 8px; text-transform: uppercase;">Product</th>
              <th style="font-size: 11px; color: #73736E; text-align: center; padding-bottom: 8px; text-transform: uppercase;">Qty</th>
              <th style="font-size: 11px; color: #73736E; text-align: right; padding-bottom: 8px; text-transform: uppercase;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div style="border-top: 2px solid #1A1A18; padding-top: 10px; display: flex; justify-content: space-between;">
          <span style="font-size: 14px; font-weight: 700; color: #1A1A18;">Total Order Value:</span>
          <span style="font-size: 16px; font-weight: 700; color: #1A1A18;">₹${params.totalAmount.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <div style="background: white; border: 1px solid #E5E5E0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <span style="font-size: 11px; color: #73736E; text-transform: uppercase; font-weight: 600;">Customer Delivery Details</span>
        <p style="font-size: 14px; font-weight: 600; color: #1A1A18; margin: 6px 0 2px 0;">${params.customerName}</p>
        ${params.customerPhone ? `<p style="font-size: 13px; color: #52524E; margin: 0 0 4px 0;">📞 ${params.customerPhone}</p>` : ""}
        <p style="font-size: 13px; color: #52524E; margin: 0; line-height: 1.5;">
          📍 ${params.shippingAddress.addressLine}, ${params.shippingAddress.city}, ${params.shippingAddress.state} - ${params.shippingAddress.pincode}
        </p>
      </div>

      <a href="${dashboardUrl}/dashboard/orders" style="display: block; text-align: center; background: #D97706; color: #FFFFFF; padding: 14px 24px; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px;">
        View & Track in Seller Dashboard →
      </a>
    </div>
  `;

  return sendResendEmail({
    to: params.to,
    subject: `New Cash on Delivery Order [${params.orderId}] - GenZ`,
    html,
  });
}

