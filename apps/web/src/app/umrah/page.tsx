import { api } from "@/lib/api";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { GsapRoot } from "@/components/marketing/GsapRoot";
import { UmrahCatalog, type UmrahPackageCard } from "@/components/UmrahCatalog";

export default async function UmrahPage() {
  let packages: UmrahPackageCard[] = [];
  try {
    packages = await api<UmrahPackageCard[]>("/umrah/packages");
  } catch {
    // API may not be running yet
  }

  return (
    <GsapRoot className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <UmrahCatalog packages={packages} />
      <SiteFooter />
    </GsapRoot>
  );
}
