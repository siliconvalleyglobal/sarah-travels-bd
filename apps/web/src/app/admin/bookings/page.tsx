"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

interface Booking {
  id: string;
  bookingRef: string;
  type: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  agent?: { agencyName: string } | null;
}

const statuses = ["DRAFT", "PENDING_PAYMENT", "CONFIRMED", "TICKETED", "CANCELLED", "REFUNDED", "COMPLETED"];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    const token = getToken();
    if (!token) { window.location.href = "/login"; return; }
    const params = filter ? `?status=${filter}` : "";
    api<Booking[]>(`/admin/bookings${params}`, { token })
      .then(setBookings)
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [filter]);

  async function updateStatus(id: string, status: string) {
    const token = getToken();
    if (!token) return;
    await api(`/admin/bookings/${id}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Bookings</h2>
      <p className="mt-1 text-gray-600">Manage all customer and agent bookings.</p>

      <div className="mt-4 flex gap-2">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Ref</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No bookings yet</td></tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{b.bookingRef}</td>
                  <td className="px-4 py-3">{b.type}</td>
                  <td className="px-4 py-3">
                    <div>{b.user.firstName} {b.user.lastName}</div>
                    <div className="text-xs text-gray-500">{b.user.email}</div>
                  </td>
                  <td className="px-4 py-3">{b.agent?.agencyName ?? "—"}</td>
                  <td className="px-4 py-3">{formatCurrency(Number(b.totalAmount))}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">{b.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={b.status}
                      onChange={(e) => updateStatus(b.id, e.target.value)}
                      className="rounded border px-2 py-1 text-xs"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
