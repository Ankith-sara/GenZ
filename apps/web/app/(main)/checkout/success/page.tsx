import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { orderIdSchema } from "@genz/validation";

export const dynamic = "force-dynamic";

/**
 * Confirmation screen for guest checkout. Shows only the order id from the
 * URL (never order details), since guests have no authenticated order history.
 */
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const parsed = orderIdSchema.safeParse(order ?? "");
  const orderId = parsed.success ? parsed.data : null;

  return (
    <main className="min-h-screen flex-1 bg-[#FAF7F0] px-4 py-16 font-sans text-[#1A1A18] antialiased sm:px-6">
      <div className="mx-auto max-w-lg rounded-2xl border border-[#E5E5E0] bg-white p-8 text-center shadow-xs">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="font-serif text-2xl font-normal">Thank you, your order is placed</h1>
        {orderId && (
          <p className="mt-2 font-mono text-sm font-bold text-[#1A1A18]">{orderId}</p>
        )}
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#73736E]">
          We have emailed your order confirmation. You will get another email when it ships.
          Create an account or sign in with the same email to track, cancel or return future
          orders online.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            href="/discover"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#D97706] px-6 text-xs font-semibold tracking-wider text-white uppercase hover:bg-[#B45309]"
          >
            Continue shopping
          </Link>
          <Link
            href="/login?redirectTo=/orders"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E5E5E0] px-6 text-xs font-semibold tracking-wider text-[#1A1A18] uppercase hover:bg-[#FAF8F4]"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
