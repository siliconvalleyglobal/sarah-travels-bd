"use client";

import Link from "next/link";
import { SarahLogo } from "@/components/SarahLogo";
import { Plane, FileText, Moon, Compass, Car, Shield, MapPin, Phone, Mail } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { common, footer } from "@/lib/i18n/translations";
import { pick } from "@/lib/i18n/types";

const SERVICE_ICONS = [Plane, MapPin, FileText, Moon, Compass, Car];

export function SiteFooter() {
  const { lang } = useLanguage();

  return (
    <footer className="relative overflow-hidden bg-brand-navy text-white">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.12]"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=60')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/95 to-brand-navy/80" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <SarahLogo />
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              {pick(lang, footer.tagline)}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-brand-gold font-bold">
              <Shield className="h-4 w-4" />
              {pick(lang, footer.compliance)}
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-brand-gold">
              {pick(lang, footer.services)}
            </h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {footer.serviceLinks.map((link, i) => {
                const Icon = SERVICE_ICONS[i];
                return (
                  <li key={link.href}>
                    <Link href={link.href} className="flex items-center gap-2 text-sm text-white/70 transition hover:text-brand-gold">
                      <Icon className="h-3.5 w-3.5" />
                      {pick(lang, link)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-brand-gold">
              {pick(lang, footer.company)}
            </h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-white/70">
              <li><Link href="/agent" className="hover:text-brand-gold transition">{pick(lang, footer.agentPortal)}</Link></li>
              <li><Link href="/account/bookings" className="hover:text-brand-gold transition">{pick(lang, footer.myBookings)}</Link></li>
              <li><Link href="/login" className="hover:text-brand-gold transition">{pick(lang, common.signIn)}</Link></li>
              <li><Link href="/register" className="hover:text-brand-gold transition">{pick(lang, footer.createAccount)}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-brand-gold">
              {pick(lang, footer.contact)}
            </h4>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-brand-gold mt-0.5" />
                <span>{pick(lang, footer.address)}</span>
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
            © {new Date().getFullYear()} Sarah Travels BD. {pick(lang, footer.rights)}
          </p>
          <p className="text-[10px] text-white/30 text-center sm:text-right">
            {pick(lang, footer.pricingNote)}
          </p>
        </div>
      </div>
    </footer>
  );
}
