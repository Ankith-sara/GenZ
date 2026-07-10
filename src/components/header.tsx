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
    { name: "Clay Crafts", href: "/discover?category=Clay Crafts" },
    { name: "Handicrafts", href: "/discover?category=Handicrafts" },
    { name: "Innovations", href: "/discover?innovations=true" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-black/5 w-full select-none">
        {/* Top Row */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Logo */}
            <Link id="faire-logo-link" aria-label="Go to GenZ homepage" className="flex items-center gap-2 shrink-0 py-2" href="/">
              <div className="w-9 h-9 bg-forest-green text-white flex items-center justify-center font-normal text-xl rounded-[4px]">
                Z
              </div>
              <span className="text-xl font-serif font-bold text-forest-green tracking-tight">GenZ</span>
            </Link>

            {/* Search Bar (Middle) */}
            <div className="hidden md:flex flex-1 max-w-xl min-w-0">
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-smoke" />
                <input
                  type="search"
                  id="top-search"
                  placeholder="Search wholesale products or brands"
                  aria-label="Search products or brands"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 text-sm bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-black/5 hover:border-black/10 focus:border-forest-green focus:outline-none rounded-[4px] transition-colors"
                />
              </form>
            </div>

            {/* Actions (Right Side) */}
            <div className="flex items-center gap-4 shrink-0">
              
              {/* Shopping Cart Icon with Badge */}
              <Link 
                href="/cart"
                aria-label="Shopping Cart"
                className="relative flex items-center justify-center h-10 w-10 rounded-full text-neutral-800 hover:text-forest-green hover:bg-black/5 transition-colors focus:outline-none"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-forest-green text-white font-mono font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {isLoggedIn ? (
                /* User Logged-in Menu Dropdown */
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-black/5 hover:border-forest-green/20 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 transition-all focus:outline-none"
                  >
                    <div className="h-7 w-7 bg-forest-green text-white rounded-full flex items-center justify-center text-xs font-semibold uppercase">
                      {userName ? userName.charAt(0).toUpperCase() : role?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold max-w-[100px] truncate">
                      {userName || role || "Account"}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-[4px] bg-white text-neutral-800 ring-1 ring-black/5 py-1.5 z-50 border border-black/10 animate-fade-in text-left">
                      <div className="px-4 py-2 border-b border-black/10">
                        <p className="text-[10px] text-smoke uppercase font-semibold">Signed in as</p>
                        <p className="text-xs font-semibold truncate text-forest-green">{userName || role || "User"}</p>
                      </div>
                      
                      {role === "admin" ? (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium hover:bg-neutral-50 hover:text-forest-green transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Compass className="h-4 w-4" /> Control Center
                        </Link>
                      ) : role === "buyer" ? (
                        <>
                          <Link
                            href="/profile"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium hover:bg-neutral-50 hover:text-forest-green transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="h-4 w-4" /> Profile Settings
                          </Link>
                          <Link
                            href="/orders"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium hover:bg-neutral-50 hover:text-forest-green transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Compass className="h-4 w-4" /> My Orders
                          </Link>
                          <Link
                            href="/cart"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium hover:bg-neutral-50 hover:text-forest-green transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <ShoppingBag className="h-4 w-4" /> Shopping Cart
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium hover:bg-neutral-50 hover:text-forest-green transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Compass className="h-4 w-4" /> Dashboard
                          </Link>
                          <Link
                            href="/profile"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium hover:bg-neutral-50 hover:text-forest-green transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="h-4 w-4" /> Account Settings
                          </Link>
                        </>
                      )}
                      <hr className="border-black/10 my-1" />
                      <form action={signOutAction} className="w-full">
                        <button
                          type="submit"
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ) : (
                /* Logged-out Auth Links */
                <div className="flex items-center gap-2.5">
                  <Button asChild variant="ghost" className="hidden sm:inline-flex text-neutral-600 hover:text-forest-green hover:bg-black/5 text-xs font-bold uppercase tracking-wider h-10 px-4">
                    <Link href="/signup/manufacturer">Signup to sell</Link>
                  </Button>
                  <Button asChild className="bg-forest-green text-white hover:bg-forest-green/90 rounded-[4px] h-10 px-5 text-xs font-bold uppercase tracking-wider">
                    <Link href="/login">Login</Link>
                  </Button>
                </div>
              )}

              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setIsOpen(true)}
                className="inline-flex md:hidden items-center justify-center p-2 text-neutral-700 hover:text-forest-green hover:bg-black/5 rounded-[4px] focus:outline-none"
                aria-label="Open main menu"
              >
                <Menu className="h-6 w-6" />
              </button>

            </div>
          </div>
        </div>

        {/* Bottom Row - Category Navigation Links */}
        <div className="hidden md:flex bg-neutral-50 border-t border-black/5 min-h-[44px] w-full items-center justify-center">
          <nav aria-label="Categories" className="w-full max-w-7xl px-4 lg:px-8">
            <ul data-test-id="desktop-header-c1-categories" className="flex items-center justify-center flex-wrap gap-x-6 py-2.5 text-xs font-semibold text-neutral-600">
              {bottomLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href.split("?")[0]));
                return (
                  <li key={link.name} className="relative py-0.5">
                    <Link
                      href={link.href}
                      className={`hover:text-forest-green transition-colors border-b-2 border-solid whitespace-nowrap pb-1.5 ${
                        isActive ? "border-forest-green text-forest-green" : "border-transparent"
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
        <div className="fixed inset-0 z-50 md:hidden animate-fade-in">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white border-l border-black/5 p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-6">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <div className="w-8 h-8 bg-forest-green text-white flex items-center justify-center font-normal text-lg rounded-[4px]">
                    Z
                  </div>
                  <span className="text-lg font-serif font-bold text-forest-green">GenZ</span>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-[4px] p-1.5 text-neutral-500 hover:bg-black/5 focus:outline-none"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleMobileSearchSubmit} className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-smoke" />
                <input
                  type="search"
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  placeholder="Search products or brands..."
                  aria-label="Search"
                  className="w-full h-11 border border-black/10 rounded-[4px] bg-neutral-50 pl-9 pr-3 text-sm text-neutral-800 placeholder:text-smoke focus:outline-none focus:border-forest-green transition-colors"
                />
              </form>

              {/* Mobile Links list */}
              <nav className="flex flex-col gap-1.5">
                <span className="text-[10px] text-smoke uppercase font-bold tracking-wider mb-1.5 block">Menu &amp; Categories</span>
                {bottomLinks.map((link) => {
                  const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href.split("?")[0]));
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`text-sm font-semibold px-3 py-2 rounded-[4px] transition-colors ${
                        isActive ? "bg-forest-green text-white" : "text-neutral-700 hover:bg-neutral-50 hover:text-forest-green"
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
            <div className="border-t border-black/5 pt-6 mt-6 flex flex-col gap-3">
              {isLoggedIn ? (
                <>
                  <div className="text-center mb-2 px-2">
                    <p className="text-[10px] text-smoke uppercase font-semibold">Logged in as</p>
                    <p className="text-xs font-semibold truncate text-forest-green">{userName || role || "User"}</p>
                  </div>
                  {role === "admin" ? (
                    <Button asChild variant="outline" className="w-full border-black/10 text-neutral-800 hover:bg-neutral-50 rounded-[4px] h-10 text-xs font-bold uppercase tracking-wider bg-transparent">
                      <Link href="/admin/dashboard" onClick={() => setIsOpen(false)}>
                        Control Center
                      </Link>
                    </Button>
                  ) : role === "buyer" ? (
                    <>
                      <Button asChild variant="outline" className="w-full border-black/10 text-neutral-800 hover:bg-neutral-50 rounded-[4px] h-10 text-xs font-bold uppercase tracking-wider bg-transparent">
                        <Link href="/profile" onClick={() => setIsOpen(false)}>
                          Profile Settings
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full border-black/10 text-neutral-800 hover:bg-neutral-50 rounded-[4px] h-10 text-xs font-bold uppercase tracking-wider bg-transparent">
                        <Link href="/orders" onClick={() => setIsOpen(false)}>
                          My Orders
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <Button asChild variant="outline" className="w-full border-black/10 text-neutral-800 hover:bg-neutral-50 rounded-[4px] h-10 text-xs font-bold uppercase tracking-wider bg-transparent">
                      <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                        Dashboard
                      </Link>
                    </Button>
                  )}
                  <form action={signOutAction} className="w-full">
                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white rounded-[4px] h-10 text-xs font-bold uppercase tracking-wider border-none">
                      Logout
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full border-black/10 text-neutral-700 hover:bg-neutral-50 rounded-[4px] h-10 text-xs font-bold uppercase tracking-wider bg-transparent">
                    <Link href="/signup/manufacturer" onClick={() => setIsOpen(false)}>Signup to sell</Link>
                  </Button>
                  <Button asChild className="w-full bg-forest-green text-white hover:bg-forest-green/90 rounded-[4px] h-10 text-xs font-bold uppercase tracking-wider border-none">
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
