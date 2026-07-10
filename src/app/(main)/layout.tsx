import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getUserAndProfile } from "@/lib/auth";
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

  return (
    <>
      <Header
        isLoggedIn={isLoggedIn}
        role={role}
        userName={userName}
        signOutAction={signOut}
      />
      {children}
      <Footer />
    </>
  );
}
