import { Header } from "@/components/ui/organisms/header";
import { Footer } from "@/components/ui/organisms/footer";
import { getUserAndProfile } from "@/features/auth/lib/auth";
import { signOut } from "@/app/login/actions";

export default async function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getUserAndProfile();
  const isLoggedIn = !!session;
  const role = session?.profile?.role;
  const userName = session?.profile?.full_name || session?.email;
  const avatarUrl = session?.avatarUrl || null;

  return (
    <>
      <Header
        isLoggedIn={isLoggedIn}
        role={role}
        userName={userName}
        avatarUrl={avatarUrl}
        signOutAction={signOut}
      />
      {children}
      <Footer />
    </>
  );
}
