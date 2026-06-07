"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, MapPin, CheckCircle, Compass, Calendar, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { SarahLogo } from "@/components/SarahLogo";
import { getToken } from "@/lib/auth";
import { getTour, bookTour, payTourBooking } from "@/lib/tours-api";
import { tourImages, travelImages } from "@/lib/travelImages";

const TOURS_DETAILS = {
  "t1": {
    title: "Cox's Bazar Beach Getaway",
    destination: "Cox's Bazar",
    duration: "3 Days / 2 Nights",
    price: 14500,
    description: "Enjoy the world's longest natural sandy beach in Cox's Bazar. Premium resort stay, guided sightseeing of Marine Drive, Himchori hill trails, and Inani coral beach included.",
    inclusions: ["Premium resort accommodation (2 nights)", "Daily buffet breakfast", "AC private car for airport transfers", "Himchori & Inani sightseeing tour", "Local expert guide support"],
    exclusions: ["Lunch & dinner meals", "Personal shopping/tips", "Parasailing or water sports surcharges"],
    itinerary: [
      { day: 1, title: "Arrival & Beach Sunset Walk", desc: "Airport pick up. Check-in to resort. Sunset view at Laboni beach." },
      { day: 2, title: "Marine Drive Sightseeing Tour", desc: "Drive along the scenic Marine Drive. Explore Himchori national park and Inani coral sands." },
      { day: 3, title: "Shopping & Departure", desc: "Visit Burmese market for local crafts. Check out and transfer to airport." }
    ]
  },
  "t2": {
    title: "Sundarbans Mangrove Cruise",
    destination: "Sundarbans",
    duration: "4 Days / 3 Nights",
    price: 19800,
    description: "Embark on an adventurous deep forest river boat cruise in the world's largest mangrove forest. Spot Royal Bengal tigers, deer, crocodiles, and wild dolphins in their native habitats.",
    inclusions: ["Forest cruise boat cabins (3 nights)", "All meals (Breakfast, Lunch, Dinner)", "Forest department entry permission fees", "Armed forest guard protection", "Boat canals tour"],
    exclusions: ["Personal tips/expenses", "Soft drinks or bottled snacks"],
    itinerary: [
      { day: 1, title: "Khulna Reception & Boarding", desc: "Reception at Khulna ghat. Board the cruise vessel. Set sail toward Sundarbans forest." },
      { day: 2, title: "Kotka Wildlife Trail & Hiking", desc: "Morning canopy walking. Watch deer at Kotka sanctuary. Evening canal cruising." },
      { day: 3, title: "Harbaria Forest Trail", desc: "Trace tiger tracks on muddy trails. Explore Harbaria forest office. Dolphin spotting." },
      { day: 4, title: "Khulna return & Check-out", desc: "Enjoy final morning sunrise in mangrove channels. Sail back to Khulna and depart." }
    ]
  },
  "t3": {
    title: "Sylhet Tea Gardens Retreat",
    destination: "Sylhet",
    duration: "3 Days / 2 Nights",
    price: 11000,
    description: "Relax amidst the serene landscape of tea estates in Sreemangal and Sylhet. Explore Lalakhal clear waters, Jaflong stone collectors, and Ratargul swamp forest.",
    inclusions: ["Tea estate cottage room (2 nights)", "Breakfast included", "Lalakhal boat cruise", "AC local transport", "Jaflong & Ratargul permissions"],
    exclusions: ["Personal shopping", "Special local meals"],
    itinerary: [
      { day: 1, title: "Sylhet Arrival & Jaflong", desc: "Pick up. Explore Jaflong stone river. Check-in to forest cottage." },
      { day: 2, title: "Ratargul Swamp Forest & Lalakhal", desc: "Boat safari in the swamp forest. Afternoon cruise in the emerald waters of Lalakhal." },
      { day: 3, title: "Tea Gardens & Departure", desc: "Trek through Sreemangal tea estates. Seven-color tea tasting. Return transfer." }
    ]
  },
  "t4": {
    title: "Maldives Island Holiday Special",
    destination: "Maldives",
    duration: "5 Days / 4 Nights",
    price: 68000,
    description: "A dream tropical beach vacation in Maldives. Direct airport speed boat transfers, overwater beach resort accommodation, and guided snorkeling gear included.",
    inclusions: ["Ocean resort room (4 nights)", "Half-board meals (Breakfast & Dinner)", "Speed boat transfers", "Snorkeling equipment rental", "Beach party entrance"],
    exclusions: ["International flights (book flights separately)", "Premium bar service"],
    itinerary: [
      { day: 1, title: "Male Arrival & Speedboat Transfer", desc: "Arrival at Male Velana airport. Speedboat reception and check-in to island villa." },
      { day: 2, title: "Snorkeling & Coral Reef Safari", desc: "Sail to outer reef. Spot manta rays, sea turtles, and coral formations." },
      { day: 3, title: "Island Hopping & Fishing", desc: "Explore local island community. Evening sunset fishing cruise." },
      { day: 4, title: "Leisure Beach Relaxation", desc: "Free day for beach sports, spa, or relaxing at the overwater deck." },
      { day: 5, title: "Male Departure", desc: "Breakfast check-out. Speedboat return to airport." }
    ]
  }
};

