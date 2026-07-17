"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Compass,
  ShoppingBag,
  Search,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  isLoggedIn: boolean;
  role?: string;
  userName?: string;
  avatarUrl?: string | null;
  signOutAction: () => void;
}

export function Header({
  isLoggedIn,
  role,
  userName,
  avatarUrl,
  signOutAction,
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  // Load and listen to shopping cart count
  useEffect(() => {
    function updateCount() {
      const stored = localStorage.getItem("genz-cart");
      if (stored) {
        try {
          const items = JSON.parse(stored);
          const totalQty = items.reduce(
            (acc: number, item: { quantity: number }) => acc + item.quantity,
            0
          );
          setCartCount(totalQty);
        } catch {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    }

    updateCount();
    window.addEventListener("cart-updated", updateCount);
    return () => window.removeEventListener("cart-updated", updateCount);
  }, []);

  // Load and listen to wishlist count
  useEffect(() => {
    function updateWishlistCount() {
      const stored = localStorage.getItem("genz-wishlist");
      if (stored) {
        try {
          const items = JSON.parse(stored);
          setWishlistCount(items.length);
        } catch {
          setWishlistCount(0);
        }
      } else {
        setWishlistCount(0);
      }
    }

    updateWishlistCount();
    window.addEventListener("wishlist-updated", updateWishlistCount);
    return () => window.removeEventListener("wishlist-updated", updateWishlistCount);
  }, []);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/discover?q=${encodeURIComponent(q)}`);
    setSearchQuery("");
  }

  function handleMobileSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = mobileSearchQuery.trim();
    if (!q) return;
    router.push(`/discover?q=${encodeURIComponent(q)}`);
    setIsOpen(false);
    setMobileSearchQuery("");
  }

  const bottomLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Discover", href: "/discover" },
    { name: "New", href: "/discover?new=true" },
    { name: "Featured", href: "/discover?featured=true" },
    { name: "Wooden Toys", href: "/discover?category=Wooden Toys" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <div className="bg-cream-paper border-ash hidden border-b sm:block">
        <p className="text-caption text-ink-black font-graphik mx-auto max-w-[1280px] px-6 py-2 text-center lg:px-8">
          Made in India. Verified at the source.{" "}
          <Link
            href="/signup/manufacturer"
            className="underline underline-offset-2 hover:no-underline"
          >
            Sell on GenZ
          </Link>
        </p>
      </div>

      <header className="bg-pure-white border-ash sticky top-0 z-50 w-full border-b select-none">
        {/* Top Row */}
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link
              id="faire-logo-link"
              aria-label="Go to GenZ homepage"
              className="flex shrink-0 items-center gap-2 py-2"
              href="/"
            >
              <div className="border-ash relative h-9 w-9 overflow-hidden rounded-md border">
                <Image
                  src="/logo.jpeg"
                  alt="GenZ Logo"
                  fill
                  className="object-cover"
                  sizes="36px"
                  priority
                />
              </div>
              <span className="font-graphik text-ink-black hidden text-2xl font-normal tracking-[0.12em] uppercase min-[380px]:block">
                Gen<span className="text-brand-yellow">Z</span>
              </span>
            </Link>

            {/* Search Bar (Middle) — the pill is the only non-rectangular control */}
            <div className="hidden max-w-xl min-w-0 flex-1 md:flex">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <Search className="text-smoke absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
                <input
                  type="search"
                  id="top-search"
                  placeholder="Search wholesale products or brands"
                  aria-label="Search products or brands"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-body font-graphik text-charcoal bg-pure-white border-ash hover:border-charcoal focus:border-ink-black h-10 w-full rounded-full border pr-4 pl-11 tracking-[0.009em] transition-colors focus:outline-none"
                />
              </form>
            </div>

            {/* Actions (Right Side) */}
            <div className="flex shrink-0 items-center gap-4">
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="text-ink-black hover:bg-cream-paper relative flex h-10 w-10 items-center justify-center rounded-full transition-colors focus:outline-none"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="bg-ink-black text-pure-white font-graphik border-pure-white absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border text-[9px] font-medium">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                aria-label="Shopping Cart"
                className="text-ink-black hover:bg-cream-paper relative flex h-10 w-10 items-center justify-center rounded-full transition-colors focus:outline-none"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="bg-ink-black text-pure-white font-graphik border-pure-white absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border text-[9px] font-medium">
                    {cartCount}
                  </span>
                )}
              </Link>

              {isLoggedIn ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="border-ash hover:border-charcoal bg-pure-white text-ink-black flex cursor-pointer items-center gap-1 rounded-full border p-1 pr-2 transition-all focus:outline-none"
                  >
                    <div className="bg-ink-black text-pure-white font-graphik flex h-7 w-7 items-center justify-center overflow-hidden rounded-full text-xs font-medium uppercase">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <ChevronDown className="text-smoke h-3.5 w-3.5" />
                  </button>
                  {showUserMenu && (
                    <div className="bg-pure-white text-ink-black border-ash absolute right-0 z-50 mt-2 w-56 rounded-md border py-1.5 text-left">
                      <div className="border-ash border-b px-4 py-2">
                        <p className="text-smoke font-graphik text-[10px] font-medium tracking-wide uppercase">
                          Signed in as
                        </p>
                        <p className="font-graphik text-ink-black truncate text-xs font-medium">
                          {userName || role || "User"}
                        </p>
                      </div>

                      {role === "admin" ? (
                        <Link
                          href="/admin/dashboard"
                          className="font-graphik hover:bg-cream-paper flex items-center gap-2.5 px-4 py-2 text-xs font-normal transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Compass className="h-4 w-4" /> Control Center
                        </Link>
                      ) : role === "buyer" ? (
                        <>
                          <Link
                            href="/profile"
                            className="font-graphik hover:bg-cream-paper flex items-center gap-2.5 px-4 py-2 text-xs font-normal transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="h-4 w-4" /> Profile Settings
                          </Link>
                          <Link
                            href="/orders"
                            className="font-graphik hover:bg-cream-paper flex items-center gap-2.5 px-4 py-2 text-xs font-normal transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Compass className="h-4 w-4" /> My Orders
                          </Link>
                          <Link
                            href="/cart"
                            className="font-graphik hover:bg-cream-paper flex items-center gap-2.5 px-4 py-2 text-xs font-normal transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <ShoppingBag className="h-4 w-4" /> Shopping Cart
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/dashboard"
                            className="font-graphik hover:bg-cream-paper flex items-center gap-2.5 px-4 py-2 text-xs font-normal transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Compass className="h-4 w-4" /> Profile
                          </Link>
                          <Link
                            href="/profile"
                            className="font-graphik hover:bg-cream-paper flex items-center gap-2.5 px-4 py-2 text-xs font-normal transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="h-4 w-4" /> Account Settings
                          </Link>
                        </>
                      )}
                      <hr className="border-ash my-1" />
                      <form action={signOutAction} className="w-full">
                        <button
                          type="submit"
                          className="font-graphik flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs font-normal text-red-600 transition-colors hover:bg-red-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Button
                    asChild
                    variant="ghost"
                    className="text-ink-black hover:bg-cream-paper font-graphik hidden h-10 rounded-md px-4 text-xs font-normal tracking-[0.009em] sm:inline-flex"
                  >
                    <Link href="/signup/manufacturer">Signup to sell</Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-ink-black text-pure-white hover:bg-charcoal font-graphik h-10 rounded-md px-5 text-xs font-normal tracking-[0.009em]"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                </div>
              )}

              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setIsOpen(true)}
                className="text-ink-black hover:bg-cream-paper inline-flex items-center justify-center rounded-md p-2 focus:outline-none md:hidden"
                aria-label="Open main menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row — centered, text-only category nav on cream, per Faire's Top Category Nav Bar */}
        <div className="bg-cream-paper border-ash hidden min-h-[44px] w-full items-center justify-center border-t md:flex">
          <nav aria-label="Categories" className="w-full max-w-[1280px] px-4 lg:px-8">
            <ul
              data-test-id="desktop-header-c1-categories"
              className="text-caption font-graphik text-ink-black flex flex-wrap items-center justify-center gap-x-6 py-2.5 font-normal tracking-[0.009em]"
            >
              {bottomLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href.split("?")[0]));
                return (
                  <li key={link.name} className="relative py-0.5">
                    <Link
                      href={link.href}
                      className={`hover:text-ink-black border-b-2 border-solid pb-1.5 whitespace-nowrap transition-colors ${
                        isActive
                          ? "border-ink-black"
                          : "text-charcoal border-transparent"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="bg-ink-black/40 fixed inset-0 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="bg-pure-white border-ash fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col justify-between overflow-y-auto border-l p-6">
            <div>
              {/* Drawer Header */}
              <div className="border-ash mb-6 flex items-center justify-between border-b pb-4">
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="border-ash relative h-8 w-8 overflow-hidden rounded-md border">
                    <Image
                      src="/logo.jpeg"
                      alt="GenZ Logo"
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                  <span className="font-graphik text-ink-black text-lg font-normal tracking-[0.12em] uppercase">
                    Gen<span className="text-brand-yellow">Z</span>
                  </span>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-smoke hover:bg-cream-paper rounded-md p-1.5 focus:outline-none"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleMobileSearchSubmit} className="relative mb-6">
                <Search className="text-smoke absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
                <input
                  type="search"
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  placeholder="Search products or brands..."
                  aria-label="Search"
                  className="border-ash bg-pure-white text-body font-graphik text-charcoal placeholder:text-smoke focus:border-ink-black h-11 w-full rounded-full border pr-3 pl-11 transition-colors focus:outline-none"
                />
              </form>

              {/* Mobile Links list */}
              <nav className="flex flex-col gap-1.5">
                <span className="text-smoke font-graphik mb-1.5 block text-[10px] font-medium tracking-wider uppercase">
                  Menu &amp; Categories
                </span>
                {bottomLinks.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href.split("?")[0]));
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`font-graphik rounded-md px-3 py-2 text-sm font-normal transition-colors ${
                        isActive
                          ? "bg-ink-black text-pure-white"
                          : "text-charcoal hover:bg-cream-paper hover:text-ink-black"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Drawer Bottom Actions */}
            <div className="border-ash mt-6 flex flex-col gap-3 border-t pt-6">
              {isLoggedIn ? (
                <>
                  <div className="mb-2 px-2 text-center">
                    <p className="text-smoke font-graphik text-[10px] font-medium tracking-wide uppercase">
                      Logged in as
                    </p>
                    <p className="font-graphik text-ink-black truncate text-xs font-medium">
                      {userName || role || "User"}
                    </p>
                  </div>
                  {role === "admin" ? (
                    <Button
                      asChild
                      variant="outline"
                      className="border-ash text-ink-black hover:bg-cream-paper font-graphik h-10 w-full rounded-md bg-transparent text-xs font-normal tracking-[0.009em]"
                    >
                      <Link href="/admin/dashboard" onClick={() => setIsOpen(false)}>
                        Control Center
                      </Link>
                    </Button>
                  ) : role === "buyer" ? (
                    <>
                      <Button
                        asChild
                        variant="outline"
                        className="border-ash text-ink-black hover:bg-cream-paper font-graphik h-10 w-full rounded-md bg-transparent text-xs font-normal tracking-[0.009em]"
                      >
                        <Link href="/profile" onClick={() => setIsOpen(false)}>
                          Profile Settings
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="border-ash text-ink-black hover:bg-cream-paper font-graphik h-10 w-full rounded-md bg-transparent text-xs font-normal tracking-[0.009em]"
                      >
                        <Link href="/orders" onClick={() => setIsOpen(false)}>
                          My Orders
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <Button
                      asChild
                      variant="outline"
                      className="border-ash text-ink-black hover:bg-cream-paper font-graphik h-10 w-full rounded-md bg-transparent text-xs font-normal tracking-[0.009em]"
                    >
                      <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                        Profile
                      </Link>
                    </Button>
                  )}
                  <form action={signOutAction} className="w-full">
                    <Button
                      type="submit"
                      className="font-graphik h-10 w-full rounded-md border-none bg-red-600 text-xs font-normal tracking-[0.009em] text-white hover:bg-red-700"
                    >
                      Logout
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="border-ash text-charcoal hover:bg-cream-paper font-graphik h-10 w-full rounded-md bg-transparent text-xs font-normal tracking-[0.009em]"
                  >
                    <Link href="/signup/manufacturer" onClick={() => setIsOpen(false)}>
                      Signup to sell
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-ink-black text-pure-white hover:bg-charcoal font-graphik h-10 w-full rounded-md border-none text-xs font-normal tracking-[0.009em]"
                  >
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Login
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
