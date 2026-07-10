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
        <div className="bg-forest-green text-white py-12 px-6 sm:px-12 relative overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="mx-auto max-w-6xl relative z-10 text-left">
            <span className="text-gold-yellow eyebrow mb-2.5 block uppercase tracking-wider text-xs">
              Account Management
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal leading-[1.15] tracking-tight">
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
            avatarUrl={profile?.avatar_url ?? null}
            initialAddresses={initialAddresses}
          />
        </div>
      </main>
    </div>
  );
}
