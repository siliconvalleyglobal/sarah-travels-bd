"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

interface FlightOffer {
  id: string;
  airlineName: string;
  price: { total: number };
  segments: Array<{
    origin: string;
    destination: string;
    departureAt: string;
    arrivalAt: string;
    flightNumber: string;
    duration: number;
  }>;
}

export default function AgentFlightBookingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"search" | "book">("search");
  const [origin, setOrigin] = useState("DAC");
  const [destination, setDestination] = useState("JED");
  const [departureDate, setDepartureDate] = useState("");
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [selected, setSelected] = useState<FlightOffer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passenger, setPassenger] = useState({
    firstName: "", lastName: "", dateOfBirth: "", gender: "M",
    contactEmail: "", contactPhone: "",
  });

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        origin, destination, departureDate, tripType: "ONE_WAY", adults: "1",
      });
      const data = await api<{ offers: FlightOffer[] }>(`/flights/search?${params}`);
      setOffers(data.offers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const token = getToken();
    if (!token) { window.location.href = "/login"; return; }

    setLoading(true);
    setError("");
    try {
      const seg = selected.segments[0];
      await api("/agents/bookings/flight", {
        method: "POST",
        token,
        body: JSON.stringify({
          totalAmount: selected.price.total,
          tripType: "ONE_WAY",
          cabinClass: "ECONOMY",
          contactEmail: passenger.contactEmail,
          contactPhone: passenger.contactPhone,
          segments: selected.segments.map((s) => ({
            airline: s.flightNumber.slice(0, 2),
            flightNumber: s.flightNumber,
            origin: s.origin,
            destination: s.destination,
            departureAt: s.departureAt,
            arrivalAt: s.arrivalAt,
            duration: s.duration,
          })),
          passengers: [{
            firstName: passenger.firstName,
            lastName: passenger.lastName,
            dateOfBirth: passenger.dateOfBirth,
            gender: passenger.gender,
          }],
        }),
      });
      router.push("/agent/bookings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Book Flight</h2>
      <p className="mt-1 text-gray-600">Book using your agent credit wallet.</p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {step === "search" ? (
        <>
          <form onSubmit={handleSearch} className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium">From</label>
                <input value={origin} onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                  className="mt-1 w-full rounded-lg border px-3 py-2" required />
              </div>
              <div>
                <label className="text-sm font-medium">To</label>
                <input value={destination} onChange={(e) => setDestination(e.target.value.toUpperCase())}
                  className="mt-1 w-full rounded-lg border px-3 py-2" required />
              </div>
              <div>
                <label className="text-sm font-medium">Departure</label>
                <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2" required />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="mt-4 rounded-lg bg-brand-600 px-6 py-2 text-white hover:bg-brand-700 disabled:opacity-50">
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            {offers.map((offer) => (
              <div key={offer.id} className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
                <div>
                  <p className="font-semibold">{offer.airlineName}</p>
                  <p className="text-sm text-gray-500">
                    {offer.segments[0]?.origin} → {offer.segments[0]?.destination} · {offer.segments[0]?.flightNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-700">{formatCurrency(offer.price.total)}</p>
                  <button
                    onClick={() => { setSelected(offer); setStep("book"); }}
                    className="mt-1 rounded-lg bg-brand-600 px-4 py-1.5 text-sm text-white"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <form onSubmit={handleBook} className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
          {selected && (
            <div className="mb-6 rounded-lg bg-brand-50 p-4">
              <p className="font-semibold">{selected.airlineName}</p>
              <p className="text-sm">{selected.segments[0]?.flightNumber} · {formatCurrency(selected.price.total)}</p>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Passenger First Name</label>
              <input value={passenger.firstName} onChange={(e) => setPassenger({ ...passenger, firstName: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2" required />
            </div>
            <div>
              <label className="text-sm font-medium">Passenger Last Name</label>
              <input value={passenger.lastName} onChange={(e) => setPassenger({ ...passenger, lastName: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2" required />
            </div>
            <div>
              <label className="text-sm font-medium">Date of Birth</label>
              <input type="date" value={passenger.dateOfBirth} onChange={(e) => setPassenger({ ...passenger, dateOfBirth: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2" required />
            </div>
            <div>
              <label className="text-sm font-medium">Contact Email</label>
              <input type="email" value={passenger.contactEmail} onChange={(e) => setPassenger({ ...passenger, contactEmail: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2" required />
            </div>
            <div>
              <label className="text-sm font-medium">Contact Phone</label>
              <input value={passenger.contactPhone} onChange={(e) => setPassenger({ ...passenger, contactPhone: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2" required />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => setStep("search")} className="rounded-lg border px-4 py-2 text-sm">
              Back
            </button>
            <button type="submit" disabled={loading}
              className="rounded-lg bg-brand-600 px-6 py-2 text-sm text-white hover:bg-brand-700 disabled:opacity-50">
              {loading ? "Booking..." : "Confirm & Pay with Credit"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
