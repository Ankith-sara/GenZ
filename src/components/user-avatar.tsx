import Image from "next/image";

function initials(name: string | null | undefined): string {
  if (!name) return "?";
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
        <Image src={avatarUrl} alt="" fill className="object-cover" unoptimized />
      </div>
    );
  }

  return (
    <div
      className="bg-foreground text-background flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}
