"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import { SarahLogo } from "@/components/SarahLogo";
import { clearToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

export type EnterpriseNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export function EnterpriseShell({
  portal,
  portalLabel,
  nav,
  children,
  userName = "User",
  userEmail,
}: {
  portal: "admin" | "agent" | "client";
  portalLabel: string;
  nav: EnterpriseNavItem[];
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const portalColors = {
    admin: "from-brand-navy to-[#0a2744]",
    agent: "from-[#0c2340] to-brand-navy",
    client: "from-brand-navy to-[#152a45]",
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <nav className="flex flex-col gap-1 px-3">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.875rem] font-medium leading-none transition-colors",
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/75 hover:bg-white/10 hover:text-white",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
              {active && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>
    );
  }

  const sidebar = (
    <aside
      className={cn(
        "flex h-full w-[260px] shrink-0 flex-col bg-gradient-to-b text-white",
        portalColors[portal],
      )}
    >
      <div className="border-b border-white/10 px-5 py-5">
        <Link href="/" className="flex items-center gap-2 text-white">
          <SarahLogo />
        </Link>
        <p className="type-label mt-3.5 text-brand-gold/90 tracking-[0.14em]">
          {portalLabel}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <p className="type-label mb-2 px-6 text-white/35">
          Menu
        </p>
        <NavLinks />
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gold text-caption font-bold text-brand-navy">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.875rem] font-semibold leading-tight">{userName}</p>
            {userEmail && <p className="truncate text-caption text-white/50">{userEmail}</p>}
          </div>
        </div>
        <button
          onClick={() => {
            clearToken();
            window.location.href = "/login";
          }}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="enterprise-portal flex min-h-screen bg-[#f0f4f8]">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex">{sidebar}</div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-[260px]">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-[3.75rem] items-center gap-4 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="hidden flex-1 sm:block">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search bookings, agents, customers…"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-body placeholder:text-slate-400 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/10"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-gold" />
            </button>
            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 sm:flex">
              <LayoutDashboard className="h-4 w-4 text-brand-gold" />
              <span className="type-label text-brand-navy normal-case tracking-[0.06em]">{portal} portal</span>
            </div>
          </div>
        </header>

        <main className="enterprise-surface flex-1 p-5 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
