"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  FileText,
  HelpCircle,
  LayoutDashboard,
  List,
  Plane,
} from "lucide-react";
import { EnterpriseShell } from "@/components/enterprise-shell";
import { getToken, redirectToLogin } from "@/lib/auth";

const nav = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/account/bookings", label: "My Bookings", icon: List },
  { href: "/flights", label: "Book Flight", icon: Plane },
  { href: "/visa", label: "Visa Services", icon: FileText },
  { href: "/", label: "Help & Support", icon: HelpCircle },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      redirectToLogin(pathname);
      return;
    }
    setReady(true);
  }, [pathname]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f4f8] text-sm text-slate-500">
        Loading your portal…
      </div>
    );
  }

  return (
    <EnterpriseShell
      portal="client"
      portalLabel="My Travel Portal"
      nav={nav}
      userName="Jamil Khan"
      userEmail="customer@travel.com"
    >
      {children}
    </EnterpriseShell>
  );
}
