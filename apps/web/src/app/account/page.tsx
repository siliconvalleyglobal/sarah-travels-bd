"use client";

import Link from "next/link";
import {
  Calendar,
  FileText,
  Gift,
  Hotel,
  Leaf,
  Plane,
  Sparkles,
} from "lucide-react";
import { clientDemo, CHART_COLORS } from "@/lib/dashboard-demo-data";
import { DonutChart, LineChartCard } from "@/components/dashboard/chart-cards";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KpiCard } from "@/components/dashboard/kpi-card";

const kpiIcons = [Plane, Calendar, Sparkles, Gift];

export default function ClientDashboardPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Welcome back, Jamil"
        subtitle="Your travel hub — trips, spending insights & quick bookings"
        badge="Sarah Member"
        actions={
          <>
            <Link href="/flights" className="btn-enterprise-primary">
              Book a Flight
            </Link>
            <Link href="/account/bookings" className="btn-enterprise-secondary">
              View Bookings
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {clientDemo.kpis.map((k, i) => (
          <KpiCard key={k.label} {...k} icon={kpiIcons[i]} />
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/flights", label: "Flights", icon: Plane, desc: "Search GDS fares" },
          { href: "/hotels", label: "Hotels", icon: Hotel, desc: "2M+ properties" },
          { href: "/visa", label: "Visa", icon: FileText, desc: "Apply online" },
          { href: "/umrah", label: "Umrah", icon: Sparkles, desc: "Installment plans" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-brand-gold/40 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy transition group-hover:bg-brand-gold/15 group-hover:text-brand-gold">
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-body font-semibold text-brand-navy">{item.label}</p>
              <p className="type-caption">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <DonutChart
            data={clientDemo.spendingByCategory}
            title="Spending by Category"
            subtitle="Your travel spend breakdown YTD"
          />
        </div>
        <div className="lg:col-span-7">
          <LineChartCard
            data={clientDemo.spendingTrend}
            dataKey="amount"
            title="Monthly Spending"
            subtitle="Total booked value (৳ Thousand)"
            color={CHART_COLORS.navy}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="font-semibold text-brand-navy">Upcoming Trips</h3>
              <p className="mt-0.5 text-xs text-slate-500">Confirmed departures</p>
            </div>
            <ul className="divide-y divide-slate-50">
              {clientDemo.upcomingTrips.map((trip) => (
                <li key={trip.ref} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-navy/5">
                      {trip.type === "FLIGHT" ? (
                        <Plane className="h-4 w-4 text-brand-navy" />
                      ) : (
                        <Hotel className="h-4 w-4 text-brand-navy" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-brand-navy">{trip.title}</p>
                      <p className="text-xs text-slate-500">{trip.date} · {trip.ref}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    {trip.status}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-100 px-5 py-3">
              <Link href="/account/bookings" className="text-sm font-semibold text-brand-gold hover:underline">
                View all bookings →
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-brand-navy">Recent Activity</h3>
            <ul className="mt-4 space-y-3">
              {clientDemo.recentActivity.map((a) => (
                <li key={a.action} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-gold" />
                  <div>
                    <p className="text-slate-700">{a.action}</p>
                    <p className="text-xs text-slate-400">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Sparkles, label: "Saved", value: clientDemo.quickStats.savedWithDeals },
              { icon: Leaf, label: "Offset", value: clientDemo.quickStats.carbonOffset },
              { icon: FileText, label: "Tickets", value: String(clientDemo.quickStats.supportTickets) },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-200/80 bg-white p-4 text-center shadow-sm">
                <s.icon className="mx-auto h-4 w-4 text-brand-gold" />
                <p className="mt-2 text-xs font-bold text-brand-navy">{s.value}</p>
                <p className="text-[10px] text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
