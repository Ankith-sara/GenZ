import { AuthLayout } from "@/components/auth/auth-layout";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  const { redirectTo, error } = await searchParams;

  return <AuthLayout redirectTo={redirectTo ?? "/dashboard"} error={error} />;
}
