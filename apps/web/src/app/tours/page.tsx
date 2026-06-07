"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { MapPin, Clock, ChevronRight, Compass, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { searchTours } from "@/lib/tours-api";
import { AppShell } from "@/components/AppShell";
import { PageHero } from "@/components/PageHero";
import { StaggerGrid, StaggerItem } from "@/components/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { tourImages, travelImages } from "@/lib/travelImages";

const FALLBACK_TOURS = [
  { id: "t1", title: "Cox's Bazar Beach Getaway", destination: "Cox's Bazar", duration: "3 Days / 2 Nights", price: 14500, highlight: "Sunset beach walk, Himchori waterfall, Inani coral beach", image: tourImages.t1, source: "Local Direct" },
  { id: "t2", title: "Sundarbans Mangrove Cruise", destination: "Sundarbans", duration: "4 Days / 3 Nights", price: 19800, highlight: "Tiger spotting trail, forest boat cruise, wildlife sanctuary", image: tourImages.t2, source: "Local Direct" },
  { id: "t3", title: "Sylhet Tea Gardens Retreat", destination: "Sylhet", duration: "3 Days / 2 Nights", price: 11000, highlight: "Jaflong stone collection, tea garden trail, Lalakhal boat ride", image: tourImages.t3, source: "Local Direct" },
  { id: "t4", title: "Maldives Island Holiday Special", destination: "Maldives", duration: "5 Days / 4 Nights", price: 68000, highlight: "Overwater bungalow, speed boat transfers, snorkeling gear", image: tourImages.t4, source: "Viator API" },
];

export default function ToursSearchPage({ searchParams }: { searchParams: Promise<{ destination?: string }> }) {
  const resolvedParams = use(searchParams);
  const destQuery = resolvedParams.destination ?? "Cox's Bazar";
  const [filteredTours, setFilteredTours] = useState(FALLBACK_TOURS);

  useEffect(() => {
    searchTours(destQuery)
      .then((res) => {
        const tours = (res.tours as typeof FALLBACK_TOURS).map((t) => ({
          ...t,
          image: tourImages[t.id as string] ?? tourImages.t1,
        }));
        setFilteredTours(tours);
      })
      .catch(() => {
        const result = FALLBACK_TOURS.filter((t) => t.destination.toLowerCase() === destQuery.toLowerCase());
        setFilteredTours(result.length ? result : FALLBACK_TOURS);
      });
  }, [destQuery]);

  return (
    <AppShell>
      <PageHero
        icon={Compass}
        badge={`${filteredTours.length} packages available`}
        title={`Tours in ${destQuery}`}
        subtitle="Guided experiences from local operators and global partners. All-inclusive packages with transparent BDT pricing."
        backgroundImage={travelImages.tours}
        compact
      >
        <Link href="/" className="btn-outline !border-white/30 !text-white hover:!bg-white/10 !text-xs">
          Modify Search
        </Link>
      </PageHero>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <StaggerGrid className="grid gap-6 sm:grid-cols-2">
          {filteredTours.map((tour) => (
            <StaggerItem key={tour.id}>
              <Card className="card-interactive flex h-full flex-col overflow-hidden">
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 to-transparent" />
                  <Badge variant="gold" className="absolute top-4 right-4">{tour.source}</Badge>
                  <div className="absolute bottom-4 left-4 flex gap-3 text-xs font-bold text-white">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-brand-gold" />{tour.duration}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-brand-gold" />{tour.destination}</span>
                  </div>
                </div>
                <CardContent className="flex flex-1 flex-col gap-2">
                  <h3 className="font-display text-lg font-extrabold text-brand-navy">{tour.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{tour.highlight}</p>
                </CardContent>
                <CardFooter className="justify-between bg-slate-50/50">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">From</span>
                    <p className="font-display text-xl font-extrabold text-brand-navy">{formatCurrency(tour.price)}</p>
                  </div>
                  <Link href={`/tours/${tour.id}`} className="btn-primary !text-xs">
                    Details <ChevronRight className="h-4 w-4" />
                  </Link>
                </CardFooter>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGrid>

        {filteredTours.length === 0 && (
          <div className="py-16 text-center">
            <Compass className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-slate-500">No tours found for this destination.</p>
            <Link href="/" className="btn-primary mt-4 inline-flex">Search again <ArrowRight className="h-4 w-4" /></Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
