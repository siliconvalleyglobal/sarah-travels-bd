"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, CheckCircle, Users, Briefcase, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getToken } from "@/lib/auth";
import { searchCars, bookCar, payCarBooking } from "@/lib/cars-api";
import { AppShell } from "@/components/AppShell";
import { PageHero } from "@/components/PageHero";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { carImages, travelImages } from "@/lib/travelImages";

const FALLBACK_CARS = [
  { id: "c1", name: "Toyota Sedan Allion / Premio", type: "Sedan", pax: 4, luggage: 2, price: 4500, desc: "Perfect for city tours and local transfers. Premium AC, clean interior.", image: carImages.c1 },
  { id: "c2", name: "Toyota Noah Microbus", type: "Microbus", pax: 7, luggage: 4, price: 7500, desc: "Popular family travel option. Spacious and comfortable AC van.", image: carImages.c2 },
  { id: "c3", name: "Toyota HiAce Group Cruiser", type: "Microbus", pax: 11, luggage: 6, price: 9000, desc: "Best for tourist groups and corporate airport pick ups.", image: carImages.c3 },
  { id: "c4", name: "Premium GMC Yukon SUV", type: "Luxury SUV", pax: 6, luggage: 4, price: 25000, desc: "VIP transport service, leather seats, and private chauffeur.", image: carImages.c4 },
];

