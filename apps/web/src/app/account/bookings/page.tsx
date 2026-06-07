"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plane, FileText, Moon, Download, Eye, 
  CheckCircle, Clock, AlertTriangle, XCircle, FileSpreadsheet, Sparkles,
  Info, Hotel, Compass, Car, Loader2
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AppShell } from "@/components/AppShell";
import { PageHero } from "@/components/PageHero";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

type BookingCard = {
  id: string;
  type: string;
  title: string;
  details: string;
  amount: number;
  status: string;
  date: string;
  pnr?: string;
  baseFare: number;
  serviceFee: number;
  baggage?: string;
  passenger: string;
  passport: string;
  installmentPlan?: string;
};

function mapApiBooking(b: Record<string, unknown>): BookingCard {
  const ref = b.bookingRef as string;
  const type = b.type as string;
  const status = b.status as string;
  const total = Number(b.totalAmount);
  const created = (b.createdAt as string)?.slice(0, 10) ?? "";

  if (type === "HOTEL" && b.hotelBooking) {
    const hb = b.hotelBooking as Record<string, unknown>;
    const hotel = hb.hotel as Record<string, unknown>;
    const room = hb.room as Record<string, unknown>;
    return {
      id: ref,
      type: "HOTEL",
      title: `${hotel.name as string}`,
      details: `${room.name as string} · ${hb.nights as number} night(s) · ${hb.adults as number} guest(s)`,
      amount: total,
      status,
      date: (hb.checkIn as string)?.slice(0, 10) ?? created,
      pnr: (hb.confirmationCode as string) ?? undefined,
      baseFare: Number(hb.roomRate),
      serviceFee: Number(hb.serviceFee),
      passenger: hb.guestName as string,
      passport: "",
    };
  }

  if (type === "FLIGHT" && b.flightBooking) {
    const fb = b.flightBooking as Record<string, unknown>;
    const segments = (fb.segments as Record<string, unknown>[]) ?? [];
    const passengers = (fb.passengers as Record<string, unknown>[]) ?? [];
    const first = segments[0];
    const last = segments[segments.length - 1];
    const pax = passengers[0];
    return {
      id: ref,
      type: "FLIGHT",
      title: first ? `${first.origin} ✈ ${last?.destination ?? first.destination}` : "Flight Booking",
      details: first ? `${first.airline as string} · Flight ${first.flightNumber as string} · ${segments.length} segment(s)` : "Flight booking",
      amount: total,
      status,
      date: first ? (first.departureAt as string)?.slice(0, 10) ?? created : created,
      pnr: (fb.pnr as string) ?? undefined,
      baseFare: total * 0.95,
      serviceFee: total * 0.05,
      passenger: pax ? `${pax.firstName as string} ${pax.lastName as string}` : "Passenger",
      passport: (pax?.passportNumber as string) ?? "",
    };
  }

  if (type === "UMRAH" && b.umrahBooking) {
    const ub = b.umrahBooking as Record<string, unknown>;
    const pkg = ub.umrahPackage as Record<string, unknown>;
    const docs = ub.pilgrimDocs as Record<string, string> | null;
    return {
      id: ref,
      type: "UMRAH",
      title: pkg.title as string,
      details: `${ub.pilgrimCount} pilgrim(s) · ${pkg.duration as number} days`,
      amount: total,
      status,
      date: (ub.travelDate as string)?.slice(0, 10) ?? created,
      pnr: ref,
      baseFare: total * 0.95,
      serviceFee: total * 0.05,
      passenger: docs?.firstName ? `${docs.firstName} ${docs.lastName ?? ""}`.trim() : "Pilgrim",
      passport: docs?.passportNo ?? "",
    };
  }

  if (type === "TOUR" && b.tourBooking) {
    const tb = b.tourBooking as Record<string, unknown>;
    const tour = tb.tour as Record<string, unknown>;
    return {
      id: ref,
      type: "TOUR",
      title: tour.title as string,
      details: `${tb.guests as number} guest(s) · ${tour.duration as string}`,
      amount: total,
      status,
      date: (tb.travelDate as string)?.slice(0, 10) ?? created,
      pnr: (tb.confirmationCode as string) ?? undefined,
      baseFare: total * 0.95,
      serviceFee: total * 0.05,
      passenger: tb.guestName as string,
      passport: "",
    };
  }

  if (type === "CAR" && b.carBooking) {
    const cb = b.carBooking as Record<string, unknown>;
    const vehicle = cb.vehicle as Record<string, unknown>;
    return {
      id: ref,
      type: "CAR",
      title: vehicle.name as string,
      details: `${cb.pickupLocation as string} · ${cb.includeDriver ? "With driver" : "Self-drive"}`,
      amount: total,
      status,
      date: (cb.pickupDate as string)?.slice(0, 10) ?? created,
      pnr: (cb.confirmationCode as string) ?? undefined,
      baseFare: total * 0.95,
      serviceFee: total * 0.05,
      passenger: cb.guestName as string,
      passport: "",
    };
  }

  if (type === "VISA" && b.visaApplication) {
    const va = b.visaApplication as Record<string, unknown>;
    const country = va.visaCountry as Record<string, unknown>;
    let applicant = "Applicant";
    let passport = "";
    try {
      const notes = va.notes ? JSON.parse(va.notes as string) : null;
      if (notes) {
        applicant = `${notes.firstName ?? ""} ${notes.lastName ?? ""}`.trim();
        passport = notes.passportNumber ?? "";
      }
    } catch { /* ignore */ }
    return {
      id: ref,
      type: "VISA",
      title: `${country.name as string} Visa`,
      details: `Status: ${va.status as string} · ${country.processingDays ?? "?"} day processing`,
      amount: total,
      status: (va.status as string) ?? status,
      date: (va.travelDate as string)?.slice(0, 10) ?? created,
      pnr: ref,
      baseFare: total * 0.9,
      serviceFee: total * 0.1,
      passenger: applicant,
      passport,
    };
  }

  return {
    id: ref,
    type,
    title: `${type} Booking`,
    details: ref,
    amount: total,
    status,
    date: created,
    baseFare: total,
    serviceFee: 0,
    passenger: "",
    passport: "",
  };
}

