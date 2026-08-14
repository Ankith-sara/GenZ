import { AuthLayout } from "@/features/auth/components/auth-layout";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  const { redirectTo, error } = await searchParams;

  return <AuthLayout redirectTo={redirectTo ?? "/dashboard"} error={error} />;
}
