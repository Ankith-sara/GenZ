"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  isLoggedIn: boolean;
  role?: string;
  userName?: string;
  signOutAction: () => void;
}

export function Header({ isLoggedIn, role, userName, signOutAction }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  // Load and listen to shopping cart count
  useEffect(() => {
    function updateCount() {
      const stored = localStorage.getItem("genz-cart");
      if (stored) {
        try {
          const items = JSON.parse(stored);
          const totalQty = items.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0);
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
      {/* Slim promo strip — thin line of type, no fill, per Faire's Promo Banner pattern */}
      <div className="hidden sm:block bg-cream-paper border-b border-ash">
        <p className="mx-auto max-w-[1280px] px-6 lg:px-8 py-2 text-center text-caption text-ink-black font-graphik">
          Made in India. Verified at the source.{" "}
          <Link href="/signup/manufacturer" className="underline underline-offset-2 hover:no-underline">
            Sell on GenZ
          </Link>
        </p>
      </div>

      <header className="sticky top-0 z-50 bg-pure-white border-b border-ash w-full select-none">
        {/* Top Row */}
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* Logo */}
            <Link id="faire-logo-link" aria-label="Go to GenZ homepage" className="flex items-center gap-2 shrink-0 py-2" href="/">
              <div className="w-9 h-9 bg-ink-black text-pure-white flex items-center justify-center font-graphik font-normal text-xl rounded-md">
                Z
              </div>
              <span className="text-xl font-graphik font-normal tracking-[0.12em] uppercase text-ink-black hidden min-[380px]:block">GenZ</span>
            </Link>

            {/* Search Bar (Middle) — the pill is the only non-rectangular control */}
            <div className="hidden md:flex flex-1 max-w-xl min-w-0">
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-smoke" />
                <input
                  type="search"
                  id="top-search"
                  placeholder="Search wholesale products or brands"
                  aria-label="Search products or brands"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-11 pr-4 text-body font-graphik text-charcoal bg-pure-white border border-ash hover:border-charcoal focus:border-ink-black focus:outline-none rounded-full transition-colors tracking-[0.009em]"
                />
              </form>
            </div>

            {/* Actions (Right Side) */}
            <div className="flex items-center gap-4 shrink-0">

              {/* Shopping Cart Icon with Badge */}
              <Link
                href="/cart"
                aria-label="Shopping Cart"
                className="relative flex items-center justify-center h-10 w-10 rounded-full text-ink-black hover:bg-cream-paper transition-colors focus:outline-none"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-ink-black text-pure-white font-graphik font-medium text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-pure-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {isLoggedIn ? (
                /* User Logged-in Menu Dropdown */
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-ash hover:border-charcoal bg-pure-white text-ink-black transition-all focus:outline-none"
                  >
                    <div className="h-7 w-7 bg-ink-black text-pure-white rounded-full flex items-center justify-center text-xs font-graphik font-medium uppercase">
                      {userName ? userName.charAt(0).toUpperCase() : role?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="hidden sm:inline text-xs font-graphik font-medium max-w-[100px] truncate">
                      {userName || role || "Account"}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-smoke" />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md bg-pure-white text-ink-black py-1.5 z-50 border border-ash text-left">
                      <div className="px-4 py-2 border-b border-ash">
                        <p className="text-[10px] text-smoke uppercase font-graphik font-medium tracking-wide">Signed in as</p>
                        <p className="text-xs font-graphik font-medium truncate text-ink-black">{userName || role || "User"}</p>
                      </div>

                      {role === "admin" ? (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-graphik font-normal hover:bg-cream-paper transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Compass className="h-4 w-4" /> Control Center
                        </Link>
                      ) : role === "buyer" ? (
                        <>
                          <Link
                            href="/profile"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-graphik font-normal hover:bg-cream-paper transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="h-4 w-4" /> Profile Settings
                          </Link>
                          <Link
                            href="/orders"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-graphik font-normal hover:bg-cream-paper transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Compass className="h-4 w-4" /> My Orders
                          </Link>
                          <Link
                            href="/cart"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-graphik font-normal hover:bg-cream-paper transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <ShoppingBag className="h-4 w-4" /> Shopping Cart
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-graphik font-normal hover:bg-cream-paper transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Compass className="h-4 w-4" /> Dashboard
                          </Link>
                          <Link
                            href="/profile"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-graphik font-normal hover:bg-cream-paper transition-colors"
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
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-graphik font-normal text-red-600 hover:bg-red-50 transition-colors text-left"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ) : (
                /* Logged-out Auth Links — ghost text + single matte-black CTA */
                <div className="flex items-center gap-2.5">
                  <Button asChild variant="ghost" className="hidden sm:inline-flex text-ink-black hover:bg-cream-paper font-graphik text-xs font-normal tracking-[0.009em] h-10 px-4 rounded-md">
                    <Link href="/signup/manufacturer">Signup to sell</Link>
                  </Button>
                  <Button asChild className="bg-ink-black text-pure-white hover:bg-charcoal rounded-md h-10 px-5 font-graphik text-xs font-normal tracking-[0.009em]">
                    <Link href="/login">Login</Link>
                  </Button>
                </div>
              )}

              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setIsOpen(true)}
                className="inline-flex md:hidden items-center justify-center p-2 text-ink-black hover:bg-cream-paper rounded-md focus:outline-none"
                aria-label="Open main menu"
              >
                <Menu className="h-6 w-6" />
              </button>

            </div>
          </div>
        </div>

        {/* Bottom Row — centered, text-only category nav on cream, per Faire's Top Category Nav Bar */}
        <div className="hidden md:flex bg-cream-paper border-t border-ash min-h-[44px] w-full items-center justify-center">
          <nav aria-label="Categories" className="w-full max-w-[1280px] px-4 lg:px-8">
            <ul data-test-id="desktop-header-c1-categories" className="flex items-center justify-center flex-wrap gap-x-6 py-2.5 text-caption font-graphik font-normal text-ink-black tracking-[0.009em]">
              {bottomLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href.split("?")[0]));
                return (
                  <li key={link.name} className="relative py-0.5">
                    <Link
                      href={link.href}
                      className={`hover:text-ink-black transition-colors border-b-2 border-solid whitespace-nowrap pb-1.5 ${
                        isActive ? "border-ink-black" : "border-transparent text-charcoal"
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

      {/* Mobile Drawer (Slide-in Menu) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay backdrop — flat, no blur, per "no drop shadows or blur" rule */}
          <div
            className="fixed inset-0 bg-ink-black/40 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-pure-white border-l border-ash p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-ash pb-4 mb-6">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <div className="w-8 h-8 bg-ink-black text-pure-white flex items-center justify-center font-graphik font-normal text-lg rounded-md">
                    Z
                  </div>
                  <span className="text-lg font-graphik font-normal tracking-[0.12em] uppercase text-ink-black">GenZ</span>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1.5 text-smoke hover:bg-cream-paper focus:outline-none"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleMobileSearchSubmit} className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-smoke" />
                <input
                  type="search"
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  placeholder="Search products or brands..."
                  aria-label="Search"
                  className="w-full h-11 border border-ash rounded-full bg-pure-white pl-11 pr-3 text-body font-graphik text-charcoal placeholder:text-smoke focus:outline-none focus:border-ink-black transition-colors"
                />
              </form>

              {/* Mobile Links list */}
              <nav className="flex flex-col gap-1.5">
                <span className="text-[10px] text-smoke uppercase font-graphik font-medium tracking-wider mb-1.5 block">Menu &amp; Categories</span>
                {bottomLinks.map((link) => {
                  const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href.split("?")[0]));
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`text-sm font-graphik font-normal px-3 py-2 rounded-md transition-colors ${
                        isActive ? "bg-ink-black text-pure-white" : "text-charcoal hover:bg-cream-paper hover:text-ink-black"
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
            <div className="border-t border-ash pt-6 mt-6 flex flex-col gap-3">
              {isLoggedIn ? (
                <>
                  <div className="text-center mb-2 px-2">
                    <p className="text-[10px] text-smoke uppercase font-graphik font-medium tracking-wide">Logged in as</p>
                    <p className="text-xs font-graphik font-medium truncate text-ink-black">{userName || role || "User"}</p>
                  </div>
                  {role === "admin" ? (
                    <Button asChild variant="outline" className="w-full border-ash text-ink-black hover:bg-cream-paper rounded-md h-10 font-graphik text-xs font-normal tracking-[0.009em] bg-transparent">
                      <Link href="/admin/dashboard" onClick={() => setIsOpen(false)}>
                        Control Center
                      </Link>
                    </Button>
                  ) : role === "buyer" ? (
                    <>
                      <Button asChild variant="outline" className="w-full border-ash text-ink-black hover:bg-cream-paper rounded-md h-10 font-graphik text-xs font-normal tracking-[0.009em] bg-transparent">
                        <Link href="/profile" onClick={() => setIsOpen(false)}>
                          Profile Settings
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full border-ash text-ink-black hover:bg-cream-paper rounded-md h-10 font-graphik text-xs font-normal tracking-[0.009em] bg-transparent">
                        <Link href="/orders" onClick={() => setIsOpen(false)}>
                          My Orders
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <Button asChild variant="outline" className="w-full border-ash text-ink-black hover:bg-cream-paper rounded-md h-10 font-graphik text-xs font-normal tracking-[0.009em] bg-transparent">
                      <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                        Dashboard
                      </Link>
                    </Button>
                  )}
                  <form action={signOutAction} className="w-full">
                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white rounded-md h-10 font-graphik text-xs font-normal tracking-[0.009em] border-none">
                      Logout
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full border-ash text-charcoal hover:bg-cream-paper rounded-md h-10 font-graphik text-xs font-normal tracking-[0.009em] bg-transparent">
                    <Link href="/signup/manufacturer" onClick={() => setIsOpen(false)}>Signup to sell</Link>
                  </Button>
                  <Button asChild className="w-full bg-ink-black text-pure-white hover:bg-charcoal rounded-md h-10 font-graphik text-xs font-normal tracking-[0.009em] border-none">
                    <Link href="/login" onClick={() => setIsOpen(false)}>Login</Link>
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