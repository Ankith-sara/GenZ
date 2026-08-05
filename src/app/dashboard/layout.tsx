import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/auth";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { LogOut, Search, Bell, Calendar, ChevronDown } from "lucide-react";

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

  const displayName = session.profile?.full_name || "Partner";
  const firstName = displayName.split(" ")[0];

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dateRangeFormatted = `${sevenDaysAgo.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  })} - ${now.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })}`;

  return (
    <div className="flex min-h-screen bg-[#F5F5F3] font-sans text-black antialiased sm:flex-row">
      <DashboardSidebar
        role={role}
        user={{
          full_name: session.profile?.full_name,
          email: session.email,
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col space-y-6 overflow-y-auto bg-[#FAFAFA] p-4 sm:p-6 lg:p-8">
        {/* Top Header Controls */}
        <header className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E5E5E0] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-3">
            <div className="bg-brand-yellow flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 text-sm font-bold text-black">
              {firstName[0]?.toUpperCase() || "P"}
            </div>
            <div>
              <h1 className="font-nantes text-base leading-tight font-bold text-black sm:text-lg">
                Hello {firstName}
              </h1>
              <p className="font-graphik text-xs text-[#73736E]">
                Welcome to GenZ Partner Portal
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E5E0] bg-white text-[#52524E] transition-all hover:bg-[#F5F5F3] hover:text-black"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E5E0] bg-white text-[#52524E] transition-all hover:bg-[#F5F5F3] hover:text-black"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>

            <div className="font-graphik flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#E5E5E0] bg-white px-2.5 py-2 text-xs font-medium text-[#52524E] hover:bg-[#F5F5F3] sm:px-3">
              <span>Last 7 days</span>
              <ChevronDown className="h-3.5 w-3.5 text-[#8C8C85]" />
            </div>

            <div className="font-graphik hidden items-center gap-2 rounded-xl border border-[#E5E5E0] bg-white px-3 py-2 text-xs font-semibold text-black shadow-xs sm:flex">
              <Calendar className="h-4 w-4 text-[#73736E]" />
              <span>{dateRangeFormatted}</span>
            </div>

            <form action={signOut} className="ml-auto sm:ml-2">
              <button
                type="submit"
                className="font-graphik flex h-9 items-center gap-1.5 rounded-xl border border-[#E5E5E0] bg-white px-3 text-xs font-semibold text-[#52524E] transition-all hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Exit</span>
              </button>
            </form>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
