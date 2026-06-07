"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  Building2,
  Plane,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { adminDemo, CHART_COLORS } from "@/lib/dashboard-demo-data";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import {
  DonutChart,
  RevenueAreaChart,
  StackedBarChart,
} from "@/components/dashboard/chart-cards";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DataTable, StatusBadge } from "@/components/dashboard/data-table";
import { KpiCard } from "@/components/dashboard/kpi-card";

interface Stats {
  totalBookings: number;
  totalAgents: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalRevenue: number;
  bookingsByType: Record<string, number>;
}

const kpiIcons = [Banknote, Plane, Users, Building2, Shield, TrendingUp];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api<Stats>("/admin/stats", { token })
      .then(setStats)
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Failed to load stats";
        if (!msg.includes("Cannot reach API")) setError(msg);
      });
  }, []);

  const kpis = adminDemo.kpis.map((k, i) => ({
    ...k,
    icon: kpiIcons[i],
    value:
      i === 0 && stats
        ? formatCurrency(Number(stats.totalRevenue))
        : i === 1 && stats
          ? String(stats.totalBookings)
          : i === 2 && stats
            ? String(stats.totalAgents)
            : i === 3 && stats
              ? String(stats.totalCustomers)
              : k.value,
  }));

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Executive Dashboard"
        subtitle="Sarah Travels BD — platform overview, compliance & partner performance"
        badge="Live Demo"
        actions={
          <>
            <Link href="/admin/bookings" className="btn-enterprise-secondary">
              All Bookings
            </Link>
            <Link href="/admin/agents" className="btn-enterprise-primary">
              Manage Agents
            </Link>
          </>
        }
      />

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          API: {error} — showing demo analytics below.
        </div>
      )}

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <RevenueAreaChart data={adminDemo.revenueTrend} />
        </div>
        <div className="lg:col-span-4">
          <DonutChart
            data={adminDemo.bookingsByType}
            title="Bookings by Product"
            subtitle="Share of confirmed bookings MTD"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <StackedBarChart
            title="Booking Volume"
            subtitle="Weekly confirmed bookings by category"
            data={adminDemo.revenueTrend.slice(-6).map((d) => ({
              week: d.month,
              flights: Math.round(d.bookings! * 0.42),
              hotels: Math.round(d.bookings! * 0.28),
              umrah: Math.round(d.bookings! * 0.18),
            }))}
            keys={["flights", "hotels", "umrah"]}
            colors={[CHART_COLORS.navy, CHART_COLORS.blue, CHART_COLORS.gold]}
          />
        </div>
        <div className="lg:col-span-5">
          <ActivityFeed title="Platform Activity" items={adminDemo.activity} />
        </div>
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DataTable
          title="Recent Bookings"
          subtitle="Latest transactions across all channels"
          columns={["Reference", "Customer", "Product", "Amount", "Status"]}
          rows={adminDemo.recentBookings.map((b) => [
            <span key={b.ref} className="type-mono">{b.ref}</span>,
            b.customer,
            <span key={`${b.ref}-type`} className="text-xs font-medium">{b.type}</span>,
            b.amount,
            <StatusBadge key={`${b.ref}-st`} status={b.status} />,
          ])}
        />
        <DataTable
          title="Top Performing Agents"
          subtitle="By revenue this quarter"
          columns={["Agency", "Code", "Bookings", "Revenue", "Growth"]}
          rows={adminDemo.topAgents.map((a) => [
            a.name,
            <span key={a.code} className="type-mono text-slate-600">{a.code}</span>,
            String(a.bookings),
            a.revenue,
            <span key={`${a.code}-g`} className="font-semibold text-emerald-600">{a.growth}</span>,
          ])}
        />
      </div>

      {/* Compliance strip */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "VAT Rate", value: adminDemo.compliance.vatRate },
          { label: "AIT (Air Tickets)", value: adminDemo.compliance.aitRate },
          { label: "Mushak 6.3 Generated", value: adminDemo.compliance.mushakGenerated.toLocaleString() },
          { label: "NBR Status", value: adminDemo.compliance.nbrStatus },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700/70">{item.label}</p>
            <p className="mt-1 text-lg font-bold text-emerald-900">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
