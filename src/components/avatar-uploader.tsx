"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { createClient } from "@/lib/supabase/client";

const MAX_FILE_BYTES = 3 * 1024 * 1024; // 3MB

export function AvatarUploader({
  userId,
  fullName,
  currentUrl,
}: {
  userId: string;
  fullName: string | null;
  currentUrl: string | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setError("Image must be under 3MB.");
      return;
    }

    setStatus("uploading");
    setError(null);

    const supabase = createClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `${userId}/avatar-${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      setStatus("error");
      setError(uploadError.message);
      return;
    }

    const publicUrl = supabase.storage.from("avatars").getPublicUrl(path)
      .data.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    if (updateError) {
      setStatus("error");
      setError(updateError.message);
      return;
    }

    setStatus("idle");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <UserAvatar name={fullName} avatarUrl={currentUrl} size={56} />
      <form onSubmit={handleUpload} className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="file:border-foreground text-sm file:mr-3 file:h-10 file:rounded-[4px] file:border file:bg-transparent file:px-3 file:text-sm"
        />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={status === "uploading"}
        >
          {status === "uploading" ? "Uploading…" : "Update photo"}
        </Button>
      </form>
      {error && (
        <p role="alert" className="text-destructive w-full text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
