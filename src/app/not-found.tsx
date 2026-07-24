import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="bg-cream-paper text-ink-black flex min-h-screen flex-col font-sans antialiased">
      {/* Header */}
      <header className="bg-pure-white border-ash/20 border-b select-none">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="border-ash/30 relative h-8 w-8 overflow-hidden rounded-md border">
              <Image
                src="/logo.png"
                alt="GenZ Logo"
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
            <span className="font-graphik text-ink-black text-xl font-normal tracking-[0.12em] uppercase">
              Gen<span className="text-brand-yellow">Z</span>
            </span>
          </Link>
          <Link
            href="/discover"
            className="text-smoke hover:text-ink-black flex items-center gap-1 text-xs font-semibold tracking-wider uppercase transition-colors"
          >
            Go to Discover <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="text-brand-yellow-dark mb-4 font-serif text-9xl font-normal tracking-tight select-none">
          404
        </div>
        <h1 className="text-ink-black font-serif text-3xl font-normal tracking-tight sm:text-4xl">
          Page Not Found
        </h1>
        <p className="text-smoke font-graphik mt-4 text-sm leading-relaxed sm:text-base">
          The page you are looking for doesn&apos;t exist, has been removed, or has
          moved to another address.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex w-full flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="bg-brand-yellow hover:bg-brand-yellow-hover font-graphik text-ink-black flex h-12 cursor-pointer items-center justify-center gap-2 border-none px-8 text-xs font-semibold tracking-wider uppercase transition-all"
          >
            <Home className="h-4 w-4" /> Go to Home
          </Link>
          <Link
            href="/discover"
            className="border-ash text-ink-black hover:bg-cream-paper font-graphik flex h-12 items-center justify-center gap-2 border bg-transparent px-8 text-xs font-semibold tracking-wider uppercase transition-all"
          >
            <Compass className="h-4 w-4" /> Browse Discover Feed
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-pure-white border-ash/20 mt-auto border-t py-6">
        <div className="mx-auto max-w-[1280px] px-4 text-center sm:px-6 lg:px-8">
          <p className="text-smoke font-graphik text-[10px]">
            &copy; {new Date().getFullYear()} GenZ Platform. All rights reserved. Made
            in India.
          </p>
        </div>
      </footer>
    </div>
  );
}
