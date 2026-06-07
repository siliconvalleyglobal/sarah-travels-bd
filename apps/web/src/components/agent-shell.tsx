"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, Plane, Wallet } from "lucide-react";
import { EnterpriseShell } from "@/components/enterprise-shell";
import { getToken, getTokenRole, redirectToLogin } from "@/lib/auth";

const nav = [
  { href: "/agent/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/agent/bookings", label: "My Bookings", icon: List },
  { href: "/agent/bookings/flights", label: "Book Flight", icon: Plane },
  { href: "/agent/wallet", label: "Wallet", icon: Wallet },
];

export function AgentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      redirectToLogin(pathname);
      return;
    }
    const role = getTokenRole();
    if (role !== "AGENT" && role !== "SUB_AGENT" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
      window.location.href = "/account";
      return;
    }
    setReady(true);
  }, [pathname]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f4f8] text-sm text-slate-500">
        Loading agent portal…
      </div>
    );
  }

  return (
    <EnterpriseShell
      portal="agent"
      portalLabel="B2B Agent Portal"
      nav={nav}
      userName="Demo Agent"
      userEmail="agent@travel.com"
    >
      {children}
    </EnterpriseShell>
  );
}
