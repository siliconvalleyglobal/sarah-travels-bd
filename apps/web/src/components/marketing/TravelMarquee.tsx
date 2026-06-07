const ROW_A = [
  "Flight Search", "Hotel Booking", "Visa Application", "Umrah Packages", "Tour Packages",
  "Car Transfers", "bKash Payments", "Nagad Checkout", "SSLCommerz", "NBR VAT Invoice",
  "PNR Generation", "Installment Plans",
] as const;

const ROW_B = [
  "Amadeus API", "Agoda Hotels", "Viator Tours", "Document Upload", "Photo Cropper",
  "My Bookings", "Agent Portal", "Passport Scanner", "B2B Wallet", "Confirmation Codes",
  "ATAB Registered", "IATA Certified",
] as const;

function MarqueeRow({ items, reverse }: { items: readonly string[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden py-3">
      <div className={`flex gap-4 whitespace-nowrap ${reverse ? "st-marquee-rev" : "st-marquee"}`}>
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-brand-navy shadow-soft"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TravelMarquee() {
  return (
    <section className="st-reveal border-b border-slate-200 bg-slate-50 py-12 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <h2 className="font-display text-2xl font-extrabold text-brand-navy sm:text-3xl">
          Built for <span className="gradient-text">modern travel</span>
        </h2>
        <p className="mt-2 text-sm text-slate-500">Enterprise integrations · Transparent pricing · Full booking lifecycle</p>
      </div>
      <div className="mt-8 space-y-2">
        <MarqueeRow items={ROW_A} />
        <MarqueeRow items={ROW_B} reverse />
      </div>
    </section>
  );
}
