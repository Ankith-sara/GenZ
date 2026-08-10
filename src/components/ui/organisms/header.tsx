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
import { Button } from "@/components/ui/atoms/button";
import { UserAvatar } from "@/components/ui/atoms/user-avatar";

interface HeaderProps {
  isLoggedIn: boolean;
  role?: string;
  userName?: string;
  avatarUrl?: string | null;
  signOutAction: () => void;
}

const categoriesList = [
  {
    name: "Wooden Toys & Crafts",
    href: "/discover?category=Wooden Toys",
    image: "/cat_toys.png",
    desc: "Eco-friendly, non-toxic traditional Indian toys & puzzle blocks",
    badge: "Popular",
  },
  {
    name: "Electronics & Tech",
    href: "/discover?category=Electronics",
    image: "/cat_electronics.png",
    desc: "Smart devices, chargers & custom circuit assemblies",
    badge: "Trending",
  },
  {
    name: "Fashion & Apparel",
    href: "/discover?category=Fashion",
    image: "/cat_fashion.png",
    desc: "Organic cotton textiles, handcrafted apparel & accessories",
    badge: "New",
  },
  {
    name: "Home & Furniture",
    href: "/discover?category=Furniture",
    image: "/cat_furniture.png",
    desc: "Solid wood furniture, handcrafted decor & living items",
    badge: null,
  },
  {
    name: "Kitchen & Dining",
    href: "/discover?category=Kitchen",
    image: "/cat_kitchen.png",
    desc: "Stainless steel utensils, cast iron cookware & appliances",
    badge: null,
  },
  {
    name: "Beauty & Wellness",
    href: "/discover?category=Beauty",
    image: "/cat_beauty.png",
    desc: "Ayurvedic formulations, natural skincare & herbal wellness",
    badge: null,
  },
  {
    name: "Industrial & Tools",
    href: "/discover?category=Industrial",
    image: "/cat_industrial.png",
    desc: "Precision components, machinery parts & fabrication tools",
    badge: "B2B",
  },
  {
    name: "Sports & Fitness",
    href: "/discover?category=Sports",
    image: "/cat_sports.png",
    desc: "Athletic gear, fitness equipment & outdoor play sets",
    badge: null,
  },
];

