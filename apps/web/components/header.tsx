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
  Package,
  Clock,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { UserAvatar } from "@genz/ui";
import { ADMIN_URL, SELLER_URL } from "@genz/utils";
import { formatInr } from "@genz/utils/products";

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

const COLLECTIONS = [
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
    desc: "Lightweight Tella Poniki wood toys depicting Indian folklore and village life",
  },
];

const TRENDING = [
  "Etikoppaka Wooden Toys",
  "Kondapalli Toys",
  "GI Certified",
  "Lacquerware",
  "Eco-friendly Toys",
  "Handmade Decor",
];

const NAV = [
  { name: "Home", href: "/", match: (p: string) => p === "/" },
  { name: "Factory Reels", href: "/discover?reels=true", match: (p: string) => p.includes("reels") },
  { name: "About us", href: "/about", match: (p: string) => p === "/about" },
  { name: "Contact", href: "/contact", match: (p: string) => p === "/contact" },
];

const RECENT_KEY = "genz_recent_searches";

// Same focus ring the Contact page uses (black ring on the cream page)
const focusRing =
  "focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-cream-paper focus-visible:outline-none";

// Focus ring for elements that sit on the black announcement bar
const focusRingOnBlack =
  "focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none";

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

function useOutsideClick(ref: React.RefObject<HTMLElement | null>, onOutside: () => void) {
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [ref, onOutside]);
}

function useStoredCount(key: string, event: string, sum: (items: unknown[]) => number) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    function update() {
      try {
        const raw = localStorage.getItem(key);
        setCount(raw ? sum(JSON.parse(raw)) : 0);
      } catch {
        setCount(0);
      }
    }
    update();
    window.addEventListener(event, update);
    return () => window.removeEventListener(event, update);
  }, [key, event, sum]);
  return count;
}

const sumQuantities = (items: unknown[]) =>
  (items as { quantity: number }[]).reduce((a, i) => a + i.quantity, 0);
const countItems = (items: unknown[]) => items.length;

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

