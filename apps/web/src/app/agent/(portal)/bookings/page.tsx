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
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  flightBooking?: { segments: Array<{ origin: string; destination: string; flightNumber: string }> } | null;
}

export default function AgentBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) { window.location.href = "/login"; return; }
    api<Booking[]>("/agents/bookings", { token }).then(setBookings);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold">My Bookings</h2>
      <p className="mt-1 text-gray-600">All bookings made through your agent account.</p>

      <div className="mt-6 overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Ref</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No bookings yet</td></tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{b.bookingRef}</td>
                  <td className="px-4 py-3">
                    <div>{b.user.firstName} {b.user.lastName}</div>
                    <div className="text-xs text-gray-500">{b.user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {b.flightBooking?.segments
                      ? `${b.flightBooking.segments[0]?.origin} → ${b.flightBooking.segments[0]?.destination}`
                      : b.type}
                  </td>
                  <td className="px-4 py-3">{formatCurrency(Number(b.totalAmount))}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">{b.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(b.createdAt).toLocaleDateString()}
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
