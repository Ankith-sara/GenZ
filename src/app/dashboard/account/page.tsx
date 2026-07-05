import { getUserAndProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AvatarUploader } from "@/components/avatar-uploader";

export default async function AccountPage() {
  const session = await getUserAndProfile();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 sm:px-12">
      <h1 className="text-3xl leading-[1.27]">Account</h1>
      <p className="text-muted-foreground mt-2 text-sm">{session.email}</p>

      <div className="border-border bg-card mt-8 rounded-[4px] border p-8">
        <h2 className="mb-4 text-lg">Profile photo</h2>
        <AvatarUploader
          userId={session.userId}
          fullName={session.profile?.full_name ?? null}
          currentUrl={session.profile?.avatar_url ?? null}
        />
      </div>
    </div>
  );
}
