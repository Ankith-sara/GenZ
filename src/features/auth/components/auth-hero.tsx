import Image from "next/image";

export function AuthHero() {
  return (
    <div className="relative hidden h-screen w-full overflow-hidden bg-black lg:block">
      {/* Background Artisan Image */}
      <Image
        src="/indian_craftsman.png"
        alt="Indian Artisan & Manufacturing Excellence"
        fill
        priority
        className="object-cover object-center opacity-65 transition-transform duration-700 hover:scale-[1.01]"
        sizes="50vw"
      />

      {/* Soft Dark Overlay + Subtle Gradient */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

      {/* Hero Content Container */}
      <div className="relative z-20 flex h-full flex-col justify-between p-12 lg:p-16">
        {/* Top Tagline Badge */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C89D32]" />
            <span className="font-graphik text-[10px] font-bold tracking-[0.25em] text-white/90 uppercase">
              GENZ MARKETPLACE
            </span>
          </div>
        </div>

        {/* Bottom Quote & Description */}
        <div className="mt-auto max-w-lg">
          <h1 className="font-graphik text-2xl leading-snug font-medium tracking-tight text-white sm:text-3xl">
            &ldquo;Trading imported guesswork for factory-validated trust.&rdquo;
          </h1>

          <p className="font-graphik mt-4 text-sm leading-relaxed text-white/80">
            Connecting buyers directly with verified Indian manufacturers through
            transparent sourcing, factory validation, and trusted commerce.
          </p>
        </div>
      </div>
    </div>
  );
}
