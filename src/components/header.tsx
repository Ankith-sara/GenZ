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
  HelpCircle,
  FileText,
  PhoneCall,
  ShieldCheck,
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
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [showCollectionsDropdown, setShowCollectionsDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const pathname = usePathname();
  const router = useRouter();

  const userMenuRef = useRef<HTMLDivElement>(null);
  const helpMenuRef = useRef<HTMLDivElement>(null);
  const shopMenuRef = useRef<HTMLLIElement>(null);
  const collectionsMenuRef = useRef<HTMLLIElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Focus search input when toggled
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target as Node)) {
        setShowHelpMenu(false);
      }
      if (shopMenuRef.current && !shopMenuRef.current.contains(event.target as Node)) {
        setShowShopDropdown(false);
      }
      if (
        collectionsMenuRef.current &&
        !collectionsMenuRef.current.contains(event.target as Node)
      ) {
        setShowCollectionsDropdown(false);
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
    setShowSearch(false);
  }

  function handleMobileSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = mobileSearchQuery.trim();
    if (!q) return;
    router.push(`/discover?q=${encodeURIComponent(q)}`);
    setIsOpen(false);
    setMobileSearchQuery("");
  }

  const shopCategories = [
    {
      name: "All Products Catalog",
      href: "/discover",
      description: "Explore all verified Indian factory products",
    },
    {
      name: "New Arrivals",
      href: "/discover?new=true",
      description: "Latest additions directly from certified makers",
    },
    {
      name: "Factory Process Reels",
      href: "/discover?reels=true",
      description: "Watch live manufacturing videos from source",
    },
  ];

  const collectionsCategories = [
    {
      name: "Wooden Toys & Crafts",
      href: "/discover?category=Wooden Toys",
      description: "Traditional & eco-friendly wooden craftsmanship",
    },
    {
      name: "STEM & Educational Toys",
      href: "/discover?category=STEM Toys",
      description: "Learning kits, science & puzzle toys",
    },
    {
      name: "Games & Puzzles",
      href: "/discover?category=Games & Puzzles",
      description: "Mind games, board games & outdoor play",
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full shadow-sm select-none">
        {/* TOP BAR (Dark Editorial Header matching Shadcnblocks reference) */}
        <div className="bg-[#121212] text-white">
          <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left: Brand Logo */}
            <Link
              id="faire-logo-link"
              aria-label="Go to GenZ homepage"
              className="flex shrink-0 items-center gap-2.5 py-2"
              href="/"
            >
              <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-white/20 bg-black shadow-xs">
                <Image
                  src="/logo.png"
                  alt="GenZ Logo"
                  fill
                  className="object-cover"
                  sizes="36px"
                  priority
                />
              </div>
              <span className="font-nantes text-2xl font-bold tracking-tight text-white">
                Gen<span className="text-amber-400">Z</span>
              </span>
            </Link>

            {/* Right: Actions (Help & Support, Wishlist, Account, Search, Cart) */}
            <div className="flex shrink-0 items-center gap-4 sm:gap-6">
              {/* Help & Support Dropdown */}
              <div className="relative hidden md:block" ref={helpMenuRef}>
                <button
                  onClick={() => setShowHelpMenu(!showHelpMenu)}
                  className="font-graphik flex cursor-pointer items-center gap-1.5 text-xs font-medium text-white/90 transition-colors hover:text-white"
                >
                  <HelpCircle className="h-4 w-4 text-white/80" />
                  <span>Help &amp; Support</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-white/60 transition-transform ${
                      showHelpMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showHelpMenu && (
                  <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-neutral-800 bg-[#1A1A1A] p-2 text-white shadow-xl">
                    <Link
                      href="/contact"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium hover:bg-neutral-800"
                      onClick={() => setShowHelpMenu(false)}
                    >
                      <PhoneCall className="h-4 w-4 text-amber-400" />
                      <span>Contact Support</span>
                    </Link>
                    <Link
                      href="/about"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium hover:bg-neutral-800"
                      onClick={() => setShowHelpMenu(false)}
                    >
                      <ShieldCheck className="h-4 w-4 text-amber-400" />
                      <span>GST Verification Guide</span>
                    </Link>
                    <Link
                      href="/signup/manufacturer"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium hover:bg-neutral-800"
                      onClick={() => setShowHelpMenu(false)}
                    >
                      <FileText className="h-4 w-4 text-amber-400" />
                      <span>Sell on GenZ</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative flex items-center justify-center text-white/90 transition-colors hover:text-white"
              >
                <Heart className="h-5 w-5 text-white" />
                {wishlistCount > 0 && (
                  <span className="font-graphik absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-black">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account Dropdown */}
              {isLoggedIn ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    aria-label="User Account"
                    className="flex cursor-pointer items-center gap-1 text-white/90 transition-colors hover:text-white"
                  >
                    <div className="font-graphik flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-amber-500 text-xs font-bold text-black uppercase">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt="Avatar"
                          width={24}
                          height={24}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <User className="h-3.5 w-3.5 text-black" />
                      )}
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-white/60" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-neutral-800 bg-[#1A1A1A] py-1.5 text-white shadow-xl">
                      <div className="border-b border-neutral-800 px-4 py-2">
                        <p className="font-graphik text-[10px] font-semibold text-neutral-400 uppercase">
                          Signed in as
                        </p>
                        <p className="font-graphik truncate text-xs font-bold text-white">
                          {userName || role || "User"}
                        </p>
                      </div>

                      {role === "admin" ? (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium hover:bg-neutral-800"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Compass className="h-4 w-4 text-amber-400" /> Control Center
                        </Link>
                      ) : role === "buyer" ? (
                        <>
                          <Link
                            href="/profile"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium hover:bg-neutral-800"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="h-4 w-4 text-amber-400" /> Profile Settings
                          </Link>
                          <Link
                            href="/orders"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium hover:bg-neutral-800"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Compass className="h-4 w-4 text-amber-400" /> My Orders
                          </Link>
                        </>
                      ) : (
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium hover:bg-neutral-800"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Compass className="h-4 w-4 text-amber-400" /> Profile
                        </Link>
                      )}

                      <hr className="my-1 border-neutral-800" />
                      <form action={signOutAction} className="w-full">
                        <button
                          type="submit"
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs font-medium text-red-400 hover:bg-red-950/40"
                        >
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  aria-label="Account Login"
                  className="flex items-center text-white/90 transition-colors hover:text-white"
                >
                  <User className="h-5 w-5 text-white" />
                </Link>
              )}

              {/* Search Toggle Icon */}
              <div className="relative">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
                  aria-label="Toggle Search"
                >
                  <Search className="h-5 w-5" />
                </button>

                {showSearch && (
                  <form
                    onSubmit={handleSearchSubmit}
                    className="absolute right-0 z-50 mt-2 flex w-72 items-center gap-2 rounded-xl border border-neutral-800 bg-[#1A1A1A] p-2 shadow-2xl"
                  >
                    <input
                      ref={searchInputRef}
                      type="search"
                      placeholder="Search products or makers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="font-graphik w-full rounded-lg bg-neutral-900 px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="font-graphik rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-black"
                    >
                      Go
                    </button>
                  </form>
                )}
              </div>

              {/* Cart Button with Badge Positioned On Top of Icon */}
              <Link
                href="/cart"
                aria-label="Shopping Cart"
                className="relative flex items-center justify-center text-white transition-opacity hover:opacity-90"
              >
                <ShoppingBag className="h-5.5 w-5.5 text-white" />
                <span className="font-graphik absolute -top-1.5 -right-2 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-[#F59E0B] px-1 text-[10px] font-bold text-black shadow-xs">
                  {cartCount}
                </span>
              </Link>

              {/* Mobile Drawer Toggle Button */}
              <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center justify-center rounded-lg p-1.5 text-white hover:bg-white/10 md:hidden"
                aria-label="Open Menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR (Light Cream Category Navbar matching Shadcnblocks reference) */}
        <div className="hidden min-h-[44px] w-full border-b border-[#E5E5E0] bg-[#FAF7F0] md:block">
          <div className="mx-auto flex max-w-[1280px] items-center px-4 lg:px-8">
            <nav aria-label="Main navigation" className="w-full">
              <ul className="font-graphik flex items-center gap-x-8 py-2.5 text-xs font-semibold tracking-wide text-[#2B2B28]">
                {/* Shop Dropdown */}
                <li
                  ref={shopMenuRef}
                  className="relative py-0.5"
                  onMouseEnter={() => setShowShopDropdown(true)}
                  onMouseLeave={() => setShowShopDropdown(false)}
                >
                  <button
                    onClick={() => setShowShopDropdown(!showShopDropdown)}
                    className="flex cursor-pointer items-center gap-1 transition-colors hover:text-black"
                  >
                    <span>Shop</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-neutral-500 transition-transform ${
                        showShopDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showShopDropdown && (
                    <div className="absolute left-0 z-50 mt-1.5 w-64 rounded-xl border border-[#E5E5E0] bg-white p-2 shadow-xl">
                      {shopCategories.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setShowShopDropdown(false)}
                          className="block rounded-lg px-3 py-2 transition-all hover:bg-[#FAF7F0]"
                        >
                          <span className="font-graphik block text-xs font-bold text-black">
                            {item.name}
                          </span>
                          <span className="font-graphik block text-[11px] text-neutral-500">
                            {item.description}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </li>

                {/* Collections Dropdown */}
                <li
                  ref={collectionsMenuRef}
                  className="relative py-0.5"
                  onMouseEnter={() => setShowCollectionsDropdown(true)}
                  onMouseLeave={() => setShowCollectionsDropdown(false)}
                >
                  <button
                    onClick={() => setShowCollectionsDropdown(!showCollectionsDropdown)}
                    className="flex cursor-pointer items-center gap-1 transition-colors hover:text-black"
                  >
                    <span>Collections</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-neutral-500 transition-transform ${
                        showCollectionsDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showCollectionsDropdown && (
                    <div className="absolute left-0 z-50 mt-1.5 w-64 rounded-xl border border-[#E5E5E0] bg-white p-2 shadow-xl">
                      {collectionsCategories.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setShowCollectionsDropdown(false)}
                          className="block rounded-lg px-3 py-2 transition-all hover:bg-[#FAF7F0]"
                        >
                          <span className="font-graphik block text-xs font-bold text-black">
                            {item.name}
                          </span>
                          <span className="font-graphik block text-[11px] text-neutral-500">
                            {item.description}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </li>

                {/* New Arrivals */}
                <li className="relative py-0.5">
                  <Link
                    href="/discover?new=true"
                    className={`transition-colors hover:text-black ${
                      pathname.includes("new=true") ? "font-bold text-black" : ""
                    }`}
                  >
                    New Arrivals
                  </Link>
                </li>

                {/* Wooden Toys */}
                <li className="relative py-0.5">
                  <Link
                    href="/discover?category=Wooden Toys"
                    className={`transition-colors hover:text-black ${
                      pathname.includes("Wooden") ? "font-bold text-black" : ""
                    }`}
                  >
                    Wooden Toys
                  </Link>
                </li>

                {/* About Us */}
                <li className="relative py-0.5">
                  <Link
                    href="/about"
                    className={`transition-colors hover:text-black ${
                      pathname === "/about" ? "font-bold text-black" : ""
                    }`}
                  >
                    About Us
                  </Link>
                </li>

                {/* Contact */}
                <li className="relative py-0.5">
                  <Link
                    href="/contact"
                    className={`transition-colors hover:text-black ${
                      pathname === "/contact" ? "font-bold text-black" : ""
                    }`}
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col justify-between border-l border-[#E5E5E0] bg-white p-6 shadow-2xl">
            <div>
              <div className="mb-6 flex items-center justify-between border-b border-[#E5E5E0] pb-4">
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="relative h-8 w-8 overflow-hidden rounded-xl border border-black/10 bg-black">
                    <Image
                      src="/logo.png"
                      alt="GenZ Logo"
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                  <span className="font-nantes text-lg font-bold text-black">
                    Gen<span className="text-amber-500">Z</span>
                  </span>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-neutral-500 hover:bg-[#FAF7F0]"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Mobile Search Input */}
              <form onSubmit={handleMobileSearchSubmit} className="relative mb-6">
                <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="search"
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-full border border-[#E5E5E0] bg-[#FAF7F0] py-2 pr-4 pl-10 text-xs focus:outline-none"
                />
              </form>

              {/* Mobile Navigation */}
              <nav className="font-graphik flex flex-col gap-2 text-xs font-semibold text-neutral-800">
                <Link
                  href="/"
                  className="rounded-lg px-3 py-2 hover:bg-[#FAF7F0]"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/discover"
                  className="rounded-lg px-3 py-2 hover:bg-[#FAF7F0]"
                  onClick={() => setIsOpen(false)}
                >
                  Shop Catalog
                </Link>
                <Link
                  href="/discover?category=Wooden Toys"
                  className="rounded-lg px-3 py-2 hover:bg-[#FAF7F0]"
                  onClick={() => setIsOpen(false)}
                >
                  Wooden Toys
                </Link>
                <Link
                  href="/about"
                  className="rounded-lg px-3 py-2 hover:bg-[#FAF7F0]"
                  onClick={() => setIsOpen(false)}
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className="rounded-lg px-3 py-2 hover:bg-[#FAF7F0]"
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </Link>
              </nav>
            </div>

            {/* Mobile Actions */}
            <div className="border-t border-[#E5E5E0] pt-4">
              {isLoggedIn ? (
                <Button
                  asChild
                  variant="outline"
                  className="font-graphik w-full rounded-xl text-xs font-semibold"
                >
                  <Link href="/profile" onClick={() => setIsOpen(false)}>
                    My Profile
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="font-graphik w-full rounded-xl bg-black text-xs font-semibold text-white"
                >
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    Login
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
