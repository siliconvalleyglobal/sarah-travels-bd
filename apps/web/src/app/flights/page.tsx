"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { bookFlight, payFlightBooking } from "@/lib/flights-api";
import { formatCurrency } from "@/lib/utils";
import { 
  ArrowLeft, Plane, Shield, CheckCircle, ChevronRight, SlidersHorizontal, Calendar,
  Loader2, X,
} from "lucide-react";
import { SarahLogo } from "@/components/SarahLogo";

function formatFlightTime(t: string): string {
  if (t.includes("T") || /^\d{4}-\d{2}-\d{2}/.test(t)) {
    return new Date(t).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  }
  return t;
}

function parseDepartureMinutes(t: string): number {
  if (t.includes("T") || /^\d{4}-\d{2}-\d{2}/.test(t)) {
    const d = new Date(t);
    return d.getHours() * 60 + d.getMinutes();
  }
  const [time, modifier] = t.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

type TripType = "ONE_WAY" | "ROUND_TRIP" | "MULTI_CITY";

interface FlightOffer {
  id: string;
  airline: string;
  airlineName: string;
  price: { total: number; currency: string };
  segments: Array<{
    origin: string;
    destination: string;
    departureAt: string;
    arrivalAt?: string;
    flightNumber: string;
    duration: number;
  }>;
  baggage: { checked: string; cabin: string };
  fareRules: { refundable: boolean; changeFee: number };
}

export default function FlightsPage() {
  const router = useRouter();
  const [tripType, setTripType] = useState<TripType>("ROUND_TRIP");
  const [origin, setOrigin] = useState("DAC");
  const [destination, setDestination] = useState("DXB");
  const [departureDate, setDepartureDate] = useState("2026-06-15");
  const [returnDate, setReturnDate] = useState("");
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  // Design Alignment Sorters and Filters
  const [sortBy, setSortBy] = useState<"price" | "earliest" | "duration">("price");
  const [selectedStops, setSelectedStops] = useState<string>("ALL");
  const [cabinClass, setCabinClass] = useState<string>("ECONOMY");
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [activeDetailsTab, setActiveDetailsTab] = useState<"FLIGHT" | "BAGGAGE" | "RULES">("FLIGHT");
  const [checkoutOffer, setCheckoutOffer] = useState<FlightOffer | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("SSLCOMMERZ");
  const [bookingRef, setBookingRef] = useState("");
  const [pnr, setPnr] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [passenger, setPassenger] = useState({
    firstName: "", lastName: "", dateOfBirth: "", gender: "M",
    passportNumber: "", contactEmail: "", contactPhone: "",
  });

  // Generate nearby dates around departureDate
  const getNearbyDates = () => {
    const baseDate = departureDate ? new Date(departureDate) : new Date();
    const list = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const hash = (d.getDate() * 17) % 5;
      const mockPrice = 43000 + hash * 1500;
      list.push({ dateStr, dayName, monthDay, price: mockPrice });
    }
    return list;
  };

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({
        origin,
        destination,
        departureDate,
        tripType,
        adults: "1",
        ...(returnDate && tripType === "ROUND_TRIP" ? { returnDate } : {}),
      });
      const data = await api<{ offers: FlightOffer[] }>(
        `/flights/search?${params}`,
      );
      setOffers(data.offers);
    } catch {
      // Fallback local mock data for demonstration if API isn't online
      setOffers([
        {
          id: "1",
          airline: "BG",
          airlineName: "Biman Bangladesh Airlines",
          price: { total: 52000, currency: "BDT" },
          segments: [
            { origin, destination, departureAt: "08:30 AM", flightNumber: "BG-047", duration: 270 }
          ],
          baggage: { checked: "30kg", cabin: "7kg" },
          fareRules: { refundable: true, changeFee: 3500 }
        },
        {
          id: "2",
          airline: "EK",
          airlineName: "Emirates Airlines",
          price: { total: 78500, currency: "BDT" },
          segments: [
            { origin, destination, departureAt: "11:15 AM", flightNumber: "EK-583", duration: 290 }
          ],
          baggage: { checked: "35kg", cabin: "7kg" },
          fareRules: { refundable: true, changeFee: 4000 }
        },
        {
          id: "3",
          airline: "FZ",
          airlineName: "FlyDubai",
          price: { total: 48000, currency: "BDT" },
          segments: [
            { origin, destination, departureAt: "03:45 PM", flightNumber: "FZ-502", duration: 285 }
          ],
          baggage: { checked: "20kg", cabin: "7kg" },
          fareRules: { refundable: false, changeFee: 5000 }
        },
        {
          id: "4",
          airline: "GF",
          airlineName: "Gulf Air",
          price: { total: 45000, currency: "BDT" },
          segments: [
            { origin, destination: "BAH", departureAt: "06:15 AM", flightNumber: "GF-250", duration: 320 },
            { origin: "BAH", destination, departureAt: "10:45 AM", flightNumber: "GF-251", duration: 180 }
          ],
          baggage: { checked: "23kg", cabin: "7kg" },
          fareRules: { refundable: true, changeFee: 4500 }
        },
        {
          id: "5",
          airline: "US",
          airlineName: "US-Bangla Airlines",
          price: { total: 43000, currency: "BDT" },
          segments: [
            { origin, destination, departureAt: "09:45 PM", flightNumber: "BS-315", duration: 295 }
          ],
          baggage: { checked: "20kg", cabin: "7kg" },
          fareRules: { refundable: false, changeFee: 3000 }
        },
        {
          id: "6",
          airline: "QR",
          airlineName: "Qatar Airways",
          price: { total: 89000, currency: "BDT" },
          segments: [
            { origin, destination, departureAt: "02:15 AM", flightNumber: "QR-641", duration: 280 }
          ],
          baggage: { checked: "30kg", cabin: "7kg" },
          fareRules: { refundable: true, changeFee: 6000 }
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  const serviceFee = checkoutOffer ? checkoutOffer.price.total * 0.05 : 0;
  const vatAmount = serviceFee * 0.15;
  const grandTotal = checkoutOffer ? checkoutOffer.price.total + serviceFee + vatAmount : 0;

  async function handleBookFlight() {
    if (!checkoutOffer) return;
    const token = getToken();
    if (!token) {
      router.push("/login?redirect=/flights");
      return;
    }
    setBookingLoading(true);
    setBookingError("");
    try {
      const booking = await bookFlight(token, {
        tripType,
        cabinClass: "ECONOMY",
        baseFare: checkoutOffer.price.total,
        contactEmail: passenger.contactEmail,
        contactPhone: passenger.contactPhone,
        segments: checkoutOffer.segments.map((s) => ({
          airline: checkoutOffer.airline,
          flightNumber: s.flightNumber,
          origin: s.origin,
          destination: s.destination,
          departureAt: s.departureAt,
          arrivalAt: s.arrivalAt ?? s.departureAt,
          duration: s.duration,
        })),
        passengers: [{
          firstName: passenger.firstName,
          lastName: passenger.lastName,
          dateOfBirth: passenger.dateOfBirth,
          gender: passenger.gender,
          passportNumber: passenger.passportNumber || undefined,
        }],
      });
      const payment = await payFlightBooking(token, booking.bookingId, paymentMethod);
      setBookingRef(payment.bookingRef);
      setPnr(payment.pnr);
      setCheckoutOffer(null);
      setShowSuccess(true);
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  }

  // Dynamic Sorter Calculations
  const cheapestOffer = offers.length > 0 ? [...offers].sort((a, b) => a.price.total - b.price.total)[0] : null;
  const earliestOffer = offers.length > 0 ? [...offers].sort((a, b) =>
    parseDepartureMinutes(a.segments[0].departureAt) - parseDepartureMinutes(b.segments[0].departureAt),
  )[0] : null;
  
  const fastestOffer = offers.length > 0 ? [...offers].sort((a, b) => {
    const getDur = (o: FlightOffer) => o.segments.reduce((acc, s) => acc + s.duration, 0);
    return getDur(a) - getDur(b);
  })[0] : null;

  // Filter offers
  const filteredOffers = offers.filter(offer => {
    // Stops
    if (selectedStops !== "ALL") {
      const stops = offer.segments.length - 1;
      if (selectedStops === "NON_STOP" && stops > 0) return false;
      if (selectedStops === "1_STOP" && stops > 1) return false;
      if (selectedStops === "2_STOP" && stops < 2) return false;
    }

    // Price
    if (offer.price.total > maxPrice) return false;

    // Time Slot
    if (selectedTimeSlots.length > 0) {
      const mins = parseDepartureMinutes(offer.segments[0].departureAt);
      const hours = Math.floor(mins / 60);
      let slot = "EARLY_MORNING";
      if (hours >= 6 && hours < 12) slot = "MORNING";
      else if (hours >= 12 && hours < 18) slot = "AFTERNOON";
      else if (hours >= 18 || hours < 6) slot = "EVENING";

      if (!selectedTimeSlots.includes(slot)) return false;
    }

    // Airline
    if (selectedAirlines.length > 0 && !selectedAirlines.includes(offer.airline)) return false;

    return true;
  });

  // Sort offers
  const sortedOffers = [...filteredOffers].sort((a, b) => {
    if (sortBy === "earliest") {
      return parseDepartureMinutes(a.segments[0].departureAt) - parseDepartureMinutes(b.segments[0].departureAt);
    }
    if (sortBy === "duration") {
      const getDur = (o: FlightOffer) => o.segments.reduce((acc, s) => acc + s.duration, 0);
      return getDur(a) - getDur(b);
    }
    return a.price.total - b.price.total; // Default: cheapest
  });

  const UNIQUE_AIRLINES = [
    { code: "BG", name: "Biman Bangladesh" },
    { code: "EK", name: "Emirates Airlines" },
    { code: "FZ", name: "FlyDubai" },
    { code: "GF", name: "Gulf Air" },
    { code: "US", name: "US-Bangla Airlines" },
    { code: "QR", name: "Qatar Airways" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-white/10 bg-brand-navy text-white py-4 px-6 sticky top-0 z-40 shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1 text-white hover:text-brand-gold font-bold text-sm transition">
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
            <span className="text-white/20">|</span>
            <span className="text-sm font-semibold text-white/90">Air Ticket Search Engine</span>
          </div>
          <SarahLogo className="scale-90" iconOnly />
        </div>
      </header>

      {/* Main body */}
      <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 flex-1 flex flex-col gap-6">
        
        {/* Search Console Card */}
        <form
          onSubmit={handleSearch}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
        >
          <div className="flex flex-wrap gap-2 border-b pb-3 mb-2">
            {(["ONE_WAY", "ROUND_TRIP", "MULTI_CITY"] as TripType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTripType(t)}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                  tripType === t
                    ? "bg-brand-navy text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {t.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-4 items-end">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">From</label>
              <input
                value={origin}
                onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                placeholder="DAC"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 font-semibold focus:outline-none focus:border-brand-navy"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">To</label>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value.toUpperCase())}
                placeholder="DXB"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 font-semibold focus:outline-none focus:border-brand-navy"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Departure</label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-brand-navy"
                required
              />
            </div>
            
            {tripType === "ROUND_TRIP" ? (
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Return</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-brand-navy"
                />
              </div>
            ) : (
              <div className="hidden sm:block" />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-navy hover:bg-opacity-95 text-white font-bold py-3 rounded-lg text-sm text-center shadow transition disabled:opacity-50"
          >
            {loading ? "Searching GDS Offers..." : "Search Real-Time Flights"}
          </button>
        </form>

        {/* Nearby Dates Fare Strip */}
        {searched && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase mb-3 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-brand-gold" /> Nearby Dates Fare Calendar
            </h4>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {getNearbyDates().map((item) => (
                <button
                  key={item.dateStr}
                  type="button"
                  onClick={() => {
                    setDepartureDate(item.dateStr);
                    const mockEvent = { preventDefault: () => {} } as React.FormEvent;
                    handleSearch(mockEvent);
                  }}
                  className={`flex-1 min-w-[115px] p-3 rounded-xl border text-center transition ${
                    departureDate === item.dateStr
                      ? "border-brand-navy bg-brand-navy text-white shadow"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <p className="text-[10px] uppercase font-bold">{item.dayName}</p>
                  <p className="text-xs font-black mt-0.5">{item.monthDay}</p>
                  <p className={`text-[10px] font-bold mt-1 ${departureDate === item.dateStr ? "text-brand-gold" : "text-brand-navy"}`}>
                    from {formatCurrency(item.price)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results grid (Sidebar + flight listings) */}
        {searched && (
          <div className="grid gap-6 md:grid-cols-4 items-start">
            
            {/* Sidebar filter controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-6">
              <h3 className="font-extrabold text-brand-navy flex items-center gap-1.5 border-b pb-3 text-sm">
                <SlidersHorizontal className="h-4 w-4 text-brand-gold" /> Filter Results
              </h3>

              {/* Stopovers Filter */}
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Transit Stops</label>
                <div className="space-y-2 text-xs text-slate-600">
                  {[
                    { id: "ALL", label: "All Stopovers" },
                    { id: "NON_STOP", label: "Direct (Non-Stop)" },
                    { id: "1_STOP", label: "1 Stop Max" },
                    { id: "2_STOP", label: "2+ Stops" }
                  ].map(st => (
                    <label key={st.id} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="stops"
                        checked={selectedStops === st.id} 
                        onChange={() => setSelectedStops(st.id)}
                        className="rounded text-brand-navy" 
                      />
                      <span>{st.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price range filter */}
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Max Budget</label>
                <input 
                  type="range"
                  min="40000"
                  max="100000"
                  step="2000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-navy"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1.5">
                  <span>BDT 40k</span>
                  <span className="text-brand-navy text-xs">Up to {formatCurrency(maxPrice)}</span>
                  <span>BDT 100k</span>
                </div>
              </div>

              {/* Departure times */}
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Departure Times</label>
                <div className="space-y-2 text-xs text-slate-600">
                  {[
                    { id: "EARLY_MORNING", label: "Early Morning (00:00 - 06:00)" },
                    { id: "MORNING", label: "Morning (06:00 - 12:00)" },
                    { id: "AFTERNOON", label: "Afternoon (12:00 - 18:00)" },
                    { id: "EVENING", label: "Evening (18:00 - 24:00)" }
                  ].map(slot => (
                    <label key={slot.id} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedTimeSlots.includes(slot.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTimeSlots([...selectedTimeSlots, slot.id]);
                          } else {
                            setSelectedTimeSlots(selectedTimeSlots.filter(s => s !== slot.id));
                          }
                        }}
                        className="rounded text-brand-navy" 
                      />
                      <span>{slot.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Airlines */}
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Preferred Airlines</label>
                <div className="space-y-2 text-xs text-slate-600">
                  {UNIQUE_AIRLINES.map(air => (
                    <label key={air.code} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedAirlines.includes(air.code)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAirlines([...selectedAirlines, air.code]);
                          } else {
                            setSelectedAirlines(selectedAirlines.filter(c => c !== air.code));
                          }
                        }}
                        className="rounded text-brand-navy" 
                      />
                      <span>{air.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 border p-3 rounded-xl space-y-2 text-[10px] text-slate-500 leading-normal">
                <p className="flex items-start gap-1"><Shield className="h-3.5 w-3.5 text-brand-gold shrink-0 mt-0.5" /> 100% NBR Compliant invoice generated instantly upon billing approval.</p>
                <p className="flex items-start gap-1"><CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0 mt-0.5" /> Direct GDS connection ensures zero ticketing delay.</p>
              </div>
            </div>

            {/* Flight Results Cards */}
            <div className="md:col-span-3 space-y-4">
              {/* Quick Sorter Highlight Cards */}
              {offers.length > 0 && (
                <div className="grid gap-3 grid-cols-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setSortBy("price")}
                    className={`p-4 rounded-xl border text-left transition ${
                      sortBy === "price"
                        ? "bg-green-50 border-green-300 text-green-900 shadow-sm font-sans"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-sans"
                    }`}
                  >
                    <span className="text-[9px] font-extrabold uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200">CHEAPEST</span>
                    {cheapestOffer && (
                      <div className="mt-2">
                        <p className="text-lg font-black">{formatCurrency(cheapestOffer.price.total)} BDT</p>
                        <p className="text-[10px] text-slate-500 truncate">{cheapestOffer.airlineName}</p>
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSortBy("earliest")}
                    className={`p-4 rounded-xl border text-left transition ${
                      sortBy === "earliest"
                        ? "bg-blue-50 border-blue-300 text-blue-900 shadow-sm font-sans"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-sans"
                    }`}
                  >
                    <span className="text-[9px] font-extrabold uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200">EARLIEST</span>
                    {earliestOffer && (
                      <div className="mt-2">
                        <p className="text-lg font-black">{formatFlightTime(earliestOffer.segments[0].departureAt)}</p>
                        <p className="text-[10px] text-slate-500 truncate">{earliestOffer.airlineName}</p>
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSortBy("duration")}
                    className={`p-4 rounded-xl border text-left transition ${
                      sortBy === "duration"
                        ? "bg-purple-50 border-purple-300 text-purple-900 shadow-sm font-sans"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-sans"
                    }`}
                  >
                    <span className="text-[9px] font-extrabold uppercase bg-purple-100 text-purple-700 px-2 py-0.5 rounded border border-purple-200">FASTEST</span>
                    {fastestOffer && (
                      <div className="mt-2">
                        <p className="text-lg font-black">
                          {Math.floor(fastestOffer.segments.reduce((acc, s) => acc + s.duration, 0) / 60)}h{" "}
                          {fastestOffer.segments.reduce((acc, s) => acc + s.duration, 0) % 60}m
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">{fastestOffer.airlineName}</p>
                      </div>
                    )}
                  </button>
                </div>
              )}

              {sortedOffers.length === 0 ? (
                <div className="bg-white rounded-2xl border p-12 text-center text-slate-500">
                  <p className="font-bold text-slate-700">No flights matched your filter selection.</p>
                  <p className="text-xs mt-1">Please try modifying your date, airports, or transit parameters.</p>
                </div>
              ) : (
                sortedOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition hover-lift flex flex-col font-sans"
                  >
                    <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-brand-navy/10 text-brand-navy font-bold text-[10px] uppercase px-2 py-0.5 rounded border border-brand-navy/10">
                            {offer.airlineName}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">Segment Code: {offer.segments[0].flightNumber}</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-800">
                          <div>
                            <p className="font-black text-slate-900 text-base">{formatFlightTime(offer.segments[0].departureAt)}</p>
                            <p className="text-xs text-slate-500 font-bold">{offer.segments[0].origin}</p>
                          </div>
                          <div className="flex-1 flex flex-col items-center px-4 relative max-w-[120px]">
                            <span className="text-[10px] text-slate-400 mb-1">
                              {offer.segments.reduce((acc, s) => acc + s.duration, 0)} min
                            </span>
                            <div className="w-full border-t border-slate-300 border-dashed relative">
                              <Plane className="h-3 w-3 text-brand-gold absolute left-1/2 -top-1.5 -translate-x-1/2 bg-white px-0.5" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 mt-1">
                              {offer.segments.length === 1 ? "Direct Flight" : `${offer.segments.length - 1} Stop(s)`}
                            </span>
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-base">
                              {formatFlightTime(offer.segments[offer.segments.length - 1].arrivalAt ?? offer.segments[offer.segments.length - 1].departureAt)}
                            </p>
                            <p className="text-xs text-slate-500 font-bold">
                              {offer.segments[offer.segments.length - 1].destination}
                            </p>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                          <span>Checked Bag: {offer.baggage.checked}</span>
                          <span>·</span>
                          <span>Cabin Bag: {offer.baggage.cabin}</span>
                          <span>·</span>
                          <span className={offer.fareRules.refundable ? "text-green-700 font-bold" : "text-slate-400"}>
                            {offer.fareRules.refundable ? "Refundable" : "Non-refundable"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 flex sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-2 shrink-0">
                        <div>
                          <span className="text-xs text-slate-500 block">Total Price</span>
                          <span className="text-2xl font-black text-brand-navy">
                            {formatCurrency(offer.price.total)}
                          </span>
                          <span className="text-[8px] text-slate-400 block mt-0.5">0.3% AIT & VAT included</span>
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => {
                              if (expandedCardId === offer.id) {
                                setExpandedCardId(null);
                              } else {
                                setExpandedCardId(offer.id);
                                setActiveDetailsTab("FLIGHT");
                              }
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-1 transition border"
                          >
                            {expandedCardId === offer.id ? "Hide Details" : "Flight Details"}
                          </button>
                          <button 
                            onClick={() => setCheckoutOffer(offer)}
                            className="bg-brand-gold text-brand-navy hover:opacity-90 font-black text-xs px-5 py-2.5 rounded-lg flex items-center gap-1 shadow transition"
                          >
                            Book Now <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable details panel */}
                    {expandedCardId === offer.id && (
                      <div className="border-t bg-slate-50 p-6 space-y-4 border-dashed">
                        <div className="flex border-b divide-x text-xs font-bold text-slate-500">
                          {(["FLIGHT", "BAGGAGE", "RULES"] as const).map(tab => (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => setActiveDetailsTab(tab)}
                              className={`px-4 py-2 transition ${
                                activeDetailsTab === tab
                                  ? "border-b-2 border-brand-navy text-brand-navy bg-white"
                                  : "border-transparent hover:text-brand-navy"
                              }`}
                            >
                              {tab === "FLIGHT" && "Flight Details"}
                              {tab === "BAGGAGE" && "Baggage Allowance"}
                              {tab === "RULES" && "Fare & Penalty Rules"}
                            </button>
                          ))}
                        </div>

                        {activeDetailsTab === "FLIGHT" && (
                          <div className="space-y-4 text-xs text-slate-700">
                            <h5 className="font-extrabold text-brand-navy text-sm uppercase">Outbound Schedule: {origin} → {destination}</h5>
                            <div className="relative pl-6 border-l-2 border-slate-300 ml-3 space-y-6">
                              {offer.segments.map((seg, idx) => (
                                <div key={idx} className="relative">
                                  <div className="absolute -left-[31px] top-1 bg-brand-navy rounded-full w-4 h-4 border-2 border-white flex items-center justify-center shadow" />
                                  <div className="space-y-1">
                                    <p className="font-black text-slate-900 text-sm">{formatFlightTime(seg.departureAt)} · Departure from {seg.origin}</p>
                                    <p className="text-slate-500 font-medium">{seg.origin === "DAC" ? "Hazrat Shahjalal Int'l Airport, Terminal 2" : "Local International Terminal"}</p>
                                    <div className="bg-white p-3 rounded-lg border my-2 flex gap-4 text-slate-600 leading-relaxed max-w-lg shadow-sm">
                                      <Plane className="h-4 w-4 text-brand-gold shrink-0 mt-0.5" />
                                      <div>
                                        <p className="font-bold text-brand-navy">{offer.airlineName} · Flight {seg.flightNumber}</p>
                                        <p className="text-[10px]">Aircraft Type: Boeing 777-300ER · Class: Economy Class ({cabinClass})</p>
                                        <p className="text-[10px]">Flight Duration: {Math.floor(seg.duration / 60)}h {seg.duration % 60}m</p>
                                      </div>
                                    </div>
                                    <p className="font-black text-slate-900 text-sm">Arrival at {seg.destination}</p>
                                    <p className="text-slate-500 font-medium">{seg.destination === "DXB" ? "Dubai International Airport, Terminal 3" : "Dest International Terminal"}</p>
                                  </div>

                                  {idx < offer.segments.length - 1 && (
                                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded-lg my-3 text-[10px] font-bold inline-block">
                                      Layover in {seg.destination} (approx. 2h 15m transfer time)
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {activeDetailsTab === "BAGGAGE" && (
                          <div className="space-y-3">
                            <h5 className="font-extrabold text-brand-navy text-xs uppercase">Baggage Allowance Policy Guidelines</h5>
                            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                              <thead>
                                <tr className="bg-slate-100 border-b">
                                  <th className="p-3">Category</th>
                                  <th className="p-3">Checked Baggage Limit</th>
                                  <th className="p-3">Cabin Handbag Limit</th>
                                  <th className="p-3 text-right">Extra Weight Charges</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="p-3 font-semibold">Adult Passenger</td>
                                  <td className="p-3">{offer.baggage.checked}</td>
                                  <td className="p-3">{offer.baggage.cabin}</td>
                                  <td className="p-3 text-right text-brand-gold font-bold">BDT 950 / kg</td>
                                </tr>
                              </tbody>
                            </table>
                            <p className="text-[10px] text-slate-400">* Hand baggage dimensions must not exceed 55cm x 40cm x 20cm. Excess baggage rates apply per airport security policies.</p>
                          </div>
                        )}

                        {activeDetailsTab === "RULES" && (
                          <div className="space-y-3">
                            <h5 className="font-extrabold text-brand-navy text-xs uppercase">Date Change & Refund Rules</h5>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="bg-white border rounded-xl p-4 shadow-sm space-y-2">
                                <h6 className="font-bold text-slate-800 text-xs border-b pb-1.5 flex justify-between">
                                  <span>Refund Policy</span>
                                  <span className={offer.fareRules.refundable ? "text-green-700 font-bold" : "text-slate-400"}>
                                    {offer.fareRules.refundable ? "Refundable" : "Non-Refundable"}
                                  </span>
                                </h6>
                                <div className="text-[11px] text-slate-600 space-y-1">
                                  <p>• Cancellation before departure: <strong>BDT {offer.fareRules.changeFee + 2000}</strong> penalty</p>
                                  <p>• Cancellation after departure: <strong>BDT {offer.fareRules.changeFee + 4000}</strong> penalty</p>
                                  <p>• Sarah Travels service processing fee of <strong>BDT 1,500</strong> applies per ticket.</p>
                                </div>
                              </div>

                              <div className="bg-white border rounded-xl p-4 shadow-sm space-y-2">
                                <h6 className="font-bold text-slate-800 text-xs border-b pb-1.5">Date Change Policy</h6>
                                <div className="text-[11px] text-slate-600 space-y-1">
                                  <p>• Reissue date change penalty: <strong>BDT {offer.fareRules.changeFee}</strong> flat rate</p>
                                  <p>• No-Show flight rebooking penalty: <strong>BDT {offer.fareRules.changeFee + 3000}</strong></p>
                                  <p>• GDS cabin class difference costs may apply at flight reissue.</p>
                                  <p>• Sarah Travels change service fee: <strong>BDT 1,000</strong></p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </div>

      {/* Checkout modal */}
      {checkoutOffer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-black text-brand-navy">Complete Flight Booking</h2>
              <button onClick={() => setCheckoutOffer(null)} className="text-slate-400 hover:text-brand-navy"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 border rounded-xl p-4 text-sm">
                <p className="font-bold text-brand-navy">{checkoutOffer.airlineName}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {origin} → {destination} · {checkoutOffer.segments[0].flightNumber}
                </p>
                <p className="text-xs text-slate-500">{formatFlightTime(checkoutOffer.segments[0].departureAt)} · {departureDate}</p>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Base fare</span><span>{formatCurrency(checkoutOffer.price.total)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Service charge (5%)</span><span>{formatCurrency(serviceFee)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">VAT (15%)</span><span>{formatCurrency(vatAmount)}</span></div>
                  <div className="flex justify-between font-black text-brand-navy pt-1 border-t"><span>Total</span><span>{formatCurrency(grandTotal)}</span></div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-sm text-brand-navy">Passenger details</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="First name" value={passenger.firstName} onChange={e => setPassenger({ ...passenger, firstName: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required />
                  <input placeholder="Last name" value={passenger.lastName} onChange={e => setPassenger({ ...passenger, lastName: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required />
                </div>
                <input type="date" value={passenger.dateOfBirth} onChange={e => setPassenger({ ...passenger, dateOfBirth: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
                <select value={passenger.gender} onChange={e => setPassenger({ ...passenger, gender: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
                <input placeholder="Passport number (optional)" value={passenger.passportNumber} onChange={e => setPassenger({ ...passenger, passportNumber: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                <input type="email" placeholder="Email" value={passenger.contactEmail} onChange={e => setPassenger({ ...passenger, contactEmail: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
                <input type="tel" placeholder="Phone" value={passenger.contactPhone} onChange={e => setPassenger({ ...passenger, contactPhone: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-sm text-brand-navy">Payment method</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[{ id: "BKASH", label: "bKash" }, { id: "NAGAD", label: "Nagad" }, { id: "SSLCOMMERZ", label: "Card / Bank" }, { id: "ROCKET", label: "Rocket" }].map(m => (
                    <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)}
                      className={`text-xs font-bold py-2 rounded-lg border ${paymentMethod === m.id ? "bg-brand-navy text-white border-brand-navy" : "bg-white text-slate-600"}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {bookingError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{bookingError}</p>}

              <button
                onClick={handleBookFlight}
                disabled={bookingLoading || !passenger.firstName || !passenger.lastName || !passenger.dateOfBirth || !passenger.contactEmail || !passenger.contactPhone}
                className="w-full bg-brand-navy text-white font-bold py-3 rounded-lg text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {bookingLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : `Pay ${formatCurrency(grandTotal)} & Get E-Ticket`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border p-8 text-center shadow-2xl space-y-4">
            <div className="mx-auto bg-green-50 p-4 rounded-full text-green-600 w-20 h-20 flex items-center justify-center">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-black text-brand-navy">E-Ticket Issued!</h2>
            <p className="text-xs text-slate-500">Booking ref: <span className="font-bold text-brand-navy">{bookingRef}</span></p>
            <p className="text-xs text-slate-500">GDS PNR: <span className="font-bold text-brand-gold">{pnr}</span></p>
            <p className="text-sm text-slate-600">Confirmation sent to {passenger.contactEmail}</p>
            <div className="flex gap-3 justify-center pt-2">
              <Link href="/account/bookings" className="bg-brand-navy text-white text-xs font-bold px-6 py-2.5 rounded-lg">My Bookings</Link>
              <button onClick={() => setShowSuccess(false)} className="bg-slate-100 text-slate-700 text-xs font-bold px-6 py-2.5 rounded-lg">Book Another</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