export default function CarsRentalsPage({ searchParams }: { searchParams: Promise<{ pickup?: string }> }) {
  const resolvedParams = use(searchParams);
  const pickupQuery = resolvedParams.pickup ?? "DAC";

  const router = useRouter();
  const [cars, setCars] = useState(FALLBACK_CARS);
  const [selectedCar, setSelectedCar] = useState<string>("c1");
  const [includeDriver, setIncludeDriver] = useState(true);
  const [pickupDate, setPickupDate] = useState("2026-06-15");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("SSLCOMMERZ");
  const [bookingRef, setBookingRef] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [step, setStep] = useState<"list" | "checkout" | "success">("list");

  useEffect(() => {
    searchCars(pickupQuery)
      .then((res) => setCars(res.vehicles as typeof FALLBACK_CARS))
      .catch(() => setCars(FALLBACK_CARS));
  }, [pickupQuery]);

  const currentCar = cars.find(c => c.id === selectedCar) || cars[0];

  async function handleBookCar() {
    const token = getToken();
    if (!token) { router.push("/login?redirect=/cars"); return; }
    setBookingLoading(true);
    setBookingError("");
    try {
      const booking = await bookCar(token, {
        vehicleSlug: selectedCar,
        pickupLocation: pickupQuery,
        pickupDate,
        includeDriver,
        guestName,
        guestEmail,
        guestPhone,
      });
      const payment = await payCarBooking(token, booking.bookingId, paymentMethod);
      setBookingRef(payment.bookingRef);
      setStep("success");
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  }
  const driverCharge = includeDriver ? 1500 : 0;
  const baseCost = currentCar.price + driverCharge;
  const serviceFee = baseCost * 0.05;
  const vatAmount = serviceFee * 0.15; // VAT on service charge
  const grandTotal = baseCost + serviceFee + vatAmount;

  return (
    <AppShell>
      <PageHero
        icon={Car}
        badge="Verified Fleet"
        title={`Transfers from ${pickupQuery}`}
        subtitle="Premium AC vehicles with optional chauffeur service. Airport pickups, city tours, and long-distance rentals."
        backgroundImage={travelImages.cars}
        compact
      />

      <main className="mx-auto max-w-5xl w-full px-4 py-10 sm:px-6">
        
        {step === "list" && (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                {cars.map(c => (
                  <label key={c.id} className={`block cursor-pointer transition ${
                    selectedCar === c.id ? "" : ""
                  }`}>
                  <Card className={`overflow-hidden transition-all ${selectedCar === c.id ? "border-brand-gold ring-2 ring-brand-gold/20 shadow-elevated" : "hover:border-brand-gold/30"}`}>
                    <div className="flex flex-col sm:flex-row">
                      <div
                        className="h-32 w-full shrink-0 bg-cover bg-center sm:h-auto sm:w-36"
                        style={{ backgroundImage: `url('${c.image ?? carImages[c.id] ?? travelImages.cars}')` }}
                      />
                    <div className="flex flex-1 flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5">
                      <div className="flex items-start gap-4">
                        <input type="radio" name="car" checked={selectedCar === c.id} onChange={() => setSelectedCar(c.id)} className="mt-1.5" />
                        <div>
                          <Badge variant="navy">{c.type}</Badge>
                          <h3 className="font-extrabold text-slate-900 text-lg mt-1">{c.name}</h3>
                          <p className="text-xs text-slate-500 mt-1">{c.desc}</p>
                          <div className="flex gap-4 text-xs text-slate-600 mt-3 font-semibold">
                            <span className="flex items-center gap-1"><Users className="h-4 w-4 text-brand-gold" /> Max {c.pax} Pax</span>
                            <span className="flex items-center gap-1"><Briefcase className="h-4 w-4 text-brand-gold" /> {c.luggage} Bags</span>
                          </div>
                        </div>
                      </div>
                      <span className="font-black text-brand-navy text-lg whitespace-nowrap">{formatCurrency(c.price)} / day</span>
                    </div>
                    </div>
                  </Card>
                  </label>
                ))}
              </div>
            </div>

            {/* Sidebar Calculator */}
            <div>
              <Card className="sticky top-24 border-brand-gold/40 p-6 shadow-elevated space-y-6">
                <h3 className="font-extrabold text-brand-navy text-lg border-b pb-2">Rental Calculation</h3>
                
                {/* Driver Option */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700">
                    <input 
                      type="checkbox" 
                      checked={includeDriver}
                      onChange={(e) => setIncludeDriver(e.target.checked)}
                      className="rounded text-brand-navy" 
                    />
                    <span>Include Professional Chauffeur</span>
                  </label>
                  <span className="text-[10px] text-slate-400 block mt-1">+ BDT 1,500 per day driver salary</span>
                </div>

                <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-4 border rounded-xl">
                  <div className="flex justify-between">
                    <span>Base Vehicle Cost</span>
                    <span>{formatCurrency(currentCar.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chauffeur Charge</span>
                    <span>{formatCurrency(driverCharge)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 border-t pt-2">
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

                <Button onClick={() => setStep("checkout")} className="w-full">
                  Book Chauffeur Rental
                </Button>
              </Card>
            </div>
          </div>
        )}

        {/* STEP 2: CHECKOUT */}
        {step === "checkout" && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-brand-navy">Vehicle Reservation Checkout</h2>
              
              <div className="bg-slate-50 border p-4 rounded-xl text-xs text-slate-700 space-y-2">
                <p><strong>Vehicle:</strong> {currentCar.name}</p>
                <p><strong>Driver:</strong> {includeDriver ? "Chauffeur Included" : "Self-drive reservation"}</p>
                <p><strong>Total Billed:</strong> {formatCurrency(grandTotal)} BDT</p>
              </div>

              <div className="space-y-2">
                <input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
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
                <button onClick={() => setStep("list")} className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-lg font-bold text-xs">Cancel</button>
                <button onClick={handleBookCar} disabled={bookingLoading || !guestName || !guestEmail || !guestPhone}
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
              <h2 className="text-2xl font-black text-brand-navy">Chauffeur Rental Confirmed!</h2>
              <p className="text-xs text-slate-500 mt-2">Reference: <span className="font-bold text-brand-navy uppercase">{bookingRef}</span></p>
              <p className="text-sm text-slate-600 mt-3">Your vehicle rental reservation has been successfully confirmed and scheduled. Chauffeur contact card details will be sent via WhatsApp notification prior to pick-up.</p>
            </div>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/account/bookings" className="bg-brand-navy text-white text-xs font-bold px-6 py-2.5 rounded-lg transition">Manage Bookings</Link>
              <Link href="/" className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-6 py-2.5 rounded-lg transition">Back to Home</Link>
            </div>
          </div>
        )}

      </main>
    </AppShell>
  );
}
