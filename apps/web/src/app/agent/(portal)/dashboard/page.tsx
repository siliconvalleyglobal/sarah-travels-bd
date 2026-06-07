"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

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

export default function AgentDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) { window.location.href = "/login"; return; }
    api<Dashboard>("/agents/dashboard", { token })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>;
  }

  if (!data) {
    return <p className="text-gray-500">Loading dashboard...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{data.agent.agencyName}</h2>
          <p className="text-gray-600">Agent Dashboard</p>
        </div>
        {!data.agent.isApproved && (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
            Pending Approval
          </span>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Credit Available" value={formatCurrency(data.stats.creditAvailable)} />
        <StatCard label="Deposit Balance" value={formatCurrency(Number(data.stats.depositBalance))} />
        <StatCard label="Total Bookings" value={String(data.stats.totalBookings)} />
        <StatCard label="Commission Earned" value={formatCurrency(Number(data.stats.totalCommission))} />
      </div>

      <div className="mt-6 flex gap-3">
        <Link href="/agent/bookings/flights" className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">
          Book Flight
        </Link>
        <Link href="/agent/wallet" className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
          View Wallet
        </Link>
      </div>

      <div className="mt-8 rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h3 className="font-semibold">Recent Bookings</h3>
        </div>
        {data.recentBookings.length === 0 ? (
          <p className="px-6 py-8 text-center text-gray-500">No bookings yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-left">
              <tr>
                <th className="px-6 py-3">Ref</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentBookings.map((b) => (
                <tr key={b.id} className="border-b last:border-0">
                  <td className="px-6 py-3 font-mono text-xs">{b.bookingRef}</td>
                  <td className="px-6 py-3">{b.user.firstName} {b.user.lastName}</td>
                  <td className="px-6 py-3">{b.type}</td>
                  <td className="px-6 py-3">{formatCurrency(Number(b.totalAmount))}</td>
                  <td className="px-6 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