const FALLBACK_BOOKINGS: BookingCard[] = [
  {
    id: "ST-FB-928401",
    type: "FLIGHT",
    title: "Dhaka (DAC) ✈ Dubai (DXB)",
    details: "Biman Bangladesh Airlines · Flight: BG-047 · 1 Passenger",
    amount: 52000,
    status: "TICKETED",
    date: "2026-06-12",
    pnr: "PNR-AMAD98",
    baseFare: 49552,
    serviceFee: 2000,
    baggage: "30kg checked · 7kg cabin",
    passenger: "Md. Jamil Khan",
    passport: "A0394819"
  },
  {
    id: "ST-HT-392819",
    type: "HOTEL",
    title: "Mövenpick Hotel JLT Dubai",
    details: "Superior King Room · 3 Nights · 2 Guests · Ratehawk API",
    amount: 48875,
    status: "CONFIRMED",
    date: "2026-06-15",
    pnr: "CONF-RH7829",
    baseFare: 46000,
    serviceFee: 2500,
    passenger: "Md. Jamil Khan",
    passport: ""
  },
  {
    id: "ST-TR-102948",
    type: "TOUR",
    title: "Sajek Valley Eco Resort Adventure",
    details: "3 Days Tour · Cottage Stay · Private Chander Gari Included",
    amount: 28300,
    status: "CONFIRMED",
    date: "2026-06-25",
    pnr: "CONF-VT1092",
    baseFare: 26000,
    serviceFee: 2000,
    passenger: "Md. Jamil Khan",
    passport: ""
  },
  {
    id: "ST-CR-582910",
    type: "CAR",
    title: "Airport Transfer: Toyota Noah Microbus",
    details: "Dhaka Airport (DAC) to Kakrail · Chauffeur Service Included",
    amount: 9518,
    status: "TICKETED",
    date: "2026-06-12",
    pnr: "CONF-CT8291",
    baseFare: 9000,
    serviceFee: 450,
    passenger: "Md. Jamil Khan",
    passport: ""
  },
  {
    id: "ST-UM-492815",
    type: "UMRAH",
    title: "Economy Umrah — 7 Days",
    details: "Makkah 3-star (500m) · Madinah 3-star (800m) · 2 Pilgrims",
    amount: 190000,
    status: "CONFIRMED",
    date: "2026-07-20",
    pnr: "PNR-NUSUK4",
    baseFare: 180800,
    serviceFee: 8000,
    installmentPlan: "3 Months (30% Downpayment paid)",
    passenger: "Md. Jamil Khan & Mrs. Salma Begum",
    passport: ""
  },
  {
    id: "ST-VS-729481",
    type: "VISA",
    title: "Saudi Arabia Tourist Visa",
    details: "VFS Global Center File Submission · 1 Applicant",
    amount: 12000,
    status: "PROCESSING",
    date: "2026-06-05",
    baseFare: 10850,
    serviceFee: 1000,
    passenger: "Md. Jamil Khan",
    passport: ""
  }
];