function SearchBox({
  placeholder,
  enableShortcut = false,
  className = "",
}: {
  placeholder: string;
  enableShortcut?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useOutsideClick(wrapRef, close);

  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"));
      } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
      if (enableShortcut && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [enableShortcut]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      const t = setTimeout(() => {
        setResults(null);
        setLoading(false);
      }, 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) setResults(await res.json());
      } catch (err) {
        console.error("Search query error:", err);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [query]);

  const saveRecent = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    try {
      const existing: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      const next = [clean, ...existing.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      setRecent(next);
    } catch {}
  };

  const removeRecent = (term: string) => {
    try {
      const next = recent.filter((s) => s !== term);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      setRecent(next);
    } catch {}
  };

  const clearRecent = () => {
    try {
      localStorage.removeItem(RECENT_KEY);
      setRecent([]);
    } catch {}
  };

  const go = (href: string, remember?: string) => {
    if (remember) saveRecent(remember);
    setOpen(false);
    router.push(href);
  };

  const runSearch = (term: string) => {
    const q = term.trim();
    go(q ? `/discover?q=${encodeURIComponent(q)}` : "/discover", q);
  };

  const hasQuery = query.trim().length > 0;
  const sectionTitle = "font-graphik text-ink-black text-sm font-semibold";
  const chip =
    "font-graphik border-ash text-ink-black hover:border-ink-black inline-flex items-center gap-1.5 rounded-full border bg-white px-3.5 py-1.5 text-sm transition-colors";
  const thumb = "border-ash relative shrink-0 overflow-hidden rounded-xl border bg-cream-paper";

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query);
        }}
        className="border-ash hover:border-smoke focus-within:border-ink-black flex h-11 w-full items-center rounded-full border bg-white pr-1.5 pl-4 transition-colors"
      >
        {loading ? (
          <Loader2 className="text-smoke h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
        ) : (
          <Search className="text-smoke h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          aria-label="Search products and crafts"
          className="font-graphik text-ink-black placeholder:text-smoke w-full bg-transparent px-3 text-sm focus:outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setResults(null);
              inputRef.current?.focus();
            }}
            className={`text-smoke hover:text-ink-black rounded-full p-1.5 ${focusRing}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="submit"
          aria-label="Search"
          className={`bg-brand-yellow hover:bg-brand-yellow-hover flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-black transition-colors ${focusRing}`}
        >
          <Search className="h-4 w-4" />
        </button>
      </form>

      {open && (
        <div className="border-ash text-ink-black absolute top-full right-0 left-0 z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border bg-white p-5 shadow-2xl">
          {hasQuery ? (
            <div className="space-y-6">
              {!!results?.categories?.length && (
                <div>
                  <h3 className={sectionTitle}>Categories</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {results.categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => go(`/discover?category=${encodeURIComponent(cat)}`, cat)}
                        className={chip}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results?.products?.length ? (
                <div>
                  <div className="flex items-baseline justify-between">
                    <h3 className={sectionTitle}>Products ({results.totalCount})</h3>
                    <button
                      type="button"
                      onClick={() => runSearch(query)}
                      className="font-graphik text-ink-black decoration-brand-yellow-dark text-sm font-medium underline decoration-2 underline-offset-4"
                    >
                      View all results
                    </button>
                  </div>
                  <ul className="divide-ash border-ash mt-3 divide-y border-y">
                    {results.products.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => go(`/products/${p.id}`, p.name)}
                          className="group flex w-full items-center gap-4 py-3 text-left"
                        >
                          <span className={`${thumb} h-12 w-12`}>
                            {p.image_url ? (
                              <Image src={p.image_url} alt="" fill sizes="48px" className="object-cover" />
                            ) : (
                              <span className="text-smoke flex h-full w-full items-center justify-center">
                                <Package className="h-4 w-4" aria-hidden="true" />
                              </span>
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="font-nantes text-ink-black block truncate text-lg leading-tight">
                              {p.name}
                            </span>
                            <span className="font-graphik text-smoke mt-0.5 block truncate text-sm">
                              {p.category}
                              {" · "}
                              {formatInr(p.price_inr)}
                            </span>
                          </span>
                          <ArrowUpRight
                            className="text-smoke group-hover:text-ink-black h-4 w-4 shrink-0"
                            aria-hidden="true"
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : !loading && results ? (
                <div className="py-4">
                  <p className="font-nantes text-ink-black text-2xl">Nothing found for “{query}”</p>
                  <p className="font-graphik text-smoke mt-2 text-sm leading-relaxed">
                    Try “toys”, “wood” or “etikoppaka”, or browse the full catalog.
                  </p>
                  <button
                    type="button"
                    onClick={() => runSearch("")}
                    className={`bg-brand-yellow hover:bg-brand-yellow-hover font-graphik mt-4 inline-flex h-10 items-center rounded-full px-6 text-sm font-semibold text-black transition-colors ${focusRing}`}
                  >
                    Browse all products
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-6">
              {recent.length > 0 && (
                <div>
                  <div className="flex items-baseline justify-between">
                    <h3 className={sectionTitle}>Recent searches</h3>
                    <button
                      type="button"
                      onClick={clearRecent}
                      className="font-graphik text-smoke hover:text-ink-black text-sm"
                    >
                      Clear all
                    </button>
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {recent.map((term) => (
                      <li key={term} className={`${chip} pr-2`}>
                        <button type="button" onClick={() => runSearch(term)} className="inline-flex items-center gap-1.5">
                          <Clock className="text-smoke h-3.5 w-3.5" aria-hidden="true" />
                          {term}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRecent(term)}
                          aria-label={`Remove ${term}`}
                          className="text-smoke hover:text-ink-black rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className={sectionTitle}>Popular searches</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {TRENDING.map((tag) => (
                    <li key={tag}>
                      <button type="button" onClick={() => runSearch(tag)} className={chip}>
                        {tag}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className={sectionTitle}>Craft traditions</h3>
                <ul className="divide-ash border-ash mt-3 divide-y border-y">
                  {COLLECTIONS.map((c) => (
                    <li key={c.name}>
                      <button
                        type="button"
                        onClick={() => go(`/discover?category=${encodeURIComponent(c.name)}`, c.name)}
                        className="group flex w-full items-center gap-4 py-3 text-left"
                      >
                        <span className={`${thumb} h-10 w-10`}>
                          <Image src={c.image} alt="" fill sizes="40px" className="object-cover" />
                        </span>
                        <span className="font-nantes text-ink-black flex-1 text-lg">{c.name}</span>
                        <ArrowUpRight className="text-smoke group-hover:text-ink-black h-4 w-4" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Header: three lines                                                 */
/*   1. Announcement + quick links (black strip)                       */
/*   2. Logo, search, actions                                          */
/*   3. Main navigation                                                */
/* ------------------------------------------------------------------ */

export function Header({ isLoggedIn, role, userName, avatarUrl, signOutAction }: HeaderProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);

  const cartCount = useStoredCount("genz-cart", "cart-updated", sumQuantities);
  const wishlistCount = useStoredCount("genz-wishlist", "wishlist-updated", countItems);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const collectionsRef = useRef<HTMLLIElement>(null);
  const closeUser = useCallback(() => setUserMenuOpen(false), []);
  const closeCollections = useCallback(() => setCollectionsOpen(false), []);
  useOutsideClick(userMenuRef, closeUser);
  useOutsideClick(collectionsRef, closeCollections);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setUserMenuOpen(false);
      setCollectionsOpen(false);
      setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setUserMenuOpen(false);
    setCollectionsOpen(false);
    setDrawerOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const dashboardHref =
    role === "admin" ? `${ADMIN_URL}/dashboard` : role === "seller" ? `${SELLER_URL}/dashboard` : null;
  const dashboardLabel = role === "admin" ? "Studio control center" : "Seller dashboard";

  const navLink = (active: boolean) =>
    `font-graphik hover:text-ink-black relative inline-flex h-full items-center text-sm font-medium transition-colors ${focusRing} ${
      active ? "text-ink-black" : "text-smoke"
    }`;
  const activeBar = (active: boolean) =>
    active ? <span aria-hidden="true" className="bg-brand-yellow-dark absolute inset-x-0 bottom-0 h-0.5" /> : null;

  const menuItem =
    "font-graphik text-ink-black hover:bg-cream-paper flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm";
  const iconButton = `text-ink-black hover:bg-white relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${focusRing}`;
  const badge =
    "font-graphik bg-brand-yellow absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-black";

  const wordmark = (size: string) => (
    <span className={`font-nantes text-ink-black tracking-tight ${size}`}>
      <span className="font-medium">Gen</span>
      <span className="text-brand-yellow-dark font-normal">Z</span>
    </span>
  );

  return (
    <>
      {/* LINE 1: announcement + quick links. Not sticky: it scrolls away with the page,
          so the sticky header below never changes height. Solid black for contrast. */}
      <div className="bg-black">
        <div className="font-graphik mx-auto flex h-9 max-w-7xl items-center justify-between px-6 text-xs text-neutral-300 sm:px-12">
          <p className="truncate">Made in India marketplace.</p>
          <div className="flex shrink-0 items-center gap-5">
            <Link
              href="/seller/signup"
              className={`text-brand-yellow rounded-sm font-medium hover:underline hover:underline-offset-4 ${focusRingOnBlack}`}
            >
              Sell on GenZ
            </Link>
            <Link href="/contact" className={`hidden rounded-sm hover:text-white sm:inline ${focusRingOnBlack}`}>
              Support
            </Link>
          </div>
        </div>
      </div>

      <header className="bg-cream-paper text-ink-black border-ash sticky top-0 z-50 w-full border-b">
        {/* LINE 2: logo, search, actions */}
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6 sm:px-12 lg:gap-10">
          <Link href="/" aria-label="GenZ home" className={`flex shrink-0 items-center gap-2.5 rounded-sm ${focusRing}`}>
            <span className="border-ash relative h-9 w-9 overflow-hidden rounded-full border bg-white">
              <Image src="/logo.png" alt="" fill sizes="36px" className="object-cover" priority />
            </span>
            {wordmark("text-2xl")}
          </Link>

          <SearchBox
            enableShortcut
            placeholder="Search products, GI crafts, makers"
            className="mx-auto hidden w-full max-w-xl flex-1 md:block"
          />

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <Link
              href="/wishlist"
              aria-label={`Wishlist, ${wishlistCount} saved items`}
              className={`${iconButton} hidden sm:flex`}
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
              {wishlistCount > 0 && <span className={badge}>{wishlistCount}</span>}
            </Link>

            <Link href="/cart" aria-label={`Shopping cart, ${cartCount} items`} className={iconButton}>
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              {cartCount > 0 && <span className={badge}>{cartCount}</span>}
            </Link>

            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-label="Account menu"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                className={iconButton}
              >
                {isLoggedIn ? (
                  <UserAvatar name={userName} avatarUrl={avatarUrl} size={28} />
                ) : (
                  <User className="h-5 w-5" aria-hidden="true" />
                )}
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className="border-ash absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border bg-white py-2 shadow-2xl"
                >
                  {isLoggedIn ? (
                    <>
                      <div className="border-ash border-b px-4 pt-1 pb-3">
                        <p className="font-graphik text-smoke text-xs">Signed in as</p>
                        <p className="font-nantes text-ink-black truncate text-xl">{userName || role || "User"}</p>
                      </div>

                      {dashboardHref ? (
                        <a href={dashboardHref} role="menuitem" className={menuItem}>
                          <Compass className="text-smoke h-4 w-4" aria-hidden="true" />
                          {dashboardLabel}
                        </a>
                      ) : (
                        <>
                          <Link href="/profile" role="menuitem" className={menuItem}>
                            <User className="text-smoke h-4 w-4" aria-hidden="true" />
                            Profile settings
                          </Link>
                          <Link href="/orders" role="menuitem" className={menuItem}>
                            <Package className="text-smoke h-4 w-4" aria-hidden="true" />
                            My orders
                          </Link>
                        </>
                      )}

                      <form action={signOutAction} className="border-ash mt-1 border-t pt-1">
                        <button type="submit" role="menuitem" className={`${menuItem} font-semibold text-rose-600`}>
                          <LogOut className="h-4 w-4" aria-hidden="true" />
                          Log out
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="px-4 pt-1 pb-2">
                      <p className="font-nantes text-ink-black text-xl">Welcome to GenZ</p>
                      <p className="font-graphik text-smoke mt-1 text-sm leading-snug">
                        Sign in to track orders and saved crafts.
                      </p>
                      <Link
                        href="/login"
                        className={`bg-brand-yellow hover:bg-brand-yellow-hover font-graphik mt-4 flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold text-black transition-colors ${focusRing}`}
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/signup"
                        className={`border-ash text-ink-black font-graphik mt-2 flex h-11 w-full items-center justify-center rounded-full border text-sm font-semibold transition-colors hover:bg-cream-paper ${focusRing}`}
                      >
                        Create account
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              className={`${iconButton} md:hidden`}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Search (mobile only, sits inside line 2's space) */}
        <div className="px-6 pb-3 md:hidden">
          <SearchBox placeholder="Search products, GI crafts" />
        </div>

        {/* LINE 3: main navigation (desktop) */}
        <nav aria-label="Main navigation" className="border-ash hidden border-t md:block">
          <ul className="m-0 mx-auto flex h-11 max-w-7xl list-none items-center gap-8 p-0 px-6 sm:px-12">
            <li className="h-full">
              <Link
                href={NAV[0].href}
                aria-current={NAV[0].match(pathname) ? "page" : undefined}
                className={navLink(NAV[0].match(pathname))}
              >
                {NAV[0].name}
                {activeBar(NAV[0].match(pathname))}
              </Link>
            </li>

            <li
              ref={collectionsRef}
              className="relative h-full"
              onMouseEnter={() => setCollectionsOpen(true)}
              onMouseLeave={() => setCollectionsOpen(false)}
            >
              <button
                type="button"
                onClick={() => setCollectionsOpen((v) => !v)}
                aria-expanded={collectionsOpen}
                aria-haspopup="true"
                className={`${navLink(false)} gap-1.5`}
              >
                Collections
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${collectionsOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {collectionsOpen && (
                <div className="absolute top-full left-0 z-50 w-[520px]">
                  <div className="border-ash rounded-2xl border bg-white p-6 shadow-2xl">
                    <div className="flex items-baseline justify-between">
                      <h2 className="font-graphik text-ink-black text-sm font-semibold">GI-certified heritage</h2>
                      <Link
                        href="/discover"
                        className="font-graphik text-ink-black decoration-brand-yellow-dark text-sm font-medium underline decoration-2 underline-offset-4"
                      >
                        View all
                      </Link>
                    </div>
                    <ul className="divide-ash border-ash mt-4 divide-y border-y">
                      {COLLECTIONS.map((c) => (
                        <li key={c.name}>
                          <Link href={c.href} className="group flex items-start gap-4 py-4">
                            <span className="border-ash relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border">
                              <Image src={c.image} alt="" fill sizes="56px" className="object-cover" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="font-nantes text-ink-black block text-xl leading-tight">{c.name}</span>
                              <span className="font-graphik text-smoke mt-1 block text-sm leading-snug">
                                {c.desc}
                              </span>
                            </span>
                            <span
                              aria-hidden="true"
                              className="border-ash text-ink-black group-hover:bg-brand-yellow group-hover:border-ink-black mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors"
                            >
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </li>

            {NAV.slice(1).map((item) => {
              const active = item.match(pathname);
              return (
                <li key={item.href} className="h-full">
                  <Link href={item.href} aria-current={active ? "page" : undefined} className={navLink(active)}>
                    {item.name}
                    {activeBar(active)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div id="mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigation" className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} aria-hidden="true" />

          <div className="bg-cream-paper text-ink-black border-ash no-scrollbar absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto border-l px-6 pb-8">
            <div className="flex h-16 shrink-0 items-center justify-between">
              {wordmark("text-2xl")}
              <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close menu" className={iconButton}>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Mobile navigation" className="mt-4">
              <ul className="divide-ash border-ash divide-y border-y">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={item.match(pathname) ? "page" : undefined}
                      className={`font-nantes text-ink-black block rounded-sm py-4 text-3xl font-normal ${focusRing}`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
                <li className="py-4">
                  <p className="font-graphik text-smoke text-sm">Collections</p>
                  <ul className="mt-3 space-y-3">
                    {COLLECTIONS.map((c) => (
                      <li key={c.name}>
                        <Link href={c.href} className="flex items-center gap-3">
                          <span className="border-ash relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border">
                            <Image src={c.image} alt="" fill sizes="40px" className="object-cover" />
                          </span>
                          <span className="font-nantes text-ink-black text-xl">{c.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>

              <ul className="font-graphik mt-6 space-y-3 text-sm">
                <li>
                  <Link href="/wishlist" className="text-ink-black flex items-center gap-2 font-medium">
                    <Heart className="text-smoke h-4 w-4" aria-hidden="true" />
                    Wishlist ({wishlistCount})
                  </Link>
                </li>
                <li>
                  <Link href="/faqs" className="text-ink-black font-medium">
                    Help center and FAQs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/seller/signup"
                    className="text-ink-black decoration-brand-yellow-dark font-medium underline decoration-2 underline-offset-4"
                  >
                    Sell on GenZ
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="mt-auto pt-8">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <Link
                    href={dashboardHref ?? "/profile"}
                    className={`bg-brand-yellow hover:bg-brand-yellow-hover font-graphik flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold text-black transition-colors ${focusRing}`}
                  >
                    {dashboardHref ? dashboardLabel : "My profile"}
                  </Link>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className={`font-graphik border-ash flex h-12 w-full items-center justify-center rounded-full border text-sm font-semibold text-rose-600 transition-colors hover:bg-white ${focusRing}`}
                    >
                      Log out
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    className={`bg-brand-yellow hover:bg-brand-yellow-hover font-graphik flex h-12 flex-1 items-center justify-center rounded-full text-sm font-semibold text-black transition-colors ${focusRing}`}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className={`font-graphik border-ash text-ink-black flex h-12 flex-1 items-center justify-center rounded-full border text-sm font-semibold transition-colors hover:bg-white ${focusRing}`}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}