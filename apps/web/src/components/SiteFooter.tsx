import Link from "next/link";
import { SarahLogo } from "@/components/SarahLogo";
import { Plane, FileText, Moon, Compass, Car, Shield, MapPin, Phone, Mail } from "lucide-react";

const LINKS = [
  { href: "/flights", label: "Flights", icon: Plane },
  { href: "/hotels", label: "Hotels", icon: MapPin },
  { href: "/visa", label: "Visa Services", icon: FileText },
  { href: "/umrah", label: "Umrah Packages", icon: Moon },
  { href: "/tours", label: "Tours", icon: Compass },
  { href: "/cars", label: "Car Rentals", icon: Car },
];

export function SiteFooter() {
  return (
    <footer className="bg-brand-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <SarahLogo />
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Bangladesh&apos;s premier enterprise travel platform. IATA certified, ATAB registered.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-brand-gold font-bold">
              <Shield className="h-4 w-4" />
              NBR VAT &amp; AIT Compliant
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-brand-gold">Services</h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="flex items-center gap-2 text-sm text-white/70 transition hover:text-brand-gold">
                    <link.icon className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-brand-gold">Company</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-white/70">
              <li><Link href="/agent" className="hover:text-brand-gold transition">B2B Agent Portal</Link></li>
              <li><Link href="/account/bookings" className="hover:text-brand-gold transition">My Bookings</Link></li>
              <li><Link href="/login" className="hover:text-brand-gold transition">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-brand-gold transition">Create Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-brand-gold">Contact</h4>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-brand-gold mt-0.5" />
                <span>Kakrail, Dhaka — Bangladesh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-brand-gold" />
                <span>01730000106 (WhatsApp)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-brand-gold" />
                <span>reza@sarahtravelsbd.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Sarah Travels BD. All rights reserved.
          </p>
          <p className="text-[10px] text-white/30">
            VAT 15% on service fee · AIT 0.3% on air tickets · Transparent pricing
          </p>
        </div>
      </div>
    </footer>
  );
}
