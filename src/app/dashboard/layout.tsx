import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/auth";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { LogOut } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserAndProfile();
  if (!session) redirect("/login");

  const role = session.profile?.role ?? "buyer";

  if (role === "buyer") {
    return (
      <div className="bg-background flex min-h-screen flex-col">
        <header className="border-border bg-card border-b">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/discover" className="text-sm hover:underline">
              Back to Shop
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground text-sm">{session.email}</span>
              <UserAvatar
                name={session.profile?.full_name}
                avatarUrl={session.avatarUrl}
                size={32}
              />
              <form action={signOut}>
                <Button type="submit" variant="outline" size="sm">
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen sm:flex-row">
      <DashboardSidebar role={role} />

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-border hidden border-b sm:block">
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-muted-foreground text-sm">
              {session.email} · {role}
            </span>
            <div className="flex items-center gap-4">
              <UserAvatar
                name={session.profile?.full_name}
                avatarUrl={session.avatarUrl}
                size={32}
              />
              <form action={signOut}>
                <Button type="submit" variant="outline" size="sm">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        {/* Sign out stays reachable on mobile even without the desktop topbar */}
        <div className="border-border border-t p-4 sm:hidden">
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm" className="w-full">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
