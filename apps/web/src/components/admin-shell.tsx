"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Calculator,
  LayoutDashboard,
  Plane,
  Users,
} from "lucide-react";
import { EnterpriseShell } from "@/components/enterprise-shell";
import { getToken, getTokenRole, isAdminRole, redirectToLogin } from "@/lib/auth";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/bookings", label: "Bookings", icon: Plane },
  { href: "/admin/agents", label: "Agents", icon: Users },
  { href: "/admin/suppliers", label: "Suppliers", icon: Building2 },
  { href: "/admin/accounting", label: "Accounting", icon: Calculator },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      redirectToLogin(pathname);
      return;
    }
    if (!isAdminRole(getTokenRole())) {
      setDenied(true);
      return;
    }
    setReady(true);
  }, [pathname]);

  if (denied) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f4f8] px-4">
        <div className="max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-brand-navy">Admin access required</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in with <span className="font-medium">admin@travel.com</span> / password123
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white"
            >
              Sign in as admin
            </Link>
            <Link href="/account" className="rounded-lg border px-4 py-2 text-sm text-slate-700">
              Client portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f4f8] text-sm text-slate-500">
        Loading workspace…
      </div>
    );
  }

  return (
    <EnterpriseShell
      portal="admin"
      portalLabel="Enterprise Admin"
      nav={nav}
      userName="Admin User"
      userEmail="admin@travel.com"
    >
      {children}
    </EnterpriseShell>
  );
}
