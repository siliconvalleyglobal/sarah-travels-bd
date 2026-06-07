"use client";

import Link from "next/link";
import { Moon, Calendar, ArrowRight, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PageHero } from "@/components/PageHero";
import { StaggerGrid, StaggerItem } from "@/components/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { travelImages } from "@/lib/travelImages";

export interface UmrahPackageCard {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration: number;
  price: number;
  inclusions: unknown;
}

export function UmrahCatalog({ packages }: { packages: UmrahPackageCard[] }) {
  return (
    <>
      <PageHero
        icon={Moon}
        badge="Flexible Installments"
        title="Umrah & Hajj Packages"
        subtitle="Complete packages with flights, hotels, ground transport, and flexible installment plans. 30% down-payment to confirm."
        backgroundImage={travelImages.umrah}
      />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {packages.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-slate-500">No Umrah packages available yet.</p>
            <p className="mt-2 text-sm text-slate-400">Packages will appear once added from the admin panel.</p>
          </Card>
        ) : (
          <StaggerGrid className="flex flex-col gap-5">
            {packages.map((pkg, i) => {
              const inclusions = Array.isArray(pkg.inclusions) ? (pkg.inclusions as string[]) : [];
              return (
                <StaggerItem key={pkg.id}>
                  <Card className="card-interactive overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                      <div
                        className="relative flex min-h-[180px] items-end bg-cover bg-center px-6 py-6 lg:w-56 lg:shrink-0"
                        style={{ backgroundImage: `url('${travelImages.makkah}')` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/60 to-transparent" />
                        <div className="relative text-white">
                          <Moon className="h-8 w-8 text-brand-gold" />
                          <p className="mt-2 font-display text-2xl font-extrabold">{pkg.duration}</p>
                          <p className="text-xs text-white/70">Days</p>
                        </div>
                        {i === 0 && (
                          <Badge variant="gold" className="absolute top-4 right-4">Popular</Badge>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <CardContent className="flex-1">
                          <h3 className="font-display text-xl font-extrabold text-brand-navy">{pkg.title}</h3>
                          {pkg.description && (
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">{pkg.description}</p>
                          )}
                          {inclusions.length > 0 && (
                            <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
                              {inclusions.slice(0, 4).map((inc, j) => (
                                <li key={j} className="flex items-center gap-1.5 text-xs text-slate-600">
                                  <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                  {inc}
                                </li>
                              ))}
                            </ul>
                          )}
                          <div className="mt-4 flex gap-2">
                            <Badge variant="navy"><Calendar className="mr-1 inline h-3 w-3" />{pkg.duration} days</Badge>
                            <Badge variant="success">Installments</Badge>
                          </div>
                        </CardContent>
                        <CardFooter className="justify-between bg-slate-50/80">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400">Package from</span>
                            <p className="font-display text-2xl font-extrabold text-brand-navy">
                              {formatCurrency(Number(pkg.price))}
                            </p>
                          </div>
                          <Link href={`/umrah/${pkg.slug}`} className="btn-primary !text-xs">
                            View Package <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </CardFooter>
                      </div>
                    </div>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        )}
      </div>
    </>
  );
}
