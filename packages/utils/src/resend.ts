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
