"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  Search,
  Heart,
  ShoppingCart,
  HelpCircle,
  Store,
  Package,
  Clock,
  ArrowRight,
  Sparkles,
  Loader2,
  Tag,
  Flame,
} from "lucide-react";
import { Button, UserAvatar } from "@genz/ui";
import { ADMIN_URL, SELLER_URL } from "@genz/utils";
import { formatInr } from "@/features/products/lib/products";

interface HeaderProps {
  isLoggedIn: boolean;
  role?: string;
  userName?: string;
  avatarUrl?: string | null;
  signOutAction: () => void;
}

interface ProductSearchResult {
  id: string;
  name: string;
  category: string;
  price_inr: number | null;
  image_url: string | null;
}

interface SearchResponse {
  products: ProductSearchResult[];
  categories: string[];
  totalCount: number;
}

const categoriesList = [
  {
    name: "Etikoppaka Wooden Toys",
    href: "/discover?category=Etikoppaka Wooden Toys",
    image: "/etikoppaka_toys.png",
    desc: "GI-certified eco-friendly lacquer wooden toys from Andhra Pradesh",
  },
  {
    name: "Kondapalli Toys",
    href: "/discover?category=Kondapalli Toys",
    image: "/cat_kondapalli.jpg",
    desc: "Lightweight Tella Poniki wood toys depicting Indian folklore & village life",
  },
];