type TourKey = keyof typeof TOURS_DETAILS;

export default function TourDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const tourId = resolvedParams.id as TourKey;
  const router = useRouter();
  const fallback = TOURS_DETAILS[tourId] || TOURS_DETAILS["t1"];
  const [tour, setTour] = useState(fallback);

  const [guestsCount, setGuestsCount] = useState(1);
  const [travelDate, setTravelDate] = useState("2026-07-15");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("SSLCOMMERZ");
  const [bookingRef, setBookingRef] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [step, setStep] = useState<"details" | "checkout" | "success">("details");

  useEffect(() => {
    getTour(tourId)
      .then((t) => setTour({
        title: t.title as string,
        destination: t.destination as string,
        duration: t.duration as string,
        price: t.price as number,
        description: t.description as string,
        inclusions: t.inclusions as string[],
        exclusions: t.exclusions as string[],
        itinerary: t.itinerary as typeof fallback.itinerary,
      }))
      .catch(() => setTour(fallback));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId]);

  async function handleBookTour() {
    const token = getToken();
    if (!token) { router.push(`/login?redirect=/tours/${tourId}`); return; }
    setBookingLoading(true);
    setBookingError("");
    try {
      const booking = await bookTour(token, {
        tourSlug: tourId, guests: guestsCount, travelDate, guestName, guestEmail, guestPhone,
      });
      const payment = await payTourBooking(token, booking.bookingId, paymentMethod);
      setBookingRef(payment.bookingRef);
      setStep("success");
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  }


  const totalPrice = tour.price * guestsCount;
  const serviceFee = totalPrice * 0.05;
  const vatAmount = serviceFee * 0.15; // VAT on service fee
  const grandTotal = totalPrice + serviceFee + vatAmount;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="border-b border-white/10 bg-brand-navy text-white py-4 px-6 sticky top-0 z-40 shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 font-sans">
          <div className="flex items-center gap-4">
            <Link href="/tours" className="flex items-center gap-1 text-white hover:text-brand-gold font-bold text-sm transition">
              <ArrowLeft className="h-4 w-4" /> Back to Search
            </Link>
            <span className="text-white/20">|</span>
            <span className="text-sm font-semibold text-white/90">Tour Booking</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs bg-brand-gold/20 text-brand-gold border border-brand-gold/25 font-bold px-2 rounded">B2C Portal</span>
            <SarahLogo className="scale-90" iconOnly />
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8">
        
        {step === "details" && (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
                <div
                  className="h-64 bg-cover bg-center"
                  style={{ backgroundImage: `url('${tourImages[tourId] ?? travelImages.tours}')` }}
                />
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-brand-gold" /> {tour.duration}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-brand-gold" /> {tour.destination}</span>
                  </div>
                  <h1 className="text-2xl font-black text-brand-navy">{tour.title}</h1>
                  <p className="text-sm text-slate-600 leading-relaxed">{tour.description}</p>
                </div>
              </div>

              {/* Day-by-Day Itinerary */}
              <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-brand-navy border-b pb-2 flex items-center gap-1.5"><Compass className="h-5 w-5 text-brand-gold" /> Detailed Itinerary</h3>
                <div className="space-y-6 mt-4 relative before:absolute before:inset-y-2 before:left-3 before:border-l before:border-dashed before:border-slate-300">
                  {tour.itinerary.map(day => (
                    <div key={day.day} className="flex gap-4 relative">
                      <div className="w-6 h-6 rounded-full bg-brand-navy text-white text-xs font-bold flex items-center justify-center shrink-0 ring-4 ring-white z-10">
                        {day.day}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-800">Day {day.day}: {day.title}</span>
                        <p className="text-xs text-slate-500 mt-1">{day.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions / Exclusions */}
              <div className="bg-white rounded-2xl border p-6 shadow-sm grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="font-extrabold text-slate-900 border-b pb-2">Inclusions</h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {tour.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 border-b pb-2">Exclusions</h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {tour.exclusions.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Sidebar Calculator */}
            <div>
              <div className="bg-white rounded-2xl border border-brand-gold p-6 shadow-md space-y-6">
                <h3 className="font-extrabold text-brand-navy text-lg border-b pb-2">Calculate Tour Plan</h3>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Number of Travelers</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={20}
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-brand-navy"
                  />
                </div>

                <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-4 border rounded-xl">
                  <div className="flex justify-between">
                    <span>Base Package price (x{guestsCount})</span>
                    <span className="font-semibold">{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Service Fee (5%)</span>
                    <span>{formatCurrency(serviceFee)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>VAT (15% on service fee)</span>
                    <span>{formatCurrency(vatAmount)}</span>
                  </div>
                  <div className="border-t border-dashed my-2" />
                  <div className="flex justify-between items-center text-brand-navy font-black text-base bg-brand-gold/15 p-2 rounded">
                    <span>Total Cost BDT</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep("checkout")}
                  className="w-full bg-brand-navy hover:bg-opacity-95 text-white font-bold py-3 rounded-lg text-sm text-center shadow transition animate-shimmer"
                >
                  Book Experience Tour
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CHECKOUT */}
        {step === "checkout" && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-brand-navy">Tour Booking Checkout</h2>
              
              <div className="bg-slate-50 border p-4 rounded-xl text-xs text-slate-700 space-y-2">
                <p><strong>Tour Package:</strong> {tour.title}</p>
                <p><strong>Travelers:</strong> {guestsCount} Guests</p>
                <p><strong>Total Cost:</strong> {formatCurrency(grandTotal)} BDT</p>
              </div>

              <div className="space-y-2">
                <input type="date" value={travelDate} onChange={e => setTravelDate(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required />
                <input placeholder="Full name" value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required />
                <input type="email" placeholder="Email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required />
                <input type="tel" placeholder="Phone" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[{ id: "BKASH", label: "bKash" }, { id: "NAGAD", label: "Nagad" }, { id: "SSLCOMMERZ", label: "Card" }, { id: "ROCKET", label: "Rocket" }].map(m => (
                  <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)}
                    className={`text-xs font-bold py-2 rounded-lg border ${paymentMethod === m.id ? "bg-brand-navy text-white" : "bg-white text-slate-600"}`}>{m.label}</button>
                ))}
              </div>
              {bookingError && <p className="text-xs text-red-600">{bookingError}</p>}
              <div className="flex gap-3 pt-4 border-t">
                <button onClick={() => setStep("details")} className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-lg font-bold text-xs">Cancel</button>
                <button onClick={handleBookTour} disabled={bookingLoading || !guestName || !guestEmail || !guestPhone}
                  className="flex-1 bg-brand-navy text-white font-bold py-2.5 rounded-lg text-xs shadow disabled:opacity-50 flex items-center justify-center gap-1">
                  {bookingLoading ? <><Loader2 className="h-3 w-3 animate-spin" /> Processing…</> : "Pay & Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === "success" && (
          <div className="max-w-md mx-auto text-center space-y-6 bg-white rounded-2xl border p-8 shadow-sm">
            <div className="mx-auto bg-green-50 p-4 rounded-full text-green-600 w-20 h-20 flex items-center justify-center">
              <CheckCircle className="h-12 w-12" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-brand-navy">Tour Booking Confirmed!</h2>
              <p className="text-xs text-slate-500 mt-2">Reference: <span className="font-bold text-brand-navy uppercase">{bookingRef}</span></p>
              <p className="text-sm text-slate-600 mt-3">Your custom tour package itinerary reservation has been successfully booked and recorded in the double-entry general ledger database.</p>
            </div>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/account/bookings" className="bg-brand-navy text-white text-xs font-bold px-6 py-2.5 rounded-lg transition">Manage Bookings</Link>
              <Link href="/" className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-6 py-2.5 rounded-lg transition">Back to Home</Link>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