export function Header({
  isLoggedIn,
  role,
  userName,
  avatarUrl,
  signOutAction,
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCollectionsDropdown, setShowCollectionsDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const userMenuRef = useRef<HTMLDivElement>(null);
  const collectionsMenuRef = useRef<HTMLLIElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Cart & Wishlist counters
  useEffect(() => {
    function updateCart() {
      const stored = localStorage.getItem("genz-cart");
      if (stored) {
        try {
          const items = JSON.parse(stored);
          const total = items.reduce(
            (acc: number, item: { quantity: number }) => acc + item.quantity,
            0
          );
          setCartCount(total);
        } catch {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    }

    function updateWishlist() {
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

    updateCart();
    updateWishlist();
    window.addEventListener("cart-updated", updateCart);
    window.addEventListener("wishlist-updated", updateWishlist);
    return () => {
      window.removeEventListener("cart-updated", updateCart);
      window.removeEventListener("wishlist-updated", updateWishlist);
    };
  }, []);

  // Collapse the announcement bar once the page is scrolled, so the
  // sticky header reclaims vertical space instead of staying maximal height.
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 24);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
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

  // Close every open overlay on Escape — a keyboard user shouldn't have
  // to hunt for a close button.
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setShowUserMenu(false);
      setShowCollectionsDropdown(false);
      setShowMobileSearch(false);
      setIsOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowUserMenu(false);
      setShowCollectionsDropdown(false);
      setShowMobileSearch(false);
      setIsOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Lock background scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Autofocus the inline mobile search input when it opens.
  useEffect(() => {
    if (showMobileSearch) {
      mobileSearchInputRef.current?.focus();
    }
  }, [showMobileSearch]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setShowMobileSearch(false);
    router.push(`/discover?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-black text-white shadow-xl select-none">
        {/* TOP ANNOUNCEMENT BAR — collapses on scroll to reclaim height */}
        <div
          className={`overflow-hidden border-b border-neutral-800/80 bg-[#050505] text-neutral-300 transition-[max-height,opacity] duration-300 ease-out ${
            scrolled ? "max-h-0 opacity-0" : "max-h-9 opacity-100"
          }`}
        >
          <div className="font-graphik mx-auto flex h-9 max-w-[1280px] items-center justify-between px-4 text-[11px] tracking-wide sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 font-medium text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                Made in India Marketplace
              </span>
            </div>

            <div className="flex items-center gap-5 text-neutral-300">
              <Link
                href="/seller/signup"
                className="font-semibold text-white transition-colors hover:text-neutral-300 hover:underline"
              >
                Sell on GenZ
              </Link>
              <span className="text-neutral-700">|</span>
              <Link href="/contact" className="transition-colors hover:text-white">
                Support
              </Link>
            </div>
          </div>
        </div>

        {/* MAIN NAVIGATION BAR */}
        <div className="border-b border-neutral-800 bg-black py-3.5">
          <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            {/* Left: Brand Logo */}
            <Link
              id="genz-logo-link"
              aria-label="Go to GenZ homepage"
              className="flex shrink-0 items-center gap-2.5"
              href="/"
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900 shadow-md">
                <Image
                  src="/logo.png"
                  alt="GenZ Logo"
                  fill
                  className="object-cover"
                  sizes="40px"
                  priority
                />
              </div>
              <span className="font-nantes text-2xl font-bold tracking-tight text-white">
                Gen<span className="text-amber-400">Z</span>
              </span>
            </Link>

            {/* Middle: Search Bar (desktop) */}
            <form
              onSubmit={handleSearchSubmit}
              className="ml-8 ml-auto hidden h-10 w-full items-center overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-xs transition-all focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 md:flex lg:ml-16"
            >
              <input
                type="search"
                placeholder="Search products, verified factories, categories..."
                value={searchQuery}
                spellCheck={false}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="font-graphik w-full bg-transparent px-4 text-xs text-neutral-900 placeholder-neutral-500 focus:outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
              />
              <button
                type="submit"
                aria-label="Submit Search"
                className="flex h-full w-12 shrink-0 items-center justify-center bg-amber-400 text-black transition-all hover:bg-amber-300"
              >
                <Search className="h-5 w-5 stroke-[2.5]" />
              </button>
            </form>

            {/* Right: Actions & User Avatar */}
            <div className="flex shrink-0 items-center gap-3.5 sm:gap-4">
              {/* Mobile search toggle — lets mobile users search without opening the full drawer */}
              <button
                onClick={() => setShowMobileSearch((v) => !v)}
                aria-label="Toggle search"
                aria-expanded={showMobileSearch}
                aria-controls="mobile-search-row"
                className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white md:hidden"
              >
                {showMobileSearch ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </button>

              {/* Wishlist Icon */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="font-graphik absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-black shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Icon */}
              <Link
                href="/cart"
                aria-label="Shopping Cart"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="font-graphik absolute top-0 right-0 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[9px] font-bold text-black shadow-xs">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Account Dropdown or Login Button */}
              {isLoggedIn ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    aria-label="User Account"
                    aria-expanded={showUserMenu}
                    aria-haspopup="true"
                    aria-controls="user-menu"
                    className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-neutral-700 px-1.5 transition-colors hover:border-white"
                  >
                    <UserAvatar name={userName} avatarUrl={avatarUrl} size={26} />
                    <ChevronDown className="mr-0.5 h-3.5 w-3.5 text-neutral-400" />
                  </button>

                  {showUserMenu && (
                    <div
                      id="user-menu"
                      role="menu"
                      className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-neutral-800 bg-[#121212] py-2 text-white shadow-2xl"
                    >
                      <div className="border-b border-neutral-800 px-4 py-2.5">
                        <p className="font-graphik text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                          Signed in as
                        </p>
                        <p className="font-graphik truncate text-xs font-bold text-white">
                          {userName || role || "User"}
                        </p>
                      </div>

                      {role === "admin" ? (
                        <Link
                          href="/admin/dashboard"
                          role="menuitem"
                          className="font-graphik flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium hover:bg-neutral-800 hover:text-white"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Compass className="h-4 w-4 text-neutral-300" /> Admin Control
                          Center
                        </Link>
                      ) : role === "buyer" ? (
                        <>
                          <Link
                            href="/profile"
                            role="menuitem"
                            className="font-graphik flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium hover:bg-neutral-800 hover:text-white"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="h-4 w-4 text-neutral-300" /> Profile
                            Settings
                          </Link>
                          <Link
                            href="/orders"
                            role="menuitem"
                            className="font-graphik flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium hover:bg-neutral-800 hover:text-white"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Compass className="h-4 w-4 text-neutral-300" /> My Orders
                          </Link>
                        </>
                      ) : (
                        <Link
                          href="/dashboard"
                          role="menuitem"
                          className="font-graphik flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium hover:bg-neutral-800 hover:text-white"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Compass className="h-4 w-4 text-neutral-300" /> Dashboard
                        </Link>
                      )}

                      <hr className="my-1 border-neutral-800" />
                      <form action={signOutAction} className="w-full">
                        <button
                          type="submit"
                          role="menuitem"
                          className="font-graphik flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-semibold text-red-400 hover:bg-neutral-800"
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
                  className="font-graphik flex h-9 items-center justify-center rounded-full bg-white px-4 text-xs font-bold text-black shadow-xs transition-colors hover:bg-neutral-200"
                >
                  Login
                </Link>
              )}

              {/* Mobile Drawer Toggle */}
              <button
                onClick={() => setIsOpen(true)}
                aria-label="Open Menu"
                aria-expanded={isOpen}
                aria-controls="mobile-drawer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-300 hover:bg-neutral-800 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Inline mobile search row — expands under the main bar instead of
              forcing users into the full drawer just to search. */}
          <div
            id="mobile-search-row"
            className={`overflow-hidden px-4 transition-[max-height,opacity] duration-300 ease-out sm:px-6 md:hidden ${
              showMobileSearch ? "mt-3 max-h-14 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                ref={mobileSearchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products or makers..."
                className="w-full rounded-full border border-neutral-800 bg-neutral-900 py-2.5 pr-4 pl-10 text-xs text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none"
              />
            </form>
          </div>
        </div>

        {/* SECONDARY NAVIGATION BAR */}
        <div className="hidden border-b border-[#E5E5E0] bg-[#FAF7F0] md:block">
          <div className="mx-auto flex max-w-[1280px] items-center px-4 lg:px-8">
            <nav aria-label="Main navigation" className="w-full">
              <ul className="font-graphik flex items-center gap-x-8 py-2.5 text-sm font-medium tracking-wide whitespace-nowrap text-neutral-900">
                {/* Home */}
                <li className="relative py-0.5">
                  <Link
                    href="/"
                    className={`transition-colors hover:text-black ${
                      pathname === "/" ? "font-bold text-black" : ""
                    }`}
                  >
                    Home
                  </Link>
                </li>

                {/* COLLECTIONS DROPDOWN — now shows category thumbnails */}
                <li ref={collectionsMenuRef} className="relative py-0.5">
                  <button
                    type="button"
                    onClick={() => setShowCollectionsDropdown(!showCollectionsDropdown)}
                    aria-expanded={showCollectionsDropdown}
                    aria-haspopup="true"
                    aria-controls="collections-menu"
                    className={`flex cursor-pointer items-center gap-1 transition-colors hover:text-black ${
                      pathname === "/discover" ? "font-bold text-black" : ""
                    }`}
                  >
                    <span>Collections</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-neutral-700 transition-transform ${
                        showCollectionsDropdown ? "rotate-180 text-black" : ""
                      }`}
                    />
                  </button>

                  {showCollectionsDropdown && (
                    <div
                      id="collections-menu"
                      role="menu"
                      className="animate-in fade-in-50 slide-in-from-top-2 absolute left-0 z-50 mt-2 w-[640px] rounded-2xl border border-neutral-300 bg-[#FAF7F0] p-4 shadow-2xl"
                    >
                      <div className="grid grid-cols-2 gap-2.5">
                        {categoriesList.map((cat) => (
                          <Link
                            key={cat.name}
                            href={cat.href}
                            role="menuitem"
                            onClick={() => setShowCollectionsDropdown(false)}
                            className="group flex items-center gap-3 rounded-xl border border-neutral-200/80 bg-white p-2.5 transition-all hover:border-black hover:bg-white hover:shadow-md"
                          >
                            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                              <Image
                                src={cat.image}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="44px"
                              />
                            </div>
                            <div className="flex min-w-0 flex-col justify-center">
                              <div className="flex items-center gap-1.5">
                                <span className="font-graphik truncate text-xs font-bold text-neutral-900 group-hover:text-black">
                                  {cat.name}
                                </span>
                                {cat.badge && (
                                  <span className="font-graphik shrink-0 rounded-full border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 text-[9px] font-bold text-neutral-800">
                                    {cat.badge}
                                  </span>
                                )}
                              </div>
                              <span className="font-graphik mt-0.5 line-clamp-1 text-[11px] text-neutral-500 group-hover:text-neutral-800">
                                {cat.desc}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <Link
                        href="/discover"
                        role="menuitem"
                        onClick={() => setShowCollectionsDropdown(false)}
                        className="font-graphik mt-3 flex items-center justify-center rounded-xl border border-neutral-900 bg-neutral-900 py-2 text-xs font-bold text-white transition-colors hover:bg-black"
                      >
                        View full catalog
                      </Link>
                    </div>
                  )}
                </li>

                {/* Factory Reels */}
                <li className="relative py-0.5">
                  <Link
                    href="/discover?reels=true"
                    className={`transition-colors hover:text-black ${
                      pathname.includes("reels") ? "font-bold text-black" : ""
                    }`}
                  >
                    Live Factory Reels
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
        <div id="mobile-drawer" className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col justify-between overflow-y-auto border-l border-neutral-800 bg-[#0B0B0B] p-6 text-white shadow-2xl">
            <div>
              <div className="mb-6 flex items-center justify-between border-b border-neutral-800 pb-4">
                <Link
                  href="/"
                  className="flex items-center gap-2.5"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="relative h-8 w-8 overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900">
                    <Image
                      src="/logo.png"
                      alt="GenZ Logo"
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                  <span className="font-nantes text-xl font-bold text-white">
                    Gen<span className="text-amber-400">Z</span>
                  </span>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                  className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative mb-6">
                <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products or makers..."
                  className="w-full rounded-full border border-neutral-800 bg-neutral-900 py-2.5 pr-4 pl-10 text-xs text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none"
                />
              </form>

              {/* Mobile Navigation Links */}
              <nav className="font-graphik flex flex-col gap-1 text-xs font-semibold text-neutral-300">
                <Link
                  href="/"
                  className="rounded-xl px-3 py-2.5 hover:bg-neutral-800 hover:text-amber-400"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>

                <div className="my-1 border-t border-neutral-800 pt-2">
                  <p className="mb-2 px-3 text-[10px] font-bold tracking-wider text-amber-400 uppercase">
                    Collections & Categories
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {categoriesList.slice(0, 6).map((cat) => (
                      <Link
                        key={cat.name}
                        href={cat.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                      >
                        <div className="relative h-6 w-6 overflow-hidden rounded-md border border-neutral-800 bg-neutral-900">
                          <Image
                            src={cat.image}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="24px"
                          />
                        </div>
                        <span>{cat.name}</span>
                      </Link>
                    ))}
                    <Link
                      href="/discover"
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-1.5 text-[11px] font-bold text-amber-400 hover:underline"
                    >
                      + View All Collections
                    </Link>
                  </div>
                </div>

                <Link
                  href="/discover?reels=true"
                  className="rounded-xl px-3 py-2.5 hover:bg-neutral-800 hover:text-amber-400"
                  onClick={() => setIsOpen(false)}
                >
                  Live Factory Reels
                </Link>

                <Link
                  href="/about"
                  className="rounded-xl px-3 py-2.5 hover:bg-neutral-800 hover:text-amber-400"
                  onClick={() => setIsOpen(false)}
                >
                  About Us
                </Link>

                <Link
                  href="/contact"
                  className="rounded-xl px-3 py-2.5 hover:bg-neutral-800 hover:text-amber-400"
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </Link>
              </nav>
            </div>

            {/* Mobile Actions */}
            <div className="mt-6 border-t border-neutral-800 pt-4">
              <Button
                asChild
                className="font-graphik mb-2 w-full rounded-xl bg-amber-400 text-xs font-bold text-black hover:bg-amber-300"
              >
                <Link href="/seller/signup" onClick={() => setIsOpen(false)}>
                  Sell on GenZ
                </Link>
              </Button>
              {isLoggedIn ? (
                <Button
                  asChild
                  variant="outline"
                  className="font-graphik w-full rounded-xl border-neutral-700 bg-neutral-900 text-xs font-semibold text-white hover:bg-neutral-800"
                >
                  <Link href="/profile" onClick={() => setIsOpen(false)}>
                    My Profile
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  className="font-graphik w-full rounded-xl border-neutral-700 bg-neutral-900 text-xs font-semibold text-white hover:bg-neutral-800 hover:text-amber-400"
                >
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    Login / Sign Up
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