const trendingKeywords = [
  "Etikoppaka Wooden Toys",
  "Kondapalli Toys",
  "GI Certified",
  "Lacquerware",
  "Eco-friendly Toys",
  "Handmade Decor",
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const userMenuRef = useRef<HTMLDivElement>(null);
  const collectionsMenuRef = useRef<HTMLLIElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);
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

  // Load recent searches from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem("genz_recent_searches");
        if (stored) {
          setRecentSearches(JSON.parse(stored));
        }
      } catch {}
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Collapse announcement bar on scroll
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 24);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (collectionsMenuRef.current && !collectionsMenuRef.current.contains(target)) {
        setShowCollectionsDropdown(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setIsSearchOpen(false);
      }
      if (
        mobileSearchContainerRef.current &&
        !mobileSearchContainerRef.current.contains(target)
      ) {
        setIsMobileSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Escape key handler
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setShowUserMenu(false);
      setShowCollectionsDropdown(false);
      setIsSearchOpen(false);
      setIsMobileSearchOpen(false);
      setIsOpen(false);
      searchInputRef.current?.blur();
      mobileSearchInputRef.current?.blur();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Close overlays on navigation - adjusting state during render avoids cascading effect renders
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setShowUserMenu(false);
    setShowCollectionsDropdown(false);
    setIsSearchOpen(false);
    setIsMobileSearchOpen(false);
    setIsOpen(false);
  }

  // Lock scroll while mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Live debounced search API query
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      const timer = setTimeout(() => {
        setSearchResults(null);
        setIsSearching(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Search query error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const saveRecentSearch = useCallback((term: string) => {
    const clean = term.trim();
    if (!clean) return;
    try {
      const existing: string[] = JSON.parse(
        localStorage.getItem("genz_recent_searches") || "[]"
      );
      const filtered = [
        clean,
        ...existing.filter((s) => s.toLowerCase() !== clean.toLowerCase()),
      ].slice(0, 6);
      localStorage.setItem("genz_recent_searches", JSON.stringify(filtered));
      setRecentSearches(filtered);
    } catch {}
  }, []);

  const removeRecentSearch = (termToRemove: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const existing: string[] = JSON.parse(
        localStorage.getItem("genz_recent_searches") || "[]"
      );
      const filtered = existing.filter((s) => s !== termToRemove);
      localStorage.setItem("genz_recent_searches", JSON.stringify(filtered));
      setRecentSearches(filtered);
    } catch {}
  };

  const clearAllRecentSearches = () => {
    try {
      localStorage.removeItem("genz_recent_searches");
      setRecentSearches([]);
    } catch {}
  };

  function handleExecuteSearch(term: string) {
    const q = term.trim();
    if (!q) return;
    saveRecentSearch(q);
    setIsSearchOpen(false);
    setIsMobileSearchOpen(false);
    setIsOpen(false);
    router.push(`/discover?q=${encodeURIComponent(q)}`);
  }

  function handleSelectProduct(id: string, name: string) {
    saveRecentSearch(name);
    setIsSearchOpen(false);
    setIsMobileSearchOpen(false);
    setIsOpen(false);
    router.push(`/products/${id}`);
  }

  function handleSelectCategory(cat: string) {
    saveRecentSearch(cat);
    setIsSearchOpen(false);
    setIsMobileSearchOpen(false);
    setIsOpen(false);
    router.push(`/discover?category=${encodeURIComponent(cat)}`);
  }

  const renderSearchDropdownContent = () => (
    <>
      {/* STATE 1: User has typed a query */}
      {searchQuery.trim().length > 0 ? (
        <div className="space-y-4">
          {/* Category Matches */}
          {searchResults?.categories && searchResults.categories.length > 0 && (
            <div>
              <p className="font-graphik mb-2 text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                Matched Categories
              </p>
              <div className="flex flex-wrap gap-2">
                {searchResults.categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className="group inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-800 transition-colors hover:border-amber-400 hover:bg-amber-50/50 hover:text-amber-900"
                  >
                    <Tag className="h-3.5 w-3.5 text-amber-600" />
                    <span>{cat}</span>
                    <ArrowRight className="h-3 w-3 text-neutral-400 group-hover:text-amber-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Products */}
          {searchResults?.products && searchResults.products.length > 0 ? (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="font-graphik text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                  Products ({searchResults.totalCount})
                </p>
                <button
                  type="button"
                  onClick={() => handleExecuteSearch(searchQuery)}
                  className="font-graphik text-xs font-semibold text-amber-700 hover:underline"
                >
                  View all results &rarr;
                </button>
              </div>

              <div className="space-y-1.5">
                {searchResults.products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectProduct(p.id, p.name)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-2 text-left transition-all hover:border-neutral-300 hover:bg-neutral-100"
                  >
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                      {p.image_url ? (
                        <Image
                          src={p.image_url}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="44px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-400">
                          <Package className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-graphik truncate text-xs font-semibold text-neutral-900 group-hover:text-amber-700">
                        {p.name}
                      </h4>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="font-graphik rounded-full bg-neutral-200/80 px-2 py-0.5 text-[10px] font-medium text-neutral-700">
                          {p.category}
                        </span>
                        <span className="font-graphik text-xs font-bold text-amber-700">
                          {formatInr(p.price_inr)}
                        </span>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-700" />
                  </button>
                ))}
              </div>
            </div>
          ) : !isSearching && searchResults ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                <Search className="h-5 w-5" />
              </div>
              <h4 className="font-graphik text-xs font-semibold text-neutral-900 sm:text-sm">
                No direct matches found for &ldquo;{searchQuery}&rdquo;
              </h4>
              <p className="font-graphik mt-1 text-[11px] text-neutral-500">
                Try searching for &ldquo;toys&rdquo;, &ldquo;wood&rdquo;, or
                &ldquo;etikoppaka&rdquo;
              </p>
              <button
                type="button"
                onClick={() => handleExecuteSearch("")}
                className="font-graphik mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3.5 py-1 text-xs font-bold text-black hover:bg-amber-300"
              >
                Browse All Products
              </button>
            </div>
          ) : null}

          {/* Submit Button Bar */}
          {searchResults?.products && searchResults.products.length > 0 && (
            <div className="border-t border-neutral-200 pt-3">
              <button
                type="button"
                onClick={() => handleExecuteSearch(searchQuery)}
                className="font-graphik flex w-full items-center justify-between rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-bold text-black transition-colors hover:bg-amber-300"
              >
                <span>View all results for &ldquo;{searchQuery}&rdquo;</span>
                <kbd className="rounded border border-black/20 bg-black/10 px-1.5 py-0.5 text-[10px]">
                  ENTER ↵
                </kbd>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* STATE 2: Input is empty — Show Recent, Trending & Categories */
        <div className="space-y-4">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="font-graphik text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                  Recent Searches
                </p>
                <button
                  type="button"
                  onClick={clearAllRecentSearches}
                  className="font-graphik text-[10px] text-neutral-500 hover:text-neutral-700"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    onClick={() => handleExecuteSearch(term)}
                    className="group inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-200 hover:text-neutral-900"
                  >
                    <Clock className="h-3 w-3 text-neutral-400" />
                    <span>{term}</span>
                    <button
                      type="button"
                      onClick={(e) => removeRecentSearch(term, e)}
                      className="ml-0.5 rounded-full p-0.5 text-neutral-400 hover:bg-neutral-300/80 hover:text-neutral-900"
                      aria-label={`Remove ${term}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <p className="font-graphik text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                Trending Searches
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {trendingKeywords.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleExecuteSearch(tag)}
                  className="font-graphik rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 transition-all hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Curated Categories */}
          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <p className="font-graphik text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                Featured Craft Traditions
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {categoriesList.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleSelectCategory(cat.name)}
                  className="group flex items-center gap-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50 p-2 text-left transition-colors hover:border-neutral-300 hover:bg-neutral-100"
                >
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-graphik truncate text-xs font-semibold text-neutral-900 group-hover:text-amber-700">
                      {cat.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-50 w-full shadow-md select-none">
        {/* TOP ANNOUNCEMENT BAR — Collapses smoothly on scroll          */}
        <div
          className={`overflow-hidden bg-[#050505] text-neutral-300 transition-[max-height,opacity] duration-300 ease-out ${
            scrolled
              ? "pointer-events-none max-h-0 opacity-0"
              : "max-h-9 border-b border-neutral-800/80 opacity-100"
          }`}
        >
          <div className="font-graphik mx-auto flex h-9 max-w-[1360px] items-center justify-between px-4 text-[10px] tracking-wide sm:px-6 sm:text-[11px] lg:px-8">
            <div className="flex items-center gap-2 truncate sm:gap-3">
              <span className="inline-flex items-center gap-1.5 truncate font-medium text-white">
                <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-amber-400" />
                <span className="truncate">Made in India Marketplace</span>
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-3 text-neutral-300 sm:gap-5">
              <Link
                href="/seller/signup"
                className="text-[10px] font-semibold text-white transition-colors hover:text-neutral-300 hover:underline sm:text-xs"
              >
                Sell on GenZ
              </Link>
              <span className="text-neutral-700">|</span>
              <Link
                href="/contact"
                className="text-[10px] transition-colors hover:text-white sm:text-xs"
              >
                Support
              </Link>
            </div>
          </div>
        </div>

        {/* MAIN TIER: Dark Bar with GenZ Brand & Actions               */}
        <div className="border-b border-neutral-800 bg-[#121212] text-white">
          <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            {/* Left: Authentic GenZ Brand Logo */}
            <Link
              id="genz-logo-link"
              aria-label="Go to GenZ homepage"
              className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-90"
              href="/"
            >
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900 shadow-sm sm:h-10 sm:w-10">
                <Image
                  src="/logo.png"
                  alt="GenZ Logo"
                  fill
                  className="object-cover"
                  sizes="40px"
                  priority
                />
              </div>
              <span className="font-nantes flex items-center text-xl leading-none font-bold tracking-tight text-white sm:text-2xl">
                Gen<span className="text-amber-400">Z</span>
              </span>
            </Link>

            {/* Center: DIRECT SEARCH BAR (Desktop & Tablet) - Full Width */}
            <div
              ref={searchContainerRef}
              className="relative mx-4 hidden flex-1 items-center md:flex lg:mx-8"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleExecuteSearch(searchQuery);
                }}
                className="relative flex w-full items-center rounded-full border border-neutral-300 bg-white shadow-xs transition-all duration-200 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 hover:border-neutral-400"
              >
                <div className="pointer-events-none flex h-9 w-9 shrink-0 items-center justify-center pl-1 text-neutral-500">
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                  ) : (
                    <Search className="h-4 w-4 text-neutral-500" />
                  )}
                </div>

                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Search products, GI crafts, verified master artisans..."
                  className="font-graphik w-full bg-transparent px-2 text-xs text-neutral-900 placeholder-neutral-500 focus:outline-none lg:text-sm [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                />

                <div className="flex shrink-0 items-center gap-1.5 pr-1.5">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults(null);
                        searchInputRef.current?.focus();
                      }}
                      className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                      aria-label="Clear query"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}

                  <button
                    type="submit"
                    aria-label="Submit search"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-black transition-colors hover:bg-amber-300"
                  >
                    <Search className="h-3.5 w-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </form>

              {/* Suggestions Dropdown (Light Theme) */}
              {isSearchOpen && (
                <div className="animate-in fade-in-50 slide-in-from-top-1 absolute top-full right-0 left-0 z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-4 text-neutral-900 shadow-2xl backdrop-blur-md select-none">
                  {renderSearchDropdownContent()}
                </div>
              )}
            </div>

            {/* Right: Actions (Wishlist, Account, Cart) */}
            <div className="flex shrink-0 items-center gap-4 sm:gap-6 lg:gap-7">
              {/* Wishlist Link */}
              <Link
                href="/wishlist"
                className="hidden items-center gap-1.5 text-sm font-medium text-neutral-300 transition-colors hover:text-white sm:flex"
                aria-label={`Wishlist, ${wishlistCount} saved items`}
              >
                <Heart className="h-4 w-4 stroke-[2]" />
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="font-graphik ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-black">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account Dropdown */}
              <div className="relative" ref={userMenuRef}>
                {isLoggedIn ? (
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    aria-label="User Account"
                    aria-expanded={showUserMenu}
                    aria-haspopup="true"
                    className="flex cursor-pointer items-center gap-2 rounded-full py-1 text-sm font-medium text-neutral-300 transition-colors hover:text-white"
                  >
                    <UserAvatar name={userName} avatarUrl={avatarUrl} size={24} />
                    <span className="hidden sm:inline">Account</span>
                    <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    aria-label="Account Menu"
                    aria-expanded={showUserMenu}
                    aria-haspopup="true"
                    className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-neutral-300 transition-colors hover:text-white"
                  >
                    <User className="h-4 w-4 stroke-[2]" />
                    <span className="hidden sm:inline">Account</span>
                  </button>
                )}

                {showUserMenu && (
                  <div
                    role="menu"
                    className="animate-in fade-in-50 slide-in-from-top-2 absolute right-0 z-50 mt-3 w-56 rounded-2xl border border-neutral-800 bg-[#18181b] py-2 text-white shadow-2xl"
                  >
                    {isLoggedIn ? (
                      <>
                        <div className="border-b border-neutral-800 px-4 py-2.5">
                          <p className="font-graphik text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                            Signed in as
                          </p>
                          <p className="font-graphik truncate text-xs font-bold text-white">
                            {userName || role || "User"}
                          </p>
                        </div>

                        {role === "admin" ? (
                          <a
                            href={`${ADMIN_URL}/dashboard`}
                            role="menuitem"
                            className="font-graphik flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Compass className="h-4 w-4 text-amber-400" />
                            Studio Control Center
                          </a>
                        ) : role === "seller" ? (
                          <a
                            href={`${SELLER_URL}/dashboard`}
                            role="menuitem"
                            className="font-graphik flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Compass className="h-4 w-4 text-amber-400" />
                            Seller Dashboard
                          </a>
                        ) : (
                          <>
                            <Link
                              href="/profile"
                              role="menuitem"
                              className="font-graphik flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <User className="h-4 w-4 text-neutral-400" />
                              Profile Settings
                            </Link>
                            <Link
                              href="/orders"
                              role="menuitem"
                              className="font-graphik flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Package className="h-4 w-4 text-neutral-400" />
                              My Orders
                            </Link>
                          </>
                        )}

                        <hr className="my-1 border-neutral-800" />
                        <form action={signOutAction} className="w-full">
                          <button
                            type="submit"
                            role="menuitem"
                            className="font-graphik flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs font-semibold text-rose-400 hover:bg-neutral-800"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </form>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2">
                          <p className="font-graphik text-xs font-semibold text-neutral-200">
                            Welcome to GenZ
                          </p>
                          <p className="font-graphik text-[11px] text-neutral-500">
                            Sign in to track orders &amp; saved crafts
                          </p>
                        </div>
                        <div className="px-3 py-1.5">
                          <Button
                            asChild
                            className="font-graphik h-8 w-full rounded-lg bg-amber-400 text-xs font-bold text-black hover:bg-amber-300"
                          >
                            <Link href="/login" onClick={() => setShowUserMenu(false)}>
                              Sign In
                            </Link>
                          </Button>
                        </div>
                        <div className="px-3 pb-1.5">
                          <Button
                            asChild
                            variant="outline"
                            className="font-graphik h-8 w-full rounded-lg border-neutral-700 bg-neutral-900 text-xs font-medium text-white hover:bg-neutral-800"
                          >
                            <Link href="/signup" onClick={() => setShowUserMenu(false)}>
                              Create Account
                            </Link>
                          </Button>
                        </div>
                        <hr className="my-1 border-neutral-800" />
                        <Link
                          href="/seller/signup"
                          role="menuitem"
                          onClick={() => setShowUserMenu(false)}
                          className="font-graphik flex items-center gap-2 px-4 py-2 text-xs font-medium text-amber-400 hover:bg-neutral-800"
                        >
                          <Store className="h-3.5 w-3.5" />
                          <span>Sell on GenZ</span>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Icon with Orange Badge */}
              <Link
                href="/cart"
                aria-label={`Shopping cart with ${cartCount} items`}
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
              >
                <ShoppingCart className="h-5 w-5 stroke-[1.8]" />
                <span className="font-graphik absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f59e0b] px-1 text-[10px] font-bold text-black shadow-xs">
                  {cartCount}
                </span>
              </Link>

              {/* Mobile Drawer Hamburger */}
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label="Open Navigation Menu"
                className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-300 hover:bg-neutral-800 hover:text-white md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mobile Direct Search Bar Strip (Light Theme) */}
          <div className="block border-t border-neutral-800/80 bg-[#121212] px-4 py-2.5 md:hidden">
            <div ref={mobileSearchContainerRef} className="relative w-full">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleExecuteSearch(searchQuery);
                }}
                className="relative flex w-full items-center rounded-full border border-neutral-300 bg-white shadow-xs focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20"
              >
                <div className="pointer-events-none flex h-8 w-8 shrink-0 items-center justify-center pl-1 text-neutral-500">
                  {isSearching ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
                  ) : (
                    <Search className="h-3.5 w-3.5 text-neutral-500" />
                  )}
                </div>

                <input
                  ref={mobileSearchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsMobileSearchOpen(true);
                  }}
                  onFocus={() => setIsMobileSearchOpen(true)}
                  placeholder="Search products, GI crafts..."
                  className="font-graphik w-full bg-transparent px-2 text-xs text-neutral-900 placeholder-neutral-500 focus:outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                />

                <div className="flex shrink-0 items-center gap-1 pr-1.5">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults(null);
                        mobileSearchInputRef.current?.focus();
                      }}
                      className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                      aria-label="Clear query"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}

                  <button
                    type="submit"
                    aria-label="Submit search"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-black transition-colors hover:bg-amber-300"
                  >
                    <Search className="h-3 w-3 stroke-[2.5]" />
                  </button>
                </div>
              </form>

              {/* Mobile Suggestions Dropdown (Light Theme) */}
              {isMobileSearchOpen && (
                <div className="animate-in fade-in-50 slide-in-from-top-1 absolute top-full right-0 left-0 z-50 mt-2 max-h-[60vh] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-4 text-neutral-900 shadow-2xl select-none">
                  {renderSearchDropdownContent()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* BOTTOM TIER: Clean White Bar with Category Links             */}
        {/* ============================================================ */}
        <div className="hidden border-b border-[#E5E5E0] bg-white md:block">
          <div className="mx-auto flex h-12 max-w-[1360px] items-center px-4 sm:px-6 lg:px-8">
            <nav aria-label="Main Navigation" className="flex h-full items-center">
              <ul className="font-graphik m-0 flex h-full list-none items-center gap-8 p-0 text-[14px] font-medium text-neutral-800">
                {/* Home */}
                <li className="flex h-full items-center">
                  <Link
                    href="/"
                    className={`inline-flex items-center leading-none transition-colors hover:text-black ${
                      pathname === "/" ? "font-bold text-black" : ""
                    }`}
                  >
                    Home
                  </Link>
                </li>

                {/* Collections Dropdown */}
                <li
                  ref={collectionsMenuRef}
                  className="relative flex h-full items-center"
                >
                  <button
                    type="button"
                    onClick={() => setShowCollectionsDropdown((v) => !v)}
                    onMouseEnter={() => setShowCollectionsDropdown(true)}
                    className="inline-flex cursor-pointer items-center gap-1.5 leading-none transition-colors hover:text-black"
                    aria-expanded={showCollectionsDropdown}
                    aria-haspopup="true"
                  >
                    <span>Collections</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 shrink-0 text-neutral-500 transition-transform duration-200 ${
                        showCollectionsDropdown ? "rotate-180 text-black" : ""
                      }`}
                    />
                  </button>

                  {showCollectionsDropdown && (
                    <div
                      onMouseLeave={() => setShowCollectionsDropdown(false)}
                      className="animate-in fade-in-50 slide-in-from-top-1 absolute top-full left-0 z-50 mt-1 w-[560px] rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="font-graphik text-xs font-bold tracking-wider text-neutral-400 uppercase">
                          GI-Certified Heritage
                        </span>
                        <Link
                          href="/discover"
                          onClick={() => setShowCollectionsDropdown(false)}
                          className="font-graphik text-xs font-semibold text-amber-700 hover:underline"
                        >
                          View all
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {categoriesList.map((cat) => (
                          <Link
                            key={cat.name}
                            href={cat.href}
                            onClick={() => setShowCollectionsDropdown(false)}
                            className="group flex items-start gap-3 rounded-xl border border-neutral-200/80 p-3 transition-all hover:border-black hover:bg-neutral-50 hover:shadow-xs"
                          >
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                              <Image
                                src={cat.image}
                                alt={cat.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="48px"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-graphik truncate text-xs font-bold text-neutral-900 group-hover:text-black">
                                  {cat.name}
                                </span>
                              </div>
                              <p className="font-graphik mt-1 line-clamp-2 text-[11px] leading-tight text-neutral-500">
                                {cat.desc}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </li>

                {/* Live Factory Reels */}
                <li className="flex h-full items-center">
                  <Link
                    href="/discover?reels=true"
                    className={`inline-flex items-center leading-none transition-colors hover:text-black ${
                      pathname.includes("reels") ? "font-bold text-black" : ""
                    }`}
                  >
                    Factory Reels
                  </Link>
                </li>

                {/* About Us */}
                <li className="flex h-full items-center">
                  <Link
                    href="/about"
                    className={`inline-flex items-center leading-none transition-colors hover:text-black ${
                      pathname === "/about" ? "font-bold text-black" : ""
                    }`}
                  >
                    About Us
                  </Link>
                </li>

                {/* Contact */}
                <li className="flex h-full items-center">
                  <Link
                    href="/contact"
                    className={`inline-flex items-center leading-none transition-colors hover:text-black ${
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

      {/* MOBILE DRAWER                                               */}
      {isOpen && (
        <div id="mobile-drawer" className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col justify-between overflow-y-auto border-l border-neutral-800 bg-[#121212] p-6 text-white shadow-2xl">
            <div>
              {/* Header inside drawer */}
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

              {/* Mobile Quick Search Bar (Light Theme) */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleExecuteSearch(searchQuery);
                }}
                className="font-graphik relative mb-6 flex w-full items-center rounded-full border border-neutral-300 bg-white py-1.5 pr-1.5 pl-3.5 shadow-xs focus-within:border-amber-400"
              >
                <Search className="h-4 w-4 shrink-0 text-neutral-500" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products & crafts..."
                  className="w-full bg-transparent px-2.5 text-xs text-neutral-900 placeholder-neutral-500 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-black hover:bg-amber-300"
                >
                  <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>
              </form>

              {/* Navigation Links */}
              <nav className="font-graphik flex flex-col gap-1 text-neutral-200">
                <Link
                  href="/"
                  className="rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors hover:bg-neutral-800 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>

                <div className="my-1 border-t border-neutral-800 pt-3">
                  <p className="mb-2 px-3.5 text-xs font-bold tracking-wider text-amber-400 uppercase">
                    Curated Collections
                  </p>
                  <div className="space-y-1">
                    {categoriesList.map((cat) => (
                      <Link
                        key={cat.name}
                        href={cat.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3.5 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
                      >
                        <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md bg-neutral-800">
                          <Image
                            src={cat.image}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="24px"
                          />
                        </div>
                        <span className="truncate">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  href="/discover?reels=true"
                  className="rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors hover:bg-neutral-800 hover:text-amber-400"
                  onClick={() => setIsOpen(false)}
                >
                  Live Factory Reels
                </Link>

                <Link
                  href="/about"
                  className="rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors hover:bg-neutral-800 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  About Us
                </Link>

                <Link
                  href="/contact"
                  className="rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors hover:bg-neutral-800 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </Link>

                <div className="my-1 border-t border-neutral-800 pt-3">
                  <p className="mb-2 px-3.5 text-xs font-bold tracking-wider text-neutral-400 uppercase">
                    Customer Care
                  </p>
                  <Link
                    href="/faqs"
                    className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    <HelpCircle className="h-4 w-4 text-neutral-400" />
                    Support &amp; FAQs
                  </Link>
                  <Link
                    href="/wishlist"
                    className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    <Heart className="h-4 w-4 text-neutral-400" />
                    Wishlist ({wishlistCount})
                  </Link>
                </div>
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 border-t border-neutral-800 pt-4">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <Link
                    href={
                      role === "admin"
                        ? `${ADMIN_URL}/dashboard`
                        : role === "seller"
                          ? `${SELLER_URL}/dashboard`
                          : "/profile"
                    }
                    onClick={() => setIsOpen(false)}
                    className="font-graphik flex h-10 w-full items-center justify-center rounded-xl bg-neutral-800 text-xs font-bold text-white transition-colors hover:bg-neutral-700"
                  >
                    {role === "admin"
                      ? "Studio Portal"
                      : role === "seller"
                        ? "Seller Dashboard"
                        : "My Profile"}
                  </Link>
                  <form action={signOutAction} className="w-full">
                    <button
                      type="submit"
                      className="font-graphik flex h-10 w-full items-center justify-center rounded-xl border border-neutral-800 bg-transparent text-xs font-semibold text-rose-400 hover:bg-neutral-900"
                    >
                      Logout
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    asChild
                    className="font-graphik h-10 flex-1 rounded-xl bg-amber-400 text-xs font-bold text-black hover:bg-amber-300"
                  >
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="font-graphik h-10 flex-1 rounded-xl border-neutral-700 bg-neutral-900 text-xs font-semibold text-white hover:bg-neutral-800"
                  >
                    <Link href="/signup" onClick={() => setIsOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
