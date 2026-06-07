import Link from "next/link";
import { Wallet, Plane, FileText, Users } from "lucide-react";
import { SarahLogo } from "@/components/SarahLogo";

const features = [
  { icon: Plane, title: "Flight Booking", description: "Book on behalf of customers with agent pricing" },
  { icon: FileText, title: "Visa Booking", description: "Submit visa applications for clients" },
  { icon: Wallet, title: "Credit Wallet", description: "Manage credit limit, deposits, and commissions" },
  { icon: Users, title: "Sub-agents", description: "Manage your sub-agent network" },
];

export default function AgentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-white/10 bg-brand-navy text-white py-4 px-6 sticky top-0 z-40 shadow-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 font-sans">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1 text-white hover:text-brand-gold font-bold text-sm transition">
              ← Home
            </Link>
            <span className="text-white/20">|</span>
            <span className="text-sm font-semibold text-white/90">Agent Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg bg-brand-gold hover:bg-opacity-90 text-brand-navy px-4 py-2 text-xs font-bold shadow hover-lift transition"
            >
              Agent Login
            </Link>
            <SarahLogo className="scale-90" iconOnly />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Grow Your Travel Business</h2>
          <p className="mt-3 text-gray-600">
            Join our B2B agent network. Book flights, visas, and Umrah packages with competitive commissions.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-xl border bg-white p-6 shadow-sm">
              <feature.icon className="h-8 w-8 text-brand-600" />
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl bg-brand-700 p-8 text-center text-white">
          <h3 className="text-xl font-bold">Ready to become an agent?</h3>
          <p className="mt-2 text-brand-100">Register your agency and start booking today.</p>
          <Link
            href="/register?role=agent"
            className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-medium text-brand-700 hover:bg-brand-50"
          >
            Register as Agent
          </Link>
        </div>
      </div>
    </div>
  );
}
