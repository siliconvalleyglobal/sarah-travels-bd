"use client";

import { useState, use, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Star, MapPin, CheckCircle, ShieldCheck, Coffee, Wifi, ChevronLeft, ChevronRight,
  Users, Calendar, Heart, Share2, ThumbsUp, Clock, Ban, CreditCard, Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { SiteHeader } from "@/components/SiteHeader";
import {
  getHotelById, getReviewLabel, getReviewColor, AMENITY_LABELS, type Hotel, type HotelRoom,
} from "@/lib/hotels-data";
import { getHotel, bookHotel, payHotelBooking } from "@/lib/hotels-api";
import { getToken } from "@/lib/auth";

const AMENITY_ICONS: Record<string, typeof Wifi> = {
  wifi: Wifi, breakfast: Coffee,
};

export default function HotelDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkIn?: string; checkOut?: string; rooms?: string; adults?: string }>;
}) {
  const { id } = use(params);
  const sp = use(searchParams);
  const router = useRouter();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<string>("std");
  const [activeImage, setActiveImage] = useState(0);
  const [step, setStep] = useState<"rooms" | "checkout" | "success">("rooms");
  const [activeTab, setActiveTab] = useState<"overview" | "rooms" | "reviews" | "policies">("overview");
  const [paymentMethod, setPaymentMethod] = useState("SSLCOMMERZ");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [bookingRef, setBookingRef] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getHotel(id, { checkIn: sp.checkIn, checkOut: sp.checkOut })
      .then((h) => {
        if (!cancelled) {
          setHotel(h);
          setSelectedRoom(h.rooms[0]?.id ?? "std");
        }
      })
      .catch(() => {
        if (!cancelled) {
          const fallback = getHotelById(id);
          if (fallback) {
            setHotel(fallback);
            setSelectedRoom(fallback.rooms[0]?.id ?? "std");
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id, sp.checkIn, sp.checkOut]);

  const nights = useMemo(() => {
    if (!sp.checkIn || !sp.checkOut) return 1;
    const diff = Math.ceil((new Date(sp.checkOut).getTime() - new Date(sp.checkIn).getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [sp.checkIn, sp.checkOut]);

  async function handlePayment() {
    const token = getToken();
    if (!token) {
      router.push(`/login?redirect=/hotels/${id}?${new URLSearchParams(sp as Record<string, string>).toString()}`);
      return;
    }
    if (!hotel || !sp.checkIn || !sp.checkOut) {
      setBookingError("Please select check-in and check-out dates from the search page.");
      return;
    }

    setBookingLoading(true);
    setBookingError("");
    try {
      const booking = await bookHotel(token, {
        hotelSlug: hotel.id,
        roomCode: selectedRoom,
        checkIn: sp.checkIn,
        checkOut: sp.checkOut,
        rooms: Number(sp.rooms) || 1,
        adults: Number(sp.adults) || 2,
        guestName,
        guestEmail,
        guestPhone,
        specialRequest: specialRequest || undefined,
      });
      const payment = await payHotelBooking(token, booking.bookingId, paymentMethod);
      setBookingRef(payment.bookingRef);
      setConfirmationCode(payment.confirmationCode);
      setStep("success");
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-brand-gold animate-spin" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-navy">Hotel not found</h1>
          <Link href="/hotels" className="text-brand-gold font-bold text-sm mt-4 inline-block">← Back to search</Link>
        </div>
      </div>
    );
  }

  const currentRoom: HotelRoom = hotel.rooms.find(r => r.id === selectedRoom) || hotel.rooms[0];
  const baseTotal = currentRoom.price * nights;
  const serviceFee = baseTotal * 0.05;
  const vatAmount = serviceFee * 0.15;
  const grandTotal = baseTotal + serviceFee + vatAmount;

  const backUrl = `/hotels?city=${hotel.city}${sp.checkIn ? `&checkIn=${sp.checkIn}&checkOut=${sp.checkOut}` : ""}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SiteHeader variant="compact" />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-brand-gold">Home</Link>
          <span>/</span>
          <Link href={backUrl} className="hover:text-brand-gold">Hotels in {hotel.city}</Link>
          <span>/</span>
          <span className="text-brand-navy font-bold truncate">{hotel.name}</span>
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-6 sm:px-6">
        {step === "rooms" && (
          <>
            {/* Photo gallery */}
            <div className="grid gap-2 md:grid-cols-4 md:grid-rows-2 mb-6 rounded-2xl overflow-hidden">
              <div className="md:col-span-2 md:row-span-2 relative h-64 md:h-80">
                <div className="h-full bg-cover bg-center" style={{ backgroundImage: `url('${hotel.images[activeImage]}')` }} />
                {hotel.images.length > 1 && (
                  <>
                    <button onClick={() => setActiveImage((activeImage - 1 + hotel.images.length) % hotel.images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={() => setActiveImage((activeImage + 1) % hotel.images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
              {hotel.images.slice(1, 5).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i + 1)}
                  className={`hidden md:block h-full min-h-[120px] bg-cover bg-center rounded-lg overflow-hidden border-2 transition ${activeImage === i + 1 ? "border-brand-gold" : "border-transparent"}`}
                  style={{ backgroundImage: `url('${img}')` }}
                />
              ))}
            </div>

            {/* Hotel header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <div className="flex text-brand-gold">
                    {Array.from({ length: hotel.stars }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">{hotel.propertyType}</span>
                  {hotel.deal && (
                    <span className="text-xs font-black text-white bg-red-600 px-2 py-0.5 rounded">{hotel.deal.label} -{hotel.deal.discount}%</span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-brand-navy">{hotel.name}</h1>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-brand-gold" /> {hotel.location.area}, {hotel.city}, {hotel.country}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {hotel.freeCancellation && (
                    <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Free cancellation
                    </span>
                  )}
                  {hotel.breakfastIncluded && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full flex items-center gap-1">
                      <Coffee className="h-3 w-3" /> Breakfast included
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-700 block">{getReviewLabel(hotel.reviewScore)}</span>
                  <span className="text-xs text-slate-400">{hotel.reviewCount.toLocaleString()} verified reviews</span>
                </div>
                <span className={`${getReviewColor(hotel.reviewScore)} text-white font-black text-xl w-14 h-14 rounded-xl rounded-br-none flex items-center justify-center`}>
                  {hotel.reviewScore.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Action bar */}
            <div className="flex gap-2 mb-6">
              <button className="flex items-center gap-1 text-xs font-bold text-slate-600 border rounded-lg px-3 py-2 hover:bg-slate-50 transition">
                <Heart className="h-3.5 w-3.5" /> Save
              </button>
              <button className="flex items-center gap-1 text-xs font-bold text-slate-600 border rounded-lg px-3 py-2 hover:bg-slate-50 transition">
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b mb-6 overflow-x-auto">
              {(["overview", "rooms", "reviews", "policies"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-xs font-bold capitalize whitespace-nowrap border-b-2 transition ${
                    activeTab === tab ? "border-brand-navy text-brand-navy" : "border-transparent text-slate-500 hover:text-brand-navy"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {activeTab === "overview" && (
                  <>
                    <section className="bg-white rounded-2xl border p-6 shadow-sm">
                      <h2 className="font-extrabold text-brand-navy text-lg mb-3">About this property</h2>
                      <p className="text-sm text-slate-600 leading-relaxed">{hotel.description}</p>
                    </section>

                    <section className="bg-white rounded-2xl border p-6 shadow-sm">
                      <h2 className="font-extrabold text-brand-navy text-lg mb-4">Popular amenities</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {hotel.amenities.map(a => {
                          const Icon = AMENITY_ICONS[a] || CheckCircle;
                          return (
                            <div key={a} className="flex items-center gap-2 text-sm text-slate-700">
                              <Icon className="h-4 w-4 text-brand-gold shrink-0" />
                              {AMENITY_LABELS[a]}
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    <section className="bg-white rounded-2xl border p-6 shadow-sm">
                      <h2 className="font-extrabold text-brand-navy text-lg mb-3">Location</h2>
                      <p className="text-sm text-slate-600 mb-4 flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-brand-gold" /> {hotel.distance}
                      </p>
                      <div className="h-48 bg-slate-200 rounded-xl bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80')" }} />
                    </section>
                  </>
                )}

                {activeTab === "rooms" && (
                  <section className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h2 className="font-extrabold text-brand-navy text-lg">Choose your room</h2>
                      {sp.checkIn && sp.checkOut && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> {sp.checkIn} → {sp.checkOut} ({nights} night{nights > 1 ? "s" : ""})
                        </span>
                      )}
                    </div>
                    {hotel.rooms.map(room => (
                      <div
                        key={room.id}
                        className={`border rounded-xl p-4 transition ${selectedRoom === room.id ? "border-brand-navy bg-brand-navy/5 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <input type="radio" name="room" checked={selectedRoom === room.id} onChange={() => setSelectedRoom(room.id)} className="mt-1" />
                            <div>
                              <span className="font-bold text-slate-900 block">{room.name}</span>
                              <span className="text-xs text-slate-500 block mt-0.5">{room.desc}</span>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-[10px] text-slate-500 flex items-center gap-0.5"><Users className="h-3 w-3" /> {room.beds} · Max {room.maxGuests}</span>
                                {room.breakfast && <span className="text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">Breakfast</span>}
                                {room.freeCancellation && <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">Free cancel</span>}
                                {room.payAtHotel && <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">Pay at hotel</span>}
                              </div>
                              {room.roomsLeft && (
                                <p className="text-[10px] font-bold text-red-600 mt-1">Only {room.roomsLeft} room{room.roomsLeft > 1 ? "s" : ""} left!</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            {room.originalPrice && (
                              <span className="text-xs text-slate-400 line-through block">{formatCurrency(room.originalPrice)}</span>
                            )}
                            <span className="font-black text-brand-navy text-lg">{formatCurrency(room.price)}</span>
                            <span className="text-[10px] text-slate-500 block">per night</span>
                            <button
                              onClick={() => { setSelectedRoom(room.id); setStep("checkout"); }}
                              className="mt-2 bg-brand-navy text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-opacity-95 transition"
                            >
                              Book now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </section>
                )}

                {activeTab === "reviews" && (
                  <section className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-4 border-b pb-4">
                      <span className={`${getReviewColor(hotel.reviewScore)} text-white font-black text-2xl w-16 h-16 rounded-xl flex items-center justify-center`}>
                        {hotel.reviewScore.toFixed(1)}
                      </span>
                      <div>
                        <h2 className="font-extrabold text-brand-navy text-lg">{getReviewLabel(hotel.reviewScore)}</h2>
                        <p className="text-xs text-slate-500">{hotel.reviewCount.toLocaleString()} verified guest reviews</p>
                      </div>
                    </div>
                    {hotel.reviews.map((review, i) => (
                      <div key={i} className="border-b border-slate-100 pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-bold text-sm text-slate-900">{review.author}</span>
                            <span className="text-[10px] text-slate-400 block">{review.country} · {review.date}</span>
                          </div>
                          <span className="bg-brand-navy text-white text-xs font-bold px-2 py-1 rounded">{review.score}</span>
                        </div>
                        <h4 className="font-bold text-sm text-brand-navy">{review.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{review.comment}</p>
                        <button className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1 hover:text-brand-navy">
                          <ThumbsUp className="h-3 w-3" /> Helpful
                        </button>
                      </div>
                    ))}
                  </section>
                )}

                {activeTab === "policies" && (
                  <section className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-sm text-brand-navy">Check-in / Check-out</h3>
                        <p className="text-xs text-slate-600 mt-1">Check-in from {hotel.policies.checkIn} · Check-out until {hotel.policies.checkOut}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Ban className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-sm text-brand-navy">Cancellation Policy</h3>
                        <p className="text-xs text-slate-600 mt-1">{hotel.policies.cancellation}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-sm text-brand-navy">Payment</h3>
                        <p className="text-xs text-slate-600 mt-1">bKash, Nagad, Rocket, Visa, Mastercard via SSLCommerz. VAT 15% on service fee only.</p>
                      </div>
                    </div>
                  </section>
                )}
              </div>

              {/* Sticky booking sidebar */}
              <div className="lg:sticky lg:top-24 h-fit">
                <div className="bg-white rounded-2xl border-2 border-brand-gold p-6 shadow-lg space-y-4">
                  <h3 className="font-extrabold text-brand-navy text-lg">Your booking</h3>

                  {sp.checkIn && sp.checkOut ? (
                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg space-y-1">
                      <p className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-brand-gold" /> {sp.checkIn} → {sp.checkOut}</p>
                      <p className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-brand-gold" /> {sp.adults || 2} adults · {nights} night{nights > 1 ? "s" : ""}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Select dates on the search page for accurate pricing</p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Room</span>
                      <span className="font-bold text-slate-700 text-right max-w-[60%]">{currentRoom.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">{formatCurrency(currentRoom.price)} × {nights} night{nights > 1 ? "s" : ""}</span>
                      <span className="font-semibold">{formatCurrency(baseTotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Service charge (5%)</span>
                      <span>{formatCurrency(serviceFee)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>VAT (15% on service fee)</span>
                      <span>{formatCurrency(vatAmount)}</span>
                    </div>
                    <div className="border-t border-dashed pt-2 flex justify-between items-center">
                      <span className="font-black text-brand-navy">Total</span>
                      <span className="font-black text-brand-navy text-xl">{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep("checkout")}
                    className="w-full bg-brand-navy hover:bg-opacity-95 text-white font-bold py-3.5 rounded-lg text-sm shadow transition"
                  >
                    Reserve now
                  </button>
                  <p className="text-[10px] text-center text-slate-400">You won&apos;t be charged yet</p>
                </div>
              </div>
            </div>
          </>
        )}

        {step === "checkout" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <button onClick={() => setStep("rooms")} className="flex items-center gap-1 text-sm font-bold text-brand-navy hover:text-brand-gold transition">
              <ArrowLeft className="h-4 w-4" /> Back to rooms
            </button>

            <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-6">
              <h2 className="text-xl font-black text-brand-navy">Complete your booking</h2>

              <div className="bg-slate-50 border rounded-xl p-4 text-sm space-y-1">
                <p className="font-bold text-brand-navy">{hotel.name}</p>
                <p className="text-xs text-slate-500">{currentRoom.name} · {nights} night{nights > 1 ? "s" : ""}</p>
                <p className="font-black text-brand-navy text-lg mt-2">{formatCurrency(grandTotal)} BDT</p>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-sm text-brand-navy">Guest details</h3>
                <input type="text" placeholder="Full name (as on passport)" value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-navy" required />
                <input type="email" placeholder="Email address" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-navy" required />
                <input type="tel" placeholder="Phone (WhatsApp preferred)" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-navy" required />
                <textarea placeholder="Special requests (optional)" value={specialRequest} onChange={e => setSpecialRequest(e.target.value)} className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-navy h-20 resize-none" />
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-sm text-brand-navy">Payment method</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "BKASH", label: "bKash" },
                    { id: "NAGAD", label: "Nagad" },
                    { id: "SSLCOMMERZ", label: "Card / Bank" },
                    { id: "ROCKET", label: "Rocket" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`text-xs font-bold py-2.5 rounded-lg border transition ${paymentMethod === m.id ? "bg-brand-navy text-white border-brand-navy" : "bg-white text-slate-600 border-slate-200 hover:border-brand-navy"}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {bookingError && (
                <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">{bookingError}</p>
              )}

              <button
                onClick={handlePayment}
                disabled={bookingLoading || !guestName || !guestEmail || !guestPhone || !sp.checkIn || !sp.checkOut}
                className="w-full bg-brand-navy hover:bg-opacity-95 text-white font-bold py-3.5 rounded-lg text-sm shadow disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {bookingLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : `Pay ${formatCurrency(grandTotal)} & Confirm`}
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="max-w-md mx-auto text-center space-y-6 bg-white rounded-2xl border p-8 shadow-sm">
            <div className="mx-auto bg-green-50 p-4 rounded-full text-green-600 w-20 h-20 flex items-center justify-center">
              <CheckCircle className="h-12 w-12" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-brand-navy">Booking Confirmed!</h2>
              <p className="text-xs text-slate-500 mt-2">Reference: <span className="font-bold text-brand-navy uppercase">{bookingRef}</span></p>
              {confirmationCode && <p className="text-xs text-slate-500">Confirmation: <span className="font-bold text-brand-navy">{confirmationCode}</span></p>}
              <p className="text-sm text-slate-600 mt-3">Confirmation sent to {guestEmail}. Your stay at {hotel.name} is reserved.</p>
            </div>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/account/bookings" className="bg-brand-navy text-white text-xs font-bold px-6 py-2.5 rounded-lg">My Bookings</Link>
              <Link href="/hotels" className="bg-slate-100 text-slate-700 text-xs font-bold px-6 py-2.5 rounded-lg">Book another stay</Link>
            </div>
          </div>
        )}
      </main>

      {/* Mobile sticky book bar */}
      {step === "rooms" && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-4 flex items-center justify-between z-50">
          <div>
            <span className="font-black text-brand-navy text-lg">{formatCurrency(grandTotal)}</span>
            <span className="text-[10px] text-slate-500 block">{nights} night{nights > 1 ? "s" : ""} · incl. taxes</span>
          </div>
          <button onClick={() => setStep("checkout")} className="bg-brand-navy text-white font-bold text-sm px-6 py-3 rounded-lg">
            Reserve
          </button>
        </div>
      )}
    </div>
  );
}
