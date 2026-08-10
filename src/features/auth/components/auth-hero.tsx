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
        className="object-cover object-center opacity-90 transition-transform duration-700 hover:scale-[1.01]"
        sizes="50vw"
      />

      {/* Soft Dark Overlay for Text Readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
      <div className="relative z-20 flex h-full flex-col justify-end p-12 lg:p-16">
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
