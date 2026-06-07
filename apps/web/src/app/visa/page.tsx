import { api } from "@/lib/api";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { GsapRoot } from "@/components/marketing/GsapRoot";
import { VisaCatalog, type VisaCountryCard } from "@/components/VisaCatalog";

export default async function VisaPage() {
  let countries: VisaCountryCard[] = [];
  try {
    countries = await api<VisaCountryCard[]>("/visa/countries");
  } catch {
    // API may not be running yet
  }

  return (
    <GsapRoot className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <VisaCatalog countries={countries} />
      <SiteFooter />
    </GsapRoot>
  );
}