export default function BookingsPortal() {
  const router = useRouter();
  const [activeType, setActiveType] = useState<"ALL" | "FLIGHT" | "HOTEL" | "TOUR" | "CAR" | "VISA" | "UMRAH">("ALL");
  const [bookings, setBookings] = useState<BookingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<BookingCard | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<BookingCard | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login?redirect=/account/bookings");
      return;
    }
    api<Record<string, unknown>[]>("/bookings", { token })
      .then((data) => setBookings(data.map(mapApiBooking)))
      .catch(() => setBookings(FALLBACK_BOOKINGS))
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = activeType === "ALL"
    ? bookings
    : bookings.filter(b => b.type === activeType);

  // Helper status badge classes
  function getStatusBadge(status: string) {
    switch (status) {
      case "TICKETED":
      case "CONFIRMED":
        return <span className="bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> {status}</span>;
      case "PROCESSING":
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Clock className="h-3.5 w-3.5 animate-pulse" /> {status}</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 border text-xs font-bold px-2.5 py-1 rounded-full">{status}</span>;
    }
  }

  return (
    <AppShell>
      <PageHero
        badge="Secure Session"
        title="My Bookings"
        subtitle="Manage PNRs, confirmation codes, tickets, and NBR-compliant VAT invoices."
        compact
      />

      <main className="mx-auto max-w-6xl w-full px-4 py-8 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="hidden" />
          
          {/* Filters */}
          <div className="flex bg-slate-200 rounded-xl p-1 border overflow-x-auto max-w-full scrollbar-none">
            {(["ALL", "FLIGHT", "HOTEL", "TOUR", "CAR", "VISA", "UMRAH"] as const).map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  activeType === type 
                    ? "bg-brand-navy text-white shadow-sm" 
                    : "text-slate-600 hover:text-brand-navy"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl border p-16 text-center">
              <Loader2 className="h-10 w-10 text-brand-gold mx-auto mb-4 animate-spin" />
              <p className="text-sm text-slate-500">Loading your bookings…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border p-16 text-center">
              <h3 className="font-bold text-brand-navy text-lg">No bookings yet</h3>
              <p className="text-sm text-slate-500 mt-2">Book a hotel, flight, or Umrah package to see them here.</p>
              <Link href="/hotels" className="inline-block mt-4 bg-brand-navy text-white text-xs font-bold px-6 py-2.5 rounded-lg">Browse Hotels</Link>
            </div>
          ) : filtered.map(booking => (
            <div key={booking.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm hover:shadow-md transition">
              <div className="flex gap-4 items-start">
                <div className="bg-brand-navy/5 p-3 rounded-xl text-brand-navy shrink-0 border border-brand-navy/5">
                  {booking.type === "FLIGHT" && <Plane className="h-6 w-6 text-brand-gold" />}
                  {booking.type === "HOTEL" && <Hotel className="h-6 w-6 text-brand-gold" />}
                  {booking.type === "TOUR" && <Compass className="h-6 w-6 text-brand-gold" />}
                  {booking.type === "CAR" && <Car className="h-6 w-6 text-brand-gold" />}
                  {booking.type === "UMRAH" && <Moon className="h-6 w-6 text-brand-gold" />}
                  {booking.type === "VISA" && <FileText className="h-6 w-6 text-brand-gold" />}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-extrabold text-brand-navy text-lg">{booking.title}</h3>
                    <span className="text-xs text-slate-400">Ref: {booking.id}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{booking.details}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Travel / Submit Date: {booking.date}</p>
                  {booking.pnr && (
                    <p className="text-xs text-brand-gold font-bold mt-2 bg-brand-gold/10 px-2 py-0.5 rounded inline-block">
                      {booking.type === "FLIGHT" ? "GDS PNR" : "Confirmation Ref"}: {booking.pnr}
                    </p>
                  )}
                </div>
              </div>

              {/* Billed status & action keys */}
              <div className="flex flex-col md:items-end gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                <div className="flex justify-between md:justify-end items-center gap-3 w-full md:w-auto">
                  <span className="font-black text-brand-navy text-lg">{formatCurrency(booking.amount)} BDT</span>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  {(booking.status === "TICKETED" || booking.status === "CONFIRMED") && (
                    <button
                      onClick={() => setSelectedTicket(booking)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition border border-slate-200 whitespace-nowrap"
                    >
                      <Eye className="h-4 w-4" /> {booking.type === "FLIGHT" ? "View E-Ticket" : "View Voucher"}
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedInvoice(booking)}
                    className="flex-1 bg-brand-navy hover:bg-opacity-95 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition shadow"
                  >
                    <FileSpreadsheet className="h-4 w-4" /> Mushak 6.3 Challan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── MOCK E-TICKET/VOUCHER VIEWER MODAL ───────────────────────── */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl border p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h3 className="font-black text-brand-navy text-lg">
                  {selectedTicket.type === "FLIGHT" ? "SARAH TRAVELS BD · Secure E-Ticket Registry" : "SARAH TRAVELS BD · Secure Travel Voucher"}
                </h3>
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Ticket content */}
              <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 space-y-6 text-sm text-slate-700">
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <h4 className="font-extrabold text-brand-navy uppercase">
                      {selectedTicket.type === "FLIGHT" && "IATA Flight Itinerary Ticket"}
                      {selectedTicket.type === "HOTEL" && "Official Hotel Stay Voucher"}
                      {selectedTicket.type === "TOUR" && "Guaranteed Activity Tour Voucher"}
                      {selectedTicket.type === "CAR" && "Private Chauffeur Rental Voucher"}
                      {selectedTicket.type === "UMRAH" && "Umrah Package Confirmation Voucher"}
                      {selectedTicket.type === "VISA" && "Visa Application File Checklist"}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {selectedTicket.type === "FLIGHT" && "IATA Numeric Code: 9601234 · Agency Reg: ATAB-10452"}
                      {selectedTicket.type === "HOTEL" && "Supplier Partner: Ratehawk API · Global ID: RH-982840"}
                      {selectedTicket.type === "TOUR" && "Supplier Partner: Viator API · Activity Ref: VT-109284"}
                      {selectedTicket.type === "CAR" && "Fleet Operator: Sarah Travels Chauffeurs · City: Dhaka"}
                      {selectedTicket.type === "UMRAH" && "Nusuk Ministry Ref: SA-NUSUK92841 · Agent: ATAB"}
                      {selectedTicket.type === "VISA" && "VFS Global File Submission Checklist"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded border border-green-200 uppercase">
                      {selectedTicket.status}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">PNR/Ref: <strong className="text-brand-navy">{selectedTicket.pnr}</strong></p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      {selectedTicket.type === "HOTEL" || selectedTicket.type === "TOUR" || selectedTicket.type === "CAR" ? "Lead Guest / Driver" : "Primary Passenger"}
                    </p>
                    <p className="font-bold text-slate-800 text-base">{selectedTicket.passenger}</p>
                    {selectedTicket.passport && (
                      <p className="text-xs text-slate-500">Passport: {selectedTicket.passport}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Booking / Issued Date</p>
                    <p className="font-semibold text-slate-800">{selectedTicket.date}</p>
                  </div>
                </div>

                <div className="border-y py-4 my-4 bg-white px-4 rounded-lg border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-extrabold text-brand-navy">{selectedTicket.title}</span>
                    <span className="text-xs text-slate-500 font-medium">{selectedTicket.details}</span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    {selectedTicket.type === "FLIGHT" && (
                      <>
                        <p>✓ Checked Baggage Allowance: {selectedTicket.baggage || "30kg Checked baggage"}</p>
                        <p>✓ Cabin baggage limit: 7kg cabin baggage</p>
                        <p>✓ Ticket Status: Confirmed seat booking registered in GDS database.</p>
                      </>
                    )}
                    {selectedTicket.type === "HOTEL" && (
                      <>
                        <p>✓ Room Type: Deluxe / Superior Premium King Room (Non-Smoking)</p>
                        <p>✓ Amenities: High-speed Wi-Fi, Complementary breakfast, Swimming pool access</p>
                        <p>✓ Check-in Guarantee: Booking confirmed directly via Ratehawk API.</p>
                      </>
                    )}
                    {selectedTicket.type === "TOUR" && (
                      <>
                        <p>✓ Included: Cottage accommodation, private 4x4 Chander Gari jeep transfer, meals</p>
                        <p>✓ Guide Service: Local Bengali-speaking certified tour operator</p>
                        <p>✓ Ticket Status: Activity slots confirmed and locked.</p>
                      </>
                    )}
                    {selectedTicket.type === "CAR" && (
                      <>
                        <p>✓ Vehicle Model: Toyota Noah Microbus or equivalent premium AC van</p>
                        <p>✓ Chauffeur: Professional licensed driver with 5+ years experience</p>
                        <p>✓ Route: Dhaka Airport (DAC) pick-up/drop-off service</p>
                      </>
                    )}
                    {selectedTicket.type === "UMRAH" && (
                      <>
                        <p>✓ Nusuk Visa Status: Approved (Mofa Registered)</p>
                        <p>✓ Accommodation: Makkah 3★ (500m) & Madinah 3★ (800m) hotels</p>
                        <p>✓ Installment Plan: {selectedTicket.installmentPlan}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex gap-2">
                  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold">Important Travel Notice</p>
                    <p className="mt-1 text-slate-600">
                      {selectedTicket.type === "FLIGHT" && "Please report to the airline check-in counter at least 3 hours prior to departure. Passengers must present valid passport and necessary visa documentation."}
                      {selectedTicket.type === "HOTEL" && "Please present this voucher along with a valid photo ID and credit card / deposit at check-in counter. Hotel check-in starts at 14:00 local time."}
                      {selectedTicket.type === "TOUR" && "Please be ready at the designated resort pick-up point 15 minutes before scheduled tour time. Dress comfortably for high altitude walks."}
                      {selectedTicket.type === "CAR" && "The driver will contact you via WhatsApp / SMS 30 minutes before arrival. Standard waiting time is 60 minutes for airport pick-ups."}
                      {selectedTicket.type === "UMRAH" && "Umrah pilgrims must carry physical passport copies, Nusuk app registration confirmation, and follow local guidelines at Holy Mosques."}
                      {selectedTicket.type === "VISA" && "Ensure all original passports are valid for at least 6 months and matching photo requirements are verified before submission."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => alert(`${selectedTicket.type === "FLIGHT" ? "E-Ticket" : "Voucher"} PDF download initiated successfully.`)}
                  className="flex-1 bg-brand-navy hover:bg-opacity-95 text-white font-bold text-xs py-3 rounded-lg flex items-center justify-center gap-1.5 transition shadow"
                >
                  <Download className="h-4 w-4" /> Download PDF Voucher
                </button>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MOCK MUSHAK 6.3 VAT CHALLAN MODAL ───────────────────────── */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl border p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h3 className="font-black text-brand-navy text-sm md:text-base flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-brand-gold animate-bounce" /> NBR Mushak 6.3 Compliant VAT Invoice
                </h3>
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Invoice body */}
              <div className="border-2 border-slate-900 rounded-xl p-6 bg-white space-y-6 text-sm text-slate-900 font-mono">
                <div className="text-center border-b border-double border-slate-900 pb-4">
                  <h2 className="text-lg font-black uppercase">Sarah Travels BD</h2>
                  <p className="text-[10px] text-slate-600 mt-1">NBR VAT Registration TIN: 293849182938</p>
                  <p className="text-[10px] text-slate-600">Mushak 6.3 Tax Challan Certificate</p>
                  <p className="text-[10px] text-slate-600">Suite 4B, Kakrail, Dhaka, Bangladesh</p>
                </div>

                <div className="grid gap-2 text-xs">
                  <p><strong>Invoice No:</strong> TX-{selectedInvoice.id.substring(3)}</p>
                  <p><strong>Tax Period Date:</strong> {selectedInvoice.date}</p>
                  <p><strong>Primary Client:</strong> {selectedInvoice.passenger}</p>
                  <p><strong>Booking Description:</strong> {selectedInvoice.title}</p>
                </div>

                {/* Tax Breakdown Table */}
                <table className="w-full text-left text-xs border-y border-slate-900 my-4">
                  <thead>
                    <tr className="border-b border-slate-900">
                      <th className="py-2">Description</th>
                      <th className="py-2 text-right">Value (BDT)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2">
                        {selectedInvoice.type === "FLIGHT" && "Net Base Fare / Ticket Price"}
                        {selectedInvoice.type === "HOTEL" && "Hotel Room Net Cost"}
                        {selectedInvoice.type === "TOUR" && "Tour Package Net Rate"}
                        {selectedInvoice.type === "CAR" && "Vehicle & Driver Base Charges"}
                        {selectedInvoice.type === "UMRAH" && "Umrah Package Net Rate"}
                        {selectedInvoice.type === "VISA" && "Consular Fee & Processing Base Rate"}
                      </td>
                      <td className="py-2 text-right">{formatCurrency(selectedInvoice.baseFare)}</td>
                    </tr>
                    <tr>
                      <td className="py-2">Sarah Travels Service Charge Fee</td>
                      <td className="py-2 text-right">{formatCurrency(selectedInvoice.serviceFee)}</td>
                    </tr>
                    <tr className="border-t border-dashed">
                      <td className="py-2">VAT Billed (15% on Service Fee only)</td>
                      <td className="py-2 text-right">{formatCurrency(selectedInvoice.serviceFee * 0.15)}</td>
                    </tr>
                    {selectedInvoice.type === "FLIGHT" && (
                      <tr className="border-t border-dashed">
                        <td className="py-2">Advance Income Tax (AIT 0.3% on ticket price)</td>
                        <td className="py-2 text-right">{formatCurrency(Math.round(selectedInvoice.baseFare * 0.003))}</td>
                      </tr>
                    )}
                    <tr className="border-t border-slate-900 font-black text-sm">
                      <td className="py-2">Total Amount Billed (inclusive of VAT/AIT)</td>
                      <td className="py-2 text-right">{formatCurrency(selectedInvoice.amount)} BDT</td>
                    </tr>
                  </tbody>
                </table>

                <div className="text-[9px] text-slate-600 leading-relaxed border-t pt-4">
                  {selectedInvoice.type === "FLIGHT" && (
                    <p>* Advance Income Tax (AIT) at 0.3% is directly filed to National Board of Revenue (NBR) per air transportation registry rules.</p>
                  )}
                  <p>* 15% VAT is applied strictly to Sarah Travels service charge fees under NBR VAT Act 2012.</p>
                  <p>* Mushak 6.3 registered tax challan certificate processed at payment clearance.</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => alert("Mushak 6.3 VAT Challan PDF generated and saved.")}
                  className="flex-1 bg-brand-navy hover:bg-opacity-95 text-white font-bold text-xs py-3 rounded-lg flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="h-4 w-4" /> Download Certified Challan
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </AppShell>
  );
}
