import Link from "next/link";
import Image from "next/image";

export function AuthLogo() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-3 transition-opacity hover:opacity-90"
    >
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-[#E5E5E0] bg-white p-1 shadow-2xs">
        <Image
          src="/logo.png"
          alt="GenZ Logo"
          width={32}
          height={32}
          className="object-contain"
        />
      </div>
      <span className="font-graphik text-ink-black text-xl font-bold tracking-tight uppercase">
        Gen<span className="text-[#C89D32]">Z</span>
      </span>
    </Link>
  );
}
