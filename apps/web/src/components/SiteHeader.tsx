"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SarahLogo } from "@/components/SarahLogo";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  lang?: "en" | "bn";
  onLangToggle?: () => void;
  variant?: "default" | "compact";
}

const NAV = [
  { href: "/flights", en: "Flights", bn: "ফ্লাইট" },
  { href: "/hotels", en: "Hotels", bn: "হোটেল" },
  { href: "/tours", en: "Tours", bn: "ট্যুর" },
  { href: "/cars", en: "Cars", bn: "গাড়ি" },
  { href: "/visa", en: "Visa", bn: "ভিসা" },
  { href: "/umrah", en: "Umrah", bn: "উমরাহ" },
  { href: "/agent", en: "Agents", bn: "এজেন্ট" },
  { href: "/account/bookings", en: "My Bookings", bn: "বুকিং" },
] as const;

export function SiteHeader({ lang = "en", onLangToggle, variant = "default" }: SiteHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {variant === "default" && (
        <div className="bg-[#010b1a] text-white text-[10px] sm:text-xs py-2 px-4 border-b border-white/5 font-medium">
          <div className="mx-auto flex max-w-7xl flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center sm:justify-start">
              <span className="flex items-center gap-1">
                📧 <span className="text-slate-300">reza@sarahtravelsbd.com</span>
              </span>
              <span className="hidden sm:inline text-white/20">|</span>
              <span className="flex items-center gap-1">
                📞 <span className="text-slate-300">01730000106</span>
                <span className="text-[10px] text-green-500 font-bold">(WhatsApp)</span>
              </span>
            </div>
            <div className="text-brand-gold font-bold text-[10px] tracking-wider">
              &quot;বিশ্বাস, সেবা ও সন্তুষ্টিই আমাদের অঙ্গীকার&quot;
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-brand-navy/95 backdrop-blur-xl border-b border-white/10 text-white shadow-elevated">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <SarahLogo />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                    active ? "text-brand-gold" : "text-white/85 hover:text-brand-gold",
                  )}
                >
                  {lang === "en" ? item.en : item.bn}
                  {active && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-brand-gold"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {onLangToggle && (
              <button
                onClick={onLangToggle}
                className="flex items-center gap-1 text-xs font-bold border border-white/20 rounded-lg px-2.5 py-1.5 hover:bg-white/10 transition shrink-0"
              >
                <Globe className="h-3.5 w-3.5 text-brand-gold" />
                {lang === "en" ? "বাংলা" : "EN"}
              </button>
            )}
            <Link
              href="/login"
              className="text-xs font-bold text-white/90 hover:text-brand-gold transition hidden sm:block"
            >
              {lang === "en" ? "Sign In" : "লগইন"}
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-brand-gold hover:bg-brand-gold-light px-3 py-1.5 text-xs font-bold text-brand-navy shadow-glow transition shrink-0 hidden sm:block"
            >
              {lang === "en" ? "Register" : "নিবন্ধন"}
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden rounded-lg border border-white/20 p-2 hover:bg-white/10 transition"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden overflow-hidden border-t border-white/10 bg-brand-navy"
            >
              <nav className="flex flex-col gap-1 p-4">
                {NAV.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                        active ? "bg-brand-gold/15 text-brand-gold" : "text-white/90 hover:bg-white/5",
                      )}
                    >
                      {lang === "en" ? item.en : item.bn}
                    </Link>
                  );
                })}
                <div className="mt-2 flex gap-2 border-t border-white/10 pt-4">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-outline flex-1 text-center !text-white !border-white/20">
                    {lang === "en" ? "Sign In" : "লগইন"}
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-gold flex-1 text-center">
                    {lang === "en" ? "Register" : "নিবন্ধন"}
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
