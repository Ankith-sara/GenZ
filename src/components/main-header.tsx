"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  BookOpen,
  Users2,
  Newspaper,
  PhoneCall,
  ArrowRight,
  User,
  Settings,
  LogOut,
  Compass,
  Lightbulb,
  Info,
  Home,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainHeaderProps {
  isLoggedIn: boolean;
  role?: string;
  userName?: string;
  signOutAction: () => void;
}

export function MainHeader({ isLoggedIn, role, userName, signOutAction }: MainHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const resourcesRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (resourcesRef.current && !resourcesRef.current.contains(event.target as Node)) {
        setShowResources(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus the input as soon as the search box expands
  useEffect(() => {
    if (showSearch) {
      searchInputRef.current?.focus();
    }
  }, [showSearch]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/discover?q=${encodeURIComponent(q)}`);
    setShowSearch(false);
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

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Discover", href: "/discover" },
    { name: "Innovate", href: "/discover?innovations=true" },
  ];

  return (
    <>
      {/* 10. Optional Announcement Bar */}
      <div className="bg-[#07170f] text-gold-yellow py-2 px-4 text-center text-xs tracking-wider font-sans border-b border-white/5 flex items-center justify-center gap-1.5 hover:text-white transition-colors">
        <span>✨ Applications for GenZ Innovators are now open.</span>
        <Link href="/discover?innovations=true" className="font-medium underline flex items-center gap-0.5">
          Apply today <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* 1. Floating Glass Header & 9. Bigger Sizing */}
      <header className="sticky top-0 z-50 bg-forest-green border-b border-white/10  transition-all duration-300">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* 2. Better Logo Card */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gold-yellow flex items-center justify-center text-forest-green font-normal text-2xl rounded-[4px]  group- transition-transform duration-300">
                Z
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-medium tracking-tight text-white leading-none">GenZ</span>
                <span className="text-[9px] font-medium tracking-widest text-gold-yellow/80 uppercase mt-1 leading-none">
                  Innovation Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative py-2 text-base font-medium tracking-wide transition-colors hover:text-gold-yellow text-white/90 hover:-translate-y-0.5 transition-transform duration-300 group`}
                  >
                    {link.name}
                    {/* 3. Animated Underline Navigation */}
                    <span
                      className={`absolute bottom-0 left-0 h-0.5 bg-gold-yellow transition-all duration-300 ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </Link>
                );
              })}

              {/* 4. Better Resources Dropdown */}
              <div className="relative" ref={resourcesRef}>
                <button
                  onClick={() => setShowResources(!showResources)}
                  className="flex items-center gap-1.5 py-2 text-base font-medium text-white/90 hover:text-gold-yellow hover:-translate-y-0.5 transition-all duration-300 focus:outline-none"
                >
                  Resources <ChevronDown className={`h-4 w-4 text-white/60 transition-transform duration-300 ${showResources ? "rotate-180" : ""}`} />
                </button>
                {showResources && (
                  <div className="absolute right-0 mt-3 w-80 rounded-[4px] bg-paper-white text-black  ring-1 ring-black/5 p-4 z-50 grid grid-cols-1 gap-3 border border-black/10 animate-fade-in">
                    <Link
                      href="/about"
                      className="flex items-start gap-3 p-2 rounded-[4px] hover:bg-light-gray-bg hover:text-forest-green transition-colors"
                      onClick={() => setShowResources(false)}
                    >
                      <div className="bg-forest-green/5 text-forest-green p-2 rounded-[4px] shrink-0">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-semibold text-black leading-none">Documentation</h4>
                        <p className="text-[10px] text-smoke leading-tight mt-1">Learn how GenZ trust network works</p>
                      </div>
                    </Link>

                    <Link
                      href="/discover"
                      className="flex items-start gap-3 p-2 rounded-[4px] hover:bg-light-gray-bg hover:text-forest-green transition-colors"
                      onClick={() => setShowResources(false)}
                    >
                      <div className="bg-forest-green/5 text-forest-green p-2 rounded-[4px] shrink-0">
                        <Users2 className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-semibold text-black leading-none">Community</h4>
                        <p className="text-[10px] text-smoke leading-tight mt-1">Meet innovators and verify makers</p>
                      </div>
                    </Link>

                    <Link
                      href="/about#mission"
                      className="flex items-start gap-3 p-2 rounded-[4px] hover:bg-light-gray-bg hover:text-forest-green transition-colors"
                      onClick={() => setShowResources(false)}
                    >
                      <div className="bg-forest-green/5 text-forest-green p-2 rounded-[4px] shrink-0">
                        <Newspaper className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-semibold text-black leading-none">Blog</h4>
                        <p className="text-[10px] text-smoke leading-tight mt-1">Latest updates and stories</p>
                      </div>
                    </Link>

                    <Link
                      href="/contact"
                      className="flex items-start gap-3 p-2 rounded-[4px] hover:bg-light-gray-bg hover:text-forest-green transition-colors"
                      onClick={() => setShowResources(false)}
                    >
                      <div className="bg-forest-green/5 text-forest-green p-2 rounded-[4px] shrink-0">
                        <PhoneCall className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-semibold text-black leading-none">Contact</h4>
                        <p className="text-[10px] text-smoke leading-tight mt-1">Need help? Get in touch</p>
                      </div>
                    </Link>

                    <Link
                      href="/faqs"
                      className="flex items-start gap-3 p-2 rounded-[4px] hover:bg-light-gray-bg hover:text-forest-green transition-colors"
                      onClick={() => setShowResources(false)}
                    >
                      <div className="bg-forest-green/5 text-forest-green p-2 rounded-[4px] shrink-0">
                        <Info className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-semibold text-black leading-none">FAQs</h4>
                        <p className="text-[10px] text-smoke leading-tight mt-1">Answers to common questions</p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Desktop Auth CTA + Search */}
            <div className="hidden md:flex items-center gap-4">
              {/* Expandable Search */}
              <div ref={searchRef} className="flex items-center">
                <form
                  onSubmit={handleSearchSubmit}
                  className={`flex items-center overflow-hidden transition-all duration-300 ease-out rounded-[4px] border ${
                    showSearch
                      ? "w-56 border-white/20 bg-paper-white/10 px-2"
                      : "w-0 border-transparent"
                  }`}
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search innovators..."
                    aria-label="Search"
                    className={`bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none py-2 transition-opacity duration-200 ${
                      showSearch ? "w-full opacity-100" : "w-0 opacity-0"
                    }`}
                  />
                </form>
                <button
                  type="button"
                  onClick={() => setShowSearch((prev) => !prev)}
                  aria-label={showSearch ? "Close search" : "Open search"}
                  className="flex items-center justify-center h-9 w-9 rounded-full text-white/90 hover:text-gold-yellow hover:bg-paper-white/10 transition-colors focus:outline-none"
                >
                  {showSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                </button>
              </div>

              {isLoggedIn ? (
                /* 6. Logged-in User Avatar Dropdown */
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 hover:border-gold-yellow bg-paper-white/5 hover:bg-paper-white/10 text-white transition-all focus:outline-none"
                  >
                    <div className="h-6 w-6 bg-gold-yellow text-forest-green rounded-full flex items-center justify-center text-xs font-medium font-serif ">
                      {userName ? userName.charAt(0).toUpperCase() : role?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="text-sm font-medium tracking-wide">
                      {userName || role || "Account"}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-white/60" />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-56 rounded-[4px] bg-paper-white text-black  ring-1 ring-black/5 py-1.5 z-50 border border-black/10 animate-fade-in text-left">
                      <div className="px-4 py-2 border-b border-black/10">
                        <p className="text-xs text-neutral-400">Signed in as</p>
                        <p className="text-xs font-medium truncate text-forest-green">{userName || role || "User"}</p>
                      </div>
                      <Link
                        href={role === "buyer" ? "/dashboard/account" : "/dashboard"}
                        className="flex items-center gap-2 px-4 py-2 text-xs hover:bg-light-gray-bg hover:text-forest-green transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Compass className="h-3.5 w-3.5" /> Dashboard
                      </Link>
                      <Link
                        href="/dashboard/account"
                        className="flex items-center gap-2 px-4 py-2 text-xs hover:bg-light-gray-bg hover:text-forest-green transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-3.5 w-3.5" /> Profile
                      </Link>
                      <Link
                        href="/dashboard/account"
                        className="flex items-center gap-2 px-4 py-2 text-xs hover:bg-light-gray-bg hover:text-forest-green transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-3.5 w-3.5" /> Settings
                      </Link>
                      <hr className="border-black/10 my-1" />
                      <form action={signOutAction} className="w-full">
                        <button
                          type="submit"
                          className="flex items-center gap-2 w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <LogOut className="h-3.5 w-3.5" /> Logout
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Button asChild variant="outline" className="border-white/30 text-white hover:bg-paper-white/10 hover:text-gold-yellow rounded-[4px] h-11 px-5 text-sm font-semibold tracking-wider bg-transparent transition-all">
                    <Link href="/login">Login</Link>
                  </Button>
                  {/* 5. Better CTA Button */}
                  <Button asChild className="bg-chartreuse-lime text-forest-green font-medium   transition-all duration-300 rounded-[4px] h-11 px-6 text-sm uppercase tracking-wider border-none">
                    <Link href="/signup">Join Now</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Hamburger Drawer Trigger */}
            <div className="flex md:hidden items-center gap-1">
              <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center justify-center rounded-[4px] p-2 text-white hover:bg-paper-white/10 focus:outline-none"
                aria-label="Open main menu"
              >
                <Menu className="block h-7 w-7" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 7. Better Mobile Menu: Slide-in Right Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-forest-green border-l border-white/10  p-6 flex flex-col justify-between transition-transform duration-300 ease-out transform translate-x-0 overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <div className="w-8 h-8 bg-gold-yellow flex items-center justify-center text-forest-green font-normal text-xl rounded-[4px]">
                    Z
                  </div>
                  <span className="text-lg font-medium text-white tracking-tight">GenZ</span>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-[4px] p-1.5 text-white/70 hover:bg-paper-white/10 focus:outline-none"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleMobileSearchSubmit} className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  placeholder="Search innovators..."
                  aria-label="Search"
                  className="w-full rounded-[4px] border border-white/20 bg-paper-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-gold-yellow/60 transition-colors"
                />
              </form>

              {/* Mobile Links */}
              <nav className="flex flex-col gap-2">
                <Link
                  href="/"
                  className={`flex items-center gap-3 text-base font-semibold px-4 py-3 rounded-[4px] hover:bg-paper-white/5 transition-colors ${
                    pathname === "/" ? "text-gold-yellow bg-paper-white/5" : "text-white/90"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Home className="h-4 w-4" /> Home
                </Link>

                <Link
                  href="/about"
                  className={`flex items-center gap-3 text-base font-semibold px-4 py-3 rounded-[4px] hover:bg-paper-white/5 transition-colors ${
                    pathname === "/about" ? "text-gold-yellow bg-paper-white/5" : "text-white/90"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Info className="h-4 w-4" /> About
                </Link>

                <Link
                  href="/discover"
                  className={`flex items-center gap-3 text-base font-semibold px-4 py-3 rounded-[4px] hover:bg-paper-white/5 transition-colors ${
                    pathname === "/discover" && !pathname.includes("innovations") ? "text-gold-yellow bg-paper-white/5" : "text-white/90"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Compass className="h-4 w-4" /> Discover
                </Link>

                <Link
                  href="/discover?innovations=true"
                  className={`flex items-center gap-3 text-base font-semibold px-4 py-3 rounded-[4px] hover:bg-paper-white/5 transition-colors ${
                    pathname.includes("innovations") ? "text-gold-yellow bg-paper-white/5" : "text-white/90"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Lightbulb className="h-4 w-4" /> Innovate
                </Link>

                {/* Mobile Resources Accordion style */}
                <div className="border-t border-white/5 pt-2 mt-2">
                  <span className="text-[10px] text-white/40 uppercase font-medium tracking-widest px-4 mb-2 block">Resources</span>
                  <Link href="/about" className="block text-sm text-white/80 hover:text-gold-yellow px-4 py-2" onClick={() => setIsOpen(false)}>
                    Documentation
                  </Link>
                  <Link href="/discover" className="block text-sm text-white/80 hover:text-gold-yellow px-4 py-2" onClick={() => setIsOpen(false)}>
                    Community
                  </Link>
                  <Link href="/about#mission" className="block text-sm text-white/80 hover:text-gold-yellow px-4 py-2" onClick={() => setIsOpen(false)}>
                    Blog
                  </Link>
                  <Link href="/contact" className="block text-sm text-white/80 hover:text-gold-yellow px-4 py-2" onClick={() => setIsOpen(false)}>
                    Contact
                  </Link>
                  <Link href="/faqs" className="block text-sm text-white/80 hover:text-gold-yellow px-4 py-2" onClick={() => setIsOpen(false)}>
                    FAQs
                  </Link>
                </div>
              </nav>
            </div>

            {/* Mobile Footer CTAs */}
            <div className="border-t border-white/10 pt-6 mt-6 flex flex-col gap-3">
              {isLoggedIn ? (
                <>
                  <div className="text-center mb-2 px-2">
                    <p className="text-[10px] text-white/50">Logged in as</p>
                    <p className="text-xs font-medium truncate text-gold-yellow">{userName || role || "User"}</p>
                  </div>
                  <Button asChild variant="outline" className="w-full border-white/30 text-white hover:bg-paper-white/10 rounded-[4px] h-10 text-xs font-medium uppercase tracking-wider bg-transparent">
                    <Link href={role === "buyer" ? "/dashboard/account" : "/dashboard"} onClick={() => setIsOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  <form action={signOutAction} className="w-full">
                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white rounded-[4px] h-10 text-xs font-medium uppercase tracking-wider border-none">
                      Logout
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full border-white/30 text-white hover:bg-paper-white/10 rounded-[4px] h-10 text-xs font-medium uppercase tracking-wider bg-transparent">
                    <Link href="/login" onClick={() => setIsOpen(false)}>Login</Link>
                  </Button>
                  <Button asChild className="w-full bg-chartreuse-lime text-forest-green font-medium   transition-all duration-300 rounded-[4px] h-10 text-xs uppercase tracking-wider border-none">
                    <Link href="/signup" onClick={() => setIsOpen(false)}>Join Now</Link>
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