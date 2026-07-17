import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const initialAddresses = user.user_metadata?.addresses || [];

  return (
    <div className="bg-background flex min-h-screen flex-col font-sans">
      <main className="flex-1 pb-24">
        {/* Banner Section */}
        <div className="relative overflow-hidden border-b border-white/5 bg-black px-6 py-12 text-white sm:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-5" />
          <div className="relative z-10 mx-auto max-w-6xl text-left">
            <span className="text-brand-yellow eyebrow mb-2.5 block text-xs tracking-wider uppercase">
              Account Management
            </span>
            <h1 className="font-serif text-3xl leading-[1.15] font-normal tracking-tight sm:text-4xl">
              Settings &amp; Preferences
            </h1>
          </div>
        </div>

        {/* Profile Tabs Layout */}
        <div className="mx-auto max-w-6xl px-6 py-12 sm:px-12">
          <ProfileClient
            userId={user.id}
            email={user.email ?? ""}
            fullName={profile?.full_name ?? null}
            phone={profile?.phone ?? null}
            city={profile?.city ?? null}
            avatarUrl={
              profile?.avatar_url ||
              user.user_metadata?.avatar_url ||
              user.user_metadata?.picture ||
              null
            }
            initialAddresses={initialAddresses}
          />
        </div>
      </main>
    </div>
  );
}
