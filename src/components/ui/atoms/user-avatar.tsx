import { User } from "lucide-react";

function initials(name: string | null | undefined): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserAvatar({
  name,
  avatarUrl,
  size = 32,
}: {
  name: string | null | undefined;
  avatarUrl: string | null | undefined;
  size?: number;
}) {
  if (avatarUrl) {
    return (
      <div
        className="border-border relative overflow-hidden rounded-full border"
        style={{ width: size, height: size }}
      >
        <img
          src={avatarUrl}
          alt=""
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  const userInitials = initials(name);
  if (!userInitials) {
    return (
      <div
        className="bg-foreground text-background flex shrink-0 items-center justify-center rounded-full"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <User
          className="text-white"
          style={{ width: size * 0.5, height: size * 0.5 }}
        />
      </div>
    );
  }

  return (
    <div
      className="bg-foreground text-background font-graphik flex shrink-0 items-center justify-center rounded-full font-medium"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {userInitials}
    </div>
  );
}
