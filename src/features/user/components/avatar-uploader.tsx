"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/atoms/button";
import { UserAvatar } from "@/components/ui/atoms/user-avatar";
import { validateFileContent } from "@/lib/file-validation";
import { uploadAvatarAction } from "@/features/user/actions";

export function AvatarUploader({
  userId: _userId,
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
    setStatus("uploading");
    setError(null);

    // Fast client-side check
    const validation = await validateFileContent(file, ["image"]);
    if (!validation.valid) {
      setStatus("error");
      setError(validation.error || "Invalid file content.");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    const result = await uploadAvatarAction(formData);

    if (result.error) {
      setStatus("error");
      setError(result.error);
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
