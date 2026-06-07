"use client";

import Link from "next/link";
import { Clock, ArrowRight, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PageHero } from "@/components/PageHero";
import { StaggerGrid, StaggerItem } from "@/components/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { travelImages, visaImageFor } from "@/lib/travelImages";

const FLAG: Record<string, string> = {
  AE: "🇦🇪", SA: "🇸🇦", US: "🇺🇸", GB: "🇬🇧", UK: "🇬🇧",
  MY: "🇲🇾", SG: "🇸🇬", TH: "🇹🇭", IN: "🇮🇳", CA: "🇨🇦",
};

export interface VisaCountryCard {
  id: string;
  name: string;
  code: string;
  description: string | null;
  processingDays: number | null;
  fee: number;
}

export function VisaCatalog({ countries }: { countries: VisaCountryCard[] }) {
  return (
    <>
      <PageHero
        icon={FileText}
        badge="Document Upload & Tracking"
        title="Visa Application Center"
        subtitle="Apply online with document upload, regulatory photo cropping, secure BDT payment, and live application tracking."
        backgroundImage={travelImages.visa}
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {countries.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-slate-500">No visa countries configured yet.</p>
            <p className="mt-2 text-sm text-slate-400">Start the API and seed visa countries.</p>
          </Card>
        ) : (
          <StaggerGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map((country) => (
              <StaggerItem key={country.id}>
                <Card className="card-interactive st-reveal flex h-full flex-col overflow-hidden">
                  <div
                    className="relative h-40 bg-cover bg-center px-6 py-8 text-white"
                    style={{ backgroundImage: `url('${visaImageFor(country.code)}')` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/50 to-brand-navy/20" />
                    <div className="relative">
                      <span className="text-4xl">{FLAG[country.code] ?? "🌍"}</span>
                      <h3 className="mt-3 font-display text-xl font-bold">{country.name}</h3>
                      <p className="text-xs text-white/70">{country.code}</p>
                    </div>
                  </div>
                  <CardContent className="flex flex-1 flex-col gap-3">
                    {country.description && (
                      <p className="text-sm leading-relaxed text-slate-600 line-clamp-3">{country.description}</p>
                    )}
                    <div className="mt-auto flex flex-wrap gap-2">
                      {country.processingDays && (
                        <Badge variant="navy">
                          <Clock className="mr-1 inline h-3 w-3" />
                          ~{country.processingDays} days
                        </Badge>
                      )}
                      <Badge variant="gold">Online Apply</Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400">From</span>
                      <p className="font-display text-xl font-extrabold text-brand-navy">
                        {formatCurrency(Number(country.fee))}
                      </p>
                    </div>
                    <Link href={`/visa/${country.code}`} className="btn-gold !px-4 !py-2 !text-xs">
                      Apply <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </CardFooter>
                </Card>
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}
      </div>
    </>
  );
}
