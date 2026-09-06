import Link from "next/link";
import Image from "next/image";

export function AuthLogo() {
  return (
    <Link
      href="/dashboard"
      className="group inline-flex items-center gap-3 transition-opacity hover:opacity-90"
    >
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[#E5E5E0] bg-white p-1.5 shadow-2xs">
        <Image
          src="/logo.png"
          alt="GenZ Logo"
          width={28}
          height={28}
          className="object-contain"
        />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-graphik text-ink-black text-lg font-bold tracking-tight uppercase">
            Gen<span className="text-[#C89D32]">Z</span>
          </span>
          <span className="rounded-md border border-[#E5E5E0] bg-[#FAF8F4] px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-[#52524E] uppercase">
            Seller
          </span>
        </div>
        <span className="font-graphik text-[10px] font-medium text-[#73736E]">
          Factory Desk
        </span>
      </div>
    </Link>
  );
}

