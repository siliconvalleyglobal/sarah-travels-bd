"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, Percent, Plane, Target } from "lucide-react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { agentDemo, CHART_COLORS } from "@/lib/dashboard-demo-data";
import {
  DonutChart,
  LineChartCard,
  StackedBarChart,
} from "@/components/dashboard/chart-cards";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DataTable, StatusBadge } from "@/components/dashboard/data-table";
import { KpiCard } from "@/components/dashboard/kpi-card";

interface Dashboard {
  agent: { agencyName: string; isApproved: boolean };
  stats: {
    totalBookings: number;
    totalCommission: number;
    creditAvailable: number;
    depositBalance: number;
  };
  recentBookings: Array<{
    id: string;
    bookingRef: string;
    type: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    user: { firstName: string; lastName: string };
  }>;
}

const kpiIcons = [CreditCard, Percent, Plane, Target];

export default function AgentDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api<Dashboard>("/agents/dashboard", { token })
      .then(setData)
      .catch(() => {
        /* Demo mode when API is offline — charts still render from agentDemo */
      });
  }, []);

  const kpis = agentDemo.kpis.map((k, i) => ({
    ...k,
    icon: kpiIcons[i],
    value:
      data && i === 0
        ? formatCurrency(data.stats.creditAvailable)
        : data && i === 1
          ? formatCurrency(Number(data.stats.totalCommission))
          : data && i === 2
            ? String(data.stats.totalBookings)
            : k.value,
  }));

  const tableRows =
    data && data.recentBookings.length > 0
      ? data.recentBookings.map((b) => [
          <span key={b.id} className="type-mono">{b.bookingRef}</span>,
          `${b.user.firstName} ${b.user.lastName}`,
          b.type,
          formatCurrency(Number(b.totalAmount)),
          <StatusBadge key={`${b.id}-s`} status={b.status} />,
        ])
      : agentDemo.recentBookings.map((b) => [
          <span key={b.ref} className="type-mono">{b.ref}</span>,
          b.customer,
          b.type,
          b.amount,
          <StatusBadge key={`${b.ref}-s`} status={b.status} />,
        ]);

  return (
    <div className="space-y-8">
      <DashboardHeader
        title={data?.agent.agencyName ?? "Demo Travel Agency"}
        subtitle="B2B agent workspace — credit, commissions & booking pipeline"
        badge={data?.agent.isApproved === false ? "Pending Approval" : "Active Agent"}
        actions={
          <>
            <Link href="/agent/bookings/flights" className="btn-enterprise-primary">
              Book Flight
            </Link>
            <Link href="/agent/wallet" className="btn-enterprise-secondary">
              Wallet
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <StackedBarChart
            title="Weekly Bookings"
            subtitle="Flights, hotels & Umrah packages"
            data={agentDemo.bookingTrend}
            keys={["flights", "hotels", "umrah"]}
            colors={[CHART_COLORS.navy, CHART_COLORS.blue, CHART_COLORS.gold]}
          />
        </div>
        <div className="lg:col-span-5">
          <DonutChart
            data={agentDemo.revenueMix}
            title="Revenue Mix"
            subtitle="Commission by product line"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <DataTable
            title="Recent Bookings"
            subtitle="Your latest customer transactions"
            columns={["Reference", "Customer", "Type", "Amount", "Status"]}
            rows={tableRows}
          />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <LineChartCard
            data={agentDemo.commissionTrend}
            dataKey="commission"
            title="Commission Trend"
            subtitle="Monthly earnings (৳ Thousand)"
            color={CHART_COLORS.gold}
          />
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="font-semibold text-brand-navy">Action Items</h3>
            </div>
            <ul className="divide-y divide-slate-50">
              {agentDemo.tasks.map((t) => (
                <li key={t.title} className="px-5 py-3.5">
                  <p className="text-sm font-medium text-slate-700">{t.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        t.priority === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {t.priority}
                    </span>
                    <span className="text-xs text-slate-400">Due {t.due}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
