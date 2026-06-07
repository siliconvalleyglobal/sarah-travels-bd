"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

interface Stats {
  totalBookings: number;
  totalAgents: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalRevenue: number;
  bookingsByType: Record<string, number>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }
    api<Stats>("/admin/stats", { token })
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  const sections = [
    { title: "All Bookings", href: "/admin/bookings", count: stats?.totalBookings },
    { title: "Agents", href: "/admin/agents", count: stats?.totalAgents },
    { title: "Customers", href: "/admin/bookings", count: stats?.totalCustomers },
    { title: "Suppliers", href: "/admin/suppliers", count: stats?.totalSuppliers },
    { title: "Accounting", href: "/admin/accounting", count: "—" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <p className="mt-1 text-gray-600">Overview of your travel platform.</p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {stats && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Revenue" value={formatCurrency(Number(stats.totalRevenue))} />
          <StatCard label="Bookings" value={String(stats.totalBookings)} />
          <StatCard label="Agents" value={String(stats.totalAgents)} />
          <StatCard label="Customers" value={String(stats.totalCustomers)} />
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href + section.title}
            href={section.href}
            className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md"
          >
            <p className="text-2xl font-bold text-brand-700">
              {section.count ?? "—"}
            </p>
            <h3 className="mt-1 font-semibold">{section.title}</h3>
          </Link>
        ))}
      </div>

      {stats?.bookingsByType && (
        <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold">Bookings by Type</h3>
          <div className="mt-4 flex flex-wrap gap-4">
            {Object.entries(stats.bookingsByType).map(([type, count]) => (
              <div key={type} className="rounded-lg bg-gray-50 px-4 py-2">
                <span className="text-sm text-gray-500">{type}</span>
                <p className="text-lg font-bold">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
