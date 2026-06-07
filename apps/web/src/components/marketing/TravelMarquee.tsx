"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { marquee } from "@/lib/i18n/translations";
import { pick } from "@/lib/i18n/types";

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
  const { lang } = useLanguage();

  return (
    <section className="st-reveal border-b border-slate-200 bg-slate-50 py-12 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <h2 className="font-display text-2xl font-extrabold text-brand-navy sm:text-3xl">
          {pick(lang, marquee.titleLead)}
          <span className="gradient-text">{pick(lang, marquee.titleHighlight)}</span>
        </h2>
        <p className="mt-2 text-sm text-slate-500">{pick(lang, marquee.subtitle)}</p>
      </div>
      <div className="mt-8 space-y-2">
        <MarqueeRow items={marquee.rowA[lang]} />
        <MarqueeRow items={marquee.rowB[lang]} reverse />
      </div>
    </section>
  );
}
